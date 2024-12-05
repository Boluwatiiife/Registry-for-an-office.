import { Router, Request, Response, NextFunction } from "express";

const router = Router();

const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    // if the user is not logged in
    res.redirect("/auth/login");
  } else {
    // if logged in
    next();
  }
};

router.get("/", authCheck, (req: Request, res: Response) => {
  res.render("profile", { user: req.user });
});

export default router;
