"use client";

import React from "react";
import { motion } from "framer-motion";
import { Callouts } from "@/components/DashboardCallouts";
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
          className="flex flex-col gap-2"
        >
          {/* 顶部的统计大屏卡片 */}
          <Callouts />
          
          {/* 下方的服务器节点网格 */}
          <DashboardContent />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}