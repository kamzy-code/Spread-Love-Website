import RatingTemplates from "@/components/(admin)/recordings/ratingTemplate/ratingTemplates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rating Templates",
};

export default function RatingTemplatePage() {
  return <RatingTemplates></RatingTemplates>;
}
