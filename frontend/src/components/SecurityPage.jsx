import { memo } from 'react';
import { Shield, Lock, Bell, CheckCircle, ShieldAlert, FileSearch } from 'lucide-react';

const SecurityPage = memo(() => {
    const findings = [
        { title: "Privileged Container Detection", severity: "Low", status: "Resolved", cluster: "prod-us-east-1" },
        { title: "Root User Access Attempt", severity: "High", status: "Blocked", cluster: "staging-eu-west-1" },
        { title: "Unauthorized IP Probe", severity: "Medium", status: "Neutralized", cluster: "dev-ap-south-1" },
    ];

    return (
        <div className="p-8 h-full flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Security</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Real-time threat detection and policy enforcement</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <FileSearch size={16} />
                        Deep Scan
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] p-10 text-center relative bg-white/60">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Shield size={180} className="text-emerald-500" />
                </div>
                
                <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-lg shadow-emerald-50">
                    <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Infrastructure Secured</h2>
                <p className="text-slate-600 mt-3 max-w-lg mx-auto text-base font-medium leading-relaxed">
                    No critical vulnerabilities detected. All workloads are currently compliant with <span className="text-indigo-600 font-bold">CIS Kubernetes Benchmarks</span>.
                </p>
                
                <div className="flex justify-center gap-4 mt-8">
                    <div className="bg-white border border-slate-200 py-3 px-6 rounded-2xl shadow-sm">
                        <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1">Vulnerabilities</p>
                        <p className="text-xl font-black text-slate-900">0</p>
                    </div>
                    <div className="bg-white border border-slate-200 py-3 px-6 rounded-2xl shadow-sm">
                        <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1">Compliance</p>
                        <p className="text-xl font-black text-indigo-600">100%</p>
                    </div>
                    <div className="bg-white border border-slate-200 py-3 px-6 rounded-2xl shadow-sm">
                        <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-1">Last Scan</p>
                        <p className="text-xl font-black text-slate-800">2m ago</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                    Recent Security Findings
                    <span className="text-[0.5625rem] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase border border-indigo-100 tracking-wider">Last 24h</span>
                </h3>
                <div className="grid grid-cols-3 grid-responsive-3 gap-8">
                    {findings.map((f, i) => (
                        <div key={i} className="glass-card rounded-[2rem] p-6 border-white/60 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.severity === 'High' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'} border`}>
                                   {f.severity === 'High' ? <ShieldAlert className="text-rose-500" size={20} /> : <Lock className="text-slate-400" size={20} />}
                                </div>
                                <span className={`text-[0.5625rem] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${f.status === 'Blocked' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                    {f.status}
                                </span>
                            </div>
                            <h4 className="font-black text-slate-800 leading-snug mb-2 text-sm">{f.title}</h4>
                            <p className="text-[0.5625rem] font-bold text-slate-500 uppercase tracking-widest">{f.cluster}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default SecurityPage;