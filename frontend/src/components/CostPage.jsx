export default function CostPage({ prs }) {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Cost Optimization</h1>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-3xl p-8">
                    <p className="text-emerald-400 text-6xl font-bold">$1,284</p>
                    <p className="text-xl mt-2">Projected Monthly Savings</p>
                </div>
                <div className="bg-white/5 rounded-3xl p-8">
                    <p className="text-2xl font-medium">Latest Recommendations</p>
                    {prs.length > 0 ? (
                        <p className="mt-6 text-emerald-400">{prs[0].title}</p>
                    ) : (
                        <p className="text-gray-400 mt-6">No recommendations yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}