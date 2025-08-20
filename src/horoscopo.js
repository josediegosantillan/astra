// === FUNCIONES DE LÓGICA ===

/*
 * @description Obtiene el signo zodiacal a partir de una fecha de nacimiento.
 * @param {Date} fecha - Objeto de fecha.
 * @returns {string} El nombre del signo zodiacal o "Desconocido".
 * @see https://es.wikipedia.org/wiki/Signo_zodiacal
 */
function obtenerSignoZodiacal(fecha) {
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();

    if ((mes == 3 && dia >= 21) || (mes == 4 && dia <= 19)) return "Aries";
    if ((mes == 4 && dia >= 20) || (mes == 5 && dia <= 20)) return "Tauro";
    if ((mes == 5 && dia >= 21) || (mes == 6 && dia <= 20)) return "Géminis";
    if ((mes == 6 && dia >= 21) || (mes == 7 && dia <= 22)) return "Cáncer";
    if ((mes == 7 && dia >= 23) || (mes == 8 && dia <= 22)) return "Leo";
    if ((mes == 8 && dia >= 23) || (mes == 9 && dia <= 22)) return "Virgo";
    if ((mes == 9 && dia >= 23) || (mes == 10 && dia <= 22)) return "Libra";
    if ((mes == 10 && dia >= 23) || (mes == 11 && dia <= 21)) return "Escorpio";
    if ((mes == 11 && dia >= 22) || (mes == 12 && dia <= 21)) return "Sagitario";
    if ((mes == 12 && dia >= 22) || (mes == 1 && dia <= 19)) return "Capricornio";
    if ((mes == 1 && dia >= 20) || (mes == 2 && dia <= 18)) return "Acuario";
    if ((mes == 2 && dia >= 19) || (mes == 3 && dia <= 20)) return "Piscis";
    return "Desconocido";
}

/**
 * @description Valida los datos esenciales del formulario.
 * @returns {boolean} True si los datos son válidos, de lo contrario False.
 */
function validarDatos() {
    const nombre = document.getElementById('nombre').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;

    if (!nombre) {
        mostrarError('Por favor, ingresa tu nombre completo.');
        return false;
    }

    if (!fechaNacimiento) {
        mostrarError('Por favor, ingresa tu fecha de nacimiento.');
        return false;
    }

    return true;
}

// === ALGORITMOS ASTRONÓMICOS PRECISOS ===

/**
 * @description Calcula datos astronómicos precisos de la Luna usando algoritmos de Jean Meeus
 * @param {Date|string} fecha - Fecha para calcular
 * @returns {Object} Datos astronómicos completos
 */
