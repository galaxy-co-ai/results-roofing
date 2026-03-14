'use client';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    height: '100%',
    padding: '0 0 16px',
  },
  headerSkeleton: {
    height: 32,
    width: 200,
    background: 'var(--rr-color-surface)',
    borderRadius: 6,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  content: {
    display: 'flex',
    gap: 24,
    flex: 1,
    minHeight: 0,
  },
  viewport: {
    flex: '0 0 65%',
    minHeight: 400,
    background: 'var(--rr-color-surface)',
    borderRadius: 12,
    border: '1px solid var(--rr-color-border)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  sidebar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 24,
  },
  sidebarBlock: (height: number): React.CSSProperties => ({
    height,
    background: 'var(--rr-color-surface)',
    borderRadius: 12,
    border: '1px solid var(--rr-color-border)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoofPageSkeleton() {
  return (
    <>
      {/* Pulse keyframes injected inline — avoids CSS Module dependency */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div
        style={styles.root}
        aria-busy="true"
        aria-label="Loading roof visualizer"
        role="status"
      >
        {/* Header placeholder */}
        <div style={styles.headerSkeleton} />

        {/* Main content area */}
        <div style={styles.content}>
          {/* 3D viewport placeholder */}
          <div style={styles.viewport} />

          {/* Sidebar placeholders */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarBlock(140)} />
            <div style={styles.sidebarBlock(120)} />
          </div>
        </div>
      </div>
    </>
  );
}
