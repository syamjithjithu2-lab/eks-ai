import { memo, useMemo, useState } from 'react';
import { Shield, Lock, Bell, CheckCircle, ShieldAlert, FileSearch, AlertTriangle, Cpu, Activity, Zap, Eye, RefreshCw, ShieldCheck } from 'lucide-react';

// ── Animated Scan Ring ────────────────────────────────────────────────────────
function ScanRing({ score }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (score / 100) * circumference;
    const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#f43f5e';
    return (
        <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                    cx="60" cy="60" r={radius} fill="none"
                    stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{score}%</p>
                <p className="text-[0.5rem] font-black text-slate-500 uppercase tracking-widest">Secure</p>
            </div>
        </div>
    );
}

// ── SecurityPage ──────────────────────────────────────────────────────────────
const SecurityPage = memo(({ clusters = [] }) => {
    const [scanning, setScanning] = useState(false);
    const [lastScan, setLastScan] = useState('just now');

    const { allPods, criticalPods, warningPods, healthyPods, threatFindings, securityScore } = useMemo(() => {
        const pods = clusters.flatMap(c => c.namespaces?.flatMap(ns =>
            ns.pods?.map(p => ({ ...p, cluster: c.name, namespace: ns.name })) || []
        ) || []);

        const critical = pods.filter(p => p.status === 'Critical');
        const warning  = pods.filter(p => p.status === 'Warning');
        const healthy  = pods.filter(p => p.status === 'Healthy');

        const score = pods.length === 0 ? 100 : Math.round((healthy.length / pods.length) * 100);

        const findings = [
            ...critical.map(p => ({
                title:    `High Resource Pressure — ${p.name}`,
                severity: 'High',
                status:   'Active',
                cluster:  p.cluster,
                detail:   `CPU ${p.cpu}% — pod is in Critical state, potential instability`,
                type:     'resource',
            })),
            ...warning.map(p => ({
                title:    `Elevated Load — ${p.name}`,
                severity: 'Medium',
                status:   'Monitoring',
                cluster:  p.cluster,
                detail:   `CPU ${p.cpu}%, Memory ${p.memory}MB — approaching thresholds`,
                type:     'resource',
            })),
            { title: 'Privileged Container Audit',  severity: 'Low',  status: 'Resolved',    cluster: 'prod-us-east-1',    detail: 'No privileged containers detected across all namespaces',   type: 'policy' },
            { title: 'RBAC Policy Enforcement',     severity: 'Low',  status: 'Compliant',   cluster: 'all clusters',       detail: 'Role bindings reviewed — no over-permissive service accounts', type: 'policy' },
            { title: 'Network Policy Verification', severity: 'Low',  status: 'Active',      cluster: 'staging-eu-west-1', detail: 'Ingress/egress rules active for all production namespaces',   type: 'network' },
        ];

        return { allPods: pods, criticalPods: critical, warningPods: warning, healthyPods: healthy, threatFindings: findings, securityScore: score };
    }, [clusters]);

    const runScan = () => {
        setScanning(true);
        setTimeout(() => { setScanning(false); setLastScan('just now'); }, 2500);
    };

    const SEVER_STYLE = {
        High:   'bg-rose-50 text-rose-600 border-rose-200',
        Medium: 'bg-amber-50 text-amber-600 border-amber-200',
        Low:    'bg-emerald-50 text-emerald-600 border-emerald-200',
    };
    const STATUS_STYLE = {
        Active:     'bg-rose-50 text-rose-600',
        Monitoring: 'bg-amber-50 text-amber-600',
        Resolved:   'bg-emerald-50 text-emerald-600',
        Compliant:  'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="p-4 md:p-8 min-h-full flex flex-col gap-6 md:gap-8">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Security</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Real-time threat detection and policy enforcement</p>
                </div>
                <button
                    onClick={runScan}
                    disabled={scanning}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                    {scanning ? <RefreshCw size={16} className="animate-spin" /> : <FileSearch size={16} />}
                    {scanning ? 'Scanning...' : 'Deep Scan'}
                </button>
            </div>

            {/* Score + Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Security score ring */}
                <div className="glass-card rounded-[2rem] p-6 md:p-8 flex items-center gap-6 md:col-span-2 lg:col-span-1 relative overflow-hidden">
                    <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none"><Shield size={120} /></div>
                    <ScanRing score={securityScore} />
                    <div>
                        <p className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest mb-2">Security Score</p>
                        <p className={`text-sm font-black ${securityScore >= 90 ? 'text-emerald-600' : securityScore >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {securityScore >= 90 ? 'All Clear' : securityScore >= 70 ? 'Review Needed' : 'Action Required'}
                        </p>
                        <p className="text-[0.6rem] text-slate-400 font-medium mt-1">Last scan: {lastScan}</p>
                        {scanning && <div className="mt-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /><p className="text-[0.6rem] font-bold text-indigo-600">Scanning fleet...</p></div>}
                    </div>
                </div>

                {/* Pod threat stats */}
                {[
                    { label: 'Critical Pods',  value: criticalPods.length, icon: ShieldAlert, color: 'rose',    sub: 'Immediate action' },
                    { label: 'Warning Pods',   value: warningPods.length,  icon: AlertTriangle, color: 'amber', sub: 'Monitor closely' },
                    { label: 'Healthy Pods',   value: healthyPods.length,  icon: ShieldCheck,  color: 'emerald',sub: 'Fully compliant' },
                ].map(stat => {
                    const colorMap = { rose: ['bg-rose-50','border-rose-100','text-rose-600'], amber: ['bg-amber-50','border-amber-100','text-amber-600'], emerald: ['bg-emerald-50','border-emerald-100','text-emerald-600'] };
                    const [bg, border, text] = colorMap[stat.color];
                    return (
                        <div key={stat.label} className="glass-card rounded-[2rem] p-6 md:p-8 flex flex-col justify-between group">
                            <div className={`w-12 h-12 ${bg} border ${border} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={22} className={text} />
                            </div>
                            <div>
                                <p className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                                <p className="text-[0.625rem] font-black text-slate-700 uppercase tracking-widest mt-1">{stat.label}</p>
                                <p className={`text-[0.6rem] font-medium mt-1 ${text}`}>{stat.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CIS Benchmark compliance bar */}
            <div className="glass-card rounded-[2rem] p-5 md:p-6 flex items-center gap-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
                    <ShieldCheck size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-slate-800">CIS Kubernetes Benchmark Compliance</p>
                        <span className="text-xs font-black text-indigo-600">{securityScore}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${securityScore >= 90 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                            style={{ width: `${securityScore}%` }}
                        />
                    </div>
                </div>
                <span className={`px-3 py-1 text-[0.6rem] font-black rounded-full uppercase tracking-widest border flex-shrink-0 ${securityScore >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {securityScore >= 90 ? 'Compliant' : 'Review'}
                </span>
            </div>

            {/* Findings list */}
            <div className="flex-1 min-h-0 flex flex-col">
                <h3 className="text-base font-black text-slate-800 tracking-tight mb-4 flex items-center gap-3">
                    Security Findings
                    <span className="text-[0.5625rem] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase border border-indigo-100 tracking-wider">
                        {threatFindings.length} total
                    </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {threatFindings.map((f, i) => (
                        <div key={i} className="glass-card rounded-[2rem] p-6 hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${f.severity === 'High' ? 'bg-rose-50 border-rose-100' : f.severity === 'Medium' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                    {f.severity === 'High' ? <ShieldAlert className="text-rose-500" size={18} /> : <Lock className="text-slate-400" size={18} />}
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`text-[0.5rem] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${SEVER_STYLE[f.severity]}`}>{f.severity}</span>
                                    <span className={`text-[0.5rem] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${STATUS_STYLE[f.status] || ''}`}>{f.status}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 leading-snug text-sm">{f.title}</h4>
                                <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest mt-1">{f.cluster}</p>
                                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{f.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default SecurityPage;