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
      
      // 核心修复：兼容 tags 是字符串或数组的情况
      const tags = (node as any).tags;
      let tagMatch = false;
      if (Array.isArray(tags)) {
        tagMatch = tags.some(tag => tag.toLowerCase().includes(term));
      } else if (typeof tags === 'string') {
        tagMatch = tags.toLowerCase().includes(term);
      }

      const regionMatch = isRegionMatch(node.region, term);
      const isOnline = liveData?.online?.includes(node.uuid) || false;
      const statusMatch = ((term === "online" || term === "在线") && isOnline) || ((term === "offline" || term === "离线") && !isOnline);
      return basicMatch || tagMatch || regionMatch || statusMatch;
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

  const triggerClass = "px-4 py-1.5 rounded-full border border-white/5 data-[state=active]:border-purple-500/50 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 text-[10px] font-bold transition-all";

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 to-cyan-500/50 rounded-xl blur opacity-20 group-focus-within:opacity-60 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
              <Input
                ref={searchRef}
                placeholder="Filter nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-12 h-12 bg-black/40 border-white/5 rounded-xl backdrop-blur-xl focus-visible:ring-purple-500/30 transition-all placeholder:text-white/10 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
            <Button
              variant="ghost" size="sm"
              className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest", viewMode === "grid" ? "bg-purple-600 text-white" : "text-white/30")}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-3.5 w-3.5 mr-2" /> Grid
            </Button>
            <Button
              variant="ghost" size="sm"
              className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest", viewMode === "table" ? "bg-purple-600 text-white" : "text-white/30")}
              onClick={() => setViewMode("table")}
            >
              <Table2 className="h-3.5 w-3.5 mr-2" /> Table
            </Button>
          </div>
        </div>

        {showGroupSelector && (
          <div className="flex items-center gap-4 py-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 text-white/20">
              <Tag size={14} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Groups:</span>
            </div>
            <Tabs value={selectedGroup} onValueChange={setSelectedGroup} className="w-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-2">
                <TabsTrigger value="all" className={triggerClass}>ALL_UNITS</TabsTrigger>
                {groups.map((group) => (
                  <TabsTrigger key={group} value={group} className={triggerClass}>{group.toUpperCase()}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      <div className="min-h-[400px] relative">
        <div className="absolute -top-6 right-0 flex items-center gap-2">
           <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">Matrix Results: {filteredNodes.length} / {nodes.length}</span>
        </div>
        {filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 anime-card opacity-30 border-dashed border-white/10">
            <Filter className="h-12 w-12 mb-4 text-white/20" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-white/40">No Signal Detected</span>
          </div>
        ) : (
          viewMode === "grid" ? (
            <NodeGrid nodes={filteredNodes} liveData={liveData} />
          ) : (
            <Suspense fallback={<div className="p-24 text-center"><div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" /></div>}>
              <NodeTable nodes={filteredNodes} liveData={liveData} />
            </Suspense>
          )
        )}
      </div>
    </div>
  );
};

export default NodeDisplay;