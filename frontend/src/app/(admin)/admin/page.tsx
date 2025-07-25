import LoginForm from "@/components/(admin)/login/form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function Login() {
  return (
    <div>
      <LoginForm></LoginForm>
    </div>
  );
}
