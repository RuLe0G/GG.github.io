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
            Helpers.handleError(`Не удалось загрузить p5 или WheelSketch: ${err}`);
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
            console.warn(`Нет данных для колеса "${typeKey}"`);
            return;
        }

        const itemsCopy = ds.items.slice();
        shuffleArray(itemsCopy);

        const totalWeight = itemsCopy.reduce((sum, it) => sum + (it.weight || 1), 0);

        const wheelItems = itemsCopy.map(it => {
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            const colorHex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
            return {
                title: it.title,
                weight: it.weight || 1,
                colorHex
            };
        });

        const wheelForP5 = wheelItems.map(item => ({
            title: item.title,
            weight: item.weight,
            colorHex: item.colorHex
        }));
        this.p5Wheel.setData(wheelForP5);

        this.updateWheelTable(wheelItems, totalWeight);

        this.currentDataSet = typeKey;
        const elText = this.elements.lastSelectedText;
        if (elText) elText.textContent = '';
    }

    updateWheelTable(items, totalWeight) {
        const container = document.getElementById('wheel-table');
        if (!container) return;

        const rowsHtml = items.map((it, idx) => {
            const chancePct = ((it.weight / totalWeight) * 100).toFixed(1);
            return `
                <tr data-index="${idx}">
                    <td>${it.title.length > 40 ? it.title.slice(0, 40) + '…' : it.title}</td>
                    <td>${chancePct}%</td>
                    <td><span class="color-dot" style="background: ${it.colorHex}"></span></td>
                </tr>`;
        }).join('');

        container.innerHTML = `
            <table>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;

        container.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('mouseenter', () => {
                const idx = parseInt(row.dataset.index, 10);
                this.p5Wheel.setHoverIndex(idx);
            });
            row.addEventListener('mouseleave', () => {
                this.p5Wheel.setHoverIndex(null);
            });
        });
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
                    navigator.clipboard.writeText(txt).catch(err => console.warn('Не удалось скопировать:', err));
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
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}