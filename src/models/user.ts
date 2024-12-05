import mongoose, { Schema, Document, Model, Types } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  _id: Types.ObjectId;
  id: string;
  username: string;
  googleId: string;
  thumbnail: string;
  name: string;
  email: string;
  password: string | undefined;
  photo: string;
  confirmPassword: string | undefined;
  role?: "user" | "admin";
  active?: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpire?: Date;
  comparePasswowrdInDB?: (
    password: string,
    passwordDB: string
  ) => Promise<boolean>;
  isPasswordChanged?: (JWTTimeStamp: number) => Promise<boolean>;
  createResetPasswordToken?: () => string;
}

// Schema for the User model
const userSchema: Schema<IUser> = new Schema({
  username: { type: String, required: false },
  googleId: { type: String, required: false },
  thumbnail: { type: String, required: false },
  name: { type: String, required: true },
  email: {
    type: String,
    required: function () {
      return !this.googleId; // email required for non-google users
    },
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  photo: { type: String, required: false },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false, // exclude password when fetching users
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm Password is required"],
    validate: {
      validator: function (this: IUser, val: string): boolean {
        return val === this.password;
      },
      message: "Password and Confirm password do not match!",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpire: { type: Date },
});

// Pre-save middleware to hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password as string, 12);
  this.confirmPassword = undefined;
  next();
});

// pre-query middleware to exclude inactive users
userSchema.pre(/^find/, function (this: mongoose.Query<any, IUser>, next) {
  this.find({ active: { $ne: false } });
  next();
});

// Method to compare passwords
userSchema.methods.comparePasswowrdInDB = async function (
  userPassword: string,
  userPasswordDB: string
): Promise<boolean> {
  return bcrypt.compare(userPassword, userPasswordDB);
};

// Method to checkif the password has changed after the JWT was issued
userSchema.methods.isPasswordChanged = async function (
  JWTTimeStamp: number
): Promise<boolean> {
  if (this.passwordChangedAt) {
    const passwordChangedTimesatamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimeStamp < passwordChangedTimesatamp;
  }
  return false;
};

// Method to create a password reset token
userSchema.methods.createResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Model
const User: Model<IUser> = mongoose.model<IUser>("user", userSchema);

export default User;
