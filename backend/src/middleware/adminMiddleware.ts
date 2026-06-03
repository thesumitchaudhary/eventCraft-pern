import jwt from "jsonwebtoken";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role != "admin") {
    res.status(403).json({ message: "Forbidian admin access only" });
  }
  next();
};

export default adminMiddleware;