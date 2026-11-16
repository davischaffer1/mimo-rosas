// ============================================================================
// Mimo Rosas • Helpers do Asaas (usados pelas funções da pasta /api/asaas)
//
// Segredos ficam SÓ aqui no servidor (variáveis de ambiente da Vercel):
//   ASAAS_API_KEY             -> chave de API da conta Asaas
//   ASAAS_ENV                 -> "production" (padrão: sandbox)
//   ASAAS_WEBHOOK_TOKEN       -> token combinado no painel do Asaas
//   SUPABASE_SERVICE_ROLE_KEY -> chave secreta do Supabase (nunca no navegador)
//   SUPABASE_URL              -> opcional (padrão: projeto da Mimo Rosas)
// ============================================================================

const DEFAULT_SUPABASE_URL = 'https://dktpnqekuxtsqmazelox.supabase.co';

// Status do Asaas que significam "dinheiro na conta"
export const PAID_STATUSES = ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'];

export const isProduction = () => (process.env.ASAAS_ENV || '').trim().toLowerCase() === 'production';

export const asaasBaseUrl = () =>
  isProduction() ? 'https://api.asaas.com' : 'https://api-sandbox.asaas.com';

export const asaasConfigured = () => Boolean((process.env.ASAAS_API_KEY || '').trim());

export const supabaseAdminConfigured = () =>
  Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const httpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// ---------------------------------------------------------------------------
// Asaas
// ---------------------------------------------------------------------------
export async function asaasRequest(path, { method = 'GET', body } = {}) {
  const key = (process.env.ASAAS_API_KEY || '').trim();
  if (!key) throw httpError('Pagamento online ainda não configurado.', 503);

  const response = await fetch(`${asaasBaseUrl()}/v3${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      access_token: key,
      'User-Agent': 'MimoRosas/1.0.0'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!response.ok) {
    const first = data?.errors?.[0];
    const detail = first?.description || first?.code || text || `HTTP ${response.status}`;
    // 400/404 = dado inválido (ex.: CPF recusado): a mensagem do Asaas pode ir para a cliente.
    const status = response.status === 400 || response.status === 404 ? 400 : 502;
    const error = httpError(detail, status);
    error.asaasStatus = response.status;
    error.asaasPayload = data;
    throw error;
  }
  return data;
}

// Reaproveita o cadastro do cliente pelo CPF/CNPJ; cria só na primeira compra.
export async function ensureAsaasCustomer(order, cpfCnpj) {
  const document = onlyDigits(cpfCnpj);
  if (document.length !== 11 && document.length !== 14) {
    throw httpError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido para o pagamento.');
  }

  const existing = await asaasRequest(`/customers?cpfCnpj=${document}&limit=1`);
  if (Array.isArray(existing?.data) && existing.data.length > 0) return existing.data[0];

  const cep = onlyDigits(order?.cep);
  const payload = {
    name: String(order?.customer || order?.customer_name || 'Cliente Mimo Rosas').trim().slice(0, 100),
    cpfCnpj: document,
    email: String(order?.email || '').trim() || undefined,
    mobilePhone: onlyDigits(order?.phone) || undefined,
    postalCode: cep.length === 8 ? cep : undefined,
    externalReference: String(order?.id || '')
  };
  Object.keys(payload).forEach((key) => { if (payload[key] === undefined) delete payload[key]; });

  return asaasRequest('/customers', { method: 'POST', body: payload });
}

export function todayPlus(days = 3) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

export async function createAsaasPayment({ order, customerId, billingType }) {
  const value = Number(order?.total);
  if (!Number.isFinite(value) || value <= 0) throw httpError('Valor do pedido inválido.');
  if (value < 5) throw httpError('O valor mínimo para pagamento online é R$ 5,00. Fale com a loja pelo WhatsApp.');

  return asaasRequest('/payments', {
    method: 'POST',
    body: {
      customer: customerId,
      billingType, // 'PIX' | 'UNDEFINED' (cartão/boleto na fatura Asaas)
      value: Number(value.toFixed(2)),
      dueDate: todayPlus(3),
      description: `Pedido ${order.id} • Mimo Rosas`,
      externalReference: String(order.id)
    }
  });
}

export async function getPixQrCode(paymentId) {
  return asaasRequest(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

export async function findPaymentsByReference(orderId) {
  const result = await asaasRequest(`/payments?externalReference=${encodeURIComponent(String(orderId))}&limit=20`);
  return Array.isArray(result?.data) ? result.data : [];
}

// ---------------------------------------------------------------------------
// Supabase (service role: ignora RLS, por isso NUNCA pode ir para o navegador)
// ---------------------------------------------------------------------------
function supabaseFetch(path, init = {}) {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!key) throw httpError('Pagamento online ainda não configurado.', 503);

  const base = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  return fetch(`${base}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
}

const isValidOrderId = (orderId) => /^[A-Za-z0-9_-]{3,40}$/.test(String(orderId || ''));

// Lê o pedido no banco: o valor cobrado é sempre o do servidor, nunca o do navegador.
export async function getOrder(orderId) {
  if (!isValidOrderId(orderId)) return null;
  const response = await supabaseFetch(
    `/orders?id=eq.${encodeURIComponent(String(orderId))}` +
    '&select=id,total,status,customer,customer_name,email,phone,cep,city,address,payment_method,items&limit=1'
  );
  if (!response.ok) throw httpError('Não foi possível ler o pedido.', 502);
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function updateOrderStatus(orderId, status) {
  if (!isValidOrderId(orderId)) return false;
  try {
    const response = await supabaseFetch(`/orders?id=eq.${encodeURIComponent(String(orderId))}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status })
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Remove pedidos não pagos ("Aguardando PIX" / "Aguardando Pagamento") com mais de X minutos
export async function cleanupExpiredOrders(minutes = 30) {
  if (!supabaseAdminConfigured()) return false;
  try {
    const cutoffIso = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    const statuses = encodeURIComponent('("Aguardando PIX","Aguardando Pagamento")');
    const response = await supabaseFetch(
      `/orders?status=in.${statuses}&created_at=lt.${encodeURIComponent(cutoffIso)}`,
      {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' }
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

// Cancela/remove um pedido específico desde que ainda esteja aguardando pagamento
export async function deletePendingOrder(orderId) {
  if (!isValidOrderId(orderId) || !supabaseAdminConfigured()) return false;
  try {
    const statuses = encodeURIComponent('("Aguardando PIX","Aguardando Pagamento")');
    const response = await supabaseFetch(
      `/orders?id=eq.${encodeURIComponent(String(orderId))}&status=in.${statuses}`,
      {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' }
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Utilidades HTTP das functions
// ---------------------------------------------------------------------------
export function readJsonBody(req) {
  const raw = req?.body;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

export function readRawBody(req) {
  const raw = req?.body;
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  try { return JSON.stringify(raw); } catch { return ''; }
}
