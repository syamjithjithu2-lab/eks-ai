import { useState, useEffect } from 'react';
import { AlertTriangle, Server, Clock, FileText, Zap, Activity, Edit3, Save, X, Sparkles, ChevronRight, Loader2, CheckCircle2, LightbulbIcon } from 'lucide-react';

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

// ── Confirmation Modal ─────────────────────────────────────────────────────────
function ConfirmModal({ onEditFirst, onAnalyzeNow, onDismiss }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl">
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-2xl shadow-indigo-100/50 p-5 max-w-xs w-full">
                {/* Icon */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
                        <Sparkles size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">Before Sending to Agent</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">AI Analysis</p>
                    </div>
                </div>

                {/* Body */}
                <p className="text-[11px] text-slate-600 leading-relaxed mb-1">
                    For the <span className="font-bold text-slate-800">fastest and most accurate</span> result, make sure only necessary error logs are sent to the agent.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    You can trim your logs first, or proceed with the current {`{count}`} events.
                </p>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onAnalyzeNow}
                        className="w-full text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-100"
                    >
                        <Sparkles size={11} /> Analyze Now
                    </button>
                    <button
                        onClick={onEditFirst}
                        className="w-full text-[10px] font-black text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200"
                    >
                        <Edit3 size={11} /> Edit Logs First
                    </button>
                    <button
                        onClick={onDismiss}
                        className="text-[9px] font-bold text-slate-400 hover:text-slate-600 text-center transition-colors py-1"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IncidentAnalysis({ incident, onUpdateLogs }) {
    const [isEditing, setIsEditing] = useState(false);
    const [localLogs, setLocalLogs] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null); // { answer, suggestions }

    // Reset all state when incident changes
    useEffect(() => {
        setIsEditing(false);
        setShowConfirm(false);
        setIsAnalyzing(false);
        setAnalysisResult(null);
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
        setShowConfirm(false);
    };

    const handleSave = () => {
        const newLogs = localLogs.split('\n').filter(line => line.trim() !== '');
        onUpdateLogs(incident.id, newLogs);
        setIsEditing(false);
    };

    const handleAnalyzeNow = async () => {
        setShowConfirm(false);
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const response = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    logs: incident.logs || [],
                    incident: {
                        id: incident.id,
                        pod: incident.pod,
                        cluster: incident.cluster,
                        namespace: incident.namespace,
                        severity: incident.severity,
                    },
                }),
            });
            const data = await response.json();
            setAnalysisResult(data);
        } catch (err) {
            setAnalysisResult({
                answer: 'Failed to reach the agent. Please ensure the backend is running and try again.',
                suggestions: [],
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-3 sm:p-4 lg:p-5 h-full overflow-hidden flex flex-col gap-2 sm:gap-3 relative">

            {/* ── CONFIRMATION MODAL (overlay) ─────────────────────── */}
            {showConfirm && (
                <ConfirmModal
                    onEditFirst={handleEdit}
                    onAnalyzeNow={handleAnalyzeNow}
                    onDismiss={() => setShowConfirm(false)}
                />
            )}

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
                        <Server size={8} className="text-indigo-500 flex-shrink-0" /> Cluster
                    </p>
                    <p className="font-bold text-slate-700 text-[10px] sm:text-xs truncate">{incident.cluster}</p>
                </div>
                <div className="flex-1 bg-white/80 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 shadow-sm min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-500 flex items-center gap-1 mb-0.5 uppercase tracking-widest">
                        <FileText size={8} className="text-violet-500 flex-shrink-0" /> Namespace
                    </p>
                    <p className="font-bold text-slate-700 text-[10px] sm:text-xs truncate">{incident.namespace}</p>
                </div>
                <div className="flex-[1.8] bg-indigo-600 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 shadow-md min-w-0">
                    <p className="text-[8px] sm:text-[9px] font-black text-indigo-200 flex items-center gap-1 mb-0.5 uppercase tracking-widest">
                        <Zap size={8} className="flex-shrink-0" /> Pod
                    </p>
                    <p className="font-mono text-[10px] sm:text-[11px] text-white font-bold truncate">{incident.pod}</p>
                </div>
            </div>

            {/* ── AGENT ANALYSIS SECTION ─────────────────────────────── */}
            <div className="flex-shrink-0">
                {/* Idle state — show button */}
                {!isAnalyzing && !analysisResult && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full group flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                                <Sparkles size={13} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] sm:text-xs font-black text-indigo-700 leading-tight">Analyze with Agent</p>
                                <p className="text-[8px] sm:text-[9px] text-indigo-400 font-semibold">Send logs for AI root cause analysis</p>
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>
                )}

                {/* Loading state */}
                {isAnalyzing && (
                    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                        <Loader2 size={16} className="text-indigo-500 animate-spin flex-shrink-0" />
                        <div>
                            <p className="text-[10px] sm:text-xs font-black text-indigo-700">Agent is thinking…</p>
                            <p className="text-[8px] sm:text-[9px] text-indigo-400 font-semibold">Analyzing {incident.logs?.length || 0} log entries</p>
                        </div>
                        <div className="ml-auto flex gap-1">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Result state */}
                {analysisResult && !isAnalyzing && (
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-3 sm:p-4" style={{ maxHeight: 'clamp(100px, 18vh, 160px)', overflowY: 'auto' }}>
                        {/* Result header */}
                        <div className="flex items-center justify-between mb-2 flex-shrink-0">
                            <p className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle2 size={11} className="text-indigo-500" /> Agent Analysis
                            </p>
                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="text-[8px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Re-analyze
                            </button>
                        </div>

                        {/* Answer */}
                        <p className="text-[10px] sm:text-[11px] text-slate-700 leading-relaxed font-medium mb-2 whitespace-pre-wrap">
                            {analysisResult.answer}
                        </p>

                        {/* Suggestions */}
                        {analysisResult.suggestions?.length > 0 && (
                            <div className="space-y-1">
                                {analysisResult.suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-1.5">
                                        <LightbulbIcon size={9} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-[9px] sm:text-[10px] text-slate-600 font-medium leading-tight">{s}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── CONTEXT LOGS ───────────────────────────────────────── */}
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

                {/* Terminal */}
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