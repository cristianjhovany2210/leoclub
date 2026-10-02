# 📚 LeoClub

> Registro de lecturas con avance en porcentaje, separación en Leyendo/Terminados y moderación de debate con IA para estudiantes y clubes de lectura.

---

## 1. Probala ahora
- **App publicada en vivo:** [https://ais-pre-by7d2mc3u6vxjxq4xvrzvs-496811166647.us-west1.run.app](https://ais-pre-by7d2mc3u6vxjxq4xvrzvs-496811166647.us-west1.run.app)
- **Repositorio en GitHub:** [https://github.com/cristianjhovany2210/leoclub](https://github.com/cristianjhovany2210/leoclub)
- **Código QR:** `evidencias/qr.png`
- **Usuario de prueba:** No requiere login ni registro previo. Incluye libros de ejemplo precargados (*El Principito* y *Ficciones*).

---

## 2. Capturas

| Inicio (M3 Celular) | En uso (M1 Avance) | Con la IA trabajando (M5) |
|---|---|---|
| `evidencias/E3-celular.png` | `evidencias/E1-despues.png` | `evidencias/E5-app.png` |

---

## 3. Qué hace
- **Función 1:** Registrar libros indicando título, autor, total de páginas y notas personales de lectura.
- **Función 2:** Registrar páginas leídas con cálculo de porcentaje dinámico en tiempo real y controles rápidos (`+1`, `-1`, `+10` o edición manual con lápiz).
- **Función 3:** Separar automáticamente los libros entre las pestañas **"Leyendo"** y **"Terminados"** al alcanzar el 100% de páginas.
- **Función IA:** Generar un resumen conciso, el tema central y 3 preguntas provocadoras para moderar la reunión del club de lectura.

---

## 4. Cómo correrlo en tu máquina

```bash
# 1. Clonar el repositorio
git clone https://github.com/cristianjhovany2210/leoclub.git
cd leoclub

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env
# Si deseas usar debates en vivo con Gemini, añade tu GEMINI_API_KEY en .env
# De lo contrario, puedes usar el "Modo Ahorro / Sin conexión" integrado en la app.

# 4. Iniciar el servidor de desarrollo
npm run dev
```
La aplicación estará disponible de inmediato en `http://localhost:3000`.

---

## 5. Tecnologías
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend:** Express 4, Node.js (`server.ts`).
- **Almacenamiento:** `localStorage` del navegador bajo la clave `leoclub_libros_v1` con respaldo exportable a JSON.
- **Inteligencia Artificial:** SDK oficial `@google/genai` con el modelo `gemini-3.8-flash` y salida estructurada (`responseSchema`).
- **Empaquetado y Build:** Vite 8 con middleware en Express.

---

## 6. La escalera de mejoras

| Peldaño | Qué cambió | Commit | Evidencia |
|---|---|---|---|
| **P0** | Versión inicial generada con IA (3 funciones base) | `5571563` | `evidencias/E0-inicial.png` |
| **M1** | Lista leyendo y terminados con separación reactiva | `21a0d02` | `evidencias/E1-antes.png` / `evidencias/E1-despues.png` |
| **M2** | Persistencia en localStorage, exportar a JSON y libro de ejemplo | `0ca1b2d` | `evidencias/E2-antes.png` / `evidencias/E2-despues.png` |
| **M3** | Experiencia en celular: 320 px, alto contraste y botón fijo inferior | `e086096` | `evidencias/E3-celular.png` / `evidencias/E3-vacio.png` |
| **M4** | Validaciones y robustez contra 10 intentos de rotura | `66b7430` | `evidencias/E4-error.png` |
| **M5** | Inteligencia con Gemini API, JSON estructurado y modo demo | `f7197f7` | `evidencias/E5-json.png` / `evidencias/E5-app.png` / `evidencias/E5-falla.png` |

---

## 7. Prueba con usuarios reales

| Quién | Qué intentó | Dónde se trabó | Lo que dijo, textual | ¿Corregido? |
|---|---|---|---|---|
| **Compañero de clase** | Modificar las páginas leídas de 48 a 70 | Quiso escribir directamente el número en vez de presionar el botón `+1` varias veces | *«¿Tengo que tocar 22 veces el botón de sumar o puedo escribir el 70?»* | **Sí, en M1/M3:** Se añadió un icono de lápiz para edición numérica directa con teclado. |
| **Docente o adulto del centro** | Guardar un libro sin autor | Dejó el campo vacío y la app no le avisaba claramente antes de presionar | *«Pensé que el autor era opcional porque el formulario no me decía nada hasta que falló»* | **Sí, en M4:** Se agregaron etiquetas con asterisco rojo `*` y mensaje claro de validación inline. |
| **Persona ajena al proyecto** | Usar la función de debate sin internet | No tenía conexión y pensó que la app se había quedado trabada | *«Se quedó pensando y no sé si falló o si sigue cargando»* | **Sí, en M5:** Se implementó timeout de 15s y switch de *"Modo ahorro / Ejemplo sin conexión"* con aviso inmediato. |

---

## 8. Declaración de uso de inteligencia artificial
- **Herramienta y modelo:** Google AI Studio (Build), modelo `gemini-3.8-flash`.
- **Qué hizo la IA:** Generó el andamiaje inicial del código, propuso la matriz de 10 pruebas de rotura para M4 y el esquema JSON para el backend en M5.
- **Qué hice yo:** Diseñé los prompts con la plantilla de 6 partes, verifiqué los tipos en TypeScript, programé la sanitización de datos contra corrupción de localStorage, configuré el servidor Express y gestioné el versionado en Git.
- **Qué verifiqué y cómo:** Verifiqué que ninguna clave de API estuviera presente en el bundle del cliente buscando en `dist/`, probé el funcionamiento en un celular real a 320px de ancho y ejecuté pruebas de validación con datos erróneos.
- **Qué corregí de lo que la IA entregó:** La IA inicialmente propuso calcular el porcentaje con decimales flotantes (`33.33333%`); lo corregí con `Math.round()` y añadí límites estrictos (`Math.min` y `Math.max`).

---

## 9. Tarjeta anti-alucinación

| Afirmación de la IA | Cómo la verifiqué | Resultado |
|---|---|---|
| *«`@google/genai` utiliza `SchemaType.OBJECT` para tipar esquemas estructurados»* | Consulté la documentación oficial del SDK `@google/genai` en `/skills/system_skills/gemini_api/SKILL.md` | **Falso:** `SchemaType` está deprecado en la nueva versión y el tipo correcto es `Type.OBJECT`. Lo corregí en `server.ts`. |
| *«`localStorage.clear()` borra únicamente la clave de la app sin tocar otras»* | Consulté la especificación Web Storage API de MDN | **Falso:** `localStorage.clear()` vacía todo el almacenamiento del dominio. Lo corregí usando `localStorage.removeItem('leoclub_libros_v1')`. |
| *«Un input type="number" impide que el usuario pegue caracteres como "e" o símbolos»* | Probé directamente en el navegador ingresando `1e5` en el campo de páginas | **Verdadero pero insuficiente:** El navegador permite la notación científica `e`. Agregué validación con `parseInt(val, 10)` y rechazo explícito de `isNaN`. |

---

## 10. Limitaciones conocidas
- Si el usuario navega en pestaña de incógnito/privada y la cierra, los datos guardados en `localStorage` se restablecen al valor inicial por defecto.
- La generación de debates en vivo con Gemini requiere conexión a internet y una clave válida; si no hay conexión, se activa el modo de prueba modelo.

---

## 11. Próximo paso
- Sincronización en la nube mediante base de datos descentralizada o P2P (como WebRTC o CRDTs) para compartir la lista de lectura en tiempo real con todos los miembros del club.
- Gráficos de velocidad de lectura (páginas leídas por día o minutos promedio por sesión).

---

## 12. Autor
- **Estudiante:** Cristian Jhovany  
- **Sección:** 3.er año · Desarrollo de Software «A»  
- **Instituto:** INDEL  
- **Fecha:** Octubre de 2026  

---

## 13. Licencia
Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
