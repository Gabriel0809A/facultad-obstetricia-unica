export const config = {
    runtime: 'edge', // Esto hace que responda rapidísimo
};

export default async function handler(req) {
    // 1. Solo permitimos que tu propia página nos envíe datos (POST)
    if (req.method !== 'POST') {
        return new Response('Método no permitido', { status: 405 });
    }

    try {
        // 2. Leemos el mensaje que envía tu página web
        const { message } = await req.json();

        // 3. Recuperamos la llave maestra de la caja fuerte de Vercel
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return new Response(JSON.stringify({ error: "Error de configuración: Falta API Key en el servidor" }), { status: 500 });
        }

        // 4. Preparamos la carta para Google Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: message // Aquí va todo: tu instrucción de "Experto en Obstetricia", el archivo de texto y la pregunta
                }]
            }]
        };

        // 5. Enviamos la carta a Google
        const googleResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await googleResponse.json();

        // 6. Devolvemos la respuesta limpia a tu página
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}