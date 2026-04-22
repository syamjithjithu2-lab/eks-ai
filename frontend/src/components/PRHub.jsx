import { GitPullRequest, Search, CheckCircle2, XCircle, Code2, ArrowRight } from 'lucide-react';
import { useState, memo } from 'react';

const PRHub = memo(({ prs = [] }) => {
    const [search, setSearch] = useState('');
    
    const filteredPrs = prs.filter(pr => 
        pr.title?.toLowerCase().includes(search.toLowerCase()) ||
        pr.cluster?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 h-full flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pull Requests</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Autonomous remediations and optimizations</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/80 border border-slate-300 py-2 px-5 rounded-xl shadow-sm flex items-center gap-3">
                         <span className="text-[0.625rem] font-black text-slate-800 uppercase tracking-widest">{filteredPrs.length} OPEN PRs</span>
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] flex-1 flex flex-col overflow-hidden bg-white/40">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/20">
                    <div className="flex items-center gap-4 bg-white/80 border border-slate-200 rounded-xl px-5 py-2.5 w-full max-w-md shadow-sm focus-within:ring-4 ring-indigo-50 transition-all">
                        <Search size={16} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by cluster, title, or status..." 
                            className="bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'SCALING', 'FIX', 'SECURITY'].map(tag => (
                            <button key={tag} className="px-4 py-2 text-[0.625rem] font-black rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all uppercase tracking-wider">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {filteredPrs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                                <GitPullRequest size={40} className="text-slate-400" />
                            </div>
                            <p className="text-2xl font-black text-slate-800 uppercase tracking-widest">No Pull Requests</p>
                            <p className="text-sm font-medium text-slate-500 mt-2 max-w-[18.75rem]">The AI fleet is currently analyzing the system. New optimizations will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredPrs.map((pr, i) => (
                                <div key={i} className="bg-white/80 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group relative flex items-center justify-between gap-6 cursor-default">
                                     <div className="flex items-center gap-5 min-w-0">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform flex-shrink-0">
                                            <GitPullRequest size={24} className="text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <span className="text-[0.5rem] font-black px-2 py-0.5 bg-indigo-600 text-white rounded-md uppercase tracking-wider">
                                                    #{Math.floor(Math.random() * 900) + 100}
                                                </span>
                                                <span className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest truncate">{pr.cluster}</span>
                                                <div className="flex items-center gap-1.5">
                                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                     <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest">{pr.status}</span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate leading-tight">{pr.title}</h3>
                                        </div>
                                     </div>

                                     <div className="flex items-center gap-8 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">IMPACT</p>
                                            <p className="text-xl font-black text-emerald-600 tracking-tighter">{pr.savings}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-black text-[0.625rem] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
                                                Review
                                            </button>
                                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[0.625rem] uppercase tracking-widest shadow-lg shadow-indigo-50 hover:bg-indigo-700 transition-all active:scale-95">
                                                Merge
                                            </button>
                                        </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default PRHub;
