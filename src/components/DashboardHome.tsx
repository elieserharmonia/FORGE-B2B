import React, { useMemo } from 'react';
import { 
  Sparkles, 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ForecastItem, ConfidenceLevel } from '../types';

interface DashboardHomeProps {
  bestAction: {
    title: string;
    description: string;
    type: 'critical' | 'pending' | 'normal';
    script: string;
  };
  forecasts: ForecastItem[];
  onGenerateScript: (script: string, title: string) => void;
  onEditItem: (item: ForecastItem) => void;
  theme: 'dark' | 'light';
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ 
  bestAction, 
  forecasts, 
  onGenerateScript,
  onEditItem,
  theme 
}) => {
  const pipelineData = useMemo(() => {
    const data: Record<string, number> = {
      '10% (Sonho)': 0,
      '30% (Orçamento)': 0,
      '40% (Demo)': 0,
      '50% (Interesse)': 0,
      '80% (Pedido/RFQ)': 0,
      '90% (Pedido/PO)': 0,
      '100% (Entregue)': 0,
    };

    forecasts.forEach(item => {
      if (data[item.confidence] !== undefined) {
        data[item.confidence] += item.amount;
      }
    });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [forecasts]);

  const pendencies = useMemo(() => {
    return forecasts.filter(f => f.pendencia_vendedor);
  }, [forecasts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* 1. Sua Melhor Ação Agora */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border-2 ${
          bestAction.type === 'critical' ? 'border-red-500/30 bg-red-500/5' : 
          bestAction.type === 'pending' ? 'border-yellow-500/30 bg-yellow-500/5' : 
          (theme === 'dark' ? 'border-[#00E676]/30 bg-[#00E676]/5' : 'border-blue-500/30 bg-blue-500/5')
        } relative overflow-hidden group`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Brain className={`w-32 h-32 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
              bestAction.type === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
              bestAction.type === 'pending' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' : 
              (theme === 'dark' ? 'bg-[#00E676]/20 border-[#00E676]/30 text-[#00E676]' : 'bg-blue-600/20 border-blue-600/30 text-blue-600')
            }`}>
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-black uppercase tracking-[0.2em] ${
                  bestAction.type === 'critical' ? 'text-red-500' : 
                  bestAction.type === 'pending' ? (theme === 'dark' ? 'text-yellow-500' : 'text-amber-600') : 
                  (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')
                }`}>Sua Melhor Ação Agora</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-700'}`}>IA Proativa</span>
              </div>
              <h3 className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight`}>{bestAction.title}</h3>
              <p className={`text-lg mt-2 max-w-2xl ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} font-medium`}>{bestAction.description}</p>
            </div>
          </div>
          
          <button 
            onClick={() => onGenerateScript(bestAction.script, bestAction.title)}
            className={`flex items-center gap-3 ${
              bestAction.type === 'critical' ? 'bg-red-600 hover:bg-red-500 text-white' : 
              bestAction.type === 'pending' ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 
              (theme === 'dark' ? 'bg-[#00E676] hover:bg-[#00E676]/90 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white')
            } px-8 py-4 rounded-2xl text-base font-black transition-all shadow-2xl hover:scale-105 active:scale-95`}
          >
            <MessageSquare className="w-5 h-5" />
            Gerar Script WhatsApp
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Gráfico de Pipeline */}
        <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className={`w-6 h-6 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
            <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-black'} uppercase tracking-widest`}>Pipeline por Confiança</h4>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#ffffff05" : "#00000005"} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke={theme === 'dark' ? "#71717a" : "#3f3f46"} 
                  fontSize={10} 
                  width={120}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#ffffff05' : '#00000005' }}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Volume']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {pipelineData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name.includes('100%') ? '#00E676' : 
                        entry.name.includes('90%') ? '#2196F3' : 
                        entry.name.includes('80%') ? '#4CAF50' : 
                        entry.name.includes('50%') ? '#FF9800' : 
                        entry.name.includes('0%') ? '#9E9E9E' : '#607D8B'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Pendências do Dia */}
        <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-black'} uppercase tracking-widest`}>Pendências do Dia</h4>
            </div>
            <span className="text-xs font-bold text-zinc-500">{pendencies.length} pendentes</span>
          </div>
          
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {pendencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Tudo em dia por aqui!</p>
              </div>
            ) : (
              pendencies.map(item => (
                <div 
                  key={item.id}
                  onClick={() => onEditItem(item)}
                  className={`p-4 rounded-2xl border-l-8 border-yellow-500 ${theme === 'dark' ? 'bg-zinc-800/50 hover:bg-zinc-800' : 'bg-yellow-50 hover:bg-yellow-100'} transition-all cursor-pointer group`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-zinc-500">{item.id}</span>
                        <span className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{item.customer}</span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-500">{formatCurrency(item.amount)}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded">Ação Necessária</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
