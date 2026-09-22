/**
 * Crea un usuario de prueba en Supabase — SOLO DESARROLLO.
 *
 *   node scripts/crear-usuario-prueba.mjs
 *   node scripts/crear-usuario-prueba.mjs otro@ejemplo.com MiClave123
 *
 * Por qué hace falta: el login pasa por Supabase, no por la base local, así que
 * sembrar datos en Postgres no alcanza para poder entrar. Y el registro normal
 * manda un mail de confirmación que en local nadie recibe; acá el usuario nace
 * confirmado.
 *
 * Es idempotente: si el usuario ya existe, le resetea la contraseña en vez de
 * fallar — correrlo dos veces es lo más probable cuando uno se la olvidó.
 *
 * El tenant NO se crea acá. La app lo provisiona sola en el primer login
 * (provisioning lazy en lib/kore/tenant.ts), y así se prueba también ese
 * camino, que es el que recorre un cliente real.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const EMAIL = process.argv[2] ?? "prueba@kore.local";
const PASSWORD = process.argv[3] ?? "KorePrueba123!";

/** Lee .env.local sin dependencias: el script corre fuera de Next, que es
 *  quien normalmente inyecta estas variables. */
function env() {
  let texto;
  try {
    texto = readFileSync(".env.local", "utf8");
  } catch {
    console.error("✖ No encontré .env.local. Corré esto desde agent-inmobi-app/");
    process.exit(1);
  }
  const vars = {};
  for (const linea of texto.split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) vars[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return vars;
}

const vars = env();
const url = vars.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = vars.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "✖ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
  process.exit(1);
}

// Una service-role key en producción crea usuarios confirmados sin que nadie
// valide el mail. Este script no tiene por qué apuntar nunca ahí.
if (process.env.NODE_ENV === "production") {
  console.error("✖ Este script no corre con NODE_ENV=production.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true, // sin esto queda pendiente de un mail que en local no llega
  user_metadata: { full_name: "Usuario de Prueba" },
});

let userId = data?.user?.id;

if (error) {
  const yaExiste =
    error.status === 422 || /already/i.test(error.message ?? "");
  if (!yaExiste) {
    console.error("✖ No se pudo crear el usuario:", error.message);
    process.exit(1);
  }
  // Ya existía: se le resetea la clave para que el script siempre deje un
  // usuario utilizable, que es para lo que uno lo corre.
  const { data: lista } = await admin.auth.admin.listUsers();
  const existente = lista?.users?.find((u) => u.email === EMAIL);
  if (!existente) {
    console.error("✖ El usuario existe pero no pude encontrarlo para actualizarlo.");
    process.exit(1);
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(existente.id, {
    password: PASSWORD,
    email_confirm: true,
  });
  if (updErr) {
    console.error("✖ No se pudo actualizar la contraseña:", updErr.message);
    process.exit(1);
  }
  userId = existente.id;
  console.log("♻️  El usuario ya existía; le actualicé la contraseña.");
} else {
  console.log("✅ Usuario creado.");
}

console.log(`
   email:    ${EMAIL}
   password: ${PASSWORD}
   user id:  ${userId}

   Entrá en http://localhost:3000/login

   El tenant se crea solo en el primer login. Para que las pantallas tengan
   datos, DESPUÉS de entrar una vez corré, desde kore-ai-backend/:

     python -m scripts.seed_demo

   (siembra el tenant más nuevo, que va a ser el de este usuario)
`);
