import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Archive, 
  FileText, 
  CheckCircle2, 
  TrendingUp,
  Package,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { ForecastItem } from '../types';

interface PostSalesViewProps {
  data: ForecastItem[];
  onUpdate: (item: ForecastItem) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  theme: 'dark' | 'light';
}

export const PostSalesView: React.FC<PostSalesViewProps> = ({ 
  data, 
  onUpdate,
  searchTerm,
  setSearchTerm,
  theme
}) => {
  const handleArchive = (item: ForecastItem) => {
    onUpdate({ ...item, arquivado: true });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} tracking-tight`}>Pós-Venda</h2>
          <p className="text-zinc-500 text-sm mt-1">Acompanhamento de entregas, faturamento e satisfação.</p>
        </div>

        <div className="relative group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} transition-colors`} />
          <input 
            type="text" 
            placeholder="Buscar por PO ou NF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${theme === 'dark' ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-xl pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:${theme === 'dark' ? 'border-[#00E676]/50 ring-[#00E676]/20' : 'border-blue-500/50 ring-blue-500/20'} focus:ring-1 transition-all`}
          />
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-6 backdrop-blur-sm group hover:${theme === 'dark' ? 'border-[#00E676]/20' : 'border-blue-500/20'} transition-all`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest`}>{item.id}</span>
                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} mt-1`}>{item.customer}</h3>
                <p className="text-xs text-zinc-500">{item.supplier}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleArchive(item)}
                  className={`p-2 ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-lg text-zinc-500 hover:text-amber-500 transition-colors`}
                  title="Arquivar"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-zinc-50 border-zinc-100'} p-3 rounded-xl border`}>
                <p className="text-[9px] text-zinc-500 uppercase font-mono mb-1">PO Número</p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>{item.po_numero}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-zinc-50 border-zinc-100'} p-3 rounded-xl border`}>
                <p className="text-[9px] text-zinc-500 uppercase font-mono mb-1">NF Número</p>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>{item.nf_numero}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs text-zinc-400">Status Entrega</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  item.status_entrega === 'Entregue' ? (theme === 'dark' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-green-100 text-green-700') :
                  item.status_entrega === 'Em trânsito' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {item.status_entrega || 'Aguardando'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs text-zinc-400">Garantia até</span>
                </div>
                <span className={`text-xs font-mono ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{item.data_garantia || 'N/A'}</span>
              </div>

              <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs text-zinc-400">Satisfação (NPS)</span>
                  </div>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`}>{item.nps ? `${item.nps}/10` : 'Pendente'}</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'} h-1.5 rounded-full overflow-hidden`}>
                  <div 
                    className={`${theme === 'dark' ? 'bg-[#00E676]' : 'bg-blue-600'} h-full transition-all duration-500`} 
                    style={{ width: `${(item.nps || 0) * 10}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className={`flex-grow flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/5' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200'} py-2 rounded-xl text-xs font-bold transition-all border`}>
                <FileText className="w-3.5 h-3.5" />
                Ver Documentos
              </button>
              <button className={`flex-grow flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border-[#00E676]/20' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'} py-2 rounded-xl text-xs font-bold transition-all border`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalizar
              </button>
            </div>
          </motion.div>
        ))}

        {data.length === 0 && (
          <div className={`col-span-full py-20 text-center ${theme === 'dark' ? 'bg-zinc-900/20 border-white/5' : 'bg-zinc-50 border-zinc-200'} border-2 border-dashed rounded-3xl`}>
            <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-600">Nenhum item no Pós-Venda</h3>
            <p className="text-sm text-zinc-700 mt-1">Oportunidades faturadas aparecerão aqui automaticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};
