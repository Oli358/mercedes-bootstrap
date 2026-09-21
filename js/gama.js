/* Animación de giro de los coches de la GAMA.
   Cada tarjeta tiene 6 frames (NombreN.jpg): el frame 1 está en el HTML; este script precarga los frames 2-6 apilados en la
   misma posición y los encadena al hacer hover (ida suave, vuelta hasta
   el frame donde estuviera). */
document.querySelectorAll('.card-gama').forEach((card) => {
    const img1 = card.querySelector('.card-gama-img');
    const base = img1.src.replace(/1\.jpg$/, '');
    const MS_POR_FRAME = 25;

    // Precarga de los frames 2-6: copias absolutas/invisibles sobre el frame 1
    const frames = [img1];
    for (let i = 2; i <= 6; i++) {
        const f = new Image();
        f.src = base + i + '.jpg';
        f.className = 'card-gama-img card-gama-frame';
        f.alt = '';
        card.appendChild(f);
        frames.push(f);
    }

    let idx = 1; // frame mostrado (1..6)
    let timer = null;

    const pintar = () => frames.forEach((f, i) => (f.style.opacity = i === idx - 1 ? '1' : '0'));

    const animar = (dir) => {
        clearInterval(timer);
        timer = setInterval(() => {
            idx += dir;
            if (idx <= 1) { idx = 1; clearInterval(timer); }
            if (idx >= 6) { idx = 6; clearInterval(timer); }
            pintar();
        }, MS_POR_FRAME);
    };

    card.addEventListener('mouseenter', () => { if (idx < 6) animar(1); });
    card.addEventListener('mouseleave', () => { if (idx > 1) animar(-1); });
});
