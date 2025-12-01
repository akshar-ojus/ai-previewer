// src/initialElements.js

export const initialNodes = [
  {
    id: '1',
    type: 'input', // Input nodes have handles on the bottom
    data: { label: 'Start Node' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: { label: 'Process Node' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Output Node' },
    position: { x: 400, y: 100 },
  },
];

export const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
];