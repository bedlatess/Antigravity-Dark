"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Activity, Server, Zap, Clock } from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useNodeList } from "@/contexts/NodeListContext";

// --- 极简汇总统计卡片组件 ---
const StatCard = ({ label, value, subValue, color, icon: Icon }: any) => (
  <div className="anime-card p-4 flex flex-col justify-between min-h-[110px] group/stat relative overflow-hidden">
    <div className="flex justify-between items-start relative z-10">
      <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">{label}</span>
      <div className="p-1.5 rounded-lg bg-white/5 opacity-50 group-hover/stat:opacity-100 transition-opacity">
        <Icon size={14} style={{ color }} />
      </div>
    </div>
    <div className="mt-2 relative z-10">
      <div className="text-3xl font-black tracking-tighter" style={{ color }}>
        {value}
        {subValue !== undefined && <span className="text-sm opacity-40 ml-1 font-medium">/ {subValue}</span>}
      </div>
    </div>
    {/* 背景装饰大图标 */}
    <Icon className="absolute -right-2 -bottom-2 opacity-[0.03] rotate-12" size={80} />
  </div>
);

export function Callouts() {
  const { t } = useTranslation();
  // 修正：从 useLiveData 获取数据路径
  const { showCallout, live_data } = useLiveData();
  // 修正：从 useNodeList 获取属性名为 nodeList
  const { nodeList } = useNodeList();
  const [mounted, setMounted] = useState(false);
  const [ishttps, setIsHttps] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsHttps(window.location.protocol === "https:");
    }
  }, []);

  if (!mounted) return null;

  // --- 数据安全提取 ---
  const onlineNodes = live_data?.data?.online || [];
  const actualData = live_data?.data?.data || {};
  
  // 确保使用 nodeList
  const totalNodes = nodeList?.length || 0;
  const onlineCount = onlineNodes.length;
  
  const nodeValues = Object.values(actualData);
  
  // 计算平均 CPU 使用率
  const avgCpu = nodeValues.length 
    ? (nodeValues.reduce((acc: number, curr: any) => acc + (curr.cpu?.usage || 0), 0) / nodeValues.length).toFixed(0)
    : 0;

  // 计算高负载节点（CPU > 80%）
  const highLoadCount = nodeValues.filter((n: any) => (n.cpu?.usage || 0) > 80).length;

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* 顶部警告区域 */}
      {(!ishttps || !showCallout) && (
        <div className="flex flex-col gap-2">
          {!ishttps && (
            <div className="anime-card border-rose-500/50 bg-rose-500/10 p-3 flex items-center gap-3 text-rose-400 text-xs font-bold">
              <AlertTriangle size={16} />
              <span>{t("warn_https")}: {t("warn_https_desc")}</span>
            </div>
          )}
          {!showCallout && (
            <div className="anime-card border-amber-500/50 bg-amber-500/10 p-3 flex items-center gap-3 text-amber-400 text-xs font-bold">
              <AlertTriangle size={16} />
              <span>{t("warn_websocket")}: {t("warn_websocket_desc")}</span>
            </div>
          )}
        </div>
      )}

      {/* 核心统计大屏 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Nodes Online" 
          value={onlineCount} 
          subValue={totalNodes} 
          color="#34d399" 
          icon={Server} 
        />
        <StatCard 
          label="High Load" 
          value={highLoadCount} 
          color={highLoadCount > 0 ? "#f43f5e" : "#64748b"} 
          icon={Activity} 
        />
        <StatCard 
          label="Nodes Offline" 
          value={Math.max(0, totalNodes - onlineCount)} 
          color={(totalNodes - onlineCount) > 0 ? "#fb7185" : "#64748b"} 
          icon={Zap} 
        />
        <StatCard 
          label="Average CPU" 
          value={`${avgCpu}%`} 
          color="#a855f7" 
          icon={Clock} 
        />
      </div>
    </div>
  );
}