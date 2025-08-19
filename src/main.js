// =============================================================================
// ASTRALUMINA - MAIN JAVASCRIPT FILE
// Archivo JavaScript principal que combina toda la funcionalidad
// =============================================================================

// =============================================================================
// MOBILE NAVBAR FUNCTIONALITY
// =============================================================================
function initMobileNavbar() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}
// =============================================================================
// para el efecto de las estrellas y el fondo en donde la magia sucede
// =============================================================================

// Efectos visuales avanzados UX/UI
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Animaciones de scroll optimizadas
    const observerOptions = {
        threshold: 0.15, // Aumentado para activar menos elementos
        rootMargin: '0px 0px -30px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Dejar de observar el elemento una vez que es visible (optimización)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos con un delay para no bloquear el hilo principal
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }, 100);
    
    // 3. Efecto parallax optimizado con throttling
    let ticking = false;
    let lastScrollY = 0;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        // Solo actualizar si el scroll cambió significativamente (throttling manual)
        if (Math.abs(scrolled - lastScrollY) < 5) {
            ticking = false;
            return;
        }
        
        lastScrollY = scrolled;
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        if (parallaxElements.length > 0) {
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.05; // Reducido aún más para menos cálculos
                element.style.transform = `translate3d(0, ${rate}px, 0)`; // Uso de translate3d para aceleración por hardware
            });
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    // 5. Efecto de typewriter para textos especiales
    function typewriterEffect(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Efecto parallax con throttling mejorado
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
            scrollTimeout = null;
        }, 16); // ~60fps
    }, { passive: true });
    
    // Optimización de memoria - limpiar observers antes de salir
    window.addEventListener('beforeunload', () => {
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            if (observer) observer.unobserve(element);
        });
    });
    
    // 7. Efecto de ondas al hacer clic
    function createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            animation: ripple 1s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Añadir efecto de ondas a todos los botones
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });

    // stars now implemented via CSS pseudo-elements for performance
    
});

// Estilo CSS para el efecto ripple
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// =============================================================================
// CAROUSEL FUNCTIONALITY
// =============================================================================
class SimpleCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = document.querySelectorAll('#carousel-container > div').length;
        this.container = document.getElementById('carousel-container');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        if (this.container && this.prevBtn && this.nextBtn && this.totalSlides > 0) {
            this.init();
        }
    }
    
    init() {
        // Event listeners para los botones
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    updateCarousel() {
        const translateX = -this.currentSlide * 100;
        this.container.style.transform = `translateX(${translateX}%)`;
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }
    
    previousSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }
}

