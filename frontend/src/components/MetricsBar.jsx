import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

export default function MetricsBar({ filteredClusters, selectedCluster, selectedNamespace, selectedPod }) {
    const allPods = filteredClusters?.flatMap(c => c.namespaces.flatMap(ns => ns.pods)) || [];
    const totalPods = allPods.length || 1;

    const avgCpu = Math.round(allPods.reduce((sum, p) => sum + p.cpu, 0) / totalPods) || 0;

    // Server generates RAM between 200 and 1500 MB. Max 1500. So we divide by 15 for a mock %.
    const memoryAvg = Math.round(allPods.reduce((sum, p) => sum + p.memory, 0) / totalPods) || 0;
    const memoryPressure = Math.min(Math.round(memoryAvg / 15), 100);

    const colors = ['#22d3ee', '#a855f7', '#eab308', '#ec4899', '#3b82f6'];
    let healthData = [];
    let chartTitle = "Cluster Health Overview";
    let chartEntityCount = "";

    if (selectedPod) {
        chartTitle = "Pod Detail";
        chartEntityCount = "1 Pod";
        healthData = allPods.map((p, i) => ({
            name: p.name.split('-').slice(0, 2).join('-'),
            cpu: p.cpu,
            color: p.status === 'Critical' ? '#ef4444' : p.status === 'Warning' ? '#f59e0b' : colors[0]
        }));
    } else if (selectedNamespace) {
        chartTitle = "Namespace CPU Overview";
        chartEntityCount = `${allPods.length} Pods`;
        healthData = allPods.map((p, i) => ({
            name: p.name.split('-').slice(0, 2).join('-'),
            cpu: p.cpu,
            color: p.status === 'Critical' ? '#ef4444' : p.status === 'Warning' ? '#f59e0b' : colors[i % colors.length]
        }));
    } else if (selectedCluster && filteredClusters.length > 0) {
        chartTitle = "Cluster Namespaces Overview";
        const nss = filteredClusters[0].namespaces;
        chartEntityCount = `${nss.length} Namespaces`;
        healthData = nss.map((ns, i) => {
            const nsPods = ns.pods;
            const nsCpu = nsPods.length ? Math.round(nsPods.reduce((s, p) => s + p.cpu, 0) / nsPods.length) : 0;
            return { name: ns.name, cpu: nsCpu, color: colors[i % colors.length] };
        });
    } else if (filteredClusters) {
        chartTitle = "Cluster Health Overview";
        chartEntityCount = `${filteredClusters.length} Clusters`;
        healthData = filteredClusters.map((c, i) => {
            const cPods = c.namespaces.flatMap(ns => ns.pods);
            const cCpu = cPods.length ? Math.round(cPods.reduce((s, p) => s + p.cpu, 0) / cPods.length) : 0;
            return { name: c.name.split('-')[0], cpu: cCpu, color: colors[i % colors.length] };
        });
    }

    return (
        <div className="grid grid-cols-12 gap-4">
            {/* Main Metrics Row */}
            <div className="col-span-12 grid grid-cols-12 gap-4">

                {/* Avg CPU Usage */}
                <div className="col-span-4 bg-white/5 rounded-3xl p-6 card">
                    <p className="text-gray-400 text-sm">{selectedPod ? "CPU Usage" : "Avg CPU Usage"}</p>
                    <p className="text-6xl font-bold mt-6">{avgCpu}<span className="text-3xl">%</span></p>
                    <div className="mt-8 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${Math.min(avgCpu, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Memory Pressure */}
                <div className="col-span-4 bg-white/5 rounded-3xl p-6 card">
                    <p className="text-gray-400 text-sm">{selectedPod ? "Memory Pressure" : "Avg Memory Pressure"}</p>
                    <p className="text-6xl font-bold mt-6">{memoryPressure}<span className="text-3xl">%</span></p>
                    <div className="mt-8 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                            style={{ width: `${memoryPressure}%` }}
                        ></div>
                    </div>
                </div>

                {/* Chart Overview */}
                <div className="col-span-4 bg-white/5 rounded-3xl p-6 card">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-400 text-sm flex-1 truncate pr-2">{chartTitle}</p>
                        <span className="text-xs text-emerald-400 shrink-0">{chartEntityCount}</span>
                    </div>

                    <ResponsiveContainer width="100%" height={110}>
                        <BarChart data={healthData}>
                            <XAxis dataKey="name" stroke="#666" fontSize={11} interval={0} />
                            <Bar dataKey="cpu" radius={6}>
                                {healthData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}