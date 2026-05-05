"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Terminal, ShieldCheck, Menu, Server } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";
import LanguageSwitcher from "./Language";

export const NavBar = () => {
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-40 w-full bg-black/10 backdrop-blur-md border-b border-white/5 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 左侧：Logo 与 标题 */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-500">
            <Server className="text-white" size={18} />
          </div>
          <span className="font-black text-xl tracking-tighter italic uppercase text-white/90">
            Antigravity<span className="text-purple-500">.</span>
          </span>
        </Link>

        {/* 中间：极简菜单 (仅在大屏显示) */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
          <Link href="/" className="hover:text-purple-400 transition-all flex items-center gap-2">
            <LayoutDashboard size={14} /> {t("common.dashboard")}
          </Link>
          <Link href="/admin" className="hover:text-purple-400 transition-all flex items-center gap-2">
            <ShieldCheck size={14} /> Admin
          </Link>
          <Link href="/terminal" className="hover:text-purple-400 transition-all flex items-center gap-2">
            <Terminal size={14} /> Terminal
          </Link>
        </div>

        {/* 右侧：功能切换 */}
        <div className="flex items-center gap-2">
          <div className="scale-90 opacity-70 hover:opacity-100 transition-opacity">
            <LanguageSwitcher />
          </div>
          <div className="scale-90 opacity-70 hover:opacity-100 transition-opacity">
            <DarkModeToggle />
          </div>
          <button className="md:hidden p-2 text-white/50 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;