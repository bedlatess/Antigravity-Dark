"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { formatBytes } from "@/utils/unitHelper";
import { formatUptime } from "./Node";
import { cn } from "@/lib/utils";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "../types/LiveData";
import Flag from "./Flag";

interface NodeTableProps {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
}

const NodeTable: React.FC<NodeTableProps> = ({ nodes, liveData }) => {
  const { t } = useTranslation();
  const onlineNodes = liveData?.online || [];

  // 统一表头样式：正体、加粗、增加间距
  const thClass = "px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5";

  return (
    <div className="w-full overflow-x-auto rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.01]">
            <th className={thClass}>Unit_Identification</th>
            <th className={thClass}>System_OS</th>
            <th className={thClass}>Link_Status</th>
            <th className={thClass}>CPU_Load</th>
            <th className={thClass}>RAM_Matrix</th>
            <th className={thClass}>Storage</th>
            <th className={thClass}>Network_Flux</th>
            <th className={thClass + " text-right"}>Accumulated_Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.02]">
          {nodes.map((node) => {
            const isOnline = onlineNodes.includes(node.uuid);
            const live = liveData.data?.[node.uuid];
            const memUsage = node.mem_total ? Math.round(((live?.ram?.used || 0) / node.mem_total) * 100) : 0;
            const diskUsage = node.disk_total ? Math.round(((live?.disk?.used || 0) / node.disk_total) * 100) : 0;

            return (
              <tr key={node.uuid} className="group hover:bg-purple-500/[0.02] transition-colors duration-500">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    {/* 修正 Flag 传递方式：优先使用 emoji 或 flag 属性 */}
                    <div className="size-5 flex items-center justify-center grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                       <Flag flag={node.region} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black tracking-tighter text-white/80 group-hover:text-purple-400 transition-colors uppercase leading-none">
                        {node.name}
                      </span>
                      <span className="text-[9px] font-mono font-bold opacity-20 uppercase tracking-widest leading-none">
                        UP_{formatUptime(live?.uptime || 0, t)}
                      </span>
                    </div>
                  </div>
                </td>
                {/* 优化点：移除斜体，使用正体加粗 */}
                <td className="px-6 py-6">
                  <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{node.os}</span>
                </td>
                <td className="px-6 py-6">
                   <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase", 
                     isOnline ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                     <div className={cn("size-1.5 rounded-full shadow-[0_0_8px_currentColor]", isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                     {isOnline ? "Active" : "Lost"}
                   </div>
                </td>
                <td className="px-6 py-6 font-mono text-xs font-black text-white/60">{live?.cpu?.usage || 0}%</td>
                <td className="px-6 py-6 font-mono text-xs font-black text-white/60">{memUsage}%</td>
                <td className="px-6 py-6 font-mono text-xs font-black text-white/60">{diskUsage}%</td>
                <td className="px-6 py-6">
                  <div className="flex flex-col text-[10px] font-mono font-bold leading-none gap-2">
                    {/* 优化点：移除网络速度的斜体 */}
                    <span className="text-emerald-400/60 tracking-tighter">UP {formatBytes(live?.network?.up || 0)}/s</span>
                    <span className="text-blue-400/60 tracking-tighter">DN {formatBytes(live?.network?.down || 0)}/s</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-right font-mono text-xs font-black text-purple-400/60">
                  {formatBytes((live?.network?.totalUp || 0) + (live?.network?.totalDown || 0))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NodeTable;