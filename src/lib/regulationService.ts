import { Regulation } from '../types';
import { apiClient } from './apiClient';

/**
 * Obtener todas las normativas (admin)
 */
export async function fetchAllRegulations(): Promise<Regulation[]> {
  try {
    const response = await apiClient.get<Regulation[]>('/regulations');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all regulations:', error);
    throw error;
  }
}

/**
 * Obtener normativas publicadas (público)
 */
export async function fetchPublishedRegulations(): Promise<Regulation[]> {
  try {
    const response = await apiClient.get<Regulation[]>('/regulations/published');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching published regulations:', error);
    throw error;
  }
}

/**
 * Obtener normativa por ID
 */
export async function fetchRegulationById(id: string): Promise<Regulation | null> {
  try {
    const response = await apiClient.get<Regulation>(`/regulations/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching regulation:', error);
    throw error;
  }
}

/**
 * Buscar normativas
 */
export async function searchRegulations(
  searchText: string,
  type?: string
): Promise<Regulation[]> {
  try {
    const query = type ? `?type=${type}` : '';
    const response = await apiClient.get<Regulation[]>(
      `/regulations/search/${encodeURIComponent(searchText)}${query}`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error searching regulations:', error);
    throw error;
  }
}

/**
 * Crear nueva normativa
 */
export async function createRegulation(data: Partial<Regulation>): Promise<Regulation> {
  try {
    // Validation
    if (!data.specialNumber || !data.reference) {
      throw new Error('specialNumber y reference son requeridos');
    }

    const payload = {
      specialNumber: data.specialNumber,
      reference: data.reference,
      type: data.type || 'DECREE',
      legalStatus: data.legalStatus || 'SIN_ESTADO',
      content: data.content || '',
      keywords: data.keywords || [],
      publicationDate: data.publicationDate 
        ? new Date(data.publicationDate).toISOString()
        : new Date().toISOString(),
      // Incluir URLs del PDF si existen
      ...(data.fileUrl && { fileUrl: data.fileUrl }),
      ...(data.pdfUrl && { pdfUrl: data.pdfUrl }),
    };

    const response = await apiClient.post<Regulation>('/regulations', payload);

    if (!response.data) throw new Error('No data returned');
    return response.data;
  } catch (error) {
    console.error('Error creating regulation:', error);
    throw error;
  }
}

/**
 * Actualizar normativa (PUT completo)
 */
export async function updateRegulation(id: string, data: Partial<Regulation>): Promise<Regulation> {
  try {
    console.log(`[UPDATE] ID recibido: "${id}" (tipo: ${typeof id}, length: ${id.length})`);
    
    const endpoint = `/regulations/${id}`;
    console.log(`[UPDATE] Endpoint: ${endpoint}`);
    
    const response = await apiClient.put<Regulation>(endpoint, {
      specialNumber: data.specialNumber,
      reference: data.reference,
      type: data.type,
      state: data.state,
      legalStatus: data.legalStatus,
      content: data.content,
      keywords: data.keywords,
      publicationDate: data.publicationDate,
    });

    if (!response.data) throw new Error('No data returned');
    return response.data;
  } catch (error) {
    console.error('Error updating regulation:', error);
    throw error;
  }
}

/**
 * Actualizar normativa (PATCH parcial)
 */
export async function patchRegulation(id: string, data: Partial<Regulation>): Promise<Regulation> {
  try {
    const payload: any = {};
    if (data.specialNumber) payload.specialNumber = data.specialNumber;
    if (data.reference) payload.reference = data.reference;
    if (data.type) payload.type = data.type;
    if (data.state) payload.state = data.state;
    if (data.legalStatus) payload.legalStatus = data.legalStatus;
    if (data.content !== undefined) payload.content = data.content;
    if (data.keywords) payload.keywords = data.keywords;
    if (data.publicationDate) payload.publicationDate = data.publicationDate;

    const response = await apiClient.patch<Regulation>(`/regulations/${id}`, payload);

    if (!response.data) throw new Error('No data returned');
    return response.data;
  } catch (error) {
    console.error('Error patching regulation:', error);
    throw error;
  }
}

/**
 * Eliminar normativa
 */
export async function deleteRegulation(id: string): Promise<boolean> {
  try {
    const response = await apiClient.delete<boolean>(`/regulations/${id}`);
    return response.success;
  } catch (error) {
    console.error('Error deleting regulation:', error);
    throw error;
  }
}

/**
 * Descargar PDF de la normativa
 */
export function downloadRegulationPDF(regulation: Regulation): void {
  if (!regulation.pdfUrl && !regulation.fileUrl) {
    alert('No hay PDF disponible para esta normativa');
    return;
  }

  const pdfUrl = regulation.pdfUrl || regulation.fileUrl;
  if (pdfUrl) {
    window.open(pdfUrl, '_blank');
  }
}

