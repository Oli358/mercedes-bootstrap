/* =========================================================
   T4: SELECCIÓN DE VEHÍCULO
   ---------------------------------------------------------
   Conecta los radios de las tarjetas con Config.estado y con
   el showroom. T5 podrá añadir extras al estado y llamar a
   Config.actualizarShowroom() para refrescar los totales.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    const radios = Array.from(form.querySelectorAll('input[name="producto"]'));
    if (!radios.length) {
        return;
    }

    const tarjetas = Array.from(form.querySelectorAll('.card-vehiculo'));
    const lineas = {
        'mercedes-benz': 'Mercedes-Benz',
        'amg': 'Mercedes-AMG',
        'maybach': 'Mercedes-Maybach'
    };

    const formatoEuro = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
        // En es-ES los números de 4 cifras no se agrupan por defecto;
        // "always" mantiene 1.490 € como en las tarjetas y la home.
        useGrouping: 'always'
    });

    const showroom = {
        imagen: document.getElementById('showroomImagen'),
        linea: document.getElementById('showroomLinea'),
        modelo: document.getElementById('showroomModelo'),
        tagline: document.getElementById('showroomTagline'),
        specs: document.getElementById('showroomSpecs'),
        vehiculo: document.getElementById('showroomVehiculo'),
        extras: document.getElementById('showroomExtras'),
        pagoUnico: document.getElementById('showroomPagoUnico'),
        cuota: document.getElementById('showroomCuota')
    };

    const imagenPorDefecto = {
        src: 'images/welcomehome.jpg',
        alt: 'Mercedes-Benz de perfil en estudio'
    };

    function formatearEuro(valor) {
        if (window.Precios && typeof window.Precios.formatearEuro === 'function') {
            return window.Precios.formatearEuro(valor);
        }
        return formatoEuro.format(Number(valor) || 0);
    }

    function obtenerProducto(radio) {
        return {
            id: radio.id,
            valor: radio.value,
            linea: radio.dataset.linea,
            lineaTexto: lineas[radio.dataset.linea] || radio.dataset.linea,
            modelo: radio.dataset.modelo,
            tagline: radio.dataset.tagline,
            specs: radio.dataset.specs,
            precioMensual: Number(radio.dataset.precioMensual) || 0,
            precioUnico: Number(radio.dataset.precioUnico) || 0,
            imagen: radio.dataset.imagen,
            alt: radio.dataset.alt || radio.dataset.modelo
        };
    }

    function calcularResumen(producto) {
        const extras = Array.isArray(window.Config.estado.extras) ? window.Config.estado.extras : [];

        if (window.Precios && typeof window.Precios.calcular === 'function') {
            return window.Precios.calcular(producto, extras);
        }

        const totalUnico = (producto ? producto.precioUnico : 0) + extras.reduce((total, extra) => {
            return total + (Number(extra.precioUnico) || 0);
        }, 0);

        const totalMensual = (producto ? producto.precioMensual : 0) + extras.reduce((total, extra) => {
            return total + (Number(extra.precioMensual) || 0);
        }, 0);

        return { extras, totalUnico, totalMensual };
    }

    function actualizarShowroom(producto) {
        if (!showroom.modelo) {
            return;
        }

        const resumen = calcularResumen(producto);

        if (!producto) {
            if (showroom.linea) {
                showroom.linea.textContent = 'Mercedes-Benz';
            }
            showroom.modelo.textContent = 'Selecciona tu Mercedes';
            if (showroom.tagline) {
                showroom.tagline.textContent = 'Elige un vehículo para empezar.';
            }
            if (showroom.specs) {
                showroom.specs.textContent = '';
                showroom.specs.hidden = true;
            }
            if (showroom.imagen) {
                showroom.imagen.src = imagenPorDefecto.src;
                showroom.imagen.alt = imagenPorDefecto.alt;
            }
            if (showroom.vehiculo) {
                showroom.vehiculo.textContent = '—';
            }
            if (showroom.extras) {
                showroom.extras.textContent = '—';
            }
            if (showroom.pagoUnico) {
                showroom.pagoUnico.textContent = '—';
            }
            if (showroom.cuota) {
                showroom.cuota.textContent = '—';
            }
            return;
        }

        if (showroom.linea) {
            showroom.linea.textContent = producto.lineaTexto;
        }
        showroom.modelo.textContent = producto.modelo;
        if (showroom.tagline) {
            showroom.tagline.textContent = producto.tagline;
        }
        if (showroom.specs) {
            showroom.specs.textContent = producto.specs;
            showroom.specs.hidden = false;
        }
        if (showroom.imagen) {
            showroom.imagen.src = producto.imagen;
            showroom.imagen.alt = producto.alt;
        }
        if (showroom.vehiculo) {
            showroom.vehiculo.textContent = producto.modelo;
        }
        if (showroom.extras) {
            showroom.extras.textContent = resumen.extras.length
                ? `${resumen.extras.length} ${resumen.extras.length === 1 ? 'seleccionado' : 'seleccionados'}`
                : 'Sin extras';
        }
        if (showroom.pagoUnico) {
            showroom.pagoUnico.textContent = formatearEuro(resumen.totalUnico);
        }
        if (showroom.cuota) {
            showroom.cuota.textContent = `${formatearEuro(resumen.totalMensual)}/mes`;
        }
    }

    function seleccionarProducto(radio) {
        const producto = obtenerProducto(radio);

        window.Config.estado.producto = producto;

        tarjetas.forEach((tarjeta) => {
            tarjeta.classList.toggle('is-seleccionado', tarjeta.contains(radio));
        });

        actualizarShowroom(producto);

        document.dispatchEvent(new CustomEvent('config:producto', {
            detail: { producto, estado: window.Config.estado }
        }));
    }

    radios.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                seleccionarProducto(radio);
            }
        });
    });

    /**
     * T5 y T11 pueden llamar a esta función después de cambiar
     * los extras o los precios para refrescar el showroom.
     */
    window.Config.actualizarShowroom = function () {
        actualizarShowroom(window.Config.estado.producto);
    };

    const seleccionadoInicial = radios.find((radio) => radio.checked);

    if (seleccionadoInicial) {
        seleccionarProducto(seleccionadoInicial);
    } else {
        window.Config.estado.producto = null;
        actualizarShowroom(null);
    }
})();
