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
// Supabase (usa service_role se configurado, ou chave publicável da loja)
// ---------------------------------------------------------------------------
const DEFAULT_SUPABASE_KEY = 'sb_publishable_7WyhLNtUeEMNnbE_MyTo2g_IYrCA8AU';

function supabaseFetch(path, init = {}) {
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY
  ).trim();
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
// Mercado Pago • Checkout Transparente (PIX Oficial + Cartão na Loja)
// ---------------------------------------------------------------------------
export async function getMercadoPagoCredentials(options = {}) {
  let accessToken = String(
    options.accessToken ||
    process.env.MP_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    ''
  ).trim();
  let publicKey = String(
    options.publicKey ||
    process.env.MP_PUBLIC_KEY ||
    process.env.MERCADOPAGO_PUBLIC_KEY ||
    ''
  ).trim();

  if (!accessToken || !publicKey) {
    const cfg = await fetchStoreConfigFromSupabasePublic();
    if (!accessToken && cfg.mercadoPagoAccessToken) {
      accessToken = String(cfg.mercadoPagoAccessToken).trim();
    }
    if (!publicKey && cfg.mercadoPagoPublicKey) {
      publicKey = String(cfg.mercadoPagoPublicKey).trim();
    }
  }
  return { accessToken, publicKey };
}

function splitFullName(raw = '') {
  const parts = String(raw || 'Cliente Mimo Rosas').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Cliente';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Mimo Rosas';
  return { firstName, lastName };
}

function detectCardBrandByBin(cardNumber = '') {
  const num = onlyDigits(cardNumber);
  if (/^4/.test(num)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'master';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^(606282|3841)/.test(num)) return 'hipercard';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(num)) return 'elo';
  return 'visa';
}

export function translateMpRejection(statusDetail = '') {
  const map = {
    cc_rejected_bad_filled_card_number: 'Número do cartão inválido. Verifique os dígitos digitados.',
    cc_rejected_bad_filled_date: 'Data de validade do cartão inválida ou vencida.',
    cc_rejected_bad_filled_other: 'Algum dado do cartão foi preenchido incorretamente. Revise e tente novamente.',
    cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) inválido. Confira os 3 dígitos atrás do cartão.',
    cc_rejected_blacklist: 'Não foi possível processar este cartão. Tente outro cartão ou pague via PIX.',
    cc_rejected_call_for_authorize: 'O banco emissor pede autorização para esta compra. Autorize no app do banco ou use o PIX.',
    cc_rejected_card_disabled: 'Este cartão está desativado ou bloqueado no app do seu banco.',
    cc_rejected_duplicated_payment: 'Você já realizou um pagamento idêntico há poucos instantes.',
    cc_rejected_high_risk: 'Por segurança do Mercado Pago, o cartão não foi autorizado. Recomendamos pagar via PIX instantâneo.',
    cc_rejected_insufficient_amount: 'Saldo ou limite insuficiente no cartão.',
    cc_rejected_invalid_installments: 'O cartão selecionado não aceita essa quantidade de parcelas.',
    cc_rejected_max_attempts: 'Você atingiu o limite de tentativas com este cartão. Tente outro cartão ou use o PIX.'
  };
  return map[statusDetail] || 'O banco emissor não autorizou a cobrança neste cartão. Verifique os dados ou escolha o PIX.';
}

