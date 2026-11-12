# Guía visual del configurador de contratación

> **Proyecto:** Mercedes-Benz · Desarrollo de Interfaces · Práctica 2  
> **Página:** `contratacion.html`  
> **Última actualización:** 11/11/2026  
> **Estado:** documento vivo. Si cambia una decisión visual o técnica, se actualiza este archivo en el mismo commit.

---

## 1. Para qué sirve esta guía

Esta guía fija **cómo se ve, cómo se comporta y cómo se construye** el configurador de contratación. Sirve para que las dos personas del equipo trabajemos con la misma referencia y para que las tareas T7-T9 (dirección, pago y resumen) encajen visualmente con las tareas T1-T6.

No sustituye al enunciado del profesor, al README ni a la documentación de Jira. Los complementa.

**Regla de oro:** si una decisión visual no está en esta guía, no se inventa en una tarea. Se propone, se acuerda y se añade aquí antes de implementarla.

---

## 2. Resumen de la experiencia

- El formulario vive en una **página aparte**, `contratacion.html`. No se mete dentro de `index.html`.
- Es un **configurador a pantalla completa**, con estética de concesionario: contenido a la izquierda y un “showroom” sticky a la derecha con el coche, el precio y el resumen en vivo.
- Tiene **seis pasos**: vehículo, extras, datos personales, dirección, pago y resumen.
- Al confirmar, se vuelve a la home y se abre un **modal Bootstrap** con “Solicitud registrada correctamente”.
- No hay backend, ni pasarela real, ni cobros. Todos los datos y precios son ficticios.
- La home es la fuente de identidad: mismos colores, tipografía, logo, botones y tono. El configurador no copia la navbar ni el footer completos; usa una barra superior fina y un pie legal mínimo para parecer una app de concesionario.

---

## 3. Flujo de usuario

```text
Home
  └─ CTA "Configura y contrata" / selector Mercedes-Benz · AMG · Maybach
       └─ contratacion.html
            ├─ Paso 1: vehículo
            ├─ Paso 2: extras
            ├─ Paso 3: datos personales
            ├─ Paso 4: dirección
            ├─ Paso 5: pago
            └─ Paso 6: resumen y confirmación
                 └─ Validación completa OK
                      └─ index.html + modal "Solicitud registrada correctamente"
```

Reglas de navegación:

- **Anterior** nunca valida ni borra datos.
- **Siguiente** valida el paso actual. Si hay errores, no avanza.
- No se puede saltar hacia delante sin validar los pasos anteriores.
- Desde el resumen se puede volver a un paso concreto para editar (`data-ir-a`), sin perder el resto.
- Al confirmar se validan todos los pasos y se recalcula el total.
- Si el formulario es KO: resumen de errores, salto al primer paso afectado, ancla y foco en el primer campo incorrecto.
- Si es OK: se guarda un aviso en `sessionStorage`, se vuelve a la home y el modal se muestra una sola vez. No debe aparecer al entrar directamente en la home ni al recargar después de verlo.

---

## 4. Layout general

### 4.1. Escritorio (≥ 1200 px)

