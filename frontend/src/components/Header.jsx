import { memo } from 'react';
import { User } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const Header = memo(({
    clusters,
    selectedCluster, setSelectedCluster,
    selectedNamespace, setSelectedNamespace,
    selectedPod, setSelectedPod,
    isConnected
}) => {
    return (
        <div className="h-14 md:h-16 lg:h-20 glass-header flex items-center justify-between px-3 md:px-6 lg:px-10 z-40">
            <div className="flex items-center gap-1.5 md:gap-3">

                {/* Cluster Select */}
                <CustomDropdown
                    label="Cluster"
                    options={[
                        { value: '', label: 'All Clusters' },
                        ...clusters.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    value={selectedCluster?.id || ''}
                    onChange={(val) => {
                        if (val === '') {
                            setSelectedCluster(null);
                        } else {
                            const cl = clusters.find(c => c.id === val);
                            if (cl) setSelectedCluster(cl);
                        }
                        setSelectedNamespace(null);
                        setSelectedPod(null);
                    }}
                />

                {/* Namespace Select */}
                {selectedCluster && (
                    <CustomDropdown
                        label="Namespace"
                        options={[
                            { value: '', label: 'All Namespaces' },
                            ...selectedCluster.namespaces.map(ns => ({ value: ns.name, label: ns.name }))
                        ]}
                        value={selectedNamespace?.name || ''}
                        onChange={(val) => {
                            if (val === '') {
                                setSelectedNamespace(null);
                            } else {
                                const ns = selectedCluster.namespaces.find(n => n.name === val);
                                if (ns) setSelectedNamespace(ns);
                            }
                            setSelectedPod(null);
                        }}
                    />
                )}

                {/* Pod Select */}
                {selectedNamespace && (
                    <CustomDropdown
                        label="Pod"
                        options={[
                            { value: '', label: 'All Pods' },
                            ...selectedNamespace.pods.map(pod => ({ value: pod.id, label: pod.name }))
                        ]}
                        value={selectedPod?.id || ''}
                        onChange={(val) => {
                            if (val === '') {
                                setSelectedPod(null);
                            } else {
                                const pod = selectedNamespace.pods.find(p => p.id === val);
                                if (pod) setSelectedPod(pod);
                            }
                        }}
                        className="min-w-[8.75rem] md:min-w-[11.25rem]"
                    />
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                {isConnected ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[0.5625rem] md:text-[0.625rem] font-bold px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-emerald-500/40 shadow-lg"></div>
                        <span className="hidden sm:inline">CONNECTED</span>
                        <span className="sm:hidden">OK</span>
                    </div>
                ) : (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[0.5625rem] md:text-[0.625rem] font-bold px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-rose-500/40 shadow-lg"></div>
                        <span className="hidden sm:inline">DISCONNECTED</span>
                        <span className="sm:hidden">OFF</span>
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-4 pl-3 md:pl-6 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs md:text-sm font-bold text-slate-800">Syamjith</p>
                        <p className="text-[0.5625rem] md:text-[0.625rem] font-bold text-indigo-500 uppercase tracking-wider">Admin Account</p>
                    </div>
                    <div className="w-8 h-8 md:w-11 md:h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 border-2 border-white">
                        <User size={16} className="text-white md:hidden" />
                        <User size={20} className="text-white hidden md:block" />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Header;