async function updateOrderMpPaymentId(orderId, mpPaymentId, status = undefined) {
  if (!isValidOrderId(orderId) || !mpPaymentId) return;
  try {
    const patch = { mp_payment_id: String(mpPaymentId) };
    if (status) patch.status = status;
    await supabaseFetch(`/orders?id=eq.${encodeURIComponent(String(orderId))}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(patch)
    });
  } catch { /* ignore */ }
}

// Cria cobrança PIX Transparente direto na API v1/payments do Mercado Pago
export async function mpCreateTransparentPix({ orderOrId, cpfCnpj, accessToken: tokenOpt }) {
  const { accessToken } = await getMercadoPagoCredentials({ accessToken: tokenOpt });
  if (!accessToken || (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-'))) {
    return { ok: false, reason: 'mp_not_configured', message: 'Access Token do Mercado Pago ainda não configurado.' };
  }

  let order = typeof orderOrId === 'object' && orderOrId ? orderOrId : null;
  const orderId = String(order?.id || order?.code || orderOrId || '').trim();
  if ((!order || !order.total) && orderId) {
    try { order = await getOrder(orderId); } catch { /* ignore */ }
  }
  if (!order) {
    return { ok: false, reason: 'order_not_found', message: 'Pedido não encontrado.' };
  }

  const amount = Number(Number(order.total || 0).toFixed(2));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: 'invalid_amount', message: 'Valor do pedido inválido.' };
  }

  const { firstName, lastName } = splitFullName(order.customer || order.customer_name || 'Cliente Mimo Rosas');
  const email = String(order.email || '').trim() || `cliente.${orderId.toLowerCase().replace(/[^a-z0-9]/g, '')}@mimorosas.com.br`;
  const docClean = onlyDigits(cpfCnpj || order.document || '');

  const payload = {
    transaction_amount: amount,
    description: `Pedido #${orderId} - Mimo Rosas`,
    payment_method_id: 'pix',
    external_reference: orderId,
    payer: {
      email,
      first_name: firstName,
      last_name: lastName,
      ...(docClean.length === 11 || docClean.length === 14
        ? {
            identification: {
              type: docClean.length === 14 ? 'CNPJ' : 'CPF',
              number: docClean
            }
          }
        : {})
    }
  };

  const res = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `mimo-pix-${orderId}-${Date.now()}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const causeMsg = data?.cause?.[0]?.description || data?.message || 'Não foi possível gerar o QR Code PIX no Mercado Pago.';
    return { ok: false, status: res.status, message: causeMsg, detail: data };
  }

  const txData = data?.point_of_interaction?.transaction_data || {};
  const paymentId = data?.id ? String(data.id) : null;
  if (paymentId) {
    await updateOrderMpPaymentId(orderId, paymentId);
  }

  return {
    ok: true,
    provider: 'mercadopago',
    paymentId,
    status: data?.status || 'pending',
    alreadyPaid: data?.status === 'approved',
    pix: {
      payload: txData.qr_code || '',
      encodedImage: txData.qr_code_base64 || null,
      ticketUrl: txData.ticket_url || null
    }
  };
}

// Cria e processa cobrança de Cartão de Crédito Transparente (sem sair do site)
export async function mpCreateTransparentCard({ orderOrId, card = {}, accessToken: tokenOpt, publicKey: pubOpt }) {
  const { accessToken, publicKey } = await getMercadoPagoCredentials({
    accessToken: tokenOpt,
    publicKey: pubOpt
  });
  if (!accessToken || (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-'))) {
    return { ok: false, reason: 'mp_not_configured', message: 'Configure o Access Token do Mercado Pago no painel /admin para cobrar cartões.' };
  }

  let order = typeof orderOrId === 'object' && orderOrId ? orderOrId : null;
  const orderId = String(order?.id || order?.code || orderOrId || '').trim();
  if ((!order || !order.total) && orderId) {
    try { order = await getOrder(orderId); } catch { /* ignore */ }
  }
  if (!order) {
    return { ok: false, reason: 'order_not_found', message: 'Pedido não encontrado.' };
  }

  const amount = Number(Number(order.total || 0).toFixed(2));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: 'invalid_amount', message: 'Valor do pedido inválido.' };
  }

  const cardNumber = onlyDigits(card.number);
  const holderName = String(card.holderName || order.customer || 'CLIENTE MIMO ROSAS').trim();
  const expRaw = String(card.expiry || '').replace(/\D/g, '');
  const expMonth = Number(card.expMonth || expRaw.slice(0, 2));
  const rawYear = String(card.expYear || expRaw.slice(2));
  const expYear = Number(rawYear.length === 2 ? `20${rawYear}` : rawYear);
  const cvv = onlyDigits(card.cvv);
  const docClean = onlyDigits(card.cpfCnpj || order.document || '');
  const installments = Math.max(1, Math.min(12, Number(card.installments || 1)));

  let cardTokenId = String(card.token || '').trim();
  let paymentMethodId = String(card.paymentMethodId || '').trim();
  let issuerId = card.issuerId || undefined;

  // 1. Descobre a bandeira e o banco emissor pelo BIN (6 primeiros dígitos)
  const bin = cardNumber.slice(0, 6);
  if (!paymentMethodId && bin.length === 6) {
    try {
      const binRes = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/search?bins=${bin}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (binRes.ok) {
        const binData = await binRes.json();
        const pm = Array.isArray(binData?.results) ? binData.results[0] : null;
        if (pm?.id) paymentMethodId = pm.id;
        if (pm?.issuer?.id && !issuerId) issuerId = pm.issuer.id;
      }
    } catch { /* fallback local */ }
  }
  if (!paymentMethodId) {
    paymentMethodId = detectCardBrandByBin(cardNumber);
  }

  // 2. Se o token ainda não veio do navegador, gera o card_token na API oficial do Mercado Pago
  if (!cardTokenId) {
    if (cardNumber.length < 13 || !expMonth || expMonth > 12 || !expYear || cvv.length < 3) {
      return { ok: false, message: 'Verifique o número do cartão, a validade (MM/AA) e o código CVV.' };
    }
    if (docClean.length !== 11 && docClean.length !== 14) {
      return { ok: false, message: 'Informe um CPF válido do titular do cartão.' };
    }

    const tokenUrl = publicKey
      ? `https://api.mercadopago.com/v1/card_tokens?public_key=${encodeURIComponent(publicKey)}`
      : 'https://api.mercadopago.com/v1/card_tokens';

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `mimo-tok-${orderId}-${Date.now()}`
      },
      body: JSON.stringify({
        card_number: cardNumber,
        expiration_month: expMonth,
        expiration_year: expYear,
        security_code: cvv,
        cardholder: {
          name: holderName,
          identification: {
            type: docClean.length === 14 ? 'CNPJ' : 'CPF',
            number: docClean
          }
        }
      })
    });

    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData?.id) {
      const cause = tokenData?.cause?.[0]?.description || tokenData?.message || 'Dados do cartão inválidos. Revise o número, validade e CVV.';
      return { ok: false, message: cause, detail: tokenData };
    }
    cardTokenId = tokenData.id;
  }

  // 3. Executa a cobrança transparente no Mercado Pago (/v1/payments)
  const { firstName, lastName } = splitFullName(order.customer || holderName);
  const email = String(order.email || '').trim() || `cliente.${orderId.toLowerCase().replace(/[^a-z0-9]/g, '')}@mimorosas.com.br`;
  const phoneDigits = onlyDigits(order.phone || '');
  const areaCode = phoneDigits.length >= 10 ? phoneDigits.slice(0, 2) : '49';
  const phoneNumber = phoneDigits.length >= 10 ? phoneDigits.slice(2) : phoneDigits || '999999999';
  const orderItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((it, idx) => ({
        id: String(it.id || `item-${idx + 1}`),
        title: String(it.name || 'Produto Mimo Rosas').slice(0, 120),
        description: String(it.name || 'Produto Artesanal Mimo Rosas').slice(0, 200),
        category_id: 'home',
        quantity: Math.max(1, Number(it.qty || it.quantity || 1)),
        unit_price: Number(Number(it.price || amount).toFixed(2))
      }))
    : [
        {
          id: orderId,
          title: `Pedido #${orderId} - Mimo Rosas`,
          category_id: 'home',
          quantity: 1,
          unit_price: amount
        }
      ];

  const paymentPayload = {
    transaction_amount: amount,
    token: cardTokenId,
    description: `Pedido #${orderId} - Mimo Rosas`,
    installments,
    payment_method_id: paymentMethodId,
    ...(issuerId ? { issuer_id: Number(issuerId) || issuerId } : {}),
    external_reference: orderId,
    statement_descriptor: 'MIMOROSAS',
    binary_mode: false,
    additional_info: {
      items: orderItems,
      payer: {
        first_name: firstName,
        last_name: lastName,
        phone: {
          area_code: areaCode,
          number: phoneNumber
        }
      }
    },
    payer: {
      email,
      first_name: firstName,
      last_name: lastName,
      ...(docClean.length === 11 || docClean.length === 14
        ? {
            identification: {
              type: docClean.length === 14 ? 'CNPJ' : 'CPF',
              number: docClean
            }
          }
        : {})
    }
  };

  const payHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Idempotency-Key': `mimo-card-${orderId}-${Date.now()}`
  };
  if (card.deviceId) {
    payHeaders['X-meli-session-id'] = String(card.deviceId).trim();
  }

  const payRes = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: payHeaders,
    body: JSON.stringify(paymentPayload)
  });

  const payData = await payRes.json().catch(() => ({}));
  if (!payRes.ok) {
    const errMsg = payData?.cause?.[0]?.description || payData?.message || 'Não foi possível processar o cartão agora.';
    return { ok: false, message: errMsg, detail: payData };
  }

  const paymentId = payData?.id ? String(payData.id) : null;
  const status = String(payData?.status || '');
  const statusDetail = String(payData?.status_detail || '');

  if (status === 'approved') {
    await updateOrderMpPaymentId(orderId, paymentId, 'Pago');
    await updateOrderStatus(orderId, 'Pago');
    return {
      ok: true,
      paid: true,
      status: 'approved',
      paymentId
    };
  }

  if (status === 'in_process' || status === 'pending') {
    if (paymentId) await updateOrderMpPaymentId(orderId, paymentId);
    return {
      ok: true,
      paid: false,
      status,
      paymentId,
      message: 'Seu pagamento com cartão está em análise rápida pela operadora e será confirmado em instantes.'
    };
  }

  // Se o Mercado Pago recusou por antifraude, verifica se a pessoa está tentando pagar com o mesmo CPF/e-mail do dono da conta Mercado Pago (autofinanciamento)
  let customRejectionMsg = translateMpRejection(statusDetail);
  if (statusDetail === 'cc_rejected_high_risk' || statusDetail === 'cc_rejected_blacklist' || statusDetail === 'cc_rejected_other_reason') {
    try {
      const meRes = await fetch('https://api.mercadopago.com/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (meRes.ok) {
        const me = await meRes.json();
        const ownerDoc = onlyDigits(me?.identification?.number || '');
        const ownerEmail = String(me?.email || '').trim().toLowerCase();
        const ownerLast = String(me?.last_name || '').trim().toUpperCase();
        if (
          (ownerDoc && docClean === ownerDoc) ||
          (ownerEmail && email.toLowerCase() === ownerEmail) ||
          (ownerLast && holderName.toUpperCase().includes(ownerLast))
        ) {
          customRejectionMsg =
            'O Mercado Pago não permite pagar com cartão de crédito quando o comprador é o próprio dono da conta Mercado Pago da loja (mesmo CPF, nome ou e-mail — regra contra autofinanciamento). Para testar compras no cartão, use o cartão, CPF e e-mail de outra pessoa!';
        }
      }
    } catch { /* ignore */ }
  }

  return {
    ok: false,
    paid: false,
    status: 'rejected',
    statusDetail,
    paymentId,
    message: customRejectionMsg
  };
}

