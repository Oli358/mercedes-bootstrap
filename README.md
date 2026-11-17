# Mercedes-Benz · Configurador de contratación

Práctica 2 de **Desarrollo de Interfaces**. La home original de Mercedes-Benz se amplía con un configurador de contratación simulado de seis pasos: producto, extras, datos personales, dirección, pago y resumen.

> **Simulación académica:** no hay backend, no se envía ningún dato a un servidor y no se realiza ningún cobro. Todos los datos y precios son ficticios.

## Demo

| Página | Archivo | Contenido |
|---|---|---|
| Home | `index.html` | Home original, accesos a la contratación y modal de confirmación |
| Configurador | `contratacion.html` | Formulario de seis pasos, validaciones, showroom y resumen |

## Cómo ejecutar

1. Abre `index.html` en Chrome, Edge o Firefox.
2. Pulsa **Configura y contrata** o cualquiera de los enlaces **Pruébalo**.
3. También puedes servir la carpeta con un servidor local:

```bash
python -m http.server 8000
```

Y abrir `http://localhost:8000`.

No hay instalación, build ni dependencias que instalar: Bootstrap y las imágenes están en el propio repositorio. Las fuentes de la home se cargan desde Google Fonts; si no hay conexión, el navegador usa las fuentes de reserva.

## Escenario

El usuario simula la contratación de un vehículo Mercedes-Benz. Primero elige el modelo y los extras; después introduce sus datos personales y su dirección; configura el pago con domiciliación o tarjeta simulada; revisa el desglose y acepta las condiciones. Al confirmar, vuelve a la home y se muestra el modal **Solicitud registrada correctamente**.

### Productos

| Producto | Aportación inicial | Cuota |
|---|---:|---:|
| Mercedes-Benz Clase A 250e | 12.467 € | 295 €/mes |
| Mercedes-AMG G 63 | 45.000 € | 1.490 €/mes |
| Mercedes-Maybach S 680 | 60.000 € | 1.890 €/mes |

### Extras

- **Mantenimiento y neumáticos:** 35 €/mes.
- **Seguro a todo riesgo:** 45 €/mes.
- **Wallbox y instalación:** 1.200 € (solo Clase A 250e).
- **Pack AMG Night:** 1.500 € (solo AMG G 63; incompatible con Pack Confort).
- **Pack Chófer:** 2.500 € (solo Maybach S 680).
- **Pack Confort:** 900 € (incompatible con Pack AMG Night).

Los pagos únicos y las cuotas se muestran por separado. El cálculo se centraliza en `js/precios.js` y se actualiza en el showroom y en el resumen.

## Recorrido de seis pasos

1. **Producto principal:** tres vehículos en tarjetas con selección accesible. Solo se puede elegir uno.
2. **Complementos:** extras opcionales con dependencias por modelo e incompatibilidad entre AMG Night y Pack Confort.
3. **Datos personales:** nombre, apellidos, DNI, correo y confirmación, teléfono y fecha de nacimiento. Contratación solo para mayores de 18 años.
4. **Dirección:** tipo y nombre de vía, número, piso, código postal, localidad y provincia. Escenario limitado a España.
5. **Pago:** domiciliación bancaria (titular e IBAN español) o tarjeta simulada (titular, número, caducidad y CVV). Solo se validan los campos del método activo.
6. **Resumen:** producto, extras, datos, dirección, pago y desglose de totales. Permite volver a editar cada bloque. Incluye dos casillas obligatorias y una comercial opcional.

## Datos ficticios de prueba

| Campo | Valor |
|---|---|
| Producto | Clase A 250e |
| Extras | Mantenimiento y neumáticos (35 €/mes) + Wallbox (1.200 €) |
| Nombre | Ana |
| Apellidos | García López |
| DNI | `12345678Z` |
| Correo | `ana.garcia@example.com` |
| Teléfono | `612 345 678` |
| Fecha de nacimiento | `1990-01-01` |
| Dirección | Calle Alcalá 50, 3º B |
| Código postal | `28014` |
| Localidad | Madrid |
| Provincia | `28` · Madrid |
| IBAN | `ES91 2100 0418 4502 0005 1332` |
| Tarjeta | `4242 4242 4242 4242` |
| Caducidad | `12/30` |
| CVV | `123` |

