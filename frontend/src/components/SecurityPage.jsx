import { Shield, Lock, Bell, CheckCircle, ShieldAlert, FileSearch } from 'lucide-react';

export default function SecurityPage() {
    const findings = [
        { title: "Privileged Container Detection", severity: "Low", status: "Resolved", cluster: "prod-us-east-1" },
        { title: "Root User Access Attempt", severity: "High", status: "Blocked", cluster: "staging-eu-west-1" },
        { title: "Unauthorized IP Probe", severity: "Medium", status: "Neutralized", cluster: "dev-ap-south-1" },
    ];

    return (
        <div className="p-10 h-full flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Security</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time threat detection and policy enforcement</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <FileSearch size={18} />
                        Run Deep Scan
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-[3rem] p-12 text-center relative bg-white/60">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Shield size={240} className="text-emerald-500" />
                </div>
                
                <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-lg shadow-emerald-50">
                    <CheckCircle size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Infrastructure Secured</h2>
                <p className="text-slate-600 mt-4 max-w-[500px] mx-auto text-lg font-medium leading-relaxed">
                    No critical vulnerabilities detected. All workloads are currently compliant with <span className="text-indigo-600 font-bold">CIS Kubernetes Benchmarks</span> and internal security policies.
                </p>
                
                <div className="flex justify-center gap-6 mt-10">
                    <div className="bg-white border border-slate-300 py-2.5 px-5 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Vulnerabilities</p>
                        <p className="text-2xl font-black text-slate-900">0</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-300">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Policy Checks</p>
                        <p className="text-2xl font-black text-indigo-600">100%</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-300">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Last Scan</p>
                        <p className="text-2xl font-black text-slate-800">2m ago</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                    Recent Security Findings
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase border border-indigo-100">Last 24h</span>
                </h3>
                <div className="grid grid-cols-3 grid-responsive-3 gap-8">
                    {findings.map((f, i) => (
                        <div key={i} className="glass-card rounded-[2.5rem] p-7 border-white/60 hover:-translate-y-2 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.severity === 'High' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'} border`}>
                                   {f.severity === 'High' ? <ShieldAlert className="text-rose-500" size={24} /> : <Lock className="text-slate-400" size={24} />}
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${f.status === 'Blocked' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                    {f.status}
                                </span>
                            </div>
                            <h4 className="font-black text-slate-800 leading-snug mb-2">{f.title}</h4>
                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{f.cluster}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}