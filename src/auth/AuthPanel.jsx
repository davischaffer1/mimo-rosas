import React, { useState } from 'react';
import {
  Mail, Lock, User, Phone, ArrowRight, ArrowLeft, CheckCircle2,
  AlertCircle, Loader2, ShieldCheck, KeyRound
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Tela de autenticação (criar conta, entrar, esqueci a senha, nova senha)
// Usada tanto para clientes quanto para o painel administrativo.
// ---------------------------------------------------------------------------
export default function AuthPanel({ variant = 'customer', auth, onBack, onSuccess, embedded = false }) {
  const isAdminPanel = variant === 'admin';

  const [screen, setScreen] = useState('signin'); // signin | signup | forgot | sent | recovery
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [alreadyExistsError, setAlreadyExistsError] = useState(false);
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  React.useEffect(() => {
    if (auth.recoveryMode) setScreen('recovery');
  }, [auth.recoveryMode]);

  const reset = (nextScreen) => {
    setError('');
    setAlreadyExistsError(false);
    setInfo('');
    setPassword('');
    setPassword2('');
    setScreen(nextScreen);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setAlreadyExistsError(false);
    setSubmitting(true);
    const res = await auth.signIn({ email, password });
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    if (onSuccess) onSuccess('signin');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setAlreadyExistsError(false);
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (password !== password2) { setError('As senhas não conferem.'); return; }
    if (!fullName.trim()) { setError('Informe seu nome.'); return; }
    setSubmitting(true);
    const res = await auth.signUp({ email, password, fullName, phone });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      setAlreadyExistsError(Boolean(res.alreadyExists));
      return;
    }

    if (res.needsConfirmation) {
      setPendingEmail(email.trim().toLowerCase());
      setScreen('sent');
      return;
    }
    if (onSuccess) onSuccess('signup');
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await auth.sendPasswordReset(email);
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setPendingEmail(email.trim().toLowerCase());
    setScreen('sent');
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (password !== password2) { setError('As senhas não conferem.'); return; }
    setSubmitting(true);
    const res = await auth.updatePassword(password);
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setInfo('Senha atualizada! Você já está conectada.');
    setScreen('signin');
  };

  const handleResend = async () => {
    setError('');
    setSubmitting(true);
    const res = await auth.resendConfirmation(pendingEmail || email);
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    setInfo('Enviamos outro e-mail de confirmação. Confira também a caixa de spam.');
  };

  const inputClass = 'w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm text-[#4A2532] placeholder-[#9A7468] focus:outline-none focus:border-[#A90F4D] focus:bg-white transition-colors';
  const labelClass = 'block text-xs font-semibold text-[#5A382E] mb-1.5';
  const primaryButton = 'w-full py-3.5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white font-semibold text-sm shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2';

  const heading = isAdminPanel ? 'Painel Administrativo' : 'Sua conta Mimo Rosas';
  const subheading = isAdminPanel
    ? 'Acesso restrito à administração da loja.'
    : 'Entre para acompanhar pedidos, salvar favoritos e finalizar compras mais rápido.';

  const body = (
    <div className="bg-[#FFF9F3] rounded-[28px] p-6 sm:p-7 border border-[#EAD6D0] shadow-xl text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${isAdminPanel ? 'bg-[#3A1C28] text-[#FAD4E0]' : 'bg-[#FCEEF2] text-[#A90F4D]'}`}>
        {isAdminPanel ? <ShieldCheck className="w-7 h-7" /> : <User className="w-7 h-7" />}
      </div>

      <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#4A2532] mt-3">{heading}</h2>
      <p className="text-xs text-[#795344] mt-1 max-w-[340px] mx-auto">{subheading}</p>

      {error && (
        <div className="mt-4 flex flex-col gap-2 text-left bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
          {alreadyExistsError && (
            <div className="flex flex-wrap items-center gap-3 pl-6 pt-0.5">
              <button type="button" onClick={() => reset('signin')} className="font-semibold text-[#A90F4D] hover:underline">
                Ir para o Login →
              </button>
              <button type="button" onClick={() => reset('forgot')} className="text-[#795344] hover:text-[#A90F4D] hover:underline">
                Esqueci minha senha
              </button>
            </div>
          )}
        </div>
      )}
      {info && (
        <div className="mt-4 flex items-start gap-2 text-left bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{info}</span>
        </div>
      )}

      {screen === 'signin' && (
        <form onSubmit={handleSignIn} className="mt-5 space-y-3 text-left">
          <div>
            <label className={labelClass}>E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className={primaryButton}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => reset('forgot')} className="text-[11px] text-[#795344] hover:text-[#A90F4D] hover:underline">Esqueci minha senha</button>
            <button type="button" onClick={() => reset('signup')} className="text-[11px] font-semibold text-[#A90F4D] hover:underline">Criar conta</button>
          </div>
          {isAdminPanel && (
            <p className="text-[10.5px] text-[#9A7468] leading-snug text-center">
              Primeiro acesso? Crie sua conta e depois marque o perfil como administrador no Supabase (instruções no arquivo <code>supabase/migrations/001_customer_auth.sql</code>).
            </p>
          )}
        </form>
      )}

      {screen === 'signup' && (
        <form onSubmit={handleSignUp} className="mt-5 space-y-3 text-left">
          <div>
            <label className={labelClass}>Nome completo *</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(54) 99999-9999" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Senha *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirmar senha *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repita a senha" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className={primaryButton}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {submitting ? 'Criando conta...' : 'Criar minha conta'}
          </button>
          <p className="text-[11px] text-[#9A7468] leading-snug text-center pt-1">
            Vamos enviar um e-mail de confirmação. A conta só é ativada depois que você clicar no link.
          </p>
          <button type="button" onClick={() => reset('signin')} className="w-full text-[11px] text-[#795344] hover:text-[#A90F4D] hover:underline">Já tenho conta</button>
        </form>
      )}

      {screen === 'forgot' && (
        <form onSubmit={handleForgot} className="mt-5 space-y-3 text-left">
          <p className="text-xs text-[#795344]">Informe seu e-mail e enviamos um link para você criar uma nova senha.</p>
          <div>
            <label className={labelClass}>E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className={primaryButton}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
          <button type="button" onClick={() => reset('signin')} className="w-full text-[11px] text-[#795344] hover:text-[#A90F4D] hover:underline inline-flex items-center justify-center gap-1"><ArrowLeft className="w-3 h-3" />Voltar para o login</button>
        </form>
      )}

      {screen === 'sent' && (
        <div className="mt-5 space-y-3 text-left">
          <div className="bg-[#F6E9E5] border border-[#E5CFC9] rounded-2xl p-4 text-xs text-[#5A382E] space-y-1.5">
            <p className="font-semibold text-[#4A2532] flex items-center gap-1.5"><Mail className="w-4 h-4 text-[#A90F4D]" />Confira seu e-mail</p>
            <p>Enviamos um link para <strong className="text-[#A90F4D]">{pendingEmail || email}</strong>. Clique nele para ativar sua conta.</p>
            <p className="text-[#795344]">Não chegou em 5 minutos? Veja em spam ou reenvie abaixo.</p>
          </div>
          <button type="button" onClick={handleResend} disabled={submitting} className={primaryButton}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshIcon />}
            {submitting ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
          </button>
          <button type="button" onClick={() => reset('signin')} className="w-full text-[11px] text-[#795344] hover:text-[#A90F4D] hover:underline">Já confirmei, quero entrar</button>
        </div>
      )}

      {screen === 'recovery' && (
        <form onSubmit={handleRecovery} className="mt-5 space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A90F4D]"><KeyRound className="w-4 h-4" />Criar nova senha</div>
          <div>
            <label className={labelClass}>Nova senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirmar nova senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repita a senha" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={submitting} className={primaryButton}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      )}

      {onBack && (
        <button type="button" onClick={onBack} className="mt-4 w-full py-2 rounded-full text-xs text-[#795344] hover:underline inline-flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />{isAdminPanel ? 'Voltar para a loja' : 'Continuar como visitante'}
        </button>
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <div className="w-full min-h-screen bg-[#F6E9E5] flex items-center justify-center p-4 py-10 font-sans-clean">
      <div className="w-full max-w-md">{body}</div>
    </div>
  );
}

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-3-6.7" strokeLinecap="round" />
    <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
