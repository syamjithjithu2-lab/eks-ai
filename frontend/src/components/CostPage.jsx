import { memo, useState, useMemo, useRef, useEffect } from 'react';
import { DollarSign, TrendingDown, Target, Wallet, ArrowUpRight, Sparkles, Loader2, ShieldCheck, LightbulbIcon, ArrowRight, RefreshCw, Cpu, MemoryStick, AlertCircle, X, Info } from 'lucide-react';

// ── Utilization badge ─────────────────────────────────────────────────────────
function UtilBadge({ cpu, memory }) {
    const isUnder = cpu < 30 && memory < 500;
    const isOver  = cpu > 85 || memory > 1400;
    if (isOver)  return <span className="px-2.5 py-1 text-[0.55rem] font-black uppercase tracking-widest rounded-full bg-rose-50 text-rose-600 border border-rose-200">Over-utilized</span>;
    if (isUnder) return <span className="px-2.5 py-1 text-[0.55rem] font-black uppercase tracking-widest rounded-full bg-amber-50 text-amber-600 border border-amber-200">Under-utilized</span>;
    return        <span className="px-2.5 py-1 text-[0.55rem] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Optimal</span>;
}

// ── Simple markdown renderer (reused pattern) ──────────────────────────────────
function FormattedAnalysis({ text }) {
    if (!text) return null;
    const elements = [];
    text.split('\n').forEach((line, i) => {
        const t = line.trim();
        if (!t) { elements.push(<div key={i} className="h-3" />); return; }
        if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) {
            elements.push(
                <div key={i} className="flex items-center gap-3 mt-6 mb-3 first:mt-0">
                    <div className="w-1.5 h-5 bg-emerald-500 rounded-full flex-shrink-0" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{t.replace(/\*\*/g, '').replace(/:$/, '')}</h4>
                </div>
            );
            return;
        }
        const num = t.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (num) {
            elements.push(
                <div key={i} className="flex gap-4 py-3 pl-2 group bg-white/40 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white/80 transition-all mb-2">
                    <span className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border border-emerald-100 mt-0.5">{num[1]}</span>
                    <div className="flex-1"><p className="text-sm font-bold text-slate-800">{num[2]}</p>{num[3] && <p className="text-xs text-slate-600 mt-0.5">{num[3]}</p>}</div>
                </div>
            );
            return;
        }
        const bul = t.match(/^-\s*\*\*([^*]+)\*\*:?\s*(.*)/);
        if (bul) {
            elements.push(
                <div key={i} className="flex gap-3 py-2 pl-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5"><ArrowRight size={10} className="text-emerald-500" /></div>
                    <div><span className="text-sm font-bold text-slate-800">{bul[1]}</span>{bul[2] && <span className="text-xs text-slate-600 ml-1">{bul[2]}</span>}</div>
                </div>
            );
            return;
        }
        const plain = t.match(/^-\s+(.*)/);
        if (plain) {
            elements.push(<div key={i} className="flex gap-3 py-1 pl-4"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0 mt-2" /><p className="text-xs text-slate-600">{plain[1]}</p></div>);
            return;
        }
        elements.push(<p key={i} className="text-xs text-slate-600 leading-relaxed py-1 pl-2">{t}</p>);
    });
    return <div className="space-y-1">{elements}</div>;
}

