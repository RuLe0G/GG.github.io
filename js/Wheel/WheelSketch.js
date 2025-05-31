/**
 * WheelSketch.js
 * P5-сценарий, который рисует «колесо рулетки» и запускает его анимацию.
 */
function WheelSketch(p) {
    // Радиус и диаметр колеса (в пикселях)
    const DIAMETER = 700;
    const RADIUS = DIAMETER / 2;

    // Массив сегментов: { title, weight, startAngle, endAngle, color }
    let segments = [];

    // Текущий угол поворота (в градусах)
    let rotationAngle = 0;

    // Флаг: идёт ли сейчас «вращение»
    let isSpinning = false;

    // Итоговый угол, к которому нужно «затормозить»
    let targetRotation = 0;

    // Угол в момент старта анимации (нужно для корректной линейной интерполяции)
    let startRotation = 0; // ▼ запоминаем, «откуда» мы крутим

    // Время начала анимации (ms) и длительность вращения (здесь ровно 30 секунд)
    let animStartTime = 0;
    let animDuration = 30000; // ▲ ровно 30 000 мс (30 секунд)

    // Шаблон easing-функции (здесь используем easeOutCubic)
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Последний выбранный сегмент (строка)
    let lastSelected = '';

    // Шрифт для текста на сегментах
    let fontRegular;

    // -------------------------------------------------------------
    // p5 жизненные циклы
    // -------------------------------------------------------------
    p.preload = () => {
        // Подгрузка шрифта. Положите Oswald-Regular.ttf рядом с этим скриптом или поправьте путь.
        fontRegular = p.loadFont('fonts/Oswald-Regular.ttf');
    };

    p.setup = () => {
        // Привязываем канвас к блоку #wheel-canvas
        const canvas = p.createCanvas(DIAMETER, DIAMETER);
        canvas.parent('wheel-canvas');

        p.angleMode(p.DEGREES);
        p.textFont(fontRegular);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(20);

        // Рисуем «прозрачное» колесо до передачи данных
        p.clear();

        // Генерируем кнопку «Крутить» и вешаем обработчик
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
        // Сначала рисуем само колесо (с учётом текущего rotationAngle)
        p.push();
        p.translate(RADIUS, RADIUS);
        p.rotate(rotationAngle);

        // Рисуем каждый сегмент
        segments.forEach(seg => {
            p.fill(seg.color);
            p.noStroke();
            p.arc(
                0, 0,
                DIAMETER, DIAMETER,
                seg.startAngle,
                seg.endAngle,
                p.PIE
            );
        });

        // Рисуем подписи внутри сегментов
        segments.forEach(seg => {
            const angleSize = seg.endAngle - seg.startAngle;
            if (angleSize < 6) return; // Сегмент слишком узкий — не рисуем текст

            // Средний угол сегмента (относительно нуля, без учёта общей rotationAngle)
            const midAngle = (seg.startAngle + seg.endAngle) / 2;
            // Радиус, по которому рисуем текст (выводим над серединой сегмента)
            const textRadius = RADIUS * 0.65;

            // -------------------------------------------------------------
            // Правильная трансформация для текста
            //  1) мы уже в режиме: центр+rotate(rotationAngle)
            //  2) ещё поворачиваем на midAngle
            //  3) смещаемся от центра колеса вдоль радиуса
            //  4) поворачиваем текст на +90°, чтобы он шёл по касательной
            p.push();
            p.rotate(midAngle);        // добавочное вращение «внутри» каждого сегмента
            p.translate(0, -textRadius);
            p.rotate(90);

            p.fill(255);
            p.noStroke();

            // Обрезаем длинные названия более 21 символа
            let content = seg.title;
            if (content.length > 21) {
                content = content.slice(0, 21) + '...';
            }

            p.textSize(18);
            p.text(content, 0, 0);
            p.pop();
            // -------------------------------------------------------------
        });
        p.pop();

        // Если идёт анимация — обновляем угол
        if (isSpinning) {
            const now = performance.now();
            const elapsed = now - animStartTime;
            const t = Math.min(elapsed / animDuration, 1.0); // из 0…1
            const easeT = easeOutCubic(t);

            // ► вместо постоянного вызова lerp от текущего значения
            //    используем _фиксированную_ стартовую точку:
            rotationAngle = startRotation + easeT * (targetRotation - startRotation);

            if (t >= 1) {
                // Анимация закончилась — останавливаемся ровно на targetRotation
                rotationAngle = targetRotation % 360;
                isSpinning = false;
                announceSelected();
            }
        }

        // Рисуем «указатель» сверху (треугольник)
        drawPointer();
    };

    // -------------------------------------------------------------
    // Рисует «фиксированный» указатель сверху, чтобы было видно текущий выбранный сегмент
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

    // -------------------------------------------------------------
    // Заполнение данных: вычисляем сегменты (startAngle/endAngle) и случайные цвета
    p.setData = function(_items) {
        // _items = [ { title: 'Name', weight: 3 }, ... ]
        if (!Array.isArray(_items) || _items.length === 0) {
            segments = [];
            return;
        }

        // Генерируем массив цветов и считаем общий вес
        segments = [];
        let totalWeight = 0;
        _items.forEach(it => {
            totalWeight += (it.weight || 1);
        });

        // Строим сегменты с углами startAngle/endAngle
        let currentAngle = 0;
        _items.forEach(it => {
            const w = it.weight || 1;
            const angleSize = (w / totalWeight) * 360;
            const col = p.color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
            segments.push({
                title: it.title,
                weight: w,
                startAngle: currentAngle,
                endAngle: currentAngle + angleSize,
                color: col
            });
            currentAngle += angleSize;
        });

        // Сбрасываем текущее вращение
        rotationAngle = 0;
        isSpinning = false;
        lastSelected = '';
        document.getElementById('last-selected-text').textContent = '';
    };

    // -------------------------------------------------------------
    // Запуск анимации «крутить» (ровно 30 секунд)
    function startSpinAnimation() {
        if (segments.length === 0) return;

        // Сразу сохраняем стартовый угол и время начала
        startRotation = rotationAngle;
        animStartTime = performance.now();
        animDuration = 30000; // ровно 30 000 мс (30 секунд)
        isSpinning = true;

        // Выбираем случайный сегмент, учитывая weight
        const rnd = Math.random() * segments.reduce((s, seg) => s + seg.weight, 0);
        let cum = 0;
        let chosenSeg = segments[0];
        for (let seg of segments) {
            cum += seg.weight;
            if (rnd <= cum) {
                chosenSeg = seg;
                break;
            }
        }

        // Найдём середину выбранного сегмента (чтобы остановиться «под указателем»)
        const midAngle = (chosenSeg.startAngle + chosenSeg.endAngle) / 2;
        // Так как указатель визуально рисуется на −90°, мы вычисляем, сколько нужно повернуть колесо,
        // чтобы середина сегмента (midAngle) оказалась именно под указателем:
        const normalizedMid = ((midAngle % 360) + 360) % 360;
        const needed = (360 - (normalizedMid - 90)) % 360;

        // Добавляем несколько полных оборотов (например, 5–7).
        const fullSpins = 5 + Math.floor(Math.random() * 3); // 5–7 оборотов
        targetRotation = fullSpins * 360 + needed;

        // Сохраняем название для вывода после анимации
        lastSelected = chosenSeg.title;
    }

    // -------------------------------------------------------------
    // После остановки: показываем результат «под указателем»
    function announceSelected() {
        const el = document.getElementById('last-selected-text');
        if (lastSelected) {
            el.textContent = lastSelected;
            el.classList.remove('show');
            void el.offsetWidth; // сброс CSS-анимации
            el.classList.add('show');
        }
    }

    // -------------------------------------------------------------
    // Внешний метод: получить текущий сегмент (если нужно)
    p.getCurrentSegment = function() {
        // Указатель — на −90° от 0 градусов, высчитываем, какой сегмент там сейчас:
        const angleAtPointer = ((rotationAngle + 360) % 360 + 90) % 360;
        for (let seg of segments) {
            if (angleAtPointer >= seg.startAngle && angleAtPointer < seg.endAngle) {
                return seg.title;
            }
        }
        return null;
    };
} // конец WheelSketch
