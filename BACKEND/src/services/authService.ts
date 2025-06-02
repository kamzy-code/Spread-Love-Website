import { Admin } from "../models/adminModel";
import { adminRole } from "../types/genralTypes";

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
  async getAdmin(email: string) {
   return await Admin.findOne({ email });
  }
}

const authService = new AuthService();
export default authService;
