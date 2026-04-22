import { GitPullRequest, Search, CheckCircle2, XCircle, Code2, ArrowRight } from 'lucide-react';
import { useState, memo } from 'react';

const PRHub = memo(({ prs = [] }) => {
    const [search, setSearch] = useState('');
    
    const filteredPrs = prs.filter(pr => 
        pr.title.toLowerCase().includes(search.toLowerCase()) ||
        pr.cluster.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-10 sidebar-compact-padding h-full flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Pull Requests</h1>
                    <p className="text-slate-500 font-medium mt-1">Autonomous remediations and performance optimizations</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/80 border border-slate-300 py-2.5 px-6 rounded-2xl shadow-sm flex items-center gap-3">
                         <span className="text-[0.625rem] font-black text-slate-800 uppercase tracking-widest">{filteredPrs.length} OPEN PRs</span>
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] flex-1 flex flex-col overflow-hidden bg-white/40">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/20">
                    <div className="flex items-center gap-3 bg-white/80 border border-slate-200 rounded-2xl px-5 py-2.5 w-full max-w-96 shadow-sm focus-within:ring-4 ring-indigo-50 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by cluster or title..." 
                            className="bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-400 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'SCALING', 'FIX', 'SECURITY'].map(tag => (
                            <button key={tag} className="px-4 py-2 text-[0.625rem] font-black rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all uppercase tracking-widest">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {filteredPrs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <GitPullRequest size={40} className="text-slate-400" />
                            </div>
                            <p className="text-xl font-black text-slate-800">No Pull Requests Found</p>
                            <p className="text-sm font-medium text-slate-500 mt-2 max-w-[18.75rem]">The AI fleet is currently analyzing the system. New optimizations will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredPrs.map((pr, i) => (
                                <div key={i} className="bg-white/80 border border-slate-100 rounded-[2.5rem] p-8 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 group border border-slate-200/50 relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                                     
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
                                                <GitPullRequest size={32} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[0.625rem] font-black px-3 py-1 bg-indigo-600 text-white rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-100">
                                                        PR #{Math.floor(Math.random() * 900) + 100}
                                                    </span>
                                                    <span className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest">{pr.cluster}</span>
                                                    <span className="text-[0.625rem] font-bold text-slate-400 font-tech">• {pr.status}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{pr.title}</h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1">Impact</p>
                                                <p className="text-2xl font-black text-emerald-600">{pr.savings}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button className="flex items-center gap-2 bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-100 transition-all">
                                                    <Code2 size={18} />
                                                    Review
                                                </button>
                                                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                                    <CheckCircle2 size={18} />
                                                    Merge
                                                </button>
                                            </div>
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
