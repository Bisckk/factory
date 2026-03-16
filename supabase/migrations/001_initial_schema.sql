-- 1. Crear el tipo de rol (enum)
CREATE TYPE "public"."user_role" AS ENUM ('admin', 'mechanic', 'client', 'accountant', 'receptionist');

-- 2. Crear la tabla de Perfiles (Profiles)
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "role" user_role NOT NULL DEFAULT 'client'::user_role,
    "full_name" text NOT NULL,
    "phone" text,
    "avatar_url" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- 3. Activar Reglas de Seguridad base (RLS)
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