// =============================================================================
// RESERVATION MODAL FUNCTIONALITY
// =============================================================================
function initReservationModal() {
    // Crear el modal HTML dinámicamente
    const modalHTML = `
    <div id="reservaModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            
            <!-- Header del Modal -->
            <div class="bg-gradient-to-r from-primary-500 to-violet-500 px-6 py-4 flex items-center justify-between">
                <h2 class="text-white text-xl font-bold">Reservar</h2>
                <button id="closeModal" class="text-white hover:text-gray-200 transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <!-- Contenido del Modal -->
            <div class="p-6">
                
                <!-- Selección de Fecha -->
                <div class="mb-6">
                    <h3 class="text-gray-800 font-semibold mb-4">Selecciona la fecha</h3>
                    
                    <!-- Navegación del Calendario -->
                    <div class="flex items-center justify-between mb-4">
                        <button id="prevMonth" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <i class="fas fa-chevron-left text-gray-600"></i>
                        </button>
                        <h4 id="currentMonth" class="font-semibold text-gray-800">Jul 2024</h4>
                        <button id="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>
                    </div>

                    <!-- Días de la Semana -->
                    <div class="grid grid-cols-7 gap-1 mb-2">
                        <div class="text-center text-sm font-medium text-gray-500 py-2">S</div>
                        <div class="text-center text-sm font-medium text-gray-500 py-2">M</div>
                        <div class="text-center text-sm font-medium text-gray-500 py-2">T</div>
                        <div class="text-center text-sm font-medium text-gray-500 py-2">W</div>
                        <div class="text-center text-sm font-medium text-gray-500 py-2">T</div>
                        <div class="text-center text-sm font-medium text-gray-500 py-2">F</div>
                        <div class="text-center text-sm font-medium text-gray-500 py-2">S</div>
                    </div>

                    <!-- Calendario -->
                    <div class="grid grid-cols-7 gap-1" id="calendar">
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">1</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">2</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">3</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">4</button>
                        <button class="calendar-day selected bg-primary-500 text-white p-2 text-sm rounded-lg">5</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">6</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">7</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">8</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">9</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">10</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">11</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">12</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">13</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">14</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">15</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">16</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">17</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">18</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">19</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">20</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">21</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">22</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">23</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">24</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">25</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">26</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">27</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">28</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">29</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">30</button>
                        <button class="calendar-day p-2 text-sm text-gray-800 hover:bg-primary-100 rounded-lg transition-colors">31</button>
                    </div>
                </div>

                <!-- Selección de Hora -->
                <div class="mb-6">
                    <h3 class="text-gray-800 font-semibold mb-4">Selecciona la hora</h3>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer time-slot" data-time="10:00">
                            <div class="text-gray-600 font-medium">10:00 AM</div>
                            <div class="text-gray-500 text-sm">Juan</div>
                        </div>

                        <div class="flex items-center justify-between p-3 border-2 border-primary-500 bg-primary-50 rounded-lg cursor-pointer time-slot selected" data-time="11:00">
                            <div class="text-primary-800 font-medium">11:00 AM</div>
                            <div class="text-primary-600 text-sm font-medium">Sofia</div>
                        </div>

                        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer time-slot" data-time="12:00">
                            <div class="text-gray-600 font-medium">12:00 PM</div>
                            <div class="text-gray-500 text-sm">Maria</div>
                        </div>
                    </div>
                </div>

                <!-- Botón de Confirmación -->
                <button id="confirmarReserva" class="w-full bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-600 hover:to-violet-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    <i class="fas fa-check-circle mr-2"></i>
                    Confirmar reserva
                </button>
            </div>
        </div>
    </div>
    `;

    // Agregar el modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Configurar event listeners
    const modal = document.getElementById('reservaModal');
    const closeBtn = document.getElementById('closeModal');
    const confirmarBtn = document.getElementById('confirmarReserva');

    // Función para abrir modal
    window.openReservaModal = function() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    };

    // Función para cerrar modal
    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Selección de días del calendario
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            calendarDays.forEach(d => {
                d.classList.remove('selected', 'bg-primary-500', 'text-white');
                d.classList.add('hover:bg-primary-100');
            });
            
            this.classList.add('selected', 'bg-primary-500', 'text-white');
            this.classList.remove('hover:bg-primary-100');
        });
    });

    // Selección de horarios
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            timeSlots.forEach(s => {
                s.classList.remove('selected', 'border-primary-500', 'bg-primary-50');
                s.classList.add('border-gray-200');
                s.querySelector('div:first-child').classList.remove('text-primary-800');
                s.querySelector('div:first-child').classList.add('text-gray-600');
                const specialist = s.querySelector('div:last-child');
                specialist.classList.remove('text-primary-600', 'font-medium');
                specialist.classList.add('text-gray-500');
            });
            
            this.classList.add('selected', 'border-primary-500', 'bg-primary-50');
            this.classList.remove('border-gray-200');
            this.querySelector('div:first-child').classList.add('text-primary-800');
            this.querySelector('div:first-child').classList.remove('text-gray-600');
            const specialist = this.querySelector('div:last-child');
            specialist.classList.add('text-primary-600', 'font-medium');
            specialist.classList.remove('text-gray-500');
        });
    });

    // Confirmar reserva
    confirmarBtn.addEventListener('click', function() {
        const selectedDay = document.querySelector('.calendar-day.selected');
        const selectedTime = document.querySelector('.time-slot.selected');
        
        if (selectedDay && selectedTime) {
            const day = selectedDay.textContent;
            const time = selectedTime.dataset.time;
            const specialist = selectedTime.querySelector('div:last-child').textContent;
            
            alert(`¡Reserva confirmada! ✨\n\nFecha: ${day} Jul 2024\nHora: ${time}\nEspecialista: ${specialist}\n\nTe contactaremos pronto para confirmar los detalles.`);
            closeModal();
        } else {
            alert('Por favor selecciona una fecha y hora');
        }
    });

    // Agregar event listeners a todos los botones de reserva
    const reservaButtons = document.querySelectorAll('[data-action="reservar"]');
    reservaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.openReservaModal();
        });
    });
}