```text
┌─────────────────────────────────────────────────────────────────────┐
│ ★  MERCEDES-BENZ    Configurador de contratación    Paso 1/6  Salir │  72 px
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   3 px
├──────────────────────────────────┬──────────────────────────────────┤
│  PASO 1 · VEHÍCULO               │                                  │
│                                  │        [ IMAGEN COCHE ]          │
│  Elige tu Mercedes.              │                                  │
│  Tres formas de entender el lujo.│   MERCEDES-BENZ                  │
│                                  │   Clase A 250e                   │
│  ┌────────────────────────────┐  │   Híbrido enchufable · 218 CV    │
│  │ [foto]  Clase A 250e    ○  │  │                                  │
│  │ 295 €/mes · 12.467 €       │  │   ── Tu configuración ──         │
│  └────────────────────────────┘  │   Vehículo      Clase A 250e     │
│  ┌────────────────────────────┐  │   Extras        —                │
│  │ [foto]  AMG G 63        ○  │  │   Pago único    12.467 €         │
│  │ 1.490 €/mes · 45.000 €     │  │   Cuota         295 €/mes        │
│  └────────────────────────────┘  │                                  │
│  ┌────────────────────────────┐  │   Precios de simulación          │
│  │ [foto]  Maybach S 680   ○  │  │                                  │
│  │ 1.890 €/mes · 60.000 €     │  │                                  │
│  └────────────────────────────┘  │                                  │
│                                  │                                  │
│  ← Anterior            Siguiente →│                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

- **Barra superior** negra, sticky, de 72 px. Logo, título, paso actual, “Salir” y línea de progreso.
- **Columna izquierda** (7/12): pasos y formulario. Ancho máximo de lectura: 760 px. Fondo blanco cálido.
- **Columna derecha** (5/12): showroom oscuro, sticky, altura `calc(100vh - 72px)`. En el paso 6 se convierte en el checkout.
- **Pie legal** mínimo, no el footer completo de la home.
- El scroll es natural en la página; el showroom se queda fijo. No hay scroll interno en el showroom.

### 4.2. Tablet (992-1199 px)

- Una sola columna.
- El showroom se convierte en una **tarjeta de resumen** al final del formulario: imagen 21:9, modelo, precio y filas de resumen en horizontal.
- No es sticky.
- La barra superior se mantiene.

### 4.3. Móvil (< 992 px)

```text
┌──────────────────────────────────────┐
│ ★  Mercedes-Benz        Paso 1/6  ✕ │
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├──────────────────────────────────────┤
│  PASO 1 · VEHÍCULO                   │
│  Elige tu Mercedes.                  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [foto 16:9]                    │  │
│  │ Clase A 250e            ○      │  │
│  │ 295 €/mes · 12.467 € inicial   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ [foto 16:9]                    │  │
│  │ AMG G 63                ○      │  │
│  │ 1.490 €/mes · 45.000 € inicial │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ [foto 16:9]                    │  │
│  │ Maybach S 680           ○      │  │
│  │ 1.890 €/mes · 60.000 € inicial │  │
│  └────────────────────────────────┘  │
│                                      │
│  ← Anterior                          │
├──────────────────────────────────────┤
│  Desde 295 €/mes        Siguiente →  │  barra sticky inferior
└──────────────────────────────────────┘
```

- El showroom aparece al final del formulario, no sticky: imagen pequeña, modelo y precio.
- Barra inferior sticky con Anterior y Siguiente. El precio se añadirá a la barra en T11 si da tiempo; mientras tanto se consulta en el showroom.
- `padding-bottom` extra para que la barra no tape el último contenido.
- Stepper horizontal con scroll si no cabe, o solo números. Siempre visible “Paso X de 6”.
- Objetivo: cero scroll horizontal a 320 px. Targets táctiles de al menos 44 × 44 px.

### 4.4. Ancho y espaciados

- Contenido izquierdo: máximo 760 px, padding lateral `clamp(1.25rem, 4vw, 3.5rem)`.
- Showroom: 40 % del ancho, máximo 560 px.
- Separación vertical entre bloques: 24-48 px.
- Escala de espaciado: 4, 8, 12, 16, 24, 32, 48, 64, 96 px.

---

## 5. Identidad visual

### 5.1. Principios

1. **Editorial y premium:** titulares serif grandes, mucho aire, fotografía protagonista.
2. **Alto contraste:** negro sobre blanco cálido; sin grises lavados.
3. **Minimalismo:** pocos colores, bordes finos, sombras suaves, cero efectos recargados.
4. **Fotografía de coche:** las imágenes mandan; la interfaz no compite con ellas.
5. **Nada de Bootstrap por defecto:** nada de azul, bordes redondeados genéricos ni botones estándar sin personalizar.
6. **Continuidad con la home:** mismos logos, fuentes, tono y lenguaje de botones.

### 5.2. Paleta

| Token | Hex | Uso |
|---|---|---|
| `--config-ink` | `#0b0b0b` | Texto principal, barra superior, botones, bordes seleccionados |
| `--config-bg` | `#f7f5f0` | Fondo de la página |
| `--config-surface` | `#ffffff` | Tarjetas, formularios, inputs |
| `--config-surface-alt` | `#efece5` | Stage del coche, hover suave, fondos secundarios |
| `--config-muted` | `#6f6f6f` | Texto secundario, ayudas, metadatos |
| `--config-line` | `#e3dfd7` | Bordes de tarjetas e inputs |
| `--config-line-strong` | `#c9c4ba` | Hover de bordes, separadores |
| `--config-amg` | `#c8102e` | Acento AMG: badge, línea o detalle. Nunca fondos grandes |
| `--config-maybach` | `#b49b6b` | Acento Maybach: badge, línea o detalle. Nunca fondos grandes |
| `--config-error` | `#b42318` | Errores y bordes inválidos |
| `--config-success` | `#1f6b3a` | Confirmaciones. Siempre con icono o texto |
| `--config-focus` | `#0b0b0b` | Anillo de foco |

Contraste mínimo: 4,5:1 para texto normal y 3:1 para texto grande. El color nunca es el único indicador de estado.

### 5.3. Tipografía

- **Display:** `"Instrument Serif", Georgia, serif` (la misma que usa la home para sus titulares).
  - Titulares de paso: `clamp(2.5rem, 4vw, 4.5rem)`, peso 400-500, `line-height: 0.98`.
  - Nombre del coche en el showroom: `clamp(1.75rem, 2.5vw, 2.75rem)`.
- **UI:** `"Roboto", system-ui, sans-serif` (ya está cargada en la home).
  - Cuerpo: 1rem / 1.6.
  - Etiquetas: 0.75rem, mayúsculas, `letter-spacing: 0.14em`, peso 500.
  - Precios: 1.25-1.75rem, peso 500, `font-variant-numeric: tabular-nums`.
- **Tono:** segunda persona (“tú”), frases cortas, sin exclamaciones, sin signos de admiración y sin anglicismos innecesarios.

### 5.4. Radios, bordes y sombras

```css
:root {
  --config-radius: 1.25rem;
  --config-radius-sm: 0.75rem;
  --config-radius-pill: 999px;
  --config-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
  --config-shadow-sm: 0 6px 18px rgba(0, 0, 0, 0.06);
  --config-border: 1px solid var(--config-line);
}
```

