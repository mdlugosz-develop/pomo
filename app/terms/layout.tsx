import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PomoTime",
  description: "PomoTime Terms of Service. Read about the terms and conditions for using our Pomodoro timer and task management application.",
  keywords: "terms of service, legal terms, user agreement, conditions of use",
  openGraph: {
    title: "Terms of Service | PomoTime",
    description: "PomoTime Terms of Service and user agreement",
  }
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 