import { GitPullRequest, Search } from 'lucide-react';
import { useState, useMemo, memo } from 'react';

const TAG_KEYWORDS = {
    ALL:      null,
    SCALING:  ['scal', 'replica', 'hpa', 'autoscal', 'resize'],
    FIX:      ['fix', 'oom', 'crash', 'error', 'loop', 'probe', 'restart'],
    SECURITY: ['secret', 'rbac', 'policy', 'secur', 'privilege', 'tls'],
};

const TAG_COLORS = {
    ALL:      { active: 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100',      idle: 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600' },
    SCALING:  { active: 'bg-amber-500 text-white border-amber-500 shadow-amber-100',         idle: 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600' },
    FIX:      { active: 'bg-rose-600 text-white border-rose-600 shadow-rose-100',            idle: 'bg-white text-slate-600 border-slate-200 hover:border-rose-400 hover:text-rose-600'   },
    SECURITY: { active: 'bg-violet-600 text-white border-violet-600 shadow-violet-100',      idle: 'bg-white text-slate-600 border-slate-200 hover:border-violet-400 hover:text-violet-600' },
};

const PRHub = memo(({ prs = [], setActivePage }) => {
    const [search, setSearch]     = useState('');
    const [activeTag, setActiveTag] = useState('ALL');

    const filteredPrs = useMemo(() => {
        const keywords = TAG_KEYWORDS[activeTag];
        return prs.filter(pr => {
            const titleLower = pr.title?.toLowerCase() || '';
            const clusterLower = pr.cluster?.toLowerCase() || '';
            const matchesSearch = !search || titleLower.includes(search.toLowerCase()) || clusterLower.includes(search.toLowerCase());
            const matchesTag    = !keywords || keywords.some(kw => titleLower.includes(kw));
            return matchesSearch && matchesTag;
        });
    }, [prs, search, activeTag]);

    // Stable PR numbers keyed by ID
    const getPrNumber = useMemo(() => {
        const map = new Map();
        prs.forEach((pr, i) => { if (pr.id) map.set(pr.id, 100 + (i % 900)); });
        return (pr, i) => pr.id ? (map.get(pr.id) ?? 100 + i) : (100 + i);
    }, [prs]);

    return (
        <div className="p-4 md:p-8 min-h-full flex flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Pull Requests</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Autonomous remediations and optimizations</p>
                </div>
                <div className="bg-white/80 border border-slate-300 py-2 px-4 md:px-5 rounded-xl shadow-sm flex items-center gap-3">
                    <span className="text-[0.625rem] font-black text-slate-800 uppercase tracking-widest">{filteredPrs.length} / {prs.length} PRs</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Table card */}
            <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] flex-1 flex flex-col overflow-hidden bg-white/40">
                {/* Search + filter bar */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white/20">
                    <div className="flex items-center gap-3 bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 flex-1 min-w-[12rem] max-w-md shadow-sm focus-within:ring-4 ring-indigo-50 transition-all">
                        <Search size={16} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by cluster, title..."
                            className="bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Wired filter tags */}
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(TAG_KEYWORDS).map(tag => {
                            const isActive = activeTag === tag;
                            const tc = TAG_COLORS[tag];
                            return (
                                <button
                                    key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    className={`px-3 md:px-4 py-2 text-[0.625rem] font-black rounded-lg border transition-all uppercase tracking-wider shadow-sm ${isActive ? tc.active + ' shadow-lg' : tc.idle}`}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PR list */}
                <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
                    {filteredPrs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                <GitPullRequest size={36} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-800 uppercase tracking-widest">
                                    {activeTag !== 'ALL' ? `No "${activeTag}" PRs` : 'No Pull Requests'}
                                </p>
                                <p className="text-sm font-medium text-slate-500 mt-2 max-w-[18.75rem] mx-auto">
                                    {activeTag !== 'ALL' ? 'Try a different filter tag.' : 'The AI fleet is analyzing. Optimizations appear here.'}
                                </p>
                            </div>
                            {activeTag !== 'ALL' && (
                                <button
                                    onClick={() => setActiveTag('ALL')}
                                    className="text-[0.625rem] font-black text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredPrs.map((pr, i) => (
                                <div key={pr.id || i} className="bg-white/80 border border-slate-200 rounded-2xl p-4 md:p-6 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group cursor-default flex items-center gap-4 md:gap-6">
                                    {/* Icon */}
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <GitPullRequest size={20} className="text-indigo-600" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className="text-[0.5rem] font-black px-2 py-0.5 bg-indigo-600 text-white rounded-md uppercase tracking-wider">
                                                #{getPrNumber(pr, i)}
                                            </span>
                                            <span className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest">{pr.cluster}</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                <span className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-widest">{pr.status}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-sm md:text-base font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">{pr.title}</h3>
                                    </div>

                                    {/* Impact */}
                                    <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[0.5625rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">IMPACT</p>
                                            <p className="text-base md:text-xl font-black text-emerald-600 tracking-tighter">{pr.savings}</p>
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
