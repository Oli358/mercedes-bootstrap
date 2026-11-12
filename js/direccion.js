/* =========================================================
   T7: DIRECCIÓN
   ---------------------------------------------------------
   Sincroniza los campos del paso 4 con Config.estado.direccion.
   Las reglas de código postal, provincia y campos obligatorios
   llegan en T10; aquí solo se deja el estado preparado.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    const campos = [
        'tipoVia',
        'nombreVia',
        'numero',
        'piso',
        'codigoPostal',
        'localidad',
        'provincia'
    ];

    const inputs = {};

    campos.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            inputs[id] = input;
        }
    });

    function actualizarEstado() {
        campos.forEach((id) => {
            if (inputs[id]) {
                window.Config.estado.direccion[id] = inputs[id].value;
            }
        });

        if (inputs.provincia) {
            const opcion = inputs.provincia.options[inputs.provincia.selectedIndex];
            window.Config.estado.direccion.provinciaNombre = inputs.provincia.value && opcion
                ? opcion.textContent.trim()
                : '';
        }

        document.dispatchEvent(new CustomEvent('config:direccion', {
            detail: {
                direccion: window.Config.estado.direccion,
                estado: window.Config.estado
            }
        }));
    }

    campos.forEach((id) => {
        const input = inputs[id];
        if (!input) {
            return;
        }

        input.addEventListener('input', actualizarEstado);
        input.addEventListener('change', actualizarEstado);
    });

    actualizarEstado();
})();
