import { createClient } from "@supabase/supabase-js";

// Esta chave (service_role) só deve ser usada no servidor — nunca em
// código que roda no navegador. Ela ignora o RLS, então as rotas de API
// que a usam precisam fazer sua própria validação (ver route.ts).
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidas no .env.local"
    );
  }

  return createClient(url, serviceRoleKey);
}
