import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PomoTime",
  description: "PomoTime Privacy Policy. Learn how we protect your data and privacy when using our Pomodoro timer and task management application.",
  keywords: "privacy policy, data protection, user privacy, information security",
  openGraph: {
    title: "Privacy Policy | PomoTime",
    description: "PomoTime Privacy Policy and data protection information",
  }
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 