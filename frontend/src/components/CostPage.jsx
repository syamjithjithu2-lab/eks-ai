import { memo } from 'react';
import { DollarSign, TrendingDown, Target, Wallet, ArrowUpRight, BarChart4 } from 'lucide-react';

const CostPage = memo(({ prs }) => {
    const savings = [
        { category: "Unused Volumes",        amount: "$420",   potential: "High" },
        { category: "Overprovisioned Pods",   amount: "$864",   potential: "Critical" },
        { category: "Idle EC2 Nodes",         amount: "$1,100", potential: "Medium" },
    ];

    return (
        <div className="p-4 md:p-8 h-full flex flex-col gap-6 md:gap-8">
            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Cost</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">AI-driven infrastructure spend optimization</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <BarChart4 size={16} /> Export
                    </button>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        Optimize All
                    </button>
                </div>
            </div>

            {/* Main grid — single col mobile, split on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Left column */}
                <div className="lg:col-span-7 space-y-6 md:space-y-8">
                    {/* Savings hero */}
                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden bg-white/60">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <DollarSign size={180} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <TrendingDown className="text-emerald-500" size={20} />
                            </div>
                            <h2 className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-[0.2em]">Projected Monthly Savings</h2>
                        </div>
                        {/* Responsive large number */}
                        <p className="text-5xl md:text-[4rem] font-black text-slate-800 tracking-tighter leading-none">$2,384</p>
                        <p className="text-slate-700 font-bold mt-4 md:mt-6 flex items-center gap-2 text-xs">
                            <ArrowUpRight className="text-emerald-500" size={16} />
                            +12.4% INCREASE FROM LAST MONTH
                        </p>
                    </div>

                    {/* Recommendations */}
                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
                        <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight mb-6">Latest Cost Recommendations</h3>
                        <div className="space-y-4">
                            {prs.length > 0 ? (
                                prs.map((pr, i) => (
                                    <div key={i} className="bg-white/80 border border-slate-200 p-4 md:p-6 rounded-2xl flex items-center justify-between gap-4 group hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform flex-shrink-0">
                                                <Target className="text-indigo-600" size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-slate-800 leading-tight mb-1 text-sm md:text-base truncate">{pr.title}</p>
                                                <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-[0.2em]">{pr.cluster}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg md:text-xl font-black text-emerald-600">{pr.savings}</p>
                                            <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-0.5">EST. SAVINGS</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 opacity-40">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No Active Recommendations</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    {/* Efficiency score */}
                    <div className="glass-card-indigo rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-indigo-200">
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <Wallet className="text-white" size={20} />
                            </div>
                            <h3 className="text-sm md:text-base font-black text-white tracking-tight leading-none">Total Efficiency Score</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-5xl md:text-[4rem] font-black text-white tracking-tighter leading-none">94</p>
                            <p className="text-lg md:text-xl font-bold text-indigo-100 opacity-60">/ 100</p>
                        </div>
                        <div className="mt-6 md:mt-8 h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <div className="h-full bg-white transition-all duration-1000 shadow-lg" style={{ width: '94%' }}></div>
                        </div>
                    </div>

                    {/* Savings by category */}
                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
                        <h3 className="text-sm md:text-base font-black text-slate-800 tracking-tight mb-6">Savings by Category</h3>
                        <div className="space-y-4">
                            {savings.map((s, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/80 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{s.category}</p>
                                        <p className={`text-[0.5625rem] font-black uppercase tracking-widest mt-1 ${s.potential === 'Critical' ? 'text-rose-600' : 'text-slate-500'}`}>
                                            Potential: {s.potential}
                                        </p>
                                    </div>
                                    <p className="text-base md:text-lg font-black text-slate-800">{s.amount}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CostPage;