import { Request, Response, NextFunction } from "express";
import authService from "../services/authService";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { IAdmin } from "../models/adminModel";

class AuthController {
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, email, phone, password, role } = req.body;

    try {
      // check is user already exists
      const exists = await authService.getAdmin(email);
      if (exists) {
        res
          .status(400)
          .json({ message: "Admin with this email already exists" });
        return;
      }

      // hash the user's password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create a new admin
      const newAdmin = await authService.createAdmin(
        firstName,
        lastName,
        email,
        phone,
        hashedPassword,
        role
      );

      // generate a token
      const token = generateToken(newAdmin._id as string, newAdmin.role);
      res.status(201).json({ token, admin: newAdmin });
      return;
    } catch (error) {
      next(error);
      res.status(500).json({ message: "Registration failed", error });
      return;
    }
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      // check if the admin exists
      const admin = await authService.getAdmin(email);
      if (!admin) {
        res.status(404).json({ message: "Admin not found" });
        return;
      }

      // check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid password" });
      }

      // generate a token
      const token = generateToken(admin._id as string, admin.role);
      res.status(200).json({ token, admin });
      return;
    } catch (error) {
      next(error);
      res.status(500).json({ message: "Login failed", error });
      return;
    }
  }
}

const authController = new AuthController();
export default authController;
