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
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { ForecastItem, CommandCenterTask, TaskCategory, Customer } from '../types';

interface FridayReportViewProps {
  data: ForecastItem[];
  tasks: CommandCenterTask[];
  customers: Customer[];
  theme: 'dark' | 'light';
  technicalRoleName: string;
}

export const FridayReportView: React.FC<FridayReportViewProps> = ({
  data,
  tasks,
  customers,
  theme,
  technicalRoleName
}) => {
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

  // 1. Exportação Excel Idêntica
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

    // Nota: A formatação de cores em arquivos .xlsx via SheetJS puro (versão gratuita) é limitada.
    // Para cores reais, precisaríamos da versão Pro ou de bibliotecas como exceljs.
    // No entanto, vamos gerar o arquivo básico conforme solicitado.
    XLSX.writeFile(workbook, `resumo do forecast.xlsx`);
  };

  // 2. Gerador de E-mail Estruturado
  const emailContent = useMemo(() => {
    const activeOpps = data.filter(item => parseInt(item.confidence) < 100);
    
    let content = `Rafael, boa tarde. Segue relatório referente às visitas da semana.\n\n`;

    activeOpps.forEach(item => {
      const recentTasks = tasks.filter(t => 
        (t.relatedForecastId === item.id || t.title.includes(item.customer)) && 
        new Date(t.date) >= sevenDaysAgo
      );

      const recentHistory = item.history.filter(h => new Date(h.date) >= sevenDaysAgo);

      content += `--------------------------------------------------\n`;
      content += `CLIENTE: ${item.customer.toUpperCase()}\n`;
      content += `--------------------------------------------------\n`;
      content += `ID: ${item.id} | RESP: ${item.respSigla} | SUPP: ${item.supplier} | VALOR: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)} | CONF: ${item.confidence} | UF: ${item.uf}\n`;
      content += `FOLLOW-UP:\n${item.followUp}\n\n`;

      content += `RESUMO DA SEMANA:\n`;
      if (recentHistory.length > 0) {
        recentHistory.forEach(h => content += `• ${h.report}\n`);
      }
      if (recentTasks.length > 0) {
        recentTasks.forEach(t => content += `• [Tarefa] ${t.title} (${t.completed ? 'Concluída' : 'Pendente'})\n`);
      }
      if (recentHistory.length === 0 && recentTasks.length === 0) {
        content += `• Sem atividades registradas nos últimos 7 dias.\n`;
      }

      content += `\nPRÓXIMO PASSO (5W2H):\n`;
      if (item.planOfAction) {
        content += `• Ação: ${item.planOfAction.what}\n`;
        content += `• Data: ${item.planOfAction.when}\n`;
      } else {
        content += `• Ação: ${item.nextStep || 'Não definido'}\n`;
      }
      content += `\n\n`;
    });

    content += `Atenciosamente,\nEF`;
    return content;
  }, [data, tasks, sevenDaysAgo]);

  const handleSendEmail = () => {
    const to = 'rafael.gomez@empresa.com';
    const cc = 'washington@empresa.com';
    const subject = `[FORGE CRM] Relatório Semanal de Forecast - EF - ${formattedDate}`;
    const body = encodeURIComponent(emailContent);
    window.open(`mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Relatório de Sexta-Feira</h2>
          <p className="text-zinc-500 text-sm">Consolidação semanal para Rafael Gomez (RG) e Washington (WA)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900'} px-4 py-2 rounded-xl text-xs font-bold transition-all`}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumo Visual */}
        <div className="lg:col-span-2 space-y-6">
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Oportunidades Ativas no Relatório</h3>
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
                        <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{item.customer}</h4>
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

        {/* Info Lateral */}
        <div className="space-y-6">
          <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-3xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Status do Relatório</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Total de Oportunidades:</span>
                <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{data.filter(item => parseInt(item.confidence) < 100).length}</span>
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

      {/* Modal de Pré-visualização do E-mail (Sempre em Modo Claro conforme solicitado) */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-zinc-200 shadow-2xl border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header do Modal */}
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

              {/* Corpo do E-mail (Modo Claro Padrão Windows) */}
              <div className="flex-grow overflow-y-auto p-8 bg-white text-black font-sans">
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

              {/* Footer do Modal */}
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
