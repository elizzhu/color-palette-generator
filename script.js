document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const themeSelect = document.getElementById('themeSelect');
    const paletteContainer = document.getElementById('palette');
    const toast = document.getElementById('toast');

    // Color name generator
    const colorNames = [
        'Sunset', 'Ocean', 'Forest', 'Desert', 'Mountain', 'Sky',
        'Meadow', 'Coral', 'Sand', 'Mist', 'Dawn', 'Dusk',
        'Peach', 'Lavender', 'Sage', 'Amber', 'Ruby', 'Emerald'
    ];

    // Generate random color based on theme
    function generateColor(theme) {
        const hue = Math.random() * 360;
        let saturation, lightness;

        switch (theme) {
            case 'pastel':
                saturation = 60 + Math.random() * 20;
                lightness = 80 + Math.random() * 15;
                break;
            case 'earth':
                saturation = 30 + Math.random() * 20;
                lightness = 40 + Math.random() * 30;
                break;
            case 'vibrant':
                saturation = 80 + Math.random() * 20;
                lightness = 50 + Math.random() * 20;
                break;
            case 'monochrome':
                saturation = 0;
                lightness = Math.random() * 100;
                break;
            default: // random
                saturation = 50 + Math.random() * 50;
                lightness = 30 + Math.random() * 40;
        }

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
        const theme = themeSelect.value;
        const lockedColors = Array.from(document.querySelectorAll('.color-swatch'))
            .filter(swatch => swatch.querySelector('.lock-icon.locked'))
            .map(swatch => swatch.style.backgroundColor);

        paletteContainer.innerHTML = '';
        const numColors = 6;

        for (let i = 0; i < numColors; i++) {
            const color = lockedColors[i] || generateColor(theme);
            const hex = hslToHex(color);
            const name = colorNames[Math.floor(Math.random() * colorNames.length)];
            
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch rounded-lg shadow-sm';
            swatch.style.backgroundColor = color;
            swatch.innerHTML = `
                <div class="color-preview"></div>
                <div class="color-info">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-gray-700">${name}</span>
                        <button class="lock-icon" aria-label="Lock color">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                        <div class="w-6 h-6 rounded border border-gray-200" style="background-color: ${color}"></div>
                        <span class="text-sm text-gray-500">${hex}</span>
                        <button class="copy-btn text-gray-500 hover:text-gray-700 ml-auto" aria-label="Copy color">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            paletteContainer.appendChild(swatch);
        }

        // Add event listeners
        document.querySelectorAll('.lock-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                icon.classList.toggle('locked');
            });
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const hex = btn.previousElementSibling.textContent;
                navigator.clipboard.writeText(hex);
                showToast();
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

    // Download palette as PNG
    function downloadPalette() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const swatches = document.querySelectorAll('.color-swatch');
        
        canvas.width = 1200;
        canvas.height = 200;
        
        swatches.forEach((swatch, index) => {
            ctx.fillStyle = swatch.style.backgroundColor;
            ctx.fillRect(index * 200, 0, 200, 200);
        });

        const link = document.createElement('a');
        link.download = 'color-palette.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    // Event listeners
    generateBtn.addEventListener('click', generatePalette);
    downloadBtn.addEventListener('click', downloadPalette);

    // Generate initial palette
    generatePalette();
}); 