export const config = {
    runtime: 'edge', // ¡Velocidad máxima!
};

export default async function handler(req) {
    // 1. GESTIÓN DE CORS (Permisos para que funcione en localhost y web)
    // Definimos los permisos
    const headers = {
        'Access-Control-Allow-Origin': '*', // En producción puedes poner tu dominio en lugar de '*'
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Si es una petición OPTIONS (el navegador preguntando permisos), respondemos OK
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    // 2. Solo permitimos POST
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers });
    }

    try {
        // 3. Leemos el mensaje
        const { message } = await req.json();

        // 4. Llave API
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return new Response(JSON.stringify({ error: "Falta API Key en Vercel" }), { status: 500, headers });
        }

        // 5. Petición a Google (REST API Directa)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
        // NOTA: Cambié a 'gemini-1.5-flash' que es más rápido y barato que 'gemini-pro', pero puedes usar el que gustes.

        const requestBody = {
            contents: [{
                parts: [{ text: message }]
            }]
        };

        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await googleResponse.json();

        // Manejo de errores si Google responde mal
        if (!googleResponse.ok) {
            return new Response(JSON.stringify(data), { status: googleResponse.status, headers });
        }

        // 6. Devolvemos la respuesta con los headers correctos
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: headers // Importante devolver los headers aquí también
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}