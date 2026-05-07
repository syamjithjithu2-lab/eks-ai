import { memo } from 'react';
import { Activity, Users, AlertTriangle, Shield, BarChart3, DollarSign, Command, Sparkles, GitPullRequest, X, ChevronsLeft, ChevronsRight, Settings } from 'lucide-react';

const Sidebar = memo(({ activePage, setActivePage, filteredClusters, selectedCluster, selectedNamespace, selectedPod, isConnected, isCollapsed = false, onToggleCollapse, isOpen, onClose }) => {
    const menuItems = [
        { id: 'overview', icon: Activity, label: "Overview" },
        { id: 'agents', icon: Users, label: "Agents", badge: { text: 'HUB', color: 'indigo' } },
        { id: 'incidents', icon: AlertTriangle, label: "Incidents", badge: { text: 'LIVE', color: 'rose' }, aiBadge: true },
        { id: 'security', icon: Shield, label: "Security" },
        { id: 'observability', icon: BarChart3, label: "Observability" },
        { id: 'cost', icon: DollarSign, label: "Cost", aiBadge: true },
        { id: 'prs', icon: GitPullRequest, label: "Pull Requests", badge: { text: 'NEW', color: 'emerald' } },
    ];

    // Status Logic 
    let statusTheme = { color: "text-slate-400", bg: "bg-slate-400", label: isConnected ? "Analyzing..." : "Disconnected" };
    if (filteredClusters?.length > 0) {
        const allPods = filteredClusters.flatMap(c => c.namespaces.flatMap(ns => ns.pods));
        if (allPods.some(p => p.status === "Critical")) {
            statusTheme = { color: "text-rose-500", bg: "bg-rose-500", label: "CRITICAL" };
        } else if (allPods.some(p => p.status === "Warning")) {
            statusTheme = { color: "text-amber-500", bg: "bg-amber-500", label: "ANOMALY" };
        } else {
            statusTheme = { color: "text-emerald-500", bg: "bg-emerald-500", label: "STABLE" };
        }
    }

    const sidebarContent = (
        <aside
            className={`flex-shrink-0 flex flex-col transition-all duration-500 ease-in-out border-r border-white/20 bg-white/70 backdrop-blur-xl relative z-20 h-full overflow-hidden
            ${isCollapsed ? 'w-24' : 'w-72'}`}
        >
            {/* Logo Section */}
            <div className="p-6 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-2 ring-indigo-50 transition-transform hover:rotate-12">
                        <Command className="text-white" size={22} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800 tracking-tight leading-none">EKS.AI</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">v2.4.0</span>
                        </div>
                    )}
                </div>
                <button onClick={onToggleCollapse} className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Command Center</p>}
                {menuItems.map((item) => {
                    const isActive = activePage === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative
                                ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600'}`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                            {!isCollapsed && <span className="font-bold text-[13px] tracking-tight truncate flex-1 text-left">{item.label}</span>}

                            {!isCollapsed && (item.badge || item.aiBadge) && (
                                <div className="flex items-center gap-1">
                                    {item.aiBadge && <Sparkles size={10} className={`${isActive ? 'text-indigo-200' : 'text-indigo-500'} animate-pulse`} />}
                                    {item.badge && (
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.badge.text}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Status Card Footer */}
            <div className="p-4 mt-auto">
                <div className={`rounded-3xl p-4 transition-all duration-500 ${isCollapsed ? 'bg-transparent' : 'bg-slate-50 border border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusTheme.bg}`} />
                            <div className={`absolute inset-0 rounded-full ${statusTheme.bg} animate-ping opacity-40`} />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className={`text-[10px] font-black uppercase tracking-tighter ${statusTheme.color}`}>{statusTheme.label}</p>
                                <p className="text-[11px] font-bold text-slate-800 truncate">System Heartbeat</p>
                            </div>
                        )}
                    </div>
                </div>

                {!isCollapsed && (
                    <button className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                        <Settings size={18} />
                        <span className="text-[13px] font-bold">Preferences</span>
                    </button>
                )}
            </div>
        </aside>
    );

    return (
        <>
            <div className="hidden lg:flex h-full">{sidebarContent}</div>
            <div className={`lg:hidden fixed inset-0 z-50 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
                <div onClick={onClose} className="absolute inset-0 -z-10 bg-slate-900/20 backdrop-blur-sm" />
            </div>
        </>
    );
});

export default Sidebar;