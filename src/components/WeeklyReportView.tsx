import React, { useMemo } from 'react';
import { 
  FileText, 
  Copy, 
  Mail, 
  TrendingUp, 
  Star, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  ChevronRight,
  Building2,
  Users,
  Zap,
  Wrench,
  Heart,
  Briefcase,
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { ForecastItem, CommandCenterTask, TaskCategory, Customer } from '../types';

interface WeeklyReportViewProps {
  data: ForecastItem[];
  tasks: CommandCenterTask[];
  customers: Customer[];
  theme: 'dark' | 'light';
  technicalRoleName: string;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  data,
  tasks,
  customers,
  theme,
  technicalRoleName
}) => {
  const today = new Date('2026-03-04'); // Usando a data fornecida no contexto
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // 1. Compilação de Dados (Últimos 7 dias)
  const weeklyUpdates = useMemo(() => {
    const updatesByCustomer: Record<string, { 
      customer: string, 
      history: any[], 
      confidenceEvolution: string[],
      tasks: CommandCenterTask[] 
    }> = {};

    // Extrair do histórico do forecast
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

    // Extrair do Centro de Comando
    tasks.forEach(task => {
      if (new Date(task.date) >= sevenDaysAgo) {
        // Tentar encontrar o cliente associado (pode ser pelo título ou ID se tivéssemos)
        // Como o mock não tem cliente direto na task, vamos tentar inferir ou listar separadamente
        // Para este CRM, as tasks geralmente mencionam o cliente no título
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

  // 2. Destaques Estratégicos
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

  // 3. Draft de E-mail
  const generateEmail = () => {
    const redZone = data.filter(item => {
      const conf = parseInt(item.confidence);
      return conf >= 50 && conf < 100;
    });

    const nextSteps = data
      .filter(item => item.nextStep && parseInt(item.confidence) < 100)
      .slice(0, 5);

    const emailBody = `
Prezado RG,

Segue o Relatório Semanal de Performance do FORGE CRM (Período: ${sevenDaysAgo.toLocaleDateString()} a ${today.toLocaleDateString()}).

--- DESTAQUES ESTRATÉGICOS ---

1. OPORTUNIDADES EM ZONA CRÍTICA (>= 50%):
${redZone.map(i => `- ${i.customer}: ${i.description} (${i.confidence}) - Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.amount)}`).join('\n')}

2. AÇÕES TÉCNICAS (WA) - PROJETOS ARO DOURADO:
${waActions.map(i => `- ${i.customer}: ${i.description} (Acompanhamento Técnico em curso)`).join('\n')}

3. SAÚDE DA CARTEIRA (3S+M):
- Vendas (S3): ${healthStats[TaskCategory.SALES]} ações
- Serviço (S1): ${healthStats[TaskCategory.SERVICE]} ações
- Satisfação (S2): ${healthStats[TaskCategory.SATISFACTION]} ações
- Manutenção (+M): ${healthStats[TaskCategory.MAINTENANCE]} ações

4. PRÓXIMOS PASSOS (SEMANA SEGUINTE):
${nextSteps.map(i => `- ${i.customer}: ${i.nextStep}`).join('\n')}

--- ANÁLISE DE IA ---
O volume de negócios no funil apresenta um crescimento saudável, com foco em conversão de oportunidades de médio prazo. A atuação técnica do WA tem sido fundamental para sustentar a confiança nos projetos de maior valor. Recomendo foco total no fechamento das oportunidades em Zona Vermelha.

Atenciosamente,

EF (Elieser)
C/C: WA (Washington)
    `.trim();

    return emailBody;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Relatório copiado para a área de transferência!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Relatório Semanal</h2>
          <p className="text-zinc-500 text-sm">Compilação estratégica de 25/02/2026 a 04/03/2026</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => copyToClipboard(generateEmail())}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900'} px-4 py-2 rounded-xl text-xs font-bold transition-all`}
          >
            <Copy className="w-4 h-4" />
            Copiar Relatório
          </button>
          <button 
            onClick={() => {
              const body = encodeURIComponent(generateEmail());
              const formattedDate = new Date('2026-03-04').toLocaleDateString('pt-BR').replace(/\//g, '.').slice(0, 8); // Simple DD.MM.AA
              window.open(`mailto:rafael.gomez@empresa.com?cc=washington@empresa.com&subject=[FORGE CRM] Relatório Semanal FORGE CRM - EF - ${formattedDate}&body=${body}`);
            }}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white'} px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all`}
          >
            <Mail className="w-4 h-4" />
            Gerar E-mail para RG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Compilação de Dados */}
        <div className="lg:col-span-2 space-y-6">
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center gap-3 mb-8">
              <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Atividades por Cliente</h3>
            </div>

            <div className="space-y-6">
              {weeklyUpdates.map((update, idx) => (
                <div key={idx} className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border rounded-2xl p-5 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                      <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{update.customer}</h4>
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
              {weeklyUpdates.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500">Nenhuma atividade registrada nos últimos 7 dias.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Coluna Lateral: Destaques Estratégicos */}
        <div className="space-y-6">
          {/* Ações Técnicas (WA) */}
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-[#FFD700]" />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Ações Técnicas ({technicalRoleName})</h3>
            </div>
            <div className="space-y-3">
              {waActions.map((item) => (
                <div key={item.id} className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border-l-4 border-l-[#FFD700] p-4 rounded-r-xl`}>
                  <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{item.customer}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">{item.description}</p>
                </div>
              ))}
              {waActions.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">Nenhuma ação técnica registrada.</p>
              )}
            </div>
          </section>

          {/* Saúde da Carteira (3S+M) */}
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Saúde da Carteira</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Vendas</span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{healthStats[TaskCategory.SALES]}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Serviço</span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{healthStats[TaskCategory.SERVICE]}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Satisfação</span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{healthStats[TaskCategory.SATISFACTION]}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-zinc-950/50' : 'bg-zinc-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Manutenção</span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{healthStats[TaskCategory.MAINTENANCE]}</p>
              </div>
            </div>
          </section>

          {/* Análise de IA */}
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-12 h-12 text-[#00E676]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Brain className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Análise da IA</h3>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              O volume de negócios no funil apresenta um crescimento saudável, com foco em conversão de oportunidades de médio prazo. A atuação técnica do WA tem sido fundamental para sustentar a confiança nos projetos de maior valor. Recomendo foco total no fechamento das oportunidades em Zona Vermelha.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
  </svg>
);
