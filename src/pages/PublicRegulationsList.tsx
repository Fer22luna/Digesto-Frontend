import React, { useState, useEffect } from 'react';
import { Regulation, RegulationType } from '../types';
import { fetchPublishedRegulations } from '../lib/regulationService';
import RegulationsTable from '../components/RegulationsTable';
import { downloadRegulationPDF } from '../lib/regulationService';
import { Search } from 'lucide-react';

type PublicFilters = {
  type?: RegulationType;
  searchText?: string;
  year?: string;
  month?: string;
  expediente?: string;
};

const PublicRegulationsList: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [allPublishedRegulations, setAllPublishedRegulations] = useState<Regulation[]>([]);
  const [filters, setFilters] = useState<PublicFilters>({});
  const [formFilters, setFormFilters] = useState<PublicFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, idx) => String(currentYear - idx));
  const monthOptions = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  // Load published regulations from API
  useEffect(() => {
    const loadPublishedRegulations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublishedRegulations();
        setAllPublishedRegulations(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar normativas';
        setError(message);
        console.error('Error loading published regulations:', err);
        setAllPublishedRegulations([]);
      } finally {
        setLoading(false);
      }
    };
    loadPublishedRegulations();
  }, []);

  // Apply filters to published regulations
  useEffect(() => {
    let data = allPublishedRegulations;

    if (filters.searchText) {
      const text = filters.searchText.toLowerCase();
      data = data.filter(
        (r) =>
          r.reference.toLowerCase().includes(text) ||
          (r.content && r.content.toLowerCase().includes(text)) ||
          (r.keywords && r.keywords.some((k) => k.toLowerCase().includes(text)))
      );
    }

    if (filters.type) {
      data = data.filter((r) => r.type === filters.type);
    }

    if (filters.year) {
      const year = Number(filters.year);
      data = data.filter((r) => r.publicationDate.getFullYear() === year);
    }

    if (filters.month) {
      const month = Number(filters.month) - 1;
      data = data.filter((r) => r.publicationDate.getMonth() === month);
    }

    if (filters.expediente) {
      const exp = filters.expediente.toLowerCase();
      data = data.filter(
        (r) =>
          (r.reference && r.reference.toLowerCase().includes(exp)) ||
          (r.specialNumber && r.specialNumber.toLowerCase().includes(exp))
      );
    }

    setRegulations(data);
  }, [filters, allPublishedRegulations]);

  const applyFilters = () => setFilters(formFilters);
  const clearFilters = () => {
    setFormFilters({});
    setFilters({});
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Digesto Público</h1>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Digesto Público</h1>
        <p>Busca por año, mes, tipo de documento y número de expediente. Descarga o visualiza en línea.</p>
      </div>

      <div className="search-section">
        <div className="search-header">
          <h3>Búsqueda Avanzada</h3>
        </div>

        <div className="search-grid">
          <div className="form-group">
            <label htmlFor="search-text">Buscar</label>
            <div className="search-input-wrapper" style={{ margin: 0 }}>
              <span className="search-icon">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="search-text"
                type="text"
                className="search-input"
                placeholder="Referencia, palabras clave..."
                value={formFilters.searchText ?? ''}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, searchText: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="doc-type">Tipo de Documento</label>
            <select
              id="doc-type"
              value={formFilters.type ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, type: e.target.value as RegulationType }))}
              className="form-control"
            >
              <option value="">Todos</option>
              <option value="DECREE">Decreto</option>
              <option value="RESOLUTION">Resolución</option>
              <option value="ORDINANCE">Ordenanza</option>
              <option value="TRIBUNAL_RESOLUTION">Resolución Tribunal</option>
              <option value="BID">Licitación</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Año</label>
            <select
              id="year"
              value={formFilters.year ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, year: e.target.value }))}
              className="form-control"
            >
              <option value="">Todos</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="month">Mes</label>
            <select
              id="month"
              value={formFilters.month ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, month: e.target.value }))}
              className="form-control"
            >
              <option value="">Todos</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expediente">Número de Expediente</label>
            <input
              id="expediente"
              type="text"
              placeholder="Ej: EXP D 930/2025"
              value={formFilters.expediente ?? ''}
              onChange={(e) => setFormFilters((prev) => ({ ...prev, expediente: e.target.value }))}
              className="form-control"
            />
          </div>
        </div>

        <div className="search-actions">
          <button className="btn btn-secondary" onClick={clearFilters}>
            🔄 Limpiar
          </button>
          <button className="btn btn-primary" onClick={applyFilters}>
            🔍 Buscar
          </button>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <div className="results-count">
            Mostrando <strong>{regulations.length}</strong> de <strong>{allPublishedRegulations.length}</strong> documentos
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando documentos...</div>
        ) : (
          <RegulationsTable regulations={regulations} showState={false} onDownloadPDF={downloadRegulationPDF} />
        )}
      </div>
    </div>
  );
};

export default PublicRegulationsList;
