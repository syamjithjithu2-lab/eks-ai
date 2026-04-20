export default function AgentsPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Agents</h1>
            <div className="grid grid-cols-3 gap-6">
                {["prod-us-east-1", "staging-eu-west-1", "dev-ap-south-1"].map((agent, i) => (
                    <div key={i} className="bg-white/5 rounded-3xl p-6">
                        <div className="flex justify-between">
                            <h3 className="font-semibold">{agent}</h3>
                            <span className="text-emerald-400 text-sm">Connected</span>
                        </div>
                        <p className="text-5xl font-bold mt-6">1.2s</p>
                        <p className="text-gray-400">Avg Response Time</p>
                    </div>
                ))}
            </div>
        </div>
    );
}