// ============================================================================
// CONTACT FORM FUNCTIONALITY
// ==========================================================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const messageContainer = document.getElementById('messageContainer');
    
    if (!contactForm || !messageContainer) {
        return; // Si no existen los elementos, no hacer nada
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita el envío normal del formulario
        
        const form = this;
        const messageTitle = document.getElementById('messageTitle');
        const messageText = document.getElementById('messageText');
        const messageIcon = document.getElementById('messageIcon');
        const successIcon = document.getElementById('successIcon');
        const errorIcon = document.getElementById('errorIcon');
        const sentData = document.getElementById('sentData');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Obtener los datos del formulario
        const formData = new FormData(form);
        const nombre = formData.get('entry.232402524');
        const email = formData.get('entry.1697003648');
        const mensaje = formData.get('entry.2140827887');
        
        // Deshabilitar el botón de envío
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        // Enviar el formulario usando fetch
        fetch(form.action, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Necesario para Google Forms
        })
        .then(() => {
            // Configurar mensaje de éxito - Usando colores purple/violet coherentes
            messageContainer.className = 'w-80 max-w-md mx-auto';
            messageContainer.firstElementChild.className = 'p-6 rounded-xl border backdrop-blur-sm shadow-lg bg-purple-600/10 border-purple-500/30';
            messageIcon.className = 'w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r from-purple-500 to-violet-600';
            messageTitle.className = 'text-lg font-semibold text-purple-200';
            messageTitle.textContent = '¡Mensaje Enviado!';
            messageText.className = 'text-center mb-4 text-purple-200';
            messageText.textContent = 'Tu consulta ha sido enviada exitosamente. Te contactaremos pronto a través del correo proporcionado.';
            
            // Mostrar iconos apropiados
            successIcon.classList.remove('hidden');
            successIcon.className = 'w-6 h-6 text-white';
            errorIcon.classList.add('hidden');
            
            // Mostrar datos enviados
            document.getElementById('sentName').textContent = nombre;
            document.getElementById('sentEmail').textContent = email;
            document.getElementById('sentMessage').textContent = mensaje.length > 100 ? mensaje.substring(0, 100) + '...' : mensaje;
            sentData.classList.remove('hidden');
            sentData.className = 'border-purple-500/20';
            
            // Estilo del botón cerrar - colores purple coherentes
            document.getElementById('closeMessage').className = 'mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 opacity-75 hover:opacity-100 bg-purple-600/20 text-purple-200 border border-purple-500/30 hover:bg-purple-600/30';
            
            messageContainer.classList.remove('hidden');
            
            // Ocultar el formulario con animación
            contactForm.style.opacity = '0';
            contactForm.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                contactForm.classList.add('hidden');
            }, 300);
            
            // Limpiar el formulario
            form.reset();
        })
        .catch(() => {
            // Configurar mensaje de error - Mejorando contraste
            messageContainer.className = 'w-80 max-w-md mx-auto';
            messageContainer.firstElementChild.className = 'p-6 rounded-xl border backdrop-blur-sm shadow-lg bg-red-600/15 border-red-500/40';
            messageIcon.className = 'w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-red-500';
            messageTitle.className = 'text-lg font-semibold text-red-300';
            messageTitle.textContent = 'Error al Enviar';
            messageText.className = 'text-center mb-4 text-red-300';
            messageText.textContent = 'Hubo un problema al enviar tu mensaje. Por favor, verifica tu conexión e intenta nuevamente.';
            
            // Mostrar iconos apropiados
            errorIcon.classList.remove('hidden');
            errorIcon.className = 'w-6 h-6 text-white';
            successIcon.classList.add('hidden');
            
            // Ocultar datos enviados en caso de error
            sentData.classList.add('hidden');
            
            // Estilo del botón cerrar - error
            document.getElementById('closeMessage').className = 'mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 opacity-75 hover:opacity-100 bg-red-600/20 text-red-300 border border-red-500/40 hover:bg-red-600/30';
            
            messageContainer.classList.remove('hidden');
            
            // Ocultar el formulario con animación (también en caso de error)
            contactForm.style.opacity = '0';
            contactForm.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                contactForm.classList.add('hidden');
            }, 300);
        })
        .finally(() => {
            // Rehabilitar el botón de envío
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Mensaje';
        });
    });
    
    // Manejo del botón cerrar mensaje
    const closeMessage = document.getElementById('closeMessage');
    if (closeMessage) {
        closeMessage.addEventListener('click', function() {
            // Ocultar mensaje
            messageContainer.classList.add('hidden');
            
            // Mostrar formulario nuevamente con animación
            contactForm.classList.remove('hidden');
            setTimeout(() => {
                contactForm.style.opacity = '1';
                contactForm.style.transform = 'translateY(0)';
            }, 50);
        });
    }
    
    // Auto-ocultar mensaje después de 10 segundos
    function autoHideMessage() {
        setTimeout(() => {
            if (!messageContainer.classList.contains('hidden')) {
                // Ocultar mensaje
                messageContainer.classList.add('hidden');
                
                // Mostrar formulario nuevamente con animación
                contactForm.classList.remove('hidden');
                setTimeout(() => {
                    contactForm.style.opacity = '1';
                    contactForm.style.transform = 'translateY(0)';
                }, 50);
            }
        }, 10000);
    }
    
    // Activar auto-ocultar cuando se muestre un mensaje
    const observar = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (!messageContainer.classList.contains('hidden')) {
                    autoHideMessage();
                }
            }
        });
    });
    
    observar.observe(messageContainer, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile navbar
    initMobileNavbar();
    
    // Initialize carousel (only if elements exist)
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
        new SimpleCarousel();
    }
    
    // Initialize reservation modal
    initReservationModal();
    
    // Initialize contact form
    initContactForm();
    
    console.log('🌟 AstraLumina JavaScript initialized successfully!');
});
