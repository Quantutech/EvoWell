import { useState, useEffect } from 'react';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: string;
  services: {
    name: string;
    status: 'up' | 'down';
    responseTime: number;
  }[];
}

export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    // Simulated health check API
    const mockHealth: SystemHealth = {
      status: 'healthy',
      latency: 45,
      uptime: '99.98%',
      services: [
        { name: 'Primary Database', status: 'up', responseTime: 12 },
        { name: 'Auth Service', status: 'up', responseTime: 8 },
        { name: 'Storage (S3)', status: 'up', responseTime: 24 },
        { name: 'AI Engine', status: 'up', responseTime: 120 },
      ]
    };
    setHealth(mockHealth);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return { health, loading, refetch: fetchHealth };
};
