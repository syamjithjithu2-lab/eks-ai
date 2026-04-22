import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Database, Cpu, TrendingUp } from 'lucide-react';

export default function MetricsBar({ filteredClusters, selectedCluster, selectedNamespace, selectedPod }) {
    const allPods = filteredClusters?.flatMap(c => c.namespaces.flatMap(ns => ns.pods)) || [];
    const totalPods = allPods.length || 1;

    const avgCpu = Math.round(allPods.reduce((sum, p) => sum + p.cpu, 0) / totalPods) || 0;
    const memoryAvg = Math.round(allPods.reduce((sum, p) => sum + p.memory, 0) / totalPods) || 0;
    const memoryPressure = Math.min(Math.round(memoryAvg / 15), 100);

    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
    let healthData = [];
    let chartTitle = "Cluster Health";
    let chartEntityCount = "";

    if (selectedPod) {
        chartTitle = "Pod Detail";
        chartEntityCount = "1 Pod";
        healthData = allPods.map((p, i) => ({
            name: p.name.split('-').slice(0, 2).join('-'),
            cpu: p.cpu,
            color: p.status === 'Critical' ? '#f43f5e' : p.status === 'Warning' ? '#f59e0b' : colors[0]
        }));
    } else if (selectedNamespace) {
        chartTitle = "Namespace CPU";
        chartEntityCount = `${allPods.length} Pods`;
        healthData = allPods.map((p, i) => ({
            name: p.name.split('-').slice(0, 2).join('-'),
            cpu: p.cpu,
            color: p.status === 'Critical' ? '#f43f5e' : p.status === 'Warning' ? '#f59e0b' : colors[i % colors.length]
        }));
    } else if (selectedCluster && filteredClusters.length > 0) {
        chartTitle = "Namespaces Overview";
        const nss = filteredClusters[0].namespaces;
        chartEntityCount = `${nss.length} Namespaces`;
        healthData = nss.map((ns, i) => {
            const nsPods = ns.pods;
            const nsCpu = nsPods.length ? Math.round(nsPods.reduce((s, p) => s + p.cpu, 0) / nsPods.length) : 0;
            return { name: ns.name, cpu: nsCpu, color: colors[i % colors.length] };
        });
    } else if (filteredClusters) {
        chartTitle = "Cluster Health";
        chartEntityCount = `${filteredClusters.length} Clusters`;
        healthData = filteredClusters.map((c, i) => {
            const cPods = c.namespaces.flatMap(ns => ns.pods);
            const cCpu = cPods.length ? Math.round(cPods.reduce((s, p) => s + p.cpu, 0) / cPods.length) : 0;
            return { name: c.name.split('-')[0], cpu: cCpu, color: colors[i % colors.length] };
        });
    }

    return (
        <div className="grid grid-cols-12 grid-responsive-3 gap-4 md:gap-6 lg:gap-8">
            {/* Avg CPU Usage */}
            <div className="col-span-4 glass-card rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] p-4 md:p-6 lg:p-8 group luminous-card flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3 md:mb-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                        <Cpu className="text-indigo-600" size={16} />
                    </div>
                </div>
                <div>
                    <p className="text-[0.5rem] md:text-[0.5625rem] lg:text-[0.625rem] font-black text-slate-800 uppercase tracking-[0.2em] mb-1 md:mb-2">{selectedPod ? "CPU USAGE" : "AVG CPU USAGE"}</p>
                    <div className="flex items-baseline gap-1 md:gap-2">
                        <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-800 tracking-tighter leading-none">{avgCpu}</p>
                        <p className="text-base md:text-xl lg:text-2xl font-bold text-slate-400">%</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-10 h-2 md:h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/40"
                        style={{ width: `${Math.min(avgCpu, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Memory Pressure */}
            <div className="col-span-4 glass-card rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] p-4 md:p-6 lg:p-8 group luminous-card flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3 md:mb-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-rose-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                        <Database className="text-rose-500" size={16} />
                    </div>
                </div>
                <div>
                    <p className="text-[0.5rem] md:text-[0.5625rem] lg:text-[0.625rem] font-black text-slate-800 uppercase tracking-[0.2em] mb-1 md:mb-2">{selectedPod ? "RAM PRESSURE" : "AVG RAM PRESSURE"}</p>
                    <div className="flex items-baseline gap-1 md:gap-2">
                        <p className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-800 tracking-tighter leading-none">{memoryPressure}</p>
                        <p className="text-base md:text-xl lg:text-2xl font-bold text-slate-400">%</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-10 h-2 md:h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-red-600 transition-all duration-1000 ease-out shadow-lg shadow-rose-500/40"
                        style={{ width: `${memoryPressure}%` }}
                    ></div>
                </div>
            </div>

            {/* Chart Overview */}
            <div className="col-span-4 glass-card rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] p-4 md:p-6 lg:p-8 group flex flex-col">
                <div className="flex justify-between items-start mb-4 md:mb-8">
                    <div>
                        <p className="text-[0.5625rem] md:text-[0.625rem] font-black text-slate-800 uppercase tracking-[0.2em] mb-1">{chartTitle}</p>
                        <p className="text-[0.5625rem] md:text-xs font-bold text-indigo-500 uppercase tracking-widest">{chartEntityCount}</p>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center border border-slate-100 group-hover:rotate-12 transition-transform">
                        <Activity className="text-slate-400" size={16} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                    <ResponsiveContainer width="100%" height={100}>
                        <BarChart data={healthData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="barGradientCritical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900, fontFamily: 'Inter' }}
                                dy={8}
                                interval={0} 
                            />
                            <Tooltip 
                                cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 8 }}
                                contentStyle={{ 
                                    background: 'rgba(255,255,255,0.95)', 
                                    backdropFilter: 'blur(0.75rem)',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    borderRadius: '0.75rem',
                                    padding: '0.5rem 0.75rem',
                                    boxShadow: '0 0.625rem 0.9375rem -0.1875rem rgba(0,0,0,0.05)',
                                    fontWeight: 900,
                                    fontSize: '0.625rem',
                                    color: '#0f172a'
                                }}
                                itemStyle={{ color: '#6366f1' }}
                            />
                            <Bar 
                                dataKey="cpu" 
                                radius={[6, 6, 0, 0]} 
                                barSize={20}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {healthData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.color.includes('#f43f5e') ? 'url(#barGradientCritical)' : 'url(#barGradient)'}
                                        className="transition-all duration-500 hover:opacity-80"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                     <div className="mt-2 md:mt-4 flex items-center justify-between px-1 md:px-2 pt-3 md:pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                              <TrendingUp size={12} className="text-emerald-500" />
                              <span className="text-[0.5rem] md:text-[0.625rem] font-black text-slate-700 uppercase tracking-widest">Normal Range</span>
                          </div>
                          <span className="text-[0.5rem] md:text-[0.625rem] font-black text-slate-400">SYS_STABLE</span>
                     </div>
                </div>
            </div>
        </div>
    );
}