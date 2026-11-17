import {
  readJsonBody,
  readRawBody,
  updateOrderStatus,
  mpCheckOrderPayment,
  PAID_STATUSES
} from '../../server/asaas.js';

// POST /api/asaas/webhook
// Recebe notificações automáticas tanto do Mercado Pago (Checkout Transparente) quanto do Asaas.
// Marca o pedido como "Pago" e dispara o e-mail de confirmação automaticamente.
const PAID_EVENTS = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_RECEIVED_IN_CASH'];
const REVERSED_EVENTS = ['PAYMENT_REFUNDED', 'PAYMENT_PARTIALLY_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  let payload = readJsonBody(req);
  if (!payload || typeof payload !== 'object' || (!payload.event && !payload.type && !payload.action)) {
    const raw = readRawBody(req);
    try { payload = JSON.parse(raw); } catch { payload = {}; }
  }

  // 1. Notificação do Mercado Pago (type: "payment" ou topic: "payment")
  const mpPaymentId =
    payload?.data?.id ||
    req.query?.['data.id'] ||
    (req.query?.topic === 'payment' ? req.query?.id : null);

  if (mpPaymentId || payload?.type === 'payment' || String(payload?.action || '').startsWith('payment.')) {
    if (mpPaymentId) {
      const check = await mpCheckOrderPayment({ paymentId: String(mpPaymentId) });
      return res.status(200).json({ ok: true, provider: 'mercadopago', ...check });
    }
    return res.status(200).json({ ok: true, provider: 'mercadopago', ignored: 'no_payment_id' });
  }

  // 2. Notificação do Asaas
  const expected = (process.env.ASAAS_WEBHOOK_TOKEN || '').trim();
  if (expected) {
    const received = String(req.headers['asaas-access-token'] || '').trim();
    if (received !== expected) {
      console.warn('[asaas/webhook] token inválido');
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
  }

  if (!payload || typeof payload !== 'object') {
    return res.status(200).json({ ok: true, ignored: 'invalid_body' });
  }

  const event = String(payload.event || '');
  const payment = payload.payment || payload.checkout || null;
  const orderId = String(payment?.externalReference || '').trim();

  if (!orderId) {
    return res.status(200).json({ ok: true, ignored: 'no_external_reference' });
  }

  if (PAID_EVENTS.includes(event) || PAID_STATUSES.includes(payment?.status)) {
    const saved = await updateOrderStatus(orderId, 'Pago');
    if (!saved) {
      // 5xx faz o Asaas reenviar (fila de sincronização) até a gravação funcionar.
      console.error('[asaas/webhook]', event, orderId, 'falha ao gravar como Pago');
      return res.status(503).json({ ok: false, error: 'save_failed', orderId });
    }
    console.log('[asaas/webhook]', event, orderId, 'pago');
    return res.status(200).json({ ok: true, orderId, status: 'Pago' });
  }

  if (REVERSED_EVENTS.includes(event)) {
    const saved = await updateOrderStatus(orderId, 'Pendente');
    if (!saved) {
      console.error('[asaas/webhook]', event, orderId, 'falha ao gravar estorno');
      return res.status(503).json({ ok: false, error: 'save_failed', orderId });
    }
    console.log('[asaas/webhook]', event, orderId, 'estorno/chargeback');
    return res.status(200).json({ ok: true, orderId, status: 'Pendente' });
  }

  return res.status(200).json({ ok: true, ignored: event || 'unknown_event' });
}
