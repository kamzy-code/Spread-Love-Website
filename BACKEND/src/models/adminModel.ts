import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "superadmin" | "callrep" | "salesrep";
  status: "active" | "inactive" | "blocked"
}

const adminSchema: Schema = new Schema<IAdmin>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {type: String, required: true},
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "callrep", "salesrep"],
      default: "callrep",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
