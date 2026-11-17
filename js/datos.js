/* =========================================================
   T6: DATOS PERSONALES
   ---------------------------------------------------------
   Sincroniza los campos del paso 3 con Config.estado.datos.
   Las reglas de validación y los mensajes de error llegan
   en T10; aquí solo se deja el estado preparado.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    const campos = [
        'nombre',
        'apellidos',
        'dni',
        'email',
        'emailConfirmacion',
        'telefono',
        'fechaNacimiento'
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
                window.Config.estado.datos[id] = inputs[id].value;
            }
        });

        document.dispatchEvent(new CustomEvent('config:datos', {
            detail: {
                datos: window.Config.estado.datos,
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
