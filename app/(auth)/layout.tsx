import type { Metadata } from 'next';
import Link from 'next/link';
import { Github } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login | VTC Job Tracker',
  description: 'Login to your VTC Job Tracker account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {children}
        <div className="mt-8 flex justify-center">
             <Link
                href="https://github.com/dataplug14/tracker/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="font-medium">Open Source</span>
              </Link>
        </div>
      </div>
    </div>
  );
}
