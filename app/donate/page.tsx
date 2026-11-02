import type { Metadata } from "next";
import HomePage from "../_components/site-app";

export const metadata: Metadata = {
  title: "Support Flip Stories",
  description: "Support Flip Stories with a Litecoin donation sent directly to the creator's wallet."
};

export default function DonatePage() {
  return <HomePage initialView="Donate" />;
}
