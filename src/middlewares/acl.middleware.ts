import { Response, NextFunction } from "express";
import { IReqUser } from "./auth.middleware";

export default (roles: string[]) => {
  return (req: IReqUser, res: Response, next: NextFunction) => {
    // Jika belum login, kembalikan Unauthorized
    if (!req.user) {
      return res.status(401).json({
        data: null,
        message: "Unauthorized",
      });
    }

    const role = req.user.role;
    // Jika role tidak sesuai, kembalikan Forbidden
    if (!roles.includes(role)) {
      return res.status(403).json({
        data: null,
        message: "Forbidden",
      });
    }
    next();
  };
};