Para probar los errores, usa un DNI como `12345678A`, un IBAN como `ES91 2100 0418 4502 0005 1333`, una tarjeta como `4242 4242 4242 4241` o una fecha de nacimiento posterior a hoy.

## Validaciones y pruebas

- El formulario usa `novalidate` y valida todo con JavaScript nativo.
- Se comprueban obligatoriedad con `trim`, formato de correo y coincidencia, teléfono español, letra del DNI, edad, código postal y provincia, IBAN mediante módulo 97, tarjeta mediante Luhn, caducidad, CVV y casillas legales.
- Los errores se muestran junto a cada campo y en un resumen con enlaces. El formulario abre el paso del primer error, hace scroll y enfoca el control sin perder los datos válidos.
- La tabla completa de las **12 pruebas funcionales**, con capturas incrustadas, está en [`docs/pruebas.md`](docs/pruebas.md).
- Las comprobaciones de teclado, móvil y escritorio también están en `docs/pruebas.md`.

## Comprobaciones finales

- Home → **Configura y contrata** → configurador → confirmación → modal: correcto.
- Móvil 390 px: home, CTA y paso 1 sin scroll horizontal; el recorrido completo está documentado en `docs/pruebas.md`.
- Escritorio 1440 px: sin scroll horizontal.
- Teclado: selección con Espacio y flechas, avance con Enter, foco en el primer error y cierre de modales con Esc.
- Consola del navegador: 0 errores.

## Estructura del proyecto

```text
.
├── index.html
├── contratacion.html
├── css/
│   ├── bootstrap.min.css
│   ├── custom-css.css
│   └── contratacion.css
├── js/
│   ├── bootstrap.bundle.min.js
│   ├── gama.js
│   ├── contratacion.js
│   ├── precios.js
│   ├── vehiculo.js
│   ├── extras.js
│   ├── datos.js
│   ├── direccion.js
│   ├── pago.js
│   ├── resumen.js
│   ├── validaciones.js
│   ├── envio.js
│   └── confirmacion.js
├── images/
└── docs/
    ├── guia-visual-configurador.md
    ├── pruebas.md
    └── t13-*.png
```

## Tecnologías

- HTML5 y CSS propio.
- Bootstrap 5 (CSS y JavaScript incluidos en local).
- JavaScript nativo (ES6+), sin React, Vue, Angular, jQuery ni librerías externas de formularios o validación.
- `Intl.NumberFormat` para los importes en euros.
- `sessionStorage` para la confirmación y `history.replaceState` para limpiar la URL.

## Documentación

- [`docs/pruebas.md`](docs/pruebas.md): 12 pruebas funcionales, resultados, capturas, copia sin validación HTML, teclado, móvil y escritorio.
- [`docs/guia-visual-configurador.md`](docs/guia-visual-configurador.md): guía visual, identificadores, orden de scripts y decisiones de diseño.

## Tablero de Jira

- Proyecto **SCRUM**: tareas SCRUM-6 a SCRUM-19 (T1-T14).
- **Enlace o exportación del tablero:** pendiente de añadir en la entrega final (URL pública de Jira o `docs/tablero-jira.pdf` / `.csv`).

La documentación de IA de cada tarea (modelo, prompt EARS, corrección, reflexión y evidencia) está dentro de su tarea correspondiente en Jira.

## Limitaciones

- No hay backend ni persistencia de datos.
- No hay pasarela de pago real ni TPV: la tarjeta y el IBAN son simulados.
- Los precios, modelos y textos legales son ficticios y solo tienen validez académica.
