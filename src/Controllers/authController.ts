import User, { IUser } from "../models/user";
import asyncErrorHandler from "../Utils/asyncErrorHandler";
import jwt, { VerifyCallback } from "jsonwebtoken";
import CustomError from "../Utils/CustomError";
import util from "util";
import { promisify } from "util";
import sendEmail from "../Utils/email";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

interface UserType {
  _id: string;
  email: string;
  password: string | undefined;
  role: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpire?: Date;
  comparePasswordInDB: (
    password: string,
    passwordDB: string
  ) => Promise<boolean>;
  isPasswordChanged: (iat: number) => Promise<boolean>;
  createResetPasswordToken: () => string;
}

// Extend Request to include the user property
export interface AuthenticatedRequest extends Omit<Request, "user"> {
  user?: UserType;
}

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.SECRET_STR as string, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const createSendResponse = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  const token = signToken(user._id.toString());

  const options: { maxAge: number; httpOnly: boolean; secure?: boolean } = {
    maxAge: parseInt(process.env.LOGIN_EXPIRES as string, 10),
    httpOnly: true, // makes sure that the cookie cannot be accessed or modified in any way by the browser
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.cookie("jwt", token, options);

  user.password = undefined; // so that the password wont be returned to the user

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body); //>>>>>>>>
    const newUser = await User.create(req.body);

    createSendResponse(newUser, 201, res);
  }
);

export const login = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // check if email and password are present in req.body
    if (!email || !password) {
      const error = new CustomError(
        "please provide email and password for logging in!",
        400
      );
      return next(error);
    }

    // check if user exists in db
    const user = await User.findOne({ email }).select("+password");

    // check if user exists and password matches
    if (
      !user ||
      !user.comparePasswowrdInDB ||
      !(await user.comparePasswowrdInDB(password, user.password ?? ""))
    ) {
      const error = new CustomError("Incorrect email or password", 400);
      return next(error);
    }

    createSendResponse(user, 200, res);
  }
);

export const protect = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. read the token and check if it exists
    const testToken = req.headers.authorization;

    let token: string | undefined;
    if (testToken && testToken.startsWith("Bearer")) {
      token = testToken.split(" ")[1];
    }
    if (!token) {
      next(new CustomError("you are not logged in!", 401));
    }

    //  2. validate the token
    const secret = process.env.SECRET_STR;
    if (!secret) {
      throw new Error("secret is not defined in .env");
    }

    try {
      const decodedToken = jwt.verify(token!, secret);

      // ensure decodedToken is a JwtPayload
      if (typeof decodedToken === "string" || !("id" in decodedToken)) {
        return next(new CustomError("Invalid token!", 401));
      }

      // 3. check if  the user exists
      const user = await User.findById(decodedToken.id);

      if (!user) {
        return next(
          new CustomError("The user with the given token does not exist", 401)
        );
      }

      // 4. check if the user changed the password after the token was issued
      const iat = decodedToken.iat;
      if (iat && user.isPasswordChanged) {
        const isPasswordChanged = await user.isPasswordChanged(iat);

        if (isPasswordChanged) {
          return next(
            new CustomError(
              "the password has been changed recently, please login again",
              401
            )
          );
        }
      }
      // 5. Allow user to access the route
      req.user = user;
      next();
    } catch (error) {
      return next(new CustomError("Token verification failed!", 401));
    }
  }
);

export const restrict = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // check if req.user is defined
    if (!req.user) {
      return next(
        new CustomError("User not authenticated. please log in", 401)
      );
    }

    if (req.user.role !== role) {
      const error = new CustomError(
        "You do not have permission to perform this action",
        403
      );
      next(error);
    }
    next();
  };
};

export const forgotPassword = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //1. get user based on posted email
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
      const error = new CustomError(
        "We could not find the user with the given email",
        404
      );
      next(error);
    }
    // 2. generate a random reset token
    if (!user.createResetPasswordToken) {
      return next(new CustomError("Unable to generate reset tokenn", 500));
    }
    const resetToken = user.createResetPasswordToken();
    await user?.save({ validateBeforeSave: false });
  }
);
