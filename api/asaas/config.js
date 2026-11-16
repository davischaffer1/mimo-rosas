import {
  asaasConfigured,
  supabaseAdminConfigured,
  isProduction,
  cleanupExpiredOrders,
  deletePendingOrder,
  updateOrderStatus,
  readJsonBody
} from '../../server/asaas.js';

// GET  /api/asaas/config -> informa se o pagamento online está pronto e limpa pedidos expirados (> 30 min)
// POST /api/asaas/config -> permite cancelar pedido pendente ou confirmar pagamento no banco
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'POST') {
    const body = readJsonBody(req);
    if (body?.action === 'cancel' && body?.orderId) {
      const deleted = await deletePendingOrder(body.orderId);
      return res.status(200).json({ ok: deleted });
    }
    if (body?.action === 'mark_paid' && body?.orderId) {
      const updated = await updateOrderStatus(body.orderId, 'Pago');
      return res.status(200).json({ ok: updated });
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
