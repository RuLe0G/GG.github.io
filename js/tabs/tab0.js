import {Helpers} from '../modules/helpers.js';
import {Dom} from '../modules/dom.js';
import dataSet     from '../data/wheelData.js';

export default class Tab0 {
    constructor() {
        this.wheelInitialized = false;

        this.currentDataSet = 'default';

        this.elements = Dom.cacheSelectors({
            canvasContainer: '#wheel-canvas',
            wheelButtonsWrapper: '.wheel-controls .wheel-buttons',
            lastSelectedText: '#last-selected-text',
            copyButton: '#copy-last-selected'
        });

        this.wheelData = dataSet;
    }

    /**
     * Загружает p5.js и наш скрипт WheelSketch.js, создаёт экземпляр p5.
     * @returns {Promise<void>}
     */
    async initWheel() {
        if (this.wheelInitialized) {
            return;
        }

        try {
            await Helpers.loadScript('js/Wheel/p5.min.js');
            await Helpers.loadScript('js/Wheel/WheelSketch.js');
        } catch (err) {
            Helpers.handleError(`Не удалось загрузить p5 или WheelSketch: ${err}`);
            return;
        }

        // Создаём экземпляр p5, передавая конструктор WheelSketch:
        // WheelSketch — это функция (p)=>{…}, описанная в js/Wheel/WheelSketch.js.
        this.p5Wheel = new p5(WheelSketch);

        // Сразу устанавливаем дефолтные данные
        this.setWheelData('default');

        this.wheelInitialized = true;
    }

    /**
     * Выставляет новый набор сегментов (items) для «рулетки».
     * Вызывается извне: передаём просто массив { title, weight }.
     * @param {string} typeKey — «default» | «shame» | «super_shame»
     */
    setWheelData(typeKey) {
        if (!this.p5Wheel) {
            // Если p5 ещё не инициализировано, просто сохраняем ключ,
            // а сам `setData` исполнится позже после initWheel().
            this.currentDataSet = typeKey;
            return;
        }

        // Берём массив items из нашего wheelData
        const ds = this.wheelData[typeKey];
        if (!ds || !Array.isArray(ds.items)) {
            console.warn(`Нет данных для колеса с ключом "${typeKey}"`);
            return;
        }

        // Передаём массив сегментов в p5:
        this.p5Wheel.setData(ds.items);
        this.currentDataSet = typeKey;

        // Сбросим текст последнего результата:
        const elText = this.elements.lastSelectedText;
        if (elText) elText.textContent = '';
    }

    /**
     * Подписываемся на все клики по «wheel-btn» и на копирование текста.
     */
    setupEventListeners() {
        // 1) Переключение между преднастроенными колёсами
        Dom.delegateEvent(
            document.querySelector('.wheel-buttons'),
            'click',
            '.wheel-btn',
            (e) => {
                const btn = e.target.closest('.wheel-btn');
                if (!btn) return;
                const wheelType = btn.dataset.wheel;
                // Снимаем «active» у всех, и ставим на текущую:
                document.querySelectorAll('.wheel-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Меняем данные колеса
                this.setWheelData(wheelType);
            }
        );

        // 2) Иконка копирования: при клике — копирует содержимое lastSelectedText
        if (this.elements.copyButton) {
            this.elements.copyButton.addEventListener('click', () => {
                const txt = this.elements.lastSelectedText.textContent;
                if (txt) {
                    navigator.clipboard.writeText(txt)
                        .catch(err => console.warn('Не удалось скопировать:', err));
                }
            });
        }
    }

    /**
     * Активирует вкладку «Крутилка»: инициализирует колесо и навешивает слушатели.
     */
    activate() {
        // 1) Загрузить и инициализировать p5-колесо
        this.initWheel().then(() => {
            // 2) Убедимся, что после initWheel мы всё-таки вызовем setWheelData,
            //    если предыдущие setWheelData(typeKey) не сработали.
            this.setWheelData(this.currentDataSet);

            // 3) Навесим обработчики на кнопки
            this.setupEventListeners();

            // 4) Если вы хотите сразу выделить дефолтную кнопку (активный стиль):
            const defBtn = document.querySelector('.wheel-btn[data-wheel="default"]');
            if (defBtn) defBtn.classList.add('active');
        });
    }

    /**
     * При необходимости можно сюда вынести логику «отключения» вкладки,
     * например, удаление p5-канваса или остановка анимаций.
     */
    deactivate() {
        // По желанию: this.p5Wheel.remove() чтобы убрать <canvas> и остановить draw().
        // Но p5 не всегда корректно очищает память, поэтому если не нужна динамика —
        // можно просто скрыть контейнер, оставив p5 работать в фоне.
    }
}
