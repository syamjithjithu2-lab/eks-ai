import { memo, useMemo } from 'react';
import { Zap, Shield, Eye, DollarSign, Activity, AlertTriangle } from 'lucide-react';

const COLOR_MAP = {
    emerald: {
        icon:  'bg-emerald-50 border-emerald-100',
        dot:   'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        text:  'text-emerald-500',
        bar:   'from-emerald-400 to-teal-500',
    },
    amber: {
        icon:  'bg-amber-50 border-amber-100',
        dot:   'bg-amber-500',
        badge: 'bg-amber-50 text-amber-600 border-amber-100',
        text:  'text-amber-500',
        bar:   'from-amber-400 to-orange-500',
    },
    sky: {
        icon:  'bg-sky-50 border-sky-100',
        dot:   'bg-sky-500',
        badge: 'bg-sky-50 text-sky-600 border-sky-100',
        text:  'text-sky-500',
        bar:   'from-sky-400 to-blue-500',
    },
    rose: {
        icon:  'bg-rose-50 border-rose-100',
        dot:   'bg-rose-500',
        badge: 'bg-rose-50 text-rose-600 border-rose-100',
        text:  'text-rose-500',
        bar:   'from-rose-400 to-pink-500',
    },
    indigo: {
        icon:  'bg-indigo-50 border-indigo-100',
        dot:   'bg-indigo-500',
        badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        text:  'text-indigo-500',
        bar:   'from-indigo-400 to-violet-500',
    },
};

const SummaryCards = memo(({ incidents = [], prs = [], clusters = [] }) => {
    const stats = useMemo(() => {
        // Flatten all pods
        const allPods = clusters.flatMap(c => c.namespaces?.flatMap(ns => ns.pods) || []);
        const totalPods = allPods.length || 1;

        // Resource Optimizer score: % of pods NOT in Critical/Warning state
        const healthyPods = allPods.filter(p => p.status === 'Healthy').length;
        const optimizerScore = Math.round((healthyPods / totalPods) * 100);

        // Incident count (live)
        const incidentCount = incidents.length;
        const hasCritical = incidents.some(i => i.severity === 'Critical');

        // Security: % of pods that are healthy (proxy for threat surface)
        const criticalPods = allPods.filter(p => p.status === 'Critical').length;
        const securityScore = Math.round(((totalPods - criticalPods) / totalPods) * 100);

        // Observability: based on avg CPU spread (how evenly utilized the fleet is)
        const avgCpu = allPods.reduce((s, p) => s + (p.cpu || 0), 0) / totalPods;
        const obsScore = Math.max(0, Math.round(100 - Math.abs(avgCpu - 55)));

        // Cost: count under-utilized pods and project rough savings
        const underUtilized = allPods.filter(p => p.cpu < 30 && p.memory < 500).length;
        const estSaving = underUtilized * 58; // ~$58/mo per under-utilized t3.medium

        return {
            optimizerScore,
            incidentCount,
            hasCritical,
            securityScore,
            obsScore,
            estSaving,
            underUtilized,
        };
    }, [clusters, incidents]);

    const cards = [
        {
            title: 'Resource Optimizer',
            value: `${stats.optimizerScore}%`,
            subtext: `${clusters.flatMap(c => c.namespaces?.flatMap(ns => ns.pods) || []).filter(p => p.status === 'Healthy').length} healthy pods`,
            status: stats.optimizerScore >= 80 ? 'Good' : stats.optimizerScore >= 60 ? 'Fair' : 'Poor',
            color: stats.optimizerScore >= 80 ? 'emerald' : stats.optimizerScore >= 60 ? 'amber' : 'rose',
            icon: Zap,
            progress: stats.optimizerScore,
        },
        {
            title: 'Incident Response',
            value: String(stats.incidentCount),
            subtext: stats.incidentCount === 0 ? 'All clear' : `${stats.hasCritical ? 'Critical active' : 'Warnings only'}`,
            status: stats.incidentCount === 0 ? 'Clear' : stats.hasCritical ? 'Critical' : 'Active',
            color: stats.incidentCount === 0 ? 'emerald' : stats.hasCritical ? 'rose' : 'amber',
            icon: AlertTriangle,
            progress: Math.max(0, 100 - stats.incidentCount * 10),
        },
        {
            title: 'Security & Compliance',
            value: `${stats.securityScore}%`,
            subtext: 'CIS K8s Benchmark',
            status: stats.securityScore >= 90 ? 'Compliant' : 'Review',
            color: stats.securityScore >= 90 ? 'emerald' : 'amber',
            icon: Shield,
            progress: stats.securityScore,
        },
        {
            title: 'Observability Insights',
            value: `${stats.obsScore}%`,
            subtext: 'Fleet balance score',
            status: stats.obsScore >= 80 ? 'Excellent' : 'Moderate',
            color: stats.obsScore >= 80 ? 'sky' : 'amber',
            icon: Eye,
            progress: stats.obsScore,
        },
        {
            title: 'Cost Optimization',
            value: stats.estSaving > 0 ? `$${(stats.estSaving / 1000).toFixed(1)}k` : '$0',
            subtext: `${stats.underUtilized} pods can scale down`,
            status: stats.estSaving > 0 ? 'Saving' : 'Optimal',
            color: 'emerald',
            icon: DollarSign,
            progress: Math.min(100, stats.underUtilized * 20),
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {cards.map((card, i) => {
                const c = COLOR_MAP[card.color] || COLOR_MAP.emerald;
                return (
                    <div key={i} className="glass-card rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 md:p-5 lg:p-8 group luminous-card flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2 md:mb-4 lg:mb-6">
                            <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform shadow-sm ${c.icon}`}>
                                <card.icon className={c.text} size={14} />
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse mt-1 ${c.dot}`} />
                        </div>

                        <div>
                            <p className="text-[0.5rem] md:text-[0.5625rem] lg:text-[0.625rem] font-black text-slate-700 uppercase tracking-[0.15em] mb-1">
                                {card.title}
                            </p>
                            <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter group-hover:translate-x-1 transition-transform duration-500">
                                {card.value}
                            </p>
                            <p className="text-[0.5rem] md:text-[0.55rem] text-slate-500 font-medium mt-0.5 truncate">
                                {card.subtext}
                            </p>
                        </div>

                        {/* Live progress bar */}
                        <div className="mt-3 md:mt-4 space-y-2">
                            <div className="h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-1000`}
                                    style={{ width: `${card.progress}%` }}
                                />
                            </div>
                            <span className={`text-[0.5rem] md:text-[0.625rem] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-lg border uppercase tracking-widest ${c.badge}`}>
                                {card.status}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

export default SummaryCards;