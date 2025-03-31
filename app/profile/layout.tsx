import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile | PomoTime",
  description: "Manage your PomoTime profile settings and preferences. View your productivity statistics and customize your Pomodoro experience.",
  keywords: "pomodoro profile, user settings, productivity statistics, user preferences",
  openGraph: {
    title: "User Profile | PomoTime",
    description: "Manage your PomoTime profile settings and preferences",
  }
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 