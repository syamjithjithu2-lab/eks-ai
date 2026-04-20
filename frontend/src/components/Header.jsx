import { ChevronDown, User } from 'lucide-react';

export default function Header({ 
    clusters, 
    selectedCluster, setSelectedCluster,
    selectedNamespace, setSelectedNamespace,
    selectedPod, setSelectedPod,
    isConnected 
}) {
    return (
        <div className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-lg flex items-center justify-between px-8 z-50">
            <div className="flex items-center gap-6">
                
                {/* Cluster Select */}
                <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 relative">
                    <span className="text-sm text-gray-400">Cluster:</span>
                    <select
                        className="appearance-none bg-transparent outline-none text-white font-medium pr-5 min-w-[100px] cursor-pointer"
                        value={selectedCluster?.id || ''}
                        onChange={(e) => {
                            if (e.target.value === '') {
                                setSelectedCluster(null);
                            } else {
                                const cl = clusters.find(c => c.id === e.target.value);
                                if (cl) setSelectedCluster(cl);
                            }
                            setSelectedNamespace(null);
                            setSelectedPod(null);
                        }}
                    >
                        <option value="" className="bg-[#1a1a1a] text-white">All Clusters</option>
                        {clusters.map(c => (
                            <option key={c.id} value={c.id} className="bg-[#1a1a1a] text-white">{c.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
                </div>

                {/* Namespace Select */}
                {selectedCluster && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 relative">
                        <span className="text-sm text-gray-400">Namespace:</span>
                        <select
                            className="appearance-none bg-transparent outline-none text-white font-medium pr-5 min-w-[100px] cursor-pointer"
                            value={selectedNamespace?.name || ''}
                            onChange={(e) => {
                                if (e.target.value === '') {
                                    setSelectedNamespace(null);
                                } else {
                                    const ns = selectedCluster.namespaces.find(n => n.name === e.target.value);
                                    if (ns) setSelectedNamespace(ns);
                                }
                                setSelectedPod(null);
                            }}
                        >
                            <option value="" className="bg-[#1a1a1a] text-white">All Namespaces</option>
                            {selectedCluster.namespaces.map(ns => (
                                <option key={ns.name} value={ns.name} className="bg-[#1a1a1a] text-white">{ns.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
                    </div>
                )}

                {/* Pod Select */}
                {selectedNamespace && (
                    <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 relative">
                        <span className="text-sm text-gray-400">Pod:</span>
                        <select
                            className="appearance-none bg-transparent outline-none text-white font-medium pr-5 min-w-[120px] max-w-[200px] cursor-pointer"
                            value={selectedPod?.id || ''}
                            onChange={(e) => {
                                if (e.target.value === '') {
                                    setSelectedPod(null);
                                } else {
                                    const pod = selectedNamespace.pods.find(p => p.id === e.target.value);
                                    if (pod) setSelectedPod(pod);
                                }
                            }}
                        >
                            <option value="" className="bg-[#1a1a1a] text-white">All Pods</option>
                            {selectedNamespace.pods.map(pod => (
                                <option key={pod.id} value={pod.id} className="bg-[#1a1a1a] text-white">{pod.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 pointer-events-none text-gray-400" />
                    </div>
                )}

                <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 text-sm">
                    Last 30 minutes
                    <ChevronDown size={16} />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isConnected ? (
                    <div className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        LIVE
                    </div>
                ) : (
                    <div className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                        CONNECTING
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium">Syam</p>
                        <p className="text-xs text-gray-500">Platform Engineer</p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}