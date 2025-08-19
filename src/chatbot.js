// Chatbot para AstraLumina - Funcionalidad completa
class AstraLuminaChatbot {
    constructor() {
        this.apiEndpoints = {
            claude: '../api/claude-proxy.php',
            gemini: '../api/gemini-proxy.php'
        };
    this.currentProvider = 'gemini'; // Proveedor por defecto (Gemini tiene API key funcional)
        this.isTyping = false;
        this.conversationHistory = [];
    this.systemContext = '';
        
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
        const welcomeMessage = `¡Hola! Soy el asistente virtual de AstraLumina 🌟

Estoy aquí para ayudarte con:
• Consultas sobre tarot, numerología y astrología
• Información sobre nuestros cursos y talleres
• Preguntas sobre crecimiento personal y espiritualidad
• Orientación en tu proceso de autoconocimiento

¿En qué puedo ayudarte hoy?`;

        this.addMessage('assistant', welcomeMessage);
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
            this.addMessage('assistant', '❌ Lo siento, hay un problema técnico. Por favor, intenta de nuevo o contacta directamente por WhatsApp.');
        } finally {
            this.setTyping(false);
        }
    }

    async callAPI(message) {
        const payload = {
            message: message,
            context: this.systemContext || '',
            history: this.conversationHistory.slice(-10) // Últimas 10 interacciones
        };

        const response = await fetch(this.apiEndpoints[this.currentProvider], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data.response || data.message || 'Lo siento, no pude procesar tu consulta.';
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
        typingDiv.className = 'flex justify-start items-start gap-2 sm:gap-3';
          typingDiv.innerHTML = `
          <img src="../images/LogoAstraLumina.png" 
              onerror="this.src='https://astralumina.ar/Archivos WP/Imagenes/logoastra.webp'" 
              alt="AstraLumina" 
              class="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0">
            <div class="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-400/30 backdrop-blur-sm">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
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
