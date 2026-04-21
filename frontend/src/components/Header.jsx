import { User } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function Header({
    clusters,
    selectedCluster, setSelectedCluster,
    selectedNamespace, setSelectedNamespace,
    selectedPod, setSelectedPod,
    isConnected
}) {
    return (
        <div className="h-20 glass-header flex items-center justify-between px-4 md:px-8 lg:px-10 z-40">
            <div className="flex items-center gap-2 md:gap-4">

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
                        className="min-w-[180px]"
                    />
                )}
            </div>

            <div className="flex items-center gap-6">
                {isConnected ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm shadow-emerald-50">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        CONNECTED
                    </div>
                ) : (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm shadow-rose-50">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                        DISCONNECTED
                    </div>
                )}

                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">Syamjith</p>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Admin Account</p>
                    </div>
                    <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 border-2 border-white">
                        <User size={20} className="text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}