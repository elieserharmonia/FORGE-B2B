import { User, UserRole, ClientBudget, Forecast, Confidence, Quote, QuoteStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'João Silva', role: UserRole.SELLER },
  { id: '2', name: 'Maria Oliveira', role: UserRole.SELLER },
  { id: '3', name: 'Ricardo Santos', role: UserRole.MANAGER },
];

export const MOCK_CLIENTS = [
  'CATERPILLAR',
  'JOHN DEERE',
  'KOMATSU',
  'VOLVO CE',
  'SCANIA',
  'MERCEDES-BENZ'
];

export const MOCK_SUPPLIERS = [
  'BOSCH IW',
  'PANASONIC',
  '3ARM',
  'LUBBERING',
  'STURTEVANT',
  'DESOUTTER',
  'ATLAS COPCO'
];

export const MOCK_SEGMENTS = [
  'Automotivo',
  'Agrícola',
  'Construção',
  'Mineração',
  'Energia'
];

export const INITIAL_FORECASTS: Forecast[] = [
  {
    id: 'f1',
    clientName: 'CATERPILLAR',
    supplierName: 'PANASONIC',
    sellerId: '1',
    sellerName: 'João Silva',
    amount: 150000,
    confidence: Confidence.C50,
    segment: 'Construção',
    tem_ea: true,
    date: '2024-03-15',
    nextStep: 'Aguardando validação técnica',
    history: []
  },
  {
    id: 'f2',
    clientName: 'CATERPILLAR',
    supplierName: 'BOSCH IW',
    sellerId: '1',
    sellerName: 'João Silva',
    amount: 200000,
    confidence: Confidence.C100,
    segment: 'Construção',
    tem_ea: false,
    date: '2024-03-10',
    nextStep: 'Pedido faturado',
    history: []
  },
  {
    id: 'f3',
    clientName: 'JOHN DEERE',
    supplierName: 'LUBBERING',
    sellerId: '1',
    sellerName: 'João Silva',
    amount: 80000,
    confidence: Confidence.C90,
    segment: 'Agrícola',
    tem_ea: true,
    date: '2024-03-20',
    nextStep: 'Aguardando PO',
    history: []
  },
  {
    id: 'f4',
    clientName: 'KOMATSU',
    supplierName: 'BOSCH IW',
    sellerId: '2',
    sellerName: 'Maria Oliveira',
    amount: 300000,
    confidence: Confidence.C30,
    segment: 'Mineração',
    tem_ea: false,
    date: '2024-03-05',
    nextStep: 'Agendar visita',
    history: []
  },
  {
    id: 'f5',
    clientName: 'VOLVO CE',
    supplierName: '3ARM',
    sellerId: '2',
    sellerName: 'Maria Oliveira',
    amount: 120000,
    confidence: Confidence.C100,
    segment: 'Construção',
    tem_ea: true,
    date: '2024-03-12',
    nextStep: 'Entrega técnica',
    history: []
  },
  {
    id: 'f6',
    clientName: 'SCANIA',
    supplierName: 'PANASONIC',
    sellerId: '1',
    sellerName: 'João Silva',
    amount: 50000,
    confidence: Confidence.C10,
    segment: 'Automotivo',
    tem_ea: false,
    date: '2024-03-18',
    nextStep: 'Primeiro contato',
    history: []
  }
];

export const INITIAL_BUDGETS: ClientBudget[] = [
  {
    id: 'b1',
    org_id: 'org-forge-001',
    name: 'CATERPILLAR',
    sellerId: '1',
    sellerName: 'João Silva',
    year: 2024,
    month: 3,
    suppliers: [
      { id: 's1', name: 'BOSCH IW', goal: 50000, forecast: 42000 },
      { id: 's2', name: 'PANASONIC', goal: 30000, forecast: 15000 },
      { id: 's3', name: '3ARM', goal: 20000, forecast: 22000 },
    ]
  },
  {
    id: 'b2',
    org_id: 'org-forge-001',
    name: 'JOHN DEERE',
    sellerId: '1',
    sellerName: 'João Silva',
    year: 2024,
    month: 3,
    suppliers: [
      { id: 's4', name: 'LUBBERING', goal: 40000, forecast: 38000 },
      { id: 's5', name: 'STURTEVANT', goal: 15000, forecast: 5000 },
    ]
  },
  {
    id: 'b3',
    org_id: 'org-forge-001',
    name: 'KOMATSU',
    sellerId: '2',
    sellerName: 'Maria Oliveira',
    year: 2024,
    month: 3,
    suppliers: [
      { id: 's6', name: 'BOSCH IW', goal: 100000, forecast: 95000 },
    ]
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q1',
    org_id: 'org-forge-001',
    ref: 'ORC-2026-001',
    date: '2026-02-25',
    brand: 'PANASONIC',
    customerName: 'CATERPILLAR',
    customerCnpj: '12.345.678/0001-90',
    totalAmountWithIcms: 45600.50,
    deliveryType: 'CIF',
    paymentTerms: '28 DDL',
    deliveryTime: '15 dias',
    proposalValidity: '30 dias',
    status: QuoteStatus.SENT
  },
  {
    id: 'q2',
    org_id: 'org-forge-001',
    ref: 'ORC-2026-002',
    date: '2026-02-20',
    brand: 'BOSCH IW',
    customerName: 'JOHN DEERE',
    customerCnpj: '98.765.432/0001-10',
    totalAmountWithIcms: 12800.00,
    deliveryType: 'FOB',
    paymentTerms: 'À Vista',
    deliveryTime: 'Pronta Entrega',
    proposalValidity: '15 dias',
    status: QuoteStatus.APPROVED
  },
  {
    id: 'q3',
    org_id: 'org-forge-001',
    ref: 'ORC-2026-003',
    date: '2026-02-15',
    brand: '3ARM',
    customerName: 'KOMATSU',
    customerCnpj: '45.678.901/0001-22',
    totalAmountWithIcms: 89000.00,
    deliveryType: 'CIF',
    paymentTerms: '30/60/90 DDL',
    deliveryTime: '45 dias',
    proposalValidity: '30 dias',
    status: QuoteStatus.LOST,
    lossReason: 'Preço superior ao concorrente local'
  }
];
