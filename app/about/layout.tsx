import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Pomodoro Technique | PomoTime",
  description: "Learn about the Pomodoro Technique, a time management method that uses timed intervals of work and breaks to improve productivity and focus.",
  keywords: "pomodoro technique, time management, productivity method, focused work, work intervals, pomodoro history, francesco cirillo",
  openGraph: {
    title: "About the Pomodoro Technique | PomoTime",
    description: "Learn about the Pomodoro Technique, a time management method that uses timed intervals of work and breaks to improve productivity and focus.",
    url: "https://pomotime.io/about",
    type: "article",
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 