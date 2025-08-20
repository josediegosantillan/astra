// Chatbot para AstraLumina - Funcionalidad completa
class AstraLuminaChatbot {
    constructor() {
        this.apiEndpoints = {
            // Unificar para usar el endpoint seguro y robusto
            gemini: '../api/chat-endpoint.php'
        };
    this.currentProvider = 'gemini'; // Proveedor por defecto (Gemini tiene API key funcional)
        this.isTyping = false;
        this.conversationHistory = [];
    this.systemContext = '';
    this.userName = null; // nombre del usuario si lo ingresa
        
        this.init();
    }

    init() {
        // Elementos del DOM
        this.chatLog = document.getElementById('chat-log');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.connectionStatus = document.getElementById('connectionStatus');

        // Event listeners
        this.setupEventListeners();

        // Deshabilitar envío hasta cargar contexto
        if (this.sendButton) this.sendButton.disabled = true;
        if (this.connectionStatus) this.connectionStatus.textContent = 'Cargando contexto...';

        // Cargar contexto desde el backend y luego mostrar bienvenida
        this.loadContext().then(() => {
            if (this.sendButton) this.sendButton.disabled = false;
            if (this.connectionStatus) this.connectionStatus.textContent = 'En línea';
            this.addWelcomeMessage();
        }).catch((err) => {
            console.error('No se pudo cargar contexto:', err);
            // fallback: usar un contexto genérico y permitir envío
            this.systemContext = 'Eres un asistente virtual amigable de AstraLumina.';
            if (this.sendButton) this.sendButton.disabled = false;
            if (this.connectionStatus) this.connectionStatus.textContent = 'En línea (contexto por defecto)';
            this.addWelcomeMessage();
        });

        // Auto-resize del textarea
        this.setupTextareaResize();
    }

    async loadContext() {
        try {
            const res = await fetch('../api/context.php', {cache: 'no-store'});
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            this.systemContext = data.context || '';
            // metadata opcional: truncated, originalLength, maxLength
            this.contextMeta = {
                truncated: data.truncated || false,
                originalLength: data.originalLength || (this.systemContext ? this.systemContext.length : 0),
                maxLength: data.maxLength || null
            };

            // Si el servidor no envió maxLength, aplicar un límite cliente razonable
            if (!this.contextMeta.maxLength) {
                this.contextMeta.maxLength = 6000;
                if (this.systemContext && this.systemContext.length > this.contextMeta.maxLength) {
                    this.systemContext = this.systemContext.slice(0, this.contextMeta.maxLength);
                    this.contextMeta.truncated = true;
                }
            }

            // Mostrar aviso visual si fue truncado
            if (this.contextMeta.truncated) {
                this.showContextTruncatedNotice(this.contextMeta.originalLength, this.contextMeta.maxLength);
            }

            return this.systemContext;
        } catch (e) {
            throw e;
        }
    }

    /* ----------------- helpers para nombre de usuario ----------------- */
    isProbableName(text) {
        if (!text) return false;
        const t = text.trim();
        return t.length > 1 && t.length <= 30 && /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/.test(t);
    }

    extractName(text) {
        if (!text) return null;
        const lower = text.toLowerCase();
        let m = null;
        m = lower.match(/me llamo\s+([a-záéíóúñ\-\s]+)/i);
        if (m && m[1]) return this.ucwords(m[1].trim());
        m = lower.match(/mi nombre es\s+([a-záéíóúñ\-\s]+)/i);
        if (m && m[1]) return this.ucwords(m[1].trim());
        if (this.isProbableName(text)) return this.ucwords(text.trim());
        return null;
    }

