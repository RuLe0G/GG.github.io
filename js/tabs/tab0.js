// tab0.js
import {Helpers} from '../modules/helpers.js';
import {Dom} from '../modules/dom.js';
import dataSet from '../data/wheelData.js';

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

    async initWheel() {
        if (this.wheelInitialized) return;

        try {
            await Helpers.loadScript('js/Wheel/p5.min.js');
            await Helpers.loadScript('js/Wheel/WheelSketch.js');
        } catch (err) {
            Helpers.handleError(`Failed to load p5 or WheelSketch: ${err}`);
            return;
        }

        this.p5Wheel = new p5(WheelSketch);
        this.setWheelData('default');
        this.wheelInitialized = true;
    }

    setWheelData(typeKey) {
        if (!this.p5Wheel) {
            this.currentDataSet = typeKey;
            return;
        }

        const ds = this.wheelData[typeKey];
        if (!ds || !Array.isArray(ds.items)) {
            console.warn(`No data for wheel type "${typeKey}"`);
            return;
        }

        this.p5Wheel.setData(ds.items);
        this.currentDataSet = typeKey;

        const elText = this.elements.lastSelectedText;
        if (elText) elText.textContent = '';
    }

    setupEventListeners() {
        Dom.delegateEvent(
            document.querySelector('.wheel-buttons'),
            'click',
            '.wheel-btn',
            e => {
                const btn = e.target.closest('.wheel-btn');
                if (!btn) return;

                document.querySelectorAll('.wheel-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.setWheelData(btn.dataset.wheel);
            }
        );

        if (this.elements.copyButton) {
            this.elements.copyButton.addEventListener('click', () => {
                const txt = this.elements.lastSelectedText.textContent;
                if (txt) {
                    navigator.clipboard.writeText(txt).catch(err => console.warn('Copy failed:', err));
                }
            });
        }
    }

    activate() {
        this.initWheel().then(() => {
            this.setWheelData(this.currentDataSet);
            this.setupEventListeners();

            const defBtn = document.querySelector('.wheel-btn[data-wheel="default"]');
            if (defBtn) defBtn.classList.add('active');
        });
    }

    deactivate() {
        // Optionally call this.p5Wheel.remove() to remove the canvas and stop draw()
    }
}
