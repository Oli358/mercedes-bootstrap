/* =========================================================
   T8: MÉTODO DE PAGO
   ---------------------------------------------------------
   Alterna domiciliación y tarjeta, activa solo los campos
   del método elegido, sincroniza Config.estado.pago y
   actualiza la tarjeta simulada. Las validaciones de IBAN,
   Luhn, caducidad y CVV llegan en T10.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    const radios = Array.from(form.querySelectorAll('input[name="metodoPago"]'));
    if (!radios.length) {
        return;
    }

    const paneles = {
        domiciliacion: document.getElementById('pagoDomiciliacion'),
        tarjeta: document.getElementById('pagoTarjeta')
    };

    const campos = {
        domiciliacion: ['titularCuenta', 'iban'],
        tarjeta: ['titularTarjeta', 'numeroTarjeta', 'caducidad', 'cvv']
    };

    const inputs = {};
    ['titularCuenta', 'iban', 'titularTarjeta', 'numeroTarjeta', 'caducidad', 'cvv'].forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            inputs[id] = input;
        }
    });

    const visual = {
        numero: document.getElementById('tarjetaVisualNumero'),
        titular: document.getElementById('tarjetaVisualTitular'),
        caducidad: document.getElementById('tarjetaVisualCaducidad')
    };

    function metodoActual() {
        const seleccionado = radios.find((radio) => radio.checked);
        return seleccionado ? seleccionado.value : 'domiciliacion';
    }

    function formatearNumeroTarjeta(input) {
        const digitos = input.value.replace(/\D/g, '').slice(0, 16);
        input.value = digitos.replace(/(.{4})/g, '$1 ').trim();
    }

    function formatearCaducidad(input) {
        const digitos = input.value.replace(/\D/g, '').slice(0, 4);
        input.value = digitos.length > 2
            ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
            : digitos;
    }

    function actualizarVisualTarjeta() {
        if (!visual.numero || !visual.titular || !visual.caducidad) {
            return;
        }

        const digitos = inputs.numeroTarjeta
            ? inputs.numeroTarjeta.value.replace(/\D/g, '').slice(0, 16)
            : '';
        const relleno = (digitos + '••••••••••••••••').slice(0, 16);

        visual.numero.textContent = relleno.replace(/(.{4})/g, '$1 ').trim();
        visual.titular.textContent = (inputs.titularTarjeta && inputs.titularTarjeta.value.trim()) || 'TITULAR';
        visual.caducidad.textContent = (inputs.caducidad && inputs.caducidad.value.trim()) || 'MM/AA';
    }

    function actualizarEstado() {
        const metodo = metodoActual();

        window.Config.estado.pago.metodo = metodo;

        Object.keys(inputs).forEach((id) => {
            window.Config.estado.pago[id] = inputs[id].value;
        });

        document.dispatchEvent(new CustomEvent('config:pago', {
            detail: {
                pago: window.Config.estado.pago,
                estado: window.Config.estado
            }
        }));
    }

    function activarMetodo(metodo) {
        Object.keys(paneles).forEach((key) => {
            const activo = key === metodo;

            if (paneles[key]) {
                paneles[key].hidden = !activo;
            }

            campos[key].forEach((id) => {
                if (inputs[id]) {
                    inputs[id].disabled = !activo;
                }
            });
        });

        radios.forEach((radio) => {
            const tarjeta = radio.closest('.pago-opcion');
            if (tarjeta) {
                tarjeta.classList.toggle('is-seleccionado', radio.checked);
            }
        });

        actualizarEstado();
        actualizarVisualTarjeta();
    }

    radios.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                activarMetodo(radio.value);
            }
        });
    });

    Object.keys(inputs).forEach((id) => {
        const input = inputs[id];

        input.addEventListener('input', () => {
            if (id === 'numeroTarjeta') {
                formatearNumeroTarjeta(input);
            }
            if (id === 'caducidad') {
                formatearCaducidad(input);
            }

            actualizarEstado();
            actualizarVisualTarjeta();
        });

        input.addEventListener('change', () => {
            actualizarEstado();
            actualizarVisualTarjeta();
        });
    });

    const metodoInicial = radios.find((radio) => radio.checked) || radios[0];
    if (metodoInicial) {
        metodoInicial.checked = true;
        activarMetodo(metodoInicial.value);
    }

    actualizarVisualTarjeta();
})();
