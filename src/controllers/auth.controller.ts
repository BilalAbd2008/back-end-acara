import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

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

      response.success(res, result, 'success registration!');
    } catch (error) {
      response.error(res, error, "failed registration");
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
        return response.unauthorized(res, "user not found");
      }

      // validasi password
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return response.unauthorized(res, "user not found");
      }

      const token = generateToken({
        id: userByIdentifier._id, // tanpa .toString() agar sesuai dengan interface
        role: userByIdentifier.role,
        activationCode: userByIdentifier.activationCode || "",
      });

      response.success(res, token, "login success");
    } catch (error) {
      response.error(res, error, "login failed");
    }
  },
  async me(req: IReqUser, res: Response) {
    /* 
    #swagger.tags = ['Auth']
    #swagger.security = [{ "bearerAuth": [] }] */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
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

      // Kembalikan response JSON untuk diproses di frontend
     response.success(res, user, "user succesfully activated");
    } catch (error) {
      response.error(res, error, "user failed activated");
    }
  },
};
