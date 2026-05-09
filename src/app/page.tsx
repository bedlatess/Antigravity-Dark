"use client";

import React from "react";
import { motion } from "framer-motion";
// 删除了 Callouts 引用
import DashboardContent from "@/components/DashboardContent";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-10" // 增加了间距感
        >
          {/* 只保留 DashboardContent，它内部已经包含了统计卡片、地图和节点列表 */}
          <DashboardContent />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}