// Consulta pagamento no Mercado Pago pelo servidor (sem bloqueio de CORS)
export async function mpCheckOrderPayment({ orderId, paymentId, accessToken: tokenOpt }) {
  const { accessToken } = await getMercadoPagoCredentials({ accessToken: tokenOpt });
  if (!accessToken || (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-'))) {
    return { ok: false, paid: false };
  }

  try {
    if (paymentId && paymentId !== 'null') {
      const directRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(String(paymentId))}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (directRes.ok) {
        const d = await directRes.json();
        if (d?.status === 'approved') {
          const refOrder = orderId || d.external_reference;
          if (refOrder) await updateOrderStatus(refOrder, 'Pago');
          return { ok: true, paid: true, status: 'approved', paymentId: String(d.id) };
        }
        return { ok: true, paid: false, status: d?.status || 'pending', paymentId: String(d?.id || paymentId) };
      }
    }

    if (orderId) {
      const searchRes = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(String(orderId))}&sort=date_created&criteria=desc`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (searchRes.ok) {
        const d = await searchRes.json();
        const results = Array.isArray(d?.results) ? d.results : [];
        const approved = results.find((p) => p?.status === 'approved');
        if (approved) {
          await updateOrderStatus(orderId, 'Pago');
          return { ok: true, paid: true, status: 'approved', paymentId: String(approved.id) };
        }
        if (results.length > 0) {
          return { ok: true, paid: false, status: results[0].status, paymentId: String(results[0].id) };
        }
      }
    }
  } catch (err) {
    console.warn('[mp/check]', err?.message);
  }
  return { ok: false, paid: false };
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
