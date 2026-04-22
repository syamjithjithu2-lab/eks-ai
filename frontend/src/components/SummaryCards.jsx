import { memo } from 'react';
import { Zap, Shield, Eye, DollarSign, Activity } from 'lucide-react';

const CARD_DATA = [
    { title: "Resource Optimizer", value: "87%", status: "Good", color: "emerald", icon: Zap },
    { title: "Incident Response", value: "3", status: "Active", color: "amber", icon: Activity },
    { title: "Security & Compliance", value: "98%", status: "Compliant", color: "emerald", icon: Shield },
    { title: "Observability Insights", value: "94%", status: "Excellent", color: "sky", icon: Eye },
    { title: "Cost Optimization", value: "$2.4k", status: "Saving", color: "emerald", icon: DollarSign },
];

const SummaryCards = memo(() => {
    return (
        <div className="grid grid-cols-5 grid-responsive-5 gap-3 md:gap-4 lg:gap-6">
            {CARD_DATA.map((card, i) => (
                <div key={i} className="glass-card rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 md:p-5 lg:p-8 group luminous-card">
                    <div className="flex justify-between items-start mb-2 md:mb-4 lg:mb-6">
                        <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center bg-${card.color}-50 border border-${card.color}-100 group-hover:scale-110 transition-transform shadow-sm`}>
                            <card.icon className={`text-${card.color}-500`} size={14} />
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full bg-${card.color}-500 animate-pulse mt-1`}></div>
                    </div>
                    <p className="text-[0.5rem] md:text-[0.5625rem] lg:text-[0.625rem] font-black text-slate-700 uppercase tracking-[0.15em] mb-1">{card.title}</p>
                    <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter group-hover:translate-x-1 transition-transform duration-500">{card.value}</p>
                    <div className="mt-2 md:mt-4 lg:mt-6">
                        <span className={`text-[0.5rem] md:text-[0.625rem] font-black px-2 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-100/50 uppercase tracking-widest`}>
                            {card.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default SummaryCards;