async function obtenerDatosAstronomicos(fecha) {
    console.log('Iniciando cálculo astronómico para fecha:', fecha);
    
    let fechaCalcular;
    if (typeof fecha === 'string') {
        const partes = fecha.split('-');
        fechaCalcular = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]), 12, 0, 0);
    } else if (fecha instanceof Date) {
        fechaCalcular = fecha;
    } else {
        fechaCalcular = new Date();
    }

    console.log('Fecha para cálculo:', fechaCalcular);

    // Cálculos de fase lunar
    const lunaReferencia = new Date('2025-01-29T12:36:00.000Z');
    const diasDesdeReferencia = (fechaCalcular.getTime() - lunaReferencia.getTime()) / (1000 * 60 * 60 * 24);
    const cicloLunar = 29.530588853;
    const posicionEnCiclo = ((diasDesdeReferencia % cicloLunar) + cicloLunar) % cicloLunar;

    console.log('Días desde referencia:', diasDesdeReferencia);
    console.log('Posición en ciclo:', posicionEnCiclo);

    // Determinar fase
    let fase, iluminacion;
    if (posicionEnCiclo < 1.84566) {
        fase = 'new';
        iluminacion = Math.round((posicionEnCiclo / 1.84566) * 5);
    } else if (posicionEnCiclo < 7.38264) {
        fase = 'waxing_crescent';
        iluminacion = Math.round(5 + ((posicionEnCiclo - 1.84566) / 5.53698) * 45);
    } else if (posicionEnCiclo < 9.22830) {
        fase = 'first_quarter';
        iluminacion = 50;
    } else if (posicionEnCiclo < 14.76529) {
        fase = 'waxing_gibbous';
        iluminacion = Math.round(50 + ((posicionEnCiclo - 9.22830) / 5.53699) * 50);
    } else if (posicionEnCiclo < 16.61095) {
        fase = 'full';
        iluminacion = 100;
    } else if (posicionEnCiclo < 22.14794) {
        fase = 'waning_gibbous';
        iluminacion = Math.round(100 - ((posicionEnCiclo - 16.61095) / 5.53699) * 50);
    } else if (posicionEnCiclo < 23.99360) {
        fase = 'last_quarter';
        iluminacion = 50;
    } else {
        fase = 'waning_crescent';
        iluminacion = Math.round(50 - ((posicionEnCiclo - 23.99360) / 5.53728) * 45);
    }

    console.log('Fase calculada:', fase);
    console.log('Iluminación:', iluminacion);

    // Calcular posición zodiacal usando algoritmo de Meeus
    const jd = fechaAJuliano(fechaCalcular);
    const posicionEcliptica = calcularPosicionLunarEclipticaReal(jd);
    const signoZodiacal = convertirEclipticaASignoZodiacal(posicionEcliptica);
    const signoLunar = signoZodiacal;

    console.log('Posición eclíptica:', posicionEcliptica);
    console.log('Signo zodiacal:', signoZodiacal);

    const resultado = {
        fecha: fechaCalcular.toISOString().split('T')[0],
        hora: fechaCalcular.toTimeString().substring(0, 8),
        fase: fase,
        iluminacion: Math.max(0, Math.min(100, iluminacion)),
        signoZodiacal: signoZodiacal,
        signoLunar: signoLunar,
        proximaFase: calcularProximaFase(posicionEnCiclo, cicloLunar),
        distanciaTierra: Math.round(381600 + Math.sin((posicionEnCiclo / cicloLunar) * 2 * Math.PI) * 25100)
    };

    console.log('Resultado final:', resultado);
    return resultado;
}

