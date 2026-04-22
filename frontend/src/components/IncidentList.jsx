import { memo, useMemo } from 'react';

const SEVERITY_STYLES = {
    Critical: 'bg-rose-100 text-rose-600 border-rose-200',
    Warning:  'bg-amber-100 text-amber-600 border-amber-200',
    Info:     'bg-indigo-100 text-indigo-600 border-indigo-200',
};

const IncidentList = memo(({ incidents, onSelect }) => {
    // Memoize the sliced list — avoids creating a new array reference every render
    const visibleIncidents = useMemo(() => incidents.slice(0, 50), [incidents]);

    return (
        <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 h-full overflow-hidden flex flex-col bg-white/40">
            <div className="flex items-center justify-between mb-6 md:mb-8 flex-shrink-0">
                <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    Active Incidents
                    <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-rose-500/40 shadow-lg"></div>
                        <span className="text-[0.625rem] font-black text-rose-600 uppercase tracking-[0.1em]">Live</span>
                    </div>
                </h3>
                <span className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest bg-white/80 px-3 md:px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                    {incidents.length} total
                </span>
            </div>

            <div className="space-y-3 md:space-y-4 flex-1 overflow-auto pr-2 custom-scrollbar">
                {visibleIncidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center opacity-40">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-slate-100">
                            <span className="text-3xl md:text-4xl">🛡️</span>
                        </div>
                        <p className="text-base md:text-lg font-black text-slate-800 uppercase tracking-widest">Clear Skies</p>
                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-[15rem] mx-auto">No incidents detected. System is running optimally.</p>
                    </div>
                ) : (
                    visibleIncidents.map((inc, i) => (
                        <div
                            key={inc.id || i}
                            onClick={() => onSelect(inc)}
                            className="bg-white/80 hover:bg-white p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-start gap-3 md:gap-4 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 group hover:-translate-y-1"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-black text-slate-800 truncate leading-none mb-1 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">{inc.pod}</p>
                                <p className="text-[0.5625rem] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{inc.cluster} · {inc.namespace}</p>
                                {inc.triggerLog && (
                                    <div className="bg-slate-50/80 rounded-lg p-1.5 sm:p-2 border border-slate-100 font-mono text-[0.5rem] sm:text-[0.625rem] text-slate-500 truncate group-hover:bg-white transition-colors">
                                        <span className="text-rose-400 font-bold mr-1.5">LOG</span>
                                        {inc.triggerLog.replace(/^.*\[\w+\]\s\S+:\s/, '').substring(0, 55)}…
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`px-2 py-0.5 text-[0.5625rem] font-black rounded-md border shadow-sm ${SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.Critical} uppercase tracking-wide`}>
                                    {inc.severity}
                                </span>
                                <p className="text-[0.5625rem] font-bold text-slate-500 mt-1.5">
                                    {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

export default IncidentList;