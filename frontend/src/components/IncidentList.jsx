export default function IncidentList({ incidents, onSelect }) {
    return (
        <div className="bg-white/5 rounded-3xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>Active Incidents</span>
                <span className="text-red-500 text-sm">LIVE</span>
            </h3>

            <div className="space-y-3">
                {incidents.length === 0 ? (
                    <p className="text-gray-500 py-8 text-center">No incidents yet. Simulation running...</p>
                ) : (
                    incidents.slice(0, 6).map((inc, i) => (
                        <div
                            key={i}
                            onClick={() => onSelect(inc)}
                            className="bg-black/40 hover:bg-white/5 p-4 rounded-2xl cursor-pointer transition-all flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium">{inc.pod}</p>
                                <p className="text-sm text-gray-400">{inc.cluster} • {inc.namespace}</p>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">Critical</span>
                                <p className="text-xs text-gray-500 mt-1">{new Date(inc.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}