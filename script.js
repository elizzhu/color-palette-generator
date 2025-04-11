// Instagram API Configuration
const INSTAGRAM_API_CONFIG = {
    clientId: '', // You'll need to add your Instagram API client ID
    clientSecret: '', // You'll need to add your Instagram API client secret
    redirectUri: window.location.origin + '/auth/callback',
    apiBaseUrl: 'https://graph.instagram.com/v12.0'
};

// API Configuration
const API_CONFIG = {
    screenshotApiKey: 'mji7Vyz7XA5bUQ',
    screenshotApiUrl: 'https://api.screenshotone.com/take',
    screenshotParams: {
        format: 'jpg',
        block_ads: true,
        block_cookie_banners: true,
        block_banners_by_heuristics: false,
        block_trackers: true,
        delay: 0,
        timeout: 60,
        response_type: 'by_format',
        image_quality: 80
    },
    googleMapsApiKey: 'AIzaSyASBoq7KEiL7E0S5ikNZ7slqYE1opzmrXY' // Updated Google Maps API key
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Get DOM elements
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const websitePreview = document.getElementById('websitePreview');
    const favicon = document.getElementById('favicon');
    const siteName = document.getElementById('siteName');
    const siteUrl = document.getElementById('siteUrl');
    const siteScreenshot = document.getElementById('siteScreenshot');
    const brandProfile = document.getElementById('brandProfile');
    const brandName = document.getElementById('brandName');
    const brandDomain = document.getElementById('brandDomain');
    const brandLogo = document.getElementById('brandLogo');
    const palette = document.getElementById('palette');
    const brandInsights = document.getElementById('brandInsights');
    const typography = document.getElementById('typography');
    const toast = document.getElementById('toast');

    if (!urlInput || !analyzeBtn) {
        console.error('Critical elements not found:', {
            urlInput: !!urlInput,
            analyzeBtn: !!analyzeBtn
        });
        return;
    }
    
    console.log('Elements found successfully');

    // Analyze website
    async function analyzeWebsite(url) {
        try {
            // Validate URL
            const validUrl = validateAndFormatUrl(url);
            if (!validUrl) {
                throw new Error('Please enter a valid URL');
            }

            // Check if API key is configured
            if (API_CONFIG.screenshotApiKey === 'YOUR_SCREENSHOT_API_KEY') {
                throw new Error('Please configure your ScreenshotOne API key in the API_CONFIG object');
            }

            // Update button state
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = `
                <span>Analyzing...</span>
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;

            // Create API endpoint URL
            const apiUrl = new URL(API_CONFIG.screenshotApiUrl);
            apiUrl.searchParams.append('access_key', API_CONFIG.screenshotApiKey);
            apiUrl.searchParams.append('url', validUrl);
            
            // Add additional parameters
            Object.entries(API_CONFIG.screenshotParams).forEach(([key, value]) => {
                apiUrl.searchParams.append(key, value);
            });

            // Get website screenshot
            const screenshot = await fetch(apiUrl.toString());
            if (!screenshot.ok) {
                const errorData = await screenshot.json();
                throw new Error(errorData.message || 'Failed to capture website screenshot');
            }

            // Clone the response for color extraction
            const screenshotBlob = await screenshot.blob();
            const screenshotClone = new Blob([await screenshotBlob.arrayBuffer()], { type: 'image/jpeg' });

            // Update website preview
            siteScreenshot.innerHTML = `<img src="${URL.createObjectURL(screenshotBlob)}" class="w-full h-full object-cover">`;
            
            // Get favicon
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${validUrl}&sz=128`;
            favicon.innerHTML = `<img src="${faviconUrl}" class="w-6 h-6">`;

            // Update site info
            const domain = new URL(validUrl).hostname;
            siteName.textContent = domain.replace(/^www\./, '').split('.')[0].charAt(0).toUpperCase() + 
                                 domain.replace(/^www\./, '').split('.')[0].slice(1);
            siteUrl.textContent = domain;
            websitePreview.classList.remove('hidden');

            // Extract colors from screenshot
            const colors = await extractColorsFromImage(screenshotClone);
            generatePaletteFromColors(colors);

            // Update brand profile
            brandName.textContent = siteName.textContent;
            brandDomain.textContent = domain;
            brandLogo.innerHTML = `<img src="${faviconUrl}" class="w-16 h-16">`;

            // Generate insights
            generateBrandInsights(colors);

            // Analyze typography (simulated)
            generateTypographyAnalysis();

            // Show results
            brandProfile.classList.remove('hidden');

            // Reset button state
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `
                <span>Analyze Site</span>
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            `;

        } catch (error) {
            console.error('Error analyzing website:', error);
            alert(error.message || 'Error analyzing website. Please try again.');
            
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `
                <span>Analyze Site</span>
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            `;
        }
    }

    // Analyze location
    async function analyzeLocation() {
        const locationInput = document.getElementById('urlInput');
        if (!locationInput || !locationInput.value) {
            alert('Please enter a location');
            return;
        }

        try {
            // Update button state to show loading
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.disabled = true;
                analyzeBtn.innerHTML = `
                    <span>Analyzing...</span>
                    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                `;
            }

            const geocoder = new google.maps.Geocoder();
            const geocodeResult = await geocoder.geocode({ address: locationInput.value });
            
            if (!geocodeResult.results || geocodeResult.results.length === 0) {
                throw new Error('Location not found');
            }

            const location = geocodeResult.results[0];
            const placeId = location.place_id;
            
            // Create a map element for the Places service
            const mapElement = document.createElement('div');
            mapElement.style.width = '1px';
            mapElement.style.height = '1px';
            document.body.appendChild(mapElement);
            
            // Initialize a minimal map
            const map = new google.maps.Map(mapElement, {
                center: location.geometry.location,
                zoom: 15
            });
            
            // Use Places Service to get place details
            const service = new google.maps.places.PlacesService(map);
            const placeDetails = await new Promise((resolve, reject) => {
                service.getDetails({ placeId: placeId, fields: ['name', 'photos', 'formatted_address', 'types'] }, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve(place);
                    } else {
                        reject(new Error('Failed to get place details'));
                    }
                });
            });

            // Update site details
            const siteName = document.getElementById('siteName');
            const siteUrl = document.getElementById('siteUrl');
            const siteScreenshot = document.getElementById('siteScreenshot');
            
            if (siteName) siteName.textContent = placeDetails.name;
            if (siteUrl) siteUrl.textContent = placeDetails.formatted_address;
            
            // Update screenshot with the first photo if available
            if (siteScreenshot && placeDetails.photos && placeDetails.photos.length > 0) {
                const photo = placeDetails.photos[0];
                siteScreenshot.innerHTML = `<img src="${photo.getUrl({ maxWidth: 800, maxHeight: 600 })}" class="w-full h-full object-cover">`;
            }
            
            // Show the website preview
            const websitePreview = document.getElementById('websitePreview');
            if (websitePreview) websitePreview.classList.remove('hidden');
            
            // Update brand profile
            const brandName = document.getElementById('brandName');
            const brandDomain = document.getElementById('brandDomain');
            const brandLogo = document.getElementById('brandLogo');
            
            if (brandName) brandName.textContent = placeDetails.name;
            if (brandDomain) brandDomain.textContent = placeDetails.formatted_address;
            
            if (brandLogo) {
                brandLogo.innerHTML = `
                    <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                    </div>
                `;
            }
            
            // Extract colors and generate palette if photos available
            if (placeDetails.photos && placeDetails.photos.length > 0) {
                const photo = placeDetails.photos[0];
                const img = document.createElement('img');
                img.crossOrigin = 'Anonymous';
                img.src = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Extract colors (simplified for now)
                    const colors = ['#336699', '#993366', '#669933', '#663399', '#996633'];
                    
                    // Generate palette
                    const palette = document.getElementById('palette');
                    if (palette) {
                        palette.innerHTML = colors.map(color => `
                            <div class="color-swatch h-24 rounded-lg cursor-pointer" style="background-color: ${color}" data-color="${color}"></div>
                        `).join('');
                        
                        // Add click event to copy colors
                        document.querySelectorAll('.color-swatch').forEach(swatch => {
                            swatch.addEventListener('click', function() {
                                const color = this.getAttribute('data-color');
                                navigator.clipboard.writeText(color).then(() => {
                                    showToast();
                                });
                            });
                        });
                    }
                    
                    // Show brand profile
                    const brandProfile = document.getElementById('brandProfile');
                    if (brandProfile) brandProfile.classList.remove('hidden');
                };
            }

            // Clean up the temporary map element
            document.body.removeChild(mapElement);
            
            // Reset button state
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = `
                    <span>Analyze</span>
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                `;
            }

        } catch (error) {
            console.error('Error analyzing location:', error);
            alert('Error analyzing location: ' + error.message);
            
            // Reset button state
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = `
                    <span>Analyze</span>
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                `;
            }
        }
    }

    // Validate and format URL
    function validateAndFormatUrl(url) {
        try {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            const urlObj = new URL(url);
            return urlObj.toString();
        } catch {
            return null;
        }
    }

    // Extract colors from image
    async function extractColorsFromImage(imageBlob) {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                const colorCounts = {};
                
                // Sample pixels at regular intervals
                for (let i = 0; i < imageData.length; i += 16) {
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    const rgb = `rgb(${r},${g},${b})`;
                    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
                }
                
                // Convert to HSL and get unique colors
                const colors = Object.entries(colorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 20)
                    .map(([color]) => {
                        const rgb = color.match(/\d+/g).map(Number);
                        return rgbToHsl(rgb[0], rgb[1], rgb[2]);
                    })
                    .filter((color, index, self) => 
                        index === self.findIndex(c => 
                            Math.abs(c[0] - color[0]) < 10 &&
                            Math.abs(c[1] - color[1]) < 10 &&
                            Math.abs(c[2] - color[2]) < 10
                        )
                    )
                    .slice(0, 6)
                    .map(hsl => `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`);
                
                resolve(colors);
            };
            
            img.src = URL.createObjectURL(imageBlob);
        });
    }

    // Convert RGB to HSL
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

        return [h * 360, s * 100, l * 100];
    }

    // Generate color palette
    function generatePaletteFromColors(colors) {
        palette.innerHTML = '';
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch p-4 rounded-lg cursor-pointer';
            swatch.style.backgroundColor = color;
            swatch.innerHTML = `
                <div class="text-sm font-medium text-white text-center">
                    ${color}
                </div>
            `;
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(color);
                toast.classList.remove('hidden');
                setTimeout(() => toast.classList.add('hidden'), 2000);
            });
            palette.appendChild(swatch);
        });
    }

    // Generate brand insights
    function generateBrandInsights(colors) {
        const insights = [
            {
                title: 'Color Harmony',
                description: analyzeColorHarmony(colors)
            },
            {
                title: 'Brand Personality',
                description: analyzeBrandPersonality(colors)
            },
            {
                title: 'Visual Impact',
                description: analyzeVisualImpact(colors)
            },
            {
                title: 'Industry Alignment',
                description: analyzeIndustryAlignment(colors)
            }
        ];

        brandInsights.innerHTML = insights.map(insight => `
            <div class="bg-[#1A1A1A] rounded-lg p-4">
                <h4 class="font-semibold mb-2">${insight.title}</h4>
                <p class="text-gray-400 text-sm">${insight.description}</p>
            </div>
        `).join('');
    }

    // Generate typography analysis
    function generateTypographyAnalysis() {
        const typographyInsights = [
            {
                title: 'Primary Font',
                description: 'Analysis of website headers and main text will be added in the next version.'
            },
            {
                title: 'Font Hierarchy',
                description: 'Font size and weight analysis will be added in the next version.'
            }
        ];

        typography.innerHTML = typographyInsights.map(insight => `
            <div class="bg-[#1A1A1A] rounded-lg p-4">
                <h4 class="font-semibold mb-2">${insight.title}</h4>
                <p class="text-gray-400 text-sm">${insight.description}</p>
            </div>
        `).join('');
    }

    // Color analysis functions
    function analyzeColorHarmony(colors) {
        const hues = colors.map(color => {
            const match = color.match(/hsl\((\d+)/);
            return match ? parseInt(match[1]) : 0;
        });

        const huesDiff = Math.abs(Math.max(...hues) - Math.min(...hues));
        
        if (huesDiff < 30) return "Monochromatic harmony - creates a sophisticated and cohesive look";
        if (huesDiff > 150) return "Complementary harmony - creates strong contrast and visual interest";
        return "Analogous harmony - creates a harmonious and balanced feel";
    }

    function analyzeBrandPersonality(colors) {
        const personalities = {
            warm: ["Friendly", "Energetic", "Approachable"],
            cool: ["Professional", "Trustworthy", "Calm"],
            bright: ["Dynamic", "Innovative", "Bold"],
            muted: ["Sophisticated", "Traditional", "Reliable"]
        };

        const avgSaturation = colors.reduce((sum, color) => {
            const match = color.match(/hsl\(\d+,\s*(\d+)%/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0) / colors.length;

        if (avgSaturation > 60) return personalities.bright.join(", ");
        if (avgSaturation > 40) return personalities.warm.join(", ");
        if (avgSaturation > 20) return personalities.cool.join(", ");
        return personalities.muted.join(", ");
    }

    function analyzeVisualImpact(colors) {
        const avgLightness = colors.reduce((sum, color) => {
            const match = color.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0) / colors.length;

        if (avgLightness > 70) return "Light and airy - creates an open, modern feel";
        if (avgLightness < 30) return "Dark and bold - creates a premium, dramatic feel";
        return "Balanced contrast - creates a professional, readable feel";
    }

    function analyzeIndustryAlignment(colors) {
        const dominantHue = parseInt(colors[0].match(/hsl\((\d+)/)[1]);
        const industries = {
            tech: [200, 240],     // Blues
            finance: [180, 220],   // Blue-greens
            health: [120, 160],    // Greens
            food: [20, 60],        // Oranges and yellows
            fashion: [300, 340],   // Purples and pinks
            creative: [0, 360]     // All hues
        };

        for (const [industry, [min, max]] of Object.entries(industries)) {
            if (dominantHue >= min && dominantHue <= max) {
                return `Color scheme commonly used in the ${industry} industry`;
            }
        }

        return "Versatile color scheme suitable for multiple industries";
    }

    // Function to show the toast notification
    function showToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 2000);
        }
    }

    // Add click event listener
    analyzeBtn.onclick = (e) => {
        e.preventDefault();
        console.log('Button clicked');
        
        const input = urlInput.value.trim();
        console.log('Input value:', input);
        
        if (!input) {
            alert('Please enter a website URL or location');
            return;
        }

        if (input.startsWith('http://') || input.startsWith('https://')) {
            console.log('Analyzing website...');
            analyzeWebsite(input).catch(err => {
                console.error('Website analysis error:', err);
                alert('Error analyzing website: ' + err.message);
            });
        } else {
            console.log('Analyzing location...');
            analyzeLocation().catch(err => {
                console.error('Location analysis error:', err);
                alert('Error analyzing location: ' + err.message);
            });
        }
    };

    // Also add the original event listener as backup
    analyzeBtn.addEventListener('click', (e) => {
        console.log('Button click via addEventListener');
    });

    console.log('Event listeners attached');
}); 