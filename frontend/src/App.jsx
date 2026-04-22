import { useState, useEffect, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import { Activity } from 'lucide-react';

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
    const [activePage, setActivePage] = useState('overview');

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

    useEffect(() => {
        const socket = io('http://localhost:3001', { reconnection: true, reconnectionDelay: 1000 });
        socketRef.current = socket;

        const handleNav = (e) => setActivePage(e.detail);
        window.addEventListener('nav-change', handleNav);

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('metrics-update', (data) => {
            setClusters(data);
        });

        socket.on('log-stream', (entry) => {
            setLogStream(prev => {
                const next = [...prev, entry];
                return next.length > 500 ? next.slice(-500) : next;
            });
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

        socket.on('pr-update', (pr) => {
            setPrs(prev => {
                if (prev.find(p => p.id === pr.id)) return prev;
                return [pr, ...prev];
            });
        });

        return () => { socket.removeAllListeners(); socket.disconnect(); };
    }, []);

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
                    <div className="p-4 md:p-6 lg:p-10 grid grid-cols-12 gap-4 md:gap-6 lg:gap-10 auto-rows-max">
                        {/* Metrics Column conceptually split */}
                        <div className="col-span-12">
                            <SummaryCards />
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
                            <OptimizationTimeline prs={prs} />
                        </div>

                        <div className="col-span-12 lg:col-span-4 flex">
                            <div className="glass-card rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 text-center border-white/40 flex flex-col justify-center items-center w-full">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                                    <Activity className="text-indigo-600" size={32} />
                                </div>
                                <p className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Cluster Intel</p>
                                <p className="text-slate-500 mt-4 text-sm font-medium">Monitoring your pods in real-time. Check <span className="text-indigo-600 font-bold">Incidents</span> for auto-remediation.</p>
                                <div onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'prs' }))}
                                    className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
                                >
                                    View Full Analytics
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'incidents':
                return (
                    <div className="h-full flex flex-col p-4 md:p-6 lg:p-10 overflow-hidden">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 tracking-tight mb-4 flex items-center gap-3 flex-shrink-0">
                            Active Incidents
                            <span className="text-rose-500 text-[0.625rem] font-black bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase tracking-widest">LIVE</span>
                        </h1>
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-10 min-h-0">
                            <div className="w-full lg:w-[40%] h-[40%] lg:h-full">
                                <IncidentList
                                    incidents={incidents}
                                    onSelect={setSelectedIncident}
                               Props={{ className: "h-full" }}
                                />
                            </div>
                            <div className="w-full lg:w-[60%] h-[60%] lg:h-full">
                                <IncidentAnalysis 
                                    incident={selectedIncident} 
                                    onUpdateLogs={handleUpdateIncidentLogs}
                                Props={{ className: "h-full" }}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'agents':
                return <AgentsPage clusters={clusters} incidents={incidents} prs={prs} />;
            case 'security':
                return <SecurityPage />;
            case 'observability':
                return <ObservabilityPage
                    logStream={logStream}
                    clusters={clusters}
                    selectedCluster={selectedCluster}
                    selectedNamespace={selectedNamespace}
                    selectedPod={selectedPod}
                />;
            case 'cost':
                return <CostPage prs={prs} />;
            case 'prs':
                return <PRHub prs={prs} />;

            default:
                return <div className="p-12 text-center text-gray-400">Page Coming Soon...</div>;
        }
    };

    return (
        <div className="flex h-screen text-slate-900 overflow-hidden relative">
            <div className="light-mesh" />
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                filteredClusters={filteredClusters}
                selectedCluster={selectedCluster}
                selectedNamespace={selectedNamespace}
                selectedPod={selectedPod}
                isConnected={isConnected}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    clusters={clusters}
                    selectedCluster={selectedCluster}
                    setSelectedCluster={setSelectedCluster}
                    selectedNamespace={selectedNamespace}
                    setSelectedNamespace={setSelectedNamespace}
                    selectedPod={selectedPod}
                    setSelectedPod={setSelectedPod}
                    isConnected={isConnected}
                />

                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}