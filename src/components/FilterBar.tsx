import React, { useState } from 'react';
import { RegulationType, WorkflowState } from '../types';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: {
    type?: RegulationType;
    state?: WorkflowState;
    searchText?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  showStateFilter?: boolean;
  // if true, advanced filters are always shown and the toggle button is hidden
  alwaysVisible?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, showStateFilter = false, alwaysVisible = false }) => {
  const [searchText, setSearchText] = useState('');
  const [type, setType] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(alwaysVisible);

  // if alwaysVisible changes to true later, ensure showFilters is true
  React.useEffect(() => {
    if (alwaysVisible) {
      setShowFilters(true);
    }
  }, [alwaysVisible]);

  const handleApplyFilters = () => {
    onFilterChange({
      type: type as RegulationType | undefined,
      state: state as WorkflowState | undefined,
      searchText: searchText || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchText('');
    setType('');
    setState('');
    setDateFrom('');
    setDateTo('');
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por referencia, contenido o palabras clave..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters();
              }
            }}
            className="pl-10 border-gray-300"
          />
        </div>
        {!alwaysVisible && (
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        )}
        <Button onClick={handleApplyFilters}>Buscar</Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos</option>
              <option value="DECREE">Decreto</option>
              <option value="RESOLUTION">Resolución</option>
              <option value="ORDINANCE">Ordenanza</option>
            </Select>
          </div>

          {showStateFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="REVIEW">En Revisión</option>
                <option value="APPROVED">Aprobado</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
