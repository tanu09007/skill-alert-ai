import type { Metadata } from "next";
import "./globals.css";
import SidebarWrapper from "@/components/SidebarWrapper";

export const metadata: Metadata = {
  title: "Nexes AI — AI Mentor Platform",
  description: "Personalized AI-powered career roadmaps and skill development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
