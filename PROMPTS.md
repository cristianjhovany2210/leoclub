# Bitácora de prompts · LeoClub
**Estudiante:** Cristian Jhovany  
**Sección:** 3.er año · Desarrollo de Software «A» · INDEL  
**Práctica 1:** Del primer prompt a una app que funciona  
**Ejercicio:** N.º 34 · LEO 20 / LeoClub (Lectura y club)

---

## P0 · Prompt cero

**Prompt textual:**
```text
ROL: Sos un desarrollador senior de aplicaciones web.
CONTEXTO: App LeoClub para un estudiante o club de lectura. Problema: cuesta llevar el registro de qué se lee y cuánto se avanzó.
TAREA: Primera versión funcional, con estas tres funciones y nada más:
1. Agregar un libro (título, autor, total de páginas).
2. Registrar páginas leídas y ver el progreso en porcentaje.
3. Lista de libros separada en "Leyendo" y "Terminados".
RESTRICCIONES: en español, sin librerías de pago, sin login, sin base de datos en servidor. Que se vea bien en celular. Código comentado donde alguien pueda equivocarse.
FORMATO: archivos completos con su nombre y, al final, lo que NO hiciste y por qué.
CRITERIO: abro la app, agrego un libro y veo su tarjeta con 0%, sin errores en consola.
```

**Qué devolvió:**  
La arquitectura básica de la aplicación con React y TypeScript, los tipos `Book`, el cálculo inicial de porcentaje `(readPages / totalPages) * 100` y el renderizado condicional de libros en listas separadas.

**Qué acepté:**  
La estructura de componentes modular, la interfaz limpia y los comentarios educativos en las zonas de riesgo (división por cero y mutación de estado).

**Qué corregí a mano:**  
Ajusté el redondeo con `Math.round` y añadí protección de clamp `Math.min(100, Math.max(0, porcentaje))` para evitar que el porcentaje quedara con decimales infinitos.

**Evidencia:** `evidencias/E0-inicial.png`  
**Commit:** `5571563` (`P0: primera version generada con IA`)

---

## M1 · Función (Lista leyendo y terminados)

**Prompt textual:**
```text
La app ya hace agregar libro y registrar páginas con porcentaje. Falta asegurar que el cambio entre la lista de Leyendo y Terminados sea completamente reactivo y automático al llegar al 100% o al reducir páginas.

No reescribas lo que funciona. Dame solo:
1. Fragmentos nuevos con archivo y ubicación.
2. Prueba manual de tres pasos.
3. Qué podría romperse.
```

**Qué devolvió:**  
El uso de `useMemo` en `src/App.tsx` para separar los libros de forma derivada según `readPages < totalPages` vs `readPages >= totalPages`, junto con la prueba manual de 3 pasos y el análisis de riesgos.

**Qué acepté:**  
La lógica reactiva derivada en lugar de mantener un booleano estático redundante en el estado que pudiera desincronizarse.

**Qué corregí a mano:**  
Añadí el botón de atajo rápido "Terminar" en la tarjeta para marcar de un solo toque el 100% de páginas sin tener que presionar el botón `+1` repetidamente.

**Evidencia:** `evidencias/E1-antes.png` y `evidencias/E1-despues.png`  
**Commit:** `21a0d02` (`M1: lista leyendo y terminados`)

---

## M2 · Datos (Persistencia de datos)

**Prompt textual:**
```text
Usá localStorage para que libros y progreso no se pierdan al cerrar. Explicame dónde se guarda, qué pasa si se borra el caché y cómo exportar a JSON. Dame guardar, leer y borrar, y un libro de ejemplo cargado.
```

**Qué devolvió:**  
El módulo `src/utils/storage.ts` con lectura, escritura y borrado en `localStorage['leoclub_libros_v1']`, datos precargados de *El Principito* y *Ficciones*, la explicación técnica del caché vs datos de sitio y la función para descargar y subir un archivo `.json`.

**Qué acepté:**  
El diseño de la función de exportación e importación mediante `Blob` y `FileReader`, y la inicialización perezosa en React `useState(() => loadBooks())`.

**Qué corregí a mano:**  
Envolví la lectura de `localStorage` en un bloque `try/catch` defensivo con saneamiento de campos para que si un dato está incompleto o corrupto, la aplicación no lance pantalla blanca y use los libros de muestra.

**Evidencia:** `evidencias/E2-antes.png` y `evidencias/E2-despues.png`  
**Commit:** `0ca1b2d` (`M2: persistencia de datos`)

---

## M3 · Experiencia (Uso en celular)

