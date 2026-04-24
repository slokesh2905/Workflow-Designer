/**
 * Mock workflow fixtures used by MSW handlers.
 * Mirrors the shape that the real API will return.
 */
export const mockWorkflows = [
  {
    id: 'wf-001',
    name: 'New Hire Onboarding',
    description: 'End-to-end onboarding flow for full-time employees.',
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2025-04-10T14:30:00Z',
    nodes: [
      { id: 'n1', type: 'jobRequisition', position: { x: 80, y: 160 }, data: { title: 'Job Requisition', department: 'Engineering' } },
      { id: 'n2', type: 'screening', position: { x: 320, y: 160 }, data: { title: 'Resume Screening', autoScreen: true } },
      { id: 'n3', type: 'interview', position: { x: 560, y: 160 }, data: { title: 'Technical Interview', rounds: 2 } },
      { id: 'n4', type: 'approval', position: { x: 800, y: 160 }, data: { title: 'Hiring Manager Approval', approvers: ['manager@hr.co'] } },
      { id: 'n5', type: 'offerLetter', position: { x: 1040, y: 160 }, data: { title: 'Offer Letter', template: 'standard' } },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2' },
      { id: 'e2-3', source: 'n2', target: 'n3' },
      { id: 'e3-4', source: 'n3', target: 'n4' },
      { id: 'e4-5', source: 'n4', target: 'n5' },
    ],
  },
  {
    id: 'wf-002',
    name: 'Contract Role Approval',
    description: 'Streamlined approval flow for contractor hires.',
    createdAt: '2025-04-01T11:00:00Z',
    updatedAt: '2025-04-15T10:15:00Z',
    nodes: [
      { id: 'n1', type: 'jobRequisition', position: { x: 80, y: 160 }, data: { title: 'Contract Requisition', department: 'Design' } },
      { id: 'n2', type: 'approval', position: { x: 320, y: 160 }, data: { title: 'Budget Approval', approvers: ['finance@hr.co'] } },
      { id: 'n3', type: 'offerLetter', position: { x: 560, y: 160 }, data: { title: 'Contract Letter', template: 'contractor' } },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2' },
      { id: 'e2-3', source: 'n2', target: 'n3' },
    ],
  },
];
