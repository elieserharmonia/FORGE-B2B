import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Shield, 
  Mail, 
  Lock, 
  Building2, 
  User, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  X as CloseIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

interface LoginViewProps {
  onLogin: (orgId: string, profile: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSolo, setIsSolo] = useState(false);

  const passwordRequirements = [
    { label: 'Pelo menos 1 letra maiúscula', regex: /[A-Z]/ },
    { label: 'Pelo menos 1 letra minúscula', regex: /[a-z]/ },
    { label: 'Pelo menos 1 número', regex: /[0-9]/ },
    { label: 'Pelo menos 1 caractere especial', regex: /[^A-Za-z0-9]/ },
    { label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
  ];

  const checkRequirement = (regex: RegExp) => regex.test(password);
  const isPasswordValid = passwordRequirements.every(req => checkRequirement(req.regex));

  // 4. Limpeza de Logs: Ignorar WebSocket errors
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('WebSocket connection') || args[0]?.message?.includes?.('WebSocket connection')) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          throw new Error('E-mail ou senha inválidos.');
        }
        if (authError.message === 'Email not confirmed') {
          throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
        }
        throw authError;
      }

      if (data.user) {
        // Fetch profile to get org_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        // If profile doesn't exist or org_id is missing, we send to onboarding
        if (profileError || !profile || !profile.org_id) {
          console.log('Profile or org_id missing, redirecting to onboarding');
          onLogin('', profile || null);
          return;
        }

        onLogin(profile.org_id, profile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Erro de conexão: Não foi possível alcançar o servidor Supabase.');
      } else {
        setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos de segurança.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) {
        if (authError.status === 409) {
          throw new Error('Este e-mail já está cadastrado');
        }
        throw authError;
      }

      if (!authData.user) throw new Error('Erro ao criar usuário.');

      // 2. If Solo, create a private organization automatically
      if (isSolo) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizacoes')
          .insert({
            name: `Empresa de ${cleanEmail.split('@')[0]} (Solo)`,
            manager_id: authData.user.id
          })
          .select()
          .single();

        if (orgError) throw orgError;

        // 3. Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            role: UserRole.SELLER,
            org_id: orgData.id
          });

        if (profileError) throw profileError;
      }

      // Sucesso
      setError('Conta criada com sucesso! Entre para continuar.');
      setIsRegistering(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans selection:bg-blue-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[#000000] tracking-tighter mb-2">FORGE CRM</h1>
          <p className="text-[#000000] font-medium opacity-70">Centro de Comando Industrial</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border-2 border-zinc-100 rounded-[2rem] p-8 shadow-2xl shadow-zinc-200/50">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-xs font-medium flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Configuração Necessária</p>
                <p className="opacity-80">As chaves do Supabase não foram detectadas. Configure <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> no painel do AI Studio para habilitar o acesso real.</p>
              </div>
            </div>
          )}
          <h2 className="text-xl font-bold text-[#000000] mb-8">
            {isRegistering ? 'Cadastre-se no FORGE' : 'Bem-vindo de volta'}
          </h2>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#000000] uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000000] group-focus-within:text-blue-600 transition-colors" />
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white border-2 border-black rounded-2xl pl-12 pr-4 py-4 text-[#000000] placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#000000] uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000000] group-focus-within:text-blue-600 transition-colors" />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-black rounded-2xl pl-12 pr-12 py-4 text-[#000000] placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-black rounded-2xl pl-12 pr-4 py-4 text-black placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-100 space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Requisitos de Senha:</p>
                  {passwordRequirements.map((req, idx) => {
                    const met = checkRequirement(req.regex);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {met ? <Check className="w-3 h-3 text-green-600" /> : <CloseIcon className="w-3 h-3 text-zinc-300" />}
                        <span className={`text-[11px] font-medium ${met ? 'text-green-600' : 'text-zinc-400'}`}>{req.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-2">
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Tipo de Conta</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsSolo(true)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSolo ? 'border-blue-600 bg-blue-50' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                    >
                      <div className="text-left">
                        <p className={`text-sm font-bold ${isSolo ? 'text-blue-600' : 'text-black'}`}>Vendedor Autônomo (Solo)</p>
                        <p className="text-[10px] text-zinc-500">Cria uma organização privada de teste</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSolo ? 'border-blue-600 bg-blue-600' : 'border-zinc-200'}`}>
                        {isSolo && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsSolo(false)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${!isSolo ? 'border-blue-600 bg-blue-50' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                    >
                      <div className="text-left">
                        <p className={`text-sm font-bold ${!isSolo ? 'text-blue-600' : 'text-black'}`}>Gestor / Criar Equipe</p>
                        <p className="text-[10px] text-zinc-500">Crie sua empresa e convide vendedores</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isSolo ? 'border-blue-600 bg-blue-600' : 'border-zinc-200'}`}>
                        {!isSolo && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-80' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{isRegistering ? 'Criar Conta de Empresa' : 'Entrar no Centro de Comando'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isRegistering ? 'Já tenho uma conta' : 'Criar nova conta de empresa'}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-zinc-400 text-xs font-medium">
          &copy; 2026 FORGE Industrial. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
};
