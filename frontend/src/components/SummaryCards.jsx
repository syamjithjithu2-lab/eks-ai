import { Zap, Shield, Eye, DollarSign, Activity } from 'lucide-react';

const CARD_DATA = [
    { title: "Resource Optimizer", value: "87%", status: "Good", color: "emerald", icon: Zap },
    { title: "Incident Response", value: "3", status: "Active", color: "amber", icon: Activity },
    { title: "Security & Compliance", value: "98%", status: "Compliant", color: "emerald", icon: Shield },
    { title: "Observability Insights", value: "94%", status: "Excellent", color: "sky", icon: Eye },
    { title: "Cost Optimization", value: "$2.4k", status: "Saving", color: "emerald", icon: DollarSign },
];

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-5 grid-responsive-5 gap-6">
            {CARD_DATA.map((card, i) => (
                <div key={i} className="glass-card rounded-[2.5rem] p-8 group luminous-card">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}-50 border border-${card.color}-100 group-hover:scale-110 transition-transform shadow-sm shadow-${card.color}-50`}>
                            <card.icon className={`text-${card.color}-500`} size={24} />
                        </div>
                        <div className={`w-2 h-2 rounded-full bg-${card.color}-500 animate-pulse mt-2`}></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-2">{card.title}</p>
                    <p className="text-5xl font-black text-slate-800 tracking-tighter group-hover:translate-x-2 transition-transform duration-500">{card.value}</p>
                    <div className="mt-6">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-100/50 uppercase tracking-widest`}>
                            {card.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}