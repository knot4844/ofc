const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: 'testtenant123@example.com',
        options: {
            redirectTo: 'http://localhost:3000/invite/ac7006c8-8f88-4fcc-8fdf-b47ee3e34fca/profile'
        }
    });

    if (error) {
        console.error("DB Error:", error);
    } else {
        console.log('MAGIC_LINK: ' + data.properties.action_link);
    }
}
run();
