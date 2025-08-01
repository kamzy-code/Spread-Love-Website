import { Types } from "mongoose";
import { Admin } from "../models/adminModel";
import { adminRole } from "../types/genralTypes";
import { HttpError } from "../utils/httpError";

class AuthService {

//  Create a new admin and store to DB 
  async createAdmin(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    hashedPassword: string,
    role: adminRole
  ) {
    return await Admin.create({ firstName, lastName, email, phone, password: hashedPassword, role });
  }

// Check if an admin exists in the database by email
  async getAdminByEmail(email: string) {
   return await Admin.findOne({ email });
  }

  async getAdminByID(id: string) {
    return await Admin.findOne({ _id: new Types.ObjectId(id) }).select("-password -__v -createdAt -updatedAt");
  }
}

const authService = new AuthService();
export default authService;
