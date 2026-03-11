import React, { useState, useEffect } from 'react';
import { Regulation } from '../../types';
import { fetchAllRegulations, downloadRegulationPDF } from '../../lib/regulationService';
import RegulationsTable from '../../components/RegulationsTable';
import { Link } from 'react-router-dom';

const AdminRegulationsList: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [filteredRegulations, setFilteredRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    type?: string;
    state?: string;
    searchText?: string;
  }>({});

  useEffect(() => {
    loadRegulations();
  }, []);

  const loadRegulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllRegulations();
      setRegulations(data);
      setFilteredRegulations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar normativas';
      setError(message);
      console.error('Error loading regulations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = regulations;

    if (filters.searchText) {
      const text = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reference.toLowerCase().includes(text) ||
          (r.content && r.content.toLowerCase().includes(text)) ||
          (r.keywords && r.keywords.some((k) => k.toLowerCase().includes(text)))
      );
    }

    if (filters.type) {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    if (filters.state) {
      filtered = filtered.filter((r) => r.state === filters.state);
    }

    setFilteredRegulations(filtered);
  }, [filters, regulations]);

  // Calculate statistics
  const stats = {
    total: regulations.length,
    published: regulations.filter((r) => r.state === 'PUBLISHED').length,
    inReview: regulations.filter((r) => r.state === 'REVIEW').length,
    drafts: regulations.filter((r) => r.state === 'DRAFT').length,
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Panel de Administración</h2>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
        <button onClick={loadRegulations} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Panel de Administración</h2>
        <p>Gestiona decretos, resoluciones y ordenanzas</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Total</div>
            </div>
            <div className="stat-icon">📊</div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-description">Normativas totales</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div>
              <div className="stat-title">Publicadas</div>
            </div>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-value">{stats.published}</div>
          <div className="stat-description">Disponibles públicamente</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div>
              <div className="stat-title">En Revisión</div>
            </div>
            <div className="stat-icon">⏱️</div>
          </div>
          <div className="stat-value">{stats.inReview}</div>
          <div className="stat-description">Pendientes de aprobación</div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <div>
              <div className="stat-title">Borradores</div>
            </div>
            <div className="stat-icon">📝</div>
          </div>
          <div className="stat-value">{stats.drafts}</div>
          <div className="stat-description">En edición</div>
        </div>
      </div>

      {/* Search Section - Professional Filter Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e0e4eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f8f9fb',
              border: '1px solid #e0e4eb',
              borderRadius: '6px',
              padding: '12px 14px',
            }}
          >
            <span style={{ color: '#667085', fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por referencia, contenido o palabras clave..."
              value={filters.searchText ?? ''}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                color: '#1a1a1a',
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#e0e4eb',
            marginBottom: '16px',
          }}
        />

        {/* Advanced Filters Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Tipo */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#667085',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Tipo
            </label>
            <select
              value={filters.type ?? ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e0e4eb',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'inherit',
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                cursor: 'pointer',
              }}
            >
              <option value="">Todos</option>
              <option value="DECREE">Decreto</option>
              <option value="RESOLUTION">Resolución</option>
              <option value="ORDINANCE">Ordenanza</option>
              <option value="TRIBUNAL_RESOLUTION">Tribunal</option>
              <option value="BID">Licitación</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#667085',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Estado
            </label>
            <select
              value={filters.state ?? ''}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e0e4eb',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'inherit',
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                cursor: 'pointer',
              }}
            >
              <option value="">Todos</option>
              <option value="DRAFT">Borrador</option>
              <option value="REVIEW">En Revisión</option>
              <option value="PUBLISHED">Publicada</option>
              <option value="ARCHIVED">Archivada</option>
            </select>
          </div>
        </div>

        {/* Clear Filters & Nueva Normativa Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {(filters.searchText || filters.type || filters.state) && (
            <button
              onClick={() => setFilters({})}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                backgroundColor: '#f5f6f8',
                color: '#667085',
                border: '1px solid #e0e4eb',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ececf1')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f6f8')}
            >
              ✕ Limpiar Filtros
            </button>
          )}

          {/* Nueva Normativa Button */}
          <Link to="/admin/regulations/new" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                backgroundColor: '#1a3a5c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#132d47')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a3a5c')}
            >
              ➕ Nueva Normativa
            </button>
          </Link>
        </div>
      </div>

      {/* Results Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e0e4eb',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Results Header */}
        <div
          style={{
            backgroundColor: '#f0f4fa',
            padding: '14px 20px',
            borderBottom: '1px solid #e0e4eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '13px', color: '#667085' }}>
            <strong style={{ color: '#1a1a1a' }}>{filteredRegulations.length}</strong> de{' '}
            <strong style={{ color: '#1a1a1a' }}>{regulations.length}</strong> normativas
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#667085' }}>
            Cargando normativas...
          </div>
        ) : filteredRegulations.length === 0 ? (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: '#667085',
              fontSize: '14px',
            }}
          >
            <p style={{ marginBottom: '8px' }}>No se encontraron normativas</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <RegulationsTable
            regulations={filteredRegulations}
            showState={true}
            onDownloadPDF={downloadRegulationPDF}
          />
        )}
      </div>
    </div>
  );
};

export default AdminRegulationsList;
