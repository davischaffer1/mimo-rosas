import {
  asaasConfigured,
  supabaseAdminConfigured,
  getOrder,
  ensureAsaasCustomer,
  createAsaasPayment,
  getPixQrCode,
  findPaymentsByReference,
  PAID_STATUSES,
  readJsonBody
} from '../../server/asaas.js';

// POST /api/asaas/create  { orderId, billingType: 'PIX' | 'CARD', cpfCnpj }
//
// • PIX  -> cria a cobrança e devolve o QR Code / copia-e-cola (o cliente paga no site)
// • CARD -> cria a fatura Asaas (invoiceUrl) onde a cliente paga no cartão
//
// O valor cobrado vem SEMPRE do pedido salvo no Supabase (nunca do navegador).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }
  if (!asaasConfigured() || !supabaseAdminConfigured()) {
    return res.status(503).json({
      ok: false,
      error: 'not_configured',
      message: 'Pagamento online ainda não configurado na loja.'
    });
  }

  const body = readJsonBody(req);
  const orderId = String(body.orderId || '').trim();
  const kind = String(body.billingType || 'PIX').toUpperCase();
  const billingType = kind === 'CARD' ? 'UNDEFINED' : 'PIX';

  if (!orderId) {
    return res.status(400).json({ ok: false, error: 'Pedido não informado.' });
  }
  if (kind !== 'PIX' && kind !== 'CARD') {
    return res.status(400).json({ ok: false, error: 'Forma de pagamento inválida.' });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return res.status(404).json({ ok: false, error: 'Pedido não encontrado.' });
    }
    if (String(order.status || '') === 'Pago') {
      return res.status(200).json({ ok: true, alreadyPaid: true, orderId });
    }

    // Evita cobranças duplicadas se a cliente clicar em "pagar" duas vezes.
    const existingPayments = await findPaymentsByReference(orderId);
    const paid = existingPayments.find((payment) => PAID_STATUSES.includes(payment?.status));
    if (paid) {
      return res.status(200).json({ ok: true, alreadyPaid: true, orderId, paymentId: paid.id });
    }
    const reusable = existingPayments.find(
      (payment) => payment?.status === 'PENDING' && payment?.billingType === billingType
    );

    const payment = reusable || await createAsaasPayment({
      order,
      customerId: (await ensureAsaasCustomer(order, body.cpfCnpj)).id,
      billingType
    });

    if (billingType === 'PIX') {
      let qr = null;
      try {
        qr = await getPixQrCode(payment.id);
      } catch {
        qr = null;
      }
      if (!qr?.payload) {
        return res.status(502).json({
          ok: false,
          error: 'pix_unavailable',
          message: 'Não foi possível gerar o PIX agora. Tente novamente ou pague pelo link da fatura.',
          invoiceUrl: payment.invoiceUrl || null
        });
      }
      return res.status(200).json({
        ok: true,
        provider: 'asaas',
        billingType: 'PIX',
        orderId,
        paymentId: payment.id,
        value: Number(payment.value || order.total || 0),
        invoiceUrl: payment.invoiceUrl || null,
        pix: {
          payload: qr.payload,
          encodedImage: qr.encodedImage || null,
          expirationDate: qr.expirationDate || null
        }
      });
    }

    return res.status(200).json({
      ok: true,
      provider: 'asaas',
      billingType: 'UNDEFINED',
      orderId,
      paymentId: payment.id,
      value: Number(payment.value || order.total || 0),
      invoiceUrl: payment.invoiceUrl || null
    });
  } catch (error) {
    const status = error?.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    console.error('[asaas/create]', error?.message, error?.asaasPayload || '');
    return res.status(status === 502 ? 502 : status).json({
      ok: false,
      error: 'create_failed',
      message: error?.status === 400
        ? error.message
        : 'Não foi possível iniciar o pagamento online. Tente novamente ou fale com a loja pelo WhatsApp.'
    });
  }
}