- Tarjetas: radio 1.25rem, borde 1px, sombra solo en hover o en el showroom.
- Inputs: radio 0.75rem, altura 48-52 px.
- Botones: pill, altura 48-52 px.
- Seleccionado: borde 2px `--config-ink`, no solo cambio de color de fondo.

### 5.5. Movimiento

- Transiciones de 180-240 ms, `ease-out`.
- Cambio de paso: fade + desplazamiento vertical de 8-12 px.
- Hover de imagen de coche: `scale(1.03)` dentro de un contenedor con `overflow: hidden`.
- Barra de progreso: transición de anchura de 300 ms.
- Pulso muy sutil del precio al actualizarse (opcional).
- Respetar `@media (prefers-reduced-motion: reduce)`: sin transformaciones ni animaciones.

---

## 6. Componentes

### 6.1. Barra superior

- Fondo `--config-ink`, texto blanco, 72 px de alto, sticky.
- Logo de Mercedes-Benz a la izquierda (enlace a `index.html`).
- Título “Configurador de contratación” en mayúsculas pequeñas, `letter-spacing`.
- A la derecha: “Paso X de 6” y enlace “Salir” con icono de flecha.
- Línea de progreso de 3 px en la parte inferior, con seis segmentos o una barra continua.
- Móvil: 56-64 px; el título puede ocultarse; el logo, el paso y “Salir” se mantienen.

### 6.2. Stepper

- Lista horizontal de seis pasos, dentro de la columna izquierda.
- Cada paso: número + etiqueta corta (Vehículo, Extras, Datos, Dirección, Pago, Resumen).
- Estado actual: texto negro, número relleno, `aria-current="step"`.
- Completado: check o número relleno, sin depender solo del color.
- Futuro: gris.
- Móvil: scroll horizontal o solo números; siempre acompañado de “Paso X de 6”.

### 6.3. Botones

| Clase | Uso | Estilo |
|---|---|---|
| `.btn-config` | Acción principal | Fondo negro, texto blanco, pill, hover invertido o opacidad |
| `.btn-config-outline` | Acción secundaria | Fondo transparente, borde negro, texto negro |
| `.btn-config-ghost` | Enlaces de edición y “Anterior” | Sin borde, texto negro, icono de flecha |
| `.btn-config-danger` | No usar salvo confirmación destructiva | Reservado |

- Altura 48-52 px, padding horizontal 24-32 px.
- Foco visible: anillo de 2 px con offset de 2 px.
- Deshabilitado: opacidad 0.35, `cursor: not-allowed`; si el botón debe seguir siendo enfocable para explicar el motivo, usar `aria-disabled="true"` y un mensaje.
- Iconos inline SVG de 18-20 px, alineados con el texto.

### 6.4. Tarjetas de vehículo

- Estructura: imagen, badge de línea, nombre, tagline, especificaciones, precio, aportación inicial y radio.
- Escritorio: tarjeta horizontal, imagen 40 %, contenido 60 %.
- Móvil: imagen 16:9 arriba, contenido debajo.
- La tarjeta entera es un `<label>`; el control real es un `<input type="radio">`.
- Estado seleccionado: borde negro de 2 px, check visible, texto “Seleccionado” y elevación suave.
- Hover: borde más oscuro, imagen con zoom suave.
- Foco: `:focus-within` con anillo visible.
- Deshabilitada: no se usa en el paso 1; todos los vehículos están disponibles.

### 6.5. Tarjetas de extras

- Estructura: icono, nombre, descripción corta, precio, etiqueta “€/mes” o “pago único”, control de selección.
- Escritorio: 2 columnas; móvil: 1 columna.
- Agrupación: “Servicios”, “Tecnología”, “Confort”.
- Seleccionado: borde negro, check, fondo blanco (no negro).
- Disponibilidad: si el extra no aplica al vehículo, se muestra deshabilitado con candado y una frase: “Solo disponible para Clase A 250e”.
- Incompatibilidad: si se elige “Pack AMG Night”, “Pack Confort” se deshabilita y se explica: “No compatible con Pack AMG Night”.
- Si cambia el vehículo, los extras no válidos se desmarcan y se muestra un aviso.

### 6.6. Campos de formulario

```html
<div class="campo">
  <label class="campo-label" for="nombre">Nombre</label>
  <input class="campo-input" id="nombre" name="nombre" type="text" autocomplete="given-name">
  <p class="campo-help" id="ayuda-nombre">Tal como aparece en tu DNI.</p>
  <p class="campo-error" id="error-nombre" aria-live="polite"></p>
</div>
```

- Etiqueta siempre visible; nunca solo placeholder.
- Altura 48-52 px, borde 1px, radio 0.75rem, fondo blanco.
- Foco: borde negro + anillo de 2 px.
- Error: borde `--config-error`, texto con icono y `aria-invalid="true"`.
- Ayuda: 0.8125rem, color muted.
- Grid: 2 columnas en escritorio, 1 en móvil; campos anchos (nombre de vía, email) ocupan 2 columnas.
- `select` con flecha SVG inline; `input[type="date"]` nativo estilizado.
- Checkboxes y radios: 20 px, `accent-color: var(--config-ink)`; en tarjetas, el control puede ser visualmente pequeño pero debe seguir siendo enfocable.

