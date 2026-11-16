import { asaasConfigured, supabaseAdminConfigured, isProduction } from '../../server/asaas.js';

// GET /api/asaas/config
// Só informa se o pagamento online está pronto. Nenhuma chave sai daqui.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const enabled = asaasConfigured() && supabaseAdminConfigured();

  return res.status(200).json({
    ok: true,
    enabled,
    provider: enabled ? 'asaas' : null,
    env: isProduction() ? 'production' : 'sandbox',
    methods: enabled ? ['PIX', 'CARD'] : []
  });
}
