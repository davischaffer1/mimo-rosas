import {
  asaasConfigured,
  findPaymentsByReference,
  updateOrderStatus,
  PAID_STATUSES
} from '../../server/asaas.js';

// GET /api/asaas/status?order=MR-12345
// A tela do pedido consulta este endpoint enquanto espera o pagamento.
// Se o webhook já tiver marcado como Pago, responde na hora (sem chamar o Asaas).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }
  if (!asaasConfigured()) {
    return res.status(200).json({ ok: false, enabled: false, paid: false });
  }

  const orderId = String(req.query?.order || req.query?.orderId || '').trim();
  if (!/^[A-Za-z0-9_-]{3,40}$/.test(orderId)) {
    return res.status(400).json({ ok: false, paid: false, error: 'Pedido inválido.' });
  }

  try {
    const payments = await findPaymentsByReference(orderId);
    const paid = payments.find((payment) => PAID_STATUSES.includes(payment?.status));

    if (paid) {
      // Mantém o banco em dia mesmo se o webhook falhar/atrasar.
      await updateOrderStatus(orderId, 'Pago');
      return res.status(200).json({
        ok: true,
        enabled: true,
        paid: true,
        status: 'Pago',
        paymentId: paid.id,
        billingType: paid.billingType || null
      });
    }

    const pending = payments.find((payment) => payment?.status === 'PENDING');
    return res.status(200).json({
      ok: true,
      enabled: true,
      paid: false,
      status: pending ? 'PENDING' : 'NOT_FOUND',
      invoiceUrl: pending?.invoiceUrl || null
    });
  } catch (error) {
    console.error('[asaas/status]', error?.message);
    return res.status(200).json({ ok: false, enabled: true, paid: false, error: 'status_unavailable' });
  }
}
