"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";

interface StatsEvent {
  type: "stats";
  queued: number;
  denied: number;
}

export default function Status() {
  const [status, setStatus] = useState({ queued: 0, denied: 0 });
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasFetchedInitial = useRef(false);

  const fetchStatus = async (token: string | undefined) => {
        if (!token) return;
        try {
            const response = await fetch('/api/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as {
                data: {
                    queued?: number, denied?: number
                },
                success: boolean
            };
            if (data.success) {
                setStatus(prevStatus => ({
                    queued: data.data.queued || prevStatus.queued,
                    denied: data.data.denied || prevStatus.denied
                }));
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
            // Optionally set an error state to display in the UI
        }
    };

    const fetchToken = async () => {
        try {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as { token?: string };
            if (data.token) {
                fetchStatus(data.token);
            } else {
                throw new Error("No token received from server");
            }
        } catch (error) {
            setError(`Error fetching token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };


  // Initial stats fetch (runs only once)
  useEffect(() => {
    if (hasFetchedInitial.current) return;
    hasFetchedInitial.current = true;
    fetchToken();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`wss://api.freecustom.email/?mailbox=stats`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StatsEvent;
        if (data.type === "stats") {
          setStatus((prev) => ({
            queued: data.queued ?? prev.queued,
            denied: data.denied ?? prev.denied,
          }));
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      setError("WebSocket connection error.");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => ws.close();
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative m-5" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900/50 p-6 mt-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 tracking-wide">System Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-xl">
          <p className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-2">Queued</p>
          <div className="text-4xl font-extrabold text-blue-800 dark:text-blue-200">
            <CountUp start={status.queued - 100} end={status.queued} duration={2.75} separator="," />
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 p-5 rounded-xl">
          <p className="text-sm font-medium text-red-500 dark:text-red-400 mb-2">Denied</p>
          <div className="text-4xl font-extrabold text-red-800 dark:text-red-200">
            <CountUp start={status.denied - 100} end={status.denied} duration={2.75} separator="," />
          </div>
        </div>
      </div>
    </div>
  );
}
