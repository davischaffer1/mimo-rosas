import { createClient } from '@supabase/supabase-js';

// Cache de clientes: o App permite trocar URL/chave pelo painel admin,
// então a instância é criada sob demanda e reaproveitada.
const cache = new Map();

export const getSupabaseClient = (url, key) => {
  if (!url || !key) return null;
  const cleanUrl = String(url).trim().replace(/\/$/, '');
  const id = `${cleanUrl}|${key}`;
  if (!cache.has(id)) {
    cache.set(
      id,
      createClient(cleanUrl, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'mimo-auth'
        }
      })
    );
  }
  return cache.get(id);
};
