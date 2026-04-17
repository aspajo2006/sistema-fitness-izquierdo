# 🚀 Guía de configuración — Sistema F. Izquierdo

## Archivos del proyecto
```
index.html    ← Página principal (requiere login)
login.html    ← Login y registro de usuarios
admin.html    ← Panel de administrador (solo tú)
script.js     ← Lógica principal
supabase.js   ← Configuración de la base de datos
style.css     ← Estilos
```

---

## Paso 1 — Crear cuenta en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta
2. Haz clic en **"New project"**
3. Dale un nombre (ej: `fi-fitness`) y crea una contraseña de base de datos
4. Espera ~2 minutos a que cree el proyecto

---

## Paso 2 — Crear la tabla de perfiles

En tu proyecto de Supabase, ve a **SQL Editor** y ejecuta esto:

```sql
-- Tabla de perfiles de usuarios
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT,
  xp         INTEGER DEFAULT 0,
  is_admin   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos: los usuarios solo ven su propio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su perfil"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios insertan su perfil"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins ven todos los perfiles
CREATE POLICY "Admins ven todo"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
```

---

## Paso 3 — Obtener tus claves de API

1. En tu proyecto Supabase ve a: **Settings → API**
2. Copia **Project URL** (algo como `https://abcxyz.supabase.co`)
3. Copia **anon public** key

Abre `supabase.js` y reemplaza los valores:

```js
const SUPABASE_URL      = 'https://TU_PROYECTO.supabase.co';  // 👈 pega aquí
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';                 // 👈 pega aquí
```

---

## Paso 4 — Crear tu cuenta de admin

1. Abre `login.html` en tu navegador
2. Regístrate con tu email personal
3. Vuelve a Supabase → **Table Editor → profiles**
4. Busca tu fila y cambia `is_admin` de `false` a `true`
5. Guarda — ya eres admin

A partir de ahora cuando inicies sesión irás directo a `admin.html`.

---

## Paso 5 — Subir a GitHub Pages

1. Sube todos los archivos a tu repositorio de GitHub
2. Ve a **Settings → Pages**
3. En "Source" selecciona `main` branch → carpeta `/root`
4. GitHub te dará una URL pública (ej: `https://tuusuario.github.io/fi-fitness/login.html`)

⚠️ Asegúrate de que el enlace principal apunte a `login.html`, no a `index.html`.

---

## Flujo de la aplicación

```
login.html
  ├── Usuario normal → index.html (ve sus tareas y XP)
  └── Admin (tú)    → admin.html (ve todos los usuarios)
```

---

## Notas importantes

- **Supabase gratis** soporta hasta 50,000 usuarios activos mensuales — más que suficiente
- El XP se guarda en la base de datos, así que si el alumno cambia de dispositivo conserva su progreso
- Las tareas completadas hoy se guardan localmente (se reinician al día siguiente)