**Prompt textual:**
```text
Ajustá la interfaz sin cambiar la lógica: funciona desde 320 px a una mano; contraste alto y texto mínimo 16 px; campos con etiqueta visible; un solo botón principal por pantalla; estado vacío que invite a agregar el primer libro; mensajes de éxito y error en español sin tecnicismos. Decime cuál punto no pudiste cumplir y por qué.
```

**Qué devolvió:**  
Ajustes de Tailwind CSS para viewport estrecho (320px), tipografía mínima de 16px en inputs para evitar zoom automático en iOS Safari, barra de acción fija en la parte inferior accesible con el pulgar, estados vacíos con ilustración y avisos tipo toast en español.

**Qué acepté:**  
El botón principal flotante inferior único (`fixed bottom-0`) y las tarjetas con bordes cálidos y contraste alto (`stone-900` sobre fondos claros).

**Qué corregí a mano:**  
Habilité un botón de lápiz discreto en la tarjeta para editar el número de páginas directamente con teclado numérico sin romper la regla del botón primario único.

**Evidencia:** `evidencias/E3-celular.png` y `evidencias/E3-vacio.png`  
**Commit:** `e086096` (`M3: experiencia de uso en celular`)

---

## M4 · Robustez (Validaciones y manejo de errores)

**Prompt textual:**
```text
Actuá como tester, no como programador. Dame diez formas de romper LeoClub: título vacío, páginas leídas mayores al total, negativos, texto donde va número, título de 500 caracteres, doble clic en guardar, libro repetido. Para cada una: qué pasa hoy, qué debería pasar y el código mínimo que lo evita. Sin cambiar diseño ni agregar funciones.
```

**Qué devolvió:**  
Una matriz exhaustiva de 10 casos de prueba destructiva con sus soluciones mínimas en React y validaciones en tiempo de envío.

**Qué acepté:**  
La limitación de caracteres a 120 para títulos, la detección de títulos y autores duplicados (`trim().toLowerCase()`), y el flag `isSubmitting` que inhabilita el botón de guardar durante el procesamiento para evitar duplicación por clic rápido.

**Qué corregí a mano:**  
Integré las alertas de error de forma accesible con `role="alert"` y textos amigables dentro del propio modal antes de que se cierre.

**Evidencia:** `evidencias/E4-error.png`  
**Commit:** `66b7430` (`M4: validaciones y manejo de errores`)

---

## M5 · Inteligencia (Salida estructurada con IA)

**Prompt textual:**
```text
Integrá la API de Gemini: con el título y mis notas, generar resumen y preguntas para debatir. Requisitos: 1) JSON con responseSchema
{ "resumen": string, "tema_principal": string, "preguntas": [string, string, string] },
2) la app lo muestra como datos, no como párrafo, 3) llave en variable de entorno, 4) manejo de fallo (sin respuesta, lenta o fuera de esquema), 5) respuesta de ejemplo para desarrollar sin gastar llamadas.
```

**Qué devolvió:**  
El endpoint backend `/api/debate` en Express (`server.ts`) con el SDK `@google/genai` utilizando `gemini-3.8-flash` y `Type.OBJECT`, el componente `DebateModal.tsx` con badges y tarjetas para cada pregunta, control de timeout de 15s y el interruptor de modo de ahorro para pruebas offline.

**Qué acepté:**  
El esquema JSON estricto (`responseSchema`), el modo ejemplo inmediato para no agotar la cuota de la API y los botones individuales para copiar cada pregunta al portapapeles.

**Qué corregí a mano:**  
Aseguré que la clave `GEMINI_API_KEY` se lea exclusivamente en el servidor backend y nunca viaje al navegador ni se exponga en la interfaz.

**Evidencia:** `evidencias/E5-json.png`, `evidencias/E5-app.png` y `evidencias/E5-falla.png`  
**Commit:** `f7197f7` (`M5: inteligencia con salida estructurada`)

---

## Cierre de la bitácora

- **Prompts que escribí en total:** 6 prompts principales (P0, M1, M2, M3, M4, M5).
- **El prompt que más me sirvió y por qué:** El prompt de **M4 (actuar como tester)**, porque al pedirle a la IA que pensara como destructora de la app descubrió casos límite (como títulos de 500 caracteres o doble clic accidental) que como desarrollador uno suele pasar por alto.
- **El error más caro que cometí:** Intentar calcular el porcentaje sin redondear ni limitar entre 0 y 100 en P0, lo que provocaba números decimales infinitos cuando el número de páginas era impar.
- **Lo que haría distinto la próxima vez:** Escribir y validar el esquema JSON de la IA (M5) desde el primer diseño de datos para que la base de la aplicación esté preparada para enriquecerse con inteligencia sin refactorizaciones intermedias.
