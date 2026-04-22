import { useState, useEffect, useMemo, memo } from 'react';
import { AlertTriangle, Server, Clock, FileText, Zap, Activity, Edit3, Save, X, Sparkles, ChevronRight, Loader2, CheckCircle2, LightbulbIcon, ShieldCheck, ArrowRight } from 'lucide-react';

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

// ── Simple markdown-like formatter for agent response ───────────────────────────
function FormattedAnalysis({ text }) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
            elements.push(<div key={i} className="h-2" />);
            return;
        }

        // Bold headers: **SOME TEXT:** or **SOME TEXT**
        if (/^\*\*[^*]+\*\*:?\s*$/.test(trimmed)) {
            const headerText = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
            elements.push(
                <div key={i} className="flex items-center gap-2.5 mt-4 mb-2 first:mt-0">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                    <h4 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wide">{headerText}</h4>
                </div>
            );
            return;
        }

        // Numbered list items: 1. **Title:** Description
        const numberedMatch = trimmed.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (numberedMatch) {
            elements.push(
                <div key={i} className="flex gap-3 py-2 pl-2 group">
                    <span className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[0.625rem] font-black flex-shrink-0 border border-indigo-100 mt-0.5">{numberedMatch[1]}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug">{numberedMatch[2]}</p>
                        {numberedMatch[3] && <p className="text-[0.6875rem] md:text-xs text-slate-600 leading-relaxed mt-0.5">{numberedMatch[3]}</p>}
                    </div>
                </div>
            );
            return;
        }

        // Bullet items: - **Title:** Description
        const bulletBoldMatch = trimmed.match(/^-\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (bulletBoldMatch) {
            elements.push(
                <div key={i} className="flex gap-3 py-1.5 pl-2">
                    <ArrowRight size={12} className="text-indigo-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                        <span className="text-xs md:text-sm font-bold text-slate-800">{bulletBoldMatch[1]}</span>
                        {bulletBoldMatch[2] && <span className="text-[0.6875rem] md:text-xs text-slate-600"> {bulletBoldMatch[2]}</span>}
                    </div>
                </div>
            );
            return;
        }

        // Plain bullet: - text
        const bulletMatch = trimmed.match(/^-\s+(.*)/);
        if (bulletMatch) {
            elements.push(
                <div key={i} className="flex gap-3 py-1 pl-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0 mt-2" />
                    <p className="text-[0.6875rem] md:text-xs text-slate-600 leading-relaxed">{renderInlineBold(bulletMatch[1])}</p>
                </div>
            );
            return;
        }

        // Normal paragraph — render inline bold
        elements.push(
            <p key={i} className="text-[0.6875rem] md:text-xs text-slate-600 leading-relaxed py-0.5 pl-2">{renderInlineBold(trimmed)}</p>
        );
    });

    return <>{elements}</>;
}

// Inline **bold** text handler
function renderInlineBold(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <span key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</span>;
        }
        return part;
    });
}


