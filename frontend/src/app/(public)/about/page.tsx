import { Metadata } from "next";
import AboutCombined from "./about";

export const metadata: Metadata = {
  title: "About",
};

export default function About() {
  return (
    <AboutCombined></AboutCombined>
  );
}
