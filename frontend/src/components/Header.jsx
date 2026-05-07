import { memo, useState } from 'react';
import { Menu, Bell, AlertTriangle, X, Activity } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const Header = memo(({
    clusters,
    selectedCluster, setSelectedCluster,
    selectedNamespace, setSelectedNamespace,
    selectedPod, setSelectedPod,
    isConnected,
    onMenuClick,
    incidents = [],
    setActivePage,
}) => {
    const [notifOpen, setNotifOpen] = useState(false);

    // Only surface Critical incidents in the bell
    const criticalIncidents = incidents.filter(i => i.severity === 'Critical').slice(0, 5);
    const hasUnread = criticalIncidents.length > 0;

    return (
        <div className="h-14 md:h-16 lg:h-20 glass-header flex items-center justify-between px-3 md:px-6 lg:px-10 z-40 flex-shrink-0 relative">
            <div className="flex items-center gap-1.5 md:gap-3">
                {/* Mobile hamburger */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all duration-200 mr-1 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Open navigation menu"
                >
                    <Menu size={20} className="text-slate-600" />
                </button>

                <CustomDropdown
                    label="Cluster"
                    options={[
                        { value: '', label: 'All Clusters' },
                        ...clusters.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    value={selectedCluster?.id || ''}
                    onChange={(val) => {
                        if (val === '') { setSelectedCluster(null); }
                        else { const cl = clusters.find(c => c.id === val); if (cl) setSelectedCluster(cl); }
                        setSelectedNamespace(null); setSelectedPod(null);
                    }}
                />

                {selectedCluster && (
                    <CustomDropdown
                        label="Namespace"
                        options={[{ value: '', label: 'All Namespaces' }, ...selectedCluster.namespaces.map(ns => ({ value: ns.name, label: ns.name }))]}
                        value={selectedNamespace?.name || ''}
                        onChange={(val) => {
                            if (val === '') { setSelectedNamespace(null); }
                            else { const ns = selectedCluster.namespaces.find(n => n.name === val); if (ns) setSelectedNamespace(ns); }
                            setSelectedPod(null);
                        }}
                    />
                )}

                {selectedNamespace && (
                    <CustomDropdown
                        label="Pod"
                        options={[{ value: '', label: 'All Pods' }, ...selectedNamespace.pods.map(pod => ({ value: pod.id, label: pod.name }))]}
                        value={selectedPod?.id || ''}
                        onChange={(val) => {
                            if (val === '') setSelectedPod(null);
                            else { const pod = selectedNamespace.pods.find(p => p.id === val); if (pod) setSelectedPod(pod); }
                        }}
                        className="min-w-[8.75rem] md:min-w-[11.25rem]"
                    />
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
                {/* Connection status */}
                <div className={`flex items-center gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[0.5625rem] md:text-[0.625rem] font-bold uppercase tracking-widest shadow-sm border transition-all duration-300 ${
                    isConnected 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'} shadow-lg`} />
                    <span className="hidden sm:inline">{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                    <span className="sm:hidden">{isConnected ? 'OK' : 'OFF'}</span>
                </div>

                {/* ── Notification Bell ── */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(v => !v)}
                        className={`relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl md:rounded-2xl border shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            notifOpen 
                                ? 'bg-indigo-50 border-indigo-300' 
                                : 'bg-white/80 border-slate-200 hover:bg-slate-50'
                        }`}
                        aria-label={`Notifications ${hasUnread ? `(${criticalIncidents.length} unread)` : '(no new)'}`}
                        aria-expanded={notifOpen}
                    >
                        <Bell size={17} className={`transition-colors duration-200 ${hasUnread ? 'text-rose-600' : 'text-slate-500'}`} />
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[0.45rem] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse">
                                {criticalIncidents.length}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} aria-label="Close notifications" />
                            <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-[1.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                        <Bell size={16} className="text-indigo-600" />
                                        Notifications
                                    </h3>
                                    <button 
                                        onClick={() => setNotifOpen(false)} 
                                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        aria-label="Close notifications"
                                    >
                                        <X size={13} className="text-slate-500" />
                                    </button>
                                </div>
                                {criticalIncidents.length === 0 ? (
                                    <div className="px-5 py-8 text-center">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                                            <Activity size={18} className="text-emerald-500" />
                                        </div>
                                        <p className="text-sm font-black text-slate-700">All Clear</p>
                                        <p className="text-xs text-slate-400 mt-1">No critical incidents right now.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar">
                                        {criticalIncidents.map((inc, i) => (
                                            <button
                                                key={inc.id || i}
                                                onClick={() => { setActivePage?.('incidents'); setNotifOpen(false); }}
                                                className="w-full flex items-start gap-3 px-5 py-4 hover:bg-rose-50/60 transition-all duration-200 text-left group focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
                                            >
                                                <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 flex-shrink-0 mt-0.5">
                                                    <AlertTriangle size={14} className="text-rose-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-800 group-hover:text-rose-700 transition-colors truncate">{inc.pod}</p>
                                                    <p className="text-[0.6rem] text-slate-500 font-medium mt-0.5">{inc.cluster} · {inc.namespace}</p>
                                                    <p className="text-[0.55rem] text-rose-500 font-black uppercase tracking-widest mt-1">Critical · Click to investigate →</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {criticalIncidents.length > 0 && (
                                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                                        <button
                                            onClick={() => { setActivePage?.('incidents'); setNotifOpen(false); }}
                                            className="w-full text-[0.625rem] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            View all incidents →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default Header;