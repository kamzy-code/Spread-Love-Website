import { Admin } from "../models/adminModel";
import { adminRole } from "../types/authType";

class AuthService {

//  Create a new admin and store to DB 
  async createAdmin(
    email: string,
    firstName: string,
    lastName: string,
    hashedPassword: string,
    role: adminRole
  ) {
    return await Admin.create({ email, firstName, lastName, password: hashedPassword, role });
  }

// Check if an admin exists in the database by email
  async getAdmin(email: string) {
   return await Admin.findOne({ email });
  }
}

const authService = new AuthService();
export default authService;
