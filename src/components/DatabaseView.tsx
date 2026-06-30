import { useState } from 'react';
import GlassCard from './GlassCard';
import { CheckCircle, Database, Eye, EyeOff, Network, RefreshCw, Server, User, XCircle } from 'lucide-react';

const mysqlConnectionDefaults = {
  connectionName: import.meta.env.VITE_MYSQL_CONNECTION_NAME || 'tracker',
  databaseName: import.meta.env.VITE_MYSQL_DATABASE || '',
  username: import.meta.env.VITE_MYSQL_USER || 'root',
  host: import.meta.env.VITE_MYSQL_HOST || '127.0.0.1:3306',
  password: import.meta.env.VITE_MYSQL_PASSWORD || '',
};

type DatabaseStatus = {
  connected: boolean;
  message: string;
  serverVersion?: string;
  database?: string;
  checkedAt?: string;
};

const splitHostAndPort = (value: string) => {
  const [hostname, portValue] = value.split(':');
  return {
    hostname: hostname || '127.0.0.1',
    port: Number(portValue || 3306),
  };
};

export default function DatabaseView() {
  const [connectionName, setConnectionName] = useState(mysqlConnectionDefaults.connectionName);
  const [databaseName, setDatabaseName] = useState(mysqlConnectionDefaults.databaseName);
  const [username, setUsername] = useState(mysqlConnectionDefaults.username);
  const [host, setHost] = useState(mysqlConnectionDefaults.host);
  const [password, setPassword] = useState(mysqlConnectionDefaults.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus | null>(null);

  const checkConnection = async () => {
    const { hostname, port } = splitHostAndPort(host);
    setIsChecking(true);
    setStatus(null);

    try {
      const response = await fetch('/api/database/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: hostname,
          port,
          user: username,
          password,
          database: databaseName,
        }),
      });

      const result = await response.json();
      setStatus(result);
    } catch (error) {
      setStatus({
        connected: false,
        message: error instanceof Error ? error.message : 'Unable to reach the database status endpoint.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6" id="db-view-wrapper">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white font-sans">
            DATABASE STATUS
            <span className="rounded-full border border-blue-500/30 bg-blue-500/5 px-2 py-0.5 font-mono text-sm text-blue-400">
              MYSQL
            </span>
          </h2>
          <p className="mt-1 font-mono text-xs tracking-widest text-slate-400">
            CHECK WHETHER THIS APP CAN AUTHENTICATE WITH YOUR MYSQL SERVER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <GlassCard borderAccent className="p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-blue-300">Connection Details</h3>
              <p className="mt-1 text-xs text-slate-500">Used only for the status check.</p>
            </div>
            <Database className="h-5 w-5 text-blue-400" />
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Connection Name</span>
              <input
                type="text"
                value={connectionName}
                onChange={(event) => setConnectionName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-blue-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Database Name</span>
              <input
                type="text"
                value={databaseName}
                onChange={(event) => setDatabaseName(event.target.value)}
                placeholder="Optional; blank checks server login"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-blue-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-blue-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Host / Port</span>
              <input
                type="text"
                value={host}
                onChange={(event) => setHost(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-blue-400/60"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Password</span>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/40 focus-within:border-blue-400/60">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-mono text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="border-l border-white/10 px-3 text-slate-400 transition-colors hover:text-white cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
              {isChecking ? 'Checking Connection' : 'Check Database Connection'}
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-3">
          <div className="flex h-full min-h-[420px] flex-col justify-center">
            {!status && !isChecking && (
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10">
                  <Server className="h-9 w-9 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Ready to check MySQL</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Click the button to verify the app can reach MySQL and authenticate with the configured credentials.
                </p>
              </div>
            )}

            {isChecking && (
              <div className="mx-auto max-w-md text-center">
                <RefreshCw className="mx-auto mb-5 h-12 w-12 animate-spin text-blue-300" />
                <h3 className="text-xl font-semibold text-white">Checking database connection...</h3>
                <p className="mt-2 text-sm text-slate-400">Testing host reachability and MySQL authentication.</p>
              </div>
            )}

            {status && !isChecking && (
              <div className="mx-auto w-full max-w-xl">
                <div
                  className={`rounded-3xl border p-6 ${
                    status.connected
                      ? 'border-emerald-400/30 bg-emerald-500/10'
                      : 'border-red-400/30 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-2xl p-3 ${
                        status.connected ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'
                      }`}
                    >
                      {status.connected ? <CheckCircle className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-mono text-xs font-bold uppercase tracking-widest ${status.connected ? 'text-emerald-300' : 'text-red-300'}`}>
                        {status.connected ? 'Connected' : 'Not Connected'}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{status.message}</h3>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 font-mono text-xs text-slate-300 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <Database className="h-3.5 w-3.5" />
                        DATABASE
                      </div>
                      <p className="text-white">{status.database || databaseName || 'Server login only'}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <Network className="h-3.5 w-3.5" />
                        HOST
                      </div>
                      <p className="text-white">{host}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <User className="h-3.5 w-3.5" />
                        USER
                      </div>
                      <p className="text-white">{username}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <Server className="h-3.5 w-3.5" />
                        SERVER
                      </div>
                      <p className="truncate text-white">{status.serverVersion || 'Unavailable'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
