/* =========================================================
   T12: ENVÍO SIMULADO
   ---------------------------------------------------------
   Solo se ejecuta después de que T2 compruebe que
   Config.validarTodo() es correcto. Guarda la solicitud y
   vuelve a la home, donde se abre el modal una única vez.
   ========================================================= */

(function () {
    'use strict';

    const CLAVE = 'solicitudRegistrada';
    let enviando = false;

    document.addEventListener('config:confirmar', () => {
        if (enviando) {
            return;
        }

        enviando = true;

        try {
            sessionStorage.setItem(CLAVE, '1');
        } catch (error) {
            // Si sessionStorage no está disponible, el parámetro de URL
            // sigue permitiendo mostrar el modal una vez.
        }

        window.location.assign('index.html?solicitud=ok');
    });
})();
