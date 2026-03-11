import React, { useState } from 'react';
import { Regulation } from '../types';
import { format } from 'date-fns';
import TypeBadge from './TypeBadge';

interface RegulationsTableProps {
  regulations: Regulation[];
  showState?: boolean;
  onDownloadPDF?: (regulation: Regulation) => void;
}

const RegulationsTable: React.FC<RegulationsTableProps> = ({
  regulations,
  showState = false,
  onDownloadPDF,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStateLabel = (state?: string) => {
    switch (state) {
      case 'DRAFT':
        return 'Borrador';
      case 'REVIEW':
        return 'En Revisión';
      case 'PUBLISHED':
        return 'Publicada';
      case 'ARCHIVED':
        return 'Archivada';
      default:
        return state || '-';
    }
  };

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'DRAFT':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'REVIEW':
        return { bg: '#fed7aa', text: '#9a3412' };
      case 'PUBLISHED':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'ARCHIVED':
        return { bg: '#e5e7eb', text: '#374151' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (regulations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#5a7a99', fontSize: '14px' }}>
        No se encontraron documentos que coincidan con los criterios de búsqueda.
      </div>
    );
  }

  const columns = showState
    ? ['Tipo', 'N° / Fecha', 'Descripción', 'Estado', 'Acciones']
    : ['Tipo', 'N° / Fecha', 'Descripción', 'Expediente', 'Acciones'];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #dde3ec',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f4fa', borderBottom: '2px solid #dde3ec' }}>
            {columns.map((h, i) => (
              <th
                key={h}
                style={{
                  padding: '11px 16px',
                  textAlign: i === columns.length - 1 ? 'center' : 'left',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#3a5a7a',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  fontFamily: 'system-ui',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regulations.map((regulation, idx) => {
            const isExpanded = expandedId === regulation.id;
            const stateColor = getStateColor(regulation.state);
            return (
              <tr
                key={regulation.id}
                style={{
                  borderBottom: '1px solid #eef1f7',
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#fafbfd',
                  transition: 'background 0.15s, height 0.2s ease',
                  verticalAlign: 'top',
                }}
                onMouseEnter={(e) => {
                  setExpandedId(regulation.id);
                  e.currentTarget.style.backgroundColor = '#f0f5ff';
                }}
                onMouseLeave={(e) => {
                  setExpandedId(null);
                  e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#fafbfd';
                }}
              >
                {/* Tipo */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <TypeBadge type={regulation.type} />
                </td>

                {/* N° / Fecha */}
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#0d2340', fontFamily: 'system-ui' }}>
                    {regulation.reference || regulation.specialNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9ab5', fontFamily: 'system-ui', marginTop: '1px' }}>
                    {format(new Date(regulation.publicationDate), 'dd/MM/yyyy')}
                  </div>
                </td>

                {/* Descripción */}
                <td
                  style={{
                    padding: '12px 16px',
                    maxWidth: isExpanded ? 'none' : '320px',
                    whiteSpace: isExpanded ? 'normal' : 'nowrap',
                    overflow: isExpanded ? 'visible' : 'hidden',
                    textOverflow: isExpanded ? 'unset' : 'ellipsis',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#2a3a50', lineHeight: '1.4' }}>
                    {regulation.content || regulation.reference}
                  </span>
                </td>

                {/* Estado o Expediente */}
                {showState ? (
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: stateColor.text,
                        backgroundColor: stateColor.bg,
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontWeight: '500',
                        display: 'inline-block',
                      }}
                    >
                      {getStateLabel(regulation.state)}
                    </span>
                  </td>
                ) : (
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#5a7a99',
                        fontFamily: 'monospace',
                        backgroundColor: '#f0f4fa',
                        padding: '3px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {regulation.specialNumber}
                    </span>
                  </td>
                )}

                {/* Acciones */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Botón Abrir */}
                    <button
                      onClick={() => {
                        const pdfUrl = regulation.pdfUrl || regulation.fileUrl;
                        if (pdfUrl) {
                          window.open(pdfUrl, '_blank');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#1a3a5c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'system-ui',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#132d47';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a3a5c';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Abrir
                    </button>

                    {/* Botón Editar */}
                    <button
                      onClick={() => {
                        window.location.href = `/admin/regulations/${regulation.id}`;
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FF9F1C',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: 'system-ui',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E68900';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF9F1C';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #eef1f7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#8a9ab5',
          fontFamily: 'system-ui',
        }}
      >
        <span>Mostrando {regulations.length} registros</span>
      </div>
    </div>
  );
};

export default RegulationsTable;
