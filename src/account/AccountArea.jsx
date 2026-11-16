import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList, Heart, User, Package, Truck, Store, CheckCircle2,
  Clock, AlertCircle, LogOut, Loader2, Lock, Phone, Mail, Save, ExternalLink, Trash2, QrCode
} from 'lucide-react';

const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);

// Prazo máximo para concluir o pagamento de um pedido pendente (30 minutos)
const ORDER_EXPIRATION_MINUTES = 30;
const ORDER_EXPIRATION_MS = ORDER_EXPIRATION_MINUTES * 60 * 1000;

const isPendingOrder = (order) => /aguardando/i.test(String(order?.status || ''));

const getOrderAgeMs = (order) => {
  if (!order?.created_at) return 0;
  const ts = new Date(order.created_at).getTime();
  return Number.isNaN(ts) ? 0 : Math.max(0, Date.now() - ts);
};

const isOrderExpired = (order) => isPendingOrder(order) && getOrderAgeMs(order) > ORDER_EXPIRATION_MS;

const getRemainingMinutes = (order) => {
  if (!isPendingOrder(order) || !order?.created_at) return null;
  const remainingMs = ORDER_EXPIRATION_MS - getOrderAgeMs(order);
  if (remainingMs <= 0) return 0;
  return Math.max(1, Math.ceil(remainingMs / 60000));
};

const STATUS_STYLES = {
  'Pago': 'bg-emerald-100 text-emerald-800',
  'Enviado': 'bg-sky-100 text-sky-800',
  'Entregue': 'bg-emerald-100 text-emerald-800',
  'Aguardando PIX': 'bg-amber-100 text-amber-800',
  'Aguardando Pagamento': 'bg-amber-100 text-amber-800',
  'Cancelado': 'bg-red-100 text-red-700'
};

const statusClass = (status) => STATUS_STYLES[status] || 'bg-[#F6E9E5] text-[#795344]';

