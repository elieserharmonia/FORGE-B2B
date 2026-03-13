import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Calendar, 
  Bell, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Wrench, 
  Heart, 
  TrendingUp,
  Trash2,
  ChevronRight,
  Sparkles,
  Search,
  Brain,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ForecastItem, Customer, CommandCenterTask, TaskCategory, UserRole } from '../types';

interface CommandCenterViewProps {
  data: ForecastItem[];
  customers: Customer[];
  tasks: CommandCenterTask[];
  onAddTask: (task: Omit<CommandCenterTask, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  theme: 'dark' | 'light';
  technicalRoleName: string;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  data,
  customers,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  theme,
  technicalRoleName
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>(TaskCategory.SALES);
  const [selectedScript, setSelectedScript] = useState<{ title: string; content: string } | null>(null);

  // --- IA: O Pensar do CRM (Sugestões Proativas) ---
  const proactiveSuggestions = useMemo(() => {
    const suggestions = [];

    // 1. [S] Satisfaction: Follow-up de satisfação após entrega técnica (Confidence 100%)
    const deliveredOpps = data.filter(item => item.confidence === '100% (Entregue)');
    deliveredOpps.forEach(opp => {
      // Se faturado recentemente e sem histórico de satisfação
      const hasSatisfactionCheck = opp.history?.some(h => h.report.toLowerCase().includes('satisfação'));
      if (!hasSatisfactionCheck) {
        suggestions.push({
          id: `suggest-sat-${opp.id}`,
          title: `[S] Satisfaction: Feedback ${opp.customer}`,
          description: `A entrega técnica de ${opp.description} foi concluída. Realize o follow-up de satisfação.`,
          script: `Oi, aqui é o Elieser (EF). Estou ligando para saber como foi a entrega técnica de ${opp.description} na ${opp.customer}. O ${technicalRoleName} (WA) me passou que tudo foi instalado, mas queria seu feedback pessoal. Tudo rodando 100%?`,
          category: TaskCategory.SATISFACTION
        });
      }
    });

    // 2. [M] Maintenance: Sugerir contato se o cliente estiver sem interação há > 15 dias
    customers.forEach(customer => {
      const customerOpps = data.filter(item => item.customer === customer.name);
      const hasRecentContact = customerOpps.some(opp => {
        if (!opp.history || opp.history.length === 0) return false;
        const lastDate = new Date(opp.history[0].date);
        const today = new Date('2026-03-01');
        const diff = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 15;
      });

      if (!hasRecentContact && customerOpps.length > 0) {
        suggestions.push({
          id: `suggest-maint-${customer.id}`,
          title: `[M] Maintenance: Relacionamento ${customer.nickname}`,
          description: `O cliente ${customer.name} está sem interação há mais de 15 dias. Mantenha a conta quente.`,
          script: `Olá, aqui é o Elieser (EF). Passando para desejar uma ótima semana e saber se há algo em que eu ou o ${technicalRoleName} (WA) possamos ajudar aí na ${customer.nickname}. Vamos marcar um café?`,
          category: TaskCategory.MAINTENANCE
        });
      }
    });

    return suggestions;
  }, [data, customers, technicalRoleName]);

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.SERVICE: return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case TaskCategory.SATISFACTION: return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
      case TaskCategory.SALES: return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
      case TaskCategory.MAINTENANCE: return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' };
      default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20' };
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle,
      date: newTaskDate,
      time: newTaskTime,
      category: newTaskCategory,
      completed: false
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const generateTaskScript = (task: CommandCenterTask) => {
    const content = `Oi, aqui é o Elieser (EF). Estou entrando em contato referente à atividade agendada: "${task.title}". O ${technicalRoleName} (WA) está acompanhando o processo e gostaríamos de validar os próximos passos para garantir a melhor solução técnica. Como está sua disponibilidade?`;
    setSelectedScript({ title: task.title, content });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Agenda de Tarefas (Agenda) */}
        <div className="lg:col-span-2 space-y-6">
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Agenda de Atividades</h3>
              </div>
              <button 
                onClick={() => setIsAddingTask(true)}
                className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white'} px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all`}
              >
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                    <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Sua agenda está limpa para hoje.</p>
                  </div>
                ) : (
                  tasks.sort((a, b) => a.time.localeCompare(b.time)).map((task) => {
                    const colors = getCategoryColor(task.category);
                    return (
                      <motion.div 
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border rounded-2xl p-4 flex items-center justify-between group hover:border-[#00E676]/30 transition-all`}
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => onToggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-[#00E676] border-[#00E676]' 
                                : `border-zinc-700 hover:border-[#00E676]`
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${colors.bg} ${colors.text} ${colors.border} border`}>
                                {task.category}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">{task.time}</span>
                            </div>
                            <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-zinc-600' : (theme === 'dark' ? 'text-white' : 'text-zinc-900')}`}>
                              {task.title}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => generateTaskScript(task)}
                            className="p-2 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-500 rounded-lg transition-all"
                            title="Gerar Script"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* 3. O Pensar do CRM (Sugestões Proativas) */}
        <div className="space-y-6">
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center gap-3 mb-8">
              <Brain className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>O Pensar do CRM</h3>
            </div>

            <div className="space-y-4">
              {proactiveSuggestions.map((suggest) => {
                const colors = getCategoryColor(suggest.category);
                return (
                  <div 
                    key={suggest.id}
                    className={`${theme === 'dark' ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100'} border rounded-2xl p-4 space-y-3`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${colors.bg} ${colors.text} ${colors.border} border`}>
                        {suggest.category}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{suggest.title}</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{suggest.description}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedScript({ title: suggest.title, content: suggest.script })}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900'} transition-all flex items-center justify-center gap-2`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        SCRIPT
                      </button>
                      <button 
                        onClick={() => onAddTask({
                          title: suggest.title,
                          date: new Date().toISOString().split('T')[0],
                          time: '14:00',
                          category: suggest.category,
                          completed: false,
                          isAutoGenerated: true
                        })}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold ${theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white'} transition-all flex items-center justify-center gap-2`}
                      >
                        <Plus className="w-3 h-3" />
                        AGENDA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Modal Script */}
      {selectedScript && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} border rounded-3xl p-8 w-full max-w-lg shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Script de Abordagem</h3>
              </div>
              <button onClick={() => setSelectedScript(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-100'} border mb-6`}>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {selectedScript.content}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedScript.content);
                  alert('Copiado para a área de transferência!');
                }}
                className={`flex-1 ${theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white'} py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2`}
              >
                <CheckCircle2 className="w-4 h-4" />
                COPIAR SCRIPT
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Nova Tarefa */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} border rounded-3xl p-8 w-full max-w-md shadow-2xl`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Nova Atividade</h3>
            </div>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Descrição da Tarefa</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Ligar para João (Metalúrgica)"
                  className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Data</label>
                  <input 
                    type="date" 
                    required
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Hora</label>
                  <input 
                    type="time" 
                    required
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Categoria (3S+M)</label>
                <select 
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                  className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'}`}
                >
                  <option value={TaskCategory.SERVICE}>Serviço (S1)</option>
                  <option value={TaskCategory.SATISFACTION}>Satisfação (S2)</option>
                  <option value={TaskCategory.SALES}>Vendas (S3)</option>
                  <option value={TaskCategory.MAINTENANCE}>Manutenção (+M)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className={`flex-1 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'} py-3 rounded-xl text-sm font-bold transition-all`}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={`flex-1 ${theme === 'dark' ? 'bg-[#00E676] hover:bg-[#00E676]/90 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'} py-3 rounded-xl text-sm font-bold transition-all`}
                >
                  Agendar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
