import { Activity, Users, AlertTriangle, Shield, BarChart3, DollarSign, Command, Sparkles, GitPullRequest } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, filteredClusters, selectedCluster, selectedNamespace, selectedPod, isConnected }) {
    const menuItems = [
        { id: 'overview', icon: Activity, label: "Overview" },
        { id: 'agents', icon: Users, label: "Agents" },
        { id: 'incidents', icon: AlertTriangle, label: "Incidents" },
        { id: 'security', icon: Shield, label: "Security" },
        { id: 'observability', icon: BarChart3, label: "Observability" },
        { id: 'cost', icon: DollarSign, label: "Cost" },
        { id: 'prs', icon: GitPullRequest, label: "Pull Requests" },
    ];

    let statusColor = "text-slate-400";
    let titleText = isConnected ? "Analyzing..." : "Disconnected";
    let subTitle = isConnected ? "System heartbeat active" : "Check network link";

    if (filteredClusters && filteredClusters.length > 0) {
        const allPods = filteredClusters.flatMap(c => c.namespaces.flatMap(ns => ns.pods));
        const hasCritical = allPods.some(p => p.status === "Critical");
        const hasWarning = allPods.some(p => p.status === "Warning");

        if (hasCritical) {
            statusColor = "text-rose-500";
            titleText = "CRITICAL BREACH";
        } else if (hasWarning) {
            statusColor = "text-amber-500";
            titleText = "ANOMALIES DETECTED";
        } else {
            statusColor = "text-emerald-500";
            titleText = "OPERATIONAL";
        }

        if (selectedPod) {
             subTitle = `Pod: ${selectedPod.name.substring(0, 16)}...`;
        } else if (selectedNamespace) {
             subTitle = `${allPods.length} pods in ${selectedNamespace.name}`;
        } else if (selectedCluster) {
             subTitle = `${filteredClusters[0].namespaces.length} namespaces online`;
        } else {
             subTitle = `${filteredClusters.length} clusters healthy`;
        }
    }

    return (
        <div className="w-80 glass-sidebar p-8 sidebar-compact-padding flex flex-col z-50">
            <div className="flex items-center gap-4 mb-16 sidebar-compact-mb px-2">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 ring-4 ring-white">
                    <Command className="text-white" size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-slate-800 leading-none">EKS.AI</h1>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Platform Core</p>
                </div>
            </div>

            <nav className="space-y-3 flex-1 px-1 overflow-y-auto custom-scrollbar pr-2 h-0 min-h-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 px-3">Command Center</p>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] cursor-pointer transition-all duration-500 group relative ${activePage === item.id
                                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 -translate-y-1 scale-[1.02]'
                                : 'hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'
                            }`}
                    >
                        {activePage === item.id && (
                            <div className="absolute -left-1 w-1 h-6 bg-indigo-400 rounded-full blur-sm"></div>
                        )}
                        <item.icon size={20} className={activePage === item.id ? 'text-white' : 'group-hover:scale-125 transition-transform duration-500'} />
                        <span className="font-black text-sm tracking-tight">{item.label}</span>
                        {item.id === 'incidents' && (
                            <span className={`ml-auto text-[8px] px-2 py-1 rounded-md font-black tracking-widest ${activePage === item.id ? 'bg-white/20 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-100'}`}>LIVE</span>
                        )}
                        {item.id === 'prs' && (
                             <span className={`ml-auto text-[8px] px-2 py-1 rounded-md font-black tracking-widest ${activePage === item.id ? 'bg-white/20 text-white' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'}`}>NEW</span>
                        )}
                    </div>
                ))}
            </nav>

            <div className="mt-auto space-y-6">
                <div className="glass-card bg-white/40 border-white/60 rounded-[2.5rem] p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
                        <Sparkles size={60} className="text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-3 h-3 rounded-full relative ${statusColor.includes('rose') ? 'bg-rose-500' : statusColor.includes('amber') ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${statusColor.includes('rose') ? 'bg-rose-500' : statusColor.includes('amber') ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusColor}`}>{titleText}</p>
                    </div>
                    <p className="text-slate-800 font-black tracking-tight text-sm mb-1">{subTitle}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Status</p>
                </div>

                <div className="flex items-center justify-between px-4 opacity-50">
                    <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">V2.4.0 CLOUD</p>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}