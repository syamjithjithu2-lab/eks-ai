import { Users, Shield, Zap, MessageSquare, Send, Sparkles, AlertTriangle, DollarSign, ArrowRight, Activity, CheckCircle2, MousePointerClick, Play, FileSearch, Lightbulb } from 'lucide-react';
import { useState, useEffect, useRef, memo } from 'react';

// ── How It Works Step ─────────────────────────────────────────────────────────
function HowItWorksStep({ number, icon: Icon, title, description, color }) {
    const colors = {
        indigo:  { num: 'bg-indigo-600 shadow-indigo-200',  icon: 'bg-indigo-50 text-indigo-600 border-indigo-100', line: 'bg-indigo-200' },
        rose:    { num: 'bg-rose-600 shadow-rose-200',      icon: 'bg-rose-50 text-rose-600 border-rose-100',       line: 'bg-rose-200'   },
        emerald: { num: 'bg-emerald-600 shadow-emerald-200',icon: 'bg-emerald-50 text-emerald-600 border-emerald-100', line: 'bg-emerald-200' },
        violet:  { num: 'bg-violet-600 shadow-violet-200',  icon: 'bg-violet-50 text-violet-600 border-violet-100', line: 'bg-violet-200' },
    };
    const c = colors[color] || colors.indigo;
    return (
        <div className="flex-1 flex flex-col items-center text-center gap-3 min-w-0 px-2">
            <div className="relative">
                <div className={`w-10 h-10 ${c.icon} border rounded-2xl flex items-center justify-center shadow-sm`}>
                    <Icon size={18} />
                </div>
                <div className={`absolute -top-2 -right-2 w-5 h-5 ${c.num} text-white text-[0.55rem] font-black rounded-full flex items-center justify-center shadow-lg`}>{number}</div>
            </div>
            <p className="text-xs font-black text-slate-800 tracking-tight leading-tight">{title}</p>
            <p className="text-[0.65rem] text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
    );
}

