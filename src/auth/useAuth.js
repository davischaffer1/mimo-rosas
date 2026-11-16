import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';

// ---------------------------------------------------------------------------
// Tradução dos erros mais comuns do Supabase Auth
// ---------------------------------------------------------------------------
const traduzirErro = (message = '') => {
  const m = String(message);
  if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(m)) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  if (/user already registered|already been registered/i.test(m)) return 'Este e-mail já possui conta. Faça login.';
  if (/password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/unable to validate email|invalid email/i.test(m)) return 'Digite um e-mail válido.';
  if (/email rate limit|over_email_send_rate_limit/i.test(m)) return 'Muitos e-mails enviados em pouco tempo. Aguarde alguns minutos.';
  if (/for security purposes/i.test(m)) return 'Aguarde alguns segundos antes de tentar novamente.';
  if (/signups? not allowed|signup is disabled/i.test(m)) return 'Cadastro temporariamente desativado. Fale com a loja.';
  if (/auth session missing/i.test(m)) return 'Sessão expirada. Entre novamente.';
  if (/table .* does not exist|schema cache/i.test(m)) return 'Banco de dados ainda não configurado. Rode o script SQL no Supabase.';
  return m || 'Algo deu errado. Tente novamente.';
};

// URL base do site (funciona também publicado em subpasta)
const siteUrl = () => {
  try {
    const segments = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (['admin', 'painel'].includes((segments[segments.length - 1] || '').toLowerCase())) segments.pop();
    return window.location.origin + (segments.length ? `/${segments.join('/')}` : '/');
  } catch {
    return window.location.origin;
  }
};

export function useAuth({ url, key }) {
  const client = useMemo(() => getSupabaseClient(url, key), [url, key]);

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profilesReady, setProfilesReady] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const mounted = useRef(true);

  // StrictMode monta/desmonta duas vezes em dev: precisa remarcar como montado
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const user = session?.user || null;
  const accessToken = session?.access_token || null;

  // Detecta link de recuperação de senha (#...&type=recovery)
  useEffect(() => {
    try {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash.includes('type=recovery') || hash.includes('type=signup') || hash.includes('error=')) {
        const params = new URLSearchParams(hash);
        if (params.get('type') === 'recovery') setRecoveryMode(true);
      }
    } catch { /* ignora */ }
  }, []);

  const loadProfile = useCallback(async (authUser) => {
    if (!client || !authUser) { setProfile(null); return; }
    setProfileLoading(true);
    try {
      const { data, error } = await client
        .from('profiles')
        .select('id, full_name, phone, is_admin')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        // Tabela ainda não criada: sinaliza para o painel cair no modo legado
        if (/does not exist|schema cache/i.test(error.message || '')) setProfilesReady(false);
        if (mounted.current) setProfile(null);
        return;
      }

      if (!data) {
        // Perfil pode não existir se o trigger não rodou: cria sob demanda
        const meta = authUser.user_metadata || {};
        const { data: created } = await client
          .from('profiles')
          .insert({ id: authUser.id, full_name: meta.full_name || '', phone: meta.phone || '' })
          .select('id, full_name, phone, is_admin')
          .maybeSingle();
        if (mounted.current) setProfile(created || null);
        return;
      }

      setProfilesReady(true);
      if (mounted.current) setProfile(data);
    } finally {
      if (mounted.current) setProfileLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client) { setLoading(false); return undefined; }
    let active = true;

    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session || null);
      setLoading(false);
      if (data?.session?.user) loadProfile(data.session.user);
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession || null);
      setLoading(false);
      if (newSession?.user) loadProfile(newSession.user);
      else setProfile(null);
    });

    return () => { active = false; sub?.subscription?.unsubscribe?.(); };
  }, [client, loadProfile]);

  // -------------------------------------------------------------------------
  // Ações
  // -------------------------------------------------------------------------
  const signUp = useCallback(async ({ email, password, fullName, phone }) => {
    if (!client) return { ok: false, error: 'Supabase não configurado.' };
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: (fullName || '').trim(), phone: (phone || '').trim() },
        emailRedirectTo: siteUrl()
      }
    });
    if (error) return { ok: false, error: traduzirErro(error.message) };
    // Sem sessão => confirmação de e-mail pendente
    return { ok: true, needsConfirmation: !data?.session, user: data?.user || null };
  }, [client]);

  const signIn = useCallback(async ({ email, password }) => {
    if (!client) return { ok: false, error: 'Supabase não configurado.' };
    const { error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (error) return { ok: false, error: traduzirErro(error.message) };
    return { ok: true };
  }, [client]);

  const signOut = useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
    setRecoveryMode(false);
  }, [client]);

  const resendConfirmation = useCallback(async (email) => {
    if (!client) return { ok: false, error: 'Supabase não configurado.' };
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: siteUrl() }
    });
    if (error) return { ok: false, error: traduzirErro(error.message) };
    return { ok: true };
  }, [client]);

  const sendPasswordReset = useCallback(async (email) => {
    if (!client) return { ok: false, error: 'Supabase não configurado.' };
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: siteUrl()
    });
    if (error) return { ok: false, error: traduzirErro(error.message) };
    return { ok: true };
  }, [client]);

  const updatePassword = useCallback(async (password) => {
    if (!client) return { ok: false, error: 'Supabase não configurado.' };
    const { error } = await client.auth.updateUser({ password });
    if (error) return { ok: false, error: traduzirErro(error.message) };
    setRecoveryMode(false);
    return { ok: true };
  }, [client]);

  const updateProfile = useCallback(async ({ fullName, phone }) => {
    if (!client || !user) return { ok: false, error: 'Entre na sua conta.' };
    const { data, error } = await client
      .from('profiles')
      .update({ full_name: (fullName || '').trim(), phone: (phone || '').trim() })
      .eq('id', user.id)
      .select('id, full_name, phone, is_admin')
      .maybeSingle();
    if (error) return { ok: false, error: traduzirErro(error.message) };
    setProfile(data || null);
    return { ok: true };
  }, [client, user]);

  // Verifica se a tabela `profiles` já foi criada (usado como fallback do painel)
  const probeProfiles = useCallback(async () => {
    if (!client) return true;
    try {
      const { error } = await client.from('profiles').select('id').limit(1);
      if (error && /does not exist|schema cache|relation/i.test(error.message || '')) {
        if (mounted.current) setProfilesReady(false);
        return false;
      }
      if (mounted.current) setProfilesReady(true);
      return true;
    } catch {
      return true;
    }
  }, [client]);

  const isAdmin = profile?.is_admin === true;

  return {
    client,
    session,
    user,
    profile,
    accessToken,
    loading,
    profileLoading,
    profilesReady,
    recoveryMode,
    isAdmin,
    probeProfiles,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    sendPasswordReset,
    updatePassword,
    updateProfile
  };
}
