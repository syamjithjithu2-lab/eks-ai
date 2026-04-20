export default function SummaryCards() {
    const cards = [
        { title: "Resource Optimizer", value: "87%", status: "Good", color: "emerald" },
        { title: "Incident Response", value: "3", status: "Active", color: "amber" },
        { title: "Security & Compliance", value: "98%", status: "Compliant", color: "emerald" },
        { title: "Observability Insights", value: "94%", status: "Excellent", color: "cyan" },
        { title: "Cost Optimization", value: "$2.4k", status: "Saving", color: "emerald" },
    ];

    return (
        <div className="grid grid-cols-5 gap-4 px-8 pt-6">
            {cards.map((card, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-5 card">
                    <p className="text-sm text-gray-400">{card.title}</p>
                    <p className="text-4xl font-semibold mt-3">{card.value}</p>
                    <p className={`text-sm mt-2 text-${card.color}-400`}>{card.status}</p>
                </div>
            ))}
        </div>
    );
}