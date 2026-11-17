/* =========================================================
   T5: EXTRAS
   ---------------------------------------------------------
   Gestiona la selección de complementos, su disponibilidad
   según el vehículo, la incompatibilidad Pack AMG Night /
   Pack Confort y el resumen de extras.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    const inputs = Array.from(form.querySelectorAll('input[name="extras"]'));
    if (!inputs.length) {
        return;
    }

    const aviso = document.getElementById('extrasAviso');
    const resumenTexto = document.getElementById('extrasResumenTexto');

    const formatoEuro = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
        useGrouping: 'always'
    });

    const extras = inputs.map((input) => {
        const tarjeta = input.closest('.card-extra');
        const titulo = tarjeta ? tarjeta.querySelector('.card-extra-titulo') : null;

        return {
            input,
            tarjeta,
            id: input.id,
            valor: input.value,
            nombre: input.dataset.nombre || (titulo ? titulo.textContent.trim() : input.value),
            precioMensual: Number(input.dataset.precioMensual) || 0,
            precioUnico: Number(input.dataset.precioUnico) || 0,
            tipo: input.dataset.tipo || 'unico',
            requiere: input.dataset.requiere || '',
            requiereTexto: input.dataset.requiereTexto || '',
            incompatible: input.dataset.incompatible || ''
        };
    });

    function formatearEuro(valor) {
        return formatoEuro.format(Number(valor) || 0);
    }

    function mostrarAviso(texto) {
        if (!aviso) {
            return;
        }
        aviso.textContent = texto;
        aviso.hidden = !texto;
    }

    function actualizarResumen(seleccionados) {
        if (!resumenTexto) {
            return;
        }

        if (!seleccionados.length) {
            resumenTexto.textContent = 'Sin extras seleccionados.';
            return;
        }

        const totalMensual = seleccionados.reduce((total, extra) => total + extra.precioMensual, 0);
        const totalUnico = seleccionados.reduce((total, extra) => total + extra.precioUnico, 0);
        const partes = [`${seleccionados.length} ${seleccionados.length === 1 ? 'extra' : 'extras'}`];

        if (totalMensual) {
            partes.push(`+${formatearEuro(totalMensual)}/mes`);
        }
        if (totalUnico) {
            partes.push(`+${formatearEuro(totalUnico)} pago único`);
        }

        resumenTexto.textContent = partes.join(' · ');
    }

    function actualizarEstado() {
        const seleccionados = extras.filter((extra) => extra.input.checked);

        window.Config.estado.extras = seleccionados.map((extra) => ({
            id: extra.id,
            valor: extra.valor,
            nombre: extra.nombre,
            precioMensual: extra.precioMensual,
            precioUnico: extra.precioUnico,
            tipo: extra.tipo
        }));

        if (typeof window.Config.actualizarShowroom === 'function') {
            window.Config.actualizarShowroom();
        }

        actualizarResumen(seleccionados);

        document.dispatchEvent(new CustomEvent('config:extras', {
            detail: {
                extras: window.Config.estado.extras,
                estado: window.Config.estado
            }
        }));
    }

    function actualizarDisponibilidad(opciones = {}) {
        const producto = window.Config.estado.producto;
        const seleccionados = new Set(extras.filter((extra) => extra.input.checked).map((extra) => extra.id));
        let retirados = 0;

        extras.forEach((extra) => {
            const dependeDelProducto = !extra.requiere || (producto && producto.valor === extra.requiere);
            const incompatibleSeleccionado = extra.incompatible && seleccionados.has(extra.incompatible);
            const disponible = Boolean(producto) && Boolean(dependeDelProducto) && !incompatibleSeleccionado;

            if (!disponible && extra.input.checked) {
                extra.input.checked = false;
                retirados += 1;
            }

            extra.input.disabled = !disponible;
            if (extra.tarjeta) {
                extra.tarjeta.classList.toggle('is-disabled', !disponible);
            }
        });

        if (opciones.avisar) {
            if (!producto) {
                mostrarAviso('Selecciona un vehículo en el paso 1 para añadir extras.');
            } else if (retirados === 1) {
                mostrarAviso('Se ha quitado 1 extra que no está disponible para el vehículo seleccionado.');
            } else if (retirados > 1) {
                mostrarAviso(`Se han quitado ${retirados} extras que no están disponibles para el vehículo seleccionado.`);
            } else {
                mostrarAviso('');
            }
        }

        actualizarEstado();
    }

    extras.forEach((extra) => {
        extra.input.addEventListener('change', () => {
            if (extra.input.checked && extra.incompatible) {
                const incompatible = extras.find((otro) => otro.id === extra.incompatible);

                if (incompatible && incompatible.input.checked) {
                    incompatible.input.checked = false;
                    mostrarAviso(`${incompatible.nombre} no es compatible con ${extra.nombre}. Se ha desmarcado ${incompatible.nombre}.`);
                } else {
                    mostrarAviso('');
                }
            } else {
                mostrarAviso('');
            }

            actualizarDisponibilidad();
        });
    });

    document.addEventListener('config:producto', () => {
        actualizarDisponibilidad({ avisar: true });
    });

    document.addEventListener('config:paso', (event) => {
        if (event.detail.paso === 2) {
            actualizarDisponibilidad();
        }
    });

    actualizarDisponibilidad({ avisar: true });
})();
