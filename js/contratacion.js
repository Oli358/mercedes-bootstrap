/* =========================================================
   CONFIGURADOR DE CONTRATACIÓN
   Navegación entre los seis pasos, progreso y estado compartido.
   Las validaciones reales llegan en T10 y el showroom dinámico
   en T4. Aquí solo se deja el hook y la estructura.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form) {
        return;
    }

    const pasos = Array.from(form.querySelectorAll('.config-step'));
    if (!pasos.length) {
        return;
    }

    const botones = {
        anterior: document.getElementById('btnAnterior'),
        siguiente: document.getElementById('btnSiguiente'),
        confirmar: document.getElementById('btnConfirmar')
    };
    const stepperItems = Array.from(document.querySelectorAll('[data-paso-indicador]'));
    const etiquetas = ['Vehículo', 'Extras', 'Datos', 'Dirección', 'Pago', 'Resumen'];
    const totalPasos = pasos.length;

    let pasoActual = 1;

    const estado = {
        producto: null,
        extras: [],
        datos: {},
        direccion: {},
        pago: {}
    };

    /**
     * Hook de validación. T10 sustituirá o completará esta función.
     * Debe devolver true si el paso es válido y false si no lo es.
     */
    function validarPaso(n, datos) {
        if (window.Validaciones && typeof window.Validaciones.validarPaso === 'function') {
            return window.Validaciones.validarPaso(n, datos);
        }
        return true;
    }

    /**
     * Actualiza el stepper, el texto de progreso y la barra superior.
     */
    function actualizarIndicadores() {
        if (botones.anterior) {
            botones.anterior.disabled = pasoActual === 1;
        }
        if (botones.siguiente) {
            botones.siguiente.hidden = pasoActual === totalPasos;
        }
        if (botones.confirmar) {
            botones.confirmar.hidden = pasoActual !== totalPasos;
        }

        const indicadorTop = document.getElementById('indicadorPasoTop');
        if (indicadorTop) {
            indicadorTop.textContent = `Paso ${pasoActual} de ${totalPasos}`;
        }

        const indicador = document.getElementById('indicadorPaso');
        if (indicador) {
            indicador.textContent = `Paso ${pasoActual} de ${totalPasos} · ${etiquetas[pasoActual - 1] || ''}`;
        }

        const progreso = document.querySelector('.config-progress');
        if (progreso) {
            progreso.setAttribute('aria-valuenow', String(pasoActual));
        }

        const barra = document.getElementById('barraProgreso');
        if (barra) {
            barra.style.width = `${(pasoActual / totalPasos) * 100}%`;
        }

        stepperItems.forEach((item) => {
            const numero = Number(item.dataset.pasoIndicador);
            const activo = numero === pasoActual;

            item.classList.toggle('is-active', activo);
            item.classList.toggle('is-complete', numero < pasoActual);
            item.classList.toggle('text-secondary', numero > pasoActual);
            item.classList.toggle('fw-semibold', activo);

            if (activo) {
                item.setAttribute('aria-current', 'step');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }

    /**
     * Muestra un paso y actualiza todo lo que depende de él.
     * No valida: la validación la decide quien llama (Siguiente o T10).
     */
    function irAPaso(nuevoPaso, opciones = {}) {
        const destino = Math.min(Math.max(Number(nuevoPaso) || 1, 1), totalPasos);
        const anterior = pasoActual;

        pasos.forEach((paso) => {
            paso.hidden = Number(paso.dataset.paso) !== destino;
        });

        pasoActual = destino;
        Config.pasoActual = destino;
        actualizarIndicadores();

        const seccion = pasos.find((paso) => Number(paso.dataset.paso) === destino);
        const titulo = seccion ? seccion.querySelector('h2[tabindex="-1"]') : null;

        if (titulo) {
            if (opciones.focus !== false) {
                titulo.focus({ preventScroll: true });
            }
            if (opciones.scroll !== false) {
                const ancla = document.querySelector('.config-stepper') || titulo;
                const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                ancla.scrollIntoView({
                    behavior: reducido ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        }

        document.dispatchEvent(new CustomEvent('config:paso', {
            detail: { paso: destino, anterior, estado }
        }));
    }

    /**
     * Siguiente: valida el paso actual antes de avanzar.
     * La validación real se implementa en T10.
     */
    if (botones.siguiente) {
        botones.siguiente.addEventListener('click', () => {
            if (pasoActual >= totalPasos) {
                return;
            }
            const valido = Config.validarPaso(pasoActual, estado);
            if (valido === false) {
                return;
            }
            irAPaso(pasoActual + 1);
        });
    }

    /**
     * Anterior: nunca valida y nunca borra datos.
     */
    if (botones.anterior) {
        botones.anterior.addEventListener('click', () => {
            if (pasoActual > 1) {
                irAPaso(pasoActual - 1);
            }
        });
    }

    /**
     * Confirmar: T12 escuchará este evento para validar todo y enviar.
     */
    if (botones.confirmar) {
        botones.confirmar.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('config:confirmar', {
                detail: { estado }
            }));
        });
    }

    /**
     * Enlaces de edición del resumen (T9): data-ir-a="1..5".
     * Vuelven al paso indicado sin validar.
     */
    document.addEventListener('click', (event) => {
        const enlace = event.target.closest('[data-ir-a]');
        if (!enlace) {
            return;
        }

        const destino = Number(enlace.dataset.irA);
        if (destino >= 1 && destino <= totalPasos) {
            event.preventDefault();
            irAPaso(destino);
        }
    });

    /**
     * API compartida para T4-T12. No sobreescribe funciones que ya existan.
     */
    const Config = window.Config = window.Config || {};
    Config.totalPasos = totalPasos;
    Config.pasoActual = pasoActual;
    Config.estado = estado;
    Config.irAPaso = irAPaso;
    Config.validarPaso = Config.validarPaso || validarPaso;
    Config.actualizarShowroom = Config.actualizarShowroom || function () {};
    Config.mostrarError = Config.mostrarError || function () {};
    Config.limpiarError = Config.limpiarError || function () {};

    // Estado inicial: paso 1, sin hacer scroll ni robar el foco al cargar.
    irAPaso(1, { focus: false, scroll: false });
})();
