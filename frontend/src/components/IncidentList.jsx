import { memo, useMemo } from 'react';

const SEVERITY_STYLES = {
    Critical: 'bg-rose-100 text-rose-600 border-rose-200',
    Warning:  'bg-amber-100 text-amber-600 border-amber-200',
    Info:     'bg-indigo-100 text-indigo-600 border-indigo-200',
};

const IncidentList = memo(({ incidents, onSelect }) => {
    const visibleIncidents = useMemo(() => incidents.slice(0, 50), [incidents]);

    return (
        <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 lg:p-8 h-full overflow-hidden flex flex-col bg-white/40">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 lg:mb-8 flex-shrink-0 gap-4">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 flex-wrap">
                    Incidents
                    <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-rose-500/40 shadow-lg"></div>
                        <span className="text-[0.625rem] font-black text-rose-600 uppercase tracking-[0.1em]">Live</span>
                    </div>
                </h3>
                <span className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start xl:self-auto">
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
                            className="bg-white/80 hover:bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer transition-all duration-500 flex justify-between items-start gap-3 md:gap-4 border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 group hover:-translate-y-1.5 active:scale-[0.98]"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="font-black text-slate-800 truncate leading-none text-sm md:text-base group-hover:text-indigo-600 transition-colors">{inc.pod}</p>
                                </div>
                                <p className="text-[0.5625rem] md:text-[0.625rem] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3 ml-0 group-hover:ml-1 transition-all">{inc.cluster} · {inc.namespace}</p>
                                {inc.triggerLog && (
                                    <div className="bg-slate-50/80 rounded-xl p-2.5 md:p-3 border border-slate-100 font-mono text-[0.625rem] text-slate-500 group-hover:bg-indigo-50/50 transition-colors flex items-start gap-2">
                                        <span className="text-rose-500 font-black px-1.5 py-0.5 bg-rose-50 rounded text-[0.5rem] tracking-tighter shrink-0">LOG</span>
                                        <span className="truncate opacity-80 group-hover:opacity-100 transition-opacity">{inc.triggerLog.replace(/^.*\[\w+\]\s\S+:\s/, '')}</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 text-[0.5rem] md:text-[0.625rem] font-black rounded-full border shadow-sm ${SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.Critical} uppercase tracking-widest`}>
                                    {inc.severity}
                                </span>
                                <p className="text-[0.5rem] md:text-[0.625rem] font-black text-slate-400 mt-auto bg-slate-50 px-2 py-0.5 rounded-md">
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