    ucwords(s) {
        return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    setUserName(name) {
        this.userName = name;
        try { localStorage.setItem('astralumina_userName', name); } catch (e) { /* noop */ }
    }

    // Función para limpiar el nombre guardado (útil para testing)
    clearUserName() {
        this.userName = null;
        try { localStorage.removeItem('astralumina_userName'); } catch (e) { /* noop */ }
    }


    showContextTruncatedNotice(originalLength, maxLength) {
        try {
            const noticeId = 'context-truncated-notice';
            if (document.getElementById(noticeId)) return;
            const notice = document.createElement('div');
            notice.id = noticeId;
            notice.className = 'absolute left-4 top-14 z-30 px-3 py-2 rounded-md text-sm bg-yellow-700/20 text-yellow-200 border border-yellow-700/30';
            notice.textContent = `Contexto cargado (truncado): ${originalLength} → ${maxLength} caracteres`;
            const header = document.querySelector('main');
            if (header) header.prepend(notice);
            // auto ocultar después de 8s
            setTimeout(() => notice.remove(), 8000);
        } catch (e) {
            // noop
        }
    }

    setupEventListeners() {
        // Envío con botón
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Envío con Enter (pero no Shift+Enter para nueva línea)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Deshabilitar botón si está vacío
        this.userInput.addEventListener('input', () => {
            const isEmpty = this.userInput.value.trim() === '';
            this.sendButton.disabled = isEmpty || this.isTyping;
        });
    }

    setupTextareaResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    addWelcomeMessage() {
        const welcomeLines = [
            '¡Hola! Soy el asistente virtual de AstraLumina 🌟',
            '',
            'Estoy aquí para ayudarte con:',
            '• Consultas sobre tarot, numerología y astrología',
            '• Información sobre nuestros cursos y talleres',
            '• Preguntas sobre crecimiento personal y espiritualidad',
            '• Orientación en tu proceso de autoconocimiento',
            '',
            'Dime tu nombre y comenzamos...'
        ];
        
        // Mostrar cada línea con un pequeño delay sin animaciones
        this.showLinesProgressively(welcomeLines);
    }

    showLinesProgressively(lines) {
        // Crear el contenedor del mensaje del asistente
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex justify-start items-center gap-2 sm:gap-3';
        
        messageDiv.innerHTML = `
            <div class="flex items-center p-2 bg-magenta-200/10 rounded-full flex-shrink-0">
                <img src="../images/brujitaAstraLumina.png"
                     onerror="this.src='https://astralumina.ar/Archivos WP/Imagenes/logoastra.webp'"
                     alt="AstraLumina" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover">
            </div>
            <div class="max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-400/30 backdrop-blur-sm">
                <div class="text-sm sm:text-base text-gray-100 leading-relaxed" id="progressive-content" style="min-height: 120px;"></div>
            </div>`;
        
        this.chatLog.appendChild(messageDiv);
        const contentContainer = messageDiv.querySelector('#progressive-content');
        
        // Función recursiva para mostrar líneas una por una sin cortes
        const showNextLine = (lineIndex) => {
            if (lineIndex >= lines.length) return;
            
            const line = lines[lineIndex];
            const lineElement = document.createElement('div');
            lineElement.style.opacity = '0';
            lineElement.style.transform = 'translateY(4px)';
            // Transición más larga para una aparición muy suave
            lineElement.style.transition = 'opacity 0.9s ease-out, transform 0.9s ease-out';
            
            if (line === '') {
                lineElement.innerHTML = '&nbsp;';
            } else {
                lineElement.innerHTML = this.formatMessage(line);
            }
            
            contentContainer.appendChild(lineElement);
            
            // Transición ultra suave (ligero delay antes de iniciar para evitar parpadeos)
            setTimeout(() => {
                lineElement.style.opacity = '1';
                lineElement.style.transform = 'translateY(0)';
            }, 120);
            
            this.scrollToBottom();
            
            // Mostrar siguiente línea con un intervalo más lento y natural
            setTimeout(() => showNextLine(lineIndex + 1), 600);
        };
        
        // Comenzar con la primera línea
        showNextLine(0);
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isTyping) return;

        // Agregar mensaje del usuario
        this.addMessage('user', message);
        
        // Limpiar input y deshabilitar
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.setTyping(true);

        // Agregar al historial
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Si no tenemos nombre guardado, intentar extraerlo del primer mensaje
        if (!this.userName) {
            const possible = this.extractName(message);
            if (possible) {
                this.setUserName(possible);
                // Mostrar indicador de escritura y esperar un poco para mayor naturalidad
                setTimeout(() => {
                    const reply = `¡Hola, ${possible}! ¡Mucho gusto! 
¿Hay algo en particular que te gustaría explorar? 
Tal vez te interese saber sobre nuestras lecturas de tarot, 
nuestros cursos o algún taller para conectar con tu sabiduría interior. 
Contame, ¿en qué puedo ayudarte?`;
                    this.addMessage('assistant', reply);
                    // Añadir al historial también
                    this.conversationHistory.push({ role: 'assistant', content: reply });
                    this.setTyping(false);
                }, 900); // 900ms de pausa antes de responder
                return; // no llamar a la API en este caso
            }
        }

        try {
            // Enviar a la API
            const response = await this.callAPI(message);
            
            // Agregar respuesta del asistente
            this.addMessage('assistant', response);
            
            // Agregar al historial
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.addMessage('assistant', '❌ Lo siento, hay un problema técnico. Por favor, intenta de nuevo o contacta directamente por WhatsApp:1154106096');
        } finally {
            this.setTyping(false);
        }
    }

