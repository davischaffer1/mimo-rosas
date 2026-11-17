import {
  asaasConfigured,
  supabaseAdminConfigured,
  isProduction,
  cleanupExpiredOrders,
  deletePendingOrder,
  updateOrderStatus,
  sendOrderStatusEmail,
  mpCreateTransparentPix,
  mpCreateTransparentCard,
  mpCheckOrderPayment,
  readJsonBody
} from '../../server/asaas.js';

// GET  /api/asaas/config -> informa se o pagamento online está pronto e limpa pedidos expirados (> 30 min)
// POST /api/asaas/config -> ações de pagamento (Mercado Pago Transparente PIX/Cartão, Asaas, cancelamento e e-mails)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'POST') {
    const body = readJsonBody(req);
    if (body?.action === 'mp_pix') {
      const result = await mpCreateTransparentPix({
        orderOrId: body.order || body.orderId,
        cpfCnpj: body.cpfCnpj,
        accessToken: body.accessToken
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }
    if (body?.action === 'mp_card') {
      const result = await mpCreateTransparentCard({
        orderOrId: body.order || body.orderId,
        card: body.card || {},
        accessToken: body.accessToken,
        publicKey: body.publicKey
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }
    if (body?.action === 'mp_check') {
      const result = await mpCheckOrderPayment({
        orderId: body.orderId,
        paymentId: body.paymentId,
        accessToken: body.accessToken
      });
      return res.status(200).json(result);
    }
    if (body?.action === 'cancel' && body?.orderId) {
      const deleted = await deletePendingOrder(body.orderId);
      return res.status(200).json({ ok: deleted });
    }
    if (body?.action === 'mark_paid' && body?.orderId) {
      const updated = await updateOrderStatus(body.orderId, 'Pago');
      if (body?.order) {
        await sendOrderStatusEmail(body.order, 'Pago', {
          resendApiKey: body.resendApiKey,
          resendFrom: body.resendFrom,
          siteOrigin: body.siteOrigin
        });
      }
      return res.status(200).json({ ok: updated });
    }
    if (body?.action === 'notify_order_status' && (body?.order || body?.orderId)) {
      const result = await sendOrderStatusEmail(body.order || body.orderId, body.status || 'Pago', {
        resendApiKey: body.resendApiKey,
        resendFrom: body.resendFrom,
        siteOrigin: body.siteOrigin
      });
      return res.status(200).json(result);
    }
    if (body?.action === 'cleanup') {
      const cleaned = await cleanupExpiredOrders(30);
      return res.status(200).json({ ok: cleaned });
    }
    return res.status(400).json({ ok: false, message: 'Ação inválida.' });
  }

  // Aproveita a chamada inicial da loja para limpar pedidos não pagos com mais de 30 minutos
  await cleanupExpiredOrders(30);

  const enabled = asaasConfigured() && supabaseAdminConfigured();

  return res.status(200).json({
    ok: true,
    enabled,
    provider: enabled ? 'asaas' : null,
    env: isProduction() ? 'production' : 'sandbox',
    methods: enabled ? ['PIX', 'CARD'] : []
  });
}
