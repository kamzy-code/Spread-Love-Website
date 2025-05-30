import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "superadmin" | "callrep" | "salesrep";
}

const adminSchema: Schema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "callrep", "salesrep"],
      default: "callrep",
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
