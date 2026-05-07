import { useState, useEffect, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import { Activity, Menu } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import MetricsBar from './components/MetricsBar';
import OptimizationTimeline from './components/OptimizationTimeline';

// Dedicated Pages
import AgentsPage from './components/AgentsPage';
import SecurityPage from './components/SecurityPage';
import ObservabilityPage from './components/ObservabilityPage';
import CostPage from './components/CostPage';
import IncidentList from './components/IncidentList';
import IncidentAnalysis from './components/IncidentAnalysis';
import PRHub from './components/PRHub';



export default function App() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const [activePage, setActivePage] = useState('overview');
    const [navigationIntent, setNavigationIntent] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar state

    const [clusters, setClusters] = useState([]);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [selectedNamespace, setSelectedNamespace] = useState(null);
    const [selectedPod, setSelectedPod] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [prs, setPrs] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [logStream, setLogStream] = useState([]);
    const socketRef = useRef(null);

    const handlePageNavigation = (page, intent = null) => {
        setActivePage(page);
        setNavigationIntent(intent);
    };

    useEffect(() => {
        const socket = io(API_BASE_URL, { reconnection: true, reconnectionDelay: 1000 });
        socketRef.current = socket;

        const handleNav = (e) => setActivePage(e.detail);
        window.addEventListener('nav-change', handleNav);

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('metrics-update', (data) => {
            setClusters(data);
        });

        const logBuffer = [];
        const flushLogs = () => {
            if (logBuffer.length > 0) {
                setLogStream(prev => {
                    const next = [...prev, ...logBuffer];
                    logBuffer.length = 0;
                    return next.length > 300 ? next.slice(-300) : next;
                });
            }
        };
        const logTimer = setInterval(flushLogs, 200); // Flush logs every 200ms

        socket.on('log-stream', (entry) => {
            logBuffer.push(entry);
        });

        socket.on('incidents', (data) => {
            setIncidents(data);
        });

        socket.on('incident', (inc) => {
            setIncidents(prev => {
                const existing = prev.findIndex(p => p.id === inc.id);
                if (existing !== -1) {
                    const next = [...prev];
                    next[existing] = inc;
                    return next;
                }
                return [inc, ...prev];
            });
        });

        socket.on('prs', (data) => {
            setPrs(data);
        });

        socket.on('pr-update', (pr) => {
            setPrs(prev => {
                if (prev.find(p => p.id === pr.id)) return prev;
                return [pr, ...prev];
            });
        });

        return () => { 
            window.removeEventListener('nav-change', handleNav);
            socket.removeAllListeners(); 
            socket.disconnect(); 
            clearInterval(logTimer);
        };
    }, [API_BASE_URL]);

    useEffect(() => {
        if (activePage === 'incidents' && navigationIntent === 'incident-agent' && incidents.length > 0) {
            setSelectedIncident(prev => prev || incidents[0]);
        }
    }, [activePage, navigationIntent, incidents]);

    const handleUpdateIncidentLogs = (incidentId, newLogs) => {
        setIncidents(prev => prev.map(inc => 
            inc.id === incidentId ? { ...inc, logs: newLogs } : inc
        ));
        
        // Also update selectedIncident if it matches to sync the UI
        setSelectedIncident(prev => {
            if (prev && prev.id === incidentId) {
                return { ...prev, logs: newLogs };
            }
            return prev;
        });
    };

    // Memoized filtered data to prevent unnecessary re-renders on socket updates
    const filteredClusters = useMemo(() => {
        let result = clusters;
        if (selectedCluster) {
            result = clusters.filter(c => c.id === selectedCluster.id);
            if (selectedNamespace) {
                result = result.map(c => ({
                    ...c,
                    namespaces: c.namespaces.filter(ns => ns.name === selectedNamespace.name)
                }));
                if (selectedPod) {
                    result = result.map(c => ({
                        ...c,
                        namespaces: c.namespaces.map(ns => ({
                            ...ns,
                            pods: ns.pods.filter(p => p.id === selectedPod.id)
                        }))
                    }));
                }
            }
        }
        return result;
    }, [clusters, selectedCluster, selectedNamespace, selectedPod]);

    const renderPage = () => {
        switch (activePage) {
            case 'overview':
                return (
                    <div className="overview-grid p-4 md:p-6 lg:p-10 grid grid-cols-12 gap-4 md:gap-6 lg:gap-10 auto-rows-max">
                        {/* Metrics Column conceptually split */}
                        <div className="col-span-12">
                            <SummaryCards incidents={incidents} prs={prs} clusters={filteredClusters} />
                        </div>

                        <div className="col-span-12">
                            <MetricsBar
                                filteredClusters={filteredClusters}
                                selectedCluster={selectedCluster}
                                selectedNamespace={selectedNamespace}
                                selectedPod={selectedPod}
                            />
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <OptimizationTimeline prs={prs} setActivePage={handlePageNavigation} />
                        </div>

                        <div className="col-span-12 lg:col-span-4 flex">
                            <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-8 border-white/40 flex flex-col w-full overflow-hidden">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                                            <Activity className="text-rose-600" size={17} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">Active Alerts</p>
                                            <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">Live incidents</p>
                                        </div>
                                    </div>
                                    {incidents.length > 0 && (
                                        <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                            <span className="text-[0.55rem] font-black text-rose-600 uppercase tracking-widest">{incidents.length}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3 overflow-auto custom-scrollbar">
                                    {incidents.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                                            <span className="text-3xl mb-3">🛡️</span>
                                            <p className="text-sm font-black text-slate-700">All Clear</p>
                                            <p className="text-xs text-slate-400 mt-1">No active incidents</p>
                                        </div>
                                    ) : (
                                        incidents.slice(0, 5).map((inc, i) => (
                                            <div
                                                key={inc.id || i}
                                                onClick={() => handlePageNavigation('incidents')}
                                                className="flex items-start gap-3 p-3 bg-white/70 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-rose-100 hover:shadow-sm transition-all group"
                                            >
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${inc.severity === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-800 truncate group-hover:text-rose-700 transition-colors">{inc.pod}</p>
                                                    <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{inc.cluster}</p>
                                                </div>
                                                <span className={`ml-auto text-[0.5rem] font-black px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                                    inc.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>{inc.severity}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button
                                    onClick={() => handlePageNavigation('incidents')}
                                    className="mt-4 w-full text-[0.625rem] font-black text-indigo-600 uppercase tracking-widest py-2.5 border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all"
                                >
                                    View All Incidents →
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'incidents':
                return (
                    <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden">
                        <div className="mb-6 flex-shrink-0">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                                Incidents
                                <span className="text-[0.625rem] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100 uppercase tracking-[0.2em]">Live Analysis</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm mt-1">Real-time root cause detection & remediation</p>
                            {navigationIntent === 'incident-agent' && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl px-3 py-2 text-[0.65rem] font-black uppercase tracking-wider">
                                    Guided flow active: incident auto-selected, click "Initiate AI Root Cause Analysis"
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-8 min-h-0">
                            <div className="w-full lg:w-[35%] h-[40%] lg:h-full">
                                <IncidentList
                                    incidents={incidents}
                                    onSelect={setSelectedIncident}
                                />
                            </div>
                            <div className="w-full lg:w-[65%] h-[60%] lg:h-full">
                                <IncidentAnalysis 
                                    incident={selectedIncident} 
                                    onUpdateLogs={handleUpdateIncidentLogs}
                                    autoOpenAnalyzePrompt={navigationIntent === 'incident-agent'}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'agents':
                return <AgentsPage clusters={clusters} incidents={incidents} prs={prs} setActivePage={handlePageNavigation} />;
            case 'security':
                return <SecurityPage clusters={clusters} />;
            case 'observability':
                return <ObservabilityPage
                    logStream={logStream}
                    clusters={clusters}
                    selectedCluster={selectedCluster}
                    selectedNamespace={selectedNamespace}
                    selectedPod={selectedPod}
                />;
            case 'cost':
                return <CostPage prs={prs} clusters={clusters} autoGuideRun={navigationIntent === 'cost-agent'} />;
            case 'prs':
                return <PRHub prs={prs} />;

            default:
                return <div className="p-12 text-center text-gray-400">Page Coming Soon...</div>;
        }
    };

    return (
        <div className="flex h-screen h-[100dvh] text-slate-900 overflow-hidden relative">
            <div className="light-mesh pointer-events-none" />

            <Sidebar
                activePage={activePage}
                setActivePage={handlePageNavigation}
                filteredClusters={filteredClusters}
                selectedCluster={selectedCluster}
                selectedNamespace={selectedNamespace}
                selectedPod={selectedPod}
                isConnected={isConnected}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(v => !v)}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header
                    clusters={clusters}
                    selectedCluster={selectedCluster}
                    setSelectedCluster={setSelectedCluster}
                    selectedNamespace={selectedNamespace}
                    setSelectedNamespace={setSelectedNamespace}
                    selectedPod={selectedPod}
                    setSelectedPod={setSelectedPod}
                    isConnected={isConnected}
                    onMenuClick={() => setSidebarOpen(true)}
                    incidents={incidents}
                    setActivePage={handlePageNavigation}
                />

                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar bg-transparent">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}