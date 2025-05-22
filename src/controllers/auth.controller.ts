import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters")
    .test(
      "at-least-one-uppercase-letter",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test(
      "at-least-one-number",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
      }
    ),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Passwords do not match"),
});

export default {
  async register(req: Request, res: Response) {
    /**
     #swagger.tags = ['Auth']
     */
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      res.status(200).json({
        message: "Success registration!",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  async login(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Auth']
      #swagger.requestBody = {
      required: true,
      schema: {$ref: "#/components/schemas/LoginRequest"}
      }
    */
    const { identifier, password } = req.body as unknown as TLogin;
    try {
      // ambil data user berdasarakn "identifies" -> email dan username

      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });

      if (!userByIdentifier) {
        return res.status(403).json({
          message: "user not found",
          data: null,
        });
      }

      // validasi password
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return res.status(403).json({
          message: "user not found",
          data: null,
        });
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      res.status(200).json({
        message: "Login success",
        data: token,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  async me(req: IReqUser, res: Response) {
    /* 
    #swagger.tags = ['Auth']
    #swagger.security = [{ "bearerAuth": [] }] */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      res.status(200).json({
        message: "Success get user profile",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  async activation(req: Request, res: Response) {
    /* 
      #swagger.tags = ['Auth']
      #swagger.description = 'Endpoint untuk aktivasi akun'
      #swagger.parameters['code'] = {
        in: 'query',
        description: 'Kode aktivasi',
        required: true,
        type: 'string'
      }
    */
    try {
      const code = req.query.code || req.body.code;

      if (!code) {
        return res.status(400).json({
          message: "Activation code is required",
          data: null,
        });
      }

      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );

      if (!user) {
        return res.status(404).json({
          message: "Invalid activation code",
          data: null,
        });
      }

      // Redirect ke halaman frontend dengan status sukses
      const frontendUrl = process.env.CLIENT_HOST || "http://localhost:3001";
      res.redirect(
        `${frontendUrl}/auth/activation-success?status=success&email=${user.email}`
      );
    } catch (error) {
      const err = error as unknown as Error;
      // Redirect ke halaman frontend dengan status error
      const frontendUrl = process.env.CLIENT_HOST || "http://localhost:3001";
      res.redirect(
        `${frontendUrl}/auth/activation-error?status=error&message=${err.message}`
      );
    }
  },
};
