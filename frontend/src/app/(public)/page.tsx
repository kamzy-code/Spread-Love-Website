import HomeMerged from "@/components/home/homeMerged";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return <HomeMerged></HomeMerged>;
}
