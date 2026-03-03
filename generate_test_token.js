const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from('rooms')
    .update({
      tenant_invite_token: token,
      invite_expires_at: expiresAt
    })
    .eq('id', 'r_b_teheran_8');

  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log('URL: http://localhost:3000/invite/' + token);
  }
}
run();
