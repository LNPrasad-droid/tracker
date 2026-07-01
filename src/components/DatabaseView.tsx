import { useState } from 'react';
import GlassCard from './GlassCard';
import { CheckCircle, Database, Network, RefreshCw, Server, XCircle } from 'lucide-react';
import { leoApi } from '../services/leoApi';

type DatabaseViewProps = {
  syncStatus: 'loading' | 'online' | 'offline' | 'saving';
};

type DatabaseStatus = {
  connected: boolean;
  message: string;
  database?: string;
  checkedAt?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'same-origin';
const databaseLabel = import.meta.env.VITE_DATABASE_LABEL || 'Configured MySQL';

export default function DatabaseView({ syncStatus }: DatabaseViewProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setStatus(null);

    try {
      const result = await leoApi.getHealth();
      setStatus({
        connected: result.ok,
        message: result.ok ? 'FastAPI can reach the shared MySQL database.' : 'FastAPI health check failed.',
        database: result.database,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      setStatus({
        connected: false,
        message: error instanceof Error ? error.message : 'Unable to reach the FastAPI health endpoint.',
        checkedAt: new Date().toISOString(),
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
            VERIFY FASTAPI, SQLALCHEMY, AND THE SHARED MYSQL STATE STORE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <GlassCard borderAccent className="p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-blue-300">Connection Details</h3>
              <p className="mt-1 text-xs text-slate-500">Credentials live only on the FastAPI server.</p>
            </div>
            <Database className="h-5 w-5 text-blue-400" />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">API Base URL</span>
              <p className="break-all font-mono text-sm text-white">{apiBaseUrl}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Database</span>
              <p className="font-mono text-sm text-white">{databaseLabel}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">Current Sync State</span>
              <p className="font-mono text-sm uppercase text-white">{syncStatus}</p>
            </div>

            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
              {isChecking ? 'Checking Connection' : 'Check Backend Connection'}
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
                <h3 className="text-xl font-semibold text-white">Ready to check FastAPI</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Click the button to verify the deployed API can reach the shared MySQL database.
                </p>
              </div>
            )}

            {isChecking && (
              <div className="mx-auto max-w-md text-center">
                <RefreshCw className="mx-auto mb-5 h-12 w-12 animate-spin text-blue-300" />
                <h3 className="text-xl font-semibold text-white">Checking backend connection...</h3>
                <p className="mt-2 text-sm text-slate-400">Testing API reachability and SQLAlchemy connectivity.</p>
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
                      <p className="text-white">{status.database || databaseLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <Network className="h-3.5 w-3.5" />
                        API
                      </div>
                      <p className="break-all text-white">{apiBaseUrl}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <RefreshCw className="h-3.5 w-3.5" />
                        SYNC
                      </div>
                      <p className="uppercase text-white">{syncStatus}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-1 flex items-center gap-2 text-slate-500">
                        <Server className="h-3.5 w-3.5" />
                        CHECKED
                      </div>
                      <p className="truncate text-white">{status.checkedAt || 'Unavailable'}</p>
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
