
    // JavaScript para el select personalizado
    document.addEventListener('DOMContentLoaded', function() {
        const customSelect = document.getElementById('customSelect');
        const hiddenSelect = document.getElementById('hiddenSelect');
        const selectTrigger = customSelect.querySelector('.select-trigger');
        const selectText = selectTrigger.querySelector('.select-text');
        const selectOptions = customSelect.querySelector('.select-options');
        const options = selectOptions.querySelectorAll('.option');

        // Abrir/cerrar dropdown
        selectTrigger.addEventListener('click', function() {
            const isOpen = selectOptions.classList.contains('hidden');
            if (isOpen) {
                selectOptions.classList.remove('hidden');
                selectTrigger.setAttribute('aria-expanded', 'true');
            } else {
                selectOptions.classList.add('hidden');
                selectTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Manejar selección de opciones (usar utilidades Tailwind para estado seleccionado)
        options.forEach(function(option) {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const text = this.textContent;

                // Actualizar texto mostrado
                selectText.textContent = text;
                selectText.classList.remove('text-gray-400');
                selectText.classList.add('text-white');

                // Actualizar select oculto
                hiddenSelect.value = value;

                // Actualizar estado visual de las opciones usando clases Tailwind
                // Mantener texto claro en todas las opciones; resaltar solo la seleccionada
                options.forEach(function(opt) {
                    opt.classList.remove('bg-gradient-to-r','from-purple-700','to-violet-600','ring-1','ring-purple-400/40','font-medium');
                    opt.classList.add('text-white');
                });
                this.classList.add('bg-gradient-to-r','from-purple-700','to-violet-600','ring-1','ring-purple-400/40','font-medium');

                // Cerrar dropdown
                selectOptions.classList.add('hidden');
                selectTrigger.setAttribute('aria-expanded', 'false');
                
                // Disparar evento change en el select oculto
                const changeEvent = new Event('change', { bubbles: true });
                hiddenSelect.dispatchEvent(changeEvent);
            });
        });

        // Cerrar dropdown cuando se hace click fuera
        document.addEventListener('click', function(e) {
            if (!customSelect.contains(e.target)) {
                selectOptions.classList.add('hidden');
                selectTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Soporte de teclado
        selectTrigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectTrigger.click();
            } else if (e.key === 'Escape') {
                selectOptions.classList.add('hidden');
                selectTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    
    (function(){
        document.addEventListener('DOMContentLoaded', function(){
            var form = document.getElementById('contactForm');
            if(!form) return;

            var successBox = document.getElementById('contactSuccess');
            var contactWrapper = form.closest('div');
            var contactNew = document.getElementById('contactNew');
            var formTitle = document.querySelector('.inscripcion h2');
            var spinner = document.getElementById('contactSpinner');
            var submittedData = document.getElementById('submittedData');
            var submitting = false;

            // Asegurar que el form postee al iframe oculto para evitar navegación
            form.setAttribute('target', 'submitFrame');

            // Al enviar: mostrar spinner, capturar datos y después de unos segundos mostrar los datos
            form.addEventListener('submit', function(e){
                try{
                    var fd = new FormData(form);
                    var data = {
                        nombre: fd.get('entry.2005620554') || '',
                        email: fd.get('entry.1045781291') || '',
                        telefono: fd.get('entry.1166974658') || '',
                        lugar: fd.get('entry.1065046570') || '',
                        curso: fd.get('entry.873280510') || '',
                        mensaje: fd.get('entry.839337160') || ''
                    };

                    // ocultar título visualmente (sin colapsar) y mostrar spinner overlay
                    if(formTitle) formTitle.classList.add('opacity-0');
                    if(spinner){
                        spinner.classList.remove('invisible','opacity-0','pointer-events-none');
                        spinner.setAttribute('aria-hidden','false');
                        // mover foco al overlay para accesibilidad (annuncia el role=status)
                        spinner.focus({ preventScroll: true });
                    }

                    // deshabilitar botones submit para evitar reenvíos
                    var submitBtns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
                    submitBtns.forEach(function(b){ b.disabled = true; b.classList.add('opacity-60','cursor-not-allowed'); });

                    submitting = true;

                    // Mostrar spinner unos segundos y luego mostrar los datos y la caja de éxito
                    setTimeout(function(){
                        if(spinner){
                            spinner.classList.add('invisible','opacity-0','pointer-events-none');
                            spinner.setAttribute('aria-hidden','true');
                        }

                        if(submittedData){
                            submittedData.innerHTML = '' +
                                '<div class="bg-gradient-to-br from-purple-700/5 to-violet-800/3 p-4 rounded-lg border border-purple-600/10 shadow-inner opacity-0 translate-y-2 transition-all duration-300">' +
                                    '<div class="space-y-4">' +
                                        
                                        '<div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-2 py-1 border-b border-purple-600/8">' +
                                            '<div class="w-auto text-purple-100 font-semibold text-sm sm:text-base">Nombre: </div>' +
                                            '<div class="w-full sm:flex-1 text-white text-sm sm:text-base sm:text-left break-words">' + escapeHtml(data.nombre) + '</div>' +
                                        '</div>' +
                                        
                                        '<div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 py-1 border-b border-purple-600/8">' +
                                            '<div class="w-auto text-purple-100 font-semibold text-sm sm:text-base">Correo: </div>' +
                                            '<div class="w-full sm:flex-1 text-white text-sm sm:text-base sm:text-left break-words">' + escapeHtml(data.email) + '</div>' +
                                        '</div>' +
                                        '<div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 py-1 border-b border-purple-600/8">' +
                                            '<div class="w-auto text-purple-100 font-semibold text-sm sm:text-base">Teléfono: </div>' +
                                            '<div class="w-full sm:flex-1 text-white text-sm sm:text-base sm:text-left break-words">' + escapeHtml(data.telefono) + '</div>' +
                                        '</div>' +
                                        '<div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 py-1 border-b border-purple-600/8">' +
                                                '<div class="w-auto text-purple-100 font-semibold text-sm sm:text-base">Lugar: </div>' +
                                                '<div class="w-full sm:flex-1 text-white text-sm sm:text-base sm:text-left break-words">' + escapeHtml(data.lugar) + '</div>' +
                                            '</div>' +
                                            '<div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 py-1 border-b border-purple-600/8">' +
                                                '<div class="w-auto text-purple-100 font-semibold text-sm sm:text-base">Curso: </div>' +
                                                '<div class="w-full sm:flex-1 text-white text-sm sm:text-base sm:text-left break-words">' + escapeHtml(data.curso) + '</div>' +
                                        '</div>' +
                                        '<div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 py-1">' +
                                            '<div class="w-auto text-purple-100 font-semibold text-sm sm:text-base">Mensaje: </div>' +
                                            '<div class="w-full sm:flex-1 text-white text-sm sm:text-base sm:text-left break-words">' + escapeHtml(data.mensaje) + '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';

                            // Animar la entrada de los datos
                            var innerWrap = submittedData.querySelector('div');
                            if(innerWrap){
                                // forzar reflow y luego remover clases de inicio para animar
                                void innerWrap.offsetWidth;
                                innerWrap.classList.remove('opacity-0','translate-y-2');
                            }
                        }

                        if(successBox){
                            successBox.classList.remove('hidden');
                            // animar aparición
                            setTimeout(function(){ successBox.classList.remove('opacity-0'); successBox.classList.remove('scale-95'); }, 20);
                        }

                        if(contactWrapper){
                            var theForm = contactWrapper.querySelector('form');
                            if(theForm) theForm.style.display = 'none';
                        }

                        submitting = false;
                    }, 4000); // duración del spinner en ms

                    // permitir que el formulario siga con el envío al iframe (no preventDefault)
                }catch(err){
                    console.error('Error manejando el envío:', err);
                }
            });

            // Si el iframe carga (respuesta del POST), mostramos confirmación si no está ya mostrada
            var iframe = document.getElementById('submitFrame');
            if(iframe){
                iframe.addEventListener('load', function(){
                    // si todavía estamos en el periodo de "submitting" dejamos que el timeout lo maneje
                    if(submitting) return;
                    if(successBox){
                        successBox.classList.remove('hidden');
                        setTimeout(function(){ successBox.classList.remove('opacity-0'); successBox.classList.remove('scale-95'); }, 20);
                    }
                    if(contactWrapper){
                        var theForm = contactWrapper.querySelector('form');
                        if(theForm) theForm.style.display = 'none';
                    }
                });
            }

            // Permitir enviar otro mensaje: limpiar y mostrar el form
                    if(contactNew){
                contactNew.addEventListener('click', function(){

                    if(contactWrapper){
                        var theForm = contactWrapper.querySelector('form');
                        if(theForm){ theForm.reset(); theForm.style.display = ''; }
                    }
                    if(successBox) successBox.classList.add('hidden');
                    if(submittedData) submittedData.innerHTML = '';

                    // mostrar título otra vez (animado)
                    if(formTitle) formTitle.classList.remove('opacity-0');

                    // re-habilitar botones submit
                    var submitBtns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
                    submitBtns.forEach(function(b){ b.disabled = false; b.classList.remove('opacity-60','cursor-not-allowed'); });
                });
            }

            // pequeño helper para evitar inyección en HTML
            function escapeHtml(str){
                if(typeof str !== 'string') return '';
                return str.replace(/[&<>"']/g, function(m){
                    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m];
                });
            }
        });
    })();


    // Preseleccionar curso desde query param ?curso=...
    // Versión moderna con let y const
(function() {
    function getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const cursoParam = getParam('curso');
        if (!cursoParam) return;

        let decoded;
        try {
            decoded = decodeURIComponent(cursoParam);
        } catch (e) {
            decoded = cursoParam;
        }

        const hiddenSelect = document.getElementById('hiddenSelect');
        const customSelect = document.getElementById('customSelect');
        if (!hiddenSelect || !customSelect) return;

        let found = null;
        for (let i = 0; i < hiddenSelect.options.length; i++) {
            const opt = hiddenSelect.options[i];
            if (opt.value && opt.value.toLowerCase().indexOf(decoded.toLowerCase()) !== -1) {
                found = opt;
                break;
            }
            if (opt.text && opt.text.toLowerCase().indexOf(decoded.toLowerCase()) !== -1) {
                found = opt;
                break;
            }
        }

        if (found) {
            hiddenSelect.value = found.value;

            const selectTrigger = customSelect.querySelector('.select-trigger');
            const selectText = selectTrigger ? selectTrigger.querySelector('.select-text') : null;
            const selectOptions = customSelect.querySelectorAll('.option');

            if (selectText) {
                selectText.textContent = found.text;
                selectText.classList.remove('text-gray-400');
                selectText.classList.add('text-white');
            }

            selectOptions.forEach(function(o) {
                // texto blanco en todas; resalto solo la seleccionada
                o.classList.add('text-white');
                o.classList.remove('bg-gradient-to-r', 'from-purple-700', 'to-violet-600', 'ring-1', 'ring-purple-400/40', 'font-medium');
                if (o.getAttribute('data-value') === found.value || o.textContent === found.text) {
                    o.classList.add('bg-gradient-to-r', 'from-purple-700', 'to-violet-600', 'ring-1', 'ring-purple-400/40', 'font-medium');
                }
            });

            const evt = new Event('change', { bubbles: true });
            hiddenSelect.dispatchEvent(evt);
        }
    });
})();
    