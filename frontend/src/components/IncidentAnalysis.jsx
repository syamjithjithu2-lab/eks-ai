import { AlertTriangle, Server, Clock, FileText, Zap, ChevronRight, Activity } from 'lucide-react';

const SEVERITY_STYLES = {
    Critical: { badge: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm shadow-rose-50', line: 'border-rose-500' },
    Warning:  { badge: 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm shadow-amber-50', line: 'border-amber-500' },
};

const LOG_LEVEL_COLOR = {
    CRITICAL: 'text-rose-600 font-bold',
    ERROR:    'text-rose-500',
    WARN:     'text-amber-500',
    INFO:     'text-slate-500 font-medium',
};

export default function IncidentAnalysis({ incident }) {
    if (!incident) {
        return (
            <div className="glass-card rounded-[2.5rem] p-12 text-center h-full flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <Activity size={40} className="text-slate-400" />
                </div>
                <div>
                    <p className="text-xl font-bold text-slate-800">No Incident Selection</p>
                    <p className="text-sm text-slate-700 mt-2 max-w-[280px] mx-auto">Select an incident from the side list to view a detailed root cause analysis and log context.</p>
                </div>
            </div>
        );
    }

    const style = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.Critical;

    const getLogColor = (log) => {
        for (const [lvl, color] of Object.entries(LOG_LEVEL_COLOR)) {
            if (log.includes(`[${lvl}]`)) return color;
        }
        return 'text-slate-400';
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 space-y-8 h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Root Cause Analysis</h3>
                    <p className="text-[10px] font-black text-indigo-500 tracking-widest uppercase mt-1">Incident Report ID: {incident.id?.substring(0, 8) || 'N/A'}</p>
                </div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider border-2 ${style.badge}`}>{incident.severity}</span>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-[1.5rem] p-4 border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-700 flex items-center gap-2 mb-2 uppercase tracking-widest"><Server size={12} className="text-indigo-500" /> CLUSTER</p>
                    <p className="font-bold text-slate-700 truncate">{incident.cluster}</p>
                </div>
                <div className="bg-white/80 rounded-[1.5rem] p-4 border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-700 flex items-center gap-2 mb-2 uppercase tracking-widest"><FileText size={12} className="text-violet-500" /> NAMESPACE</p>
                    <p className="font-bold text-slate-700">{incident.namespace}</p>
                </div>
                <div className="bg-indigo-600 rounded-[1.5rem] col-span-2 p-5 shadow-xl shadow-indigo-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-indigo-200 flex items-center gap-2 mb-1.5 uppercase tracking-widest"><Zap size={14} /> ACTIVE POD RESOURCE</p>
                        <p className="font-mono text-sm text-white font-bold tracking-tight">{incident.pod}</p>
                    </div>
                    <ChevronRight className="text-indigo-400" size={24} />
                </div>
            </div>

            {/* Root cause */}
            <div className="bg-amber-50 border border-amber-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-200">
                        <AlertTriangle size={16} className="text-amber-600" />
                    </div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em]">AI Analysis Result</p>
                </div>
                <p className="font-bold text-slate-800 leading-relaxed">{incident.rootCause}</p>
            </div>

            {/* Context logs */}
            <div className="flex-1 flex flex-col min-h-0">
                <p className="text-[10px] font-black text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-widest px-1">
                    <Clock size={12} className="text-indigo-500" /> CONTEXT LOGS ({incident.logs?.length || 0} EVENTS)
                </p>
                <div className="flex-1 bg-slate-900 rounded-[2rem] p-6 font-mono text-[11px] overflow-auto space-y-1.5 border-4 border-white shadow-2xl custom-scrollbar">
                    {incident.logs?.map((log, i) => (
                        <div key={i} className={`leading-relaxed py-0.5 border-b border-white/5 last:border-0 ${getLogColor(log)} ${log === incident.triggerLog ? 'bg-rose-500/20 -mx-3 px-3 rounded-lg border-l-2 border-rose-500 shadow-lg' : ''}`}>
                             <span className="opacity-30 mr-2">{(i+1).toString().padStart(2, '0')}</span>
                             {log}
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-[10px] font-bold text-slate-600 flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200">
                <Clock size={12} className="text-slate-600" />
                DETECTED AT {new Date(incident.timestamp).toLocaleString().toUpperCase()}
            </div>
        </div>
    );
}