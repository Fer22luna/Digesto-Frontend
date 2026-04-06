import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Regulation, WorkflowState, LegalStatus } from '../../types';
import { fetchRegulationById, updateRegulation, recordStateTransition } from '../../lib/regulationService';
import { ChevronLeft } from 'lucide-react';

const AdminRegulationEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editData, setEditData] = useState({
    reference: '',
    type: 'DECREE',
    legalStatus: 'SIN_ESTADO',
    keywords: [] as string[],
    content: '',
    publicationDate: new Date().toISOString().split('T')[0],
    state: 'DRAFT' as WorkflowState,
  });

  // Load regulation on mount (EDIT MODE ONLY - requires ID)
  useEffect(() => {
    const loadRegulation = async () => {
      // No ID = Error (this page is EDIT ONLY)
      if (!id) {
        setError('ID no proporcionado - Esta página es solo para editar normativas existentes');
        setLoading(false);
        return;
      }

      // Editing existing regulation (has ID)
      try {
        setLoading(true);
        const data = await fetchRegulationById(id);
        if (!data) {
          throw new Error('Normativa no encontrada');
        }
        setRegulation(data);
        setEditData({
          reference: data.reference,
          type: data.type,
          legalStatus: data.legalStatus || 'SIN_ESTADO',
          keywords: data.keywords || [],
          content: data.content || '',
          publicationDate: new Date(data.publicationDate).toISOString().split('T')[0],
          state: data.state || 'DRAFT',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar la normativa';
        setError(message);
        console.error('Error loading regulation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRegulation();
  }, [id]);

  const getAvailableTransitions = (currentState: WorkflowState): WorkflowState[] => {
    const transitions: Record<WorkflowState, WorkflowState[]> = {
      DRAFT: ['REVIEW', 'PUBLISHED', 'ARCHIVED'],
      REVIEW: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      APPROVED: ['PUBLISHED', 'ARCHIVED'],
      PUBLISHED: ['REVIEW', 'ARCHIVED'],
      ARCHIVED: ['DRAFT', 'REVIEW', 'PUBLISHED'],
    };
    return transitions[currentState] || [];
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DECREE: 'Decreto',
      RESOLUTION: 'Resolución',
      ORDINANCE: 'Ordenanza',
      TRIBUNAL_RESOLUTION: 'Resolución Tribunal',
      BID: 'Licitación',
    };
    return labels[type] || type;
  };

  const getStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Borrador',
      REVIEW: 'En Revisión',
      PUBLISHED: 'Publicada',
      ARCHIVED: 'Archivada',
    };
    return labels[state] || state;
  };

  const handleSaveChanges = async () => {
    if (!regulation) return;

    try {
      setIsSaving(true);
      setError(null);

      // Update existing regulation
      await updateRegulation(regulation.id, {
        reference: editData.reference,
        type: editData.type,
        legalStatus: editData.legalStatus,
        keywords: editData.keywords,
        content: editData.content,
        publicationDate: new Date(editData.publicationDate),
        state: editData.state,
      } as Partial<Regulation>);

      // Reload regulation
      const updated = await fetchRegulationById(regulation.id);
      if (updated) {
        setRegulation(updated);
        setIsEditMode(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setError(message);
      console.error('Error saving regulation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStateChange = async (newState: WorkflowState) => {
    if (!regulation) return;

    try {
      setIsSaving(true);
      const previousState = regulation.state;
      
      // Actualizar el estado de la regulación
      await updateRegulation(regulation.id, { state: newState });
      
      // Registrar la transición de estado
      await recordStateTransition(
        regulation.id,
        previousState || 'DRAFT',
        newState,
        `Cambio de estado de ${previousState} a ${newState}`
      );
      
      // Recargar la regulación
      const updated = await fetchRegulationById(regulation.id);
      if (updated) {
        setRegulation(updated);
        setEditData(prev => ({ ...prev, state: newState }));
      }
    } catch (err) {
      console.error('Error changing state:', err);
      setError('Error al cambiar el estado');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (regulation) {
      setEditData({
        reference: regulation.reference,
        type: regulation.type,
        legalStatus: regulation.legalStatus || 'SIN_ESTADO',
        keywords: regulation.keywords || [],
        content: regulation.content || '',
        publicationDate: new Date(regulation.publicationDate).toISOString().split('T')[0],
        state: regulation.state || 'DRAFT',
      });
    }
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', color: '#666' }}>⏳ Cargando normativa...</div>
        </div>
      </div>
    );
  }

  if (error && regulation) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/admin')} className="back-button">
          <ChevronLeft className="h-4 w-4" />
          Volver a Administración
        </button>
        <div style={{
          marginTop: '2rem',
          padding: '2rem',
          background: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '8px',
          color: '#c62828'
        }}>
          <h3 style={{ marginTop: 0 }}>❌ Error</h3>
          <p>{error || 'Normativa no encontrada'}</p>
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div>
          <button onClick={() => navigate('/admin')} className="back-button">
            <ChevronLeft className="h-4 w-4" />
            Volver a Administración
          </button>
          {regulation ? (
            <>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>
                {regulation.specialNumber}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.95rem' }}>
                {regulation.reference}
              </p>
            </>
          ) : (
            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>
              ➕ Nueva Normativa
            </h2>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isEditMode && regulation && (
            <button
              onClick={() => setIsEditMode(true)}
              className="btn btn-primary"
            >
              ✏️ Editar
            </button>
          )}
          {regulation && regulation.pdfUrl && (
            <a
              href={regulation.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              ⬇️ Descargar PDF
            </a>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          background: '#ffebee',
          border: '1px solid #ef5350',
          borderRadius: '4px',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      {/* Main Layout: Left (Form) + Right (Workflow) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* LEFT PANEL: Edit Form */}
        <div>
          {/* Metadata */}
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
              📋 Información
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Tipo */}
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#555' }}>
                  Tipo de Normativa
                </label>
                {isEditMode ? (
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="DECREE">Decreto</option>
                    <option value="RESOLUTION">Resolución</option>
                    <option value="ORDINANCE">Ordenanza</option>
                    <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
                    <option value="BID">Licitación</option>
                  </select>
                ) : (
                  <div style={{ padding: '0.5rem 0', color: '#333' }}>
                    {regulation && getTypeLabel(regulation.type)}
                  </div>
                )}
              </div>

              {/* Estado Legal */}
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#555' }}>
                  Estado Legal
                </label>
                {isEditMode ? (
                  <select
                    value={editData.legalStatus}
                    onChange={(e) => setEditData({ ...editData, legalStatus: e.target.value as LegalStatus })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="VIGENTE">Vigente</option>
                    <option value="PARCIAL">Parcialmente Vigente</option>
                    <option value="SIN_ESTADO">Sin Estado</option>
                  </select>
                ) : (
                  <div style={{ padding: '0.5rem 0', color: '#333' }}>
                    {editData.legalStatus === 'VIGENTE' ? 'Vigente' :
                     editData.legalStatus === 'PARCIAL' ? 'Parcialmente Vigente' : 'Sin Estado'}
                  </div>
                )}
              </div>

              {/* Fecha de Publicación */}
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#555' }}>
                  Fecha de Publicación
                </label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={editData.publicationDate}
                    onChange={(e) => setEditData({ ...editData, publicationDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.95rem'
                    }}
                  />
                ) : (
                  <div style={{ padding: '0.5rem 0', color: '#333' }}>
                    {new Date(editData.publicationDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>

              {/* Referencia */}
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#555' }}>
                  Referencia
                </label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.reference}
                    onChange={(e) => setEditData({ ...editData, reference: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.95rem'
                    }}
                  />
                ) : (
                  <div style={{ padding: '0.5rem 0', color: '#333' }}>
                    {regulation?.reference}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Palabras Clave */}
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
              🏷️ Palabras Clave
            </h3>
            {isEditMode ? (
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.75rem',
                backgroundColor: '#fafafa',
                minHeight: '40px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                {editData.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#2196F3',
                      color: '#fff',
                      borderRadius: '16px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => setEditData({
                        ...editData,
                        keywords: editData.keywords.filter((_, i) => i !== idx)
                      })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={editData.keywords.length === 0 ? "Escribe palabras clave y presiona Enter o coma" : "Agregar más..."}
                  onKeyDown={(e) => {
                    const input = e.currentTarget.value.trim();
                    if ((e.key === 'Enter' || e.key === ',') && input) {
                      e.preventDefault();
                      if (!editData.keywords.includes(input)) {
                        setEditData({
                          ...editData,
                          keywords: [...editData.keywords, input]
                        });
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.95rem',
                    flex: 1,
                    minWidth: '150px',
                    padding: '0.4rem 0',
                    height: '1.5rem',
                    lineHeight: '1.5rem',
                    verticalAlign: 'middle'
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {editData.keywords.length > 0 ? (
                  editData.keywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: '#e3f2fd',
                        border: '1px solid #90caf9',
                        borderRadius: '16px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.875rem',
                        color: '#1976d2'
                      }}
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <p style={{ color: '#999', margin: '0.5rem 0' }}>Sin palabras clave</p>
                )}
              </div>
            )}
          </div>

          {/* Contenido */}
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
              📄 Contenido
            </h3>
            {isEditMode ? (
              <textarea
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                placeholder="Contenido de la normativa..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{
                background: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                minHeight: '100px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: '#333'
              }}>
                {regulation?.content || <em style={{ color: '#999' }}>Sin contenido</em>}
              </div>
            )}
          </div>

          {/* PDF Link */}
          {regulation?.pdfUrl && (
            <div style={{
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
                📎 Documento Original
              </h3>
              <a
                href={regulation.pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#e3f2fd',
                  border: '1px solid #90caf9',
                  borderRadius: '4px',
                  color: '#1976d2',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                📄 Ver PDF
              </a>
            </div>
          )}

          {/* Edit Controls */}
          {isEditMode && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                ✕ Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? '⏳ Guardando...' : '✓ Guardar Cambios'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Workflow */}
        <div>
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            position: 'sticky',
            top: '1rem'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#333', fontSize: '1.1rem' }}>
              ⚙️ Workflow
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#999', fontSize: '0.9rem' }}>
              Gestiona el estado de la normativa
            </p>

            {/* Current State */}
            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                Estado Actual
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>
                ✓ {getStateLabel(editData.state)}
              </div>
            </div>

            {/* Available Transitions */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#666', marginBottom: '0.75rem' }}>
                TRANSICIONES DISPONIBLES
              </div>
              {getAvailableTransitions(editData.state).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {getAvailableTransitions(editData.state).map((transition) => (
                    <button
                      key={transition}
                      onClick={() => handleStateChange(transition)}
                      disabled={isSaving}
                      style={{
                        padding: '0.75rem',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        opacity: isSaving ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.background = '#f0f0f0';
                          e.currentTarget.style.borderColor = '#2196f3';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.borderColor = '#ddd';
                      }}
                    >
                      <span>→</span>
                      <span>{getStateLabel(transition)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  No hay transiciones disponibles
                </p>
              )}
            </div>

            {/* State History */}
            {regulation?.stateHistory && regulation.stateHistory.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#666', marginBottom: '1rem' }}>
                  HISTORIAL ✓
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {regulation.stateHistory
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((transition, idx) => (
                      <div key={idx} style={{
                        padding: '0.75rem',
                        background: '#f9f9f9',
                        borderLeft: '3px solid #2196f3',
                        borderRadius: '2px',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ fontWeight: 500, color: '#333', marginBottom: '0.25rem' }}>
                          {transition.fromState ? `${getStateLabel(transition.fromState)} → ` : ''}
                          {getStateLabel(transition.toState)}
                        </div>
                        <div style={{ color: '#999', fontSize: '0.8rem' }}>
                          {new Date(transition.timestamp).toLocaleString('es-ES')}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegulationEditor;
