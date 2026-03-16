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

const accountsToCreate = [
    {
        email: 'owners@garage.com',
        password: 'Prueba',
        name: 'Dueño del Garage',
        role: 'admin'
    },
    {
        email: 'receive@garage.com',
        password: 'Prueba',
        name: 'Recepcionista',
        role: 'receptionist'
    },
    {
        email: 'mecha@garage.com',
        password: 'Prueba',
        name: 'Mecánico Principal',
        role: 'mechanic'
    }
];

async function createAccount(account) {
    console.log(`\n⏳ Creando usuario: ${account.email}...`);

    // 1. Crear en Auth
    const { data: user, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
            full_name: account.name
        }
    });

    let userId;

    if (error) {
        if (error.message.includes("already exist") || error.message.includes("registered")) {
            console.log(`⚠️ El usuario ${account.email} ya existe en Auth. Buscando ID...`);
            const { data: searchData, error: searchError } = await supabase.auth.admin.listUsers();
            if (!searchError) {
                const existingUser = searchData.users.find(u => u.email === account.email);
                if (existingUser) {
                    userId = existingUser.id;
                }
            }
        } else {
            console.error(`❌ Error Auth para ${account.email}:`, error.message);
            return;
        }
    } else {
        userId = user?.user?.id;
        console.log(`✅ Creado en Auth exitosamente (ID: ${userId})`);
    }

    if (!userId) return;

    // 2. Insertar / Actualizar en la tabla perfiles
    console.log(`🔄 Asignando rol de '${account.role}' en la base de datos...`);

    // Check si existe en profiles
    const { data: profileCheck } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    let profileError;
    if (profileCheck) {
        // Actualizar
        const res = await supabase.from('profiles').update({ role: account.role, full_name: account.name }).eq('id', userId);
        profileError = res.error;
    } else {
        // Insertar
        const res = await supabase.from('profiles').insert([{ id: userId, role: account.role, full_name: account.name }]);
        profileError = res.error;
    }

    if (profileError) {
        console.error(`❌ Error guardando el perfil SQL para ${account.email}:`, profileError.message);
        console.log("👉 IMPORTANTE: Es posible que no hayas creado las tablas en tu base de datos de Supabase todavía. Ve al Panel de Supabase -> SQL Editor y crea la tabla 'profiles'.");
    } else {
        console.log(`✅ ¡Perfil creado/actualizado en DB con el rol de ${account.role}!`);
    }
}

async function main() {
    console.log("🚀 INICIANDO CREACIÓN DE CUENTAS EN SUPABASE...");

    for (const acc of accountsToCreate) {
        await createAccount(acc);
    }

    console.log("\n🎉 🎉 PROCESO FINALIZADO. Ve a tu panel de Supabase -> Table Editor -> profiles para confirmar.");
}

main();
