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
    let prevOrder = null;
    try { prevOrder = await getOrder(orderId); } catch { prevOrder = null; }

    const response = await supabaseFetch(`/orders?id=eq.${encodeURIComponent(String(orderId))}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status })
    });
    if (response.ok && (!prevOrder || prevOrder.status !== status)) {
      await sendOrderStatusEmail(prevOrder || { id: orderId }, status).catch(() => {});
    }
    return response.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// E-mails transacionais de status do pedido (via Resend API)
// ---------------------------------------------------------------------------
const LOGO_URL = 'https://raw.githubusercontent.com/davischaffer1/mimo-rosas/main/public/email-logo.png';

const formatBRLServer = (val) =>
  Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const escapeHtml = (str = '') =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const STATUS_EMAIL_META = {
  'Aguardando PIX': {
    subject: (id) => `Recebemos seu pedido #${id} • Mimo Rosas 🌹`,
    badge: 'Aguardando Pagamento',
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
    heading: 'Recebemos o seu pedido! 🌹',
    lead: 'Que alegria preparar um mimo especial para você! Seu pedido já foi registrado e os itens estão reservados por 30 minutos aguardando a confirmação do pagamento.',
    stepIndex: 1
  },
  'Aguardando Pagamento': {
    subject: (id) => `Recebemos seu pedido #${id} • Mimo Rosas 🌹`,
    badge: 'Aguardando Pagamento',
    badgeColor: '#92400E',
    badgeBg: '#FEF3C7',
    heading: 'Recebemos o seu pedido! 🌹',
    lead: 'Que alegria preparar um mimo especial para você! Seu pedido já foi registrado e aguarda a conclusão do pagamento.',
    stepIndex: 1
  },
  'Pago': {
    subject: (id) => `Pagamento Confirmado! Pedido #${id} • Mimo Rosas 🌹`,
    badge: 'Pagamento Confirmado',
    badgeBg: '#D1FAE5',
    badgeColor: '#065F46',
    heading: 'Pagamento confirmado com sucesso! 🌹',
    lead: 'Muito obrigada pela sua compra! Já identificamos o seu pagamento e o seu pedido está garantido. Em breve nossa equipe iniciará a preparação artesanal de cada detalhe.',
    stepIndex: 2
  },
  'Em Produção': {
    subject: (id) => `Seu pedido #${id} está em Produção Artesanal • Mimo Rosas ✨`,
    badge: 'Em Produção no Ateliê',
    badgeBg: '#FCEEF2',
    badgeColor: '#A90F4D',
    heading: 'Seu pedido entrou em produção! ✨',
    lead: 'Nossa equipe já está produzindo e separando cada item do seu pedido manualmente no ateliê Mimo Rosas, com todo o cuidado e afeto que você merece.',
    stepIndex: 3
  },
  'Enviado': {
    subject: (id) => `Seu pedido #${id} saiu para entrega / está pronto! • Mimo Rosas 🚚`,
    badge: 'Enviado / Pronto',
    badgeBg: '#E0F2FE',
    badgeColor: '#075985',
    heading: 'Boas notícias! Seu pedido está a caminho 🚚🌹',
    lead: 'Seu pedido já foi finalizado no ateliê e seguiu para entrega (ou já está disponível caso tenha escolhido retirada no ateliê)!',
    stepIndex: 4
  },
  'Concluído': {
    subject: (id) => `Pedido #${id} Concluído! Obrigada pelo carinho • Mimo Rosas 💕`,
    badge: 'Pedido Concluído',
    badgeBg: '#D1FAE5',
    badgeColor: '#065F46',
    heading: 'Pedido concluído com muito amor! 💕',
    lead: 'Esperamos que você ame cada aroma, sabor e detalhe do seu pedido tanto quanto amamos preparar para você. Volte sempre à Mimo Rosas!',
    stepIndex: 5
  }
};

