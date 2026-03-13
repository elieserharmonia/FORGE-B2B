import React from 'react';
import { Sparkles, Brain, MessageSquare, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { ForecastItem } from '../types';

interface AICoachProps {
  item: ForecastItem;
  technicalRoleName: string;
}

export const AICoach: React.FC<AICoachProps> = ({ item, technicalRoleName }) => {
  const generateInsight = () => {
    const { planOfAction } = item;
    if (!planOfAction) return "Preencha o 5W2H para receber insights estratégicos.";

    const why = planOfAction.why.toLowerCase();
    const how = planOfAction.how.toLowerCase();
    const what = planOfAction.what.toLowerCase();

    if (why.includes('torque') || how.includes('panasonic')) {
      return `Vendedor, o cliente tem uma dor técnica real em aperto. Sugira uma medição de capabilidade (Cp/Cpk) com a ferramenta Panasonic para provar o ganho de qualidade na linha. Isso justifica o valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}.`;
    }

    if (why.includes('ergonomia') || what.includes('demonstração')) {
      return `Foco em Saúde Ocupacional. O ${technicalRoleName} deve levar o braço de reação para a demo. Se o operador se sentir mais confortável, a aprovação técnica é garantida.`;
    }

    if (item.amount > 100000) {
      return `Ticket alto detectado. Verifique se o 'Quem' (${planOfAction.who}) inclui o Diretor de Operações. Sem o board, essa venda pode travar no financeiro.`;
    }

    return "Oportunidade padrão. Mantenha o follow-up semanal e garanta que o próximo passo esteja claro para o cliente.";
  };

  const generateApproachScript = () => {
    const { planOfAction, customer } = item;
    const contact = planOfAction?.who.split('(')[0].trim() || 'Cliente';
    
    const script = `Olá ${contact}, tudo bem? 
    
Estava revisando nosso plano para a ${planOfAction?.what || 'próxima etapa'} na ${customer}. 

Como conversamos sobre a ${planOfAction?.why || 'melhoria do processo'}, acredito que seria muito produtivo envolvermos nosso ${technicalRoleName} para uma análise mais profunda. 

Você teria 15 minutos na próxima terça ou quarta para alinharmos os detalhes técnicos?`;

    return script;
  };

  const handleCopyScript = () => {
    const script = generateApproachScript();
    navigator.clipboard.writeText(script);
    alert('Script de abordagem copiado para a área de transferência!');
  };

  return (
    <div className="bg-zinc-950/50 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] group-hover:bg-purple-500/20 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-700" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
              Insights do Gestor (AI)
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Análise Estratégica B2B</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recomendação</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "{generateInsight()}"
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleCopyScript}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20 border border-purple-400/20"
            >
              <MessageSquare className="w-4 h-4" />
              DICA DE ABORDAGEM (WhatsApp/Email)
            </button>
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 uppercase font-bold">Probabilidade</span>
                  <span className="text-xs font-mono text-[#00E676]">{item.confidence}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 uppercase font-bold">Valor</span>
                  <span className="text-xs font-mono text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', compactDisplay: 'short' }).format(item.amount)}
                  </span>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
