import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Regulation } from '../../types';
import { createRegulation } from '../../lib/regulationService';
import RegulationForm from '../../components/RegulationForm';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const AdminRegulationNew: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = async (data: Partial<Regulation>) => {
    try {
      const newRegulation = await createRegulation(data);
      toast.success('Normativa creada exitosamente');
      // Redirect to the edit page of the newly created regulation
      navigate(`/admin/regulations/${newRegulation.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear normativa';
      toast.error('Error al crear normativa', {
        description: message,
      });
      throw error;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-button">
          <ChevronLeft className="h-4 w-4" />
          Volver a Administración
        </button>
        <h2>➕ Nueva Normativa</h2>
        <p>Crea una nueva regulación, decreto, resolución u ordenanza</p>
      </div>

      <div style={{ 
        background: '#fff', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '2rem',
        width: '100%'
      }}>
        <RegulationForm onSave={handleSave} onCancel={() => navigate('/admin')} />
      </div>
    </div>
  );
};

export default AdminRegulationNew;
