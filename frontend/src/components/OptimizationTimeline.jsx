import { memo } from 'react';
import { Clock, GitPullRequest, ChevronRight, CheckCircle2 } from 'lucide-react';

const OptimizationTimeline = memo(({ prs }) => {
    return (
        <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] p-6 md:p-8 lg:p-10 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Clock size={100} className="text-indigo-600" />
            </div>

            <div className="flex items-center justify-between mb-8 md:mb-12 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                        <GitPullRequest className="text-indigo-600" size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-base font-black text-slate-800 tracking-tight">Optimization Timeline</h3>
                        <p className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fleet Remediation</p>
                    </div>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
            </div>

            <div className="space-y-6 flex-1 overflow-auto pr-2 custom-scrollbar relative z-10">
                {prs && prs.length > 0 ? (
                    prs.slice(0, 3).map((pr, i) => (
                        <div key={i} className="flex items-center justify-between gap-6 p-8 bg-white/60 border border-white/80 rounded-[2.5rem] hover:bg-white transition-all duration-300 group shadow-sm/50">
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[0.625rem] font-black px-4 py-1 bg-emerald-600 text-white rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-emerald-100">
                                        PR #{Math.floor(Math.random() * 900) + 100}
                                    </span>
                                    <span className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest">/ {pr.cluster}</span>
                                </div>
                                <p className="font-black text-slate-800 text-xl tracking-tight group-hover:text-emerald-600 transition-colors truncate leading-tight">{pr.title}</p>
                            </div>

                            <div className="flex flex-col items-end justify-center min-w-[7.5rem]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-[0.2em]">{pr.status}</span>
                                </div>
                                <div className="text-3xl font-black text-slate-800 tracking-tighter">
                                    {pr.savings}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 md:py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-slate-100 shadow-inner">
                             <GitPullRequest size={28} className="text-slate-200 md:hidden" />
                             <GitPullRequest size={40} className="text-slate-200 hidden md:block" />
                        </div>
                        <h4 className="text-base md:text-xl font-black text-slate-800 tracking-tight">System Optimized</h4>
                        <p className="text-slate-400 text-xs md:text-sm font-medium mt-2 max-w-[16.25rem]">No immediate action required. Our AI agents are continuously monitoring for resource leaks.</p>
                        <button className="mt-4 md:mt-8 text-[0.5625rem] md:text-[0.625rem] font-black text-indigo-500 border-b-2 border-indigo-100 hover:border-indigo-500 transition-all uppercase tracking-widest pb-1">
                            Run Manual Scan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default OptimizationTimeline;