"use client"
import React, { useState, useEffect } from 'react';
import { DollarSign, Euro, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { loadRates, convertAmount, type RateMap } from '@/lib/exchangeRates';

export const CurrencyFloat = () => {
  const [isOpen, setIsOpen] = useState(false); // 默认收起
  const [rates, setRates] = useState<RateMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatesData = async () => {
      try {
        setLoading(true);
        // 获取 USD 和 EUR 对 CNY 的汇率
        const data = await loadRates({
          displayCurrency: 'CNY',
          sourceCurrencies: ['USD', 'EUR']
        });
        setRates(data.rates);
      } catch (err) {
        console.error("Failed to fetch rates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatesData();
    const timer = setInterval(fetchRatesData, 60 * 60 * 1000); // 每小时刷新
    return () => clearInterval(timer);
  }, []);

  const getRate = (code: string) => {
    if (!rates) return "---";
    const val = convertAmount(1, code, "CNY", rates);
    return val ? val.toFixed(2) : "---";
  };

  return (
    <div className={`fixed right-0 top-1/4 z-50 transition-all duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-24px)]'}`}>
      <div className="flex items-center">
        {/* 侧边标签 */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col items-center gap-2 py-4 px-1 bg-black/60 backdrop-blur-lg border border-r-0 border-white/10 rounded-l-xl text-purple-400 shadow-2xl hover:text-purple-300 transition-colors"
        >
          {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
            Rates
          </span>
        </button>

        {/* 内容面板 */}
        <div className="anime-card p-5 rounded-none rounded-bl-xl border-r-0 w-52 shadow-2xl flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Market Stats</div>
            {loading && <Loader2 size={12} className="animate-spin opacity-50" />}
          </div>
          
          {/* USD */}
          <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded text-blue-400 group-hover:scale-110 transition-transform">
                  <DollarSign size={14}/>
                </div>
                <span className="text-xs font-bold text-slate-300">USD / CNY</span>
              </div>
              <span className="text-sm font-mono font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">
                {getRate("USD")}
              </span>
            </div>
          </div>

          {/* EUR */}
          <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded text-yellow-400 group-hover:scale-110 transition-transform">
                  <Euro size={14}/>
                </div>
                <span className="text-xs font-bold text-slate-300">EUR / CNY</span>
              </div>
              <span className="text-sm font-mono font-bold text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                {getRate("EUR")}
              </span>
            </div>
          </div>

          <div className="text-[9px] opacity-30 text-center italic font-mono uppercase tracking-tighter">
             Refreshed: {rates ? new Date().toLocaleTimeString() : '...'}
          </div>
        </div>
      </div>
    </div>
  );
};