### 6.7. Pago

- Dos tarjetas grandes seleccionables: “Domiciliación bancaria” y “Tarjeta”.
- Cada una con icono, título, descripción y radio.
- El panel del método activo se muestra debajo; el inactivo se oculta con `hidden` y sus campos no se validan ni se incluyen en el resumen.
- Tarjeta simulada: componente decorativo `aria-hidden="true"`, proporción 1.586:1, fondo negro, estrella, chip, número, titular y caducidad. Se actualiza al escribir, pero la fuente de verdad son los inputs.
- Nota visible: “Simulación: no se realizará ningún cargo”.

### 6.8. Resumen y checkout

- Bloques: Vehículo, Extras, Datos personales, Dirección, Pago.
- Cada bloque con título, filas etiqueta/valor y botón “Editar” (`data-ir-a="N"`).
- Desglose separado:
  - **Hoy pagas:** aportación inicial + extras de pago único.
  - **Cada mes:** cuota + extras mensuales.
- Nunca sumar pagos únicos y cuotas como si fueran el mismo concepto.
- Mostrar periodicidad y nota “Precios de simulación”.
- En el paso 6, el showroom se convierte en checkout: coche, desglose y botón “Confirmar solicitud”.

### 6.9. Casillas legales

- Dos obligatorias e independientes:
  - Aceptación de condiciones de contratación.
  - Aceptación de política de privacidad.
- Una opcional: comunicaciones comerciales.
- Todas desmarcadas al inicio.
- Los textos se consultan en modales Bootstrap de demostración.
- Error específico si falta una obligatoria; no bloquear por la opcional.

### 6.10. Modales

- Bootstrap modal, fondo blanco, radio 1rem, cabecera con título serif y botón de cierre.
- `modal-lg` para condiciones y privacidad; scroll interno si el texto es largo.
- Foco atrapado por Bootstrap; al cerrar, devolver el foco al enlace que lo abrió.
- No usar modales para errores de formulario; esos van en línea y en el resumen de errores.

### 6.11. Showroom

- Fondo `--config-ink`, texto blanco.
- Stage superior claro (`--config-surface-alt`) con el coche centrado, `object-fit: contain`, altura máxima 45vh.
- Badge de línea (Mercedes-Benz / AMG / Maybach), nombre del modelo en serif, tagline y especificaciones.
- Filas de resumen: Vehículo, Extras, Pago único, Cuota.
- Nota de simulación.
- En escritorio: sticky a la derecha, `top: 72px`, altura `calc(100vh - 72px)`.
- En tablet/móvil: tarjeta compacta al final del formulario, sin sticky.
- La imagen del coche tiene alt descriptivo; los iconos decorativos llevan `aria-hidden="true"`.

### 6.12. Pie legal

- Barra fina, fondo negro o blanco cálido, texto 12-13 px.
- “© 2026 Mercedes-Benz. Simulación de contratación sin validez contractual.”
- Enlaces a Condiciones y Privacidad cuando T9 cree los modales.
- No copiar el footer completo de la home.

---

## 7. Los seis pasos

### Paso 1 · Vehículo

- Eyebrow: “Paso 1 · Vehículo”.
- Titular: “Elige tu Mercedes.”
- Subtítulo: “Tres formas de entender la excelencia. Selecciona la tuya.”
- Tres tarjetas horizontales:

| Línea | Modelo | Imagen | Especificaciones | Precio |
|---|---|---|---|---|
| Mercedes-Benz | Clase A 250e | `images/ClaseA250eSpecialEdition.jpg` | Híbrido enchufable · 218 CV · 0-100 6,8 s | 295 €/mes + 12.467 € inicial |
| AMG | Mercedes-AMG G 63 | `images/coches/SUV&Todoterreno2.jpg` | V8 biturbo · 585 CV · 0-100 4,5 s | 1.490 €/mes + 45.000 € inicial |
| Maybach | Mercedes-Maybach S 680 | `images/coches/Berlina1.jpg` | V12 · 612 CV · 0-100 4,5 s | 1.890 €/mes + 60.000 € inicial |

- Solo se puede seleccionar uno.
- Estado seleccionado evidente: borde, check y “Seleccionado”.
- El showroom se actualiza con el coche, la línea, el precio y la cuota.
- Nota: “Precios de simulación”.

### Paso 2 · Extras

- Eyebrow: “Paso 2 · Extras”.
- Titular: “Hazlo tuyo.”
- Subtítulo: “Añade solo lo que necesitas. Puedes cambiar de idea cuando quieras.”
- Extras propuestos:

| Extra | Precio | Tipo | Disponibilidad |
|---|---|---|---|
| Mantenimiento y neumáticos | 35 €/mes | Recurrente | Todos |
| Seguro a todo riesgo | 45 €/mes | Recurrente | Todos |
| Wallbox y instalación | 1.200 € | Pago único | Solo Clase A 250e |
| Pack AMG Night | 1.500 € | Pago único | Solo AMG G 63 |
| Pack Chófer | 2.500 € | Pago único | Solo Maybach S 680 |
| Pack Confort | 900 € | Pago único | Todos, incompatible con Pack AMG Night |

