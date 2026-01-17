"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, Settings } from "lucide-react";

export default function TopNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-50 glass border-b border-neutral-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-5 h-5 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
            </motion.div>
            <span className="text-lg font-medium text-neutral-900 tracking-tight">
              Resly
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink href="/analyze" icon={FileText} label="Analyze" pathname={pathname} />
            <NavLink href="/history" icon={History} label="History" pathname={pathname} />
            <NavLink href="/settings" icon={Settings} label="Settings" pathname={pathname} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  pathname: string;
}

function NavLink({ href, icon: Icon, label, pathname }: NavLinkProps) {
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-light transition-colors ${
          isActive
            ? "text-neutral-900 bg-neutral-100/50"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50"
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}

