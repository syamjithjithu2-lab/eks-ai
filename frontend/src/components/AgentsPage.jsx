import { Users, Shield, Zap, MessageSquare, Send, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, memo } from 'react';

const AgentsPage = memo(({ clusters = [], incidents = [], prs = [] }) => {
    const [messages, setMessages] = useState([
        { 
            role: 'ai', 
            text: "Hello! I'm your AI Cluster Assistant, ready to analyze logs, track PRs, or troubleshoot your infrastructure. How can I assist you today?",
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const agents = [
        { name: "prod-us-east-1", status: "Active", latency: "1.2s", uptime: "99.9%", health: "Good" },
        { name: "staging-eu-west-1", status: "Idle", latency: "0.8s", uptime: "99.4%", health: "Good" },
        { name: "dev-ap-south-1", status: "Busy", latency: "2.4s", uptime: "98.1%", health: "Warning" },
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', text: inputValue, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const responseText = generateAIResponse(inputValue);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: responseText, 
                timestamp: new Date().toLocaleTimeString() 
            }]);
            setIsTyping(false);
        }, 1200);
    };

    const generateAIResponse = (query) => {
        const q = query.toLowerCase();

        // 1. PR Count Logic (Highest Priority for specific metrics)
        if (q.includes('how many pr') || q.includes('number of pr')) {
            const count = prs.length;
            return `There are currently ${count} open Pull Requests. ${count > 0 ? "Most of them focus on resource scaling and cost optimization." : "The system is currently fully optimized."}`;
        }

        // 2. Infra Detail & Counting Logic (Prioritized over incidents for general queries)
        if (q.includes('status of') || q.includes('details of') || q.includes('how many') || q.includes('list')) {
            const targetCluster = clusters.find(c => q.includes(c.name.toLowerCase()));
            
            if (targetCluster) {
                if (q.includes('namespace')) {
                    return `Cluster ${targetCluster.name} has ${targetCluster.namespaces.length} active namespaces: ${targetCluster.namespaces.map(ns => `\`${ns.name}\``).join(', ')}. All report stable connectivity.`;
                }
                const totalPods = targetCluster.namespaces.reduce((acc, ns) => acc + ns.pods.length, 0);
                return `Cluster ${targetCluster.name} is currently ${targetCluster.status}. It has ${targetCluster.namespaces.length} namespaces and ${totalPods} active pods. No critical anomalies detected in the last cycle.`;
            }
        }

        // 3. Troubleshooting / Error Logic (Check if no specific infra count was requested)
        const foundIncident = incidents.find(inc => 
            (q.includes('error') || q.includes('issue') || q.includes('failed') || q.includes('oom') || q.includes('crash')) &&
            (q.includes(inc.cluster.toLowerCase()) || 
             q.includes(inc.namespace.toLowerCase()) ||
             (inc.logs && inc.logs.some(log => q.includes(log.toLowerCase()))) ||
             (inc.rootCause && q.includes(inc.rootCause.toLowerCase())))
        );

        if (foundIncident) {
            return `I've cross-referenced that pattern with our incident history. It looks like a match for Incident #${foundIncident.id.substring(0,6)} in ${foundIncident.namespace}. Root Cause: ${foundIncident.rootCause}. I recommend reviewing the latest remedial PR for this namespace.`;
        }

        // 4. Default / General Agent Persona
        if (q.includes('hello') || q.includes('hi ')) {
            return "Hello! I'm ready to assist. You can ask me about cluster health, open PRs, or paste an error message for root-cause analysis.";
        }

        return "I've analyzed that request. Based on the current telemetry, everything seems stable, but I recommend checking the 'Incidents' tab for a deeper log analysis if you suspect any latent issues.";
    };

    return (
        <div className="p-8 h-full flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agents</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Autonomous monitoring & remediation units</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        Deploy New Agent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 grid-responsive-3 gap-8">
                {agents.map((agent, i) => (
                    <div key={i} className="glass-card rounded-[2.5rem] p-8 group">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                                <Users className="text-indigo-600" size={28} />
                            </div>
                            <span className={`px-3 py-1 text-[0.625rem] font-black rounded-full uppercase tracking-wider ${agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                {agent.status}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{agent.name}</h3>
                        <p className="text-[0.625rem] font-bold text-slate-600 uppercase tracking-widest mt-1">Edge Compute Unit</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest mb-1">Latency</p>
                                <p className="text-2xl font-black text-slate-800">{agent.latency}</p>
                            </div>
                            <div className="bg-white/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest mb-1">Uptime</p>
                                <p className="text-2xl font-black text-emerald-600">{agent.uptime}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-8 min-h-[37.5rem]">
                {/* AI Assistant Chat Panel */}
                <div className="flex-1 glass-card rounded-[3rem] p-8 flex flex-col relative overflow-hidden bg-white/60">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Sparkles size={200} className="text-indigo-600" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <MessageSquare className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">AI Cluster Assistant</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                <p className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-widest">Always Ready</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 overflow-auto pr-4 mb-6 custom-scrollbar" ref={scrollRef}>
                         {messages.map((msg, i) => (
                             <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-500' : 'bg-indigo-50 border-indigo-100'}`}>
                                    {msg.role === 'user' ? <Users size={16} className="text-white" /> : <Sparkles size={16} className="text-indigo-600" />}
                                </div>
                                <div className={`${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/80 text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'} p-4 rounded-2xl max-w-[80%]`}>
                                    <p className={`text-sm ${msg.role === 'user' ? 'font-bold' : 'font-medium'} leading-relaxed`}>
                                        {msg.text}
                                    </p>
                                    <p className={`text-[0.5rem] font-black uppercase mt-2 opacity-40 ${msg.role === 'user' ? 'text-white text-right' : 'text-slate-400'}`}>{msg.timestamp}</p>
                                </div>
                             </div>
                         ))}
                         {isTyping && (
                             <div className="flex gap-4">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100">
                                    <Sparkles size={16} className="text-indigo-600" />
                                </div>
                                <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                             </div>
                         )}
                    </div>

                    <div className="relative">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything about your infrastructure..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
                        />
                        <button 
                            onClick={handleSend}
                            className="absolute right-3 top-2.5 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 hover:scale-110 transition-transform"
                        >
                            <Send size={18} fill="currentColor" />
                        </button>
                    </div>
                </div>

                <div className="w-[clamp(16rem,20vw,22rem)] space-y-6">
                    <div className="glass-card rounded-[2.5rem] p-6 bg-emerald-50/50 border-emerald-100/50">
                        <p className="text-[0.625rem] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Quick Stats</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/80 p-3 rounded-2xl border border-slate-200">
                                <span className="text-[0.625rem] font-bold text-slate-700 uppercase tracking-widest">Active Tasks</span>
                                <span className="font-black text-slate-800">12</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/80 p-3 rounded-2xl border border-slate-200">
                                <span className="text-[0.625rem] font-bold text-slate-700 uppercase tracking-widest">Resolved</span>
                                <span className="font-black text-slate-800">1.4k</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-card rounded-[2.5rem] p-6">
                        <p className="text-[0.625rem] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Security Guard</p>
                        <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-[1.5rem] border border-rose-100">
                             <Shield className="text-rose-600" size={24} />
                             <div>
                                <p className="text-[0.625rem] font-black text-rose-600 uppercase tracking-widest">Scan Active</p>
                                <p className="text-xs font-bold text-rose-500">2 events filtered</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AgentsPage;