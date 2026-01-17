import type { Metadata } from 'next';

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
      </div>
    </div>
  );
}
