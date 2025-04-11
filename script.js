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

    // Initialize Google Places Autocomplete
    initializeAutocomplete();

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

            // Enhanced brand analysis
            const brandPersonality = await analyzeBrandPersonality(validUrl);
            const brandPatterns = await extractBrandPatterns(validUrl);
            const brandIcons = await detectBrandIcons(validUrl);
            const brandMessaging = await analyzeBrandMessaging(validUrl);
            
            // Update the brand profile section with enhanced analysis
            const brandProfileSection = document.getElementById('brandProfile');
            if (brandProfileSection) {
                let brandProfileHTML = `
                    <h3>Brand Personality</h3>
                    <p>Primary: ${brandPersonality?.primaryPersonality || 'Not detected'}</p>
                    <div class="tone-analysis">
                        <h4>Tone Analysis</h4>
                        <ul>
                            ${Object.entries(brandPersonality?.toneAnalysis || {}).map(([tone, count]) => 
                                `<li>${tone}: ${count} mentions</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <h3>Brand Messaging</h3>
                    <div class="messaging-analysis">
                        <h4>Taglines</h4>
                        <ul>
                            ${brandMessaging?.taglines.map(tagline => 
                                `<li>${tagline}</li>`
                            ).join('') || '<li>No taglines detected</li>'}
                        </ul>
                        
                        <h4>Value Propositions</h4>
                        <ul>
                            ${brandMessaging?.valueProps.map(prop => 
                                `<li>${prop}</li>`
                            ).join('') || '<li>No value propositions detected</li>'}
                        </ul>
                        
                        <h4>Calls to Action</h4>
                        <ul>
                            ${brandMessaging?.callsToAction.map(cta => 
                                `<li>${cta}</li>`
                            ).join('') || '<li>No calls to action detected</li>'}
                        </ul>
                    </div>
                    
                    <h3>Visual Elements</h3>
                    <div class="visual-elements">
                        <h4>Patterns & Textures</h4>
                        <ul>
                            ${brandPatterns.map(pattern => 
                                `<li>${pattern}</li>`
                            ).join('') || '<li>No patterns detected</li>'}
                        </ul>
                        
                        <h4>Icons & Symbols</h4>
                        <ul>
                            ${brandIcons.map(icon => 
                                `<li>${icon}</li>`
                            ).join('') || '<li>No icons detected</li>'}
                        </ul>
                    </div>
                `;
                
                brandProfileSection.innerHTML = brandProfileHTML;
            }

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
            alert('Please enter a business name');
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

            let placeId;
            // If we have a stored place_id from autocomplete, use it directly
            if (locationInput.dataset.placeId) {
                placeId = locationInput.dataset.placeId;
            } else {
                // Otherwise, geocode the input value
                const geocoder = new google.maps.Geocoder();
                const geocodeResult = await geocoder.geocode({ address: locationInput.value });
                
                if (!geocodeResult.results || geocodeResult.results.length === 0) {
                    throw new Error('Business not found');
                }
                placeId = geocodeResult.results[0].place_id;
            }
            
            // Create a map element for the Places service
            const mapElement = document.createElement('div');
            mapElement.style.width = '1px';
            mapElement.style.height = '1px';
            document.body.appendChild(mapElement);
            
            // Initialize a minimal map
            const map = new google.maps.Map(mapElement, {
                center: { lat: 0, lng: 0 },
                zoom: 15
            });
            
            // Use Places Service to get place details
            const service = new google.maps.places.PlacesService(map);
            const placeDetails = await new Promise((resolve, reject) => {
                service.getDetails({ 
                    placeId: placeId,
                    fields: ['name', 'photos', 'formatted_address', 'types', 'rating', 'reviews', 'website', 'opening_hours', 'icon', 'business_status'] 
                }, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resolve(place);
                    } else {
                        reject(new Error('Failed to get business details'));
                    }
                });
            });

            // Update site details with business name as primary identifier
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
            
            // Update brand profile with business name
            const brandName = document.getElementById('brandName');
            const brandDomain = document.getElementById('brandDomain');
            const brandLogo = document.getElementById('brandLogo');
            
            if (brandName) brandName.textContent = placeDetails.name;
            if (brandDomain) brandDomain.textContent = placeDetails.formatted_address;
            
            // Get logo using enhanced method
            if (brandLogo) {
                const logoUrl = await getBrandLogo(placeDetails);
                if (logoUrl) {
                    brandLogo.innerHTML = `<img src="${logoUrl}" class="w-16 h-16 object-contain">`;
                } else {
                    // Fallback to default business icon
                    brandLogo.innerHTML = `
                        <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                            </svg>
                        </div>
                    `;
                }
            }
            
            // Show brand profile
            const brandProfile = document.getElementById('brandProfile');
            if (brandProfile) brandProfile.classList.remove('hidden');
            
            // Extract brand colors using enhanced method
            const colors = await extractBrandColors(placeDetails);
            
            // Generate palette
            const palette = document.getElementById('palette');
            if (palette) {
                if (colors === null) {
                    palette.innerHTML = `
                        <div class="bg-[#1A1A1A] rounded-lg p-4 text-center">
                            <p class="text-gray-400">Unable to extract brand colors. The available images don't contain enough distinct, high-quality colors to generate a meaningful palette.</p>
                        </div>
                    `;
                } else {
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
            }
            
            // Generate brand insights
            generateBrandInsights(colors);

            // Generate typography analysis
            const typography = document.getElementById('typography');
            if (typography) {
                const typographyInsights = [
                    {
                        title: 'Primary Font',
                        description: analyzeTypography(placeDetails)
                    },
                    {
                        title: 'Font Hierarchy',
                        description: 'Based on the location type and atmosphere, a balanced font hierarchy would be recommended.'
                    }
                ];

                typography.innerHTML = typographyInsights.map(insight => `
                    <div class="bg-[#1A1A1A] rounded-lg p-4">
                        <h4 class="font-semibold mb-2">${insight.title}</h4>
                        <p class="text-gray-400 text-sm">${insight.description}</p>
                    </div>
                `).join('');
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
        try {
            r /= 255;
            g /= 255;
            b /= 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                    default: h = 0;
                }
                h /= 6;
            }

            return [h * 360, s * 100, l * 100];
        } catch (error) {
            console.error('Error converting RGB to HSL:', error);
            return [0, 0, 50]; // Return neutral gray as fallback
        }
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

    // Location analysis functions
    function analyzeLocationAtmosphere(colors, place) {
        const avgLightness = colors.reduce((sum, color) => {
            const match = color.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0) / colors.length;

        if (avgLightness > 70) return "Bright and welcoming atmosphere";
        if (avgLightness < 30) return "Intimate and cozy atmosphere";
        return "Balanced and comfortable atmosphere";
    }

    function analyzeArchitecturalStyle(colors, place) {
        const dominantHue = parseInt(colors[0].match(/hsl\((\d+)/)[1]);
        const styles = {
            modern: [180, 240],    // Blues and teals
            traditional: [20, 60],  // Warm earth tones
            industrial: [0, 20],    // Grays and blacks
            natural: [80, 160]      // Greens and earth tones
        };

        for (const [style, [min, max]] of Object.entries(styles)) {
            if (dominantHue >= min && dominantHue <= max) {
                return `Architectural style suggests a ${style} design approach`;
            }
        }

        return "Unique architectural character";
    }

    function analyzeVisualIdentity(colors, place) {
        const avgSaturation = colors.reduce((sum, color) => {
            const match = color.match(/hsl\(\d+,\s*(\d+)%/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0) / colors.length;

        if (avgSaturation > 60) return "Bold and distinctive visual identity";
        if (avgSaturation > 30) return "Balanced and professional visual identity";
        return "Subtle and sophisticated visual identity";
    }

    function analyzeCulturalContext(colors, place) {
        const address = place.formatted_address.toLowerCase();
        const contexts = {
            urban: ["city", "street", "avenue", "downtown"],
            suburban: ["suburb", "neighborhood", "residential"],
            rural: ["country", "village", "township"],
            coastal: ["beach", "coast", "shore", "waterfront"]
        };

        for (const [context, keywords] of Object.entries(contexts)) {
            if (keywords.some(keyword => address.includes(keyword))) {
                return `Reflects ${context} cultural influences`;
            }
        }

        return "Unique cultural context";
    }

    function analyzeTypography(place) {
        const types = place.types || [];
        if (types.includes('restaurant') || types.includes('cafe')) {
            return "Elegant serif fonts for a sophisticated dining experience";
        } else if (types.includes('museum') || types.includes('art_gallery')) {
            return "Clean sans-serif fonts for a modern, artistic feel";
        } else if (types.includes('park') || types.includes('natural_feature')) {
            return "Organic, rounded fonts to complement natural surroundings";
        } else if (types.includes('shopping_mall') || types.includes('store')) {
            return "Bold, attention-grabbing fonts for retail appeal";
        }
        return "Professional, versatile font selection";
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

    function initializeAutocomplete() {
        const input = document.getElementById('urlInput');
        const options = {
            types: ['establishment']  // This restricts results to businesses only
        };
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        
        // Store the selected place data when user selects from dropdown
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.place_id) {
                input.dataset.placeId = place.place_id;
                input.dataset.businessName = place.name;
            }
        });
    }

    async function getBrandLogo(placeDetails) {
        // Try multiple sources for logo in order of quality
        try {
            // 1. Try to get logo from business website if available
            if (placeDetails.website) {
                // Try common logo paths
                const domain = new URL(placeDetails.website).hostname;
                const commonLogoPaths = [
                    `https://${domain}/logo.png`,
                    `https://${domain}/images/logo.png`,
                    `https://${domain}/assets/logo.png`,
                    `https://${domain}/img/logo.png`
                ];
                
                // Try to fetch each path
                for (const logoPath of commonLogoPaths) {
                    try {
                        const response = await fetch(logoPath);
                        if (response.ok && response.headers.get('content-type').startsWith('image/')) {
                            return logoPath;
                        }
                    } catch (e) {
                        console.log('Logo path not found:', logoPath);
                    }
                }
                
                // Fallback to favicon if no logo found
                return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            }
            
            // 2. Try Google Places icon
            if (placeDetails.icon) {
                return placeDetails.icon;
            }
            
            // 3. Try to extract logo from first business photo
            if (placeDetails.photos && placeDetails.photos.length > 0) {
                const photo = placeDetails.photos[0];
                return photo.getUrl({ maxWidth: 800, maxHeight: 600 });
            }

        } catch (error) {
            console.error('Error getting brand logo:', error);
        }
        
        // Fallback to generic business icon
        return null;
    }

    async function extractColorsFromUrl(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    const colors = sampleDominantColors(imageData);
                    resolve(colors);
                };
                
                img.onerror = () => resolve([]);
                img.src = URL.createObjectURL(blob);
            });
        } catch (error) {
            console.error('Error extracting colors from URL:', error);
            return [];
        }
    }

    async function analyzeWebsiteColors(websiteUrl) {
        try {
            // Create a proxy URL to handle CORS
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(websiteUrl)}`;
            
            // Fetch the website content
            const response = await fetch(proxyUrl);
            const html = await response.text();
            
            // Create a temporary DOM to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const colors = new Set();
            
            // Extract colors from meta tags
            const metaTags = doc.querySelectorAll('meta[name*="theme-color"], meta[name*="msapplication-TileColor"]');
            metaTags.forEach(tag => {
                const color = tag.getAttribute('content');
                if (color) colors.add(color);
            });
            
            // Extract colors from CSS
            const styleSheets = doc.querySelectorAll('style, link[rel="stylesheet"]');
            for (const sheet of styleSheets) {
                if (sheet.tagName === 'LINK') {
                    try {
                        const cssResponse = await fetch(sheet.href);
                        const css = await cssResponse.text();
                        extractColorsFromCSS(css, colors);
                    } catch (error) {
                        console.error('Error fetching external stylesheet:', error);
                    }
                } else {
                    extractColorsFromCSS(sheet.textContent, colors);
                }
            }
            
            // Extract inline styles
            const elementsWithStyle = doc.querySelectorAll('[style]');
            elementsWithStyle.forEach(element => {
                const style = element.getAttribute('style');
                extractColorsFromCSS(`{${style}}`, colors);
            });
            
            // Extract colors from specific brand elements
            const brandElements = doc.querySelectorAll(
                'header, .header, #header, ' +
                'nav, .nav, #nav, .navbar, ' +
                '.logo, #logo, ' +
                '.brand, .brand-*, ' +
                'button, .button, .btn, ' +
                'a.primary, .primary-*, ' +
                'footer, .footer, #footer'
            );
            
            brandElements.forEach(element => {
                const styles = window.getComputedStyle(element);
                ['color', 'background-color', 'border-color'].forEach(prop => {
                    const color = styles.getPropertyValue(prop);
                    if (color && color !== 'transparent' && color !== 'inherit') {
                        colors.add(color);
                    }
                });
            });
            
            // Convert colors to RGB format and filter
            const rgbColors = Array.from(colors)
                .map(color => parseColor(color))
                .filter(color => color && isGoodColor(color));
                
            return rgbColors;
        } catch (error) {
            console.error('Error analyzing website colors:', error);
            return [];
        }
    }

    function extractColorsFromCSS(css, colorSet) {
        // Match different color formats
        const colorPatterns = [
            /#[0-9a-f]{3,8}\b/gi,                              // Hex colors
            /(?:rgb|hsl)a?\([^)]+\)/gi,                        // RGB and HSL
            /\b(?:blue|red|green|yellow|purple|orange|pink|brown|gray|black|white)\b/gi,  // Color names
            /var\(--[^)]*\)/gi                                 // CSS variables
        ];
        
        colorPatterns.forEach(pattern => {
            const matches = css.match(pattern);
            if (matches) {
                matches.forEach(color => colorSet.add(color.toLowerCase()));
            }
        });
    }

    function parseColor(color) {
        try {
            // Create a temporary element to parse the color
            const temp = document.createElement('div');
            temp.style.color = color;
            document.body.appendChild(temp);
            const computed = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);
            
            // Extract RGB values
            const rgb = computed.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                return [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
            }
        } catch (error) {
            console.error('Error parsing color:', error);
        }
        return null;
    }

    // Update extractBrandColors function to include website colors
    async function extractBrandColors(placeDetails) {
        if (!placeDetails) {
            console.error('No place details provided');
            return null;
        }

        const colors = new Set();
        const extractedColors = {
            fromWebsite: [],
            fromLogo: [],
            fromPhotos: [],
            fromIndustry: []
        };
        
        try {
            // 1. Try to get colors from website first (highest priority)
            if (placeDetails.website) {
                try {
                    const websiteColors = await analyzeWebsiteColors(placeDetails.website);
                    if (websiteColors && Array.isArray(websiteColors)) {
                        extractedColors.fromWebsite = websiteColors;
                        
                        websiteColors.forEach(rgb => {
                            if (rgb && isGoodColor(rgb)) {
                                const hsl = rgbToHsl(...rgb);
                                if (hsl && !hsl.some(isNaN)) {
                                    colors.add(`hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`);
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error extracting website colors:', error);
                }
            }
            
            // 2. Try to get colors from logo
            try {
                const logoUrl = await getBrandLogo(placeDetails);
                if (logoUrl) {
                    const logoColors = await extractColorsFromUrl(logoUrl);
                    if (logoColors && Array.isArray(logoColors)) {
                        extractedColors.fromLogo = logoColors.filter(rgb => rgb && isGoodColor(rgb));
                        
                        extractedColors.fromLogo.forEach(rgb => {
                            if (rgb && isGoodColor(rgb)) {
                                const hsl = rgbToHsl(...rgb);
                                if (hsl && !hsl.some(isNaN)) {
                                    colors.add(`hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`);
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error extracting logo colors:', error);
            }
            
            // 3. Try photos if we need more colors
            if (colors.size < 4 && placeDetails.photos && Array.isArray(placeDetails.photos) && placeDetails.photos.length > 0) {
                try {
                    const photoUrl = placeDetails.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                    const photoColors = await extractColorsFromUrl(photoUrl);
                    if (photoColors && Array.isArray(photoColors)) {
                        extractedColors.fromPhotos = photoColors.filter(rgb => rgb && isGoodColor(rgb));
                        
                        extractedColors.fromPhotos.forEach(rgb => {
                            if (rgb && isGoodColor(rgb)) {
                                const hsl = rgbToHsl(...rgb);
                                if (hsl && !hsl.some(isNaN)) {
                                    colors.add(`hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`);
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error extracting photo colors:', error);
                }
            }
            
            // 4. Add industry colors as fallback
            if (colors.size < 2 && placeDetails.types && Array.isArray(placeDetails.types)) {
                try {
                    const industryColors = getIndustrySpecificColors(placeDetails.types);
                    if (industryColors && Array.isArray(industryColors)) {
                        extractedColors.fromIndustry = industryColors;
                        industryColors.forEach(color => {
                            if (color) {
                                colors.add(color);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error adding industry colors:', error);
                }
            }
            
            // Convert to array and ensure we have valid colors
            let finalColors = Array.from(colors).filter(color => color && typeof color === 'string');
            
            // If we have no colors at all, return null
            if (finalColors.length === 0) {
                console.log('No valid colors extracted');
                return null;
            }
            
            // Filter colors that don't have good contrast
            try {
                finalColors = finalColors.filter((color1, i) => {
                    return finalColors.every((color2, j) => {
                        if (i === j) return true;
                        try {
                            const rgb1 = color1.match(/\d+/g);
                            const rgb2 = color2.match(/\d+/g);
                            if (!rgb1 || !rgb2) return true;
                            const contrast = calculateColorContrast(rgb1, rgb2);
                            return contrast >= 2;
                        } catch (error) {
                            console.error('Error checking contrast:', error);
                            return true;
                        }
                    });
                });
            } catch (error) {
                console.error('Error filtering colors for contrast:', error);
            }
            
            // Return null if we don't have enough good colors
            if (finalColors.length < 2) {
                console.log('Not enough good colors found');
                return null;
            }
            
            return finalColors.slice(0, 6);
            
        } catch (error) {
            console.error('Error in extractBrandColors:', error);
            return null;
        }
    }

    function sampleDominantColors(imageData) {
        try {
            const colorCounts = {};
            
            // Sample pixels at regular intervals
            for (let i = 0; i < imageData.length; i += 16) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                
                // Skip white, black, and very gray colors
                if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) continue;
                
                // Ensure we have valid RGB values
                if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') continue;
                if (isNaN(r) || isNaN(g) || isNaN(b)) continue;
                if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) continue;
                
                const rgb = `rgb(${r},${g},${b})`;
                colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
            }
            
            // Convert to HSL and get unique colors
            const colors = Object.entries(colorCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([color]) => {
                    try {
                        const rgb = color.match(/\d+/g);
                        if (!rgb || rgb.length !== 3) return null;
                        
                        const [r, g, b] = rgb.map(Number);
                        if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
                        
                        const hsl = rgbToHsl(r, g, b);
                        if (!hsl || hsl.some(isNaN)) return null;
                        
                        return `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`;
                    } catch (error) {
                        console.error('Error processing color:', error);
                        return null;
                    }
                })
                .filter(color => color !== null);
                
            return colors.length > 0 ? colors : ['hsl(210, 50%, 40%)']; // Return default blue if no colors found
        } catch (error) {
            console.error('Error sampling dominant colors:', error);
            return ['hsl(210, 50%, 40%)']; // Return default blue
        }
    }

    function getIndustrySpecificColors(types) {
        const colorSchemes = {
            restaurant: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
            cafe: ['#A0522D', '#8B4513', '#DEB887'],
            clothing_store: ['#FF69B4', '#20B2AA', '#4682B4'],
            bank: ['#002D72', '#0033A0', '#003087'],
            hospital: ['#4682B4', '#20B2AA', '#87CEEB'],
            school: ['#8B0000', '#4169E1', '#FFD700'],
            gym: ['#FF4500', '#32CD32', '#1E90FF'],
            spa: ['#DDA0DD', '#E6E6FA', '#87CEEB'],
            hotel: ['#800020', '#4B0082', '#FFD700'],
            default: ['#336699', '#993366', '#669933']
        };
        
        // Find matching business type
        for (const type of types) {
            if (colorSchemes[type]) {
                return colorSchemes[type];
            }
        }
        
        return colorSchemes.default;
    }

    function kMeansCluster(pixels, k = 5, iterations = 10) {
        // Initialize centroids randomly from the pixels
        let centroids = [];
        const pixelCount = pixels.length / 4; // RGBA data
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * pixelCount) * 4;
            centroids.push([
                pixels[randomIndex],
                pixels[randomIndex + 1],
                pixels[randomIndex + 2]
            ]);
        }

        let assignments = new Array(pixelCount).fill(0);
        
        // Iterate to find the best clusters
        for (let iter = 0; iter < iterations; iter++) {
            // Assign pixels to nearest centroid
            for (let i = 0; i < pixelCount; i++) {
                const pixel = [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
                let minDist = Infinity;
                let bestCluster = 0;
                
                for (let j = 0; j < centroids.length; j++) {
                    const dist = colorDistance(pixel, centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCluster = j;
                    }
                }
                assignments[i] = bestCluster;
            }
            
            // Update centroids
            const sums = Array(k).fill().map(() => [0, 0, 0]);
            const counts = Array(k).fill(0);
            
            for (let i = 0; i < pixelCount; i++) {
                const cluster = assignments[i];
                sums[cluster][0] += pixels[i * 4];
                sums[cluster][1] += pixels[i * 4 + 1];
                sums[cluster][2] += pixels[i * 4 + 2];
                counts[cluster]++;
            }
            
            for (let i = 0; i < k; i++) {
                if (counts[i] > 0) {
                    centroids[i] = [
                        Math.round(sums[i][0] / counts[i]),
                        Math.round(sums[i][1] / counts[i]),
                        Math.round(sums[i][2] / counts[i])
                    ];
                }
            }
        }
        
        // Calculate cluster sizes and sort by popularity
        const clusterSizes = Array(k).fill(0);
        assignments.forEach(cluster => clusterSizes[cluster]++);
        
        return centroids
            .map((centroid, i) => ({ color: centroid, size: clusterSizes[i] }))
            .sort((a, b) => b.size - a.size);
    }

    function colorDistance(color1, color2) {
        // Using weighted Euclidean distance in LAB color space would be more accurate
        // but for performance, using simple RGB distance
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    function isGoodColor(rgb) {
        const [r, g, b] = rgb;
        
        // Skip colors that are too close to white
        if (r > 240 && g > 240 && b > 240) return false;
        
        // Skip colors that are too close to black
        if (r < 15 && g < 15 && b < 15) return false;
        
        // Skip grays (where all channels are too similar)
        const tolerance = 15;
        if (Math.abs(r - g) < tolerance && 
            Math.abs(g - b) < tolerance && 
            Math.abs(r - b) < tolerance) return false;
        
        // Calculate perceived brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // Skip colors that are too bright or too dark
        if (brightness < 30 || brightness > 225) return false;
        
        return true;
    }

    function calculateColorContrast(rgb1, rgb2) {
        try {
            if (!rgb1 || !rgb2) return 1;
            
            // Ensure we have valid RGB values
            const r1 = parseInt(rgb1[0]);
            const g1 = parseInt(rgb1[1]);
            const b1 = parseInt(rgb1[2]);
            const r2 = parseInt(rgb2[0]);
            const g2 = parseInt(rgb2[1]);
            const b2 = parseInt(rgb2[2]);
            
            if (isNaN(r1) || isNaN(g1) || isNaN(b1) || isNaN(r2) || isNaN(g2) || isNaN(b2)) {
                return 1;
            }

            // Calculate relative luminance
            const getLuminance = (r, g, b) => {
                const rs = r / 255;
                const gs = g / 255;
                const bs = b / 255;
                const rsRGB = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
                const gsRGB = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
                const bsRGB = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
                return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
            };
            
            const l1 = getLuminance(r1, g1, b1);
            const l2 = getLuminance(r2, g2, b2);
            
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            
            return (lighter + 0.05) / (darker + 0.05);
        } catch (error) {
            console.error('Error calculating contrast:', error);
            return 1; // Return minimum contrast if calculation fails
        }
    }

    // Enhanced brand analysis functions
    async function analyzeBrandPersonality(websiteUrl) {
        try {
            const response = await fetch(websiteUrl);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Analyze content tone
            const content = doc.body.textContent.toLowerCase();
            const toneAnalysis = {
                professional: content.match(/\b(professional|expert|quality|premium)\b/g)?.length || 0,
                friendly: content.match(/\b(friendly|welcome|help|support)\b/g)?.length || 0,
                innovative: content.match(/\b(innovative|modern|future|cutting-edge)\b/g)?.length || 0,
                traditional: content.match(/\b(traditional|heritage|established|classic)\b/g)?.length || 0,
                luxury: content.match(/\b(luxury|exclusive|premium|elite)\b/g)?.length || 0
            };
            
            // Determine primary personality
            const maxTone = Object.entries(toneAnalysis).reduce((a, b) => a[1] > b[1] ? a : b);
            return {
                primaryPersonality: maxTone[0],
                toneAnalysis,
                confidence: maxTone[1] / Object.values(toneAnalysis).reduce((a, b) => a + b, 0)
            };
        } catch (error) {
            console.error('Error analyzing brand personality:', error);
            return null;
        }
    }

    async function extractBrandPatterns(websiteUrl) {
        try {
            const response = await fetch(websiteUrl);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract background patterns and textures
            const patterns = new Set();
            const elements = doc.querySelectorAll('*');
            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    patterns.add(bgImage);
                }
            });
            
            return Array.from(patterns);
        } catch (error) {
            console.error('Error extracting brand patterns:', error);
            return [];
        }
    }

    async function detectBrandIcons(websiteUrl) {
        try {
            const response = await fetch(websiteUrl);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract icons and symbols
            const icons = new Set();
            const iconElements = doc.querySelectorAll('i, [class*="icon"], [class*="symbol"], svg');
            iconElements.forEach(el => {
                if (el.tagName.toLowerCase() === 'svg') {
                    icons.add(el.outerHTML);
                } else {
                    const classes = Array.from(el.classList);
                    icons.add(classes.join(' '));
                }
            });
            
            return Array.from(icons);
        } catch (error) {
            console.error('Error detecting brand icons:', error);
            return [];
        }
    }

    async function analyzeBrandMessaging(websiteUrl) {
        try {
            const response = await fetch(websiteUrl);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract key messages
            const messages = {
                taglines: [],
                valueProps: [],
                callsToAction: []
            };
            
            // Get taglines from h1 and meta description
            const h1 = doc.querySelector('h1')?.textContent;
            const metaDesc = doc.querySelector('meta[name="description"]')?.content;
            if (h1) messages.taglines.push(h1);
            if (metaDesc) messages.taglines.push(metaDesc);
            
            // Get value propositions from headings and paragraphs
            const headings = doc.querySelectorAll('h2, h3');
            headings.forEach(h => {
                if (h.textContent.length < 100) {
                    messages.valueProps.push(h.textContent);
                }
            });
            
            // Get calls to action from buttons and links
            const buttons = doc.querySelectorAll('button, a[class*="btn"], a[class*="cta"]');
            buttons.forEach(btn => {
                if (btn.textContent.length < 50) {
                    messages.callsToAction.push(btn.textContent.trim());
                }
            });
            
            return messages;
        } catch (error) {
            console.error('Error analyzing brand messaging:', error);
            return null;
        }
    }
}); 