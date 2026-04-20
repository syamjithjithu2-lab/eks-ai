export default function IncidentAnalysis({ incident }) {
    if (!incident) {
        return (
            <div className="bg-white/5 rounded-3xl p-8 text-center">
                <p className="text-gray-400">Select an incident to analyze</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 rounded-3xl p-6">
            <h3 className="font-semibold text-lg mb-4">Incident Analysis</h3>

            <div className="space-y-6">
                <div>
                    <p className="text-xs text-gray-400">ROOT CAUSE</p>
                    <p className="font-medium text-orange-400 mt-1">{incident.rootCause}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">AFFECTED POD</p>
                    <p className="font-mono text-sm mt-1">{incident.pod}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-2">RECENT LOGS</p>
                    <div className="bg-black/60 rounded-2xl p-4 text-xs font-mono text-gray-300 max-h-48 overflow-auto">
                        {incident.logs?.slice(-5).map((log, i) => (
                            <div key={i} className="py-0.5">{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}