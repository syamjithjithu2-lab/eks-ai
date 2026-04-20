import { BarChart, Bar, ResponsiveContainer } from 'recharts';

export default function ObservabilityPage() {
    const data = Array.from({ length: 20 }, (_, i) => ({
        time: i,
        cpu: Math.floor(Math.random() * 80) + 20,
        memory: Math.floor(Math.random() * 60) + 40
    }));

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Observability Insights</h1>
            <div className="bg-white/5 rounded-3xl p-8">
                <h3 className="font-semibold mb-6">Cluster-wide Metrics (Last 1 Hour)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data}>
                        <Bar dataKey="cpu" fill="#22d3ee" name="CPU %" />
                        <Bar dataKey="memory" fill="#a855f7" name="Memory %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}