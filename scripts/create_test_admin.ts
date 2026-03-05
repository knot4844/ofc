import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createConfirmedUser(email: string, password: string) {
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (error) {
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
            console.log(`User ${email} already exists. Updating password and confirming...`);
            const { data: users } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users.users.find(u => u.email === email);
            if (existingUser) {
                await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                    password,
                    email_confirm: true,
                });
                console.log(`Password updated for ${email}.`);
            }
        } else {
            console.error(`Error creating user ${email}:`, error);
        }
    } else {
        console.log(`User created: ${email}`);
    }
}

async function main() {
    await createConfirmedUser('admin@daewoo.com', 'password123'); // Admin
    await createConfirmedUser('normal@daewoo.com', 'password123'); // Normal user
}

main();
