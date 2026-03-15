'use client';

interface GafViewerEmbedProps {
  report3dUrl: string;
}

export function GafViewerEmbed({ report3dUrl }: GafViewerEmbedProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 400,
      borderRadius: 8,
      overflow: 'hidden',
      background: '#e8f0fe',
    }}>
      <iframe
        src={report3dUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          minHeight: 400,
        }}
        title="3D Roof Visualization"
        allow="fullscreen"
        loading="lazy"
      />
    </div>
  );
}
