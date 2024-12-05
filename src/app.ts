import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profile-route";
// import passportSetup from './config/passport-setup'
import keys from "./config/keys";
import cookieSession from "cookie-session";
import expressSession from "express-session";
import passport from "passport";
import globalErrorHandler from "./Controllers/errorController";

require("./config/passport-setup");
// Initialize Express application
const app = express();

app.use(express.json());

app.set("view engine", "ejs");

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  expressSession({
    secret: keys.session.cookieKey,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// set up routes
app.use("/api/v1/auth/", authRoutes);
app.use("/profile", profileRoutes);

app.use(globalErrorHandler);

export default app;
