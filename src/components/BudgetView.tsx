import React, { useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  AlertCircle,
  Loader2,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
import { User, ClientBudget, ForecastItem } from '../types';

export interface BudgetViewProps {
  data: ForecastItem[];
  budgets: ClientBudget[];
  setBudgets: React.Dispatch<React.SetStateAction<ClientBudget[]>>;
  userRole: string;
  currentUser: User;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  isModalOpen: boolean;
  setIsModalOpen: (o: boolean) => void;
  theme: 'dark' | 'light';
  orgId: string | null;
  isLoadingOrg: boolean;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  data,
  budgets,
  selectedYear,
  selectedMonth,
  theme,
  orgId,
  isLoadingOrg
}) => {
  // 2. Lógica de Renderização Defensiva
  if (isLoadingOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white min-h-[60vh] rounded-3xl border-2 border-zinc-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-[#000000]">Carregando dados da organização...</h2>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white min-h-[60vh] rounded-3xl border-2 border-zinc-100">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-[#000000]">Aguardando configuração de equipe...</h2>
        <p className="text-zinc-500 mt-2">Você precisa estar vinculado a uma organização para ver o Budget.</p>
      </div>
    );
  }

  // Cálculos de Meta e Alcançado
  const stats = useMemo(() => {
    // Meta do Mês Atual (de budgets)
    const currentMonthBudgets = budgets.filter(b => b.year === selectedYear && b.month === selectedMonth);
    const totalGoal = currentMonthBudgets.reduce((acc, b) => 
      acc + b.suppliers.reduce((sAcc, s) => sAcc + s.goal, 0), 0
    );

    // Alcançado (de ForecastItem filtrado por orgId e mês)
    // Nota: ForecastItem tem campos booleanos mar26, abr26, etc.
    // Para simplificar, vamos assumir que estamos olhando para o mês selecionado.
    // Mapeamento simples de mês para campo (exemplo)
    const monthMap: Record<number, keyof ForecastItem> = {
      3: 'mar26',
      4: 'abr26',
      5: 'mai26'
    };
    
    const monthField = monthMap[selectedMonth];
    
    const reached = data
      .filter(item => item.org_id === orgId && (monthField ? item[monthField] : true))
      .reduce((acc, item) => acc + item.amount, 0);

    const gap = totalGoal - reached;
    const progress = totalGoal > 0 ? (reached / totalGoal) * 100 : 0;

    return {
      totalGoal,
      reached,
      gap: gap > 0 ? gap : 0,
      progress: Math.min(progress, 100)
    };
  }, [budgets, data, selectedYear, selectedMonth, orgId]);

  const chartData = [
    {
      name: 'Budget vs Real',
      Meta: stats.totalGoal,
      Alcançado: stats.reached
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 p-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#000000] tracking-tighter">Visão Geral de <span className="text-blue-600">BUDGET</span></h2>
          <p className="text-zinc-500 font-medium">Acompanhamento de metas comerciais e performance industrial.</p>
        </div>
        <div className="bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Período:</span>
          <span className="ml-2 text-sm font-black text-[#000000]">{selectedMonth}/2026</span>
        </div>
      </div>

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cartão Principal: Meta do Mês */}
        <div className="bg-white border-4 border-[#000000] rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Meta Mensal</span>
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Meta do Mês Atual</p>
            <h3 className="text-4xl font-black text-[#000000] tracking-tighter">
              {formatCurrency(stats.totalGoal)}
            </h3>
          </div>
        </div>

        {/* Cartão: Alcançado */}
        <div className="bg-white border-2 border-zinc-200 rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Realizado</span>
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Alcançado no Forecast</p>
            <h3 className="text-4xl font-black text-[#000000] tracking-tighter">
              {formatCurrency(stats.reached)}
            </h3>
          </div>
        </div>

        {/* Cartão: Atingimento */}
        <div className="bg-white border-2 border-zinc-200 rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Performance</span>
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1">Taxa de Atingimento</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-[#000000] tracking-tighter">
                {stats.progress.toFixed(1)}%
              </h3>
              <span className="text-xs font-bold text-zinc-400">da meta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Performance */}
      <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h4 className="text-xl font-black text-[#000000] tracking-tight">Meta vs. Alcançado</h4>
            <p className="text-sm text-zinc-500 font-medium">Comparativo direto de performance financeira</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-zinc-200 rounded-full" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase">Meta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase">Real</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={120}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                hide 
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${value / 1000}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white p-4 rounded-2xl shadow-xl border border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Comparativo</p>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center justify-between gap-8 mb-1 last:mb-0">
                            <span className="text-xs font-bold">{entry.name}:</span>
                            <span className="text-xs font-mono font-bold text-blue-400">{formatCurrency(entry.value)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="Meta" fill="#f4f4f5" radius={[20, 20, 0, 0]} />
              <Bar dataKey="Alcançado" fill="#2563eb" radius={[20, 20, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rodapé do Gráfico */}
        <div className="mt-10 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Gap para Meta</p>
              <p className="text-lg font-black text-[#000000]">{formatCurrency(stats.gap)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status de Faturamento</p>
              <p className="text-lg font-black text-blue-600">
                {stats.progress >= 100 ? 'Meta Superada' : 'Em Progresso'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
