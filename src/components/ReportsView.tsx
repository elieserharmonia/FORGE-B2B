import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Mail, 
  Copy, 
  CheckCircle2, 
  Building2, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  Eye,
  Send,
  FileText,
  Star,
  Heart,
  Zap,
  Wrench,
  MessageSquare,
  Brain,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { ForecastItem, CommandCenterTask, TaskCategory, Customer } from '../types';

interface ReportsViewProps {
  data: ForecastItem[];
  tasks: CommandCenterTask[];
  customers: Customer[];
  theme: 'dark' | 'light';
  technicalRoleName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  data,
  tasks,
  customers,
  theme,
  technicalRoleName
}) => {
  const [activeTab, setActiveTab] = useState<'management' | 'weekly'>('management');
  const [showPreview, setShowPreview] = useState(false);
  const today = new Date('2026-03-04'); // Usando a data fornecida no contexto
  
  const formatDateDots = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString().slice(-2);
    return `${d}.${m}.${y}`;
  };

  const formattedDate = formatDateDots(today);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // --- Lógica do Relatório de Gestão (Antigo Friday Report) ---
  
  const exportToExcel = () => {
    const worksheetData = data.map(item => ({
      'ID': item.id,
      'RESP.': item.respSigla,
      'CUSTOMER': item.customer,
      'SUPPLIER': item.supplier,
      'DESCRIPTION': item.description,
      'AMOUNT': item.amount,
      'UF': item.uf,
      'Confidence': item.confidence,
      'Mês Atual': item.mar26 ? 'X' : '',
      'Mês+1': item.abr26 ? 'X' : '',
      'Mês+2': item.mai26 ? 'X' : '',
      'Semestre': item.segSem26 ? 'X' : '',
      'FOLLOW-UP': item.followUp,
      'CONTATOS': item.contacts
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Forecast');
    XLSX.writeFile(workbook, `resumo do forecast.xlsx`);
  };

  const emailContent = useMemo(() => {
    const activeOpps = data.filter(item => parseInt(item.confidence) < 100);
    
    let content = `Rafael, boa tarde. Segue relatório referente às visitas da semana.\n\n`;

    activeOpps.forEach(item => {
      content += `--------------------------------------------------\n`;
      content += `CLIENTE: ${item.customer.toUpperCase()}\n`;
      content += `--------------------------------------------------\n`;
      content += `ID: ${item.id} | RESP: ${item.respSigla} | SUPP: ${item.supplier} | VALOR: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)} | CONF: ${item.confidence} | UF: ${item.uf}\n`;
      
      content += `HISTÓRICO (FOLLOW-UP):\n`;
      if (item.followUp) {
        content += `${item.followUp}\n`;
      } else {
        content += `• Sem histórico registrado.\n`;
      }

      content += `\nPRÓXIMO PASSO (5W2H):\n`;
      if (item.planOfAction) {
        content += `• O QUÊ: ${item.planOfAction.what}\n`;
        content += `• QUANDO: ${item.planOfAction.when}\n`;
        content += `• QUEM: ${item.planOfAction.who}\n`;
      } else {
        content += `• Ação: ${item.nextStep || 'Não definido'}\n`;
      }
      content += `\n\n`;
    });

    content += `Atenciosamente,\nEF`;
    return content;
  }, [data, sevenDaysAgo]);

  const handleSendEmail = () => {
    const to = 'rafael.gomez@empresa.com';
    const cc = 'washington@empresa.com';
    const subject = `[FORGE CRM] Relatório Semanal de Forecast - EF - ${formattedDate}`;
    const body = encodeURIComponent(emailContent);
    window.open(`mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`);
  };

  // --- Lógica do Relatório Semanal (Antigo Weekly Report) ---

  const weeklyUpdates = useMemo(() => {
    const updatesByCustomer: Record<string, { 
      customer: string, 
      history: any[], 
      confidenceEvolution: string[],
      tasks: CommandCenterTask[] 
    }> = {};

    data.forEach(item => {
      const recentHistory = item.history.filter(h => new Date(h.date) >= sevenDaysAgo);
      if (recentHistory.length > 0) {
        if (!updatesByCustomer[item.customer]) {
          updatesByCustomer[item.customer] = { customer: item.customer, history: [], confidenceEvolution: [], tasks: [] };
        }
        updatesByCustomer[item.customer].history.push(...recentHistory);
        updatesByCustomer[item.customer].confidenceEvolution.push(item.confidence);
      }
    });

    tasks.forEach(task => {
      if (new Date(task.date) >= sevenDaysAgo) {
        const customer = customers.find(c => task.title.includes(c.name) || task.title.includes(c.nickname));
        const customerName = customer ? customer.name : 'Diversos';
        
        if (!updatesByCustomer[customerName]) {
          updatesByCustomer[customerName] = { customer: customerName, history: [], confidenceEvolution: [], tasks: [] };
        }
        updatesByCustomer[customerName].tasks.push(task);
      }
    });

    return Object.values(updatesByCustomer);
  }, [data, tasks, customers, sevenDaysAgo]);

  const waActions = useMemo(() => {
    return data.filter(item => {
      const hasRecentActivity = item.history.some(h => new Date(h.date) >= sevenDaysAgo);
      const hasRecentTask = tasks.some(t => t.relatedForecastId === item.id && new Date(t.date) >= sevenDaysAgo);
      return item.tem_ea && (hasRecentActivity || hasRecentTask);
    });
  }, [data, tasks, sevenDaysAgo]);

  const healthStats = useMemo(() => {
    const stats = {
      [TaskCategory.SALES]: 0,
      [TaskCategory.SERVICE]: 0,
      [TaskCategory.SATISFACTION]: 0,
      [TaskCategory.MAINTENANCE]: 0,
    };
    tasks.filter(t => new Date(t.date) >= sevenDaysAgo).forEach(t => {
      stats[t.category]++;
    });
    return stats;
  }, [tasks, sevenDaysAgo]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Relatórios</h2>
          <p className="text-zinc-500 text-sm">Consolidação estratégica e ferramentas de exportação</p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
          <button 
            onClick={() => setActiveTab('management')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'management' ? (theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white') : 'text-zinc-500'}`}
          >
            Gestão & Exportação
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'weekly' ? (theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white') : 'text-zinc-500'}`}
          >
            Resumo Estratégico
          </button>
        </div>
      </div>

      {activeTab === 'management' ? (
        <div className="space-y-8">
          <div className="flex justify-end gap-3">
            <button 
              onClick={exportToExcel}
              className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-[#000000]'} px-4 py-2 rounded-xl text-xs font-bold transition-all`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              📥 Exportar Planilha Full
            </button>
            <button 
              onClick={() => setShowPreview(true)}
              className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white'} px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-[#00E676]/10`}
            >
              <Eye className="w-4 h-4" />
              📧 Preparar E-mail para o Rafael
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Oportunidades Ativas no Relatório</h3>
                </div>

                <div className="space-y-4">
                  {data.filter(item => parseInt(item.confidence) < 100).map((item) => {
                    const conf = parseInt(item.confidence);
                    const isRed = conf >= 50;
                    return (
                      <div key={item.id} className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border rounded-2xl p-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRed ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{item.customer}</h4>
                            <p className="text-[10px] text-zinc-500">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded ${isRed ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {item.confidence}
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Status do Relatório</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Total de Oportunidades:</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{data.filter(item => parseInt(item.confidence) < 100).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Zona Vermelha (&gt;= 50%):</span>
                    <span className="font-bold text-red-500">{data.filter(item => parseInt(item.confidence) >= 50 && parseInt(item.confidence) < 100).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Ações Técnicas ({technicalRoleName}):</span>
                    <span className="font-bold text-[#FFD700]">{data.filter(item => item.tem_ea).length}</span>
                  </div>
                </div>
              </section>

              <div className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  "Rafael, este relatório consolida todas as movimentações de forecast da semana. O foco está nas oportunidades de fechamento imediato e no suporte técnico do Washington."
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
              <div className="flex items-center gap-3 mb-8">
                <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Atividades por Cliente</h3>
              </div>

              <div className="space-y-6">
                {weeklyUpdates.map((update, idx) => (
                  <div key={idx} className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border rounded-2xl p-5 space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{update.customer}</h4>
                      </div>
                      {update.confidenceEvolution.length > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-[#00E676]" />
                          <span className="text-[10px] font-mono text-[#00E676]">{update.confidenceEvolution[update.confidenceEvolution.length - 1]}</span>
                        </div>
                      )}
                    </div>

                    {update.history.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Evolução 5W2H / Histórico</p>
                        {update.history.map((h, i) => (
                          <div key={i} className={`pl-4 border-l-2 ${theme === 'dark' ? 'border-[#00E676]/30' : 'border-blue-600/30'} py-1`}>
                            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>{h.report}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Próximo: {h.nextStep}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {update.tasks.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Ações do Centro de Comando</p>
                        <div className="flex flex-wrap gap-2">
                          {update.tasks.map((t, i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-200'} border text-[10px]`}>
                              <CheckCircle2 className={`w-3 h-3 ${t.completed ? 'text-[#00E676]' : 'text-zinc-600'}`} />
                              <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>{t.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-[#FFD700]" />
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Ações Técnicas ({technicalRoleName})</h3>
              </div>
              <div className="space-y-3">
                {waActions.map((item) => (
                  <div key={item.id} className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border-l-4 border-l-[#FFD700] p-4 rounded-r-xl`}>
                    <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{item.customer}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Saúde da Carteira</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Vendas</span>
                  </div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{healthStats[TaskCategory.SALES]}</p>
                </div>
                <div className={`${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Serviço</span>
                  </div>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>{healthStats[TaskCategory.SERVICE]}</p>
                </div>
              </div>
            </section>

            <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-12 h-12 text-[#00E676]" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Brain className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-[#000000]'}`}>Análise da IA</h3>
              </div>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                O volume de negócios no funil apresenta um crescimento saudável, com foco em conversão de oportunidades de médio prazo.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização do E-mail */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-zinc-200 shadow-2xl border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Pré-visualização do E-mail</h3>
                    <p className="text-xs text-zinc-500">Revise o conteúdo antes de enviar para o Outlook</p>
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 bg-white text-[#000000] font-sans">
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="border-b border-zinc-200 pb-4 space-y-2">
                    <p className="text-sm"><span className="font-bold text-zinc-500">Para:</span> rafael.gomez@empresa.com</p>
                    <p className="text-sm"><span className="font-bold text-zinc-500">CC:</span> washington@empresa.com</p>
                    <p className="text-sm"><span className="font-bold text-zinc-500">Assunto:</span> [FORGE CRM] Relatório Semanal de Forecast - EF - {formattedDate}</p>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {emailContent}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(emailContent);
                    alert('Conteúdo do e-mail copiado!');
                  }}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-zinc-200 text-zinc-900 hover:bg-zinc-300 transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Texto
                </button>
                <button 
                  onClick={handleSendEmail}
                  className="px-8 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-4 h-4" />
                  Enviar para Outlook
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
