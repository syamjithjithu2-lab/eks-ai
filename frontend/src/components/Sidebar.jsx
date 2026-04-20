import { Activity, Users, AlertTriangle, Shield, BarChart3, DollarSign } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, filteredClusters, selectedCluster, selectedNamespace, selectedPod, isConnected }) {
    const menuItems = [
        { id: 'overview', icon: Activity, label: "Overview" },
        { id: 'agents', icon: Users, label: "Agents" },
        { id: 'incidents', icon: AlertTriangle, label: "Incidents" },
        { id: 'security', icon: Shield, label: "Security" },
        { id: 'observability', icon: BarChart3, label: "Observability" },
        { id: 'cost', icon: DollarSign, label: "Cost" },
    ];

    let statusColor = "text-gray-400";
    let titleText = isConnected ? "Awaiting data..." : "Connecting...";
    let subTitle = isConnected ? "Waiting for first update" : "Backend unreachable";

    if (filteredClusters && filteredClusters.length > 0) {
        const allPods = filteredClusters.flatMap(c => c.namespaces.flatMap(ns => ns.pods));
        const hasCritical = allPods.some(p => p.status === "Critical");
        const hasWarning = allPods.some(p => p.status === "Warning");

        if (hasCritical) {
            statusColor = "text-red-400";
            titleText = "Issues Detected";
        } else if (hasWarning) {
            statusColor = "text-amber-400";
            titleText = "Warnings Present";
        } else {
            statusColor = "text-emerald-400";
            titleText = "Healthy";
        }

        if (selectedPod) {
             titleText = `Pod ${titleText}`;
             subTitle = selectedPod.name;
        } else if (selectedNamespace) {
             titleText = `Namespace ${titleText}`;
             subTitle = `${allPods.length} pods in ${selectedNamespace.name}`;
        } else if (selectedCluster) {
             titleText = `Cluster ${titleText}`;
             subTitle = `${filteredClusters[0].namespaces.length} namespaces • ${allPods.length} pods`;
        } else {
             titleText = `All Clusters ${titleText}`;
             subTitle = `${filteredClusters.length} clusters • ${allPods.length} pods`;
        }
    }

    return (
        <div className="w-64 bg-black border-r border-white/10 p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-10 px-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center">
                    <span className="text-black font-bold text-xl">K</span>
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">KubeDynatrace</h1>
                    <p className="text-xs text-gray-500">Observability Platform</p>
                </div>
            </div>

            <nav className="space-y-1">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${activePage === item.id
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'hover:bg-white/5 text-gray-400'
                            }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                        {item.id === 'incidents' && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">LIVE</span>
                        )}
                    </div>
                ))}
            </nav>

            <div className="mt-auto p-4">
                <div className="bg-white/5 rounded-2xl p-4 text-xs">
                    <p className={statusColor}>{titleText}</p>
                    <p className="text-gray-500 mt-1">{subTitle}</p>
                </div>
            </div>
        </div>
    );
}