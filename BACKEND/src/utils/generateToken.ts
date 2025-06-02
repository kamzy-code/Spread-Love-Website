import  jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: "10d",
    });

}