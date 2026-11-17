/* =========================================================
   T11: CÁLCULO DINÁMICO DEL PRECIO
   ---------------------------------------------------------
   Fuente única de cálculo para showroom y resumen. Separa
   aportación inicial, extras de pago único, cuota mensual y
   extras mensuales para no mezclar conceptos.
   ========================================================= */

(function () {
    'use strict';

    const formatoEuro = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
        // En es-ES los números de 4 cifras no se agrupan por defecto.
        useGrouping: 'always'
    });

    function formatearEuro(valor) {
        return formatoEuro.format(Number(valor) || 0);
    }

    function calcular(producto, extras) {
        const listaExtras = Array.isArray(extras) ? extras : [];
        const aportacion = Number(producto && producto.precioUnico) || 0;
        const cuota = Number(producto && producto.precioMensual) || 0;

        const extrasUnicos = listaExtras.reduce((total, extra) => {
            return total + (Number(extra.precioUnico) || 0);
        }, 0);

        const extrasMensuales = listaExtras.reduce((total, extra) => {
            return total + (Number(extra.precioMensual) || 0);
        }, 0);

        const totalHoy = aportacion + extrasUnicos;
        const totalMensual = cuota + extrasMensuales;

        return {
            producto: producto || null,
            extras: listaExtras,
            aportacion,
            extrasUnicos,
            cuota,
            extrasMensuales,
            totalHoy,
            // Alias usado por el showroom de T4.
            totalUnico: totalHoy,
            totalMensual,
            hayProducto: Boolean(producto)
        };
    }

    function textoResumen(precios) {
        const datos = precios || calcular(null, []);
        return `Hoy ${formatearEuro(datos.totalHoy)} · Cada mes ${formatearEuro(datos.totalMensual)}/mes`;
    }

    window.Precios = {
        calcular,
        formatearEuro,
        textoResumen
    };
})();
