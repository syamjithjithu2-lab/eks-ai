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
            elements.push(<div key={i} className="h-4" />);
            return;
        }

        // Bold headers: **SOME TEXT:** or **SOME TEXT**
        if (/^\*\*[^*]+\*\*:?\s*$/.test(trimmed)) {
            const headerText = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
            elements.push(
                <div key={i} className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full flex-shrink-0" />
                    <h4 className="text-xs md:text-base font-black text-slate-800 uppercase tracking-wider">{headerText}</h4>
                </div>
            );
            return;
        }

        // Numbered list items: 1. **Title:** Description
        const numberedMatch = trimmed.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (numberedMatch) {
            elements.push(
                <div key={i} className="flex gap-4 py-4 pl-2 group bg-white/40 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white/80 transition-all mb-2">
                    <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border border-indigo-100 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">{numberedMatch[1]}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-base font-bold text-slate-800 leading-snug">{numberedMatch[2]}</p>
                        {numberedMatch[3] && <p className="text-[0.6875rem] md:text-sm text-slate-600 leading-relaxed mt-1">{numberedMatch[3]}</p>}
                    </div>
                </div>
            );
            return;
        }

        // Bullet items: - **Title:** Description
        const bulletBoldMatch = trimmed.match(/^-\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (bulletBoldMatch) {
            elements.push(
                <div key={i} className="flex gap-4 py-2.5 pl-2 group">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-100 transition-colors">
                        <ArrowRight size={10} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-xs md:text-base font-bold text-slate-800 tracking-tight">{bulletBoldMatch[1]}</span>
                        {bulletBoldMatch[2] && <span className="text-[0.6875rem] md:text-sm text-slate-600 ml-1.5 opacity-90"> {bulletBoldMatch[2]}</span>}
                    </div>
                </div>
            );
            return;
        }

        // Plain bullet: - text
        const bulletMatch = trimmed.match(/^-\s+(.*)/);
        if (bulletMatch) {
            elements.push(
                <div key={i} className="flex gap-4 py-1.5 pl-4">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0 mt-2.5" />
                    <p className="text-[0.6875rem] md:text-sm text-slate-600 leading-relaxed font-medium">{renderInlineBold(bulletMatch[1])}</p>
                </div>
            );
            return;
        }

        // Normal paragraph — render inline bold
        elements.push(
            <p key={i} className="text-[0.6875rem] md:text-sm text-slate-600 leading-relaxed py-1.5 pl-2 font-medium">{renderInlineBold(trimmed)}</p>
        );
    });

    return <div className="space-y-1">{elements}</div>;
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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/10 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 border-indigo-100/50 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] p-6 md:p-8 max-w-lg w-full max-h-[95%] overflow-y-auto custom-scrollbar transform transition-all animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 md:gap-6 mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 rounded-2xl md:rounded-3xl flex items-center justify-center border-2 border-indigo-100 flex-shrink-0 shadow-sm">
                        <Sparkles size={24} className="text-indigo-600 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <p className="text-xl md:text-2xl font-black text-slate-800 leading-tight tracking-tight">AI Pre-check</p>
                        <p className="text-[0.625rem] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5">Optimization Required</p>
                    </div>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-8">
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                        For the <span className="font-black text-indigo-600">fastest and most accurate</span> result, please ensure only relevant error logs are sent to the AI agent.
                    </p>
                    <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 border border-slate-100">
                        <p className="text-[0.6875rem] md:text-sm text-slate-500 font-medium leading-relaxed">
                            Trimming noise helps the AI focus on the root cause. You can proceed directly or refine the log stream first.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 md:gap-3">
                    <button onClick={onAnalyzeNow}
                        className="w-full text-xs md:text-sm font-black text-white bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-100 group"
                    >
                        <Sparkles size={16} className="group-hover:rotate-12 transition-transform md:w-[18px] md:h-[18px]" /> 
                        Analyze Now
                    </button>
                    <button onClick={onEditFirst}
                        className="w-full text-xs md:text-sm font-black text-slate-600 bg-white hover:bg-slate-50 px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all border-2 border-slate-100 hover:border-indigo-100 active:scale-95"
                    >
                        <Edit3 size={16} className="md:w-[18px] md:h-[18px]" /> 
                        Edit Logs First
                    </button>
                    <button onClick={onDismiss}
                        className="mt-1 text-[0.625rem] font-black text-slate-400 hover:text-rose-500 text-center transition-colors py-2 uppercase tracking-widest"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const IncidentAnalysis = memo(({ incident, onUpdateLogs, autoOpenAnalyzePrompt = false }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const [isEditing, setIsEditing] = useState(false);
    const displayedLogs = useMemo(() => {
        const logs = incident?.logs || [];
        return logs.length > 400 ? logs.slice(-400) : logs;
    }, [incident?.logs]);

    const [localLogs, setLocalLogs] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [logsExpanded, setLogsExpanded] = useState(true);

    useEffect(() => {
        setIsEditing(false);
        setShowConfirm(false);
        setIsAnalyzing(false);
        setAnalysisResult(null);
        setLogsExpanded(true);
    }, [incident?.id]);

    useEffect(() => {
        if (autoOpenAnalyzePrompt && incident && !isEditing && !isAnalyzing && !analysisResult) {
            setShowConfirm(true);
        }
    }, [autoOpenAnalyzePrompt, incident, isEditing, isAnalyzing, analysisResult]);

    if (!incident) {
        return (
            <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 lg:p-8 text-center h-full flex flex-col items-center justify-center gap-4 bg-white/40">
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
        setLogsExpanded(false); // Auto-collapse logs to maximize AI response area
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
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
        <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 lg:p-10 lg:pr-6 h-full overflow-y-auto flex flex-col relative bg-white/40 custom-scrollbar scroll-smooth">

            {/* ── CONFIRMATION MODAL ─────────────────────── */}
            {showConfirm && (
                <ConfirmModal
                    onEditFirst={handleEdit}
                    onAnalyzeNow={handleAnalyzeNow}
                    onDismiss={() => setShowConfirm(false)}
                />
            )}

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 mb-8 pr-4">
                <div className="min-w-0">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Root Cause Analysis
                    </h3>
                    <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">
                        ID: {incident.id?.substring(0, 12) || 'N/A'}
                        &nbsp;·&nbsp;
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
                <span className={`text-xs md:text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest flex-shrink-0 ${badgeStyle} border-2 shadow-sm self-start sm:self-auto`}>
                    {incident.severity}
                </span>
            </div>

            {/* ── METADATA BAR ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-shrink-0 mb-10 pr-4">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg shadow-slate-200/20 group/meta transition-all hover:bg-white hover:border-indigo-100">
                    <p className="text-[0.625rem] md:text-xs font-black text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-[0.2em] group-hover/meta:text-indigo-400 transition-colors">
                        <Server size={14} className="text-indigo-500/60 flex-shrink-0" /> Cluster
                    </p>
                    <p className="font-black text-slate-800 text-sm md:text-base truncate">{incident.cluster}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg shadow-slate-200/20 group/meta transition-all hover:bg-white hover:border-violet-100">
                    <p className="text-[0.625rem] md:text-xs font-black text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-[0.2em] group-hover/meta:text-violet-400 transition-colors">
                        <FileText size={14} className="text-violet-500/60 flex-shrink-0" /> Namespace
                    </p>
                    <p className="font-black text-slate-800 text-sm md:text-base truncate">{incident.namespace}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 shadow-xl shadow-indigo-200/50 min-w-0 border border-indigo-400/30 group/meta transition-all hover:scale-[1.01]">
                    <p className="text-[0.625rem] md:text-xs font-black text-indigo-200/80 flex items-center gap-2 mb-2 uppercase tracking-[0.2em]">
                        <Zap size={14} className="flex-shrink-0 text-indigo-300 animate-pulse" /> Target Pod
                    </p>
                    <p className="font-mono text-sm md:text-base text-white font-black truncate drop-shadow-sm">{incident.pod}</p>
                </div>
            </div>

            {/* ── AGENT ANALYSIS SECTION ─────────── */}
            <div className="flex flex-col flex-shrink-0 mb-12 pr-4 lg:pr-6">
                {!isAnalyzing && !analysisResult && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full group flex flex-col items-center justify-center bg-gradient-to-br from-white/40 to-slate-50/40 hover:from-indigo-50/40 hover:to-violet-50/40 border-2 border-dashed border-slate-200 hover:border-indigo-200 rounded-[2.5rem] p-16 md:p-20 transition-all duration-500 active:scale-[0.99] gap-6 relative overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-700" />
                        
                        <div className="relative w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <Sparkles size={40} className="text-white animate-pulse" />
                        </div>
                        <div className="relative text-center">
                            <p className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight group-hover:text-indigo-700 transition-colors">Initiate AI Root Cause Analysis</p>
                            <p className="text-sm md:text-base text-slate-400 font-semibold mt-3 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                                Process <span className="text-indigo-600 font-black">{incident.logs?.length || 0} log events</span> via AI Agent
                            </p>
                        </div>
                    </button>
                )}

                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center bg-white/40 border-2 border-indigo-100/50 rounded-[2.5rem] p-16 md:p-20 animate-in fade-in duration-500">
                        <div className="relative w-28 h-28 mb-8">
                            <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
                            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl border border-indigo-50">
                                <Loader2 size={48} className="text-indigo-600 animate-spin" />
                            </div>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-indigo-700 animate-pulse tracking-tight">Agent is thinking...</p>
                        <p className="text-sm md:text-base text-indigo-400 font-bold mt-3 uppercase tracking-[0.3em]">Extracting Cluster Intelligence</p>
                    </div>
                )}

                {analysisResult && !isAnalyzing && (
                    <div className="flex flex-col bg-gradient-to-br from-white via-indigo-50/10 to-violet-50/20 border border-indigo-100/40 rounded-[2.5rem] shadow-2xl shadow-indigo-100/10 group/result animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-10 py-8 border-b border-indigo-100/20 bg-white/60 backdrop-blur-md gap-4">
                            <div className="flex items-center gap-6">
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                                    <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100/50">
                                        <ShieldCheck size={32} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-800 tracking-tight">Analysis Complete</p>
                                    <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Root Cause Identified
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setAnalysisResult(null)}
                                className="px-8 py-3 rounded-xl border-2 border-indigo-100 font-black text-indigo-600 text-xs uppercase tracking-widest bg-white hover:bg-indigo-600 hover:text-white transition-all shadow-sm self-start sm:self-auto active:scale-95"
                            >Re-analyze</button>
                        </div>
                        <div className="p-10">
                            <FormattedAnalysis text={analysisResult.answer} />
                            {analysisResult.suggestions?.length > 0 && (
                                <div className="mt-12 pt-10 border-t border-indigo-100/30">
                                    <div className="flex items-center gap-3 mb-8">
                                        <LightbulbIcon size={24} className="text-amber-500" />
                                        <p className="text-base font-black text-slate-800 uppercase tracking-widest">Recommended Actions</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {analysisResult.suggestions.map((s, i) => (
                                            <div key={i} className="flex items-start gap-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group/s">
                                                <span className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0 border border-amber-100 group-hover/s:bg-amber-500 group-hover/s:text-white transition-colors">{i + 1}</span>
                                                <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── CONTEXT LOGS ───────────────────────────────────── */}
            <div className="flex flex-col flex-shrink-0 pt-10 pb-10 pr-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 px-1 gap-4">
                    <p className="text-sm font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <Clock size={16} className="text-indigo-400" />
                        <span>System Context Logs <span className="text-slate-300 ml-2">({incident.logs?.length || 0} events)</span></span>
                    </p>
                    {!isEditing ? (
                        <button onClick={handleEdit}
                            className="text-[0.625rem] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 uppercase tracking-widest bg-indigo-50 hover:bg-indigo-100 px-6 py-2.5 rounded-xl border border-indigo-100 transition-colors self-start sm:self-auto"
                        ><Edit3 size={14} /> Edit Stream</button>
                    ) : (
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                            <button onClick={() => setIsEditing(false)}
                                className="text-[0.625rem] font-black text-slate-500 bg-slate-100 px-6 py-2.5 rounded-xl border border-slate-200 transition-colors"
                            ><X size={14} /> Cancel</button>
                            <button onClick={handleSave}
                                className="text-[0.625rem] font-black text-white bg-indigo-600 px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            ><Save size={14} /> Save Changes</button>
                        </div>
                    )}
                </div>
                {(incident.logs?.length || 0) > 400 && (
                    <p className="text-[0.625rem] font-bold text-slate-400 mb-4 px-1 uppercase tracking-wider">
                        Showing latest 400 events for smooth rendering
                    </p>
                )}

                <div className="bg-slate-900 rounded-[2.5rem] font-mono overflow-hidden border border-slate-800 shadow-2xl flex flex-col flex-shrink-0">
                    {!isEditing ? (
                        <div className="p-8 md:p-10 space-y-1.5 bg-slate-900">
                            {displayedLogs.map((log, i) => (
                                <div key={i} className={`leading-relaxed py-2 border-b border-white/5 last:border-0 text-[0.875rem] ${getLogColor(log)} ${log === incident.triggerLog ? 'bg-rose-500/10 -mx-10 px-10 border-l-4 border-rose-500 font-bold' : ''}`}>
                                    <span className="opacity-20 mr-4 select-none tabular-nums font-bold">{(i + 1).toString().padStart(3, '0')}</span>
                                    {log}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-slate-800/70">
                            <div className="border-b lg:border-b-0 lg:border-r border-slate-800/70">
                                <div className="px-8 py-4 border-b border-slate-800/70 bg-slate-900/60">
                                    <p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400">Edit Log Stream</p>
                                </div>
                                <textarea
                                    value={localLogs}
                                    onChange={(e) => setLocalLogs(e.target.value)}
                                    spellCheck="false"
                                    className="w-full min-h-[500px] bg-slate-900 text-slate-300 p-8 md:p-10 focus:outline-none resize-none leading-relaxed text-[0.875rem] font-mono"
                                    placeholder="Edit logs here..."
                                />
                            </div>
                            <div>
                                <div className="px-8 py-4 border-b border-slate-800/70 bg-slate-900/60">
                                    <p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-400">Live Severity Preview</p>
                                </div>
                                <div className="p-8 md:p-10 space-y-1.5 min-h-[500px]">
                                    {localLogs.split('\n').filter(Boolean).length === 0 ? (
                                        <p className="text-[0.75rem] font-bold text-slate-500">Start typing to preview severity colors.</p>
                                    ) : (
                                        localLogs.split('\n').map((log, i) => (
                                            <div key={i} className={`leading-relaxed py-2 border-b border-white/5 last:border-0 text-[0.875rem] ${getLogColor(log)} ${log === incident.triggerLog ? 'bg-rose-500/10 -mx-10 px-10 border-l-4 border-rose-500 font-bold' : ''}`}>
                                                <span className="opacity-20 mr-4 select-none tabular-nums font-bold">{(i + 1).toString().padStart(3, '0')}</span>
                                                {log || <span className="text-slate-600"> </span>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default IncidentAnalysis;