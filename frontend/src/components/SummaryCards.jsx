import { memo } from 'react';
import { Zap, Shield, Eye, DollarSign, Activity } from 'lucide-react';

// ── Color map: explicit class strings so Tailwind JIT includes them ──
// Dynamic interpolation (bg-${color}-50) is NOT supported by Tailwind JIT.
const COLOR_MAP = {
    emerald: {
        icon:   'bg-emerald-50 border-emerald-100',
        dot:    'bg-emerald-500',
        badge:  'bg-emerald-50 text-emerald-600 border-emerald-100',
        text:   'text-emerald-500',
    },
    amber: {
        icon:   'bg-amber-50 border-amber-100',
        dot:    'bg-amber-500',
        badge:  'bg-amber-50 text-amber-600 border-amber-100',
        text:   'text-amber-500',
    },
    sky: {
        icon:   'bg-sky-50 border-sky-100',
        dot:    'bg-sky-500',
        badge:  'bg-sky-50 text-sky-600 border-sky-100',
        text:   'text-sky-500',
    },
    rose: {
        icon:   'bg-rose-50 border-rose-100',
        dot:    'bg-rose-500',
        badge:  'bg-rose-50 text-rose-600 border-rose-100',
        text:   'text-rose-500',
    },
    indigo: {
        icon:   'bg-indigo-50 border-indigo-100',
        dot:    'bg-indigo-500',
        badge:  'bg-indigo-50 text-indigo-600 border-indigo-100',
        text:   'text-indigo-500',
    },
};

const CARD_DATA = [
    { title: "Resource Optimizer",    value: "87%",   status: "Good",      color: "emerald", icon: Zap },
    { title: "Incident Response",     value: "3",     status: "Active",    color: "amber",   icon: Activity },
    { title: "Security & Compliance", value: "98%",   status: "Compliant", color: "emerald", icon: Shield },
    { title: "Observability Insights",value: "94%",   status: "Excellent", color: "sky",     icon: Eye },
    { title: "Cost Optimization",     value: "$2.4k", status: "Saving",    color: "emerald", icon: DollarSign },
];

const SummaryCards = memo(() => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 grid-responsive-5 gap-3 md:gap-4 lg:gap-6">
            {CARD_DATA.map((card, i) => {
                const c = COLOR_MAP[card.color] || COLOR_MAP.emerald;
                return (
                    <div key={i} className="glass-card rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 md:p-5 lg:p-8 group luminous-card">
                        <div className="flex justify-between items-start mb-2 md:mb-4 lg:mb-6">
                            <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform shadow-sm ${c.icon}`}>
                                <card.icon className={c.text} size={14} />
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse mt-1 ${c.dot}`} />
                        </div>
                        <p className="text-[0.5rem] md:text-[0.5625rem] lg:text-[0.625rem] font-black text-slate-700 uppercase tracking-[0.15em] mb-1">
                            {card.title}
                        </p>
                        <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter group-hover:translate-x-1 transition-transform duration-500">
                            {card.value}
                        </p>
                        <div className="mt-2 md:mt-4 lg:mt-6">
                            <span className={`text-[0.5rem] md:text-[0.625rem] font-black px-2 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border uppercase tracking-widest ${c.badge}`}>
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