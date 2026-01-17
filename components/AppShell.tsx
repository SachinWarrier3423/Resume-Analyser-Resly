"use client";

import { motion } from "framer-motion";
import TopNav from "./TopNav";
import PageContainer from "./PageContainer";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {showNav && <TopNav />}
      <PageContainer>{children}</PageContainer>
    </div>
  );
}

