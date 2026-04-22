import { DollarSign, TrendingDown, Target, Wallet, ArrowUpRight, BarChart4 } from 'lucide-react';

export default function CostPage({ prs }) {
    const savings = [
        { category: "Unused Volumes", amount: "$420", potential: "High" },
        { category: "Overprovisioned Pods", amount: "$864", potential: "Critical" },
        { category: "Idle EC2 Nodes", amount: "$1,100", potential: "Medium" },
    ];

    return (
        <div className="p-10 h-full flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Cost</h1>
                    <p className="text-slate-500 font-medium mt-1">AI-driven infrastructure spend optimization</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <BarChart4 size={18} />
                        Export Report
                    </button>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        Optimize All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 grid-responsive-2 gap-8">
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    <div className="glass-card rounded-[3rem] p-10 relative overflow-hidden bg-white/60">
                         <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <DollarSign size={200} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <TrendingDown className="text-emerald-500" size={24} />
                            </div>
                            <h2 className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-[0.2em]">Projected Monthly Savings</h2>
                        </div>
                        <p className="text-[5rem] font-black text-slate-800 tracking-tighter">$2,384</p>
                        <p className="text-slate-700 font-bold mt-4 flex items-center gap-2">
                            <ArrowUpRight className="text-emerald-500" size={20} />
                            +12.4% INCREASE FROM LAST MONTH
                        </p>
                    </div>

                    <div className="glass-card rounded-[3rem] p-10">
                         <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Latest Cost Recommendations</h3>
                         <div className="space-y-6">
                            {prs.length > 0 ? (
                                prs.map((pr, i) => (
                                    <div key={i} className="bg-white/80 border border-slate-300 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-50/50">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                                <Target className="text-indigo-600" size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 leading-none mb-2 text-[0.875rem]">{pr.title}</p>
                                                <p className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest">{pr.cluster}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-600">{pr.savings}</p>
                                            <p className="text-[0.625rem] font-bold text-slate-700 uppercase tracking-widest mt-1">Pending PR</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <p className="text-sm font-bold uppercase tracking-widest">No Active Recommendations</p>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <div className="glass-card-indigo rounded-[3rem] p-10 shadow-2xl shadow-indigo-200">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Wallet className="text-white" size={24} />
                             </div>
                             <h3 className="text-lg font-black text-white tracking-tight leading-none">Total Efficiency Score</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                             <p className="text-[5rem] font-black text-white tracking-tighter leading-none">94</p>
                             <p className="text-[1.875rem] font-bold text-indigo-100">/ 100</p>
                        </div>
                        <div className="mt-10 h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <div className="h-full bg-white transition-all duration-1000 shadow-lg" style={{ width: '94%' }}></div>
                        </div>
                    </div>

                    <div className="glass-card rounded-[3rem] p-10">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Savings by Category</h3>
                        <div className="space-y-6">
                            {savings.map((s, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/80 p-4 rounded-2xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{s.category}</p>
                                        <p className={`text-[0.625rem] font-black uppercase tracking-widest mt-1 ${s.potential === 'Critical' ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>Potential: {s.potential}</p>
                                    </div>
                                    <p className="text-xl font-black text-slate-800">{s.amount}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}