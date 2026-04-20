import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

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

        socket.on('incident', (inc) => setIncidents(prev => [inc, ...prev]));
        socket.on('pr-update', (pr) => setPrs(prev => [pr, ...prev]));

        return () => { socket.removeAllListeners(); socket.disconnect(); };
    }, []);

    // Compute the filtered data slice based on selections
    let filteredClusters = clusters;
    if (selectedCluster) {
        filteredClusters = clusters.filter(c => c.id === selectedCluster.id);
        if (selectedNamespace) {
            filteredClusters = filteredClusters.map(c => ({
                ...c,
                namespaces: c.namespaces.filter(ns => ns.name === selectedNamespace.name)
            }));
            if (selectedPod) {
                filteredClusters = filteredClusters.map(c => ({
                    ...c,
                    namespaces: c.namespaces.map(ns => ({
                        ...ns,
                        pods: ns.pods.filter(p => p.id === selectedPod.id)
                    }))
                }));
            }
        }
    }

    const renderPage = () => {
        switch (activePage) {
            case 'overview':
                return (
                    <>
                        <SummaryCards />
                        <div className="p-6 space-y-8">
                            <MetricsBar 
                                filteredClusters={filteredClusters} 
                                selectedCluster={selectedCluster}
                                selectedNamespace={selectedNamespace}
                                selectedPod={selectedPod}
                            />
                            <OptimizationTimeline prs={prs} />

                            {/* Clean message instead of incidents on overview */}
                            <div className="bg-white/5 rounded-3xl p-10 text-center">
                                <p className="text-2xl text-gray-400">Monitor your Kubernetes clusters in real-time</p>
                                <p className="text-gray-500 mt-3">Go to <span className="text-cyan-400">Incidents</span> tab for live issues and auto-remediation</p>
                            </div>
                        </div>
                    </>
                );

            case 'incidents':
                return (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                            All Incidents
                            <span className="text-red-500 text-sm bg-red-500/20 px-3 py-1 rounded-full">LIVE</span>
                        </h1>
                        <div className="flex gap-8">
                            <div className="w-5/12">
                                <IncidentList
                                    incidents={incidents}
                                    onSelect={setSelectedIncident}
                                />
                            </div>
                            <div className="w-7/12">
                                <IncidentAnalysis incident={selectedIncident} />
                            </div>
                        </div>
                    </div>
                );

            case 'agents':
                return <AgentsPage />;
            case 'security':
                return <SecurityPage />;
            case 'observability':
                return <ObservabilityPage />;
            case 'cost':
                return <CostPage prs={prs} />;

            default:
                return <div className="p-12 text-center text-gray-400">Page Coming Soon...</div>;
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
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

                <div className="flex-1 overflow-auto bg-[#0a0a0a]">
                    {renderPage()}
                </div>
            </div>
        </div>
    );
}