"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Search, Grid3X3, Table2, X, Filter, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNodeViewMode } from "@/hooks/useNodeViewMode";
import type { NodeBasicInfo } from "@/contexts/NodeListContext";
import type { LiveData } from "../types/LiveData";
import { NodeGrid } from "./Node";
const NodeTable = React.lazy(() => import("./NodeTable"));
import { isRegionMatch } from "@/utils/regionHelper";
import "./NodeDisplay.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface NodeDisplayProps {
  nodes: NodeBasicInfo[];
  liveData: LiveData;
}

const NodeDisplay: React.FC<NodeDisplayProps> = ({ nodes, liveData }) => {
  const [t] = useTranslation();
  const [viewMode, setViewMode] = useNodeViewMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useLocalStorage<string>("nodeSelectedGroup", "all");
  const searchRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => {
    const groupSet = new Set<string>();
    nodes.forEach((node) => { if (node.group?.trim()) groupSet.add(node.group); });
    return Array.from(groupSet).sort();
  }, [nodes]);

  const showGroupSelector = groups.length >= 1;

  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (selectedGroup !== "all") {
      result = result.filter((node) => node.group === selectedGroup);
    }
    if (!searchTerm.trim()) return result;
    const term = searchTerm.toLowerCase().trim();
    return result.filter((node) => {
      const basicMatch = node.name.toLowerCase().includes(term) || node.os.toLowerCase().includes(term);
      const tags = (node as any).tags;
      const region = node.region?.toLowerCase() || "";
      let tagMatch = region.includes(term);
      if (Array.isArray(tags)) {
        tagMatch = tagMatch || tags.some(tag => tag.toLowerCase().includes(term));
      } else if (typeof tags === 'string') {
        tagMatch = tagMatch || tags.toLowerCase().includes(term);
      }
      const regionHelperMatch = isRegionMatch(node.region, term);
      const isOnline = liveData?.online?.includes(node.uuid) || false;
      const statusMatch = ((term === "online" || term === "在线") && isOnline) || ((term === "offline" || term === "离线") && !isOnline);
      return basicMatch || tagMatch || regionHelperMatch || statusMatch;
    });
  }, [nodes, searchTerm, liveData, selectedGroup]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 样式定义：移除所有 italic，统一 font-black/bold
  const inputClass = "pl-12 pr-12 h-12 bg-black/40 border-white/5 rounded-2xl backdrop-blur-3xl focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all placeholder:text-white/10 text-sm font-bold tracking-tight shadow-inner";
  const triggerClass = "px-6 py-2.5 rounded-xl border border-white/5 data-[state=active]:border-purple-500/50 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/5";
  const viewBtnBase = "h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500";

  return (
    <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* 搜索框 - 强化霓虹边框 */}
          <div className="relative w-full lg:max-w-xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-purple-400 transition-colors duration-500" />
              <Input
                ref={searchRef}
                placeholder="SCANNING_MATRIX_NODES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={inputClass}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-rose-500 transition-colors">
                  <X size={18} />
                </button>
              )}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                 <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black text-white/20 tracking-tighter uppercase group-focus-within:hidden transition-all">Press / to scan</kbd>
              </div>
            </div>
          </div>

          {/* 视图切换 - 统一圆角和质感 */}
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl">
            <Button
              variant="ghost" size="sm"
              className={cn(viewBtnBase, viewMode === "grid" ? "bg-purple-600/90 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)]" : "text-white/20 hover:text-white/60 hover:bg-white/5")}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4 mr-2" /> Grid_View
            </Button>
            <Button
              variant="ghost" size="sm"
              className={cn(viewBtnBase, viewMode === "table" ? "bg-purple-600/90 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)]" : "text-white/20 hover:text-white/60 hover:bg-white/5")}
              onClick={() => setViewMode("table")}
            >
              <Table2 className="h-4 w-4 mr-2" /> Table_List
            </Button>
          </div>
        </div>

        {/* 分组筛选 - 极简排版 */}
        {showGroupSelector && (
          <div className="flex items-center gap-8 py-2 overflow-x-auto scrollbar-none border-b border-white/[0.02] pb-6">
            <div className="flex items-center gap-3 text-purple-500/40 shrink-0">
              <Tag size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">Matrix_Domain</span>
            </div>
            <Tabs value={selectedGroup} onValueChange={setSelectedGroup} className="w-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-4">
                <TabsTrigger value="all" className={triggerClass}>[ All_Units ]</TabsTrigger>
                {groups.map((group) => (
                  <TabsTrigger key={group} value={group} className={triggerClass}>{group.toUpperCase()}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* 列表区 */}
      <div className="min-h-[500px] relative">
        <div className="absolute -top-10 right-0 flex items-center gap-4 px-5 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl">
           <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
           <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase leading-none">
              Result: {filteredNodes.length} <span className="text-white/10 mx-1">/</span> {nodes.length} Synchronized
           </span>
        </div>
        
        {filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-52 bg-black/20 rounded-[3rem] border border-dashed border-white/5 backdrop-blur-sm">
            <div className="relative mb-8">
               <Filter className="h-20 w-20 text-white/5" />
               <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[1em] text-white/20 ml-[1em]">Signal_Lost::Null_Set</span>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-1000">
            {viewMode === "grid" ? (
              <NodeGrid nodes={filteredNodes} liveData={liveData} />
            ) : (
              <Suspense fallback={
                <div className="py-60 text-center flex flex-col items-center">
                  <div className="size-12 border-2 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-6" />
                  <div className="text-[10px] font-black uppercase tracking-[0.8em] text-white/10">Loading_Matrix_Table</div>
                </div>
              }>
                <NodeTable nodes={filteredNodes} liveData={liveData} />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDisplay;