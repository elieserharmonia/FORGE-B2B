import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  TrendingUp, 
  Users, 
  Filter, 
  MoreHorizontal,
  ChevronRight,
  DollarSign,
  Briefcase,
  Shield,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  BriefcaseBusiness,
  Contact2,
  ArrowLeft,
  PanelRightClose,
  Star,
  FileText,
  Archive,
  Target,
  BarChart3,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Wrench,
  UserCheck,
  Sparkles,
  Brain,
  MessageSquare,
  FlameKindling,
  Zap,
  Sun,
  Moon,
  Bell,
  Check,
  Copy,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ClientBudget, SupplierBudget, ForecastItem, ForecastHistory, UserRole, Quote, CommandCenterTask, TaskCategory, Customer, Contact } from './types';
import { AICoach } from './components/AICoach';
import { MOCK_USERS, MOCK_CLIENTS, MOCK_SUPPLIERS, INITIAL_BUDGETS, INITIAL_FORECASTS, MOCK_SEGMENTS, INITIAL_QUOTES } from './mockData';
import { BudgetView } from './components/BudgetView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { PostSalesView } from './components/PostSalesView';
import { QuotesView } from './components/QuotesView';
import { ReportsView } from './components/ReportsView';
import { CommandCenterView } from './components/CommandCenterView';
import { Sidebar, BottomNav } from './components/Navigation';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';
import { supabase } from './lib/supabase';

// --- Lógica de Meses Dinâmicos ---
const getDynamicMonths = () => {
  return {
    m0: 'MAR/26',
    m1: 'ABR/26',
    m2: 'MAI/26',
    nextLabel: '2º SEM/26'
  };
};

const DYNAMIC_MONTHS = getDynamicMonths();

// --- Dados Mockados ---
const INITIAL_DATA: ForecastItem[] = [
  { id: 'FRG-001', org_id: 'org-forge-001', resp: 'joao@forge.com', respSigla: 'EF', customer: 'Metalúrgica Norte', supplier: 'SteelCo', description: 'Vigas de Aço H', amount: 150000, uf: 'SP', confidence: '90% (Pedido/PO)', mar26: true, abr26: false, mai26: false, segSem26: false, followUp: 'Aguardando assinatura', contacts: 'Carlos (Engenharia)', tem_ea: true, pendencia_vendedor: false, nextStep: 'Enviar contrato assinado', history: [{ id: 'h1', date: '2026-02-15', report: 'Visita realizada. Cliente gostou da proposta.', nextStep: 'Enviar contrato assinado', planOfAction: { what: 'Enviar contrato assinado', why: 'Formalização', who: 'Carlos', where: 'Escritório', when: '2026-02-16', how: 'E-mail', howMuch: 'R$ 0,00' } }] },
  { id: 'FRG-002', org_id: 'org-forge-001', resp: 'maria@forge.com', respSigla: 'RG', customer: 'AutoParts S.A.', supplier: 'TechPoly', description: 'Polímeros Industriais', amount: 85000, uf: 'PR', confidence: '50% (Interesse)', mar26: false, abr26: true, mai26: false, segSem26: false, followUp: 'Reunião técnica agendada', contacts: 'Ana (Compras)', tem_ea: false, pendencia_vendedor: true, nextStep: 'Apresentar proposta técnica', history: [] },
  { id: 'FRG-003', org_id: 'org-forge-001', resp: 'joao@forge.com', respSigla: 'EF', customer: 'Construtora Delta', supplier: 'SteelCo', description: 'Armações 12mm', amount: 220000, uf: 'MG', confidence: '10% (Sonho)', mar26: false, abr26: false, mai26: true, segSem26: false, followUp: 'Prospecção inicial', contacts: 'Roberto (Sócio)', tem_ea: true, pendencia_vendedor: false, nextStep: 'Agendar visita técnica', history: [] },
  { id: 'FRG-004', org_id: 'org-forge-001', resp: 'admin@forge.com', respSigla: 'WA', customer: 'Energia Solar X', supplier: 'PanelPlus', description: 'Inversores Trifásicos', amount: 450000, uf: 'SC', confidence: '100% (Entregue)', mar26: false, abr26: false, mai26: false, segSem26: true, followUp: 'Pedido faturado', contacts: 'Eng. Paulo', tem_ea: false, pendencia_vendedor: false, po_numero: 'PO-9988', nf_numero: 'NF-1234', data_faturamento: '2026-02-15', status_entrega: 'Entregue', data_garantia: '2027-02-15', tipo_contrato: 'Serviço', nextStep: 'Finalizar instalação', history: [] },
  { id: 'FRG-005', org_id: 'org-forge-001', resp: 'pedro@forge.com', respSigla: 'EF', customer: 'Logística Express', supplier: 'TruckParts', description: 'Manutenção de Frota', amount: 32000, uf: 'RJ', confidence: '90% (Pedido/PO)', mar26: true, abr26: false, mai26: false, segSem26: false, followUp: 'Validação de orçamento', contacts: 'Marcos (Frota)', tem_ea: false, pendencia_vendedor: false, nextStep: 'Aprovar orçamento', history: [] },
  { id: 'FRG-006', org_id: 'org-forge-001', resp: 'maria@forge.com', respSigla: 'RG', customer: 'Mineração Vale', supplier: 'HeavyEquip', description: 'Peças de Reposição', amount: 1200000, uf: 'ES', confidence: '10% (Sonho)', mar26: false, abr26: false, mai26: false, segSem26: true, followUp: 'Análise de crédito', contacts: 'Suprimentos Vale', tem_ea: true, pendencia_vendedor: false, nextStep: 'Enviar documentação financeira', history: [] },
  { id: 'FRG-007', org_id: 'org-forge-001', resp: 'joao@forge.com', respSigla: 'EF', customer: 'Indústria Têxtil ABC', supplier: 'MachineryCo', description: 'Tear Industrial G2', amount: 850000, uf: 'SC', confidence: '100% (Entregue)', mar26: true, abr26: false, mai26: false, segSem26: false, followUp: 'Entrega técnica realizada', contacts: 'Ricardo (Produção)', tem_ea: true, pendencia_vendedor: false, po_numero: 'PO-5544', nf_numero: 'NF-8877', data_faturamento: '2026-02-20', status_entrega: 'Em trânsito', data_garantia: '2028-02-20', tipo_contrato: 'Fornecimento', nextStep: 'Treinamento operacional', history: [] },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: '1',
    org_id: 'org-forge-001',
    cnpj: '12.345.678/0001-90',
    ie: '123.456.789.110',
    name: 'Metalúrgica Norte S.A.',
    nickname: 'Metal Norte',
    address: 'Av. Industrial, 1500',
    cep: '01234-567',
    city: 'São Paulo',
    state: 'SP',
    segment: 'Metalurgia',
    seller: 'EF',
    contacts: [
      { id: 'c1', name: 'Carlos Silva', role: 'Gerente de Engenharia', phone: '(11) 4002-8922', cell: '(11) 98888-7777', email: 'carlos@metalnorte.com' }
    ]
  },
  {
    id: '2',
    org_id: 'org-forge-001',
    cnpj: '98.765.432/0001-10',
    ie: '987.654.321.000',
    name: 'AutoParts Brasil Ltda',
    nickname: 'AutoParts',
    address: 'Rua das Peças, 45',
    cep: '80000-000',
    city: 'Curitiba',
    state: 'PR',
    segment: 'Automotivo',
    seller: 'RG',
    contacts: []
  }
];

const CUSTOMER_SEGMENTS = ['Metalurgia', 'Automotivo', 'Energia', 'Mineração', 'Logística'];

const CONFIDENCE_LEVELS = [
  '0% (Perdida)', 
  '10% (Sonho)', 
  '30% (Orçamento)', 
  '40% (Demo)', 
  '50% (Interesse)', 
  '80% (Pedido/RFQ)', 
  '90% (Pedido/PO)', 
  '100% (Entregue)'
] as const;

const formatDateDots = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  return `${d}.${m}.${y}`;
};

const getStatusColor = (item: ForecastItem) => {
  if (item.pendencia_vendedor) return '#FFEB3B'; // AMARELO (Pendência)
  const percentage = parseInt(item.confidence);
  if (percentage >= 50 && percentage < 100) return '#FF0000'; // VERMELHO (Confidence >= 50%)
  if (item.confidence.includes('100%')) return '#00E676'; // VERDE (Fechado)
  if (item.confidence.includes('0%')) return '#808080'; // CINZA (Perdida)
  return null; // PADRÃO
};

const isCoolingDown = (item: ForecastItem) => {
  if (!item.history || item.history.length === 0) return false;
  const percentage = parseInt(item.confidence);
  if (percentage < 50) return false;

  const lastDate = new Date(item.history[0].date);
  const today = new Date('2026-03-01');
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays > 7;
};

interface KanbanCardProps {
  item: ForecastItem;
  onEdit: (item: ForecastItem) => void;
  onDelete: (id: string) => void;
  technicalRoleName: string;
  isCoolingDown: (item: ForecastItem) => boolean;
  theme: 'dark' | 'light';
}

const KanbanCard: React.FC<KanbanCardProps> = ({ item, onEdit, onDelete, technicalRoleName, isCoolingDown, theme }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const statusColor = getStatusColor(item);

  return (
    <div 
      className={`relative h-52 w-full [perspective:1000px] cursor-pointer group ${item.tem_ea ? `rounded-xl border-2 border-[#FFD700] shadow-[0_0_10px_#FFD700]` : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative [transform-style:preserve-3d]"
      >
        {/* Front Side */}
        <div 
          className={`absolute inset-0 [backface-visibility:hidden] ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border p-4 rounded-xl shadow-xl flex flex-col justify-between group-hover:border-${theme === 'dark' ? '[#00E676]/30' : 'blue-500/30'} transition-all`}
          style={statusColor ? { 
            borderLeft: item.tem_ea ? `12px solid #FFD700` : `6px solid ${statusColor}`, 
            backgroundColor: statusColor,
            color: statusColor === '#FF0000' ? '#FFFFFF' : '#000000',
            fontWeight: 'bold'
          } : {
            borderLeft: item.tem_ea ? `12px solid #FFD700` : undefined
          }}
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className={`text-[10px] font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')}`}>{item.id}</span>
                {item.tem_ea && <span className={`text-[8px] ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : 'text-[#FFD700]'} font-bold uppercase tracking-tighter`}>Projeto com {technicalRoleName}</span>}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className={`p-1 ${statusColor ? 'hover:bg-black/10' : (theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')} rounded ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : 'text-zinc-500'} transition-colors`}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className={`p-1 ${statusColor ? 'hover:bg-black/10' : (theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100')} rounded ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : 'text-zinc-500'} transition-colors`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <h4 className={`text-sm font-bold ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-white' : 'text-zinc-900')} transition-colors flex items-center gap-2`}>
              {item.customer}
              {isCoolingDown(item) && <FlameKindling className="w-3 h-3 text-orange-500" />}
            </h4>
            <p className={`text-[10px] ${statusColor ? (statusColor === '#FF0000' ? 'text-white/80' : 'text-black/80') : 'text-zinc-500'} mt-1 line-clamp-2 leading-relaxed`}>{item.description}</p>
          </div>
          
          <div className={`mt-auto pt-4 border-t ${statusColor ? (statusColor === '#FF0000' ? 'border-white/20' : 'border-black/10') : (theme === 'dark' ? 'border-white/5' : 'border-zinc-100')} flex items-center justify-between`}>
            <span className={`text-xs font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-white' : 'text-zinc-900')}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', compactDisplay: 'short' }).format(item.amount)}
            </span>
            <div className={`flex items-center gap-1 ${statusColor ? (statusColor === '#FF0000' ? 'text-white/60' : 'text-black/60') : 'text-zinc-600'} transition-colors`}>
              <span className="text-[10px] uppercase font-bold tracking-tighter">Girar</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className={`absolute inset-0 [backface-visibility:hidden] ${theme === 'dark' ? 'bg-zinc-800 border-[#00E676]/30' : 'bg-zinc-50 border-blue-500/30'} border p-4 rounded-xl shadow-xl flex flex-col justify-between`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest`}>Detalhes Técnicos</span>
              <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white bg-[#00E676]/20' : 'text-blue-600 bg-blue-50'} px-2 py-0.5 rounded`}>{item.uf}</span>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'} leading-relaxed italic`}>"{item.description}"</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500 uppercase">Fornecedor:</span>
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>{item.supplier}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500 uppercase">Contatos:</span>
                <span className={`${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'} truncate max-w-[120px]`}>{item.contacts}</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Clique para voltar</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ScriptModal: React.FC<{
  script: { title: string; content: string };
  onClose: () => void;
  theme: 'dark' | 'light';
}> = ({ script, onClose, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(script.content)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200 shadow-2xl'} border rounded-3xl p-8 max-w-lg w-full`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-[#00E676]/10' : 'bg-blue-50'}`}>
              <MessageSquare className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Script de Mensagem</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Contexto: {script.title}</p>
          <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-200'} border text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'} italic`}>
            {script.content}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all border ${
              theme === 'dark' ? 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-[#00E676]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </button>
          <button 
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  // --- Estados de Autenticação ---
  const [session, setSession] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- Estados ---
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [notifications, setNotifications] = useState<{ id: string; title: string; time: string; read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeModule, setActiveModule] = useState<'forecast' | 'customers' | 'post-sales' | 'budget' | 'dashboard' | 'settings' | 'quotes' | 'command-center' | 'reports'>('command-center');
  const [data, setData] = useState<ForecastItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tasks, setTasks] = useState<CommandCenterTask[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedScript, setSelectedScript] = useState<{ title: string; content: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.MANAGER);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  // --- Lógica de Autenticação ---
  React.useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setFetchError(null);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, organizacoes(name)')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (error) throw error;

      if (profile) {
        setUserProfile(profile as any);
        setUserRole(profile.role as UserRole);
        setCurrentUserEmail(profile.email);
        setCurrentOrgId(profile.org_id);
        setOrganizationName((profile as any).organizacoes?.name || 'Empresa');
      } else {
        // No profile found, ensure we trigger onboarding
        setUserProfile(null);
        setCurrentOrgId(null);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setFetchError('Erro ao carregar dados. Tente atualizar a página.');
      setUserProfile(null);
      setCurrentOrgId(null);
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingOrg(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
  };

  const handleInviteUser = async (email: string, role: UserRole) => {
    if (!currentOrgId) throw new Error('Organização não identificada.');
    
    const { error } = await supabase
      .from('convites')
      .insert({
        email,
        role,
        org_id: currentOrgId
      });

    if (error) throw error;
  };

  React.useEffect(() => {
    if (!currentOrgId) return;
    const fetchData = async () => {
      try {
        const [forecasts, customersData, tasksData] = await Promise.all([
          dataService.getForecasts(currentOrgId),
          dataService.getCustomers(currentOrgId),
          dataService.getTasks(currentOrgId)
        ]);
        setData(forecasts);
        setCustomers(customersData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [currentOrgId]);

  // --- Estados Configurações ---
  const [technicalRoleName, setTechnicalRoleName] = useState('Engenheiro de Aplicação');
  const [users, setUsers] = useState<UserProfile[]>([
    { id: '1', name: 'João Vendedor', email: 'joao@forge.com', role: UserRole.SELLER },
    { id: '2', name: 'Admin Gestor', email: 'admin@forge.com', role: UserRole.MANAGER },
    { id: '3', name: 'Carlos Técnico', email: 'carlos@forge.com', role: UserRole.ENGINEER },
  ]);
  
  // Modais Forecast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ForecastItem | null>(null);

  // --- Estados Budget ---
  const [budgets, setBudgets] = useState<ClientBudget[]>(INITIAL_BUDGETS);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Modais/Drawer Clientes
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.log('Audio context not supported or blocked');
    }
  };

  // --- Lógica de Comando ---
  const handleAddTask = async (task: Omit<CommandCenterTask, 'id' | 'org_id'>) => {
    const newTask: CommandCenterTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      org_id: currentOrgId
    };
    try {
      const savedTask = await dataService.saveTask(newTask);
      setTasks(prev => [...prev, savedTask]);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updatedTask = { ...task, completed: !task.completed };
    try {
      const savedTask = await dataService.saveTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === id ? savedTask : t));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await dataService.deleteTask(id, currentOrgId);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // --- IA: Sua Melhor Ação Agora ---
  const bestAction = React.useMemo(() => {
    // 1. [S] Sales: Ações de fechamento para funil >= 50%
    const closingOpps = data.filter(item => {
      const confidence = parseInt(item.confidence);
      return confidence >= 50 && confidence < 100;
    });

    if (closingOpps.length > 0) {
      const opp = closingOpps[0];
      return {
        id: `best-${opp.id}`,
        title: `[S] Sales: Fechamento ${opp.customer}`,
        description: `Oportunidade em ${opp.confidence}. O próximo passo é "${opp.nextStep}". Foco total no fechamento.`,
        script: `Oi, aqui é o ${userProfile?.name || 'Elieser'}. Estou entrando em contato para avançarmos no fechamento da proposta de ${opp.description} na ${opp.customer}. O ${technicalRoleName} já validou os pontos técnicos e estamos prontos para o próximo passo: ${opp.nextStep}. Como podemos agilizar?`,
        type: 'critical' as const,
        category: TaskCategory.SALES
      };
    }

    // 2. [S] Service: Apoio técnico/dúvidas (Prioridade se tiver EA/WA)
    const serviceOpps = data.filter(item => item.tem_ea || item.pendencia_vendedor);
    if (serviceOpps.length > 0) {
      const opp = serviceOpps[0];
      return {
        id: `best-${opp.id}`,
        title: `[S] Service: Apoio Técnico ${opp.customer}`,
        description: `Cliente ${opp.customer} necessita de alinhamento técnico. ${opp.pendencia_vendedor ? 'Pendência ativa detectada.' : 'Projeto com suporte EA/WA.'}`,
        script: `Olá, aqui é o ${userProfile?.name || 'Elieser'}. Gostaria de alinhar os detalhes técnicos sobre ${opp.description} na ${opp.customer}. O ${technicalRoleName} está me apoiando para resolvermos ${opp.nextStep || 'as dúvidas pendentes'}. Podemos falar agora?`,
        type: 'pending' as const,
        category: TaskCategory.SERVICE
      };
    }

    return {
      id: 'best-default',
      title: "[M] Maintenance: Mantenha o Ritmo",
      description: "Pipeline saudável. Que tal uma visita de relacionamento em algum cliente da base?",
      script: `Olá, aqui é o ${userProfile?.name || 'Elieser'}. Faz um tempo que não nos falamos! Gostaria de agendar uma visita rápida na sua empresa para entender como estão os processos e como a Forge pode continuar apoiando vocês. O que acha?`,
      type: 'info' as const,
      category: TaskCategory.MAINTENANCE
    };
  }, [data, technicalRoleName]);

  // Sync 5W2H to Tasks
  React.useEffect(() => {
    data.forEach(item => {
      if (item.nextStep) {
        const taskTitle = `5W2H: ${item.nextStep} (${item.customer})`;
        const taskExists = tasks.some(t => t.title === taskTitle);
        if (!taskExists) {
          handleAddTask({
            title: taskTitle,
            date: item.planOfAction?.when || new Date().toISOString().split('T')[0],
            time: '09:00',
            category: TaskCategory.SALES,
            completed: false,
            relatedForecastId: item.id
          });
        }
      }
    });
  }, [data]);

  // Task Notifications (30 min antes)
  React.useEffect(() => {
    const checkTasks = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.getHours() * 60 + now.getMinutes();

      tasks.forEach(task => {
        if (!task.completed && task.date === today) {
          const [hours, minutes] = task.time.split(':').map(Number);
          const taskTime = hours * 60 + minutes;
          const diff = taskTime - currentTime;

          // Notificar 30 minutos antes
          if (diff === 30) {
            const notificationId = `notif-${task.id}-${task.time}`;
            if (!notifications.some(n => n.id === notificationId)) {
              const newNotif = {
                id: notificationId,
                title: `Compromisso em 30min: ${task.title}`,
                description: `Ação agendada para as ${task.time}`,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                read: false,
                type: 'alert'
              };
              setNotifications(prev => [newNotif, ...prev]);
              playNotificationSound();
            }
          }
        }
      });
    };

    const interval = setInterval(checkTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, notifications]);

  // --- Lógica de Filtro Forecast ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Regra de Entrada Pós-Venda: 
      // Se Confidence = 100% (Entregue), move para Pós-Venda.
      const isPostSalesReady = item.confidence === '100% (Entregue)';
      const shouldBeInForecast = !isPostSalesReady;

      if (!shouldBeInForecast) return false;

      // Regra de Negócio por Role: 
      let roleMatch = false;
      if (userRole === UserRole.MANAGER || userRole === UserRole.DIRECTOR) roleMatch = true;
      else if (userRole === UserRole.SELLER) roleMatch = item.resp === currentUserEmail;
      else if (userRole === UserRole.ENGINEER) roleMatch = item.tem_ea;
      
      // Filtro de Busca
      const searchMatch = 
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      return roleMatch && searchMatch;
    });
  }, [data, searchTerm, userRole, currentUserEmail]);

  // --- Lógica de Filtro Pós-Venda ---
  const postSalesData = useMemo(() => {
    return data.filter(item => {
      const isPostSalesReady = item.confidence === '100% (Entregue)';
      if (!isPostSalesReady || item.arquivado) return false;

      // Filtro de Busca
      const searchMatch = 
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.po_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nf_numero?.toLowerCase().includes(searchTerm.toLowerCase());

      return searchMatch;
    });
  }, [data, searchTerm]);

  // --- Lógica de Filtro Clientes ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  // --- CRUD Handlers Forecast ---
  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: ForecastItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir esta oportunidade?')) {
      try {
        await dataService.deleteForecast(id, currentOrgId);
        setData(prev => prev.filter(i => i.id !== id));
      } catch (error) {
        console.error('Error deleting from Supabase:', error);
      }
    }
  };

  const handleSave = async (item: ForecastItem) => {
    // Regra de Salvamento: 5W2H obrigatório
    if (!item.planOfAction || 
        !item.planOfAction.what || 
        !item.planOfAction.why || 
        !item.planOfAction.who || 
        !item.planOfAction.where || 
        !item.planOfAction.when || 
        !item.planOfAction.how || 
        !item.planOfAction.howMuch) {
      alert('Todos os campos do Plano de Ação (5W2H) são obrigatórios para salvar a atualização.');
      return;
    }

    // Automação de Migração: 100% (Entregue)
    let finalItem = { ...item };
    if (item.confidence === '100% (Entregue)') {
      alert('Oportunidade concluída! Movendo para Pós-Venda...');
      // Garantir PO e NF para o Pós-Venda
      finalItem.po_numero = item.po_numero || `PO-${Math.floor(Math.random() * 10000)}`;
      finalItem.nf_numero = item.nf_numero || `NF-${Math.floor(Math.random() * 10000)}`;
      finalItem.status_entrega = 'Aguardando';
    }

    // Gerar o nextStep a partir do what do 5W2H para manter compatibilidade
    const formattedDate = formatDateDots(new Date());
    const newInteraction = finalItem.followUp;
    
    let cumulativeFollowUp = finalItem.followUp;
    if (editingItem && newInteraction) {
      cumulativeFollowUp = `${formattedDate} - ${newInteraction}\n${editingItem.followUp || ''}`.trim();
    } else if (!editingItem && newInteraction) {
      cumulativeFollowUp = `${formattedDate} - ${newInteraction}`;
    }

    const updatedItem = {
      ...finalItem,
      followUp: cumulativeFollowUp,
      nextStep: finalItem.planOfAction.what
    };

    const historyEntry: ForecastHistory = {
      id: Math.random().toString(36).substr(2, 9),
      date: formattedDate,
      report: newInteraction || 'Atualização de Plano de Ação',
      nextStep: updatedItem.nextStep,
      planOfAction: finalItem.planOfAction
    };
    
    const itemToSave: ForecastItem = {
      ...updatedItem,
      org_id: currentOrgId,
      history: [historyEntry, ...(finalItem.history || [])]
    };

    try {
      const savedItem = await dataService.saveForecast(itemToSave);
      setData(prev => {
        const exists = prev.find(i => i.id === savedItem.id);
        if (exists) {
          return prev.map(i => i.id === savedItem.id ? savedItem : i);
        }
        return [savedItem, ...prev];
      });
      
      // Simulação de Notificação de Plano de Ação
      alert(`NOTIFICAÇÃO: Plano de Ação 5W2H gerado para ${finalItem.customer}.\nEnviado para: ${finalItem.resp} e ${technicalRoleName}.`);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      alert('Erro ao salvar no banco de dados. Verifique sua conexão.');
    }
    setIsModalOpen(false);
  };

  // --- Handlers Configurações ---
  const handleResetSystem = () => {
    setData([]);
    setCustomers([]);
    alert('Sistema zerado com sucesso. Todos os clientes e oportunidades foram removidos.');
  };

  const handleUploadQuote = (cnpj: string, fileName: string) => {
    // Simulação de leitura inteligente de Excel
    const mockAmountFromExcel = Math.random() * 100000;
    
    if (mockAmountFromExcel > 50000) {
      alert(`ALERTA GESTOR: Orçamento de alto valor detectado (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockAmountFromExcel)}). Envolvimento do ${technicalRoleName} obrigatório (Linha Dourada).`);
      
      setData(prev => prev.map(item => {
        const customer = customers.find(c => c.cnpj === cnpj);
        if (item.customer === customer?.name) {
          return { ...item, tem_ea: true };
        }
        return item;
      }));
    }

    setQuotes(prev => [...prev, {
      id: `Q-${Math.floor(Math.random() * 1000)}`,
      ref: `REF-${Math.floor(Math.random() * 10000)}`,
      data: new Date().toISOString().split('T')[0],
      marca: 'Milwaukee',
      cliente_cnpj: cnpj,
      valor_total: mockAmountFromExcel,
      tipo_entrega: 'CIF',
      prazo_pagamento: '28 dias',
      prazo_entrega: '15 dias',
      validade: '10 dias',
      status: 'Enviado'
    }]);
  };

  const handleSaveQuote = (quote: Quote) => {
    setQuotes(prev => {
      const exists = prev.find(q => q.id === quote.id);
      if (exists) {
        return prev.map(q => q.id === quote.id ? quote : q);
      }
      return [quote, ...prev];
    });
  };

  const handleDeleteQuote = (id: string) => {
    if (window.confirm('Deseja realmente excluir este orçamento?')) {
      setQuotes(prev => prev.filter(q => q.id !== id));
    }
  };

  // --- CRUD Handlers Clientes ---
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este cliente?')) {
      try {
        await dataService.deleteCustomer(id, currentOrgId);
        setCustomers(prev => prev.filter(c => c.id !== id));
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Erro ao excluir cliente.');
      }
    }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    const customerToSave = {
      ...customer,
      org_id: currentOrgId,
      id: customer.id || Math.random().toString(36).substr(2, 9)
    };

    try {
      const savedCustomer = await dataService.saveCustomer(customerToSave);
      if (editingCustomer) {
        setCustomers(prev => prev.map(c => c.id === savedCustomer.id ? savedCustomer : c));
        if (selectedCustomer?.id === savedCustomer.id) setSelectedCustomer(savedCustomer);
      } else {
        setCustomers(prev => [...prev, savedCustomer]);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Erro ao salvar cliente.');
    }
    setIsCustomerModalOpen(false);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (!selectedCustomer) return;
    if (window.confirm('Deseja excluir este contato?')) {
      const updatedCustomer = {
        ...selectedCustomer,
        contacts: selectedCustomer.contacts.filter(c => c.id !== contactId)
      };
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
    }
  };

  const handleSaveContact = (contact: Contact) => {
    if (!selectedCustomer) return;
    let updatedContacts;
    if (editingContact) {
      updatedContacts = selectedCustomer.contacts.map(c => c.id === contact.id ? contact : c);
    } else {
      updatedContacts = [...selectedCustomer.contacts, { ...contact, id: Math.random().toString(36).substr(2, 9) }];
    }
    const updatedCustomer = { ...selectedCustomer, contacts: updatedContacts };
    setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
    setIsContactModalOpen(false);
  };

  // --- Cálculos de Resumo (Para Gestor) ---
  const totalAmount = useMemo(() => 
    filteredData.reduce((acc, curr) => acc + curr.amount, 0), 
  [filteredData]);

  const avgConfidence = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + parseInt(curr.confidence), 0);
    return Math.round(sum / filteredData.length);
  }, [filteredData]);

  if (fetchError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-zinc-900 font-bold text-center">{fetchError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-black text-white rounded-xl font-bold"
        >
          Atualizar Página
        </button>
      </div>
    );
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold">Carregando Centro de Comando...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginView onLogin={(orgId, profile) => {
      setSession(true); // This will trigger the useEffect to fetch profile
    }} />;
  }

  // Defensive rendering: If logged in, show the basic layout.
  // If data is missing, the main content will show a "Configure" prompt.
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#FFFFFF] text-[#000000]'}`}>
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} theme={theme} userRole={userRole} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header Superior */}
        <header className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-black/80 border-white/5' : 'bg-white/80 border-zinc-200'} border-b backdrop-blur-xl px-6 py-4`}>
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-50 lg:hidden">FORGE</h2>
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-white/5">
                  <Building2 className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{organizationName || 'Carregando...'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#00E676] uppercase">Sistema Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-lg transition-colors text-zinc-500 hover:text-${theme === 'dark' ? 'white' : 'zinc-900'}`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} font-bold`}>
                    {userProfile?.name || 'Usuário'}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{userRole}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className={`w-8 h-8 ${theme === 'dark' ? 'bg-zinc-800 border-white/10 hover:bg-red-500/20' : 'bg-zinc-100 border-zinc-200 hover:bg-red-50'} rounded-full border flex items-center justify-center transition-colors group/logout`}
                  title="Sair"
                >
                  <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400 group-hover/logout:text-red-500' : 'text-zinc-600 group-hover/logout:text-red-600'}`} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1600px] mx-auto w-full pb-24 lg:pb-8">
          {(!userProfile || !currentOrgId) ? (
            <OnboardingView 
              userId={session.user.id}
              userEmail={session.user.email}
              onComplete={() => fetchProfile(session.user.id)}
              onLogout={handleLogout}
            />
          ) : (
            <>
              {/* PAINEL GLOBAL: SUA MELHOR AÇÃO AGORA */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-8 p-6 rounded-2xl border ${
                  bestAction.type === 'critical' ? 'bg-red-500/10 border-red-500/20' : 
                  bestAction.type === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20' : 
                  (theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm')
                } backdrop-blur-sm relative overflow-hidden group`}
              >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain className={`w-24 h-24 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                bestAction.type === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
                bestAction.type === 'pending' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' : 
                (theme === 'dark' ? 'bg-[#00E676]/20 border-[#00E676]/30 text-[#00E676]' : 'bg-blue-50 border-blue-100 text-blue-600')
              }`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    bestAction.type === 'critical' ? 'text-red-500' : 
                    bestAction.type === 'pending' ? (theme === 'dark' ? 'text-yellow-500' : 'text-amber-600') : 
                    (theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400')
                  }`}>Sua Melhor Ação Agora</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-600'}`}>IA Proativa</span>
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight`}>{bestAction.title}</h3>
                <p className={`text-sm mt-1 max-w-2xl ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{bestAction.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedScript({ title: bestAction.title, content: bestAction.script })}
                className={`flex items-center gap-2 ${
                  bestAction.type === 'critical' ? 'bg-red-600 hover:bg-red-500 text-white' : 
                  bestAction.type === 'pending' ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 
                  (theme === 'dark' ? 'bg-[#00E676] hover:bg-[#00E676]/90 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white')
                } px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg`}
              >
                <MessageSquare className="w-4 h-4" />
                Gerar Script WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
        
        {activeModule === 'dashboard' ? (
          <DashboardView 
            forecasts={data.filter(item => {
              if (userRole === UserRole.MANAGER || userRole === UserRole.DIRECTOR) return true;
              if (userRole === UserRole.SELLER) return item.resp === currentUserEmail;
              if (userRole === UserRole.ENGINEER) return item.tem_ea;
              return false;
            }).map(i => ({
              id: i.id,
              clientName: i.customer,
              supplierName: i.supplier,
              sellerId: i.resp,
              sellerName: i.resp.split('@')[0],
              amount: i.amount,
              confidence: parseInt(i.confidence) as any,
              segment: 'Metalurgia', // Mock
              tem_ea: i.tem_ea,
              date: '2026-02-28',
              nextStep: i.nextStep,
              history: i.history
            }))}
            budgets={budgets}
            users={users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role as any }))}
            suppliers={MOCK_SUPPLIERS}
            segments={MOCK_SEGMENTS}
            technicalRoleName={technicalRoleName}
            theme={theme}
          />
        ) : activeModule === 'command-center' ? (
          <CommandCenterView 
            data={data}
            customers={customers}
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            theme={theme}
            technicalRoleName={technicalRoleName}
          />
        ) : activeModule === 'settings' ? (
          (userRole === UserRole.MANAGER || userRole === UserRole.DIRECTOR) ? (
            <SettingsView 
              technicalRoleName={technicalRoleName}
              setTechnicalRoleName={setTechnicalRoleName}
              users={users}
              onInviteUser={handleInviteUser}
              onResetSystem={handleResetSystem}
              theme={theme}
              userRole={userRole}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Acesso Restrito</h2>
              <p className="text-zinc-500">Apenas administradores podem acessar as configurações.</p>
            </div>
          )
        ) : activeModule === 'quotes' ? (
          <QuotesView 
            quotes={quotes}
            onSave={handleSaveQuote}
            onDelete={handleDeleteQuote}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            customers={customers.map(c => ({ name: c.name, cnpj: c.cnpj }))}
            theme={theme}
            orgId={currentOrgId}
          />
        ) : activeModule === 'reports' ? (
          <ReportsView 
            data={data}
            tasks={tasks}
            customers={customers}
            theme={theme}
            technicalRoleName={technicalRoleName}
          />
        ) : activeModule === 'forecast' ? (
          <>
            {/* Header da Tela Forecast */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} tracking-tight`}>Forecast</h2>
                <p className="text-zinc-500 text-sm mt-1">Gerenciamento de oportunidades e projeção de vendas.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Add Button */}
                <button 
                  onClick={handleAdd}
                  className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] hover:bg-[#00E676]/90 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'} px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg`}
                >
                  <Plus className="w-4 h-4" />
                  Nova Oportunidade
                </button>

                {/* Search */}
                <div className="relative group">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} transition-colors`} />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente ou fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900'} border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} focus:ring-1 focus:ring-${theme === 'dark' ? '[#00E676]/20' : 'blue-500/20'} transition-all`}
                  />
                </div>

                {/* View Toggle */}
                <div className={`flex ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'} rounded-xl p-1 border`}>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all ${viewMode === 'table' ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <TableIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Tabela</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all ${viewMode === 'kanban' ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Kanban</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Manager Summary - Visível para todos agora */}
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                <div className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} p-5 rounded-2xl backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Orçado</span>
                    <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                  </div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
                  </p>
                  <div className={`mt-2 flex items-center gap-1 text-[10px] ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.5% vs mês anterior</span>
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} p-5 rounded-2xl backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Oportunidades</span>
                    <Briefcase className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'}`} />
                  </div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>{filteredData.length}</p>
                  <p className="text-zinc-500 text-[10px] mt-2">Ativas no pipeline atual</p>
                </div>

                <div className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} p-5 rounded-2xl backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Conversão Média</span>
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>{avgConfidence}%</p>
                  <div className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'} h-1 rounded-full mt-3 overflow-hidden`}>
                    <div className="bg-amber-500 h-full" style={{ width: `${avgConfidence}%` }} />
                  </div>
                </div>

                <div className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} p-5 rounded-2xl backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Alertas</span>
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  </div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>02</p>
                  <p className="text-zinc-500 text-[10px] mt-2">Follow-ups atrasados</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Content Area Forecast */}
            <div className="relative">
              {viewMode === 'table' ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className={`${theme === 'dark' ? 'bg-zinc-900/30 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl overflow-hidden`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-zinc-200 bg-zinc-50'}`}>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">ID</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">RESP.</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Supplier</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Description</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">UF</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Confidence</th>
                          <th className={`px-4 py-4 text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest whitespace-nowrap text-center`}>{DYNAMIC_MONTHS.m0}</th>
                          <th className={`px-4 py-4 text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest whitespace-nowrap text-center`}>{DYNAMIC_MONTHS.m1}</th>
                          <th className={`px-4 py-4 text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest whitespace-nowrap text-center`}>{DYNAMIC_MONTHS.m2}</th>
                          <th className={`px-4 py-4 text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest whitespace-nowrap text-center`}>{DYNAMIC_MONTHS.nextLabel}</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Follow-up</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-zinc-100'}`}>
                        {filteredData.map((item) => {
                          const statusColor = getStatusColor(item);
                          return (
            <tr 
              key={item.id} 
              className={`hover:${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-zinc-50'} transition-colors group`}
              style={statusColor ? { 
                borderLeft: item.tem_ea ? `12px solid #FFD700` : `6px solid ${statusColor}`, 
                backgroundColor: statusColor,
                color: (statusColor === '#FF0000' || statusColor === '#00E676') ? '#FFFFFF' : '#000000',
                fontWeight: 'bold'
              } : {
                borderLeft: item.tem_ea ? `12px solid #FFD700` : undefined
              }}
            >
                              <td className={`px-6 py-4 text-xs font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')}`}>
                                {item.id}
                              </td>
                              <td className={`px-6 py-4 text-xs font-bold ${statusColor ? (statusColor === '#FF0000' ? 'text-white/80' : 'text-black/80') : 'text-zinc-400'}`}>{item.respSigla}</td>
                              <td className={`px-6 py-4 text-sm font-medium ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-[#000000]') : (theme === 'dark' ? 'text-white' : 'text-[#000000]')} whitespace-nowrap`}>
                                <div className="flex items-center gap-2">
                                  {item.customer}
                                  {item.pendencia_vendedor && <AlertCircle className={`w-3 h-3 ${statusColor === '#FFEB3B' ? 'text-black' : 'text-yellow-400'}`} />}
                                  {item.tem_ea && <Star className={`w-3 h-3 ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : 'text-[#FFD700] fill-[#FFD700]'}`} title="Projeto com EA/WA" />}
                                  {isCoolingDown(item) && (
                                    <div className="flex items-center gap-1 text-orange-500 animate-pulse" title="Oportunidade Esfriando (> 7 dias sem follow-up)">
                                      <FlameKindling className="w-3 h-3" />
                                      <Zap className="w-2 h-2 opacity-50" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-xs ${statusColor ? (statusColor === '#FF0000' ? 'text-white/70' : 'text-black/70') : 'text-zinc-400'} whitespace-nowrap`}>{item.supplier}</td>
                              <td className={`px-6 py-4 text-xs ${statusColor ? (statusColor === '#FF0000' ? 'text-white/60' : 'text-black/60') : 'text-zinc-500'} max-w-[200px] truncate`}>{item.description}</td>
                              <td className={`px-6 py-4 text-sm font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-[#000000]') : (theme === 'dark' ? 'text-white' : 'text-[#000000]')} whitespace-nowrap`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                              </td>
                              <td className={`px-6 py-4 text-xs font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white/70' : 'text-black/70') : 'text-zinc-400'}`}>{item.uf}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  statusColor ? (statusColor === '#FF0000' ? 'bg-white/20 text-white' : 'bg-black/10 text-black') :
                                  (item.confidence.includes('100%') ? 'bg-[#00E676]/10 text-[#00E676]' :
                                  item.confidence.includes('90%') ? 'bg-blue-500/10 text-blue-500' :
                                  item.confidence.includes('50%') ? 'bg-red-500/10 text-red-500' :
                                  item.confidence.includes('0%') ? 'bg-zinc-500/10 text-zinc-500' :
                                  'bg-zinc-500/10 text-zinc-500')
                                }`}>
                                  {item.confidence}
                                </span>
                              </td>
                            <td className={`px-4 py-4 text-center font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')} text-sm`}>{item.mar26 ? 'X' : ''}</td>
                            <td className={`px-4 py-4 text-center font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')} text-sm`}>{item.abr26 ? 'X' : ''}</td>
                            <td className={`px-4 py-4 text-center font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')} text-sm`}>{item.mai26 ? 'X' : ''}</td>
                            <td className={`px-4 py-4 text-center font-mono ${statusColor ? (statusColor === '#FF0000' ? 'text-white' : 'text-black') : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')} text-sm`}>{item.segSem26 ? 'X' : ''}</td>
                            <td className="px-6 py-4 text-xs text-zinc-500 italic whitespace-nowrap">
                              <div className="flex flex-col">
                                <span>{item.followUp}</span>
                                {item.planOfAction?.when && (
                                  <span className="text-[9px] text-zinc-600 font-mono mt-0.5">
                                    {(() => {
                                      const targetDate = new Date(item.planOfAction.when);
                                      const today = new Date('2026-03-01');
                                      const diffTime = targetDate.getTime() - today.getTime();
                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                      return diffDays > 0 ? `T-${diffDays} dias` : diffDays === 0 ? 'HOJE' : `Atrasado ${Math.abs(diffDays)}d`;
                                    })()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-400 whitespace-nowrap">{item.contacts}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleEdit(item)}
                                  className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
                >
                  {CONFIDENCE_LEVELS.map((level) => (
                    <div key={level} className="flex-shrink-0 w-80">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{level}</h3>
                          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'} px-1.5 py-0.5 rounded`}>
                            {filteredData.filter(i => i.confidence === level).length}
                          </span>
                        </div>
                        <div className={`h-[1px] flex-grow mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-200'}`} />
                      </div>
                      
                      <div className="space-y-4">
                        {filteredData.filter(i => i.confidence === level).map((item) => (
                          <KanbanCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} technicalRoleName={technicalRoleName} isCoolingDown={isCoolingDown} theme={theme} />
                        ))}
                        
                        {filteredData.filter(i => i.confidence === level).length === 0 && (
                          <div className="border-2 border-dashed border-white/5 rounded-xl h-32 flex items-center justify-center">
                            <span className="text-[10px] text-zinc-700 uppercase tracking-widest">Sem itens</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </>
        ) : activeModule === 'post-sales' ? (
          <PostSalesView 
            data={postSalesData} 
            onUpdate={(item) => setData(prev => prev.map(i => i.id === item.id ? item : i))}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            theme={theme}
          />
        ) : activeModule === 'budget' ? (
          <BudgetView 
            data={data}
            budgets={budgets}
            setBudgets={setBudgets}
            userRole={userRole}
            currentUser={{ id: currentUserEmail === 'joao@forge.com' ? '1' : '3', name: userRole === 'Gestor' ? 'Ricardo Santos' : 'João Silva', role: userRole as any }}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            isModalOpen={isBudgetModalOpen}
            setIsModalOpen={setIsBudgetModalOpen}
            theme={theme}
            orgId={currentOrgId}
            isLoadingOrg={isLoadingOrg}
          />
        ) : (
          <>
            {/* Header da Tela Clientes */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} tracking-tight`}>Clientes</h2>
                <p className="text-zinc-500 text-sm mt-1">Hub central da base instalada e gestão de contatos.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleAddCustomer}
                  className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] hover:bg-[#00E676]/90 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'} px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg`}
                >
                  <Plus className="w-4 h-4" />
                  Novo Cliente
                </button>

                <div className="relative group">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} transition-colors`} />
                  <input 
                    type="text" 
                    placeholder="Buscar por CNPJ ou Cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900'} border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} focus:ring-1 focus:ring-${theme === 'dark' ? '[#00E676]/20' : 'blue-500/20'} transition-all`}
                  />
                </div>

                <div className={`flex ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'} rounded-xl p-1 border`}>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all ${viewMode === 'table' ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <TableIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Visão Tabela</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all ${viewMode === 'kanban' ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Visão Kanban</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area Clientes */}
            <div className="relative">
              {viewMode === 'table' ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className={`${theme === 'dark' ? 'bg-zinc-900/30 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl overflow-hidden`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-zinc-200 bg-zinc-50'}`}>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cliente</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Apelido</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CNPJ</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cidade/UF</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Segmento</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Vendedor</th>
                          <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest"></th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-zinc-100'}`}>
                        {filteredCustomers.map((customer) => (
                          <tr 
                            key={customer.id} 
                            onClick={() => setSelectedCustomer(customer)}
                            className={`hover:${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-zinc-50'} transition-colors group cursor-pointer`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-[#00E676]/10' : 'bg-blue-50'} flex items-center justify-center`}>
                                  <Building2 className={`w-4 h-4 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                                </div>
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{customer.name}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{customer.nickname}</td>
                            <td className={`px-6 py-4 text-xs font-mono ${theme === 'dark' ? 'text-zinc-50' : 'text-black'}`}>{customer.cnpj}</td>
                            <td className={`px-6 py-4 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{customer.city}/{customer.state}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-700'} text-[10px] font-bold uppercase`}>
                                {customer.segment}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{customer.seller}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}
                                  className={`p-1 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'} rounded text-zinc-500 hover:text-${theme === 'dark' ? 'white' : 'zinc-900'}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}
                                  className={`p-1 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'} rounded text-zinc-500 hover:text-red-400`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide"
                >
                  {CUSTOMER_SEGMENTS.map((segment) => (
                    <div key={segment} className="flex-shrink-0 w-80">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{segment}</h3>
                        <span className={`text-[10px] font-mono ${theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'} px-1.5 py-0.5 rounded`}>
                          {filteredCustomers.filter(c => c.segment === segment).length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {filteredCustomers.filter(c => c.segment === segment).map((customer) => (
                          <div 
                            key={customer.id}
                            onClick={() => setSelectedCustomer(customer)}
                            className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} p-4 rounded-xl hover:border-${theme === 'dark' ? '[#00E676]/30' : 'blue-600/30'} transition-all cursor-pointer group`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`}>{customer.cnpj}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }} className={`p-1 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded text-zinc-500 hover:text-${theme === 'dark' ? 'white' : 'zinc-900'}`}>
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }} className={`p-1 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded text-zinc-500 hover:text-red-400`}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-${theme === 'dark' ? '[#00E676]/80' : 'blue-600/80'} transition-colors`}>{customer.name}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">{customer.city} - {customer.state}</p>
                            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} flex justify-between items-center`}>
                              <span className="text-[10px] text-zinc-600 uppercase font-bold">{customer.seller}</span>
                              <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-[#00E676]/50' : 'text-blue-600/50'}`}>
                                <Users className="w-3 h-3" />
                                <span className="text-[10px]">{customer.contacts.length}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </>
        )}
      </>
    )}
  </main>

      {/* Drawer de Perfil do Cliente */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed right-0 top-0 bottom-0 w-full max-w-2xl ${theme === 'dark' ? 'bg-zinc-950 border-white/5' : 'bg-white border-zinc-200 shadow-2xl'} border-l z-50 overflow-y-auto`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className={`p-2 ${theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'} rounded-lg transition-colors text-zinc-500 hover:text-${theme === 'dark' ? 'white' : 'zinc-900'}`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditCustomer(selectedCustomer)}
                      className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'} px-4 py-2 rounded-xl text-sm font-bold border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} transition-all`}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className={`p-2 ${theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'} rounded-lg transition-colors text-zinc-500 hover:text-${theme === 'dark' ? 'white' : 'zinc-900'}`}
                    >
                      <PanelRightClose className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-6 mb-12">
                  <div className={`w-20 h-20 rounded-2xl ${theme === 'dark' ? 'bg-[#00E676]/10 border-[#00E676]/20' : 'bg-blue-600/10 border-blue-600/20'} flex items-center justify-center border`}>
                    <Building2 className={`w-10 h-10 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} tracking-tight`}>{selectedCustomer.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-blue-600/10 text-blue-600'} text-[10px] font-bold uppercase tracking-wider`}>
                        {selectedCustomer.segment}
                      </span>
                      <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-800/50 text-zinc-400' : 'bg-zinc-100 text-zinc-600'} text-[10px] font-bold uppercase tracking-wider`}>
                        Vendedor: {selectedCustomer.seller}
                      </span>
                      <span className={`text-sm font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-[#000000]'}`}>{selectedCustomer.cnpj}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-6">
                    <h3 className={`text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>Dados da Empresa</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-tighter">Endereço</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} leading-relaxed`}>{selectedCustomer.address}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-1`}>{selectedCustomer.cep} • {selectedCustomer.city}, {selectedCustomer.state}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className={`text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>Informações Fiscais</h3>
                    <div className={`${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-zinc-50'} rounded-2xl p-4 border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} space-y-4`}>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter mb-1">CNPJ</p>
                        <p className={`text-sm font-mono ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{selectedCustomer.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter mb-1">Inscrição Estadual</p>
                        <p className={`text-sm font-mono ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{selectedCustomer.ie}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linha do Tempo 5W2H */}
                <div className="space-y-6 mb-12">
                  <div className={`flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                    <h3 className={`text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest`}>Linha do Tempo 5W2H</h3>
                  </div>
                  <div className="space-y-6">
                    {data.filter(i => i.customer === selectedCustomer.name).map((item, idx) => (
                      <div key={item.id} className={`relative pl-8 border-l ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                        <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-[#00E676]' : 'bg-blue-600'} shadow-[0_0_10px_rgba(0,230,118,0.5)]`} />
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{item.description}</h4>
                          <span className="text-[10px] font-mono text-zinc-500">{item.confidence}</span>
                        </div>
                        {item.planOfAction && (
                          <div className={`grid grid-cols-2 gap-4 ${theme === 'dark' ? 'bg-zinc-900/30' : 'bg-zinc-50'} p-4 rounded-xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'}`}>
                            <div>
                              <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">O Quê (What)</p>
                              <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-300' : 'text-black'}`}>{item.planOfAction.what}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">Quando (When)</p>
                              <p className={`text-[11px] ${theme === 'dark' ? 'text-zinc-300' : 'text-black'}`}>{item.planOfAction.when}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Histórico de Oportunidades */}
                <div className="space-y-6 mb-12">
                  <div className={`flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                    <h3 className={`text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest`}>Histórico de Oportunidades (Forecast)</h3>
                  </div>
                  <div className="space-y-3">
                    {data.filter(i => i.customer === selectedCustomer.name).map(opp => (
                      <div key={opp.id} className={`${theme === 'dark' ? 'bg-zinc-900/30' : 'bg-zinc-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} p-4 rounded-xl flex items-center justify-between group`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`}>{opp.id}</span>
                            <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{opp.description}</h4>
                          </div>
                          <p className="text-xs text-zinc-500">{opp.supplier} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.amount)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                            parseInt(opp.confidence) >= 80 ? 'bg-red-500/20 text-red-500' :
                            parseInt(opp.confidence) >= 50 ? 'bg-amber-500/20 text-amber-500' :
                            (theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600')
                          }`}>
                            {opp.confidence}
                          </span>
                          <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">{opp.respSigla}</p>
                        </div>
                      </div>
                    ))}
                    {data.filter(i => i.customer === selectedCustomer.name).length === 0 && (
                      <div className={`text-center py-8 border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} rounded-2xl`}>
                        <p className="text-xs text-zinc-600">Nenhuma oportunidade vinculada no momento.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={`flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                    <h3 className={`text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'} uppercase tracking-widest`}>Gestão de Contatos</h3>
                    <button 
                      onClick={handleAddContact}
                      className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-[#00E676] hover:text-[#00E676]/80' : 'text-blue-600 hover:text-blue-500'} text-xs font-bold transition-colors`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Novo Contato
                    </button>
                  </div>

              <div className="grid grid-cols-1 gap-4">
                {selectedCustomer.contacts.map((contact) => (
                  <div key={contact.id} className={`${theme === 'dark' ? 'bg-zinc-900/30' : 'bg-zinc-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} p-5 rounded-2xl group hover:border-${theme === 'dark' ? '[#00E676]/20' : 'blue-600/20'} transition-all`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} font-bold`}>
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{contact.name}</h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{contact.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditContact(contact)} className={`p-1.5 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'} rounded-lg text-zinc-500 hover:text-${theme === 'dark' ? 'white' : 'zinc-900'}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteContact(contact.id)} className={`p-1.5 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'} rounded-lg text-zinc-500 hover:text-red-400`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Phone className="w-3 h-3 text-zinc-600" />
                        {contact.phone}
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Contact2 className="w-3 h-3 text-zinc-600" />
                        {contact.cell}
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} sm:col-span-2`}>
                        <Mail className="w-3 h-3 text-zinc-600" />
                        {contact.email}
                      </div>
                    </div>
                  </div>
                ))}
                    {selectedCustomer.contacts.length === 0 && (
                      <div className={`text-center py-12 border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} rounded-2xl`}>
                        <Users className={`w-8 h-8 ${theme === 'dark' ? 'text-zinc-800' : 'text-zinc-300'} mx-auto mb-3`} />
                        <p className="text-sm text-zinc-600">Nenhum contato cadastrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal CRUD Cliente */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const customerData: Customer = {
                  id: editingCustomer?.id || '',
                  org_id: currentOrgId,
                  name: formData.get('name') as string,
                  nickname: formData.get('nickname') as string,
                  cnpj: formData.get('cnpj') as string,
                  ie: formData.get('ie') as string,
                  address: formData.get('address') as string,
                  cep: formData.get('cep') as string,
                  city: formData.get('city') as string,
                  state: formData.get('state') as string,
                  segment: formData.get('segment') as Customer['segment'],
                  seller: formData.get('seller') as Customer['seller'],
                  contacts: editingCustomer?.contacts || [],
                  regions: editingCustomer?.regions || ''
                };
                handleSaveCustomer(customerData);
              }} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CNPJ</label>
                    <input name="cnpj" defaultValue={editingCustomer?.cnpj} required placeholder="00.000.000/0000-00" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Inscrição Estadual (IE)</label>
                    <input name="ie" defaultValue={editingCustomer?.ie} placeholder="Isento ou Número" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cliente (Razão Social)</label>
                    <input name="name" defaultValue={editingCustomer?.name} required placeholder="Nome da Empresa" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Apelido (Nome Fantasia)</label>
                    <input name="nickname" defaultValue={editingCustomer?.nickname} placeholder="Como é conhecido" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Endereço</label>
                    <input name="address" defaultValue={editingCustomer?.address} placeholder="Rua, Número, Bairro" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CEP</label>
                    <input name="cep" defaultValue={editingCustomer?.cep} placeholder="00000-000" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cidade</label>
                      <input name="city" defaultValue={editingCustomer?.city} placeholder="Cidade" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">UF</label>
                      <input name="state" defaultValue={editingCustomer?.state} placeholder="Estado" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Segmento</label>
                    <select name="segment" defaultValue={editingCustomer?.segment} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all">
                      {CUSTOMER_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Vendedor (EF/RG/WA)</label>
                    <select name="seller" defaultValue={editingCustomer?.seller || 'EF'} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all">
                      <option value="EF">EF</option>
                      <option value="RG">RG</option>
                      <option value="WA">WA</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-white transition-all">Cancelar</button>
                  <button type="submit" className="bg-[#00E676] hover:bg-[#00E676]/90 text-black px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#00E676]/20">Salvar Cliente</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal CRUD Contato */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsContactModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingContact ? 'Editar Contato' : 'Novo Contato'}</h3>
                <button onClick={() => setIsContactModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const contactData: Contact = {
                  id: editingContact?.id || '',
                  name: formData.get('name') as string,
                  role: formData.get('role') as string,
                  phone: formData.get('phone') as string,
                  cell: formData.get('cell') as string,
                  email: formData.get('email') as string
                };
                handleSaveContact(contactData);
              }} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nome do Contato</label>
                    <input name="name" defaultValue={editingContact?.name} required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Departamento / Função</label>
                    <input name="role" defaultValue={editingContact?.role} required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Telefone</label>
                      <input name="phone" defaultValue={editingContact?.phone} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Celular</label>
                      <input name="cell" defaultValue={editingContact?.cell} className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">E-mail</label>
                    <input name="email" type="email" defaultValue={editingContact?.email} required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00E676]/50 outline-none transition-all" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-white transition-all">Cancelar</button>
                  <button type="submit" className="bg-[#00E676] hover:bg-[#00E676]/90 text-black px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#00E676]/20">Salvar Contato</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingItem ? <Pencil className="w-5 h-5 text-[#00E676]" /> : <Plus className="w-5 h-5 text-[#00E676]" />}
                  {editingItem ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row h-full">
                {/* Main Form Area */}
                <div className="flex-grow overflow-y-auto">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const planOfAction = {
                        what: formData.get('what') as string,
                        why: formData.get('why') as string,
                        who: formData.get('who') as string,
                        where: formData.get('where') as string,
                        when: formData.get('when') as string,
                        how: formData.get('how') as string,
                        howMuch: formData.get('howMuch') as string,
                      };

                      const newItem: ForecastItem = {
                        id: editingItem?.id || '',
                        org_id: currentOrgId,
                        resp: formData.get('resp') as string,
                        respSigla: formData.get('respSigla') as string,
                        customer: formData.get('customer') as string,
                        supplier: formData.get('supplier') as string,
                        description: formData.get('description') as string,
                        amount: Number(formData.get('amount')),
                        uf: formData.get('uf') as string,
                        confidence: formData.get('confidence') as any,
                        mar26: formData.get('mar26') === 'on',
                        abr26: formData.get('abr26') === 'on',
                        mai26: formData.get('mai26') === 'on',
                        segSem26: formData.get('segSem26') === 'on',
                        followUp: formData.get('followUp') as string,
                        nextStep: planOfAction.what,
                        planOfAction,
                        contacts: formData.get('contacts') as string,
                        tem_ea: formData.get('tem_ea') === 'on',
                        pendencia_vendedor: formData.get('pendencia_vendedor') === 'on',
                        history: editingItem?.history || []
                      };
                      handleSave(newItem);
                    }}
                    className="p-8 space-y-10 max-h-[70vh]"
                  >
                    {/* Bloco 1: Comercial */}
                    <div className="space-y-6">
                      <div className={`flex items-center gap-2 border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                        <DollarSign className={`w-4 h-4 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                        <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} uppercase tracking-widest`}>Bloco 1: Comercial</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Responsável (E-mail)</label>
                          <input name="resp" defaultValue={editingItem?.resp || currentUserEmail} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sigla (EF, RG, WA)</label>
                          <input name="respSigla" defaultValue={editingItem?.respSigla || (currentUserEmail === 'joao@forge.com' ? 'EF' : currentUserEmail === 'maria@forge.com' ? 'RG' : 'WA')} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50 uppercase`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cliente</label>
                          <input name="customer" defaultValue={editingItem?.customer} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Fornecedor</label>
                          <input name="supplier" defaultValue={editingItem?.supplier} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Valor (BRL)</label>
                          <input name="amount" type="number" defaultValue={editingItem?.amount} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50 font-mono`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">UF</label>
                          <input name="uf" maxLength={2} defaultValue={editingItem?.uf} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50 uppercase`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Confiança</label>
                          <select name="confidence" defaultValue={editingItem?.confidence || '10% (Sonho)'} className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50`}>
                            {CONFIDENCE_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Contatos Gerais</label>
                          <input name="contacts" defaultValue={editingItem?.contacts} className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50`} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Descrição</label>
                          <textarea name="description" defaultValue={editingItem?.description} required className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50 h-20 resize-none`} />
                        </div>
                      </div>
                    </div>

                    {/* Bloco 2: Planejamento */}
                    <div className="space-y-6">
                      <div className={`flex items-center gap-2 border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} uppercase tracking-widest`}>Bloco 2: Planejamento</h4>
                      </div>
                      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${theme === 'dark' ? 'bg-black/20' : 'bg-zinc-50'} p-6 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'}`}>
                        <label className={`flex flex-col items-center gap-3 cursor-pointer group p-4 rounded-xl ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-all`}>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MAR/26</span>
                          <input type="checkbox" name="mar26" defaultChecked={editingItem?.mar26} className={`w-6 h-6 rounded border-white/10 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} text-[#00E676] focus:ring-[#00E676]/20`} />
                        </label>
                        <label className={`flex flex-col items-center gap-3 cursor-pointer group p-4 rounded-xl ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-all`}>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ABR/26</span>
                          <input type="checkbox" name="abr26" defaultChecked={editingItem?.abr26} className={`w-6 h-6 rounded border-white/10 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} text-[#00E676] focus:ring-[#00E676]/20`} />
                        </label>
                        <label className={`flex flex-col items-center gap-3 cursor-pointer group p-4 rounded-xl ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-all`}>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MAI/26</span>
                          <input type="checkbox" name="mai26" defaultChecked={editingItem?.mai26} className={`w-6 h-6 rounded border-white/10 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} text-[#00E676] focus:ring-[#00E676]/20`} />
                        </label>
                        <label className={`flex flex-col items-center gap-3 cursor-pointer group p-4 rounded-xl ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-all`}>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">2º SEM/26</span>
                          <input type="checkbox" name="segSem26" defaultChecked={editingItem?.segSem26} className={`w-6 h-6 rounded border-white/10 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} text-[#00E676] focus:ring-[#00E676]/20`} />
                        </label>
                      </div>
                    </div>

                    {/* Bloco 3: Ação (5W2H) */}
                    <div className="space-y-6">
                      <div className={`flex items-center gap-2 border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                        <Target className={`w-4 h-4 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                        <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} uppercase tracking-widest`}>Bloco 3: Ação (5W2H)</h4>
                      </div>
                      
                      <div className={`${theme === 'dark' ? 'bg-[#00E676]/5 border-[#00E676]/10' : 'bg-blue-50 border-blue-100'} p-8 rounded-3xl border space-y-6`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <FileText className="w-3 h-3" />
                              <label className="text-[9px] uppercase font-bold tracking-tighter">O QUÊ? (What)</label>
                            </div>
                            <input name="what" defaultValue={editingItem?.planOfAction?.what} placeholder="Ex: Demonstração técnica" required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                          </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <HelpCircle className="w-3 h-3" />
                            <label className="text-[9px] uppercase font-bold tracking-tighter">POR QUÊ? (Why)</label>
                          </div>
                          <input name="why" defaultValue={editingItem?.planOfAction?.why} placeholder="Ex: Validar controle de torque" required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                        </div>
  
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <Users className="w-3 h-3" />
                                <label className="text-[9px] uppercase font-bold tracking-tighter">QUEM? (Who)</label>
                              </div>
                              <input name="who" defaultValue={editingItem?.planOfAction?.who} placeholder="Ex: Vendedor, EA, Eng. Carlos" required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                            </div>
  
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <MapPin className="w-3 h-3" />
                                <label className="text-[9px] uppercase font-bold tracking-tighter">ONDE? (Where)</label>
                              </div>
                              <input name="where" defaultValue={editingItem?.planOfAction?.where} placeholder="Ex: Linha de montagem 02" required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                            </div>
  
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <Calendar className="w-3 h-3" />
                                <label className="text-[9px] uppercase font-bold tracking-tighter">QUANDO? (When)</label>
                              </div>
                              <input name="when" type="date" defaultValue={editingItem?.planOfAction?.when} required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                            </div>
  
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <Wrench className="w-3 h-3" />
                                <label className="text-[9px] uppercase font-bold tracking-tighter">COMO? (How)</label>
                              </div>
                              <input name="how" defaultValue={editingItem?.planOfAction?.how} placeholder="Ex: Ferramenta Panasonic 650Nm" required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                            </div>
  
                            <div className="md:col-span-2 space-y-1">
                              <div className="flex items-center gap-1.5 text-zinc-500">
                                <DollarSign className="w-3 h-3" />
                                <label className="text-[9px] uppercase font-bold tracking-tighter">QUANTO CUSTA? (How Much)</label>
                              </div>
                              <input name="howMuch" defaultValue={editingItem?.planOfAction?.howMuch} placeholder="Ex: R$ 0,00 (Visita técnica) ou Valor do Orçamento" required className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-[#000000]'} rounded-xl px-3 py-2 text-xs focus:border-[#00E676]/50 outline-none`} />
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className={`flex items-center gap-2 border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'} pb-2`}>
                        <MessageSquare className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                        <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'} uppercase tracking-widest`}>Relato & Pendências</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nova Interação (Follow-up)</label>
                          <input name="followUp" defaultValue="" placeholder="Descreva a nova interação..." className={`w-full ${theme === 'dark' ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-[#000000]'} rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00E676]/50`} />
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className={`flex items-center gap-3 ${theme === 'dark' ? 'bg-[#FFD700]/5 border-[#FFD700]/20' : 'bg-amber-50 border-amber-200'} p-4 rounded-2xl border`}>
                            <input type="checkbox" name="tem_ea" id="tem_ea" defaultChecked={editingItem?.tem_ea} className={`w-5 h-5 rounded border-[#FFD700]/30 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} text-[#FFD700] focus:ring-[#FFD700]/20`} />
                            <label htmlFor="tem_ea" className="text-xs font-bold text-[#FFD700] uppercase tracking-tighter cursor-pointer">
                              Solicitar Suporte Técnico ({technicalRoleName})
                            </label>
                          </div>

                          <div className={`flex items-center gap-3 ${theme === 'dark' ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'} p-4 rounded-2xl border`}>
                            <input type="checkbox" name="pendencia_vendedor" id="pendencia_vendedor" defaultChecked={editingItem?.pendencia_vendedor} className={`w-5 h-5 rounded border-red-500/30 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} text-red-500 focus:ring-red-500/20`} />
                            <label htmlFor="pendencia_vendedor" className="text-xs font-bold text-red-500 uppercase tracking-tighter cursor-pointer">
                              Marcar como Pendência do Vendedor
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                {/* Timeline de Histórico */}
                {editingItem && editingItem.history && editingItem.history.length > 0 && (
                  <div className="md:col-span-2 mt-6 space-y-4">
                    <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">Histórico de Visitas / Follow-ups</h4>
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-800">
                      {editingItem.history.map((h) => (
                        <div key={h.id} className="relative pl-8">
                          <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-[#00E676]" />
                          <div className="bg-zinc-800/30 p-3 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-mono text-[#00E676]">{h.date}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                              <span className="text-zinc-500 font-bold uppercase text-[9px]">Relato:</span> {h.report}
                            </p>
                            
                            {h.planOfAction && (
                              <div className="bg-black/20 rounded-xl p-3 border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                  <Target className="w-3 h-3 text-[#00E676]" />
                                  <span className="text-[9px] font-bold text-[#00E676] uppercase tracking-widest">Plano de Ação 5W2H</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                  <div className="flex items-start gap-2">
                                    <FileText className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">O Quê?</span>
                                      <span className="text-[10px] text-white leading-tight">{h.planOfAction.what}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <HelpCircle className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Por Quê?</span>
                                      <span className="text-[10px] text-white leading-tight">{h.planOfAction.why}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Users className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Quem?</span>
                                      <span className="text-[10px] text-white leading-tight">{h.planOfAction.who}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Onde?</span>
                                      <span className="text-[10px] text-white leading-tight">{h.planOfAction.where}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Calendar className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Quando?</span>
                                      <span className="text-[10px] text-white leading-tight">{new Date(h.planOfAction.when).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Wrench className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Como?</span>
                                      <span className="text-[10px] text-white leading-tight">{h.planOfAction.how}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 sm:col-span-2">
                                    <DollarSign className="w-3 h-3 text-zinc-500 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Quanto Custa?</span>
                                      <span className="text-[10px] text-white leading-tight">{h.planOfAction.howMuch}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {!h.planOfAction && (
                              <p className="text-xs text-[#00E676]/80 font-medium">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">Próximo Passo:</span> {h.nextStep}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:text-white transition-colors">Cancelar</button>
                  <button type="submit" className="bg-[#00E676] hover:bg-[#00E676]/90 text-black px-8 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#00E676]/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar Oportunidade
                  </button>
                </div>
              </form>
            </div>

            {/* AI Coach Sidebar */}
            {editingItem && (
              <div className="w-full lg:w-80 bg-black/20 border-l border-white/5 p-6 overflow-y-auto max-h-[80vh]">
                <AICoach item={editingItem} technicalRoleName={technicalRoleName} theme={theme} />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

      {/* Modais Globais */}
      <AnimatePresence>
        {selectedScript && (
          <ScriptModal 
            script={selectedScript} 
            onClose={() => setSelectedScript(null)} 
            theme={theme}
          />
        )}
      </AnimatePresence>


        <footer className={`max-w-[1600px] mx-auto px-6 py-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200'} mt-auto mb-20 lg:mb-0`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 opacity-30 grayscale">
              <div className={`w-6 h-6 ${theme === 'dark' ? 'bg-white' : 'bg-black'} rounded-sm flex items-center justify-center`}>
                <TrendingUp className={`${theme === 'dark' ? 'text-black' : 'text-white'} w-4 h-4`} />
              </div>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-bold tracking-tighter text-sm uppercase`}>Forge Industrial Systems</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500">v2.5.0-STABLE</p>
          </div>
        </footer>
      </div>

      <BottomNav activeModule={activeModule} setActiveModule={setActiveModule} theme={theme} userRole={userRole} />
    </div>
  );
}