export function buildOrderStatusEmail(order = {}, status = 'Pago', siteOrigin = 'https://mimo-rosas.vercel.app') {
  const cleanStatus = STATUS_EMAIL_META[status] ? status : 'Pago';
  const meta = STATUS_EMAIL_META[cleanStatus];
  const orderId = escapeHtml(order.id || order.code || 'MR-PEDIDO');
  const customerName = escapeHtml(order.customer || order.customer_name || order.customerName || 'Cliente Mimo Rosas');
  const items = Array.isArray(order.items) ? order.items : [];
  const totalFormatted = formatBRLServer(order.total || 0);
  const isPickup = (order.delivery_method || order.deliveryMethod) === 'pickup' || /retirada/i.test(order.address || '');
  const addressText = escapeHtml(order.address || (isPickup ? 'Retirada no Ateliê Mimo Rosas' : 'Endereço cadastrado no pedido'));
  const accountUrl = `${String(siteOrigin || 'https://mimo-rosas.vercel.app').replace(/\/$/, '')}/?conta=1`;

  const steps = [
    { idx: 1, label: 'Pedido' },
    { idx: 2, label: 'Pago' },
    { idx: 3, label: 'Produção' },
    { idx: 4, label: 'Enviado' },
    { idx: 5, label: 'Concluído' }
  ];

  const stepsHtml = steps
    .map((s) => {
      const done = s.idx <= meta.stepIndex;
      const bg = done ? '#A90F4D' : '#EFE0DC';
      const color = done ? '#FFFFFF' : '#8B6456';
      const textWeight = s.idx === meta.stepIndex ? 'bold' : 'normal';
      return `
        <td align="center" width="20%" style="padding:0 2px;">
          <div style="width:24px; height:24px; line-height:24px; border-radius:50%; background-color:${bg}; color:${color}; font-size:11px; font-weight:bold; margin:0 auto 4px auto;">
            ${done ? '✓' : s.idx}
          </div>
          <div style="font-size:10px; color:${done ? '#4A2532' : '#9A7468'}; font-weight:${textWeight};">
            ${s.label}
          </div>
        </td>
      `;
    })
    .join('');

  const itemsHtml = items.length > 0
    ? items
        .map((it) => {
          const qty = Number(it.qty || it.quantity || 1);
          const lineTotal = formatBRLServer(Number(it.price || 0) * qty);
          return `
            <tr>
              <td style="padding:8px 0; border-bottom:1px solid #F2DFDA; font-size:13px; color:#4A2532; text-align:left;">
                <strong>${qty}×</strong> ${escapeHtml(it.name || 'Produto Mimo Rosas')}
              </td>
              <td style="padding:8px 0; border-bottom:1px solid #F2DFDA; font-size:13px; font-weight:bold; color:#A90F4D; text-align:right; white-space:nowrap;">
                ${lineTotal}
              </td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="2" style="padding:8px 0; font-size:13px; color:#5A382E;">
          Pedido #${orderId}
        </td>
      </tr>
    `;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.subject(orderId))}</title>
</head>
<body style="margin:0; padding:0; background-color:#F6E9E5; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#4A2532;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F6E9E5; padding:32px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:540px; background-color:#FFF9F3; border-radius:28px; border:1px solid #EAD6D0; overflow:hidden; box-shadow:0 10px 30px rgba(74,37,50,0.08);">
          
          <!-- Cabeçalho com Logo Mimo Rosas -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #980B44 0%, #A90F4D 100%); background-color:#A90F4D; padding:30px 24px 24px 24px; text-align:center;">
              <img src="${LOGO_URL}" alt="Mimo Rosas" width="74" height="74" style="display:block; margin:0 auto 10px auto; border:0; border-radius:50%;" />
              <div style="font-family:Georgia, 'Playfair Display', serif; font-size:27px; font-weight:bold; color:#FFF9F3; letter-spacing:0.5px; line-height:1.2;">
                Mimo Rosas
              </div>
              <div style="font-size:12px; color:#FAD4E0; margin-top:4px; letter-spacing:0.4px;">
                Presentes, Aromas e Sabores Artesanais
              </div>
            </td>
          </tr>

          <!-- Corpo Principal -->
          <tr>
            <td style="padding:28px 26px 20px 26px; text-align:center;">
              <div style="display:inline-block; padding:6px 16px; border-radius:999px; background-color:${meta.badgeBg}; color:${meta.badgeColor}; font-size:12px; font-weight:bold; margin-bottom:14px;">
                ${escapeHtml(meta.badge)} • Pedido #${orderId}
              </div>

              <h1 style="margin:0 0 10px 0; font-family:Georgia, 'Playfair Display', serif; font-size:22px; font-weight:bold; color:#4A2532;">
                ${meta.heading}
              </h1>

              <p style="margin:0 0 22px 0; font-size:14px; line-height:1.65; color:#5A382E;">
                Olá, <strong>${customerName}</strong>!<br />
                ${meta.lead}
              </p>

              <!-- Linha do Tempo do Pedido -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F6E9E5; border-radius:18px; padding:14px 8px; margin-bottom:22px;">
                <tr>
                  ${stepsHtml}
                </tr>
              </table>

              <!-- Resumo dos Itens -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FFFFFF; border:1px solid #EAD6D0; border-radius:20px; padding:16px 18px; text-align:left; margin-bottom:18px;">
                <tr>
                  <td colspan="2" style="padding-bottom:8px; border-bottom:1px solid #EAD6D0; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; color:#795344;">
                    Resumo do Pedido #${orderId}
                  </td>
                </tr>
                ${itemsHtml}
                <tr>
                  <td style="padding-top:12px; font-size:14px; font-weight:bold; color:#4A2532;">
                    Total do Pedido
                  </td>
                  <td style="padding-top:12px; font-size:16px; font-weight:bold; color:#A90F4D; text-align:right;">
                    ${totalFormatted}
                  </td>
                </tr>
              </table>

              <!-- Entrega / Retirada -->
              <div style="background-color:#F6E9E5; border-radius:16px; padding:12px 16px; text-align:left; font-size:12px; color:#5A382E; margin-bottom:24px;">
                <strong style="color:#4A2532;">${isPickup ? '🏪 Retirada no Ateliê:' : '🚚 Endereço de Entrega:'}</strong><br />
                ${addressText}
              </div>

              <!-- Botão Acompanhar Pedido -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="#A90F4D" style="border-radius:999px;">
                    <a href="${accountUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:14px; font-weight:600; color:#FFFFFF; text-decoration:none; border-radius:999px; background-color:#A90F4D;">
                      Acompanhar meu pedido na loja
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divisor -->
          <tr>
            <td style="padding:0 26px;">
              <div style="height:1px; background-color:#EFE0DC;"></div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding:18px 26px 24px 26px; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#795344;">
                Cuidados em cada detalhe para encantar em cada escolha. 🌹
              </p>
              <p style="margin:0; font-size:11px; color:#9A7468;">
                Mimo Rosas • Você recebeu este e-mail porque realizou o pedido #${orderId} em nossa loja.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: meta.subject(order.id || order.code || 'MR'), html };
}

