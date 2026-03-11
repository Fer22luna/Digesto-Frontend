// mockData.ts
// Placeholder for sample regulations data

import { Regulation } from '../types';

// mockData.ts
// Placeholder for sample regulations data

export const mockRegulations: Regulation[] = [
  {
    id: '1',
    reference: 'Sample regulation 1',
    // publicationDate must be a Date object to satisfy the Regulation interface
    publicationDate: new Date(),
    type: 'DECREE',
    state: 'PUBLISHED',
    specialNumber: 'D-2024-001',
    content: 'Contenido de ejemplo para la normativa 1.',
    keywords: ['ejemplo', 'test'],
    stateHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    reference: 'Otro decreto importante',
    publicationDate: new Date(),
    type: 'RESOLUTION',
    state: 'PUBLISHED',
    specialNumber: 'R-2024-002',
    content: 'Contenido de ejemplo para la normativa 2.',
    keywords: ['resolucion'],
    stateHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
