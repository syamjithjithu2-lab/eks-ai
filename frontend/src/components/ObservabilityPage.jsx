import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Search, Play, Pause, AlertTriangle, Info, AlertCircle, Zap, Activity } from 'lucide-react';

const LEVEL_CONFIG = {
    INFO:     { color: 'text-indigo-600',  bg: 'bg-indigo-50/30',  badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',   icon: Info },
    WARN:     { color: 'text-amber-600',   bg: 'bg-amber-50/30',   badge: 'bg-amber-50 text-amber-600 border-amber-100',     icon: AlertTriangle },
    ERROR:    { color: 'text-rose-600',    bg: 'bg-rose-50/40',    badge: 'bg-rose-50 text-rose-600 border-rose-100',        icon: AlertCircle },
    CRITICAL: { color: 'text-rose-700',    bg: 'bg-rose-100/50 border-l-4 border-rose-500', badge: 'bg-rose-600 text-white border-rose-600', icon: Zap },
};

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

const ObservabilityPage = memo(({ logStream = [], clusters = [], selectedCluster, selectedNamespace, selectedPod }) => {
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [search, setSearch]           = useState('');
    const [autoScroll, setAutoScroll]   = useState(true);
    const bottomRef = useRef(null);

    const filtered = useMemo(() => {
        return logStream.filter(entry => {
            if (selectedCluster   && entry.clusterId  !== selectedCluster.id)    return false;
            if (selectedNamespace && entry.namespace   !== selectedNamespace.name) return false;
            if (selectedPod       && entry.podId       !== selectedPod.id)        return false;
            if (levelFilter !== 'ALL' && entry.level !== levelFilter)             return false;
            if (search && !entry.raw.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [logStream, selectedCluster, selectedNamespace, selectedPod, levelFilter, search]);

    const [frozenLogs, setFrozenLogs] = useState([]);
    useEffect(() => { if (autoScroll) setFrozenLogs(filtered); }, [filtered, autoScroll]);

    const displayLogs = autoScroll ? filtered : frozenLogs;

    useEffect(() => {
        if (autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [displayLogs.length, autoScroll]);

    const counts = useMemo(() => {
        const c = { INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0 };
        filtered.forEach(e => { if (c[e.level] !== undefined) c[e.level]++; });
        return c;
    }, [filtered]);

    return (
        <div className="p-4 md:p-6 lg:p-10 h-full flex flex-col gap-4 md:gap-8 lg:gap-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">Observability</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm">Real-time log intelligence & distributed tracing</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/80 border border-slate-300 py-2.5 px-4 rounded-2xl shadow-sm">
                        <span className="text-[0.625rem] font-black text-slate-800 uppercase tracking-widest">{filtered.length} EVENTS</span>
                    </div>
                    <button
                        onClick={() => setAutoScroll(v => !v)}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xl ${autoScroll ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'}`}
                    >
                        {autoScroll ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        <span className="hidden sm:inline">{autoScroll ? 'LIVE CAPTURE' : 'PAUSED'}</span>
                        <span className="sm:hidden">{autoScroll ? 'LIVE' : 'OFF'}</span>
                    </button>
                </div>
            </div>

            {/* Stats — 2 cols on mobile, 4 on lg+ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
                    <div key={level} className="glass-card rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] p-4 md:p-6 flex items-center gap-3 md:gap-4 group">
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border transition-all ${cfg.badge} group-hover:scale-110 shadow-sm`}>
                            <cfg.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[0.5625rem] md:text-[0.625rem] font-black text-slate-700 uppercase tracking-widest">{level}</p>
                            <p className={`text-xl md:text-2xl font-black ${cfg.color} tracking-tight`}>{counts[level]}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter + Terminal */}
            <div className="glass-card rounded-[2rem] lg:rounded-[3rem] flex-1 flex flex-col overflow-hidden bg-white/40">
                <div className="p-4 md:p-8 border-b border-slate-100 bg-white/20 flex flex-wrap items-center gap-3 md:gap-6">
                    <div className="flex flex-wrap gap-2">
                        {LEVELS.map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => setLevelFilter(lvl)}
                                className={`px-3 md:px-5 py-2 md:py-2.5 text-[0.5625rem] md:text-[0.625rem] font-black rounded-lg md:rounded-xl transition-all border uppercase tracking-[0.1em] ${
                                    levelFilter === lvl
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                            >{lvl}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 bg-white/80 border border-slate-200 rounded-2xl px-4 py-2.5 w-full sm:flex-1 max-w-sm shadow-sm focus-within:ring-4 ring-indigo-50 transition-all sm:ml-auto">
                        <Search size={16} className="text-slate-400 flex-shrink-0" />
                        <input type="text" placeholder="Search logs across fleet..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-400 w-full"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto font-mono text-[0.6875rem] p-4 md:p-6 bg-white/40 custom-scrollbar"
                    onScroll={e => {
                        const el = e.currentTarget;
                        if (el.scrollHeight - el.scrollTop - el.clientHeight > 40 && autoScroll) setAutoScroll(false);
                    }}
                >
                    {displayLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <Activity size={32} className="text-slate-500" />
                            </div>
                            <p className="font-bold text-slate-800 uppercase tracking-widest text-xs">No Events Streamed</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {displayLogs.map((entry, i) => {
                                const cfg = LEVEL_CONFIG[entry.level] || LEVEL_CONFIG.INFO;
                                return (
                                    <div key={i} className={`flex items-start gap-2 md:gap-4 px-3 md:px-4 py-2 rounded-xl transition-all hover:bg-white hover:shadow-sm group border border-transparent hover:border-slate-100 ${cfg.bg}`}>
                                        <span className="text-slate-600 shrink-0 font-bold opacity-80 hidden sm:inline">{entry.timestamp.substring(11, 23)}</span>
                                        <span className={`shrink-0 text-[0.5rem] md:text-[0.5625rem] font-black px-1.5 md:px-2 py-0.5 rounded border uppercase tracking-widest min-w-[3.5rem] md:min-w-[4.375rem] text-center ${cfg.badge}`}>{entry.level}</span>
                                        <span className="text-indigo-500 font-bold shrink-0 opacity-80 hidden md:inline">{entry.podName?.split('-').slice(0,2).join('-')}</span>
                                        <span className="font-medium leading-relaxed text-slate-600">{entry.message}</span>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ObservabilityPage;