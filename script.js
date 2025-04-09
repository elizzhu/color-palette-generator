document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const colorInput = document.querySelector('input[placeholder="Enter color code"]');
    const paletteContainer = document.getElementById('palette');
    const toast = document.getElementById('toast');

    // Color name generator
    const colorNames = [
        'Sunset', 'Ocean', 'Forest', 'Desert', 'Mountain', 'Sky',
        'Meadow', 'Coral', 'Sand', 'Mist', 'Dawn', 'Dusk',
        'Peach', 'Lavender', 'Sage', 'Amber', 'Ruby', 'Emerald'
    ];

    // Generate random color based on input or random
    function generateColor(baseColor = null) {
        if (baseColor) {
            // Generate harmonious colors based on input
            const hue = Math.random() * 360;
            const saturation = 70 + Math.random() * 20;
            const lightness = 50 + Math.random() * 20;
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        } else {
            // Generate random pleasing color
            const hue = Math.random() * 360;
            const saturation = 60 + Math.random() * 20;
            const lightness = 50 + Math.random() * 20;
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
    }

    // Convert HSL to HEX
    function hslToHex(hsl) {
        const [h, s, l] = hsl.match(/\d+/g).map(Number);
        const a = s * Math.min(l, 100 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // Generate new palette
    function generatePalette() {
        const baseColor = colorInput.value.trim();
        paletteContainer.innerHTML = '';
        const numColors = 6;

        for (let i = 0; i < numColors; i++) {
            const color = generateColor(baseColor);
            const hex = hslToHex(color);
            const name = colorNames[Math.floor(Math.random() * colorNames.length)];
            
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.innerHTML = `
                <div class="color-preview" style="background-color: ${color}">
                    <div class="action-buttons">
                        <button class="action-button save-btn" aria-label="Save color">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                        <button class="action-button copy-btn" aria-label="Copy color">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                            </svg>
                        </button>
                        <button class="action-button lock-btn" aria-label="Lock color">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="color-info">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-300">${name}</span>
                        <span class="color-code">${hex}</span>
                    </div>
                </div>
            `;

            paletteContainer.appendChild(swatch);
        }

        // Add event listeners
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('active');
            });
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const hex = btn.closest('.color-swatch').querySelector('.color-code').textContent;
                navigator.clipboard.writeText(hex);
                showToast();
            });
        });

        document.querySelectorAll('.lock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('active');
            });
        });
    }

    // Show toast notification
    function showToast() {
        toast.classList.add('toast-visible');
        setTimeout(() => {
            toast.classList.remove('toast-visible');
        }, 2000);
    }

    // Event listeners
    generateBtn.addEventListener('click', generatePalette);
    colorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generatePalette();
        }
    });

    // Generate initial palette
    generatePalette();
}); 