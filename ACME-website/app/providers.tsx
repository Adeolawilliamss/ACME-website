'use client';

import NextNProgress from 'nextjs-progressbar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextNProgress
        color="#3b82f6"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
      />
      {children}
    </>
  );
}
