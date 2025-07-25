import Reprsentatives from "@/components/(admin)/reps/reps";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reps",
};

export default function Reps() {
  return (
   <Reprsentatives></Reprsentatives>
  );
}
