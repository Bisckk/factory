import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    console.log("Creando usuario de tipo admin...");
    
    const { data: user, error } = await supabase.auth.admin.createUser({
        email: 'admin@mototaller.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
            full_name: 'Administrador (Owner)',
            phone: '0000000000'
        }
    });

    if (error) {
        // If it already exists, fetch it so we can still try to promote it to admin
        if (error.message.includes("already exist")) {
            console.log("El usuario admin@mototaller.com ya existe. Solo actualizaremos su rol a 'admin'.");
            const { data: searchData, error: searchError } = await supabase.auth.admin.listUsers();
            if(!searchError) {
                const existingUser = searchData.users.find(u => u.email === 'admin@mototaller.com');
                if (existingUser) {
                    await promoteToAdmin(existingUser.id);
                }
            }
            return;
        } else {
            console.error("Error al crear usuario:", error);
            return;
        }
    }

    console.log("Usuario creado con ID:", user?.user?.id);
    
    // Give time for database trigger to create the profile row
    setTimeout(async () => {
        await promoteToAdmin(user?.user?.id);
    }, 2000);
}

async function promoteToAdmin(userId) {
    if (!userId) return;
    console.log("Asignando rol 'admin' al perfil...");
    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select();
        
    if (error) {
        console.error("Error actualizando perfil:", error);
    } else {
        console.log("¡Listo! El usuario ahora tiene rol de administrador:", data);
        console.log("Puedes iniciar sesión con: Email: admin@mototaller.com | Contraseña: admin123");
    }
}

main();
