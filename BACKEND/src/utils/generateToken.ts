import  jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, env.JWT_SECRET, {
        expiresIn: "10d",
    });

}