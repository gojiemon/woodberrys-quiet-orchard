// ============================================
// Woodberry's Quiet Orchard - Application
// ============================================

const App = {
    // Configuration
    config: {
        STAGES: 6,
        STAGE_NAMES: ['Seed', 'Sprout', 'Blossom', 'Green Fruit', 'Ripening Fruit', 'Harvest'],
        STORAGE_KEY_STAGE: 'woodberry_stage',
        STORAGE_KEY_LAST_WATER_WEEK: 'woodberry_last_water_week',
    },

    // State
    state: {
        stage: 0,
        lastWaterWeek: null,
    },

    // DOM Elements
    elements: {
        waterButton: null,
        stageLabel: null,
        statusMessage: null,
        treeIllustration: null,
        progressBars: [],
        harvestOverlay: null,
        harvestCode: null,
        harvestDate: null,
        closeHarvestButton: null,
    },

    // Initialize the app
    init() {
        this.cacheElements();
        this.loadState();
        this.render();
        this.attachEventListeners();
    },

    // Cache DOM elements
    cacheElements() {
        this.elements.waterButton = document.getElementById('water-button');
        this.elements.stageLabel = document.getElementById('stage-label');
        this.elements.statusMessage = document.getElementById('status-message');
        this.elements.treeIllustration = document.getElementById('tree-illustration');
        this.elements.harvestOverlay = document.getElementById('harvest-overlay');
        this.elements.harvestCode = document.getElementById('harvest-code');
        this.elements.harvestDate = document.getElementById('harvest-date');
        this.elements.closeHarvestButton = document.getElementById('close-harvest-button');

        for (let i = 0; i < this.config.STAGES; i++) {
            this.elements.progressBars.push(document.getElementById(`progress-${i}`));
        }
    },

    // Load state from localStorage
    loadState() {
        const stage = localStorage.getItem(this.config.STORAGE_KEY_STAGE);
        const lastWaterWeek = localStorage.getItem(this.config.STORAGE_KEY_LAST_WATER_WEEK);

        this.state.stage = stage !== null ? parseInt(stage, 10) : 0;
        this.state.lastWaterWeek = lastWaterWeek !== null ? parseInt(lastWaterWeek, 10) : null;
    },

    // Save state to localStorage
    saveState() {
        localStorage.setItem(this.config.STORAGE_KEY_STAGE, this.state.stage.toString());
        localStorage.setItem(this.config.STORAGE_KEY_LAST_WATER_WEEK, this.state.lastWaterWeek.toString());
    },

    // Get current ISO week number
    getCurrentISOWeek() {
        const now = new Date();
        const date = new Date(now.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 4 - (date.getDay() || 7));
        const yearStart = new Date(date.getFullYear(), 0, 1);
        const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
        return `${date.getFullYear()}-${weekNo}`;
    },

    // Check if user can water this week
    canWaterThisWeek() {
        const currentWeek = this.getCurrentISOWeek();
        return this.state.lastWaterWeek !== currentWeek;
    },

    // Water the orchard
    water() {
        if (!this.canWaterThisWeek()) {
            this.showMessage('The soil is still moist. Return next week.');
            return;
        }

        // Update state
        this.state.lastWaterWeek = this.getCurrentISOWeek();
        this.state.stage = Math.min(this.state.stage + 1, this.config.STAGES);

        this.saveState();

        // Show appropriate message
        if (this.state.stage === this.config.STAGES) {
            this.showMessage('You have gently watered your orchard.');
            // Trigger harvest after a brief delay
            setTimeout(() => this.showHarvestScreen(), 800);
        } else {
            this.showMessage('You have gently watered your orchard.');
        }

        this.render();
    },

    // Show harvest screen
    showHarvestScreen() {
        const harvestCode = this.generateHarvestCode();
        const today = this.formatDate(new Date());

        this.elements.harvestCode.textContent = harvestCode;
        this.elements.harvestDate.textContent = today;

        this.elements.harvestOverlay.classList.remove('hidden');
    },

    // Generate harvest code (4 digits)
    generateHarvestCode() {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const combined = year + month + day;
        const numValue = parseInt(combined, 10);
        const code = (numValue % 10000).toString().padStart(4, '0');
        return code;
    },

    // Format date for display
    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    // Close harvest screen
    closeHarvest() {
        this.elements.harvestOverlay.classList.add('hidden');
        // Reset to stage 0
        this.state.stage = 0;
        this.saveState();
        this.render();
        this.showMessage('Your orchard awaits new growth.');
    },

    // Show message
    showMessage(message) {
        this.elements.statusMessage.textContent = message;
    },

    // Render tree illustration based on stage
    renderTreeIllustration() {
        const svg = this.elements.treeIllustration;
        svg.innerHTML = '';

        const svgNS = 'http://www.w3.org/2000/svg';
        const stage = this.state.stage;

        // Common elements
        const createGroup = (id) => {
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('id', id);
            return g;
        };

        const createPath = (d, attrs = {}) => {
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#3C3C3C');
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');

            Object.keys(attrs).forEach(key => {
                path.setAttribute(key, attrs[key]);
            });

            return path;
        };

        const createCircle = (cx, cy, r, attrs = {}) => {
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', '#3C3C3C');
            circle.setAttribute('stroke-width', '1.5');

            Object.keys(attrs).forEach(key => {
                circle.setAttribute(key, attrs[key]);
            });

            return circle;
        };

        // Stage 0: Seed
        if (stage === 0) {
            const soil = createPath('M 50 250 Q 100 270 150 250 L 150 270 Q 100 280 50 270 Z', {
                fill: '#D4CFC5',
                stroke: '#A89080',
                'stroke-width': '1',
            });
            const seed = createCircle(100, 250, 6, {
                fill: '#8B7355',
                stroke: '#6B6B6B',
            });

            svg.appendChild(soil);
            svg.appendChild(seed);
        }

        // Stage 1: Sprout
        else if (stage === 1) {
            const soil = createPath('M 50 250 Q 100 270 150 250 L 150 270 Q 100 280 50 270 Z', {
                fill: '#D4CFC5',
                stroke: '#A89080',
                'stroke-width': '1',
            });
            const stem = createPath('M 100 250 L 100 180', { 'stroke-width': '2' });
            const leaf1 = createPath('M 100 200 Q 85 185 75 190', { 'stroke-width': '1.5' });
            const leaf2 = createPath('M 100 200 Q 115 185 125 190', { 'stroke-width': '1.5' });

            svg.appendChild(soil);
            svg.appendChild(stem);
            svg.appendChild(leaf1);
            svg.appendChild(leaf2);
        }

        // Stage 2: Blossom
        else if (stage === 2) {
            const soil = createPath('M 50 250 Q 100 270 150 250 L 150 270 Q 100 280 50 270 Z', {
                fill: '#D4CFC5',
                stroke: '#A89080',
                'stroke-width': '1',
            });
            const stem = createPath('M 100 250 L 100 140', { 'stroke-width': '2.5' });

            // Branches
            const branchLeft = createPath('M 100 170 Q 70 160 60 175', { 'stroke-width': '1.5' });
            const branchRight = createPath('M 100 170 Q 130 160 140 175', { 'stroke-width': '1.5' });

            // Leaves
            const leaf1 = createPath('M 100 200 Q 85 190 75 195', { 'stroke-width': '1.5' });
            const leaf2 = createPath('M 100 200 Q 115 190 125 195', { 'stroke-width': '1.5' });

            // Blossoms (using circles with accent color)
            const blossom1 = createCircle(60, 175, 5, {
                fill: '#8B7355',
                stroke: '#8B7355',
                'stroke-width': '0.5',
                opacity: '0.3',
            });
            const blossom2 = createCircle(100, 140, 6, {
                fill: '#8B7355',
                stroke: '#8B7355',
                'stroke-width': '0.5',
                opacity: '0.3',
            });
            const blossom3 = createCircle(140, 175, 5, {
                fill: '#8B7355',
                stroke: '#8B7355',
                'stroke-width': '0.5',
                opacity: '0.3',
            });

            svg.appendChild(soil);
            svg.appendChild(stem);
            svg.appendChild(branchLeft);
            svg.appendChild(branchRight);
            svg.appendChild(leaf1);
            svg.appendChild(leaf2);
            svg.appendChild(blossom1);
            svg.appendChild(blossom2);
            svg.appendChild(blossom3);
        }

        // Stage 3: Green Fruit
        else if (stage === 3) {
            const soil = createPath('M 50 250 Q 100 270 150 250 L 150 270 Q 100 280 50 270 Z', {
                fill: '#D4CFC5',
                stroke: '#A89080',
                'stroke-width': '1',
            });
            const stem = createPath('M 100 250 L 100 130', { 'stroke-width': '2.5' });

            // Branches
            const branchLeft = createPath('M 100 160 Q 70 145 55 165', { 'stroke-width': '1.5' });
            const branchRight = createPath('M 100 160 Q 130 145 145 165', { 'stroke-width': '1.5' });

            // Foliage clusters
            const foliage1 = createCircle(60, 165, 12, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.6',
            });
            const foliage2 = createCircle(100, 130, 14, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.6',
            });
            const foliage3 = createCircle(140, 165, 12, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.6',
            });

            // Fruits
            const fruit1 = createCircle(55, 165, 4, {
                fill: '#6B8E5F',
                stroke: '#6B8E5F',
                opacity: '0.8',
            });
            const fruit2 = createCircle(100, 125, 4, {
                fill: '#6B8E5F',
                stroke: '#6B8E5F',
                opacity: '0.8',
            });
            const fruit3 = createCircle(145, 165, 4, {
                fill: '#6B8E5F',
                stroke: '#6B8E5F',
                opacity: '0.8',
            });

            svg.appendChild(soil);
            svg.appendChild(stem);
            svg.appendChild(branchLeft);
            svg.appendChild(branchRight);
            svg.appendChild(foliage1);
            svg.appendChild(foliage2);
            svg.appendChild(foliage3);
            svg.appendChild(fruit1);
            svg.appendChild(fruit2);
            svg.appendChild(fruit3);
        }

        // Stage 4: Ripening Fruit
        else if (stage === 4) {
            const soil = createPath('M 50 250 Q 100 270 150 250 L 150 270 Q 100 280 50 270 Z', {
                fill: '#D4CFC5',
                stroke: '#A89080',
                'stroke-width': '1',
            });
            const stem = createPath('M 100 250 L 100 120', { 'stroke-width': '2.5' });

            // Branches
            const branchLeft = createPath('M 100 150 Q 65 130 50 155', { 'stroke-width': '1.5' });
            const branchRight = createPath('M 100 150 Q 135 130 150 155', { 'stroke-width': '1.5' });

            // Fuller foliage
            const foliage1 = createCircle(55, 155, 14, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.7',
            });
            const foliage2 = createCircle(100, 120, 16, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.7',
            });
            const foliage3 = createCircle(145, 155, 14, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.7',
            });

            // Ripening fruits (darker/larger)
            const fruit1 = createCircle(50, 155, 6, {
                fill: '#A89080',
                stroke: '#A89080',
                opacity: '0.9',
            });
            const fruit2 = createCircle(100, 115, 6, {
                fill: '#A89080',
                stroke: '#A89080',
                opacity: '0.9',
            });
            const fruit3 = createCircle(150, 155, 6, {
                fill: '#A89080',
                stroke: '#A89080',
                opacity: '0.9',
            });
            const fruit4 = createCircle(75, 145, 5, {
                fill: '#A89080',
                stroke: '#A89080',
                opacity: '0.8',
            });
            const fruit5 = createCircle(125, 140, 5, {
                fill: '#A89080',
                stroke: '#A89080',
                opacity: '0.8',
            });

            svg.appendChild(soil);
            svg.appendChild(stem);
            svg.appendChild(branchLeft);
            svg.appendChild(branchRight);
            svg.appendChild(foliage1);
            svg.appendChild(foliage2);
            svg.appendChild(foliage3);
            svg.appendChild(fruit1);
            svg.appendChild(fruit2);
            svg.appendChild(fruit3);
            svg.appendChild(fruit4);
            svg.appendChild(fruit5);
        }

        // Stage 5: Harvest (Full Tree with Ripe Fruits)
        else if (stage === 5) {
            const soil = createPath('M 50 250 Q 100 270 150 250 L 150 270 Q 100 280 50 270 Z', {
                fill: '#D4CFC5',
                stroke: '#A89080',
                'stroke-width': '1',
            });
            const stem = createPath('M 100 250 L 100 100', { 'stroke-width': '3' });

            // Main branches
            const branchLeft = createPath('M 100 140 Q 60 115 40 145', { 'stroke-width': '2' });
            const branchRight = createPath('M 100 140 Q 140 115 160 145', { 'stroke-width': '2' });

            // Sub-branches
            const subLeft1 = createPath('M 40 145 L 25 160', { 'stroke-width': '1.5' });
            const subLeft2 = createPath('M 40 145 L 50 130', { 'stroke-width': '1.5' });
            const subRight1 = createPath('M 160 145 L 175 160', { 'stroke-width': '1.5' });
            const subRight2 = createPath('M 160 145 L 150 130', { 'stroke-width': '1.5' });

            // Abundant foliage
            const foliage1 = createCircle(40, 145, 16, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.8',
            });
            const foliage2 = createCircle(100, 100, 18, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.8',
            });
            const foliage3 = createCircle(160, 145, 16, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.8',
            });
            const foliage4 = createCircle(70, 120, 12, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.7',
            });
            const foliage5 = createCircle(130, 120, 12, {
                fill: 'none',
                stroke: '#6B8E5F',
                'stroke-width': '1.5',
                opacity: '0.7',
            });

            // Abundant ripe fruits
            const fruits = [
                { x: 40, y: 145, size: 7 },
                { x: 100, y: 95, size: 8 },
                { x: 160, y: 145, size: 7 },
                { x: 25, y: 160, size: 5 },
                { x: 50, y: 130, size: 6 },
                { x: 175, y: 160, size: 5 },
                { x: 150, y: 130, size: 6 },
                { x: 70, y: 115, size: 6 },
                { x: 130, y: 115, size: 6 },
                { x: 85, y: 140, size: 5 },
                { x: 115, y: 140, size: 5 },
            ];

            svg.appendChild(soil);
            svg.appendChild(stem);
            svg.appendChild(branchLeft);
            svg.appendChild(branchRight);
            svg.appendChild(subLeft1);
            svg.appendChild(subLeft2);
            svg.appendChild(subRight1);
            svg.appendChild(subRight2);
            svg.appendChild(foliage1);
            svg.appendChild(foliage2);
            svg.appendChild(foliage3);
            svg.appendChild(foliage4);
            svg.appendChild(foliage5);

            fruits.forEach((fruit) => {
                const fruitCircle = createCircle(fruit.x, fruit.y, fruit.size, {
                    fill: '#8B7355',
                    stroke: '#8B7355',
                    opacity: '1',
                });
                svg.appendChild(fruitCircle);
            });
        }
    },

    // Update progress bars
    updateProgress() {
        this.elements.progressBars.forEach((bar, index) => {
            if (index < this.state.stage) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    },

    // Update stage label
    updateStageLabel() {
        const stageName = this.config.STAGE_NAMES[Math.min(this.state.stage, this.config.STAGE_NAMES.length - 1)];
        this.elements.stageLabel.textContent = stageName;
    },

    // Update button state
    updateButtonState() {
        const canWater = this.canWaterThisWeek() && this.state.stage < this.config.STAGES;
        this.elements.waterButton.disabled = !canWater;

        if (!canWater && this.state.stage < this.config.STAGES) {
            this.elements.waterButton.textContent = 'Water Next Week';
        } else if (this.state.stage >= this.config.STAGES) {
            this.elements.waterButton.textContent = 'Your Orchard Awaits';
        } else {
            this.elements.waterButton.textContent = 'Water Your Orchard';
        }
    },

    // Main render function
    render() {
        this.renderTreeIllustration();
        this.updateProgress();
        this.updateStageLabel();
        this.updateButtonState();

        // Set initial message if needed
        if (this.elements.statusMessage.textContent === '') {
            this.showMessage('Begin when you are ready.');
        }
    },

    // Attach event listeners
    attachEventListeners() {
        this.elements.waterButton.addEventListener('click', () => this.water());
        this.elements.closeHarvestButton.addEventListener('click', () => this.closeHarvest());
    },
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});