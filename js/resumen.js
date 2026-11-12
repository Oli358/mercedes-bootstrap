/* =========================================================
   T9: RESUMEN Y CONFIRMACIÓN
   ---------------------------------------------------------
   Renderiza el resumen editable, separa pagos únicos de
   cuotas, actualiza los totales y guarda el estado de las
   casillas legales. El envío definitivo llega en T12.
   ========================================================= */

(function () {
    'use strict';

    const form = document.getElementById('formContratacion');
    if (!form || !window.Config) {
        return;
    }

    const contenedores = {
        producto: document.getElementById('resumenProducto'),
        extras: document.getElementById('resumenExtras'),
        datos: document.getElementById('resumenDatos'),
        direccion: document.getElementById('resumenDireccion'),
        pago: document.getElementById('resumenPago')
    };

    const totales = {
        hoy: document.getElementById('totalHoy'),
        mensual: document.getElementById('totalMensual'),
        aportacion: document.getElementById('lineaAportacion'),
        extrasUnicos: document.getElementById('lineaExtrasUnicos'),
        cuota: document.getElementById('lineaCuota'),
        extrasMensuales: document.getElementById('lineaExtrasMensuales')
    };

    const legal = {
        condiciones: document.getElementById('aceptoCondiciones'),
        privacidad: document.getElementById('aceptoPrivacidad'),
        comercial: document.getElementById('aceptoComercial')
    };

    const formatoEuro = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
        useGrouping: 'always'
    });

    function formatearEuro(valor) {
        if (window.Precios && typeof window.Precios.formatearEuro === 'function') {
            return window.Precios.formatearEuro(valor);
        }
        return formatoEuro.format(Number(valor) || 0);
    }

    function formatearFecha(iso) {
        if (!iso) {
            return '—';
        }

        const partes = String(iso).split('-');
        if (partes.length !== 3) {
            return iso;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    function estaVacio(valor) {
        return valor === undefined || valor === null || String(valor).trim() === '';
    }

    function crearVacio(texto) {
        const parrafo = document.createElement('p');
        parrafo.className = 'resumen-vacio';
        parrafo.textContent = texto;
        return parrafo;
    }

    function crearLista(filas) {
        const lista = document.createElement('dl');
        lista.className = 'mb-0';

        filas.forEach(([etiqueta, valor]) => {
            const fila = document.createElement('div');
            fila.className = 'resumen-fila';

            const dt = document.createElement('dt');
            dt.textContent = etiqueta;

            const dd = document.createElement('dd');
            dd.textContent = estaVacio(valor) ? '—' : valor;

            fila.append(dt, dd);
            lista.append(fila);
        });

        return lista;
    }

    function renderProducto() {
        const contenedor = contenedores.producto;
        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        const producto = window.Config.estado.producto;
        if (!producto) {
            contenedor.append(crearVacio('Sin vehículo seleccionado.'));
            return;
        }

        const nombre = document.createElement('p');
        nombre.className = 'resumen-destacado';
        nombre.textContent = producto.modelo;

        const detalle = document.createElement('p');
        detalle.className = 'resumen-sub';
        detalle.textContent = `${producto.lineaTexto} · ${formatearEuro(producto.precioMensual)}/mes · ${formatearEuro(producto.precioUnico)} de aportación inicial`;

        contenedor.append(nombre, detalle);
    }

    function renderExtras() {
        const contenedor = contenedores.extras;
        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        const extras = Array.isArray(window.Config.estado.extras) ? window.Config.estado.extras : [];
        if (!extras.length) {
            contenedor.append(crearVacio('Sin extras seleccionados.'));
            return;
        }

        const filas = extras.map((extra) => {
            const precio = extra.precioMensual
                ? `${formatearEuro(extra.precioMensual)}/mes`
                : formatearEuro(extra.precioUnico);
            return [extra.nombre, precio];
        });

        contenedor.append(crearLista(filas));
    }

    function renderDatos() {
        const contenedor = contenedores.datos;
        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        const datos = window.Config.estado.datos || {};
        const claves = ['nombre', 'apellidos', 'dni', 'email', 'telefono', 'fechaNacimiento'];
        const tieneDatos = claves.some((clave) => !estaVacio(datos[clave]));

        if (!tieneDatos) {
            contenedor.append(crearVacio('Sin completar.'));
            return;
        }

        const nombreCompleto = `${datos.nombre || ''} ${datos.apellidos || ''}`.trim();
        contenedor.append(crearLista([
            ['Nombre', nombreCompleto],
            ['DNI', datos.dni],
            ['Correo', datos.email],
            ['Teléfono', datos.telefono],
            ['Fecha de nacimiento', formatearFecha(datos.fechaNacimiento)]
        ]));
    }

    function renderDireccion() {
        const contenedor = contenedores.direccion;
        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        const direccion = window.Config.estado.direccion || {};
        const claves = ['tipoVia', 'nombreVia', 'numero', 'piso', 'codigoPostal', 'localidad', 'provincia'];
        const tieneDireccion = claves.some((clave) => !estaVacio(direccion[clave]));

        if (!tieneDireccion) {
            contenedor.append(crearVacio('Sin completar.'));
            return;
        }

        const linea = `${direccion.tipoVia || ''} ${direccion.nombreVia || ''} ${direccion.numero || ''}`.trim();
        const lineaCompleta = direccion.piso ? `${linea}, ${direccion.piso}` : linea;

        contenedor.append(crearLista([
            ['Dirección', lineaCompleta],
            ['Código postal', direccion.codigoPostal],
            ['Localidad', direccion.localidad],
            ['Provincia', direccion.provinciaNombre]
        ]));
    }

    function renderPago() {
        const contenedor = contenedores.pago;
        if (!contenedor) {
            return;
        }

        contenedor.replaceChildren();

        const pago = window.Config.estado.pago || {};
        const metodo = pago.metodo || 'domiciliacion';

        if (metodo === 'tarjeta') {
            const digitos = String(pago.numeroTarjeta || '').replace(/\D/g, '');
            const ultimos = digitos.slice(-4);

            contenedor.append(crearLista([
                ['Método', 'Tarjeta simulada'],
                ['Titular', pago.titularTarjeta],
                ['Tarjeta', ultimos ? `•••• ${ultimos}` : '']
            ]));
            return;
        }

        const iban = String(pago.iban || '').replace(/\s/g, '');
        const ultimosIban = iban.slice(-4);

        contenedor.append(crearLista([
            ['Método', 'Domiciliación bancaria'],
            ['Titular', pago.titularCuenta],
            ['IBAN', ultimosIban ? `•••• ${ultimosIban}` : '']
        ]));
    }

    function renderTotales() {
        const producto = window.Config.estado.producto;
        const extras = Array.isArray(window.Config.estado.extras) ? window.Config.estado.extras : [];

        if (!producto) {
            Object.values(totales).forEach((elemento) => {
                if (elemento) {
                    elemento.textContent = '—';
                }
            });
            return;
        }

        let precios;

        if (window.Precios && typeof window.Precios.calcular === 'function') {
            precios = window.Precios.calcular(producto, extras);
        } else {
            const aportacion = Number(producto.precioUnico) || 0;
            const extrasUnicos = extras.reduce((total, extra) => total + (Number(extra.precioUnico) || 0), 0);
            const cuota = Number(producto.precioMensual) || 0;
            const extrasMensuales = extras.reduce((total, extra) => total + (Number(extra.precioMensual) || 0), 0);

            precios = {
                aportacion,
                extrasUnicos,
                cuota,
                extrasMensuales,
                totalHoy: aportacion + extrasUnicos,
                totalMensual: cuota + extrasMensuales
            };
        }

        if (totales.hoy) {
            totales.hoy.textContent = formatearEuro(precios.totalHoy);
        }
        if (totales.mensual) {
            totales.mensual.textContent = `${formatearEuro(precios.totalMensual)}/mes`;
        }
        if (totales.aportacion) {
            totales.aportacion.textContent = formatearEuro(precios.aportacion);
        }
        if (totales.extrasUnicos) {
            totales.extrasUnicos.textContent = formatearEuro(precios.extrasUnicos);
        }
        if (totales.cuota) {
            totales.cuota.textContent = `${formatearEuro(precios.cuota)}/mes`;
        }
        if (totales.extrasMensuales) {
            totales.extrasMensuales.textContent = `${formatearEuro(precios.extrasMensuales)}/mes`;
        }
    }

    function renderTodo() {
        renderProducto();
        renderExtras();
        renderDatos();
        renderDireccion();
        renderPago();
        renderTotales();
    }

    function actualizarLegal() {
        window.Config.estado.legal = {
            condiciones: legal.condiciones ? legal.condiciones.checked : false,
            privacidad: legal.privacidad ? legal.privacidad.checked : false,
            comercial: legal.comercial ? legal.comercial.checked : false
        };

        document.dispatchEvent(new CustomEvent('config:legal', {
            detail: {
                legal: window.Config.estado.legal,
                estado: window.Config.estado
            }
        }));
    }

    ['config:producto', 'config:extras', 'config:datos', 'config:direccion', 'config:pago', 'config:paso'].forEach((evento) => {
        document.addEventListener(evento, renderTodo);
    });

    Object.values(legal).forEach((input) => {
        if (input) {
            input.addEventListener('change', actualizarLegal);
        }
    });

    window.Config.actualizarResumen = renderTodo;

    actualizarLegal();
    renderTodo();
})();
