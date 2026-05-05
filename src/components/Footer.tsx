"use client";

import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-10 w-full border-t border-white/5 bg-black/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex flex-col gap-3 items-center justify-center">
        {/* 装饰性版本号 */}
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">
            Telemetry Protocol v1.1.8
          </span>
        </div>
        
        {/* 版权与致敬 */}
        <p className="text-[11px] text-white/30 font-medium tracking-tight">
          &copy; {currentYear} <span className="text-purple-500/50 font-bold uppercase">bedlatess</span>. 
          All rights reserved.
        </p>
        
        <div className="text-[10px] text-white/10 uppercase tracking-widest">
          Powered by <a href="https://github.com/komari-monitor/komari" className="text-white/20 hover:text-purple-500/50 underline underline-offset-4 transition-colors">Komari Monitor</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;