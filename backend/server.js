import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173" }
});

// In-memory data
let clusters = [
  {
    id: "cluster-1",
    name: "prod-us-east-1",
    namespaces: [
      {
        name: "default",
        pods: [
          { id: "p1", name: "api-gateway-7f8d9", cpu: 42, memory: 620, status: "Healthy", logs: [] },
          { id: "p2", name: "auth-service-3x2k", cpu: 88, memory: 890, status: "Warning", logs: [] },
          { id: "p3", name: "payment-worker-9p4m", cpu: 23, memory: 310, status: "Healthy", logs: [] }
        ]
      },
      {
        name: "monitoring",
        pods: [
          { id: "p4", name: "prometheus-1", cpu: 95, memory: 1200, status: "Critical", logs: [] }
        ]
      }
    ]
  },
  {
    id: "cluster-2",
    name: "staging-eu-west-1",
    namespaces: [
      {
        name: "default",
        pods: [
          { id: "p5", name: "web-frontend-4k2m", cpu: 67, memory: 450, status: "Healthy", logs: [] },
          { id: "p6", name: "db-migrations-9q1v", cpu: 12, memory: 180, status: "Healthy", logs: [] }
        ]
      }
    ]
  }
];

let incidents = [];
let prs = [];

// ─── Log templates by severity ───────────────────────────────────────────────
const LOG_TEMPLATES = {
  INFO: [
    "Request processed successfully in {ms}ms",
    "Health check passed",
    "User {id} authenticated via OAuth",
    "Cache hit ratio: {pct}%",
    "Deployment revision {rev} is live",
    "Connected to Redis cluster",
    "Scheduled job completed: {job}",
    "Graceful shutdown signal received, draining connections",
    "Config reload completed successfully",
    "Replica set elected primary: {host}",
  ],
  WARN: [
    "High latency detected: {ms}ms (threshold: 200ms)",
    "Retry attempt {n}/3 for upstream call",
    "Memory usage at {pct}% of limit",
    "Slow DB query detected ({ms}ms): SELECT * FROM events",
    "Rate limit approaching: {n}/1000 req/min",
    "Disk usage at {pct}% — consider expanding PVC",
    "JWT token expiring in {n} minutes",
    "Circuit breaker HALF_OPEN — testing upstream",
    "Connection pool exhausted, queuing request",
    "Readiness probe failed, will retry",
  ],
  ERROR: [
    "Database connection timeout after 30s",
    "Failed to connect to upstream: ECONNREFUSED",
    "Unhandled exception in worker thread: NullPointerException",
    "Authentication service unreachable (503)",
    "Redis WRONGTYPE operation: key type mismatch",
    "HTTP 500: Internal server error on POST /api/checkout",
    "gRPC stream broken: UNAVAILABLE",
    "Permission denied: cannot read secret 'db-credentials'",
    "Pod restart loop detected (restartCount={n})",
    "CrashLoopBackOff: exit code 137",
  ],
  CRITICAL: [
    "OOMKilled - container memory limit exceeded (limit: 512Mi)",
    "Pod evicted due to node memory pressure",
    "CrashLoopBackOff: container failed to start 5 times",
    "Liveness probe failed — killing container",
    "Disk I/O error on /data/db — possible data corruption",
  ]
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const fillTemplate = (tpl) => tpl
  .replace('{ms}', randInt(50, 800))
  .replace('{pct}', randInt(60, 98))
  .replace('{n}', randInt(1, 5))
  .replace('{rev}', `v${randInt(1, 20)}.${randInt(0, 9)}`)
  .replace('{job}', ['cleanup', 'report-gen', 'cache-warm', 'backup'][randInt(0, 3)])
  .replace('{host}', `node-${randInt(1, 4)}`)
  .replace('{id}', `usr_${Math.random().toString(36).slice(2, 8)}`);

const pickLevel = () => {
  const r = Math.random();
  if (r < 0.60) return 'INFO';
  if (r < 0.80) return 'WARN';
  if (r < 0.95) return 'ERROR';
  return 'CRITICAL';
};

const makeLog = (level) => {
  const templates = LOG_TEMPLATES[level];
  return fillTemplate(templates[randInt(0, templates.length - 1)]);
};

// ─── Metrics update every 2.5s ───────────────────────────────────────────────
setInterval(() => {
  clusters.forEach(cluster => {
    cluster.namespaces.forEach(ns => {
      ns.pods.forEach(pod => {
        pod.cpu = Math.floor(Math.random() * 100);
        pod.memory = Math.floor(200 + Math.random() * 1300);
        if (pod.cpu > 90) pod.status = "Critical";
        else if (pod.cpu > 80) pod.status = "Warning";
        else pod.status = "Healthy";
      });
    });
  });
  io.emit("metrics-update", clusters);
}, 2500);

// ─── Log stream: one log per pod per second ───────────────────────────────────
setInterval(() => {
  clusters.forEach(cluster => {
    cluster.namespaces.forEach(ns => {
      ns.pods.forEach(pod => {
        const level = pickLevel();
        const message = makeLog(level);
        const timestamp = new Date().toISOString();
        const logLine = `${timestamp} [${level}] ${pod.name}: ${message}`;

        pod.logs.push(logLine);
        if (pod.logs.length > 100) pod.logs.shift();

        const entry = {
          clusterId: cluster.id,
          clusterName: cluster.name,
          namespace: ns.name,
          podId: pod.id,
          podName: pod.name,
          level,
          message,
          timestamp,
          raw: logLine,
        };
        io.emit("log-stream", entry);

        // Auto-incident detection
        const isOOM = level === 'CRITICAL' && message.includes('OOMKilled');
        const isCrash = level === 'CRITICAL' && message.includes('CrashLoop');
        const isConnRefused = level === 'ERROR' && message.includes('ECONNREFUSED');
        const isEviction = level === 'CRITICAL' && message.includes('evicted');

        if (isOOM || isCrash || isConnRefused || isEviction) {
          const severity = level === 'CRITICAL' ? 'Critical' : 'Warning';
          const rootCause = isOOM
            ? 'Memory limit too low (512Mi) — container OOMKilled'
            : isCrash ? 'Container failed to start — CrashLoopBackOff detected'
            : isConnRefused ? 'Upstream service unreachable — ECONNREFUSED'
            : 'Node memory pressure caused pod eviction';

          const incident = {
            id: "inc-" + Date.now(),
            cluster: cluster.name,
            clusterId: cluster.id,
            namespace: ns.name,
            pod: pod.name,
            podId: pod.id,
            timestamp: new Date().toISOString(),
            severity,
            rootCause,
            triggerLog: logLine,
            logs: pod.logs.slice(-10),
          };
          incidents.unshift(incident);
          if (incidents.length > 100) incidents.pop();
          io.emit("incident", incident);

          if (isOOM || isCrash) {
            const pr = {
              id: "pr-" + Date.now(),
              title: isOOM
                ? `Fix OOM: Increase memory for ${pod.name} from 512Mi → 1Gi`
                : `Fix Crash: Add liveness probe backoff for ${pod.name}`,
              status: "PR Ready",
              pod: pod.name,
              cluster: cluster.name,
              savings: isOOM ? "42% risk reduction" : "Prevents pod restart storm",
            };
            prs.unshift(pr);
            if (prs.length > 50) prs.pop();
            io.emit("pr-update", pr);
          }
        }
      });
    });
  });
}, 1000);

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/clusters', (req, res) => res.json(clusters));
app.get('/incidents', (req, res) => res.json(incidents));
app.get('/prs', (req, res) => res.json(prs));
app.get('/logs/:podId', (req, res) => {
  for (const cluster of clusters) {
    for (const ns of cluster.namespaces) {
      const pod = ns.pods.find(p => p.id === req.params.podId);
      if (pod) return res.json(pod.logs);
    }
  }
  res.status(404).json({ error: 'Pod not found' });
});

app.post('/chat', (req, res) => {
  res.json({
    answer: "Root cause: OOMKilled due to memory pressure. Suggested fix: Increase memory limit to 1Gi and add HPA.",
    suggestions: ["Increase memory limit", "Add HorizontalPodAutoscaler", "Enable cluster autoscaling"]
  });
});

// ─── Socket connection ────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Client connected');
  socket.emit('metrics-update', clusters);
  socket.emit('incidents', incidents);
  socket.emit('prs', prs);

  // Replay recent buffered logs on connect
  clusters.forEach(cluster => {
    cluster.namespaces.forEach(ns => {
      ns.pods.forEach(pod => {
        pod.logs.slice(-20).forEach(raw => {
          const match = raw.match(/\[(INFO|WARN|ERROR|CRITICAL)\]/);
          const level = match ? match[1] : 'INFO';
          socket.emit('log-stream', {
            clusterId: cluster.id,
            clusterName: cluster.name,
            namespace: ns.name,
            podId: pod.id,
            podName: pod.name,
            level,
            message: raw.replace(/^.*\[\w+\]\s\S+:\s/, ''),
            timestamp: raw.substring(0, 24),
            raw,
          });
        });
      });
    });
  });
});

httpServer.listen(3001, () => {
  console.log('🚀 KubeDynatrace Backend running on http://localhost:3001');
});