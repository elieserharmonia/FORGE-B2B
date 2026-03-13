import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Filter,
  Calendar,
  User as UserIcon,
  Building2,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { Forecast, ClientBudget, Confidence, User, UserRole } from '../types';

interface DashboardViewProps {
  forecasts: Forecast[];
  budgets: ClientBudget[];
  users: User[];
  suppliers: string[];
  segments: string[];
  technicalRoleName: string;
  theme: 'dark' | 'light';
}

const COLORS = {
  realized: '#00E676', // Vibrant Green
  negotiation: '#f59e0b', // Amber-500
  technical: '#FFD700', // Gold
  target: '#06b6d4', // Cyan-500
  chart: ['#00E676', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e']
};

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  forecasts, 
  budgets, 
  users,
  suppliers,
  segments,
  technicalRoleName,
  theme
}) => {
  // Filters State
  const [filterSeller, setFilterSeller] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<number>(2024);

  // Filtered Data
  const filteredForecasts = useMemo(() => {
    return forecasts.filter(f => {
      const sellerMatch = filterSeller === 'all' || f.sellerId === filterSeller;
      const supplierMatch = filterSupplier === 'all' || f.supplierName === filterSupplier;
      const segmentMatch = filterSegment === 'all' || f.segment === filterSegment;
      const yearMatch = new Date(f.date).getFullYear() === filterYear;
      return sellerMatch && supplierMatch && segmentMatch && yearMatch;
    });
  }, [forecasts, filterSeller, filterSupplier, filterSegment, filterYear]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const sellerMatch = filterSeller === 'all' || b.sellerId === filterSeller;
      const yearMatch = b.year === filterYear;
      return sellerMatch && yearMatch;
    });
  }, [budgets, filterSeller, filterYear]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalBudgeted = filteredForecasts.reduce((acc, curr) => acc + curr.amount, 0);
    const totalRealized = filteredForecasts
      .filter(f => f.confidence === Confidence.C100)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const conversionRate = totalBudgeted > 0 ? (totalRealized / totalBudgeted) * 100 : 0;
    
    const totalGoal = filteredBudgets.reduce((acc, b) => 
      acc + b.suppliers.reduce((sAcc, s) => sAcc + s.goal, 0), 0
    );
    
    const gapToTarget = totalGoal - totalRealized;

    return {
      totalBudgeted,
      totalRealized,
      conversionRate,
      totalGoal,
      gapToTarget
    };
  }, [filteredForecasts, filteredBudgets]);

  // Chart Data: Supplier Share (Donut)
  const supplierShareData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredForecasts.forEach(f => {
      data[f.supplierName] = (data[f.supplierName] || 0) + f.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredForecasts]);

  // Chart Data: Monthly Realized vs Meta (Bar)
  const monthlyComparisonData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((month, idx) => {
      const monthNum = idx + 1;
      const realized = filteredForecasts
        .filter(f => f.confidence === Confidence.C100 && new Date(f.date).getMonth() + 1 === monthNum)
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      const meta = filteredBudgets
        .filter(b => b.month === monthNum)
        .reduce((acc, b) => acc + b.suppliers.reduce((sAcc, s) => sAcc + s.goal, 0), 0);

      return {
        name: month,
        Realizado: realized,
        Meta: meta
      };
    });
  }, [filteredForecasts, filteredBudgets]);

  // Chart Data: Sales Funnel (Confidence)
  const funnelData = useMemo(() => {
    const levels = [
      { value: Confidence.C10, name: '10% Prospecção', fill: '#ef4444' },
      { value: Confidence.C30, name: '30% Qualificação', fill: '#f97316' },
      { value: Confidence.C50, name: '50% Proposta', fill: '#f59e0b' },
      { value: Confidence.C90, name: '90% Negociação', fill: '#eab308' },
      { value: Confidence.C100, name: '100% Fechado', fill: '#10b981' }
    ];

    return levels.map(level => ({
      name: level.name,
      value: filteredForecasts
        .filter(f => f.confidence === level.value)
        .reduce((acc, curr) => acc + curr.amount, 0),
      fill: level.fill
    })).reverse(); // Funnel usually top to bottom
  }, [filteredForecasts]);

  // Technical Highlight Stats
  const technicalStats = useMemo(() => {
    const technicalForecasts = filteredForecasts.filter(f => f.tem_ea);
    const totalTechnical = technicalForecasts.reduce((acc, curr) => acc + curr.amount, 0);
    const realizedTechnical = technicalForecasts
      .filter(f => f.confidence === Confidence.C100)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      total: totalTechnical,
      realized: realizedTechnical,
      rate: totalTechnical > 0 ? (realizedTechnical / totalTechnical) * 100 : 0
    };
  }, [filteredForecasts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Filters Header */}
      <div className={`${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl backdrop-blur-md`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${theme === 'dark' ? 'bg-[#00E676]/10' : 'bg-blue-50'} rounded-lg`}>
              <Filter className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Filtros de BI</h3>
              <p className="text-xs text-zinc-500">Ajuste a visão estratégica do dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 lg:max-w-4xl">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> Vendedor
              </label>
              <select 
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
                className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'} border border-white/5 rounded-xl px-3 py-2 text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} focus:outline-none focus:border-[#00E676]/50`}
              >
                <option value="all">Todos os Vendedores</option>
                {users.filter(u => u.role === UserRole.SELLER).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Fornecedor
              </label>
              <select 
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'} border border-white/5 rounded-xl px-3 py-2 text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} focus:outline-none focus:border-[#00E676]/50`}
              >
                <option value="all">Todos Fornecedores</option>
                {suppliers.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Segmento
              </label>
              <select 
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'} border border-white/5 rounded-xl px-3 py-2 text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} focus:outline-none focus:border-[#00E676]/50`}
              >
                <option value="all">Todos Segmentos</option>
                {segments.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Ano
              </label>
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'} border border-white/5 rounded-xl px-3 py-2 text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} focus:outline-none focus:border-[#00E676]/50`}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme === 'dark' ? 'bg-zinc-900/40' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className={`w-12 h-12 ${theme === 'dark' ? 'text-white' : 'text-zinc-400'}`} />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Orçado</span>
          <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} mt-1 font-mono`}>{formatCurrency(stats.totalBudgeted)}</h4>
          <p className="text-[10px] text-zinc-500 mt-2">Volume total em negociação</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'dark' ? 'bg-zinc-900/40 border-[#00E676]/20' : 'bg-white border-blue-100 shadow-sm'} p-6 rounded-2xl relative overflow-hidden group border`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className={`w-12 h-12 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
          </div>
          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} uppercase tracking-widest`}>Total Realizado</span>
          <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} mt-1 font-mono`}>{formatCurrency(stats.totalRealized)}</h4>
          <div className={`mt-2 flex items-center gap-1 text-[10px] ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`}>
            <TrendingUp className="w-3 h-3" />
            <span>Faturamento Confirmado</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${theme === 'dark' ? 'bg-zinc-900/40' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-12 h-12 text-blue-500" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Taxa de Conversão</span>
          <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} mt-1 font-mono`}>{stats.conversionRate.toFixed(1)}%</h4>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={`${theme === 'dark' ? 'bg-[#00E676]' : 'bg-blue-600'} h-full transition-all duration-1000`} style={{ width: `${stats.conversionRate}%` }} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${theme === 'dark' ? 'bg-zinc-900/40' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-12 h-12 text-cyan-500" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Gap de Meta</span>
          <h4 className={`text-2xl font-bold mt-1 font-mono ${stats.gapToTarget > 0 ? 'text-red-400' : (theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600')}`}>
            {formatCurrency(Math.abs(stats.gapToTarget))}
          </h4>
          <p className="text-[10px] text-zinc-500 mt-2">
            {stats.gapToTarget > 0 ? 'Faltam para atingir o Budget' : 'Meta superada!'}
          </p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Realizado vs Meta Bar Chart */}
        <div className={`${theme === 'dark' ? 'bg-zinc-900/30' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <BarChart3 className={`w-4 h-4 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase tracking-wider`}>Realizado vs Meta Mensal</h4>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-[#00E676]' : 'bg-blue-600'}`} />
                <span className="text-zinc-400">Realizado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-zinc-400">Meta</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#ffffff05" : "#00000005"} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="Realizado" fill={theme === 'dark' ? COLORS.realized : '#2563EB'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Meta" fill={COLORS.target} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Share Donut Chart */}
        <div className={`${theme === 'dark' ? 'bg-zinc-900/30' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl`}>
          <div className="flex items-center gap-2 mb-8">
            <PieChartIcon className="w-4 h-4 text-blue-500" />
            <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase tracking-wider`}>Share de Fornecedores</h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supplierShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {supplierShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={theme === 'dark' ? COLORS.chart[index % COLORS.chart.length] : ['#2563EB', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Volume']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] text-zinc-400 uppercase font-bold">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Funnel Chart */}
        <div className={`${theme === 'dark' ? 'bg-zinc-900/30' : 'bg-white shadow-sm'} border border-white/5 p-6 rounded-2xl`}>
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} uppercase tracking-wider`}>Funil de Vendas (Confidence)</h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: number) => [formatCurrency(value), 'Volume']}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#71717a" stroke="none" dataKey="name" fontSize={10} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Highlight Card */}
        <div className={`${theme === 'dark' ? 'bg-zinc-900/30 border-[#FFD700]/20' : 'bg-white border-blue-100 shadow-sm'} p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden border`}>
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Target className={`w-48 h-48 ${theme === 'dark' ? 'text-[#FFD700]' : 'text-blue-600'}`} />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
            <h4 className="text-sm font-bold text-[#FFD700] uppercase tracking-widest">Destaque {technicalRoleName}</h4>
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Volume em Projetos {technicalRoleName.split(' ').map(w => w[0]).join('')}</span>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'} font-mono`}>{formatCurrency(technicalStats.total)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-50'} p-4 rounded-xl border border-white/5`}>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Realizado {technicalRoleName.split(' ').map(w => w[0]).join('')}</span>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} font-mono`}>{formatCurrency(technicalStats.realized)}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-50'} p-4 rounded-xl border border-white/5`}>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Conversão {technicalRoleName.split(' ').map(w => w[0]).join('')}</span>
                <p className="text-xl font-bold text-[#FFD700] font-mono">{technicalStats.rate.toFixed(1)}%</p>
              </div>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-[#FFD700]/5 border-[#FFD700]/10' : 'bg-blue-50 border-blue-100'} border rounded-xl`}>
              <p className={`text-xs ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'} leading-relaxed`}>
                Oportunidades com acompanhamento de {technicalRoleName} apresentam uma taxa de conversão 
                <span className={`${theme === 'dark' ? 'text-[#FFD700]' : 'text-blue-600'} font-bold`}> {((technicalStats.rate / (stats.conversionRate || 1)) * 100 - 100).toFixed(0)}% superior </span> 
                à média geral.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
