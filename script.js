document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const colorInput = document.querySelector('input[placeholder="Enter color code"]');
    const paletteContainer = document.getElementById('palette');
    const toast = document.getElementById('toast');
    const dropZone = document.getElementById('dropZone');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const preview = document.getElementById('preview');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const extractBtn = document.getElementById('extractBtn');

    // Color name generator
    const colorNames = [
        'Sunset', 'Ocean', 'Forest', 'Desert', 'Mountain', 'Sky',
        'Meadow', 'Coral', 'Sand', 'Mist', 'Dawn', 'Dusk',
        'Peach', 'Lavender', 'Sage', 'Amber', 'Ruby', 'Emerald'
    ];

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-[#E9967A]');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-[#E9967A]');
    }

    // Handle file selection
    dropZone.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('drop', handleDrop);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            if (!file.type.match('image.*')) {
                alert('Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                preview.classList.remove('hidden');
                uploadPrompt.classList.add('hidden');
                extractBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    // Extract colors from image
    function extractColors(imageElement) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imageElement.naturalWidth;
            canvas.height = imageElement.naturalHeight;
            ctx.drawImage(imageElement, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const colorMap = new Map();
            const skipPixels = 10; // Sample every 10th pixel for performance

            for (let i = 0; i < imageData.length; i += 4 * skipPixels) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const rgb = `${r},${g},${b}`;
                colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
            }

            // Convert to array and sort by frequency
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([rgb]) => {
                    const [r, g, b] = rgb.split(',').map(Number);
                    return rgbToHsl(r, g, b);
                });

            resolve(sortedColors);
        });
    }

    // RGB to HSL conversion
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }

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

    // Generate palette from colors array
    function generatePaletteFromColors(colors) {
        paletteContainer.innerHTML = '';
        
        colors.forEach((color, index) => {
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
        });

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
    }

    // Generate new palette
    function generatePalette() {
        const baseColor = colorInput.value.trim();
        const colors = Array(6).fill().map(() => generateColor(baseColor));
        generatePaletteFromColors(colors);
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

    extractBtn.addEventListener('click', async () => {
        if (imagePreview.src) {
            extractBtn.disabled = true;
            extractBtn.innerHTML = `
                <span>Extracting...</span>
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            
            const colors = await extractColors(imagePreview);
            generatePaletteFromColors(colors);
            
            extractBtn.disabled = false;
            extractBtn.innerHTML = `
                <span>Extract Colors</span>
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
            `;
        }
    });

    // Generate initial palette
    generatePalette();
}); 