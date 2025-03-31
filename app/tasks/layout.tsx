import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks Management | PomoTime",
  description: "Manage your tasks efficiently with PomoTime. Create, organize, and track your tasks using the Pomodoro technique for maximum productivity.",
  keywords: "task management, pomodoro tasks, productivity tasks, organize tasks",
  openGraph: {
    title: "Tasks Management | PomoTime",
    description: "Manage your tasks efficiently with PomoTime",
  }
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 