async function fetchStoreConfigFromSupabasePublic() {
  try {
    const base = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
    const anonOrServiceKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      'sb_publishable_7WyhLNtUeEMNnbE_MyTo2g_IYrCA8AU'
    ).trim();
    const res = await fetch(
      `${base}/rest/v1/categories?id=eq.__mimo_store_config__&select=description&limit=1`,
      {
        headers: {
          apikey: anonOrServiceKey,
          Authorization: `Bearer ${anonOrServiceKey}`
        }
      }
    );
    if (!res.ok) return {};
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0]?.description) {
      return JSON.parse(rows[0].description);
    }
  } catch { /* ignore */ }
  return {};
}

export async function sendOrderStatusEmail(orderOrId, status = 'Pago', options = {}) {
  try {
    let order = typeof orderOrId === 'object' && orderOrId ? orderOrId : null;
    const orderId = order?.id || order?.code || (typeof orderOrId === 'string' ? orderOrId : '');
    if ((!order || !order.email) && orderId && supabaseAdminConfigured()) {
      try {
        const dbOrd = await getOrder(orderId);
        if (dbOrd) order = { ...dbOrd, ...order };
      } catch { /* ignore */ }
    }

    const recipientEmail = String(order?.email || '').trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return { ok: false, reason: 'missing_recipient_email' };
    }

    let apiKey = String(options.resendApiKey || process.env.RESEND_API_KEY || '').trim();
    let fromEmail = String(options.resendFrom || process.env.RESEND_FROM_EMAIL || '').trim();

    if (!apiKey || !fromEmail) {
      const cfg = await fetchStoreConfigFromSupabasePublic();
      if (!apiKey && cfg.resendApiKey) apiKey = String(cfg.resendApiKey).trim();
      if (!fromEmail && cfg.resendFromEmail) fromEmail = String(cfg.resendFromEmail).trim();
    }

    if (!apiKey) {
      return { ok: false, reason: 'missing_resend_api_key' };
    }

    const formattedFrom = fromEmail
      ? (fromEmail.includes('<') ? fromEmail : `Mimo Rosas <${fromEmail}>`)
      : 'Mimo Rosas <onboarding@resend.dev>';

    const { subject, html } = buildOrderStatusEmail(order, status, options.siteOrigin);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFrom,
        to: [recipientEmail],
        subject,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[resend/order-email] falha:', res.status, errText);
      return { ok: false, status: res.status, detail: errText };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data?.id || null };
  } catch (err) {
    console.warn('[resend/order-email] erro:', err?.message);
    return { ok: false, error: err?.message };
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
