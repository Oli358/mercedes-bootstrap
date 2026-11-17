/* =========================================================
   T12: MODAL DE CONFIRMACIÓN EN LA HOME
   ---------------------------------------------------------
   Muestra el modal solo si se llega desde el formulario con
   la solicitud registrada. Limpia la marca y la URL para que
   no aparezca al recargar ni al entrar directamente.
   ========================================================= */

(function () {
    'use strict';

    const CLAVE = 'solicitudRegistrada';
    const parametros = new URLSearchParams(window.location.search);
    let porSessionStorage = false;

    try {
        porSessionStorage = window.sessionStorage.getItem(CLAVE) === '1';
    } catch (error) {
        porSessionStorage = false;
    }

    const porUrl = parametros.get('solicitud') === 'ok';

    if (!porSessionStorage && !porUrl) {
        return;
    }

    try {
        window.sessionStorage.removeItem(CLAVE);
    } catch (error) {
        // La URL limpia también evita repetir el modal al recargar.
    }

    if (porUrl) {
        try {
            window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        } catch (error) {
            // Si no se puede limpiar la URL, el flag ya está eliminado.
        }
    }

    const modal = document.getElementById('modalSolicitud');
    if (!modal || !window.bootstrap) {
        return;
    }

    window.bootstrap.Modal.getOrCreateInstance(modal).show();
})();