- Se puede elegir ninguno, uno o varios.
- Dependencias e incompatibilidad explicadas en la propia tarjeta.
- Si cambia el vehículo, se desmarcan los extras no válidos y se avisa.
- El showroom actualiza el número de extras y los totales.

### Paso 3 · Datos personales

- Eyebrow: “Paso 3 · Datos”.
- Titular: “Cuéntanos quién eres.”
- Campos: nombre, apellidos, DNI, correo, confirmación del correo, teléfono y fecha de nacimiento.
- Nota “Debes ser mayor de 18 años”.
- Dos columnas en escritorio; una en móvil.
- Autocomplete: `given-name`, `family-name`, `email`, `tel`, `bday`.
- Errores debajo de cada campo y resumen general.

### Paso 4 · Dirección

- Eyebrow: “Paso 4 · Dirección”.
- Titular: “¿Dónde te llevamos tu Mercedes?”
- Campos: tipo de vía, nombre de vía, número, piso/puerta (opcional), código postal, localidad y provincia.
- Aviso visible: “Solo direcciones de España”.
- Grid: vía 8 columnas + número 4; CP 4 + localidad 4 + provincia 4.
- Bloque editorial opcional: una franja oscura con la frase “De Stuttgart a tu puerta.” y una línea fina.
- El showroom actualiza la dirección resumida.

### Paso 5 · Pago

- Eyebrow: “Paso 5 · Pago”.
- Titular: “Elige cómo pagar.”
- Dos tarjetas: domiciliación y tarjeta.
- Domiciliación: titular e IBAN español.
- Tarjeta: titular, número, caducidad MM/AA y CVV; tarjeta simulada decorativa.
- Solo los campos del método activo se muestran, se validan y aparecen en el resumen.
- Nota “Simulación: no se realizará ningún cargo”.

### Paso 6 · Resumen y confirmación

- Eyebrow: “Paso 6 · Resumen”.
- Titular: “Revisa y confirma.”
- Bloques de resumen con “Editar”.
- Desglose separado: “Hoy pagas” y “Cada mes”.
- Casillas legales: dos obligatorias, una opcional.
- Enlaces a modales de condiciones y privacidad.
- Botón “Confirmar solicitud” en el showroom/checkout y en el flujo móvil.
- Si falta algo, no se confirma; se muestra el resumen de errores y se lleva al primer campo.

---

## 8. Estados e interacciones

| Elemento | Normal | Hover | Foco | Seleccionado | Deshabilitado | Error |
|---|---|---|---|---|---|---|
| Tarjeta de vehículo | Borde 1px | Borde fuerte + zoom | Anillo 2px | Borde 2px + check + texto | — | — |
| Tarjeta de extra | Borde 1px | Borde fuerte | Anillo 2px | Borde 2px + check | Opacidad + candado + texto | — |
| Input | Borde 1px | Borde fuerte | Borde negro + anillo | — | Fondo gris | Borde rojo + texto + icono |
| Botón principal | Negro | Invertido/opacidad | Anillo 2px | — | Opacidad 0.35 | — |
| Paso del stepper | Gris | — | Anillo | Negro + `aria-current` | — | — |

- **Nunca** usar solo color para indicar selección o error.
- **Nunca** usar `outline: none` sin reemplazo visible.
- El resumen de errores lleva enlaces a los campos; al pulsar, abre el paso correspondiente, hace scroll y enfoca.
- El showroom se actualiza al cambiar producto/extras, pero no anuncia cada tecla. Usar `aria-live="polite"` solo para el resumen de precio consolidado.
- Al cambiar de paso, enfocar el `h2` del paso y hacer scroll al inicio del formulario.
- Al volver atrás, conservar todos los valores.

---

## 9. Responsive

- Breakpoints:
  - `≥ 1200px`: split 7/5, showroom sticky.
  - `992-1199px`: una columna, showroom como tarjeta de resumen arriba.
  - `768-991px`: una columna, showroom compacto, barra inferior sticky.
  - `< 768px`: móvil, tarjetas apiladas, stepper compacto, barra inferior.
- Probar al menos: 320, 375, 768, 1024, 1440 px.
- Sin scroll horizontal en ningún ancho.
- El texto no debe quedar por debajo de 16 px en móvil.
- Los botones y campos deben ser cómodos con el pulgar.
- La barra inferior sticky no debe tapar el último campo: `padding-bottom: 96px` en el formulario móvil.
- En tablet y móvil el showroom va después del formulario, en una sola columna.
- Las imágenes de coche no deben deformarse: `object-fit: cover` en tarjetas, `contain` en el showroom.

---

## 10. Accesibilidad

