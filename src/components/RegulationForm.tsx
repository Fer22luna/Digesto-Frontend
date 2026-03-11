import React, { useState } from 'react';
import { Regulation, RegulationType } from '../types';
import { toast } from 'sonner';

interface RegulationFormProps {
  regulation?: Regulation;
  onSave: (regulation: Partial<Regulation>) => Promise<void> | void;
  onCancel: () => void;
}

const RegulationForm: React.FC<RegulationFormProps> = ({ regulation, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    tipo: regulation?.type || 'DECREE',
    numeroEspecial: regulation?.specialNumber || '',
    fechaPublicacion: regulation?.publicationDate
      ? new Date(regulation.publicationDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    estadoLegal: regulation?.legalStatus || 'SIN_ESTADO',
    referencia: regulation?.reference || '',
    palabrasClave: regulation?.keywords?.join(', ') || '',
    contenido: regulation?.content || '',
  });

  const [pdfFile, setpdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; name: string; size: string } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile({
        file,
        name: file.name,
        size: formatFileSize(file.size),
      });
      setpdfFile(file);
      toast.success('Archivo seleccionado', {
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    } else {
      toast.error('Archivo inválido', {
        description: 'Por favor selecciona un archivo PDF válido.',
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('active');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('active');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile({
        file: files[0],
        name: files[0].name,
        size: formatFileSize(files[0].size),
      });
      setpdfFile(files[0]);
      toast.success('Archivo seleccionado', {
        description: `${files[0].name} (${formatFileSize(files[0].size)})`,
      });
    } else {
      toast.error('Archivo inválido', {
        description: 'Por favor arrastra un archivo PDF válido.',
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setpdfFile(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let uploadedUrl: string | undefined;

      if (pdfFile) {
        const payload = new FormData();
        payload.append('file', pdfFile);

        const response = await fetch('http://localhost:5000/api/uploads/regulation-file', {
          method: 'POST',
          body: payload,
        });

        if (!response.ok) {
          throw new Error('No se pudo subir el PDF. Intenta nuevamente.');
        }

        const json = await response.json();
        uploadedUrl = json.url as string;
        toast.success('PDF subido correctamente');
      }

      const regulationData: Partial<Regulation> = {
        type: formData.tipo as RegulationType,
        specialNumber: formData.numeroEspecial,
        publicationDate: new Date(formData.fechaPublicacion),
        reference: formData.referencia,
        content: formData.contenido,
        keywords: formData.palabrasClave.split(',').map((k) => k.trim()).filter((k) => k),
        legalStatus: formData.estadoLegal as any,
        ...(uploadedUrl && { fileUrl: uploadedUrl, pdfUrl: uploadedUrl }),
      };

      await onSave(regulationData);
      toast.success('Normativa creada', {
        description: `${formData.numeroEspecial} ha sido creada exitosamente como borrador.`,
      });
    } catch (error) {
      toast.error('Error al crear normativa', {
        description: error instanceof Error ? error.message : 'No se pudo crear la normativa. Intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="normativaForm">
      {/* Información Básica */}
      <div className="form-section">
        <h3 className="form-section-title">Información Básica</h3>

        <div className="form-grid two-columns">
          <div className="form-group">
            <label htmlFor="tipo">
              Tipo <span className="required">*</span>
            </label>
            <select
              id="tipo"
              className="form-control"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="DECREE">Decreto</option>
              <option value="RESOLUTION">Resolución</option>
              <option value="ORDINANCE">Ordenanza</option>
              <option value="BID">Licitación</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="numero-especial">
              Número Especial <span className="required">*</span>
            </label>
            <input
              type="text"
              id="numero-especial"
              className="form-control"
              placeholder="Ej: D-2024-001"
              value={formData.numeroEspecial}
              onChange={(e) => handleChange('numeroEspecial', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha-publicacion">
              Fecha de Publicación <span className="required">*</span>
            </label>
            <input
              type="date"
              id="fecha-publicacion"
              className="form-control"
              value={formData.fechaPublicacion}
              onChange={(e) => handleChange('fechaPublicacion', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado-legal">
              Estado Legal <span className="required">*</span>
            </label>
            <select
              id="estado-legal"
              className="form-control"
              value={formData.estadoLegal}
              onChange={(e) => handleChange('estadoLegal', e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="VIGENTE">Vigente</option>
              <option value="SIN_ESTADO">Sin estado</option>
              <option value="PARCIAL">Parcialmente vigente</option>
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="referencia">
              Referencia <span className="required">*</span>
            </label>
            <input
              type="text"
              id="referencia"
              className="form-control"
              placeholder="Breve descripción de la normativa"
              value={formData.referencia}
              onChange={(e) => handleChange('referencia', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Contenido y Palabras Clave */}
      <div className="form-section">
        <h3 className="form-section-title">Contenido y Palabras Clave</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="palabras-clave">
              Palabras Clave <span className="required">*</span>
            </label>
            <input
              type="text"
              id="palabras-clave"
              className="form-control"
              placeholder="Separadas por comas: presupuesto, finanzas, 2024"
              value={formData.palabrasClave}
              onChange={(e) => handleChange('palabrasClave', e.target.value)}
              required
            />
            <span className="form-help">Ingrese palabras clave separadas por comas</span>
          </div>

          <div className="form-group">
            <label htmlFor="contenido">
              Contenido <span className="required">*</span>
            </label>
            <textarea
              id="contenido"
              className="form-control"
              placeholder="Contenido completo de la normativa. Use # para títulos principales y ## para subtítulos."
              value={formData.contenido}
              onChange={(e) => handleChange('contenido', e.target.value)}
              required
              rows={8}
            ></textarea>
            <span className="form-help">Formato: Use # para títulos principales y ## para subtítulos</span>
          </div>
        </div>
      </div>

      {/* Documento PDF */}
      <div className="form-section">
        <h3 className="form-section-title">Documento PDF</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="pdf-file">PDF firmado</label>
            {!selectedFile ? (
              <div
                className="file-upload"
                id="fileUploadZone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-file')?.click()}
              >
                <div className="file-upload-icon">📁</div>
                <div className="file-upload-text">Haz clic para seleccionar o arrastra el archivo aquí</div>
                <div className="file-upload-hint">
                  Sube el PDF oficial firmado. Se almacenará en Supabase Storage y se mostrará en la vista pública
                </div>
              </div>
            ) : (
              <div className="file-selected">
                <div className="file-selected-icon">📄</div>
                <div className="file-selected-info">
                  <div className="file-selected-name">{selectedFile.name}</div>
                  <div className="file-selected-size">{selectedFile.size}</div>
                </div>
                <button type="button" className="file-remove" onClick={() => removeFile()}>
                  ✕ Eliminar
                </button>
              </div>
            )}
            <input
              type="file"
              id="pdf-file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          ✓ {regulation ? 'Guardar Cambios' : 'Crear Normativa'}
        </button>
      </div>
    </form>
  );
};

export default RegulationForm;