    async callAPI(message) {
        // Construir el payload en el formato que espera la API de Gemini
        // `chat-endpoint.php` simplemente lo reenviará.
        const contents = [];

        // 1. (Opcional) Agregar contexto del sistema si existe
        if (this.systemContext) {
            // La API de Gemini no tiene un "system prompt" directo como otros modelos.
            // Se puede simular iniciando la conversación con un turno de usuario/modelo.
            contents.push({ role: 'user', parts: [{ text: `CONTEXTO: ${this.systemContext}` }] });
            contents.push({ role: 'model', parts: [{ text: 'Entendido. Estoy lista para ayudar.' }] });
        }

        // 2. Agregar historial de la conversación
        this.conversationHistory.slice(-10).forEach(turn => {
            contents.push({
                role: turn.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: turn.content }]
            });
        });

        // 3. Agregar el mensaje actual del usuario
        // (El mensaje ya se agrega al historial en sendMessage, por lo que está incluido arriba)

        const payload = { contents };

        // Usar el endpoint unificado
        const endpointUrl = this.apiEndpoints.gemini;

        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                errorText = errorJson.error || 'Error desconocido del servidor.';
            } catch (e) {
                // El texto no era JSON, usarlo directamente
            }
            throw new Error(`Error del servidor (HTTP ${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            throw new Error(`Error de la API: ${data.error.message || JSON.stringify(data.error)}`);
        } else {
            // Manejar el caso de bloqueo por seguridad
            const finishReason = data.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                return '❌ Mi filtro de seguridad bloqueó la respuesta. Por favor, reformula tu pregunta.';
            }
            throw new Error('La respuesta de la API no tuvo un formato válido.');
        }
    }

    addMessage(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} items-center gap-2 sm:gap-3`;

        if (sender === 'assistant') {
            messageDiv.innerHTML = `
                <div class="flex items-center p-2 bg-magenta-200/10 rounded-full flex-shrink-0">
                    <img src="../images/brujitaAstraLumina.png"
                         onerror="this.src='https://astralumina.ar/Archivos WP/Imagenes/logoastra.webp'"
                         alt="AstraLumina" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover">
                </div>

                <div class="max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-400/30 backdrop-blur-sm">
                    <p class="text-sm sm:text-base text-gray-100 leading-relaxed whitespace-pre-wrap">${this.formatMessage(content)}</p>
                </div>`;
        } else {
            messageDiv.innerHTML = `
                <div class="max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-br from-gray-700/60 to-gray-600/60 border border-gray-500/30 backdrop-blur-sm">
                    <p class="text-sm sm:text-base text-gray-100 leading-relaxed whitespace-pre-wrap">${this.escapeHtml(content)}</p>
                </div>`;
        }

        this.chatLog.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Formato básico para el contenido del asistente
        return this.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/•/g, '◦');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setTyping(typing) {
        this.isTyping = typing;
        this.sendButton.disabled = typing || this.userInput.value.trim() === '';
        
        if (typing) {
            this.connectionStatus.textContent = 'Escribiendo...';
            this.connectionStatus.className = 'absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium z-20 bg-yellow-600/30 text-yellow-200 border border-yellow-400/30 backdrop-blur-sm';
            
            // Añadir indicador de escritura
            this.addTypingIndicator();
        } else {
            this.connectionStatus.textContent = 'En línea';
            this.connectionStatus.className = 'absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium z-20 bg-purple-600/30 text-purple-200 border border-purple-400/30 backdrop-blur-sm';
            
            // Remover indicador de escritura
            this.removeTypingIndicator();
        }
    }

    addTypingIndicator() {
        if (document.getElementById('typing-indicator')) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        // Alinear con el estilo de los mensajes del asistente y añadir animación de entrada
        typingDiv.className = 'flex justify-start items-center gap-2 sm:gap-3 message-fade-in';
        typingDiv.innerHTML = `
            <div class="flex items-center p-2 bg-magenta-200/10 rounded-full flex-shrink-0">
                <img src="../images/brujitaAstraLumina.png"
                     onerror="this.src='https://astralumina.ar/Archivos WP/Imagenes/logoastra.webp'"
                     alt="AstraLumina" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover">
            </div>
            <div class="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-400/30 backdrop-blur-sm">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>`;
        this.chatLog.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.chatLog.scrollTop = this.chatLog.scrollHeight;
        });
    }
}

// Inicializar el chatbot cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    new AstraLuminaChatbot();
});
