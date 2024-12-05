import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { login, signup } from "../Controllers/authController";
// import passsport from '../config/passport-setup'

const router = express.Router();

// auth login
router.get("/login", (req: Request, res: Response) => {
  res.render("login", { user: req.user });
});

// auth logout
router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  // handle with passport
  req.logout((err: any) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// auth with google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

// callback route for google to redirect to
router.get(
  "/google/callback",
  passport.authenticate("google"),
  (req: Request, res: Response) => {
    res.redirect("/profile");
  }
);

router.route("/signup").post(signup);
router.route("/login").post(login);

export default router;
