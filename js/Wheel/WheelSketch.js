function WheelSketch(p) {
    /*
     * === CONFIGURABLE PARAMETERS ===
     * DIAMETER          — Диаметр колеса (в пикселях)
     * RADIUS            — Радиус (половина диаметра)
     * BASE_SPINS        — Базовое количество полных оборотов
     * SPIN_VARIATION    — Коэффициент случайной вариации оборотов (от 0.8 до 1.2)
     * SPIN_DURATION     — Длительность анимации вращения в миллисекундах (по умолчанию 30000 мс = 30 сек)
     * EASING_FUNCTION   — Функция замедления вращения (по умолчанию quartic для медленного финала)
     */

    const DIAMETER = 700;
    const RADIUS = DIAMETER / 2;
    const BASE_SPINS = 20;
    const SPIN_VARIATION = 0.8 + Math.random() * 0.4; 
    const SPIN_DURATION = 30000 + ((Math.random() * 4) - 2);

    let segments = [];
    let rotationAngle = 0;
    let isSpinning = false;
    let targetRotation = 0;
    let startRotation = 0;
    let animStartTime = 0;
    let animDuration = SPIN_DURATION;
    let lastSelected = '';
    let fontRegular;

    let isShaking = false;
    let shakeStartTime = 0;
    const shakeDuration = 250;
    const shakeAmplitude = 1; 


    let hoverIndex = null;

    function easeOutCubic(t) {
        return Math.sin((t * Math.PI) / 2);
    }

    p.preload = () => {
        fontRegular = p.loadFont('fonts/Oswald-Regular.ttf');
    };

    p.setup = () => {
        const canvas = p.createCanvas(DIAMETER, DIAMETER);
        canvas.parent('wheel-canvas');
        p.angleMode(p.DEGREES);
        p.textFont(fontRegular);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);
        p.clear();

        const button = p.createButton('Крутить');
        button.parent(document.querySelector('.wheel-controls .wheel-buttons'));
        button.mousePressed(() => {
            if (!isSpinning && segments.length > 0) {
                startSpinAnimation();
            }
        });
    };

    p.draw = () => {
        p.clear();

        // — Рисуем сегменты
        p.push();
        p.translate(RADIUS, RADIUS);
        p.rotate(rotationAngle + 180);

        segments.forEach((seg, idx) => {
            p.fill(hoverIndex !== null && hoverIndex !== idx ? 120 : seg.color);
            p.noStroke();
            p.arc(0, 0, DIAMETER, DIAMETER, seg.startAngle, seg.endAngle, p.PIE);
        });
        p.pop();

        // — Рисуем текст
        p.push();
        p.translate(RADIUS, RADIUS);
        p.rotate(rotationAngle - 90);

        segments.forEach(seg => {
            const angleSize = seg.endAngle - seg.startAngle;
            if (angleSize < 6) return;

            const midAngle = (seg.startAngle + seg.endAngle) / 2;
            const textRadius = RADIUS * 0.65;

            p.push();
            p.rotate(midAngle);
            p.translate(0, -textRadius);
            p.rotate(90);
            p.fill(255);
            p.noStroke();

            let content = seg.title;
            if (content.length > 21) content = content.slice(0, 21) + '...';

            p.textSize(18);
            p.text(content, 0, 0);
            p.pop();
        });
        p.pop();

        if (isSpinning) {
            const now = performance.now();
            const elapsed = now - animStartTime;
            const t = Math.min(elapsed / animDuration, 1);
            const easeT = easeOutCubic(t);
            rotationAngle = startRotation + (targetRotation - startRotation) * easeT;

            if (t >= 1) {
                rotationAngle = targetRotation % 360;
                isSpinning = false;
                startShakeAnimation();
                announceSelected();
            }
        } else if (isShaking) {
            const now = performance.now();
            const shakeElapsed = now - shakeStartTime;
            const t = shakeElapsed / shakeDuration;

            if (t >= 1) {
                isShaking = false;
                rotationAngle = targetRotation % 360;
            } else {
                const damping = 1 - t; 
                const angleOffset = Math.sin(t * Math.PI * 3) * shakeAmplitude * damping;
                rotationAngle = (targetRotation + angleOffset) % 360;
            }
        }

        drawPointer();
    };

    function startShakeAnimation() {
        isShaking = true;
        shakeStartTime = performance.now();
    }

    function drawPointer() {
        const pointerSize = 20;
        p.push();
        p.translate(RADIUS, RADIUS);
        p.fill('#ffffff');
        p.stroke('#000');
        p.strokeWeight(2);
        p.triangle(
            0, -RADIUS - 5,
            -pointerSize / 2, -RADIUS + pointerSize - 5,
            pointerSize / 2, -RADIUS + pointerSize - 5
        );
        p.pop();
    }

    p.setData = function (_items) {
        if (!Array.isArray(_items) || _items.length === 0) {
            segments = [];
            return;
        }

        segments = [];
        let totalWeight = 0;
        _items.forEach(it => totalWeight += it.weight || 1);

        let currentAngle = 0;
        _items.forEach(it => {
            const w = it.weight || 1;
            const angleSize = (w / totalWeight) * 360;
            const col = p.color(it.colorHex);

            segments.push({
                title: it.title,
                weight: w,
                startAngle: currentAngle,
                endAngle: currentAngle + angleSize,
                color: col
            });

            currentAngle += angleSize;
        });

        rotationAngle = 0;
        isSpinning = false;
        lastSelected = '';
        hoverIndex = null;
        document.getElementById('last-selected-text').textContent = '';
    };

    function startSpinAnimation() {
        if (segments.length === 0) return;

        startRotation = rotationAngle;
        animStartTime = performance.now();
        animDuration = SPIN_DURATION;
        isSpinning = true;

        const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);
        const rnd = Math.random() * totalWeight;

        let cum = 0;
        let chosenSeg = segments[0];
        for (let seg of segments) {
            cum += seg.weight;
            if (rnd <= cum) {
                chosenSeg = seg;
                break;
            }
        }

        const segmentSize = chosenSeg.endAngle - chosenSeg.startAngle;
        const targetAngleWithinSegment = chosenSeg.startAngle + Math.random() * segmentSize;
        const normalizedTarget = (targetAngleWithinSegment % 360 + 360) % 360;
        const needed = (360 - (normalizedTarget - 90)) % 360;

        const fullSpins = Math.floor(BASE_SPINS * SPIN_VARIATION);
        targetRotation = fullSpins * 360 + needed;
        targetRotation = fullSpins * 360 + needed;
        lastSelected = chosenSeg.title;
    }

    function announceSelected() {
        const el = document.getElementById('last-selected-text');
        if (lastSelected) {
            el.textContent = lastSelected;
            el.classList.remove('show');
            void el.offsetWidth;
            el.classList.add('show');
        }
    }

    p.setHoverIndex = function (i) {
        hoverIndex = typeof i === 'number' ? i : null;
    };


    p.getCurrentSegment = function () {
        const angleAtPointer = ((rotationAngle + 360) % 360 + 90) % 360;
        for (let seg of segments) {
            if (angleAtPointer >= seg.startAngle && angleAtPointer < seg.endAngle) {
                return seg.title;
            }
        }
        return null;
    };
}