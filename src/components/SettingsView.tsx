import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Settings, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2,
  ShieldAlert,
  Save,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, UserRole } from '../types';

interface SettingsViewProps {
  technicalRoleName: string;
  setTechnicalRoleName: (name: string) => void;
  users: UserProfile[];
  onInviteUser: (email: string, role: UserRole) => Promise<void>;
  onResetSystem: () => void;
  theme: 'dark' | 'light';
  userRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  technicalRoleName,
  setTechnicalRoleName,
  users,
  onInviteUser,
  onResetSystem,
  theme,
  userRole
}) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.SELLER);
  const [isInviting, setIsInviting] = useState(false);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [tempRoleName, setTempRoleName] = useState(technicalRoleName);
  const [saveStatus, setSaveStatus] = useState(false);

  const isManager = userRole === UserRole.MANAGER || userRole === UserRole.DIRECTOR;

  const handleSaveNomenclature = () => {
    setTechnicalRoleName(tempRoleName);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingInvite(true);
    setInviteError(null);
    try {
      await onInviteUser(newUserEmail, newUserRole);
      setNewUserEmail('');
      setIsInviting(false);
      alert('Convite enviado com sucesso!');
    } catch (err: any) {
      setInviteError(err.message || 'Erro ao enviar convite.');
    } finally {
      setIsProcessingInvite(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-[#00E676]/10 border-[#00E676]/20' : 'bg-blue-50 border-blue-100'} rounded-2xl flex items-center justify-center border`}>
          <Settings className={`w-6 h-6 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} tracking-tight`}>Configurações</h2>
          <p className={`text-zinc-500 text-sm ${theme === 'light' ? 'text-zinc-600' : ''}`}>Personalização, usuários e manutenção do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Nomenclatura do Suporte */}
        <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-6 backdrop-blur-sm`}>
          <div className="flex items-center gap-3 mb-6">
            <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Nomenclatura do Suporte</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-[10px] font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'} uppercase tracking-widest mb-2`}>
                Nome da Função Técnica
              </label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={tempRoleName}
                  onChange={(e) => setTempRoleName(e.target.value)}
                  placeholder="Ex: Engenheiro de Aplicação"
                  className={`flex-grow ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-black'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'} transition-all`}
                />
                <button 
                  onClick={handleSaveNomenclature}
                  className={`${theme === 'dark' ? 'bg-[#00E676] shadow-[#00E676]/20 text-black' : 'bg-blue-600 shadow-blue-500/20 text-white'} hover:opacity-90 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2`}
                >
                  <Save className="w-4 h-4" />
                  SALVAR
                </button>
              </div>
              {saveStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 flex items-center gap-2 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'} text-[10px] font-bold uppercase`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Configuração salva com sucesso!
                </motion.div>
              )}
              <p className="text-[10px] text-zinc-600 mt-2 italic">
                * Esta alteração define como o suporte técnico será chamado em todo o sistema.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 2. Gestão de Usuários (Minha Equipe) */}
      {isManager && (
        <section className={`${theme === 'dark' ? 'bg-zinc-900/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} border rounded-2xl p-6 backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-[#00E676]' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Minha Equipe</h3>
            </div>
            <button 
              onClick={() => setIsInviting(true)}
              className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-[#00E676] text-black' : 'bg-blue-600 text-white'} hover:opacity-90 px-4 py-2 rounded-xl text-xs font-bold transition-all`}
            >
              <UserPlus className="w-4 h-4" />
              Convidar Novo Usuário
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-200 bg-zinc-50'} pb-4`}>
                  <th className="px-4 py-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nome</th>
                  <th className="px-4 py-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Função</th>
                  <th className="px-4 py-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-zinc-100'}`}>
                {users.map((user) => (
                  <tr key={user.id} className={`hover:${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-zinc-50'} transition-colors`}>
                    <td className={`px-4 py-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{user.name}</td>
                    <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} font-mono`}>{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded ${
                        (user.role === UserRole.MANAGER || user.role === UserRole.DIRECTOR) ? (theme === 'dark' ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-blue-50 text-blue-600') :
                        user.role === UserRole.ENGINEER ? 'bg-amber-500/20 text-amber-500' :
                        (theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500')
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-[10px] ${theme === 'dark' ? 'text-[#00E676]' : 'text-green-600'} font-bold uppercase tracking-widest`}>Ativo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. Botão de Reset (Zona de Perigo) */}
      <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-red-600'} uppercase tracking-tighter`}>Zona de Perigo</h3>
              <p className="text-zinc-500 text-sm">Ações críticas e irreversíveis para manutenção do sistema.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Esta ação é irreversível. Deseja apagar todos os clientes e oportunidades?')) {
                onResetSystem();
              }
            }}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl text-sm font-black transition-all shadow-2xl shadow-red-500/40 border border-red-400/20"
          >
            <Trash2 className="w-5 h-5" />
            LIMPAR TODOS OS DADOS DO SISTEMA
          </button>
        </div>
      </section>

      {/* Modal Convidar Usuário */}
      {isInviting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'} border rounded-2xl p-8 w-full max-w-md shadow-2xl`}
          >
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} mb-6`}>Convidar Novo Usuário</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Email Corporativo</label>
                <input 
                  type="email" 
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-black'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Função</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className={`w-full ${theme === 'dark' ? 'bg-zinc-950 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200 text-black'} border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-${theme === 'dark' ? '[#00E676]/50' : 'blue-500/50'}`}
                >
                  <option value={UserRole.SELLER} className={theme === 'dark' ? "bg-zinc-900 text-white" : "bg-white text-black"}>Vendedor B2B</option>
                  <option value={UserRole.ENGINEER} className={theme === 'dark' ? "bg-zinc-900 text-white" : "bg-white text-black"}>Engenheiro de Aplicação</option>
                </select>
              </div>

              {inviteError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                  {inviteError}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  disabled={isProcessingInvite}
                  onClick={() => setIsInviting(false)}
                  className={`flex-1 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-black'} py-3 rounded-xl text-sm font-bold transition-all`}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isProcessingInvite}
                  className={`flex-1 ${theme === 'dark' ? 'bg-[#00E676] hover:bg-[#00E676]/90 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white'} py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2`}
                >
                  {isProcessingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Enviar Convite</span>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