- HTML semántico: `header`, `nav`, `main`, `aside`, `section`, `form`, `fieldset`, `legend`, `label`, `button`.
- Un solo `h1` (visualmente oculto si hace falta) y un `h2` por paso.
- Todos los campos con `<label for>`; nunca solo placeholder.
- Grupos de radios y checkboxes dentro de `fieldset` + `legend`.
- La tarjeta seleccionable es un `<label>`; el control real es el radio/checkbox.
- Foco visible y orden lógico de tabulación.
- `aria-current="step"` en el paso actual.
- `aria-invalid="true"` y `aria-describedby` en campos con error.
- Resumen de errores con enlaces a los campos; foco en el primer error.
- Modales Bootstrap: foco atrapado, Esc para cerrar, foco devuelto.
- Contraste mínimo 4,5:1.
- No depender del color; usar iconos, texto y patrones.
- `prefers-reduced-motion` respetado.
- Textos alternativos descriptivos en coches; `aria-hidden="true"` en iconos decorativos.
- El showroom es información complementaria; no debe duplicar el foco ni interrumpir el formulario.
- Probar el recorrido completo solo con teclado.

---

## 11. Contenido y formato

- Tono: segunda persona, directo, elegante, sin exclamaciones.
- Precios:
  - Cuota: `295 €/mes`.
  - Pago único: `12.467 €`.
  - Usar `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })` para importes enteros.
  - No mezclar cuota mensual y pago único en una misma cifra.
- Fechas: `DD/MM/AAAA`.
- Teléfono: `612 345 678` o `+34 612 345 678`.
- DNI: `12345678Z`.
- IBAN: `ES91 2100 0418 4502 0005 1332`.
- Tarjeta: `4242 4242 4242 4242`, `12/30`, CVV `123`.
- Dirección de prueba: `Calle de Alcalá 50, 28014 Madrid`.
- Correo de prueba: `ana.garcia@example.com`.
- Fecha de nacimiento de prueba: `01/01/1990`.
- Mensajes de error: concretos y accionables.
  - Bien: “Introduce un DNI válido: 8 cifras y letra de control.”
  - Mal: “Error en el campo.”
- Éxito: “Solicitud registrada correctamente.” + “Puedes cerrar esta ventana y seguir navegando.”
- Nota legal visible: “Precios de simulación. No se realizará ningún cobro.”

---

## 12. Imágenes e iconos

- **No hace falta descargar imágenes nuevas.** Usamos los recursos locales del proyecto.
- Imágenes de producto:
  - `images/ClaseA250eSpecialEdition.jpg`
  - `images/coches/SUV&Todoterreno2.jpg`
  - `images/coches/Berlina1.jpg`
- Imagen de showroom por defecto: `images/welcomehome.jpg`.
- Imagen editorial opcional: `images/hero.jpg`.
- Logos:
  - `images/logo-140years.gif` (barra superior, el mismo que usa la home)
  - `images/logo-amg.svg`
  - `images/logo-maybach.svg`
- Capturas del armazón T1: `docs/t1-desktop.png` y `docs/t1-mobile.png`.
- Capturas del sistema visual T3: `docs/t3-desktop-paso-1.png`, `docs/t3-desktop-paso-2.png` y `docs/t3-mobile-paso-1.png`.
- Capturas de la selección T4: `docs/t4-desktop-amg.png`, `docs/t4-desktop-maybach.png` y `docs/t4-mobile-amg.png`.
- Capturas de extras T5: `docs/t5-desktop-amg.png`, `docs/t5-aviso-cambio.png` y `docs/t5-mobile-extras.png`.
- Las imágenes de coche tienen fondo blanco: en el showroom se colocan sobre un stage blanco para que se integren. En las tarjetas se pueden recortar con `object-fit: cover`.
- No aplicar filtros de color, duotonos ni sombras artificiales a los coches.
- `alt` descriptivo: “Mercedes-Benz Clase A 250e”, “Mercedes-AMG G 63”, “Mercedes-Maybach S 680”.
- Iconos: SVG inline de 24 × 24, trazo 1,5, `currentColor`. Sin Font Awesome, Bootstrap Icons ni emojis.
- Si en el futuro hace falta una imagen nueva, debe ser oficial o de banco de imágenes libre, optimizada y guardada en `images/`. No hotlink.

---

## 13. Contrato técnico

### 13.1. Archivos

| Archivo | Responsabilidad |
|---|---|
| `contratacion.html` | Estructura del configurador y los seis pasos |
| `css/contratacion.css` | Todos los estilos del configurador |
| `js/contratacion.js` | Navegación, estado, progreso y API compartida (T2) |
| `js/vehiculo.js` | Selección de vehículo y sincronización del showroom (T4) |
| `js/extras.js` | Extras, dependencias, incompatibilidad y resumen de extras (T5) |
| `js/datos.js` | Datos personales y estado del paso 3 (T6) |
| `js/validaciones.js` | Funciones de validación reutilizables (T10) |
| `js/precios.js` | Cálculo de totales (T11) |
| `js/confirmacion.js` | Modal de éxito en la home (T12) |
| `docs/guia-visual-configurador.md` | Esta guía |
| `docs/pruebas.md` | Tabla de las 12 pruebas (T13) |
| `README.md` | Ejecución, escenario y datos de prueba (T14) |

Orden de scripts en `contratacion.html`:

