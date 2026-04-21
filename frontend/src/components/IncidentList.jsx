const SEVERITY_STYLES = {
    Critical: 'bg-rose-100 text-rose-600 border-rose-200',
    Warning:  'bg-amber-100 text-amber-600 border-amber-200',
    Info:     'bg-indigo-100 text-indigo-600 border-indigo-200',
};

export default function IncidentList({ incidents, onSelect }) {
    return (
        <div className="glass-card rounded-[2.5rem] p-8 h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    Active Incidents
                    <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Live</span>
                    </div>
                </h3>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
                    {incidents.length} total
                </span>
            </div>

            <div className="space-y-4 flex-1 overflow-auto pr-2 custom-scrollbar">
                {incidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">🛡️</span>
                        </div>
                        <p className="font-bold text-slate-800">Clear Skies</p>
                        <p className="text-sm text-slate-600 mt-1 max-w-[200px]">No incidents detected. System is running optimally.</p>
                    </div>
                ) : (
                    incidents.slice(0, 15).map((inc, i) => (
                        <div
                            key={inc.id || i}
                            onClick={() => onSelect(inc)}
                            className="bg-white/80 hover:bg-white p-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 flex justify-between items-start gap-4 border border-slate-200/50 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 group hover:-translate-y-1"
                        >
                            <div className="min-w-0">
                                <p className="font-black text-slate-800 truncate leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">{inc.pod}</p>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">{inc.cluster} • {inc.namespace}</p>
                                {inc.triggerLog && (
                                    <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 font-mono text-[10px] text-slate-500 truncate group-hover:bg-white transition-colors">
                                        <span className="text-rose-400 font-bold mr-2">LOG</span>
                                        {inc.triggerLog.replace(/^.*\[\w+\]\s\S+:\s/, '').substring(0, 60)}…
                                    </div>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <span className={`px-3 py-1 text-[10px] font-black rounded-lg border shadow-sm ${SEVERITY_STYLES[inc.severity] || SEVERITY_STYLES.Critical} uppercase tracking-[0.05em]`}>
                                    {inc.severity}
                                </span>
                                <p className="text-[10px] font-bold text-slate-600 mt-2.5">{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}