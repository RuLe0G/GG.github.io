export default class Tab0 {
    constructor() {
        this.wheelInitialized = false;
        this.currentDataSet = 'default';
        this.wheelData = {
            default: {
                title: "Колесо балдежа",
                items: ["Повысить шанс выпадения игры в чужом колесе", "+25 поинтов", "Реролл", "1 из 2 игр на выбор", "+20% поинтов", "Колесо с говном противнику", "+50% поинтов", "Безнаказанный дроп"]
            },
            shame: {
                title: "Колесо говна",
                items: ["-поинты по кубику х10", "Колесо балдежа противнику","-10 поинтов","-10% поинтов","-25% поинтов","-25 поинтов","Ролл из отборного говна","-50% поинтов","Повышение шанса рекомендаций"]
            },
            super_shame: {
                title: "Колесо отборного говна",
                items: ["Granny", "The Mercury Man", "Poppy Playtime", "Hatoful Boyfriend", "5 каток в кс", "5 каток в доту"]
            },
            custom: {
                title: "Свой список",
                items: []
            }
        };
    }

    async initWheel() {
        if (this.wheelInitialized) return;

        await this.loadScript('js/p5.min.js');
        await this.loadScript('js/util.js');
        await this.loadScript('js/WheelSketch.js');

        this.p5Wheel = new p5(WheelSketch);
        this.wheelInitialized = true;

        this.setWheelData('default');
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setWheelData(type) {
        const data = this.wheelData[type].items.map(item => ({title: item}));
        this.p5Wheel.setData(data);
        this.currentDataSet = type;
    }

    setupEventListeners() {
        document.querySelectorAll('.wheel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const wheelType = btn.dataset.wheel;
                this.handleWheelType(wheelType);
            });
        });

        document.getElementById('copy-last-selected')?.addEventListener('click', () => {
            const text = document.getElementById('last-selected-text').textContent;
            if (text) navigator.clipboard.writeText(text);
        });
    }

    handleWheelType(type) {
        if (type === 'custom') {
            this.showCustomListDialog();
        } else {
            this.setWheelData(type);
        }
    }

    showCustomListDialog() {
        const dialog = document.getElementById('custom-list');
        const textarea = dialog.querySelector('textarea');
        const button = dialog.querySelector('button');

        dialog.style.display = 'block';

        button.onclick = () => {
            const items = textarea.value.split('\n').filter(item => item.trim());
            this.wheelData.custom.items = items;
            this.setWheelData('custom');
            dialog.style.display = 'none';
        };
    }

    activate() {
        this.initWheel();
        this.setupEventListeners();
    }

    deactivate() {
        // Cleanup if needed
    }
}