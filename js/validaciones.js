/* =========================================================
   T10: VALIDACIONES Y MENSAJES DE ERROR
   ---------------------------------------------------------
   Reglas reutilizables, errores en línea, resumen con enlaces,
   apertura del primer paso con error y actualización al corregir.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    /* -----------------------------------------------------
       Utilidades y reglas puras
       ----------------------------------------------------- */
    function limpiarTexto(valor) {
        return String(valor === undefined || valor === null ? '' : valor).trim();
    }

    function normalizarEmail(valor) {
        return limpiarTexto(valor).toLowerCase();
    }

    function normalizarTelefono(valor) {
        let telefono = String(valor || '').replace(/[\s\-().]/g, '');

        if (telefono.startsWith('+34')) {
            telefono = telefono.slice(3);
        } else if (telefono.startsWith('0034')) {
            telefono = telefono.slice(4);
        }

        return telefono;
    }

    function validarNombre(valor) {
        const texto = limpiarTexto(valor);
        return texto.length >= 2 && /^[\p{L}\p{M}][\p{L}\p{M}'’\- ]*$/u.test(texto);
    }

    function validarEmail(valor) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpiarTexto(valor));
    }

    function validarTelefono(valor) {
        return /^[6789]\d{8}$/.test(normalizarTelefono(valor));
    }

    function letraDNI(numero) {
        return 'TRWAGMYFPDXBNJZSQVHLCKE'[numero % 23];
    }

    function validarDNI(valor) {
        const dni = limpiarTexto(valor).toUpperCase();

        if (!/^\d{8}[A-Z]$/.test(dni)) {
            return false;
        }

        return letraDNI(Number(dni.slice(0, 8))) === dni.slice(8);
    }

    function validarFechaNacimiento(valor) {
        const texto = limpiarTexto(valor);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
            return { valida: false, motivo: 'formato' };
        }

        const [anio, mes, dia] = texto.split('-').map(Number);
        const fecha = new Date(anio, mes - 1, dia);

        if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
            return { valida: false, motivo: 'fecha' };
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fecha > hoy) {
            return { valida: false, motivo: 'futuro' };
        }

        let edad = hoy.getFullYear() - anio;
        if (hoy.getMonth() < mes - 1 || (hoy.getMonth() === mes - 1 && hoy.getDate() < dia)) {
            edad -= 1;
        }

        if (edad < 18) {
            return { valida: false, motivo: 'edad' };
        }

        return { valida: true, motivo: '' };
    }

    function esMayorDeEdad(valor) {
        return validarFechaNacimiento(valor).valida;
    }

    function validarCodigoPostal(cp, provincia) {
        const codigo = limpiarTexto(cp);

        if (!/^\d{5}$/.test(codigo)) {
            return false;
        }

        const prefijo = Number(codigo.slice(0, 2));
        if (prefijo < 1 || prefijo > 52) {
            return false;
        }

        return !provincia || codigo.slice(0, 2) === String(provincia).padStart(2, '0');
    }

    function validarIBAN(valor) {
        const iban = limpiarTexto(valor).replace(/\s/g, '').toUpperCase();

        if (!/^ES\d{22}$/.test(iban)) {
            return false;
        }

        const reordenado = iban.slice(4) + iban.slice(0, 4);
        const numerico = reordenado.replace(/[A-Z]/g, (letra) => String(letra.charCodeAt(0) - 55));
        let resto = 0;

        for (const digito of numerico) {
            resto = (resto * 10 + Number(digito)) % 97;
        }

        return resto === 1;
    }

    function validarNumeroTarjeta(valor) {
        const digitos = String(valor || '').replace(/\D/g, '');

        if (!/^\d{16}$/.test(digitos)) {
            return false;
        }

        let suma = 0;

        for (let i = 0; i < digitos.length; i += 1) {
            let digito = Number(digitos[digitos.length - 1 - i]);

            if (i % 2 === 1) {
                digito *= 2;
                if (digito > 9) {
                    digito -= 9;
                }
            }

            suma += digito;
        }

        return suma % 10 === 0;
    }

    function validarCaducidad(valor) {
        const texto = limpiarTexto(valor);

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(texto)) {
            return false;
        }

        const [mes, anio] = texto.split('/').map(Number);
        const hoy = new Date();
        const anioActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1;
        const anioCompleto = 2000 + anio;

        return anioCompleto > anioActual || (anioCompleto === anioActual && mes >= mesActual);
    }

    function validarCVV(valor) {
        return /^\d{3}$/.test(limpiarTexto(valor));
    }

    function validarProvincia(valor) {
        return /^(0[1-9]|[1-4]\d|5[0-2])$/.test(limpiarTexto(valor));
    }

    function validarRequerido(valor) {
        return limpiarTexto(valor) !== '';
    }

    function validarTitular(valor) {
        return limpiarTexto(valor).length >= 2;
    }

    /* -----------------------------------------------------
       Errores y resumen
       ----------------------------------------------------- */
    const resumenErrores = document.getElementById('resumenErrores');
    const errores = new Map();

    const ORDEN = [
        'producto', 'extras',
        'nombre', 'apellidos', 'dni', 'fechaNacimiento', 'email', 'emailConfirmacion', 'telefono',
        'tipoVia', 'nombreVia', 'numero', 'piso', 'codigoPostal', 'localidad', 'provincia',
        'metodoPago', 'titularCuenta', 'iban', 'titularTarjeta', 'numeroTarjeta', 'caducidad', 'cvv',
        'aceptoCondiciones', 'aceptoPrivacidad', 'aceptoComercial'
    ];

    const ETIQUETAS = {
        producto: 'Vehículo',
        extras: 'Extras',
        nombre: 'Nombre',
        apellidos: 'Apellidos',
        dni: 'DNI',
        fechaNacimiento: 'Fecha de nacimiento',
        email: 'Correo electrónico',
        emailConfirmacion: 'Confirmación del correo',
        telefono: 'Teléfono',
        tipoVia: 'Tipo de vía',
        nombreVia: 'Nombre de la vía',
        numero: 'Número',
        piso: 'Piso / puerta',
        codigoPostal: 'Código postal',
        localidad: 'Localidad',
        provincia: 'Provincia',
        metodoPago: 'Método de pago',
        titularCuenta: 'Titular de la cuenta',
        iban: 'IBAN',
        titularTarjeta: 'Titular de la tarjeta',
        numeroTarjeta: 'Número de tarjeta',
        caducidad: 'Caducidad',
        cvv: 'CVV',
        aceptoCondiciones: 'Condiciones de contratación',
        aceptoPrivacidad: 'Política de privacidad',
        aceptoComercial: 'Comunicaciones comerciales'
    };

    function elementoError(campo) {
        return document.getElementById(`error-${campo}`);
    }

    function marcarError(campo, paso, mensaje) {
        errores.set(campo, {
            campo,
            paso,
            mensaje,
            etiqueta: ETIQUETAS[campo] || campo
        });

        const error = elementoError(campo);
        if (error) {
            error.textContent = mensaje;
        }

        if (campo === 'producto') {
            form.querySelectorAll('input[name="producto"]').forEach((radio) => {
                radio.setAttribute('aria-invalid', 'true');
            });
            const fieldset = form.querySelector('#paso-1 .config-fieldset');
            if (fieldset) {
                fieldset.classList.add('is-error');
            }
            return;
        }

        if (campo === 'extras') {
            return;
        }

        if (campo === 'metodoPago') {
            form.querySelectorAll('input[name="metodoPago"]').forEach((radio) => {
                radio.setAttribute('aria-invalid', 'true');
            });
            return;
        }

        const input = document.getElementById(campo);
        if (input) {
            input.setAttribute('aria-invalid', 'true');
            const contenedor = input.closest('.campo');
            if (contenedor) {
                contenedor.classList.add('is-error');
            }
        }

        if (campo.startsWith('acepto')) {
            const legalCheck = input ? input.closest('.legal-check') : null;
            if (legalCheck) {
                legalCheck.classList.add('is-error');
            }
        }
    }

    function limpiarError(campo) {
        errores.delete(campo);

        const error = elementoError(campo);
        if (error) {
            error.textContent = '';
        }

        if (campo === 'producto') {
            form.querySelectorAll('input[name="producto"]').forEach((radio) => {
                radio.removeAttribute('aria-invalid');
            });
            const fieldset = form.querySelector('#paso-1 .config-fieldset');
            if (fieldset) {
                fieldset.classList.remove('is-error');
            }
            return;
        }

        if (campo === 'metodoPago') {
            form.querySelectorAll('input[name="metodoPago"]').forEach((radio) => {
                radio.removeAttribute('aria-invalid');
            });
            return;
        }

        const input = document.getElementById(campo);
        if (input) {
            input.removeAttribute('aria-invalid');
            const contenedor = input.closest('.campo');
            if (contenedor) {
                contenedor.classList.remove('is-error');
            }
        }

        if (campo.startsWith('acepto')) {
            const legalCheck = input ? input.closest('.legal-check') : null;
            if (legalCheck) {
                legalCheck.classList.remove('is-error');
            }
        }
    }

    function limpiarErroresDePaso(paso) {
        Array.from(errores.keys()).forEach((campo) => {
            if (errores.get(campo).paso === paso) {
                limpiarError(campo);
            }
        });
    }

    function erroresOrdenados() {
        return Array.from(errores.values()).sort((a, b) => {
            if (a.paso !== b.paso) {
                return a.paso - b.paso;
            }
            return ORDEN.indexOf(a.campo) - ORDEN.indexOf(b.campo);
        });
    }

    function renderResumenErrores() {
        if (!resumenErrores) {
            return;
        }

        const listaErrores = erroresOrdenados();

        if (!listaErrores.length) {
            resumenErrores.replaceChildren();
            resumenErrores.hidden = true;
            return;
        }

        const titulo = document.createElement('h2');
        titulo.textContent = 'Revisa estos campos';

        const lista = document.createElement('ul');

        listaErrores.forEach((error) => {
            const item = document.createElement('li');
            const enlace = document.createElement('a');

            const destino = error.campo === 'extras'
                ? 'error-extras'
                : error.campo === 'producto'
                    ? 'producto-clase-a'
                    : error.campo === 'metodoPago'
                        ? 'metodoDomiciliacion'
                        : error.campo;

            enlace.href = `#${destino}`;
            enlace.dataset.errorPaso = String(error.paso);
            enlace.dataset.errorCampo = error.campo;
            enlace.textContent = `Paso ${error.paso} · ${error.etiqueta}: ${error.mensaje}`;

            item.append(enlace);
            lista.append(item);
        });

        resumenErrores.replaceChildren(titulo, lista);
        resumenErrores.hidden = false;
    }

    function targetDeCampo(campo) {
        if (campo === 'producto') {
            return document.getElementById('producto-clase-a');
        }

        if (campo === 'extras') {
            return document.getElementById('titulo-paso-2');
        }

        if (campo === 'metodoPago') {
            return document.getElementById('metodoDomiciliacion');
        }

        return document.getElementById(campo);
    }

    function abrirError(error) {
        if (!error) {
            return;
        }

        window.Config.irAPaso(error.paso, { focus: false, scroll: false });

        const target = targetDeCampo(error.campo);
        if (!target) {
            return;
        }

        target.focus({ preventScroll: true });

        const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
            behavior: reducido ? 'auto' : 'smooth',
            block: 'center'
        });
    }

    function abrirPrimerError() {
        abrirError(erroresOrdenados()[0]);
    }

    if (resumenErrores) {
        resumenErrores.addEventListener('click', (event) => {
            const enlace = event.target.closest('a[data-error-campo]');
            if (!enlace) {
                return;
            }

            event.preventDefault();
            const error = errores.get(enlace.dataset.errorCampo);

            if (error) {
                abrirError(error);
            }
        });
    }

    /* -----------------------------------------------------
       Validaciones por paso
       ----------------------------------------------------- */
    function validarPaso1() {
        limpiarErroresDePaso(1);

        const producto = form.querySelector('input[name="producto"]:checked');
        if (!producto) {
            marcarError('producto', 1, 'Selecciona un vehículo.');
            return false;
        }

        return true;
    }

    function validarPaso2() {
        limpiarErroresDePaso(2);

        const producto = window.Config.estado.producto;
        const seleccionados = Array.from(form.querySelectorAll('input[name="extras"]:checked'));
        let invalido = false;

        seleccionados.forEach((extra) => {
            const requiere = extra.dataset.requiere || '';
            const incompatible = extra.dataset.incompatible || '';

            if (requiere && (!producto || producto.valor !== requiere)) {
                invalido = true;
            }

            if (incompatible) {
                const otro = document.getElementById(incompatible);
                if (otro && otro.checked) {
                    invalido = true;
                }
            }
        });

        if (invalido) {
            marcarError('extras', 2, 'Hay extras incompatibles con el vehículo o entre sí.');
            return false;
        }

        return true;
    }

    function validarPaso3() {
        limpiarErroresDePaso(3);

        const valor = (id) => {
            const input = document.getElementById(id);
            return input ? input.value : '';
        };

        if (!validarRequerido(valor('nombre'))) {
            marcarError('nombre', 3, 'Introduce tu nombre.');
        } else if (!validarNombre(valor('nombre'))) {
            marcarError('nombre', 3, 'El nombre solo puede contener letras, espacios, apóstrofos o guiones.');
        }

        if (!validarRequerido(valor('apellidos'))) {
            marcarError('apellidos', 3, 'Introduce tus apellidos.');
        } else if (!validarNombre(valor('apellidos'))) {
            marcarError('apellidos', 3, 'Los apellidos solo pueden contener letras, espacios, apóstrofos o guiones.');
        }

        if (!validarRequerido(valor('dni'))) {
            marcarError('dni', 3, 'Introduce tu DNI.');
        } else if (!validarDNI(valor('dni'))) {
            marcarError('dni', 3, 'Introduce un DNI válido: 8 cifras y letra de control.');
        }

        const fecha = valor('fechaNacimiento');
        if (!validarRequerido(fecha)) {
            marcarError('fechaNacimiento', 3, 'Introduce tu fecha de nacimiento.');
        } else {
            const resultadoFecha = validarFechaNacimiento(fecha);
            if (!resultadoFecha.valida) {
                if (resultadoFecha.motivo === 'futuro') {
                    marcarError('fechaNacimiento', 3, 'La fecha de nacimiento no puede estar en el futuro.');
                } else if (resultadoFecha.motivo === 'edad') {
                    marcarError('fechaNacimiento', 3, 'Debes ser mayor de 18 años.');
                } else {
                    marcarError('fechaNacimiento', 3, 'Introduce una fecha de nacimiento válida.');
                }
            }
        }

        if (!validarRequerido(valor('email'))) {
            marcarError('email', 3, 'Introduce tu correo electrónico.');
        } else if (!validarEmail(valor('email'))) {
            marcarError('email', 3, 'Introduce un correo electrónico válido.');
        }

        if (!validarRequerido(valor('emailConfirmacion'))) {
            marcarError('emailConfirmacion', 3, 'Confirma tu correo electrónico.');
        } else if (!validarEmail(valor('emailConfirmacion'))) {
            marcarError('emailConfirmacion', 3, 'Introduce un correo electrónico válido.');
        } else if (normalizarEmail(valor('email')) !== normalizarEmail(valor('emailConfirmacion'))) {
            marcarError('emailConfirmacion', 3, 'Los correos electrónicos no coinciden.');
        }

        if (!validarRequerido(valor('telefono'))) {
            marcarError('telefono', 3, 'Introduce tu teléfono.');
        } else if (!validarTelefono(valor('telefono'))) {
            marcarError('telefono', 3, 'Introduce un teléfono español de 9 cifras que empiece por 6, 7, 8 o 9.');
        }

        return !Array.from(errores.values()).some((error) => error.paso === 3);
    }

    function validarPaso4() {
        limpiarErroresDePaso(4);

        const valor = (id) => {
            const input = document.getElementById(id);
            return input ? input.value : '';
        };

        if (!validarRequerido(valor('tipoVia'))) {
            marcarError('tipoVia', 4, 'Selecciona el tipo de vía.');
        }

        if (!validarRequerido(valor('nombreVia'))) {
            marcarError('nombreVia', 4, 'Introduce el nombre de la vía.');
        }

        if (!validarRequerido(valor('numero'))) {
            marcarError('numero', 4, 'Introduce el número.');
        }

        const codigoPostal = valor('codigoPostal');
        const provincia = valor('provincia');

        if (!validarRequerido(codigoPostal)) {
            marcarError('codigoPostal', 4, 'Introduce el código postal.');
        } else if (!/^\d{5}$/.test(codigoPostal)) {
            marcarError('codigoPostal', 4, 'El código postal debe tener 5 cifras.');
        } else {
            const prefijo = Number(codigoPostal.slice(0, 2));
            if (prefijo < 1 || prefijo > 52) {
                marcarError('codigoPostal', 4, 'El prefijo del código postal no es válido (01-52).');
            } else if (validarProvincia(provincia) && codigoPostal.slice(0, 2) !== provincia) {
                marcarError('codigoPostal', 4, 'El código postal no corresponde a la provincia seleccionada.');
            }
        }

        if (!validarRequerido(valor('localidad'))) {
            marcarError('localidad', 4, 'Introduce la localidad.');
        }

        if (!validarProvincia(provincia)) {
            marcarError('provincia', 4, 'Selecciona una provincia.');
        }

        return !Array.from(errores.values()).some((error) => error.paso === 4);
    }

    function validarPaso5() {
        limpiarErroresDePaso(5);

        const metodo = form.querySelector('input[name="metodoPago"]:checked');
        if (!metodo) {
            marcarError('metodoPago', 5, 'Selecciona un método de pago.');
            return false;
        }

        const valor = (id) => {
            const input = document.getElementById(id);
            return input ? input.value : '';
        };

        if (metodo.value === 'domiciliacion') {
            if (!validarTitular(valor('titularCuenta'))) {
                marcarError('titularCuenta', 5, 'Introduce el titular de la cuenta.');
            }

            if (!validarRequerido(valor('iban'))) {
                marcarError('iban', 5, 'Introduce el IBAN.');
            } else if (!validarIBAN(valor('iban'))) {
                marcarError('iban', 5, 'Introduce un IBAN español válido: ES + 22 cifras y dígitos de control.');
            }
        } else {
            if (!validarTitular(valor('titularTarjeta'))) {
                marcarError('titularTarjeta', 5, 'Introduce el titular de la tarjeta.');
            }

            const numero = valor('numeroTarjeta').replace(/\D/g, '');
            if (!numero) {
                marcarError('numeroTarjeta', 5, 'Introduce el número de la tarjeta.');
            } else if (!/^\d{16}$/.test(numero)) {
                marcarError('numeroTarjeta', 5, 'El número de la tarjeta debe tener 16 cifras.');
            } else if (!validarNumeroTarjeta(numero)) {
                marcarError('numeroTarjeta', 5, 'El número de la tarjeta no es válido (Luhn).');
            }

            const caducidad = valor('caducidad');
            if (!validarRequerido(caducidad)) {
                marcarError('caducidad', 5, 'Introduce la caducidad.');
            } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(caducidad)) {
                marcarError('caducidad', 5, 'Usa el formato MM/AA.');
            } else if (!validarCaducidad(caducidad)) {
                marcarError('caducidad', 5, 'La tarjeta está caducada.');
            }

            if (!validarRequerido(valor('cvv'))) {
                marcarError('cvv', 5, 'Introduce el CVV.');
            } else if (!validarCVV(valor('cvv'))) {
                marcarError('cvv', 5, 'El CVV debe tener 3 cifras.');
            }
        }

        return !Array.from(errores.values()).some((error) => error.paso === 5);
    }

    function validarPaso6() {
        limpiarErroresDePaso(6);

        const condiciones = document.getElementById('aceptoCondiciones');
        const privacidad = document.getElementById('aceptoPrivacidad');

        if (condiciones && !condiciones.checked) {
            marcarError('aceptoCondiciones', 6, 'Debes aceptar las condiciones de contratación.');
        }

        if (privacidad && !privacidad.checked) {
            marcarError('aceptoPrivacidad', 6, 'Debes aceptar la política de privacidad.');
        }

        return !Array.from(errores.values()).some((error) => error.paso === 6);
    }

    function validarPasoInterno(paso) {
        switch (Number(paso)) {
            case 1:
                return validarPaso1();
            case 2:
                return validarPaso2();
            case 3:
                return validarPaso3();
            case 4:
                return validarPaso4();
            case 5:
                return validarPaso5();
            case 6:
                return validarPaso6();
            default:
                return true;
        }
    }

    function validarPaso(paso) {
        const valido = validarPasoInterno(paso);
        renderResumenErrores();

        if (!valido) {
            abrirPrimerError();
        }

        return valido;
    }

    function validarTodo() {
        let valido = true;

        for (let paso = 1; paso <= 6; paso += 1) {
            if (!validarPasoInterno(paso)) {
                valido = false;
            }
        }

        renderResumenErrores();

        if (!valido) {
            abrirPrimerError();
        }

        if (typeof window.Config.actualizarResumen === 'function') {
            window.Config.actualizarResumen();
        }
        if (typeof window.Config.actualizarShowroom === 'function') {
            window.Config.actualizarShowroom();
        }

        return valido;
    }

    /* -----------------------------------------------------
       Actualización de errores al corregir
       ----------------------------------------------------- */
    function revalidarPasoDeCampo(campo) {
        const input = document.getElementById(campo);
        if (!input) {
            return;
        }

        const paso = Number(input.closest('.config-step')?.dataset.paso || 0);
        if (!paso || !errores.has(campo)) {
            return;
        }

        validarPasoInterno(paso);
        renderResumenErrores();
    }

    form.querySelectorAll('input[name="producto"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            if (errores.has('producto')) {
                validarPasoInterno(1);
                renderResumenErrores();
            }
        });
    });

    form.querySelectorAll('input[name="extras"]').forEach((input) => {
        input.addEventListener('change', () => {
            if (errores.has('extras')) {
                validarPasoInterno(2);
                renderResumenErrores();
            }
        });
    });

    form.querySelectorAll('input[name="metodoPago"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            limpiarErroresDePaso(5);
            renderResumenErrores();
        });
    });

    [
        'nombre', 'apellidos', 'dni', 'fechaNacimiento', 'email', 'emailConfirmacion', 'telefono',
        'tipoVia', 'nombreVia', 'numero', 'piso', 'codigoPostal', 'localidad', 'provincia',
        'titularCuenta', 'iban', 'titularTarjeta', 'numeroTarjeta', 'caducidad', 'cvv'
    ].forEach((campo) => {
        const input = document.getElementById(campo);
        if (!input) {
            return;
        }

        ['input', 'change'].forEach((evento) => {
            input.addEventListener(evento, () => revalidarPasoDeCampo(campo));
        });
    });

    ['aceptoCondiciones', 'aceptoPrivacidad'].forEach((campo) => {
        const input = document.getElementById(campo);
        if (!input) {
            return;
        }

        input.addEventListener('change', () => {
            if (errores.has(campo)) {
                validarPasoInterno(6);
                renderResumenErrores();
            }
        });
    });

    /* -----------------------------------------------------
       API compartida
       ----------------------------------------------------- */
    window.Validaciones = Object.assign(window.Validaciones || {}, {
        validarPaso,
        validarTodo,
        limpiarTexto,
        normalizarEmail,
        normalizarTelefono,
        validarNombre,
        validarEmail,
        validarTelefono,
        validarDNI,
        validarFechaNacimiento,
        esMayorDeEdad,
        validarCodigoPostal,
        validarIBAN,
        validarNumeroTarjeta,
        validarCaducidad,
        validarCVV,
        validarProvincia
    });

    window.Config.validarTodo = validarTodo;

    renderResumenErrores();
})();
