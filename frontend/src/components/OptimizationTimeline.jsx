import { Clock, GitPullRequest } from 'lucide-react';

export default function OptimizationTimeline({ prs }) {
    return (
        <div className="bg-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                    <Clock size={20} />
                    Optimization Timeline
                </h3>
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Last 30 minutes</span>
            </div>

            <div className="space-y-4 max-h-80 overflow-auto pr-2">
                {prs.length > 0 ? (
                    prs.map((pr, i) => (
                        <div key={i} className="flex gap-4 bg-black/40 rounded-2xl p-5 hover:bg-white/5 transition-all">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <GitPullRequest size={20} className="text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm leading-tight">{pr.title}</p>
                                <div className="flex items-center gap-3 mt-3 text-xs">
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                                        {pr.status}
                                    </span>
                                    <span className="text-gray-500">{pr.cluster}</span>
                                    <span className="text-gray-500">• {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="text-right text-xs text-emerald-400">
                                {pr.savings}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No optimizations yet.<br />Wait for OOM incidents to trigger auto-remediation PRs.
                    </div>
                )}
            </div>
        </div>
    );
}