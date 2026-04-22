import { memo } from 'react';

const SEVERITY_STYLES = {
    Critical: 'bg-rose-100 text-rose-600 border-rose-200',
    Warning:  'bg-amber-100 text-amber-600 border-amber-200',
    Info:     'bg-indigo-100 text-indigo-600 border-indigo-200',
};

const IncidentList = memo(({ incidents, onSelect }) => {
    return (
        <div className="glass-card rounded-2xl p-3 sm:p-4 lg:p-5 h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
                <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Active Incidents
                    <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-rose-500/40 shadow-lg"></div>
                        <span className="text-[0.5625rem] font-black text-rose-600 uppercase tracking-wider">Live</span>
                    </div>
                </h3>
                <span className="text-[0.5625rem] sm:text-[0.625rem] font-black text-slate-700 uppercase tracking-widest bg-slate-100/80 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl border border-slate-200">
                    {incidents.length} total
                </span>
            </div>

            <div className="space-y-2 sm:space-y-3 flex-1 overflow-auto pr-1 custom-scrollbar">
                {incidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <span className="text-2xl sm:text-3xl">🛡️</span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">Clear Skies</p>
                        <p className="text-xs text-slate-600 mt-1 max-w-[11.25rem]">No incidents detected. System is running optimally.</p>
                    </div>
                ) : (
                    incidents.slice(0, 50).map((inc, i) => (
                        <div
                            key={inc.id || i}
                            onClick={() => onSelect(inc)}
                            className="bg-white/80 hover:bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex justify-between items-start gap-2 sm:gap-3 border border-slate-200/50 hover:border-indigo-200 shadow-sm hover:shadow-lg hover:shadow-indigo-50/50 group hover:-translate-y-0.5"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-black text-slate-800 truncate leading-none mb-1 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">{inc.pod}</p>
                                <p className="text-[0.5625rem] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{inc.cluster} · {inc.namespace}</p>
                                {inc.triggerLog && (
                                    <div className="bg-slate-50/80 rounded-lg p-1.5 sm:p-2 border border-slate-100 font-mono text-[0.5625rem] sm:text-[0.625rem] text-slate-500 truncate group-hover:bg-white transition-colors">
                                        <span className="text-rose-400 font-bold mr-1.5">LOG</span>
                                        {inc.triggerLog.replace(/^.*\[\w+\]\s\S+:\s/, '').substring(0, 55)}…
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`px-2 py-0.5 text-[0.5625rem] font-black rounded-md border shadow-sm ${SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.Critical} uppercase tracking-wide`}>
                                    {inc.severity}
                                </span>
                                <p className="text-[0.5625rem] font-bold text-slate-500 mt-1.5">{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

export default IncidentList;