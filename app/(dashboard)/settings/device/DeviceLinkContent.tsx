'use client';

import { useState } from 'react';
import { Monitor, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DeviceCode {
  code: string;
  expires_at: string;
  expires_in_seconds: number;
}

export function DeviceLinkContent() {
  const [deviceCode, setDeviceCode] = useState<DeviceCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const generateCode = async () => {
    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/auth/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate code');
      }

      const data = await response.json();
      setDeviceCode(data);
      setCountdown(data.expires_in_seconds);

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setDeviceCode(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (deviceCode) {
      navigator.clipboard.writeText(deviceCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Monitor className="w-5 h-5 inline mr-2" />
            Link Desktop App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground-muted">
            Connect the VTC Tracker desktop app to automatically log your jobs 
            from ETS2 and ATS using telemetry data.
          </p>

          <div className="flex items-start gap-4 p-4 bg-background-tertiary rounded-lg">
            <Download className="w-6 h-6 text-ets2 shrink-0 mt-1" />
            <div>
              <p className="font-medium text-foreground">Download the Desktop App</p>
              <p className="text-sm text-foreground-muted mb-2">
                Windows 10/11 required
              </p>
              <a 
                href="/downloads/VTCTracker-Setup.exe"
                className="text-sm text-ets2 hover:underline"
              >
                Download VTC Tracker Desktop →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Generation */}
      <Card variant="glow-ets2">
        <CardHeader>
          <CardTitle>Linking Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          {deviceCode ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-foreground-muted">
                Enter this code in the desktop app:
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <div className="text-4xl font-mono font-bold tracking-[0.5em] text-ets2 bg-background-tertiary px-6 py-4 rounded-xl">
                  {deviceCode.code}
                </div>
                <button
                  onClick={copyCode}
                  className="p-3 bg-background-tertiary rounded-lg hover:bg-background-tertiary/80 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Copy className="w-5 h-5 text-foreground-muted" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-foreground-muted">
                <RefreshCw className="w-4 h-4" />
                <span>Expires in {formatCountdown(countdown)}</span>
              </div>

              <Button
                variant="ghost"
                onClick={generateCode}
                isLoading={isLoading}
              >
                Generate New Code
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-foreground-muted">
                Generate a one-time code to link your desktop app.
              </p>
              <Button onClick={generateCode} isLoading={isLoading}>
                <Monitor className="w-4 h-4 mr-2" />
                Generate Linking Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>How to Link</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-ets2 text-black font-bold rounded-full flex items-center justify-center shrink-0">1</span>
              <span className="text-foreground-muted">Download and install VTC Tracker Desktop</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-ets2 text-black font-bold rounded-full flex items-center justify-center shrink-0">2</span>
              <span className="text-foreground-muted">Generate a linking code above</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-ets2 text-black font-bold rounded-full flex items-center justify-center shrink-0">3</span>
              <span className="text-foreground-muted">Enter the code in the desktop app</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-ets2 text-black font-bold rounded-full flex items-center justify-center shrink-0">4</span>
              <span className="text-foreground-muted">Start ETS2 or ATS and your jobs will sync automatically!</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