```html
<script src="js/bootstrap.bundle.min.js"></script>
<script src="js/validaciones.js"></script>
<script src="js/precios.js"></script>
<script src="js/contratacion.js"></script>
<script src="js/vehiculo.js"></script>
<script src="js/extras.js"></script>
<script src="js/datos.js"></script>
```

`js/confirmacion.js` se carga solo en `index.html`.

### 13.2. IDs principales

- Formulario: `#formContratacion`.
- Pasos: `#paso-1` … `#paso-6`, con `data-paso="1"` … `"6"`.
- Títulos: `#titulo-paso-1` … `#titulo-paso-6`.
- Botones: `#btnAnterior`, `#btnSiguiente`, `#btnConfirmar`.
- Progreso: `#indicadorPasoTop`, `#barraProgreso`, `#indicadorPaso`.
- Errores: `#resumenErrores`.
- Showroom: `#showroomLinea`, `#showroomImagen`, `#showroomModelo`, `#showroomTagline`, `#showroomSpecs`, `#showroomVehiculo`, `#showroomExtras`, `#showroomPagoUnico`, `#showroomCuota`.
- Extras: `#extrasAviso`, `#extrasResumenTexto`, `#extras-servicios`, `#extras-tecnologia-confort`.
- Campos: `nombre`, `apellidos`, `dni`, `email`, `emailConfirmacion`, `telefono`, `fechaNacimiento`, `tipoVia`, `nombreVia`, `numero`, `piso`, `codigoPostal`, `localidad`, `provincia`, `metodoPago`, `titularCuenta`, `iban`, `titularTarjeta`, `numeroTarjeta`, `caducidad`, `cvv`, `aceptoCondiciones`, `aceptoPrivacidad`, `aceptoComercial`.
- Resumen: `#resumenProducto`, `#resumenExtras`, `#resumenDatos`, `#resumenDireccion`, `#resumenPago`, `#desglosePrecios`.

### 13.3. Clases

- Prefijo de layout: `config-`.
  - `config-header`, `config-progress`, `config-layout`, `config-main`, `config-stepper`, `config-step`, `config-actions`, `config-showroom`, `config-footer`.
- Componentes:
  - `card-vehiculo`, `card-extra`, `card-config`.
  - `campo`, `campo-label`, `campo-input`, `campo-help`, `campo-error`.
  - `pago-opcion`, `pago-panel`, `tarjeta-simulada`.
  - `resumen-bloque`, `resumen-fila`, `resumen-editar`.
  - `legal-check`, `config-error-summary`.
- Estados:
  - `is-active`, `is-selected`, `is-disabled`, `is-error`, `is-complete`.

### 13.4. Atributos de datos

- `data-paso="1..6"` en cada sección.
- `data-paso-indicador="1..6"` en el stepper.
- `data-ir-a="1..5"` en los botones de edición del resumen.
- En cada tarjeta de vehículo:
  - `data-linea`, `data-modelo`, `data-precio-mensual`, `data-precio-unico`, `data-imagen`.
- En cada extra:
  - `data-precio-mensual`, `data-precio-unico`, `data-requiere`, `data-incompatible`.
- En el pago:
  - `data-metodo="domiciliacion|tarjeta"`.

### 13.5. API compartida

`js/contratacion.js` puede exponer una API pequeña para que las tareas T4-T12 no dupliquen lógica:

```js
window.Config = {
  pasoActual: 1,
  estado: {
    producto: null,
    extras: [],
    datos: {},
    direccion: {},
    pago: {}
  },
  irAPaso(n, opciones) {},
  actualizarShowroom() {},
  mostrarError(campo, mensaje) {},
  limpiarError(campo) {}
};
```

No es obligatorio usarla desde el primer día, pero si se crea, se documenta aquí y se mantiene.

### 13.6. Reparto de tareas

| Tarea | Responsabilidad |
|---|---|
| T1 | Armazón, barra superior, split, progreso, paso 1 estático, placeholders y showroom |
| T2 | Navegación, estado, progreso, transiciones y sincronización del showroom |
| T3 | Estilos comunes y responsive |
| T4 | Selección de vehículo y estado seleccionado |
| T5 | Extras, dependencias e incompatibilidad |
| T6 | Datos personales |
| T7 | Dirección |
| T8 | Pago y tarjeta simulada |
| T9 | Resumen, edición y casillas legales |
| T10 | Validaciones y errores |
| T11 | Cálculo dinámico de precios |
| T12 | Envío y modal de confirmación |
| T13 | Pruebas funcionales |
| T14 | Integración, README y documentación final |

---

## 14. Cómo continuar sin romper el diseño (T7-T9)

Si trabajas en dirección, pago o resumen:

1. Haz `git pull` de `develop` antes de empezar.
2. Edita **solo** el bloque del paso que te corresponde. Busca los marcadores:
   - `<!-- PASO 4: INICIO (T7) -->` … `<!-- PASO 4: FIN -->`
   - `<!-- PASO 5: INICIO (T8) -->` … `<!-- PASO 5: FIN -->`
   - `<!-- PASO 6: INICIO (T9) -->` … `<!-- PASO 6: FIN -->`
