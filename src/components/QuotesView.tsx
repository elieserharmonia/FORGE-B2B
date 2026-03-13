import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Eye, 
  Trash2, 
  Pencil, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Truck,
  CreditCard,
  Calendar,
  Building2,
  Tag,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, QuoteStatus } from '../types';

interface QuotesViewProps {
  quotes: Quote[];
  onSave: (quote: Quote) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  customers: { name: string; cnpj: string }[];
  theme: 'dark' | 'light';
  orgId: string;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  onSave,
  onDelete,
  searchTerm,
  setSearchTerm,
  customers,
  theme,
  orgId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const filteredQuotes = useMemo(() => {
    return quotes
      .filter(q => 
        q.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotes, searchTerm]);

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.APPROVED: return 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/20';
      case QuoteStatus.SENT: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case QuoteStatus.LOST: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAdd = () => {
    setEditingQuote(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} tracking-tight`}>Orçamentos Emitidos</h2>
          <p className="text-zinc-500 text-sm mt-1">Gestão de propostas comerciais e histórico de negociações.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleAdd}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] shadow-[#00E676]/20' : 'bg-blue-600 shadow-blue-500/20'} hover:opacity-90 text-${theme === 'dark' ? 'black' : 'white'} px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg`}
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </button>

          <div className="relative group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} transition-colors`} />
            <input 
              type="text" 
              placeholder="Buscar por Ref, Cliente ou Marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:${theme === 'dark' ? 'border-[#00E676]/50 ring-[#00E676]/20' : 'border-blue-500/50 ring-blue-500/20'} focus:ring-1 transition-all`}
            />
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuotes.map((quote) => (
          <motion.div 
            key={quote.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-6 backdrop-blur-sm group hover:${theme === 'dark' ? 'border-[#00E676]/20' : 'border-blue-500/20'} transition-all`}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Info Principal */}
              <div className="flex-grow space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676] bg-[#00E676]/5 border-[#00E676]/10' : 'text-blue-600 bg-blue-50 border-blue-100'} px-2 py-0.5 rounded border`}>
                    {quote.ref}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {new Date(quote.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${theme === 'dark' ? 'bg-zinc-800 border-white/5' : 'bg-zinc-100 border-zinc-200'} flex items-center justify-center border`}>
                    <Building2 className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} group-hover:${theme === 'dark' ? 'text-[#00E676]/80' : 'text-blue-600'} transition-colors`}>{quote.customerName}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{quote.customerCnpj}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Tag className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-tighter">Marca</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-700'} font-medium`}>{quote.brand}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Truck className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-tighter">Logística</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-700'} font-medium`}>{quote.deliveryType}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <CreditCard className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-tighter">Pagamento</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-700'} font-medium`}>{quote.paymentTerms}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] uppercase font-bold tracking-tighter">Validade</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-700'} font-medium`}>{quote.proposalValidity}</p>
                  </div>
                </div>
              </div>

              {/* Valores e Ações */}
              <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Valor Total com ICMS</span>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>{formatCurrency(quote.totalAmountWithIcms)}</p>
                </div>

                {quote.status === QuoteStatus.LOST && quote.lossReason && (
                  <div className={`${theme === 'dark' ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'} p-2 rounded-lg w-full border`}>
                    <p className="text-[9px] text-red-400 uppercase font-bold mb-1">Motivo da Perda</p>
                    <p className="text-[10px] text-zinc-400 italic leading-tight">{quote.lossReason}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <button 
                    className={`flex-grow flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/5' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200'} py-2 rounded-xl text-xs font-bold transition-all border`}
                    onClick={() => alert('Visualizando PDF simulado para ' + quote.ref)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button 
                    onClick={() => handleEdit(quote)}
                    className={`p-2 ${theme === 'dark' ? 'hover:bg-zinc-800 border-white/5' : 'hover:bg-zinc-100 border-zinc-200'} rounded-xl text-zinc-500 hover:${theme === 'dark' ? 'text-white' : 'text-zinc-900'} transition-all border`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(quote.id)}
                    className={`p-2 ${theme === 'dark' ? 'hover:bg-red-500/10 border-white/5' : 'hover:bg-red-50 border-red-100'} rounded-xl text-zinc-500 hover:text-red-400 transition-all border`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className={`py-20 text-center ${theme === 'dark' ? 'bg-zinc-900/20 border-white/5' : 'bg-zinc-50 border-zinc-200'} border-2 border-dashed rounded-3xl`}>
            <FileText className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-600">Nenhum orçamento encontrado</h3>
            <p className="text-sm text-zinc-700 mt-1">Tente ajustar sua busca ou crie um novo orçamento.</p>
          </div>
        )}
      </div>

      {/* Modal CRUD Orçamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`relative ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl`}
            >
              <div className={`p-6 border-b border-white/5 flex items-center justify-between ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-zinc-50'}`}>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{editingQuote ? 'Editar Orçamento' : 'Novo Orçamento'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const selectedCustomer = customers.find(c => c.cnpj === formData.get('customerCnpj'));
                
                const quoteData: Quote = {
                  id: editingQuote?.id || Math.random().toString(36).substr(2, 9),
                  org_id: orgId,
                  ref: formData.get('ref') as string,
                  date: formData.get('date') as string,
                  brand: formData.get('brand') as string,
                  customerName: selectedCustomer?.name || '',
                  customerCnpj: formData.get('customerCnpj') as string,
                  totalAmountWithIcms: Number(formData.get('totalAmountWithIcms')),
                  deliveryType: formData.get('deliveryType') as string,
                  paymentTerms: formData.get('paymentTerms') as string,
                  deliveryTime: formData.get('deliveryTime') as string,
                  proposalValidity: formData.get('proposalValidity') as string,
                  status: formData.get('status') as QuoteStatus,
                  lossReason: formData.get('lossReason') as string || undefined
                };
                onSave(quoteData);
                setIsModalOpen(false);
              }} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Referência (REF_ORCAMENTO)</label>
                    <input name="ref" defaultValue={editingQuote?.ref || `ORC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`} required className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Data do Orçamento</label>
                    <input name="date" type="date" defaultValue={editingQuote?.date || new Date().toISOString().split('T')[0]} required className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Marca</label>
                    <input name="brand" defaultValue={editingQuote?.brand} required placeholder="Ex: PANASONIC, BOSCH..." className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</label>
                    <select name="status" defaultValue={editingQuote?.status || QuoteStatus.SENT} className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`}>
                      {Object.values(QuoteStatus).map(s => <option key={s} value={s} className={theme === 'dark' ? "bg-zinc-900" : "bg-white"}>{s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cliente (Vincular)</label>
                    <select name="customerCnpj" defaultValue={editingQuote?.customerCnpj} required className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`}>
                      <option value="" className={theme === 'dark' ? "bg-zinc-900" : "bg-white"}>Selecione um cliente...</option>
                      {customers.map(c => <option key={c.cnpj} value={c.cnpj} className={theme === 'dark' ? "bg-zinc-900" : "bg-white"}>{c.name} ({c.cnpj})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Valor Total com ICMS</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input name="totalAmountWithIcms" type="number" step="0.01" defaultValue={editingQuote?.totalAmountWithIcms} required className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all font-mono`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tipo de Entrega (Frete)</label>
                    <input name="deliveryType" defaultValue={editingQuote?.deliveryType} placeholder="Ex: CIF, FOB..." className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Prazo de Pagamento</label>
                    <input name="paymentTerms" defaultValue={editingQuote?.paymentTerms} placeholder="Ex: 28 DDL, À Vista..." className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Prazo de Entrega</label>
                    <input name="deliveryTime" defaultValue={editingQuote?.deliveryTime} placeholder="Ex: 15 dias, Pronta Entrega..." className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Validade da Proposta</label>
                    <input name="proposalValidity" defaultValue={editingQuote?.proposalValidity} placeholder="Ex: 30 dias..." className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all`} />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Motivo da Perda (Se aplicável)</label>
                    <textarea name="lossReason" defaultValue={editingQuote?.lossReason} className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/5 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'} border rounded-xl px-4 py-2.5 text-sm focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} outline-none transition-all h-20 resize-none`} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-white transition-all">Cancelar</button>
                  <button type="submit" className={`${theme === 'dark' ? 'bg-[#00E676] shadow-[#00E676]/20' : 'bg-blue-600 shadow-blue-500/20'} hover:opacity-90 text-${theme === 'dark' ? 'black' : 'white'} px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg`}>Salvar Orçamento</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