function StatusBadge({ status, remainingMin }) {
  const isPending = /aguardando/i.test(status || '');
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusClass(status)}`}>
      {isPending ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
      {status || 'Em processamento'}
      {isPending && remainingMin ? ` • expira em ${remainingMin} min` : ''}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Área do cliente logado: pedidos, favoritos e dados
// ---------------------------------------------------------------------------
export default function AccountArea({ auth, products = [], favoriteIds = [], renderProductCard, onToast, onResumeOrder }) {
  const { user, profile, client, updateProfile, updatePassword, signOut } = auth;
  const [tab, setTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
  }, [profile]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!client || !user) { setOrdersLoading(false); return; }
      setOrdersLoading(true);
      setOrdersError('');

      // Dispara limpeza no banco de pedidos não pagos com mais de 30 minutos
      try {
        fetch('/api/asaas/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cleanup' })
        }).catch(() => {});
        client.rpc('cleanup_expired_orders').then(() => {}).catch(() => {});
      } catch { /* ignora */ }

      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!active) return;
      if (error) {
        setOrdersError(/does not exist|schema cache/i.test(error.message || '')
          ? 'Banco de dados ainda não configurado (rode o script SQL no Supabase).'
          : error.message);
        setOrders([]);
      } else {
        const mine = (data || []).filter((o) => (
          o.user_id === user.id
          || (o.email && user.email && String(o.email).toLowerCase() === String(user.email).toLowerCase())
        ));
        // Separa pedidos expirados (> 30 min sem pagamento) e solicita exclusão no servidor
        const expired = mine.filter((o) => isOrderExpired(o));
        if (expired.length > 0) {
          expired.forEach((exp) => {
            fetch('/api/asaas/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'cancel', orderId: exp.id })
            }).catch(() => {});
            client.from('orders').delete().eq('id', exp.id).then(() => {}).catch(() => {});
          });
        }
        const validOrders = mine.filter((o) => !isOrderExpired(o));
        setOrders(validOrders);
      }
      setOrdersLoading(false);
    };
    load();

    // Atualiza a cada 30s para remover automaticamente pedidos que vencerem os 30 min com a tela aberta
    const timer = setInterval(() => {
      setOrders((prev) => prev.filter((o) => !isOrderExpired(o)));
    }, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [client, user, tab === 'orders']); // eslint-disable-line

  const handleCancelOrder = async (orderId) => {
    if (!orderId || cancelingId) return;
    setCancelingId(orderId);
    try {
      await fetch('/api/asaas/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', orderId })
      }).catch(() => {});
      if (client) {
        await client.rpc('cancel_my_pending_order', { p_order_id: orderId }).catch(() => {});
        await client.from('orders').delete().eq('id', orderId).catch(() => {});
      }
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      onToast?.(`Pedido #${orderId} cancelado e removido.`);
    } finally {
      setCancelingId(null);
    }
  };

  const favorites = useMemo(() => products.filter((p) => favoriteIds.includes(p.id)), [products, favoriteIds]);
  // Soma no "Total gasto" apenas pedidos efetivamente pagos/concluídos
  const totalSpent = useMemo(
    () => orders
      .filter((o) => ['Pago', 'Enviado', 'Entregue'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0),
    [orders]
  );
  const displayName = profile?.full_name || user?.user_metadata?.full_name || String(user?.email || '').split('@')[0];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile({ fullName, phone });
    setSavingProfile(false);
    onToast?.(res.ok ? 'Dados atualizados!' : res.error);
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { onToast?.('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (newPassword !== newPassword2) { onToast?.('As senhas não conferem.'); return; }
    setSavingPassword(true);
    const res = await updatePassword(newPassword);
    setSavingPassword(false);
    if (res.ok) { setNewPassword(''); setNewPassword2(''); }
    onToast?.(res.ok ? 'Senha alterada com sucesso!' : res.error);
  };

  const tabs = [
    { id: 'orders', label: 'Meus Pedidos', icon: ClipboardList, count: orders.length },
    { id: 'favorites', label: 'Favoritos', icon: Heart, count: favorites.length },
    { id: 'profile', label: 'Meus Dados', icon: User, count: null }
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 lg:px-8 py-4 lg:py-10 space-y-4 lg:space-y-6">
      {/* Cabeçalho da conta */}
      <div className="bg-[#FFF9F3] rounded-3xl p-5 lg:p-7 border border-[#EBD5CF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-[#FCEEF2] border border-[#E2B8C4] flex items-center justify-center text-[#A90F4D] font-serif-display text-xl font-bold">
            {String(displayName || 'M').trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif-display text-xl lg:text-2xl font-bold text-[#4A2532] truncate">Olá, {displayName}!</h1>
            <p className="text-xs lg:text-sm text-[#795344] truncate">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={signOut} className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F6E9E5] border border-[#E5CFC9] text-[#795344] text-xs font-semibold hover:bg-[#3A1C28] hover:text-white transition-colors">
          <LogOut className="w-3.5 h-3.5" />Sair
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#FFF9F3] rounded-2xl p-4 border border-[#EAD6D0]">
          <span className="text-[11px] text-[#795344] font-medium">Pedidos</span>
          <p className="text-2xl font-bold text-[#A90F4D] mt-1">{orders.length}</p>
        </div>
        <div className="bg-[#FFF9F3] rounded-2xl p-4 border border-[#EAD6D0]">
          <span className="text-[11px] text-[#795344] font-medium">Total gasto</span>
          <p className="text-2xl font-bold text-[#4A2532] mt-1">{brl(totalSpent)}</p>
        </div>
        <div className="bg-[#FFF9F3] rounded-2xl p-4 border border-[#EAD6D0]">
          <span className="text-[11px] text-[#795344] font-medium">Favoritos</span>
          <p className="text-2xl font-bold text-[#A90F4D] mt-1">{favorites.length}</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${tab === t.id ? 'bg-[#A90F4D] text-white shadow-sm' : 'bg-[#FFF9F3] text-[#5A382E] border border-[#E5CFC9] hover:border-[#A90F4D]'}`}>
              <Icon className="w-4 h-4" />{t.label}{t.count !== null ? ` (${t.count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Pedidos */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {ordersLoading && (
            <div className="bg-[#FFF9F3] rounded-3xl p-8 text-center border border-[#EBD5CF] text-xs text-[#795344] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />Carregando seus pedidos...
            </div>
          )}

          {!ordersLoading && ordersError && (
            <div className="bg-[#FFF9F3] rounded-3xl p-6 border border-[#EBD5CF] text-xs text-[#795344] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><span>{ordersError}</span>
            </div>
          )}

          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="bg-[#FFF9F3] rounded-3xl p-8 text-center border border-[#EBD5CF] space-y-2">
              <Package className="w-10 h-10 text-[#A90F4D] mx-auto opacity-60" />
              <p className="text-sm text-[#4A2532] font-semibold">Nenhum pedido por aqui ainda</p>
              <p className="text-xs text-[#795344] max-w-sm mx-auto">Quando você comprar na Mimo Rosas, seus pedidos aparecem aqui com o status atualizado.</p>
            </div>
          )}

          {!ordersLoading && orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const pending = isPendingOrder(order);
            const remainingMin = getRemainingMinutes(order);
            return (
              <div key={order.id} className="bg-[#FFF9F3] rounded-3xl border border-[#EBD5CF] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif-display text-base font-bold text-[#4A2532]">#{order.id}</span>
                      <StatusBadge status={order.status} remainingMin={remainingMin} />
                    </div>
                    <p className="text-[11px] text-[#9A7468] mt-1">
                      {order.date || (order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : '')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#795344]">Total</p>
                    <p className="font-bold text-[#A90F4D]">{brl(order.total)}</p>
                  </div>
                </div>

                {items.length > 0 && (
                  <ul className="space-y-1 border-t border-[#F0DCD6] pt-2.5">
                    {items.map((item, idx) => (
                      <li key={`${order.id}-${idx}`} className="flex items-start justify-between gap-3 text-xs text-[#5A382E]">
                        <span className="truncate">{item.qty || item.quantity || 1}× {item.name}</span>
                        <span className="shrink-0 text-[#795344]">{brl((Number(item.price) || 0) * (Number(item.qty || item.quantity) || 1))}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#795344]">
                    {order.delivery_method === 'pickup' ? <><Store className="w-3.5 h-3.5" />Retirada no ateliê</> : <><Truck className="w-3.5 h-3.5" />Entrega</>}
                  </span>
                  {order.address && <span className="text-[11px] text-[#9A7468] truncate max-w-[280px]">{order.address}</span>}
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    {pending && onResumeOrder && (
                      <button
                        type="button"
                        onClick={() => onResumeOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-[11px] font-semibold transition-colors"
                      >
                        <QrCode className="w-3 h-3" />Pagar agora
                      </button>
                    )}
                    {pending && (
                      <button
                        type="button"
                        disabled={cancelingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        {cancelingId === order.id ? 'Cancelando...' : 'Cancelar pedido'}
                      </button>
                    )}
                    <a
                      href={`https://wa.me/5554999999999?text=${encodeURIComponent(`Olá! Gostaria de saber sobre o meu pedido ${order.id} na Mimo Rosas.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-semibold"
                    >
                      Falar sobre o pedido<ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Favoritos */}
      {tab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="bg-[#FFF9F3] rounded-3xl p-8 text-center border border-[#EBD5CF] space-y-2">
              <Heart className="w-10 h-10 text-[#A90F4D] mx-auto opacity-60" />
              <p className="text-sm text-[#4A2532] font-semibold">Sua lista de desejos está vazia</p>
              <p className="text-xs text-[#795344]">Toque no coração de qualquer produto para salvar aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-6">
              {favorites.map((product) => renderProductCard(product))}
            </div>
          )}
        </div>
      )}

      {/* Dados */}
      {tab === 'profile' && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <form onSubmit={handleSaveProfile} className="bg-[#FFF9F3] rounded-3xl border border-[#EBD5CF] p-5 space-y-3">
            <h2 className="font-serif-display text-lg font-bold text-[#4A2532]">Meus dados</h2>
            <div>
              <label className="block text-xs font-semibold text-[#5A382E] mb-1.5">Nome completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm focus:outline-none focus:border-[#A90F4D]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A382E] mb-1.5">WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(54) 99999-9999" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm focus:outline-none focus:border-[#A90F4D]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A382E] mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A7468] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="email" value={user?.email || ''} readOnly className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F0E4E0] border border-[#E5CFC9] text-sm text-[#795344]" />
              </div>
              <p className="text-[10.5px] text-[#9A7468] mt-1">O e-mail é o seu login e não pode ser alterado por aqui.</p>
            </div>
            <button type="submit" disabled={savingProfile} className="w-full py-3 rounded-full bg-[#A90F4D] hover:bg-[#8E0B3F] text-white text-sm font-semibold shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingProfile ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>

          <form onSubmit={handleSavePassword} className="bg-[#FFF9F3] rounded-3xl border border-[#EBD5CF] p-5 space-y-3">
            <h2 className="font-serif-display text-lg font-bold text-[#4A2532]">Alterar senha</h2>
            <div>
              <label className="block text-xs font-semibold text-[#5A382E] mb-1.5">Nova senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm focus:outline-none focus:border-[#A90F4D]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A382E] mb-1.5">Confirmar nova senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A90F4D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="password" autoComplete="new-password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} placeholder="Repita a senha" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F6E9E5] border border-[#E5CFC9] text-sm focus:outline-none focus:border-[#A90F4D]" />
              </div>
            </div>
            <button type="submit" disabled={savingPassword} className="w-full py-3 rounded-full bg-[#3A1C28] hover:bg-[#4A2532] text-white text-sm font-semibold shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {savingPassword ? 'Salvando...' : 'Atualizar senha'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
