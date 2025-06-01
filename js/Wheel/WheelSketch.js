function WheelSketch(p) {
    const DIAMETER = 700;
    const RADIUS = DIAMETER / 2;

    let segments = [];
    let rotationAngle = 0;
    let isSpinning = false;
    let targetRotation = 0;
    let startRotation = 0;
    let animStartTime = 0;
    let animDuration = 30000;
    let lastSelected = '';
    let fontRegular;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
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

        // Draw wheel segments
        p.push();
        p.translate(RADIUS, RADIUS);
        p.rotate(rotationAngle + 180);
        segments.forEach(seg => {
            p.fill(seg.color);
            p.noStroke();
            p.arc(0, 0, DIAMETER, DIAMETER, seg.startAngle, seg.endAngle, p.PIE);
        });
        p.pop();

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
            if (content.length > 21) {
                content = content.slice(0, 21) + '...';
            }

            p.textSize(18);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(content, 0, 0);
            p.pop();
        });
        p.pop();

        // Animate rotation
        if (isSpinning) {
            const now = performance.now();
            const elapsed = now - animStartTime;
            const t = Math.min(elapsed / animDuration, 1);
            const easeT = easeOutCubic(t);
            rotationAngle = startRotation + (targetRotation - startRotation) * easeT;

            if (t >= 1) {
                rotationAngle = targetRotation % 360;
                isSpinning = false;
                announceSelected();
            }
        }

        drawPointer();
    };

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
            +pointerSize / 2, -RADIUS + pointerSize - 5
        );
        p.pop();
    }

    p.setData = function (_items) {
        if (!Array.isArray(_items) || _items.length === 0) {
            segments = [];
            return;
        }

        shuffleArray(_items);

        segments = [];
        let totalWeight = 0;
        _items.forEach(it => {
            totalWeight += it.weight || 1;
        });

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
        document.getElementById('last-selected-text').textContent = '';
    };

    function randomColorWithCap(max = 200) {
        const r = Math.floor(Math.random() * max);
        const g = Math.floor(Math.random() * max);
        const b = Math.floor(Math.random() * max);
        return p.color(r, g, b);
    }


    function startSpinAnimation() {
        if (segments.length === 0) return;

        startRotation = rotationAngle;
        animStartTime = performance.now();

        // Рандомизация длительности: 6000–10000 мс
        animDuration = 8000 + (Math.random() * 4000 - 2000);
        isSpinning = true;

        const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0);
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

        const midAngle = (chosenSeg.startAngle + chosenSeg.endAngle) / 2;
        const normalizedMid = (midAngle % 360 + 360) % 360;
        const needed = (360 - (normalizedMid - 90)) % 360;

        // Рандомизация количества оборотов ±20%
        const baseSpins = 20;
        const spinFactor = 0.8 + Math.random() * 0.4; // от 0.8 до 1.2
        const fullSpins = Math.floor(baseSpins * spinFactor);

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

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

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