import { useState, useEffect } from 'react';
import { AlertTriangle, Server, Clock, FileText, Zap, Activity, Edit3, Save, X } from 'lucide-react';

const SEVERITY_STYLES = {
    Critical: 'bg-rose-50 text-rose-600 border border-rose-200',
    Warning:  'bg-amber-50 text-amber-600 border border-amber-200',
};

const LOG_LEVEL_COLOR = {
    CRITICAL: 'text-rose-400 font-bold',
    ERROR:    'text-rose-500',
    WARN:     'text-amber-400',
    INFO:     'text-slate-500',
};

export default function IncidentAnalysis({ incident, onUpdateLogs }) {
    const [isEditing, setIsEditing] = useState(false);
    const [localLogs, setLocalLogs] = useState('');

    useEffect(() => {
        setIsEditing(false);
    }, [incident?.id]);

    if (!incident) {
        return (
            <div className="glass-card rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Activity size={28} className="text-slate-400" />
                </div>
                <div>
                    <p className="text-base sm:text-lg font-bold text-slate-800">No Incident Selected</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">
                        Select an incident from the list to view its root cause analysis.
                    </p>
                </div>
            </div>
        );
    }

    const badgeStyle = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.Critical;

    const getLogColor = (log) => {
        for (const [lvl, color] of Object.entries(LOG_LEVEL_COLOR)) {
            if (log.includes(`[${lvl}]`)) return color;
        }
        return 'text-slate-400';
    };

    const handleEdit = () => {
        setLocalLogs(incident.logs?.join('\n') || '');
        setIsEditing(true);
    };

    const handleSave = () => {
        const newLogs = localLogs.split('\n').filter(line => line.trim() !== '');
        onUpdateLogs(incident.id, newLogs);
        setIsEditing(false);
    };

    return (
        <div className="glass-card rounded-2xl p-3 sm:p-4 lg:p-5 h-full overflow-hidden flex flex-col gap-2 sm:gap-3">

            {/* ── HEADER ── */}
            <div className="flex items-start justify-between gap-2 flex-shrink-0">
                <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight leading-tight">
                        Root Cause Analysis
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                        {incident.id?.substring(0, 12) || 'N/A'}
                        &nbsp;·&nbsp;
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${badgeStyle}`}>
                    {incident.severity}
                </span>
            </div>

            {/* ── METADATA BAR ── */}
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="flex-1 bg-white/80 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 shadow-sm min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-500 flex items-center gap-1 mb-0.5 uppercase tracking-widest">
                        <Server size={8} className="text-indigo-500 flex-shrink-0" />
                        <span className="truncate">Cluster</span>
                    </p>
                    <p className="font-bold text-slate-700 text-[10px] sm:text-xs truncate">{incident.cluster}</p>
                </div>
                <div className="flex-1 bg-white/80 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 shadow-sm min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-500 flex items-center gap-1 mb-0.5 uppercase tracking-widest">
                        <FileText size={8} className="text-violet-500 flex-shrink-0" />
                        <span className="truncate">Namespace</span>
                    </p>
                    <p className="font-bold text-slate-700 text-[10px] sm:text-xs truncate">{incident.namespace}</p>
                </div>
                <div className="flex-[1.8] bg-indigo-600 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 shadow-md min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-indigo-200 flex items-center gap-1 mb-0.5 uppercase tracking-widest">
                        <Zap size={8} className="flex-shrink-0" />
                        <span className="truncate">Pod</span>
                    </p>
                    <p className="font-mono text-[10px] sm:text-[11px] text-white font-bold truncate">{incident.pod}</p>
                </div>
            </div>

            {/* ── AI ANALYSIS (capped at ~18% viewport height, scrollable) ── */}
            <div
                className="bg-amber-50 border border-amber-100 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0 overflow-y-auto custom-scrollbar"
                style={{ maxHeight: 'clamp(60px, 14vh, 110px)' }}
            >
                <p className="text-[8px] sm:text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <AlertTriangle size={9} className="flex-shrink-0" /> AI Analysis Result
                </p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-800 leading-snug">{incident.rootCause}</p>
            </div>

            {/* ── CONTEXT LOGS (fills all remaining height) ── */}
            <div className="flex-1 flex flex-col min-h-0">

                {/* Logs toolbar */}
                <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-0.5 flex-shrink-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-500 flex items-center gap-1 sm:gap-1.5 uppercase tracking-widest">
                        <Clock size={9} className="text-indigo-500 flex-shrink-0" />
                        <span>Context Logs <span className="text-slate-400">({incident.logs?.length || 0} events)</span></span>
                    </p>

                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="text-[8px] sm:text-[9px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-indigo-100 transition-colors"
                        >
                            <Edit3 size={8} /> Edit
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-[8px] sm:text-[9px] font-black text-slate-500 flex items-center gap-1 uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-slate-200 transition-colors"
                            >
                                <X size={8} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-[8px] sm:text-[9px] font-black text-white flex items-center gap-1 uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-md transition-all active:scale-95"
                            >
                                <Save size={8} /> Save
                            </button>
                        </div>
                    )}
                </div>

                {/* Terminal window — flex-1 makes it fill remaining space */}
                <div className="flex-1 bg-slate-900 rounded-lg sm:rounded-xl font-mono overflow-hidden border border-slate-700 shadow-xl flex flex-col">
                    {!isEditing ? (
                        <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-0.5 custom-scrollbar">
                            {incident.logs?.length > 0 ? incident.logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={`leading-relaxed py-[1px] border-b border-white/5 last:border-0 text-[10px] sm:text-[11px] ${getLogColor(log)} ${log === incident.triggerLog ? 'bg-rose-500/20 -mx-2 px-2 rounded border-l-2 border-rose-400' : ''}`}
                                >
                                    <span className="opacity-25 mr-1.5 select-none tabular-nums">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </span>
                                    {log}
                                </div>
                            )) : (
                                <p className="text-slate-600 italic text-xs pt-2">No log entries available.</p>
                            )}
                        </div>
                    ) : (
                        <textarea
                            value={localLogs}
                            onChange={(e) => setLocalLogs(e.target.value)}
                            spellCheck="false"
                            className="flex-1 w-full bg-transparent text-slate-300 p-3 sm:p-4 focus:outline-none resize-none custom-scrollbar leading-relaxed text-[10px] sm:text-[11px]"
                            placeholder="Edit logs here — one entry per line. Delete a line to remove it from context."
                        />
                    )}
                </div>
            </div>
        </div>
    );
}