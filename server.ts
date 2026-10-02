import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Configuración de Gemini API siguiendo directrices oficiales de AI Studio
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 5) Respuesta de ejemplo para desarrollar sin gastar llamadas de API
function getExampleDebate(title: string, author?: string, notes?: string) {
  const safeTitle = title.trim() || 'El libro elegido';
  const safeAuthor = author?.trim() ? ` de ${author.trim()}` : '';
  const hasNotes = Boolean(notes && notes.trim());

  return {
    resumen: hasNotes
      ? `A través de "${safeTitle}"${safeAuthor}, la obra explora el impacto de las decisiones individuales frente a la presión colectiva. Las notas del lector destacan: "${notes?.trim().slice(0, 160)}...".`
      : `"${safeTitle}"${safeAuthor} presenta un recorrido introspectivo donde los personajes se enfrentan a dilemas éticos y transformaciones cruciales, desafiando sus creencias previas.`,
    tema_principal: 'La tensión entre la autonomía personal, la moral y la aceptación social.',
    preguntas: [
      `¿En qué medida las decisiones tomadas por los protagonistas en "${safeTitle}" fueron realmente libres o estuvieron condicionadas por su entorno?`,
      '¿Qué momento del relato consideran que marcó el punto de quiebre ético más desafiante para el lector?',
      'Si tuviéramos que aplicar la moraleja o lección de este libro a una situación actual de nuestras vidas, ¿cuál sería?'
    ] as [string, string, string],
  };
}

// Endpoint estructurado para generar resumen y preguntas de debate (M5)
app.post('/api/debate', async (req: Request, res: Response): Promise<void> => {
  const { title, author, notes, useDemo } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({
      success: false,
      error: 'El título del libro es obligatorio para generar el debate.',
    });
    return;
  }

  // Si el usuario activó explícitamente el modo ejemplo (para no gastar llamadas)
  if (useDemo) {
    const demoData = getExampleDebate(title, author, notes);
    res.json({
      success: true,
      data: demoData,
      isDemo: true,
      notice: 'Respuesta de ejemplo generada sin consumir llamadas a la API.',
    });
    return;
  }

  // Si no hay API key configurada en el entorno
  if (!aiClient || !apiKey) {
    const fallbackDemo = getExampleDebate(title, author, notes);
    res.json({
      success: true,
      data: fallbackDemo,
      isDemo: true,
      notice: 'Modo sin conexión activo: se generó una respuesta modelo de alta calidad.',
    });
    return;
  }

  try {
    // Definición de prompt con contexto del Club de Lectura
    const prompt = `Actúa como un moderador experto de un club de lectura literario ("LeoClub").
Analiza el siguiente libro y las notas u observaciones del lector para generar:
1. Un resumen conciso orientado al club (máximo 3 oraciones).
2. El tema principal o dilema humano de fondo.
3. Exactamente tres preguntas profundas, abiertas y provocadoras para abrir el debate grupal.

Libro: "${title.trim()}"
Autor: ${author ? author.trim() : 'No especificado'}
Notas del lector: ${notes && notes.trim() ? notes.trim() : 'Sin notas adicionales'}`;

    // Schema estructurado estricto conforme a directrices de @google/genai
    const response = await Promise.race([
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resumen: {
                type: Type.STRING,
                description: 'Resumen conciso orientado al debate del club.',
              },
              tema_principal: {
                type: Type.STRING,
                description: 'Tema central o dilema ético/filosófico principal.',
              },
              preguntas: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'Exactamente tres preguntas profundas para debatir.',
              },
            },
            required: ['resumen', 'tema_principal', 'preguntas'],
          },
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 15000)
      ),
    ]);

    const rawText = response.text?.trim() || '';
    if (!rawText) {
      throw new Error('RESPUESTA_VACIA');
    }

    const parsed = JSON.parse(rawText);

    // Validación de esquema
    if (
      typeof parsed.resumen !== 'string' ||
      typeof parsed.tema_principal !== 'string' ||
      !Array.isArray(parsed.preguntas) ||
      parsed.preguntas.length === 0
    ) {
      throw new Error('ESQUEMA_INVALIDO');
    }

    // Asegurar 3 preguntas limpias
    const cleanQuestions = parsed.preguntas
      .slice(0, 3)
      .map((q: unknown) => String(q).trim());

    while (cleanQuestions.length < 3) {
      cleanQuestions.push('¿Qué aprendizaje colectivo nos deja este pasaje de la obra?');
    }

    res.json({
      success: true,
      data: {
        resumen: parsed.resumen.trim(),
        tema_principal: parsed.tema_principal.trim(),
        preguntas: cleanQuestions,
      },
      isDemo: false,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error al generar debate en LeoClub:', err?.message || err);

    // Fallback defensivo para que el usuario nunca se quede bloqueado
    const fallback = getExampleDebate(title, author, notes);

    let clientMessage = 'No se pudo conectar con el servicio inteligente.';
    if (err?.message === 'TIMEOUT_EXCEEDED') {
      clientMessage = 'La consulta tardó más de lo esperado.';
    } else if (err?.message === 'ESQUEMA_INVALIDO') {
      clientMessage = 'La respuesta recibida no cumplió el formato requerido.';
    }

    res.status(200).json({
      success: true,
      data: fallback,
      isDemo: true,
      warning: `${clientMessage} Mostrando versión modelo para que continúe la sesión.`,
    });
  }
});

// Configuración de Vite para modo desarrollo y archivos estáticos en producción
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LeoClub] Servidor iniciado en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LeoClub] Error al iniciar el servidor:', err);
  process.exit(1);
});