3. Usa las clases y tokens de esta guía. No añadas colores, fuentes ni sombras nuevas.
4. Añade los campos con los IDs acordados y envuélvelos en `.campo`.
5. Para el pago:
   - Usa `.pago-opcion` para las dos tarjetas.
   - Usa `.pago-panel` para el panel de cada método.
   - El panel inactivo lleva `hidden`; sus campos no se validan ni se muestran en el resumen.
   - La tarjeta simulada es decorativa: `aria-hidden="true"`.
6. Para el resumen:
   - Usa `.resumen-bloque`, `.resumen-fila` y `.resumen-editar`.
   - Los botones de edición llevan `data-ir-a="N"`.
   - No sumes pagos únicos y cuotas en una sola cifra.
7. Si necesitas JavaScript propio, créalo en un archivo aparte (`js/paso-4.js`, etc.) y cárgalo después de `js/contratacion.js`. No reescribas las funciones de navegación.
8. Si un componente nuevo no está en la guía, añádelo aquí y avisa al equipo antes de usarlo.
9. Prueba en escritorio, móvil y teclado.
10. Pasa el checklist de la sección 15 antes de dar la tarea por terminada.

---

## 15. Checklist de QA visual

Antes de marcar una tarea como Hecha:

- [ ] Se ve bien a 1440, 1024, 768 y 320 px.
- [ ] No hay scroll horizontal.
- [ ] La barra superior y el progreso se ven correctamente.
- [ ] El showroom o resumen muestra el estado actual.
- [ ] Los estados hover, foco, seleccionado, deshabilitado y error son visibles.
- [ ] No se depende solo del color.
- [ ] Los botones tienen altura y separación cómodas.
- [ ] Los inputs tienen etiqueta visible y ayuda cuando hace falta.
- [ ] Los textos no se solapan ni se cortan.
- [ ] Las imágenes no se deforman.
- [ ] Los precios se leen sin ambigüedad: €/mes vs pago único.
- [ ] La nota de simulación está visible.
- [ ] El recorrido se puede completar solo con teclado.
- [ ] El foco se ve siempre.
- [ ] El modal se abre y se cierra correctamente.
- [ ] No hay errores en la consola.
- [ ] No se han añadido librerías externas.
- [ ] No se ha cambiado el estilo global de la home.

---

## 16. Workflow Git y Jira

### Ramas

- `feat/contratacion-base` → T1 + T2 + T3.
- `feat/contratacion-fases-1-3` → T4 + T5.
- `feat/contratacion-fases-3-4` → T6 + T7.
- `feat/contratacion-fases-5-6` → T8 + T9.
- `feat/validaciones-precios-envio` → T10 + T11 + T12.
- `feat/pruebas` → T13.
- `feat/integracion` → T14.

### Commits

- Un commit por tarea, como mínimo:
  - `feat(SCRUM-6): crea el esqueleto HTML del formulario`
  - `feat(SCRUM-7): implementa la navegación entre pasos`
  - `style(SCRUM-8): añade estilos comunes del formulario`
  - `feat(SCRUM-9): implementa la selección de vehículo`
  - …
- No mezclar tareas en un mismo commit.
- No reformatear archivos completos.

### Jira

- Columnas: **Pendiente**, **En curso**, **En pruebas**, **Hecho**.
- Cada tarea con objetivo, criterios de aceptación, modelo de IA o “Sin IA”, prompt EARS, corrección, reflexión breve y evidencia.
- Mover a **En curso** al empezar y a **Hecho** solo después de probar los criterios.
- Evidencia: hash de commit, captura o prueba concreta.
- No adjuntar conversaciones completas ni memorias extensas.

### Definición de Hecho

Una tarea está hecha cuando:

1. Cumple sus criterios de aceptación.
2. Se ha probado en escritorio y móvil.
3. Se ha probado con teclado.
4. No rompe la guía visual.
5. Tiene commit y evidencia en Jira.
6. La documentación de IA está actualizada.

---

## 17. Decisiones acordadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 11/11/2026 | Página aparte `contratacion.html` | Mantener la home limpia y crear una experiencia de configurador |
| 11/11/2026 | Split-screen con showroom sticky | Dar sensación de configurador de concesionario |
| 11/11/2026 | Tres líneas: Clase A 250e, AMG G 63, Maybach S 680 | Diferenciación visual clara y coherencia con la marca |
| 11/11/2026 | Barra superior fina y pie legal mínimo | Evitar que el configurador parezca una página normal |
| 11/11/2026 | T3 dentro de la rama base | Tener un configurador navegable y con aspecto final cuanto antes |

Si cambia una decisión, se añade una fila aquí y se actualiza la sección afectada.

---

## 18. Lo que no se hace

- No React, Vue, Angular, jQuery ni librerías externas de formularios o validación.
- No Font Awesome ni Bootstrap Icons; iconos SVG inline.
- No azul por defecto de Bootstrap.
- No copiar la navbar ni el footer completos de la home en el configurador.
- No usar `outline: none` sin un foco visible alternativo.
- No ocultar errores solo con color.
- No sumar pagos únicos y cuotas en una sola cifra.
- No hotlinkear imágenes externas.
- No inventar colores, fuentes o medidas fuera de esta guía.
- No meter conversaciones completas de IA en Jira.
