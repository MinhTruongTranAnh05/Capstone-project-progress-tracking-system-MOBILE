import type { ReactNode } from 'react';

// Router 58 uses CSS insets on Web; native screens keep the safe-area provider.
export function SafeAreaRoot({ children }: { children: ReactNode }) {
  return <div style={{
    display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', boxSizing: 'border-box',
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingRight: 'env(safe-area-inset-right, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    paddingLeft: 'env(safe-area-inset-left, 0px)',
  }}>{children}</div>;
}