// ── Main Component ─────────────────────────────────────────────────────────────
const CostPage = memo(({ prs = [], clusters = [], autoGuideRun = false }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [showGuide, setShowGuide] = useState(true);
    const [showRunNudge, setShowRunNudge] = useState(false);
    const runSectionRef = useRef(null);

    const savings = [
        { category: "Unused Volumes",      amount: "$420",   potential: "High" },
        { category: "Overprovisioned Pods", amount: "$864",   potential: "Critical" },
        { category: "Idle EC2 Nodes",       amount: "$1,100", potential: "Medium" },
    ];

    // Flatten all pods from all clusters/namespaces
    const allPods = useMemo(() => {
        const pods = [];
        clusters.forEach(cluster => {
            cluster.namespaces?.forEach(ns => {
                ns.pods?.forEach(pod => {
                    pods.push({ ...pod, cluster: cluster.name, namespace: ns.name });
                });
            });
        });
        return pods;
    }, [clusters]);

    const handleRunAgent = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/cost-optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pods: allPods }),
            });
            const data = await res.json();
            setAnalysisResult(data);
        } catch (err) {
            setError('Failed to reach the Cost Optimizer agent. Ensure the backend is running.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const guideSteps = [
        { n: '1', title: 'Review Live Pod Table', desc: 'Scroll down to see all running pods with their real-time CPU and memory usage. Colored badges show which pods are wasting resources.' },
        { n: '2', title: 'Run the Cost Optimizer Agent', desc: 'Click the big "Run Cost Optimizer Agent" button. The AI will analyze every pod and estimate cost impact per resource change.' },
        { n: '3', title: 'Read the AI Recommendations', desc: 'The agent returns a per-pod breakdown — scale up, scale down, or keep as-is — plus a total projected monthly savings or cost increase.' },
    ];

    useEffect(() => {
        if (!autoGuideRun) return;
        setShowGuide(true);
        setShowRunNudge(true);
        runSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const timer = setTimeout(() => setShowRunNudge(false), 3000);
        return () => clearTimeout(timer);
    }, [autoGuideRun]);

    return (
        <div className="p-4 md:p-8 min-h-full flex flex-col gap-6 md:gap-8">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Cost
                        <span className="text-[0.55rem] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles size={8} /> AI Optimizer
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">AI-driven infrastructure spend optimization</p>
                    {autoGuideRun && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl px-3 py-2 text-[0.65rem] font-black uppercase tracking-wider">
                            Guided flow active: scroll down and click "Run Cost Optimizer Agent"
                        </div>
                    )}
                </div>
            </div>

            {/* ── Guided How-To Banner ──────────────────────────────────────── */}
            {showGuide && (
                <div className="flex-shrink-0 rounded-[2rem] p-5 md:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 relative shadow-sm">
                    <button
                        onClick={() => setShowGuide(false)}
                        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-emerald-100 transition-colors text-emerald-500"
                        aria-label="Dismiss guide"
                    >
                        <X size={14} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200">
                            <Info size={15} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-emerald-800">How to use this page</p>
                            <p className="text-[0.6rem] text-emerald-600 font-medium">Follow these 3 steps to optimize your costs with AI</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {guideSteps.map((step) => (
                            <div key={step.n} className="flex items-start gap-3 bg-white/70 rounded-2xl p-4 border border-emerald-100">
                                <div className="w-7 h-7 bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200">{step.n}</div>
                                <div>
                                    <p className="text-xs font-black text-slate-800 mb-1">{step.title}</p>
                                    <p className="text-[0.65rem] text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top metrics row */}
            <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className="lg:col-span-7 space-y-6 md:space-y-8">
                    {/* Savings hero */}
                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden bg-white/60">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><DollarSign size={180} className="text-emerald-500" /></div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm"><TrendingDown className="text-emerald-500" size={20} /></div>
                            <h2 className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-[0.2em]">Projected Monthly Savings</h2>
                        </div>
                        <p className="text-5xl md:text-[4rem] font-black text-slate-800 tracking-tighter leading-none">$2,384</p>
                        <p className="text-slate-700 font-bold mt-4 flex items-center gap-2 text-xs">
                            <ArrowUpRight className="text-emerald-500" size={16} /> +12.4% INCREASE FROM LAST MONTH
                        </p>
                    </div>

                    {/* Cost Recommendations */}
                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
                        <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight mb-6">Latest Cost Recommendations</h3>
                        <div className="space-y-4">
                            {prs.length > 0 ? prs.map((pr, i) => (
                                <div key={i} className="bg-white/80 border border-slate-200 p-4 md:p-5 rounded-2xl flex items-center justify-between gap-4 group hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50/50">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform flex-shrink-0"><Target className="text-indigo-600" size={18} /></div>
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-800 text-sm truncate">{pr.title}</p>
                                            <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest">{pr.cluster}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-black text-emerald-600">{pr.savings}</p>
                                        <p className="text-[0.625rem] font-black text-slate-400 uppercase tracking-widest mt-0.5">EST. SAVINGS</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 opacity-40"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">No Active Recommendations</p></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <div className="glass-card-indigo rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-indigo-200">
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md"><Wallet className="text-white" size={20} /></div>
                            <h3 className="text-sm md:text-base font-black text-white tracking-tight">Total Efficiency Score</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-5xl md:text-[4rem] font-black text-white tracking-tighter leading-none">94</p>
                            <p className="text-lg font-bold text-indigo-100 opacity-60">/ 100</p>
                        </div>
                        <div className="mt-6 h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <div className="h-full bg-white transition-all duration-1000 shadow-lg" style={{ width: '94%' }} />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
                        <h3 className="text-sm md:text-base font-black text-slate-800 tracking-tight mb-6">Savings by Category</h3>
                        <div className="space-y-4">
                            {savings.map((s, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/80 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">{s.category}</p>
                                        <p className={`text-[0.5625rem] font-black uppercase tracking-widest mt-1 ${s.potential === 'Critical' ? 'text-rose-600' : 'text-slate-500'}`}>Potential: {s.potential}</p>
                                    </div>
                                    <p className="text-base md:text-lg font-black text-slate-800">{s.amount}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── LIVE POD RESOURCE TABLE ──────────────────────────────────────── */}
            <div
                ref={runSectionRef}
                className={`flex-shrink-0 glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 transition-all ${
                    showRunNudge ? 'ring-2 ring-indigo-300 shadow-[0_0_0_6px_rgba(99,102,241,0.12)]' : ''
                }`}
            >
                <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <div>
                        <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight">Live Pod Resource Monitor</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">{allPods.length} pods across {clusters.length} clusters — real-time metrics</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                {allPods.length === 0 ? (
                    <div className="text-center py-10 opacity-40"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Connecting to cluster data...</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr>
                                    {['Pod', 'Cluster', 'Namespace', 'CPU %', 'Memory MB', 'Status', 'Utilization'].map(h => (
                                        <th key={h} className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest pb-3 px-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allPods.map((pod, i) => (
                                    <tr key={pod.id || i} className="group">
                                        <td className="bg-white/70 group-hover:bg-white rounded-l-2xl px-3 py-3 border-y border-l border-slate-100 transition-all">
                                            <p className="text-xs font-black text-slate-800 font-mono truncate max-w-[10rem]">{pod.name}</p>
                                        </td>
                                        <td className="bg-white/70 group-hover:bg-white px-3 py-3 border-y border-slate-100 transition-all">
                                            <p className="text-xs font-bold text-slate-600 truncate max-w-[8rem]">{pod.cluster}</p>
                                        </td>
                                        <td className="bg-white/70 group-hover:bg-white px-3 py-3 border-y border-slate-100 transition-all">
                                            <p className="text-xs font-bold text-slate-500">{pod.namespace}</p>
                                        </td>
                                        <td className="bg-white/70 group-hover:bg-white px-3 py-3 border-y border-slate-100 transition-all">
                                            <div className="flex items-center gap-2">
                                                <Cpu size={12} className={pod.cpu > 85 ? 'text-rose-500' : pod.cpu < 30 ? 'text-amber-500' : 'text-emerald-500'} />
                                                <span className={`text-xs font-black ${pod.cpu > 85 ? 'text-rose-600' : pod.cpu < 30 ? 'text-amber-600' : 'text-slate-800'}`}>{pod.cpu}%</span>
                                            </div>
                                        </td>
                                        <td className="bg-white/70 group-hover:bg-white px-3 py-3 border-y border-slate-100 transition-all">
                                            <div className="flex items-center gap-2">
                                                <MemoryStick size={12} className={pod.memory > 1400 ? 'text-rose-500' : pod.memory < 500 ? 'text-amber-500' : 'text-emerald-500'} />
                                                <span className={`text-xs font-black ${pod.memory > 1400 ? 'text-rose-600' : 'text-slate-800'}`}>{pod.memory}</span>
                                            </div>
                                        </td>
                                        <td className="bg-white/70 group-hover:bg-white px-3 py-3 border-y border-slate-100 transition-all">
                                            <span className={`text-[0.55rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                pod.status === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                                                pod.status === 'Warning'  ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            }`}>{pod.status}</span>
                                        </td>
                                        <td className="bg-white/70 group-hover:bg-white rounded-r-2xl px-3 py-3 border-y border-r border-slate-100 transition-all">
                                            <UtilBadge cpu={pod.cpu} memory={pod.memory} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── COST OPTIMIZER AGENT ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-black text-slate-800 tracking-tight">Cost Optimizer Agent</h3>
                        <p className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-widest">AI-Powered · Pod-Level Analysis</p>
                    </div>
                </div>

                {/* CTA — idle */}
                {!isAnalyzing && !analysisResult && !error && (
                    <button
                        onClick={handleRunAgent}
                        disabled={allPods.length === 0}
                        className="w-full group flex flex-col items-center justify-center bg-gradient-to-br from-white/40 to-emerald-50/40 hover:from-emerald-50/60 hover:to-teal-50/60 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-[2rem] p-14 md:p-20 transition-all duration-500 active:scale-[0.99] gap-6 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-700" />
                        <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <DollarSign size={36} className="text-white" />
                        </div>
                        <div className="relative text-center">
                            <p className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight group-hover:text-emerald-700 transition-colors">
                                Run Cost Optimizer Agent
                            </p>
                            <p className="text-sm text-slate-400 font-semibold mt-2 group-hover:text-emerald-500 transition-colors uppercase tracking-widest">
                                Analyze <span className="text-emerald-600 font-black">{allPods.length} pods</span> · Detect savings &amp; overruns
                            </p>
                        </div>
                    </button>
                )}

                {/* Loading */}
                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center bg-emerald-50/30 border-2 border-emerald-100/50 rounded-[2rem] p-16 md:p-20">
                        <div className="relative w-28 h-28 mb-8">
                            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl border border-emerald-50">
                                <Loader2 size={48} className="text-emerald-600 animate-spin" />
                            </div>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-emerald-700 animate-pulse tracking-tight">Agent is analyzing...</p>
                        <p className="text-sm text-emerald-400 font-bold mt-3 uppercase tracking-[0.3em]">Calculating cost impact per pod</p>
                    </div>
                )}

                {/* Error */}
                {error && !isAnalyzing && (
                    <div className="flex flex-col items-center gap-4 bg-rose-50 rounded-[2rem] p-10 border border-rose-100">
                        <AlertCircle size={32} className="text-rose-500" />
                        <p className="text-sm font-bold text-rose-700 text-center">{error}</p>
                        <button onClick={() => { setError(null); }} className="text-xs font-black text-rose-600 bg-white border border-rose-200 px-6 py-2.5 rounded-xl hover:bg-rose-50 transition-all flex items-center gap-2">
                            <RefreshCw size={14} /> Try Again
                        </button>
                    </div>
                )}

                {/* Result */}
                {analysisResult && !isAnalyzing && (
                    <div className="flex flex-col bg-gradient-to-br from-white via-emerald-50/10 to-teal-50/20 border border-emerald-100/40 rounded-[2rem] shadow-2xl shadow-emerald-100/10 animate-in zoom-in-95 duration-500">
                        {/* Result header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-6 border-b border-emerald-100/20 bg-white/60 backdrop-blur-md gap-4 rounded-t-[2rem]">
                            <div className="flex items-center gap-5">
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-xl opacity-30 animate-pulse" />
                                    <div className="relative w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-100/50">
                                        <ShieldCheck size={28} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800 tracking-tight">Cost Analysis Complete</p>
                                    <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Recommendations Ready
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAnalysisResult(null)}
                                className="px-6 py-2.5 rounded-xl border-2 border-emerald-100 font-black text-emerald-600 text-xs uppercase tracking-widest bg-white hover:bg-emerald-600 hover:text-white transition-all shadow-sm self-start sm:self-auto active:scale-95 flex items-center gap-2"
                            >
                                <RefreshCw size={13} /> Re-analyze
                            </button>
                        </div>

                        {/* Response body */}
                        <div className="p-8">
                            <FormattedAnalysis text={analysisResult.answer} />

                            {analysisResult.suggestions?.length > 0 && (
                                <div className="mt-10 pt-8 border-t border-emerald-100/30">
                                    <div className="flex items-center gap-3 mb-6">
                                        <LightbulbIcon size={22} className="text-amber-500" />
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Recommended Actions</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analysisResult.suggestions.map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group/s">
                                                <span className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 border border-emerald-100 group-hover/s:bg-emerald-500 group-hover/s:text-white transition-colors">{i + 1}</span>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default CostPage;