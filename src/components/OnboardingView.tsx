import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { 
  Building2, 
  UserPlus, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingViewProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
  onLogout: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ userId, userEmail, onComplete, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for creating company
  const [managerName, setManagerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.MANAGER);
  const [step, setStep] = useState<'choice' | 'create'>('choice');

  useEffect(() => {
    const checkAndAutoAccept = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('convites')
          .select('*, organizacoes(name)')
          .eq('email', userEmail)
          .single();

        if (data) {
          setInvitation(data);
          // Auto-accept if invitation found
          setIsProcessing(true);
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: userEmail.split('@')[0],
              email: userEmail,
              role: data.role,
              org_id: data.org_id
            });

          if (!profileError) {
            await supabase.from('convites').delete().eq('id', data.id);
            onComplete();
            return;
          } else {
            setError('Erro ao vincular sua conta à empresa convidada.');
          }
        }
      } catch (err) {
        console.log('No invitation found or error:', err);
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
      }
    };

    checkAndAutoAccept();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizacoes')
        .insert({
          name: companyName,
          manager_id: userId
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Update or Create profile
      // The user wants an update if possible, but if it's the first time, we might need upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: managerName,
          email: userEmail,
          role: selectedRole,
          org_id: orgData.id
        });

      if (profileError) throw profileError;

      // 3. Success Feedback
      alert(`Empresa ${companyName} configurada com sucesso!`);
      
      onComplete();
    } catch (err: any) {
      console.error('Error creating company:', err);
      setError(err.message || 'Erro ao criar empresa.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold">Verificando convites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[#000000] tracking-tighter mb-2">Configuração Final</h1>
          <p className="text-[#000000] font-medium opacity-70">Prepare seu ambiente de trabalho no FORGE</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invitation Card */}
          <div className={`p-8 rounded-[2rem] border-2 transition-all ${invitation ? 'border-blue-600 bg-blue-50/50' : 'border-zinc-100 bg-white opacity-60'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${invitation ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#000000]">Convite Pendente</h3>
            </div>

            {invitation ? (
              <div className="space-y-6">
                <div className="p-4 bg-white border border-blue-100 rounded-2xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-sm font-bold text-[#000000]">Vinculando à empresa {invitation.organizacoes?.name}...</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
                <p className="text-sm text-[#000000] font-bold mb-1 tracking-tight opacity-70">Aguardando convite do seu gestor</p>
                <p className="text-[10px] text-[#000000] opacity-50">O sistema verifica convites automaticamente para {userEmail}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                >
                  Verificar agora
                </button>
              </div>
            )}
          </div>

          {/* Create Company Card */}
          <div className={`p-8 rounded-[2rem] border-2 transition-all ${!invitation || step === 'create' ? 'border-black bg-white' : 'border-zinc-100 bg-white opacity-60'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!invitation || step === 'create' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#000000]">Criar Empresa</h3>
            </div>

            {step === 'choice' ? (
              <div className="space-y-6">
                <p className="text-sm text-[#000000] leading-relaxed opacity-80">
                  Se você é um gestor ou deseja criar sua própria estrutura de vendas, comece por aqui.
                </p>
                <button 
                  onClick={() => setStep('create')}
                  className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Configurar Empresa</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#000000] uppercase tracking-widest ml-1">Nome do Gestor</label>
                  <input 
                    required
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3 text-sm text-[#000000] focus:border-blue-600 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#000000] uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <input 
                    required
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3 text-sm text-[#000000] focus:border-blue-600 outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setStep('choice')}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#000000] font-bold py-3 rounded-xl text-xs transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <span>Criar Empresa</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-600 transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </motion.div>
    </div>
  );
};
