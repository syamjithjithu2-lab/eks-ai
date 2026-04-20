export default function SecurityPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Security & Compliance</h1>
            <div className="bg-white/5 rounded-3xl p-8 text-center">
                <p className="text-6xl mb-4">🔒</p>
                <p className="text-2xl font-medium">No Critical Vulnerabilities</p>
                <p className="text-gray-400 mt-2">All workloads are compliant with CIS Kubernetes Benchmark</p>
            </div>
        </div>
    );
}