import React, { useState } from 'react';
import { Regulation } from '../types';

interface ActionMenuProps {
  regulation: Regulation;
  onDownloadPDF?: (regulation: Regulation) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ regulation, onDownloadPDF }) => {
  const [open, setOpen] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + `#${regulation.id}`;
    navigator.clipboard.writeText(url);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          backgroundColor: '#1a3a5c',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'system-ui',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#132d47')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a3a5c')}
      >
        Acciones ▼
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            backgroundColor: '#fff',
            border: '1px solid #dde3ec',
            borderRadius: '7px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
            zIndex: 100,
            minWidth: '160px',
            overflow: 'hidden',
          }}
        >
          {[
            {
              icon: '👁',
              label: 'Ver PDF',
              action: () => {
                window.open(regulation.pdfUrl || regulation.fileUrl || '#', '_blank');
                setOpen(false);
              },
            },
            {
              icon: '✏️',
              label: 'Editar',
              action: () => {
                window.location.href = `/admin/regulations/${regulation.id}`;
              },
            },
            {
              icon: '⬇️',
              label: 'Descargar',
              action: () => {
                if (onDownloadPDF) {
                  onDownloadPDF(regulation);
                }
                setOpen(false);
              },
            },
            { icon: '🔗', label: 'Copiar enlace', action: handleCopyLink },
          ].map(({ icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#1a3a5c',
                textAlign: 'left',
                fontFamily: 'system-ui',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f4fa')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