// ── Agent Capability Card ─────────────────────────────────────────────────────
function AgentCard({ icon: Icon, color, title, subtitle, description, steps, badge, onLaunch }) {
    const colorMap = {
        rose:    { bg: 'bg-rose-50',    border: 'border-rose-100',   icon: 'text-rose-600',    btn: 'from-rose-600 to-rose-500',    step: 'bg-rose-100 text-rose-700 border-rose-200' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100',icon: 'text-emerald-600', btn: 'from-emerald-600 to-teal-500', step: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    };
    const c = colorMap[color] || colorMap.rose;

    return (
        <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-5 group hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none"><Icon size={160} /></div>

            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
                <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center border ${c.border} group-hover:scale-110 transition-transform flex-shrink-0 shadow-sm`}>
                    <Icon size={26} className={c.icon} />
                </div>
                <span className={`text-[0.55rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${c.bg} ${c.icon} ${c.border} flex items-center gap-1.5 flex-shrink-0`}>
                    <Sparkles size={8} /> {badge}
                </span>
            </div>

            {/* Title */}
            <div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                <p className={`text-[0.625rem] font-black uppercase tracking-[0.2em] mt-1 ${c.icon}`}>{subtitle}</p>
            </div>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">{description}</p>

            {/* Step-by-step "how to use" */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mb-3">How to use</p>
                <div className="space-y-2.5">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className={`w-5 h-5 text-[0.5rem] font-black flex items-center justify-center rounded-full border flex-shrink-0 mt-0.5 ${c.step}`}>{i + 1}</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Launch */}
            <button
                onClick={onLaunch}
                className={`mt-auto w-full bg-gradient-to-r ${c.btn} text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 group-hover:gap-5 transition-all duration-300 active:scale-95`}
            >
                <Play size={14} fill="currentColor" /> Open Agent <ArrowRight size={15} className="ml-auto" />
            </button>
        </div>
    );
}

// ── Prompt Chip ───────────────────────────────────────────────────────────────
function PromptChip({ text, onClick }) {
    return (
        <button
            onClick={() => onClick(text)}
            className="text-[0.65rem] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-xl transition-all hover:border-indigo-300 active:scale-95 text-left"
        >
            {text}
        </button>
    );
}

// ── Cluster Status Row ────────────────────────────────────────────────────────
function ClusterRow({ agent }) {
    return (
        <div className="glass-card rounded-[1.5rem] p-5 group flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform flex-shrink-0">
                <Users className="text-indigo-600" size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{agent.name}</p>
                <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">Edge Compute Unit</p>
            </div>
            <div className="text-right flex-shrink-0">
                <span className={`text-[0.5rem] font-black px-2 py-1 rounded-full uppercase tracking-wider ${agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : agent.status === 'Busy' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                    {agent.status}
                </span>
                <p className="text-xs font-black text-slate-700 mt-1">{agent.latency}</p>
            </div>
        </div>
    );
}

// ── Main AgentsPage ───────────────────────────────────────────────────────────
const AgentsPage = memo(({ clusters = [], incidents = [], prs = [], setActivePage }) => {
    const [messages, setMessages] = useState([{
        role: 'ai',
        text: "👋 Welcome! I'm your AI Cluster Assistant. You can ask me about cluster health, incidents, costs, or PRs. Try one of the quick prompts below to get started!",
        timestamp: new Date().toLocaleTimeString()
    }]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const scrollRef = useRef(null);

    const clusterAgents = [
        { name: "prod-us-east-1",    status: "Active", latency: "1.2s", uptime: "99.9%" },
        { name: "staging-eu-west-1", status: "Idle",   latency: "0.8s", uptime: "99.4%" },
        { name: "dev-ap-south-1",    status: "Busy",   latency: "2.4s", uptime: "98.1%" },
    ];

    const aiAgents = [
        {
            icon: AlertTriangle,
            color: 'rose',
            title: 'Error Log Analyzer',
            subtitle: 'Incident Intelligence Agent',
            badge: 'AI Agent',
            description: 'Monitors your pod logs in real-time. When an incident fires, this agent performs deep root-cause analysis and tells you exactly what went wrong and how to fix it.',
            steps: [
                'Go to the Incidents tab from the sidebar',
                'Click any incident from the live list on the left',
                'Hit "Initiate AI Root Cause Analysis" to run the agent',
                'Review the AI-generated fix and remediation steps',
            ],
            page: 'incidents',
        },
        {
            icon: DollarSign,
            color: 'emerald',
            title: 'Cost Optimizer',
            subtitle: 'Resource Efficiency Agent',
            badge: 'AI Agent',
            description: 'Scans every running pod across all your clusters and flags which ones are wasting money (over-provisioned) or about to break (starved of resources), with exact cost estimates.',
            steps: [
                'Go to the Cost tab from the sidebar',
                'Review the live pod resource table (CPU, Memory, status)',
                'Click "Run Cost Optimizer Agent" to start analysis',
                'Get per-pod cost delta and total monthly savings estimate',
            ],
            page: 'cost',
        },
    ];

    const quickPrompts = [
        "How many clusters are running?",
        "Are there any active incidents?",
        "How can I save on costs?",
        "What are open PRs?",
    ];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const generateAIResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('how many pr') || q.includes('open pr') || q.includes('pull request'))
            return `There are currently **${prs.length} open Pull Requests**. ${prs.length > 0 ? "Most focus on resource scaling and cost optimization. Check the Pull Requests tab for details." : "The system is fully optimized right now."}`;
        if (q.includes('incident') || q.includes('error') || q.includes('crash') || q.includes('oom') || q.includes('active incident'))
            return `There are **${incidents.length} active incidents** being monitored. For deep root-cause analysis, head to the **Incidents** tab — the Error Log Analyzer agent will process your pod logs and identify the exact cause.`;
        if (q.includes('cost') || q.includes('saving') || q.includes('expensive') || q.includes('utiliz') || q.includes('money'))
            return `Head to the **Cost** tab to run the Cost Optimizer agent. It'll scan all ${clusters.reduce((a, c) => a + (c.namespaces?.reduce((b, ns) => b + ns.pods?.length, 0) || 0), 0)} live pods and estimate your monthly savings with specific scale-up/down recommendations.`;
        if (q.includes('cluster') || q.includes('namespace') || q.includes('pod') || q.includes('running')) {
            const totalPods = clusters.reduce((a, c) => a + (c.namespaces?.reduce((b, ns) => b + ns.pods?.length, 0) || 0), 0);
            return `I'm monitoring **${clusters.length} clusters** with **${totalPods} total pods** reporting live metrics every 2.5 seconds. Check the Observability tab for real-time log streaming.`;
        }
        if (q.includes('hello') || q.includes('hi') || q.includes('help'))
            return "Hello! 👋 I can help you navigate this platform. Try asking about clusters, incidents, costs, or PRs. For deeper analysis, use the specialized agents in the Incidents or Cost tabs.";
        return "I've looked at that. For deeper AI-driven insights, use the **Error Log Analyzer** in the Incidents tab or the **Cost Optimizer** in the Cost tab — they connect directly to the AI backend.";
    };

    const handleSend = (text) => {
        const val = text || inputValue;
        if (!val.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: val, timestamp: new Date().toLocaleTimeString() }]);
        setInputValue('');
        setIsTyping(true);
        setShowWelcome(false);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: generateAIResponse(val), timestamp: new Date().toLocaleTimeString() }]);
            setIsTyping(false);
        }, 1200);
    };

    const navigateTo = (page) => {
        const intent =
            page === 'incidents' ? 'incident-agent'
            : page === 'cost' ? 'cost-agent'
            : null;
        setActivePage?.(page, intent);
    };
    const totalPods = clusters.reduce((a, c) => a + (c.namespaces?.reduce((b, ns) => b + ns.pods?.length, 0) || 0), 0);

    return (
        <div className="p-4 md:p-8 min-h-full flex flex-col gap-6 md:gap-8">

            {/* ── Hero Banner ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white relative overflow-hidden shadow-2xl shadow-indigo-300/30 border border-indigo-400/30">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                <div className="absolute -top-8 -right-8 opacity-10 pointer-events-none"><Sparkles size={180} /></div>
                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center min-h-[11rem]">
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md"><Sparkles size={20} /></div>
                            <span className="text-[0.6rem] font-black bg-white/20 text-white px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">AI Agent Hub · {aiAgents.length} Agents Active</span>
                        </div>
                        <h1 className="!text-white text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">Your AI-Powered Operations Center</h1>
                        <p className="!text-indigo-100 text-sm font-medium max-w-2xl leading-relaxed">
                            This hub connects you to specialized AI agents embedded across the platform. Each agent analyzes your live cluster data and provides actionable intelligence.
                        </p>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {[
                                { label: 'Clusters', value: clusters.length },
                                { label: 'Live Pods', value: totalPods },
                                { label: 'Incidents', value: incidents.length },
                                { label: 'Open PRs', value: prs.length },
                            ].map(s => (
                                <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                                    <p className="text-lg font-black text-white leading-none">{s.value}</p>
                                    <p className="text-[0.55rem] font-black text-indigo-100 uppercase tracking-widest mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── How It Works Flow ────────────────────────────────────────────── */}
            <div className="flex-shrink-0 glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center"><Lightbulb size={16} className="text-amber-500" /></div>
                    <div>
                        <p className="text-sm font-black text-slate-800">How the AI Agents Work</p>
                        <p className="text-[0.6rem] text-slate-500 font-medium">Follow these steps on any agent page</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-stretch md:items-center">
                    <HowItWorksStep number="1" icon={MousePointerClick} title="Navigate to the Tab"   description="Go to Incidents or Cost from the sidebar — both have AI badges." color="indigo" />
                    <div className="hidden md:block h-px flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                    <div className="md:hidden w-px h-6 self-center border-l-2 border-dashed border-slate-200" />
                    <HowItWorksStep number="2" icon={FileSearch}        title="Review Live Data"      description="Inspect real-time pod metrics, logs, or incident details." color="rose" />
                    <div className="hidden md:block h-px flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                    <div className="md:hidden w-px h-6 self-center border-l-2 border-dashed border-slate-200" />
                    <HowItWorksStep number="3" icon={Play}              title="Run the Agent"         description="Click the agent CTA button to send data to the AI backend." color="emerald" />
                    <div className="hidden md:block h-px flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
                    <div className="md:hidden w-px h-6 self-center border-l-2 border-dashed border-slate-200" />
                    <HowItWorksStep number="4" icon={Sparkles}          title="Get AI Insights"       description="Review recommendations, cost deltas, and fix suggestions." color="violet" />
                </div>
            </div>

            {/* ── AI Agent Cards ── */}
            <div className="flex-shrink-0">
                <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-1">Specialized AI Agents — Click to Open</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {aiAgents.map((agent) => (
                        <AgentCard key={agent.page} {...agent} onLaunch={() => navigateTo(agent.page)} />
                    ))}
                </div>
            </div>

            {/* ── Chat + Cluster Agents ── */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8" style={{ minHeight: '28rem' }}>
                {/* Chat */}
                <div className="flex-1 glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col relative overflow-hidden bg-white/60">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Sparkles size={200} className="text-indigo-600" /></div>
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <MessageSquare className="text-white" size={19} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 tracking-tight">General AI Assistant</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[0.55rem] font-black text-emerald-600 uppercase tracking-widest">Online · Ask me anything</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick prompt chips */}
                    {showWelcome && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {quickPrompts.map((p) => (
                                <PromptChip key={p} text={p} onClick={handleSend} />
                            ))}
                        </div>
                    )}

                    <div className="flex-1 space-y-4 overflow-auto pr-1 mb-4 custom-scrollbar" ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-50 border-indigo-100'}`}>
                                    {msg.role === 'user' ? <Users size={14} className="text-white" /> : <Sparkles size={14} className="text-indigo-600" />}
                                </div>
                                <div className={`${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/80 text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'} p-3 rounded-2xl max-w-[85%]`}>
                                    <p className={`text-sm ${msg.role === 'user' ? 'font-bold' : 'font-medium'} leading-relaxed`}>{msg.text}</p>
                                    <p className={`text-[0.5rem] font-black uppercase mt-2 opacity-40 ${msg.role === 'user' ? 'text-white text-right' : 'text-slate-400'}`}>{msg.timestamp}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100"><Sparkles size={14} className="text-indigo-600" /></div>
                                <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">{[0,1,2].map(d => <div key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:`${d*75}ms`}} />)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <input type="text" value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about clusters, incidents, costs..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-6 py-4 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
                        />
                        <button onClick={() => handleSend()} className="absolute right-2.5 top-2 w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 hover:scale-110 transition-transform">
                            <Send size={14} fill="currentColor" />
                        </button>
                    </div>
                </div>

                {/* Cluster Agents panel */}
                <div className="w-full lg:w-72 flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-[0.3em]">Cluster Agents</p>
                    </div>
                    {clusterAgents.map((agent, i) => <ClusterRow key={i} agent={agent} />)}
                    <div className="glass-card rounded-[1.5rem] p-5 bg-violet-50/60 border border-violet-100/60 flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-violet-200"><Shield className="text-violet-600" size={18} /></div>
                        <div>
                            <p className="text-[0.55rem] font-black text-violet-600 uppercase tracking-widest">Security Guard</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                                <p className="text-xs font-bold text-violet-500">Scan Active · 2 events filtered</p>
                            </div>
                        </div>
                    </div>
                    {/* Tip card */}
                    <div className="glass-card rounded-[1.5rem] p-5 bg-amber-50/60 border border-amber-100/60">
                        <div className="flex items-start gap-3">
                            <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[0.6rem] font-black text-amber-700 uppercase tracking-widest mb-1">Pro Tip</p>
                                <p className="text-xs font-medium text-amber-700 leading-relaxed">Look for the <span className="font-black">✦ AI</span> badge in the sidebar — those tabs have embedded AI agents ready to help.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AgentsPage;