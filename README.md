# 📚 LeoClub - App de Registro de Lectura y Moderación con IA

LeoClub es una aplicación web full-stack diseñada para estudiantes y clubes de lectura. Permite registrar libros, calcular el porcentaje exacto de lectura, separar lecturas entre "Leyendo" y "Terminados", guardar datos en el navegador (`localStorage`) con opción de exportación a JSON y generar automáticamente temas y preguntas de debate mediante la **API de Gemini**.

---

## ✨ Características Principales

1. **Gestión de Lecturas (P0 / M1):**
   - Registro de libros con título, autor, páginas totales y leídas.
   - Cálculo dinámico de progreso en porcentaje.
   - Listas separadas automáticamente en **Leyendo** y **Terminados** al alcanzar el 100%.

2. **Memoria y Privacidad (M2):**
   - Persistencia automática en `localStorage` (sin necesidad de cuentas ni servidores externos).
   - Exportación e importación de respaldos en formato `.json`.
   - Libros de ejemplo precargados (*El Principito* y *Ficciones*).

3. **Diseño Mobile-First (M3):**
   - Adaptado para uso a una mano desde pantallas de 320px.
   - Alto contraste visual y tipografía legible (mínimo 16px).
   - Botón principal de acción accesible en la parte inferior.

4. **Validaciones y Seguridad (M4):**
   - Protección contra títulos vacíos o excesivamente largos.
   - Validación de rangos de páginas (evita números negativos o mayores al total).
   - Detección de libros duplicados y prevención de doble clic.

5. **Moderación Inteligente de Debate (M5):**
   - Integración con `@google/genai` (`gemini-3.8-flash`).
   - Salida estructurada estricta (`responseSchema`): resumen del club, tema central y 3 preguntas clave para debatir.
   - Botones rápidos para copiar preguntas al portapapeles.
   - **Modo Ahorro / Sin conexión:** Permite probar el club con respuestas modelo sin consumir llamadas a la API.

---

## 🚀 Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd leoclub

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para IA real)
cp .env.example .env
# Añade tu GEMINI_API_KEY en el archivo .env si deseas debates en vivo

# 4. Iniciar en modo desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`.

---

## 🛠️ Tecnologías

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Express, Node.js (`server.ts`)
- **IA:** Google Gen AI SDK (`@google/genai`)
- **Build Tool:** Vite
