import passport from "passport";
import {
  Profile,
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import User from "../models/user";
import { Document } from "mongoose";
import keys from "./keys";

interface IUser extends Document {
  id: string;
  username: string;
  googleId: string;
  thumbnail: string;
}

passport.serializeUser(
  (user: Express.User, done: (err: any, id?: string) => void) => {
    done(null, user.id);
  }
);

passport.deserializeUser(
  (id: string, done: (err: any, user?: IUser | null) => void) => {
    User.findById(id).then((user) => {
      done(null, user as IUser);
    });
  }
);

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/callback",
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      // check if user already exists in the db
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser as IUser);
        } else {
          // if not, create user in the db
          new User({
            username: profile.displayName,
            googleId: profile.id,
            thumbnail: profile._json.picture,
          })
            .save()
            .then((newUser) => {
              console.log("new use created: " + newUser);
              done(null, newUser as IUser);
            });
        }
      });
    }
  )
);