// ── Confirmation Modal ─────────────────────────────────────────────────────────
function ConfirmModal({ onEditFirst, onAnalyzeNow, onDismiss }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl">
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-2xl shadow-indigo-100/50 p-5 max-w-xs w-full">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
                        <Sparkles size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">Before Sending to Agent</p>
                        <p className="text-[0.5625rem] font-bold text-indigo-500 uppercase tracking-widest">AI Analysis</p>
                    </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-1">
                    For the <span className="font-bold text-slate-800">fastest and most accurate</span> result, make sure only necessary error logs are sent to the agent.
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    You can trim your logs first, or proceed with the current events.
                </p>
                <div className="flex flex-col gap-2">
                    <button onClick={onAnalyzeNow}
                        className="w-full text-[0.625rem] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-100"
                    ><Sparkles size={11} /> Analyze Now</button>
                    <button onClick={onEditFirst}
                        className="w-full text-[0.625rem] font-black text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200"
                    ><Edit3 size={11} /> Edit Logs First</button>
                    <button onClick={onDismiss}
                        className="text-[0.5625rem] font-bold text-slate-400 hover:text-slate-600 text-center transition-colors py-1"
                    >Cancel</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const IncidentAnalysis = memo(({ incident, onUpdateLogs }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localLogs, setLocalLogs] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    useEffect(() => {
        setIsEditing(false);
        setShowConfirm(false);
        setIsAnalyzing(false);
        setAnalysisResult(null);
    }, [incident?.id]);

    if (!incident) {
        return (
            <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 text-center h-full flex flex-col items-center justify-center gap-4 bg-white/40">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <Activity size={32} className="text-slate-300" />
                </div>
                <div>
                    <p className="text-base md:text-lg font-black text-slate-800">No Incident Selected</p>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-[15rem] mx-auto">
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
        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 lg:p-8 h-full overflow-hidden flex flex-col gap-4 md:gap-6 relative bg-white/40">

            {/* ── CONFIRMATION MODAL ─────────────────────── */}
            {showConfirm && (
                <ConfirmModal
                    onEditFirst={handleEdit}
                    onAnalyzeNow={handleAnalyzeNow}
                    onDismiss={() => setShowConfirm(false)}
                />
            )}

            {/* ── HEADER ── */}
            <div className="flex items-start justify-between gap-4 flex-shrink-0">
                <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-tight">
                        Root Cause Analysis
                    </h3>
                    <p className="text-[0.5625rem] md:text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mt-1 truncate">
                        ID: {incident.id?.substring(0, 12) || 'N/A'}
                        &nbsp;·&nbsp;
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
                <span className={`text-[0.5625rem] md:text-[0.625rem] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-[0.15em] flex-shrink-0 ${badgeStyle}`}>
                    {incident.severity}
                </span>
            </div>

            {/* ── METADATA BAR ── */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 flex-shrink-0">
                <div className="flex-1 bg-white/80 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-200 shadow-sm min-w-0">
                    <p className="text-[0.5rem] md:text-[0.5625rem] font-black text-slate-500 flex items-center gap-2 mb-1 uppercase tracking-widest">
                        <Server size={10} className="text-indigo-500 flex-shrink-0" /> Cluster
                    </p>
                    <p className="font-black text-slate-800 text-xs truncate">{incident.cluster}</p>
                </div>
                <div className="flex-1 bg-white/80 rounded-xl md:rounded-2xl p-3 md:p-4 border border-slate-200 shadow-sm min-w-0">
                    <p className="text-[0.5rem] md:text-[0.5625rem] font-black text-slate-500 flex items-center gap-2 mb-1 uppercase tracking-widest">
                        <FileText size={10} className="text-violet-500 flex-shrink-0" /> Namespace
                    </p>
                    <p className="font-black text-slate-800 text-xs truncate">{incident.namespace}</p>
                </div>
                <div className="flex-[1.5] bg-indigo-600 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl shadow-indigo-100 min-w-0 border border-indigo-500">
                    <p className="text-[0.5rem] md:text-[0.5625rem] font-black text-indigo-200 flex items-center gap-2 mb-1 uppercase tracking-widest">
                        <Zap size={10} className="flex-shrink-0" /> Target Pod
                    </p>
                    <p className="font-mono text-xs md:text-sm text-white font-black truncate">{incident.pod}</p>
                </div>
            </div>

            {/* ── AGENT ANALYSIS SECTION — now grows to fill space ─────────── */}
            <div className="flex-1 min-h-0 flex flex-col gap-4 md:gap-5 overflow-hidden">

                {/* Idle state — show trigger button */}
                {!isAnalyzing && !analysisResult && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full group flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 transition-all duration-200 active:scale-[0.99] flex-shrink-0"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs md:text-sm font-black text-indigo-700 leading-tight">Analyze with Agent</p>
                                <p className="text-[0.5625rem] md:text-xs text-indigo-400 font-semibold">Send logs for AI root cause analysis</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </button>
                )}

                {/* Loading state */}
                {isAnalyzing && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-4 md:py-5 flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                            <Loader2 size={18} className="text-white animate-spin" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs md:text-sm font-black text-indigo-700">Agent is analyzing…</p>
                            <p className="text-[0.5625rem] md:text-xs text-indigo-400 font-semibold">Processing {incident.logs?.length || 0} log entries</p>
                        </div>
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── BEAUTIFUL RESULT CARD ── */}
                {analysisResult && !isAnalyzing && (
                    <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/40 border border-indigo-100/80 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-lg shadow-indigo-50/50">
                        {/* Result header */}
                        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-indigo-100/60 bg-white/60 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-md shadow-emerald-100 flex-shrink-0">
                                    <ShieldCheck size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm font-black text-slate-800">Agent Analysis Complete</p>
                                    <p className="text-[0.5rem] md:text-[0.5625rem] font-bold text-emerald-600 uppercase tracking-widest">Root Cause Identified</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="text-[0.5625rem] md:text-[0.625rem] font-black text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all uppercase tracking-widest"
                            >
                                Re-analyze
                            </button>
                        </div>

                        {/* Scrollable analysis content */}
                        <div className="flex-1 overflow-auto px-4 md:px-6 py-4 md:py-5 custom-scrollbar">
                            <FormattedAnalysis text={analysisResult.answer} />

                            {/* Suggestions */}
                            {analysisResult.suggestions?.length > 0 && (
                                <div className="mt-4 md:mt-6 pt-4 border-t border-indigo-100/60">
                                    <div className="flex items-center gap-2 mb-3">
                                        <LightbulbIcon size={14} className="text-amber-500" />
                                        <p className="text-[0.625rem] md:text-xs font-black text-slate-800 uppercase tracking-widest">Recommendations</p>
                                    </div>
                                    <div className="space-y-2">
                                        {analysisResult.suggestions.map((s, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white/70 p-3 rounded-xl border border-amber-100/60 group hover:bg-white hover:shadow-sm transition-all">
                                                <span className="w-5 h-5 bg-amber-50 text-amber-600 rounded-md flex items-center justify-center text-[0.5625rem] font-black flex-shrink-0 border border-amber-100 mt-0.5">{i + 1}</span>
                                                <p className="text-[0.6875rem] md:text-xs text-slate-700 font-medium leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── CONTEXT LOGS ───────────────────────────────────── */}
                <div className={`flex flex-col min-h-0 ${analysisResult && !isAnalyzing ? 'flex-shrink-0 max-h-[40%]' : 'flex-1'}`}>
                    {/* Logs toolbar */}
                    <div className="flex items-center justify-between mb-2 px-0.5 flex-shrink-0">
                        <p className="text-[0.5rem] md:text-[0.5625rem] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                            <Clock size={10} className="text-indigo-500 flex-shrink-0" />
                            <span>Context Logs <span className="text-slate-400">({incident.logs?.length || 0} events)</span></span>
                        </p>
                        {!isEditing ? (
                            <button onClick={handleEdit}
                                className="text-[0.5rem] md:text-[0.5625rem] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-100 transition-colors"
                            ><Edit3 size={9} /> Edit</button>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setIsEditing(false)}
                                    className="text-[0.5rem] md:text-[0.5625rem] font-black text-slate-500 flex items-center gap-1 uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                                ><X size={9} /> Cancel</button>
                                <button onClick={handleSave}
                                    className="text-[0.5rem] md:text-[0.5625rem] font-black text-white flex items-center gap-1 uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg shadow-md transition-all active:scale-95"
                                ><Save size={9} /> Save</button>
                            </div>
                        )}
                    </div>

                    {/* Terminal */}
                    <div className="flex-1 bg-slate-900 rounded-lg md:rounded-xl font-mono overflow-hidden border border-slate-700 shadow-xl flex flex-col min-h-0">
                        {!isEditing ? (
                            <div className="flex-1 overflow-auto p-3 md:p-4 space-y-0.5 custom-scrollbar">
                                {incident.logs?.length > 0 ? incident.logs.map((log, i) => (
                                    <div
                                        key={i}
                                        className={`leading-relaxed py-[1px] border-b border-white/5 last:border-0 text-[0.5625rem] md:text-[0.6875rem] ${getLogColor(log)} ${log === incident.triggerLog ? 'bg-rose-500/20 -mx-2 px-2 rounded border-l-2 border-rose-400' : ''}`}
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
                                className="flex-1 w-full bg-transparent text-slate-300 p-3 md:p-4 focus:outline-none resize-none custom-scrollbar leading-relaxed text-[0.5625rem] md:text-[0.6875rem]"
                                placeholder="Edit logs here — one entry per line."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default IncidentAnalysis;