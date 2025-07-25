import ProfileComponent from "@/components/(admin)/profile/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Profile() {
  return (
    <ProfileComponent />
  );
}
