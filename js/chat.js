document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 1. CONFIGURACIÓN
    // ============================================================
    const HISTORY_KEY = 'chat_obstetricia_prod'; // Clave final
    let recognition;
    const synth = window.speechSynthesis;
    let isVoiceMode = false;
    let voices = [];
    let CONOCIMIENTO_FACULTAD = "";

    // Cargar voces del sistema
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => { voices = synth.getVoices(); };
    }

    // Cargar el archivo de conocimiento (Contexto)
    async function cargarConocimiento() {
        try {
            const res = await fetch('/conocimiento.txt'); 
            if (res.ok) CONOCIMIENTO_FACULTAD = await res.text();
            console.log("Cerebro cargado: " + (CONOCIMIENTO_FACULTAD.length > 0 ? "OK" : "Vacío"));
        } catch (e) { console.error("No se encontró conocimiento.txt", e); }
    }
    cargarConocimiento();

    // ============================================================
    // 2.1. INYECCIÓN DEL HTML
    // ============================================================
    const chatContainer = document.createElement('div');
    
    chatContainer.innerHTML = `
        <button id="chat-toggle-btn" 
            style="background-color: #AA124D !important; border-color: white !important;" 
            class="fixed bottom-6 right-6 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition z-[9999] animate-bounce-slow border-2 cursor-pointer">
            <i class="fas fa-comment-dots"></i>
        </button>

        <div id="chat-window" class="fixed bottom-24 right-4 md:right-6 w-[90%] md:w-96 h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] hidden flex flex-col overflow-hidden transform origin-bottom-right transition-all duration-300 scale-95 opacity-0 font-sans">
            
            <div class="p-4 flex justify-between items-center text-white shrink-0" 
                 style="background-color: #8a0e3d !important;">
                <div class="flex items-center gap-3">
                    <div class="bg-white/10 p-2 rounded-full backdrop-blur-sm"><i class="fas fa-robot text-lg"></i></div>
                    <div>
                        <h4 class="font-bold text-sm">Asistente Obstetricia</h4>
                        <p class="text-xs text-pink-200 flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full inline-block"></span> En línea</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="chat-reset-btn" class="text-white/70 hover:text-red-300 cursor-pointer transition" title="Borrar chat"><i class="fas fa-trash-alt"></i></button>
                    <button id="chat-close-btn" class="text-white/70 hover:text-white cursor-pointer transition"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 min-h-0 scroll-smooth"></div>

            <div class="p-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
                <input type="text" id="chat-input" placeholder="Escribe tu consulta..." class="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-pink-800 outline-none transition text-gray-700">
                
                <button id="mic-btn" class="text-gray-400 hover:text-pink-700 w-10 h-10 flex items-center justify-center transition rounded-full hover:bg-pink-50 cursor-pointer border border-transparent hover:border-gray-200">
                    <i class="fas fa-microphone"></i>
                </button>
                
                <button id="chat-send-btn" 
                        style="background-color: #AA124D !important;" 
                        class="text-white w-10 h-10 rounded-full hover:opacity-90 flex items-center justify-center transition shadow-md hover:scale-105 active:scale-95 cursor-pointer">
                    <i class="fas fa-paper-plane text-xs"></i>
                </button>
            </div>
        </div>

        <style>
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
            .animate-pulse-red { animation: pulseRed 1.5s infinite; background-color: #fee2e2; color: #AA124D; border-color: #fca5a5; }
            @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(170, 18, 77, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(170, 23, 77, 0); } 100% { box-shadow: 0 0 0 0 rgba(157, 23, 77, 0); } }
            #chat-messages::-webkit-scrollbar { width: 6px; }
            #chat-messages::-webkit-scrollbar-track { background: #f1f1f1; }
            #chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
            .typing-dot { width: 6px; height: 6px; background: #888; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        </style>
    `;
    document.body.appendChild(chatContainer);

    // ============================================================
    // 2.2. VARIABLES Y LÓGICA
    // ============================================================
    const chatWindow = document.getElementById('chat-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const micBtn = document.getElementById('mic-btn');

    // ============================================================
    // 3. MEMORIA (Session Storage)
    // ============================================================
    function loadHistory() {
        const history = sessionStorage.getItem(HISTORY_KEY);
        chatMessages.innerHTML = '';
        if (history) {
            JSON.parse(history).forEach(msg => renderMessage(msg.text, msg.type, false));
            scrollBottom();
        } else {
            renderMessage("Hola 👋. Soy el asistente de Obstetricia. ¿En qué puedo ayudarte?", 'bot');
        }
    }
    function saveToHistory(text, type) {
        let history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
        history.push({ text, type });
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    // ============================================================
    // 4. LÓGICA DE ENVÍO (CONEXIÓN API REAL)
    // ============================================================
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Mostrar Usuario
        renderMessage(text, 'user');
        saveToHistory(text, 'user');
        chatInput.value = '';
        if (synth) synth.cancel();

        // 2. Mostrar "Escribiendo..."
        const typingId = showTypingIndicator();

        try {
            // Preparar el prompt con el contexto
            const PROMPT = `
                Actúa como asistente oficial de Obstetricia UNICA.
                CONTEXTO: ${CONOCIMIENTO_FACULTAD || "Sin datos de contexto disponibles."}
                INSTRUCCIONES: Responde de forma amable y breve (máximo 2 párrafos).
                PREGUNTA USUARIO: ${text}
            `;

            // --- LLAMADA AL BACKEND REAL ---
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: PROMPT }) 
            });

            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            
            // Adaptar según tu respuesta JSON (Ajusta esto si tu backend devuelve otra cosa)
            let botReply = "No pude procesar la respuesta.";
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                botReply = data.candidates[0].content.parts[0].text; // Estructura Gemini
            } else if (data.result) {
                botReply = data.result; // Estructura genérica
            } else if (data.reply) {
                botReply = data.reply;
            }

            removeTypingIndicator(typingId);
            
            // 3. Mostrar Bot y Guardar
            renderMessage(botReply, 'bot');
            saveToHistory(botReply, 'bot');

            // 4. Hablar (Si estaba activado por voz)
            if (isVoiceMode) {
                speakText(botReply);
                isVoiceMode = false;
            }

        } catch (error) {
            console.error("Error API:", error);
            removeTypingIndicator(typingId);
            const errorMsg = "⚠️ Error conectando con el servidor. Verifica que el Backend esté corriendo.";
            renderMessage(errorMsg, 'bot');
            saveToHistory(errorMsg, 'bot');
        }
    }

    // ============================================================
    // 5. RENDERIZADO VISUAL
    // ============================================================
    function renderMessage(text, type, animate = true) {
        const div = document.createElement('div');
        const isUser = type === 'user';
        div.className = `flex gap-2 items-start ${isUser ? 'justify-end' : ''} ${animate ? 'animate-fade-in-up' : ''}`;
        
        
        const formatText = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
            .replace(/\n/g, '<br>');             

        div.innerHTML = isUser 
            ? `<div style="background-color: #AA124D !important;" class="text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-md break-words">${formatText}</div>`
            : `<div class="bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm break-words">${formatText}</div>`;
        
        chatMessages.appendChild(div);
        scrollBottom();
    }
    
    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex gap-2 items-start animate-fade-in-up';
        div.innerHTML = `<div class="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
        chatMessages.appendChild(div);
        scrollBottom();
        return id;
    }
    function removeTypingIndicator(id) { const el = document.getElementById(id); if(el) el.remove(); }
    function scrollBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }

    // ============================================================
    // 6. MICRÓFONO Y AUDIO 
    // ============================================================
    function speakText(text) {
        if (!synth) return;
        const cleanText = text.replace(/[*#_]/g, ''); 
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-US'; 
        const preferredVoice = voices.find(v => v.lang.includes('es') && v.name.includes('Google'));
        if (preferredVoice) utterance.voice = preferredVoice;
        synth.speak(utterance);
    }

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.lang = 'es-PE'; 
        recognition.continuous = false; 
        recognition.interimResults = false; 

        recognition.onstart = () => {
            isVoiceMode = true;
            micBtn.classList.add('animate-pulse-red');
            chatInput.placeholder = "Te escucho...";
        };
        recognition.onend = () => {
            micBtn.classList.remove('animate-pulse-red');
            chatInput.placeholder = "Escribe tu consulta...";
            if (chatInput.value.trim().length > 0) sendMessage();
        };
        recognition.onresult = (e) => {
            chatInput.value = e.results[0][0].transcript;
        };
        recognition.onerror = (e) => {
            micBtn.classList.remove('animate-pulse-red');
            console.log("Mic Error:", e.error); 
            if(e.error === 'not-allowed') alert("Permiso de micrófono denegado.");
        };

        micBtn.addEventListener('click', () => {
            try { recognition.start(); } catch(e) {}
        });
    } else {
        micBtn.style.display = 'none';
    }

    // Listeners UI
    document.getElementById('chat-toggle-btn').addEventListener('click', () => {
        chatWindow.classList.remove('hidden', 'scale-95', 'opacity-0');
        chatWindow.classList.add('scale-100', 'opacity-100');
    });
    document.getElementById('chat-close-btn').addEventListener('click', () => {
        chatWindow.classList.add('scale-95', 'opacity-0');
        setTimeout(() => chatWindow.classList.add('hidden'), 300);
    });
    document.getElementById('chat-reset-btn').addEventListener('click', () => {
        sessionStorage.removeItem(HISTORY_KEY);
        loadHistory();
    });
    document.getElementById('chat-send-btn').addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    loadHistory();
});