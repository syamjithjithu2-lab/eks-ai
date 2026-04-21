import { Clock, GitPullRequest, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OptimizationTimeline({ prs }) {
    return (
        <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 h-full">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Clock size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight leading-none">Optimization Timeline</h3>
                        <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                             Real-time Analysis active
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-400 uppercase tracking-widest">
                        Last 30m
                    </span>
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-auto pr-4 custom-scrollbar">
                {prs.length > 0 ? (
                    prs.map((pr, i) => (
                        <div key={i} 
                            onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'prs' }))}
                            className="flex gap-5 bg-white/40 border border-slate-100 rounded-[2rem] p-6 hover:bg-white hover:shadow-2xl hover:shadow-emerald-50/50 transition-all duration-500 group relative luminous-card cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <GitPullRequest size={28} className="text-emerald-500" />
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-600 text-white rounded-md uppercase tracking-widest shadow-sm">
                                        PR #{Math.floor(Math.random() * 900) + 100}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 font-tech">/ {pr.cluster}</span>
                                </div>
                                <p className="font-bold text-slate-800 text-lg leading-tight group-hover:text-emerald-600 transition-colors truncate">{pr.title}</p>
                            </div>

                            <div className="flex flex-col items-end justify-center min-w-[100px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{pr.status}</span>
                                </div>
                                <div className="text-xl font-black text-slate-800 font-tech">
                                    {pr.savings}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                             <GitPullRequest size={40} className="text-slate-200" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">System Optimized</h4>
                        <p className="text-slate-400 text-sm font-medium mt-2 max-w-[300px]">No immediate action required. Our AI agents are continuously monitoring for resource leaks.</p>
                        <button className="mt-8 text-[10px] font-black text-indigo-500 border-b-2 border-indigo-100 hover:border-indigo-500 transition-all uppercase tracking-widest pb-1">
                            Run Manual Scan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}