function fechaAJuliano(fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    
    let a = Math.floor((14 - mes) / 12);
    let y = año + 4800 - a;
    let m = mes + 12 * a - 3;
    
    return dia + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function calcularPosicionLunarEclipticaReal(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    
    let L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0 - T * T * T * T / 65194000.0;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0 - T * T * T * T / 113065000.0;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
    const M1 = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0;
    const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0;
    
    const D_rad = D * Math.PI / 180;
    const M_rad = M * Math.PI / 180;
    const M1_rad = M1 * Math.PI / 180;
    const F_rad = F * Math.PI / 180;
    
    const correcion = 
        6.288774 * Math.sin(M1_rad) +
        1.274027 * Math.sin(2 * D_rad - M1_rad) +
        0.658314 * Math.sin(2 * D_rad) +
        0.213618 * Math.sin(2 * M1_rad) +
        -0.185116 * Math.sin(M_rad) +
        -0.114332 * Math.sin(2 * F_rad) +
        0.058793 * Math.sin(2 * D_rad - 2 * M1_rad) +
        0.057066 * Math.sin(2 * D_rad - M_rad - M1_rad) +
        0.053322 * Math.sin(2 * D_rad + M1_rad) +
        0.045758 * Math.sin(2 * D_rad - M_rad);
    
    let longitud = L0 + correcion;
    longitud = longitud % 360;
    if (longitud < 0) longitud += 360;
    
    return longitud;
}

function convertirEclipticaASignoZodiacal(longitudEcliptica) {
    const signos = [
        'Aries ♈', 'Tauro ♉', 'Géminis ♊', 'Cáncer ♋',
        'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Escorpio ♏',
        'Sagitario ♐', 'Capricornio ♑', 'Acuario ♒', 'Piscis ♓'
    ];
    
    let longitud = longitudEcliptica % 360;
    if (longitud < 0) longitud += 360;
    
    const indiceSigno = Math.floor(longitud / 30);
    const gradosEnSigno = Math.floor(longitud % 30);
    const minutosEnSigno = Math.floor((longitud % 1) * 60);
    
    const signoNombre = signos[indiceSigno] || signos[0];
    return `${signoNombre} ${gradosEnSigno}°${minutosEnSigno > 0 ? minutosEnSigno + "'" : ''}`;
}

function calcularProximaFase(posicion, ciclo) {
    const fases = [
        { nombre: 'Luna Nueva', posicion: 0 },
        { nombre: 'Cuarto Creciente', posicion: ciclo * 0.25 },
        { nombre: 'Luna Llena', posicion: ciclo * 0.5 },
        { nombre: 'Cuarto Menguante', posicion: ciclo * 0.75 }
    ];

    for (let fase of fases) {
        if (posicion < fase.posicion) {
            const diasHasta = Math.round(fase.posicion - posicion);
            return `${fase.nombre} en ${diasHasta} día${diasHasta !== 1 ? 's' : ''}`;
        }
    }
    
    const diasHasta = Math.round(ciclo - posicion);
    return `Luna Nueva en ${diasHasta} día${diasHasta !== 1 ? 's' : ''}`;
}

function obtenerNombreFase(fase) {
    const nombres = {
        'new': 'Luna Nueva 🌑', 'waxing_crescent': 'Luna Creciente 🌒',
        'first_quarter': 'Cuarto Creciente 🌓', 'waxing_gibbous': 'Gibosa Creciente 🌔',
        'full': 'Luna Llena 🌕', 'waning_gibbous': 'Gibosa Menguante 🌖',
        'last_quarter': 'Cuarto Menguante 🌗', 'waning_crescent': 'Luna Menguante 🌘'
    };
    return nombres[fase] || 'Fase desconocida';
}

// === FUNCIONES DE INTERFAZ DE USUARIO ===

/*
 * @description Muestra un mensaje en el chat con un estilo específico (error o éxito).
 * @param {string} mensaje - El texto a mostrar.
 * @param {string} tipo - 'error' o 'success'.
 */
function mostrarMensaje(mensaje, tipo = 'error') {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    
    if (tipo === 'error') {
        messageDiv.className = 'mb-4 p-4 bg-red-900/50 border border-red-500/30 rounded-lg text-red-200';
        messageDiv.innerHTML = `<strong>⚠️ Error:</strong> ${mensaje}`;
    } else {
        messageDiv.className = 'mb-4 p-4 bg-green-900/50 border border-green-500/30 rounded-lg text-green-200';
        messageDiv.innerHTML = `<strong>✅ Éxito:</strong> ${mensaje}`;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function mostrarError(mensaje) {
    mostrarMensaje(mensaje, 'error');
}

/*
 * @description Agrega un mensaje al chat principal.
 * @param {string} mensaje - El texto del mensaje.
 * @param {boolean} esUsuario - True si el mensaje es del usuario, de lo contrario False.
 */
function agregarMensaje(mensaje, esUsuario = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    
    if (esUsuario) {
        messageDiv.className = 'mb-4 p-4 rounded-2xl bg-purple-600/80 text-white max-w-[85%] ml-auto text-right shadow';
        messageDiv.innerHTML = `<strong>👤 Tú:</strong><br>${mensaje}`;
    } else {
        messageDiv.className = 'mb-4 p-4 rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-300 max-w-[85%] shadow';
        messageDiv.innerHTML = `<strong class="text-purple-300">🌟 AstraLumina:</strong><br>${mensaje}`;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/*
 * @description Parsea y organiza la respuesta astrológica con mejor UX/UI.
 * @param {string} respuesta - La respuesta del modelo de lenguaje.
 */
function agregarRespuestaAstrologica(respuesta) {
    const chatContainer = document.getElementById('chatContainer');
    const responseContainer = document.createElement('div');
    responseContainer.className = 'mb-8 max-w-[100%]';
    
    // Parsear la respuesta por secciones
    const secciones = parsearSecciones(respuesta);
    
    if (secciones.length === 0) {
        // Si no se pudieron parsear secciones, mostrar respuesta completa con mejor formato
        const responseDiv = document.createElement('div');
        responseDiv.className = 'p-2 bg-gradient-to-br from-purple-900/80 via-gray-800/80 to-violet-800/80 backdrop-blur-sm rounded-xl border border-purple-400/30 shadow-xl text-white max-w-[95%] whitespace-pre-line leading-relaxed';
        
        // Formatear el texto simple sin regex complejos
        const textoFormateado = respuesta
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-200 font-semibold">$1</strong>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
            
        responseDiv.innerHTML = textoFormateado;
        responseContainer.appendChild(responseDiv);
    } else {
        // Header del horóscopo
        const header = document.createElement('div');
        header.className = 'bg-gradient-to-r from-purple-600/30 to-violet-600/30 p-2 mx-6 border-b border-purple-400/20';
        header.innerHTML = `
            <div class="flex items-center justify-between mx-3">
                <h3 class="text-xl font-bold text-white flex items-center gap-3">
                    <span class="text-3xl">🌟</span>
                    <span>Tu Lectura Astrológica</span>
                </h3>
                <div class="text-purple-200 text-sm opacity-75">
                    ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        `;
        responseContainer.appendChild(header);
        
        // Container para las secciones
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'p-2 space-y-5';
        secciones.forEach((seccion, index) => {
            const sectionDiv = crearSeccionEstilizada(seccion, index);
            sectionsContainer.appendChild(sectionDiv);
            // Separador entre secciones
            if (index < secciones.length - 1) {
                const divider = document.createElement('div');
                divider.className = 'h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent my-4';
                sectionsContainer.appendChild(divider);
            }
        });
        responseContainer.appendChild(sectionsContainer);
    }
    
    chatContainer.appendChild(responseContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/*
 * @description Parsea la respuesta en secciones identificables.
 * @param {string} respuesta - La respuesta completa del modelo.
 * @returns {Array} Array de objetos con título y contenido de cada sección.
 */
function parsearSecciones(respuesta) {
    const secciones = [];
    const lineas = respuesta.split('\n');
    let seccionActual = null;
    
    // Iconos por defecto para secciones comunes
    const getIcono = (titulo) => {
        const tituloUpper = titulo.toUpperCase();
        if (tituloUpper.includes('SALUDO')) return '👋';
        if (tituloUpper.includes('ENERGÍA') || tituloUpper.includes('CÓSMICA')) return '⚡';
        if (tituloUpper.includes('PANORAMA') || tituloUpper.includes('GENERAL')) return '�';
        if (tituloUpper.includes('AMOR') || tituloUpper.includes('RELACIONES')) return '�';
        if (tituloUpper.includes('CARRERA') || tituloUpper.includes('FINANZAS')) return '�';
        if (tituloUpper.includes('SALUD') || tituloUpper.includes('BIENESTAR')) return '🌿';
        if (tituloUpper.includes('CONSEJO') || tituloUpper.includes('MAESTRO')) return '💎';
        if (tituloUpper.includes('ELEMENTOS') || tituloUpper.includes('MÁGICOS')) return '🌟';
        if (tituloUpper.includes('ANÁLISIS') || tituloUpper.includes('DÍA')) return '📅';
        if (tituloUpper.includes('DÍAS') || tituloUpper.includes('ESPECIALES')) return '⭐';
        return '�'; // Por defecto
    };
    
    lineas.forEach(linea => {
        const lineaTrimmed = linea.trim();
        
        // Buscar títulos en formato **TÍTULO:** o **TÍTULO**:
        const matchTitulo = lineaTrimmed.match(/^\*\*([^*]+)\*\*:?(.*)$/);
        
        if (matchTitulo) {
            // Guardar sección anterior
            if (seccionActual) {
                secciones.push(seccionActual);
            }
            
            const titulo = matchTitulo[1].trim();
            const contenidoInicial = matchTitulo[2] ? matchTitulo[2].trim() : '';
            
            seccionActual = {
                titulo: titulo,
                icono: getIcono(titulo),
                contenido: contenidoInicial ? [contenidoInicial] : []
            };
        } else if (seccionActual && lineaTrimmed) {
            // Agregar contenido a la sección actual
            seccionActual.contenido.push(lineaTrimmed);
        }
    });
    
    // Agregar última sección
    if (seccionActual) {
        secciones.push(seccionActual);
    }
    
    return secciones;
}

/*
 * @description Crea una sección estilizada con mejor UX/UI.
 * @param {Object} seccion - Objeto con título, icono y contenido.
 * @param {number} index - Índice de la sección para animaciones escalonadas.
 * @returns {HTMLElement} Elemento DOM de la sección estilizada.
 */
function crearSeccionEstilizada(seccion, index) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'group transition-all duration-300 ease-out';
    
    // Card container
    const card = document.createElement('div');
    card.className = 'bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl group-hover:border-purple-400/40 transition-all duration-300';
    
    // Header de la sección
    const headerDiv = document.createElement('div');
    headerDiv.className = 'bg-gradient-to-r from-purple-600/25 to-violet-600/25 px-5 py-4 border-b border-gray-600/30';
    
    const titleElement = document.createElement('h4');
    titleElement.className = 'text-lg font-semibold text-white flex items-center gap-3';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-2xl';
    iconSpan.textContent = seccion.icono;
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'text-purple-100 font-bold';
    titleSpan.textContent = seccion.titulo;
    
    titleElement.appendChild(iconSpan);
    titleElement.appendChild(titleSpan);
    headerDiv.appendChild(titleElement);
    
    // Contenido de la sección
    const contentDiv = document.createElement('div');
    contentDiv.className = 'p-5 text-gray-200 leading-relaxed';
    
    const contenidoTexto = seccion.contenido.join(' ').trim();
    
    // Formateo simple y seguro del contenido
    let contenidoFormateado = contenidoTexto
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/- /g, '• ');
    
    // Crear párrafos para mejor legibilidad
    const parrafos = contenidoFormateado.split('. ').filter(p => p.trim());
    if (parrafos.length > 1) {
        contenidoFormateado = parrafos.map(p => {
            if (!p.endsWith('.')) p += '.';
            return `<p class="mb-2">${p}</p>`;
        }).join('');
    } else {
        contenidoFormateado = `<p>${contenidoFormateado}</p>`;
    }
    
    contentDiv.innerHTML = contenidoFormateado;
    
    card.appendChild(headerDiv);
    card.appendChild(contentDiv);
    sectionDiv.appendChild(card);
    
    return sectionDiv;
}

/*
 * @description Muestra u oculta el indicador de carga y deshabilita los botones.
 * @param {boolean} show - True para mostrar, False para ocultar.
 * @param {string} texto - Texto opcional para el indicador de carga.
 */
function toggleLoading(show, texto = 'Consultando las estrellas con IA Gemini...') {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('loadingText').textContent = texto;
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => btn.disabled = show);
}

// === INTERACCIÓN CON LA API ===

/*
 * @description Llama a la API de Google Gemini usando un proxy público para evitar errores de CORS en el navegador.
 * ¡ADVERTENCIA DE SEGURIDAD!: La API Key está hardcodeada aquí. Para producción,
 * siempre se debe manejar la API Key en un servidor backend para evitar exponerla.
 * @param {string} prompt - El texto del prompt para la API.
 * @returns {Promise<string>} La respuesta del modelo.
 * @throws {Error} Si la llamada a la API falla.
 */
async function llamarGeminiAPI(prompt) {
    // El cliente debe construir el payload correcto que espera la API de Gemini.
    // `chat-endpoint.php` simplemente lo reenviará.
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try {
        // Usar el endpoint seguro y una ruta relativa, que es mejor práctica.
        const response = await fetch('../api/chat-endpoint.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            let errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                errorText = errorData.error || errorText;
            } catch (e) {}
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        
        // Debug: mostrar la respuesta completa en consola
        console.log('Respuesta del backend:', data);
        console.log('Candidates:', data.candidates);
        if (data.candidates && data.candidates.length > 0) {
            console.log('Primer candidate:', data.candidates[0]);
        }
        
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            // Verificar si la respuesta se cortó por límite de tokens
            if (candidate.finishReason === 'MAX_TOKENS') {
                console.warn('Respuesta cortada por límite de tokens');
            }
            
            // Intentar extraer el texto incluso si se cortó
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                let text = candidate.content.parts[0].text;
                if (!text || text.trim() === '') {
                    console.warn('Contenido vacío recibido, finishReason:', candidate.finishReason);
                    throw new Error('La IA no pudo generar contenido. Posible filtro de seguridad o prompt muy largo.');
                }
                if (candidate.finishReason === 'MAX_TOKENS') {
                    text += '\n\n[Respuesta cortada por límite de tokens - considera hacer prompts más cortos]';
                }
                return text;
            } else {
                console.error('Estructura de content inesperada:', candidate.content);
                console.error('finishReason:', candidate.finishReason);
                if (candidate.finishReason === 'SAFETY') {
                    throw new Error('La IA bloqueó el contenido por filtros de seguridad. Intenta con un prompt diferente.');
                }
                throw new Error('El contenido no tiene la estructura esperada');
            }
        } else if (data.error) {
            throw new Error(data.error + (data.detalle ? ': ' + data.detalle : ''));
        } else {
            // Mostrar estructura completa si no es lo esperado
            console.error('Estructura inesperada:', data);
            throw new Error('La API no devolvió contenido válido. Ver consola para detalles.');
        }
    } catch (error) {
        throw new Error('Fallo en la conexión con el backend: ' + error.message);
    }
}

// === MANEJADOR PRINCIPAL DE EVENTOS ===

/*
 * @description Función unificada para solicitar horóscopo diario o semanal.
 * @param {string} tipo - 'diario' o 'semanal'.
 */
async function solicitarHoroscopo(tipo) {
    const nombre = document.getElementById('nombre').value.trim();
    const fechaNacimientoInput = document.getElementById('fechaNacimiento').value;
    
    // Validaciones básicas de campos restantes
    if (!nombre) {
        mostrarError('Por favor, ingresa tu nombre completo.');
        return;
    }
    if (!fechaNacimientoInput) {
        mostrarError('Por favor, ingresa tu fecha de nacimiento.');
        return;
    }

    const [year, month, day] = fechaNacimientoInput.split('-').map(Number);
    // Creamos la fecha en la zona local del usuario
    const fechaNacimiento = new Date(year, month - 1, day);
    const horaNacimiento = document.getElementById('horaNacimiento').value;
    const lugarNacimiento = document.getElementById('lugarNacimiento').value.trim();
    const signo = obtenerSignoZodiacal(fechaNacimiento);

    const hoyLocal = new Date();
    const anioActual = hoyLocal.getFullYear();
    const fechaNacimientoAnioActual = new Date(anioActual, fechaNacimiento.getMonth(), fechaNacimiento.getDate());
    let edad = anioActual - fechaNacimiento.getFullYear();
    if (hoyLocal < fechaNacimientoAnioActual) {
        edad--;
    }

    let prompt = '';
    let loadingText = '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    if (tipo === 'diario') {
        const fechaHoy = new Date().toLocaleDateString('es-ES', options);
        const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        // Obtener datos astronómicos precisos
        const datosLunares = await obtenerDatosAstronomicos(new Date());
        
        // Debug: Verificar que los datos se calcularon correctamente
        console.log('Datos lunares calculados:', datosLunares);
        console.log('Fase lunar:', obtenerNombreFase(datosLunares.fase));
        console.log('Signo zodiacal:', datosLunares.signoZodiacal);
        
        agregarMensaje(`Solicito mi horóscopo diario personalizado para hoy (${fechaHoy})`, true);
        loadingText = 'Analizando tu carta astral con IA Gemini...';
        prompt = `Eres AstraLumina, astróloga profesional. Crea un horóscopo diario personalizado.

CONSULTANTE:
• Nombre: ${nombre}
• Edad: ${edad} años  
• Fecha de nacimiento: ${fechaNacimiento.toLocaleDateString('es-ES', options)}
• Signo: ${signo}
${horaNacimiento ? `• Hora nacimiento: ${horaNacimiento}` : ''}
${lugarNacimiento ? `• Lugar: ${lugarNacimiento}` : ''}

DATOS LUNARES HOY (${fechaHoy}):
• Fase: ${obtenerNombreFase(datosLunares.fase)}
• Iluminación: ${datosLunares.iluminacion}%
• Signo lunar: ${datosLunares.signoLunar}
• Próxima fase: ${datosLunares.proximaFase}

Crea un horóscopo personal para ${nombre} (${signo}) usando estos datos lunares reales. Incluye:

**SALUDO PERSONALIZADO:** (dirigido a ${nombre})
**ENERGÍA DEL DÍA:** Influencias de ${signo} y la fase lunar actual
**AMOR:** Predicciones románticas 
**TRABAJO:** Oportunidades profesionales
**SALUD:** Recomendaciones energéticas
**CONSEJO:** Orientación práctica
**ELEMENTOS MÁGICOS:** Números suerte, color, hora favorable

Máximo 250 palabras. Usa emojis y menciona específicamente la fase lunar actual.`;
        
        // Debug: Verificar el prompt completo
        console.log('Prompt completo generado:', prompt);
    } else if (tipo === 'semanal') {
        const diaSemana = hoyLocal.getDay();
        const inicioSemana = new Date(hoyLocal);
        const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
        inicioSemana.setDate(hoyLocal.getDate() + diferencia);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        // Obtener datos astronómicos precisos para la semana
        const datosLunaresHoy = await obtenerDatosAstronomicos(new Date());
        const datosLunaresInicioSemana = await obtenerDatosAstronomicos(inicioSemana);
        const datosLunaresFinSemana = await obtenerDatosAstronomicos(finSemana);

        agregarMensaje(`Solicito mi horóscopo semanal completo (${inicioSemana.toLocaleDateString('es-ES', options)} - ${finSemana.toLocaleDateString('es-ES', options)})`, true);
        loadingText = 'Calculando tránsitos planetarios con IA Gemini...';
        prompt = `Eres AstraLumina, astróloga profesional. Crea un horóscopo semanal personalizado.

CONSULTANTE:
• Nombre: ${nombre}
• Edad: ${edad} años
• Fecha nacimiento: ${fechaNacimiento.toLocaleDateString('es-ES', options)}
• Signo: ${signo}
${horaNacimiento ? `• Hora: ${horaNacimiento}` : ''}
${lugarNacimiento ? `• Lugar: ${lugarNacimiento}` : ''}

DATOS LUNARES SEMANA (${inicioSemana.toLocaleDateString('es-ES', options)} - ${finSemana.toLocaleDateString('es-ES', options)}):
• Inicio: ${obtenerNombreFase(datosLunaresInicioSemana.fase)} - ${datosLunaresInicioSemana.iluminacion}% - ${datosLunaresInicioSemana.signoLunar}
• Hoy: ${obtenerNombreFase(datosLunaresHoy.fase)} - ${datosLunaresHoy.iluminacion}% - ${datosLunaresHoy.signoLunar}
• Fin: ${obtenerNombreFase(datosLunaresFinSemana.fase)} - ${datosLunaresFinSemana.iluminacion}% - ${datosLunaresFinSemana.signoLunar}

Crea horóscopo semanal para ${nombre} (${signo}) usando estos datos lunares reales. Incluye:

**SALUDO PERSONALIZADO:** (a ${nombre})
**PANORAMA GENERAL:** Energías de la semana para ${signo}
**ANÁLISIS DÍA POR DÍA:** Predicciones breves (Lun-Dom)
**AMOR:** Tendencias románticas semanales
**TRABAJO:** Oportunidades profesionales  
**SALUD:** Recomendaciones para la semana
**DÍAS ESPECIALES:** Mejores días y días de precaución
**CONSEJO MAESTRO:** Estrategia energética
**ELEMENTOS MÁGICOS:** Ritual lunar, cristal protector

Máximo 400 palabras. Usa emojis y menciona las fases lunares de la semana.`;
    }

    toggleLoading(true, loadingText);

    try {
        const respuesta = await llamarGeminiAPI(prompt);
        agregarRespuestaAstrologica(respuesta);
    } catch (error) {
        mostrarError(error.message);
    } finally {
        toggleLoading(false);
    }
}

// === INICIALIZACIÓN ===

document.addEventListener('DOMContentLoaded', function() {
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    const hoy = new Date().toISOString().split('T')[0];
    fechaNacimiento.max = hoy;

    fechaNacimiento.addEventListener('change', function() {
        if (this.value) {
            const fecha = new Date(this.value);
            const signo = obtenerSignoZodiacal(fecha);
            mostrarSignoCalculado(signo);
        }
    });
});

function mostrarSignoCalculado(signo) {
    const chatContainer = document.getElementById('chatContainer');
    
    const mensajeSignoAnterior = document.querySelector('.signo-calculado');
    if (mensajeSignoAnterior) {
        mensajeSignoAnterior.remove();
    }

    const signoDiv = document.createElement('div');
    signoDiv.className = 'mb-4 p-4 rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-300 max-w-[85%] shadow signo-calculado';
    signoDiv.innerHTML = `<strong class="text-purple-300">✨ Signo Detectado:</strong><br>He calculado que tu signo zodiacal es <strong class="text-white">${signo}</strong>. Las predicciones se basarán en las energías específicas de este signo y su interacción con los cuerpos celestes actuales.`;
    
    chatContainer.appendChild(signoDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
