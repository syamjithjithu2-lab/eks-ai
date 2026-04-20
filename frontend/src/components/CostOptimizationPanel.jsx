import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function CostOptimizationPanel({ prs }) {
    const latestPr = prs[0];

    return (
        <div className="bg-white/5 rounded-3xl p-6">
            <h3 className="font-semibold mb-5 flex items-center gap-2">
                <TrendingUp size={20} />
                Cost Optimization
            </h3>

            <div className="bg-black/60 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-400">Projected Monthly Savings</p>
                        <p className="text-4xl font-bold mt-1 text-emerald-400">$1,284</p>
                    </div>
                    <div className="text-emerald-400 text-xs bg-emerald-500/10 px-4 py-2 rounded-2xl">
                        18% reduction
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Current Memory Waste</span>
                        <span className="font-medium">2.4 GiB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">After Optimization</span>
                        <span className="font-medium text-emerald-400">1.1 GiB</span>
                    </div>
                </div>
            </div>

            {/* Latest PR Card */}
            {latestPr && (
                <div className="mt-6 bg-white/5 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">AUTO-GENERATED PR</p>
                    <p className="font-medium text-sm leading-tight">{latestPr.title}</p>

                    <div className="flex gap-2 mt-6">
                        <button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition"
                            onClick={() => alert("✅ PR Auto-Merged in simulation!")}
                        >
                            <CheckCircle size={18} />
                            Auto Merge
                        </button>

                        <button
                            className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition"
                            onClick={() => alert("PR Rejected")}
                        >
                            <XCircle size={18} />
                            Reject
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-500">
                AI-powered rightsizing recommendations
            </div>
        </div>
    );
}