// Instagram API Configuration
const INSTAGRAM_API_CONFIG = {
    clientId: '', // You'll need to add your Instagram API client ID
    clientSecret: '', // You'll need to add your Instagram API client secret
    redirectUri: window.location.origin + '/auth/callback',
    apiBaseUrl: 'https://graph.instagram.com/v12.0'
};

// API Configuration
const API_CONFIG = {
    screenshotApiKey: 'Naknv_sclLxWSg',
    screenshotApiUrl: 'https://api.screenshotone.com/take',
    screenshotParams: {
        access_key: 'Naknv_sclLxWSg',
        viewport_width: 1280,
        viewport_height: 800,
        device_scale_factor: 1,
        format: 'jpg',
        quality: 85,
        full_page: false,
        block_ads: true,
        block_cookie_banners: true,
        block_trackers: true,
        cache: true,
        fresh: false,
        hide_cookie_banners: true,
        delay: 2,
        timeout: 20
    },
    googleMapsApiKey: 'AIzaSyASBoq7KEiL7E0S5ikNZ7slqYE1opzmrXY'
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Get DOM elements
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const siteScreenshot = document.getElementById('siteScreenshot');
    const brandProfile = document.getElementById('brandProfile');
    const brandName = document.getElementById('brandName');
    const brandDomain = document.getElementById('brandDomain');
    const brandLogo = document.getElementById('brandLogo');
    const palette = document.getElementById('palette');
    const brandInsights = document.getElementById('brandInsights');
    const toast = document.getElementById('toast');
    const businessHours = document.getElementById('businessHours');

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

    // Update website analysis function
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

            // Get website screenshot
            console.log('Attempting to capture screenshot for:', validUrl);
            
            // Construct the API URL with minimal required parameters
            const screenshotUrl = `https://api.screenshotone.com/take?access_key=${API_CONFIG.screenshotApiKey}&url=${encodeURIComponent(validUrl)}&format=jpg&viewport_width=1280&viewport_height=800&cache=false`;
            
            console.log('Making request to:', screenshotUrl);
            
            let colors = [];
            try {
                const response = await fetch(screenshotUrl);
                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', errorText);
                    throw new Error(`Screenshot API error: ${response.status} ${errorText}`);
                }
                
                const imageBlob = await response.blob();
                console.log('Received blob:', imageBlob.type, imageBlob.size, 'bytes');
                
                if (imageBlob.size === 0) {
                    throw new Error('Received empty image response');
                }
                
                const imageUrl = URL.createObjectURL(imageBlob);
                siteScreenshot.innerHTML = `
                    <img src="${imageUrl}" 
                         class="w-full h-full object-cover" 
                         alt="Website screenshot"
                         onerror="console.error('Image failed to load')"
                         onload="console.log('Image loaded successfully')">
                `;
                
                // Extract colors from the screenshot
                colors = await extractColorsFromImage(imageBlob);
                generatePaletteFromColors(colors);
                
            } catch (error) {
                console.error('Screenshot capture failed:', error);
                siteScreenshot.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-[var(--square-card)]">
                        <div class="text-center p-4">
                            <svg class="w-12 h-12 mx-auto text-[var(--square-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="mt-2 text-[var(--square-text-secondary)]">Failed to capture screenshot: ${error.message}</p>
                        </div>
                    </div>
                `;
                colors = [];
            }
            
            // Get favicon URL for the logo
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${validUrl}&sz=128`;

            // Extract business hours
            const hours = await extractBusinessHours(validUrl);
            
            // Update site info
            const domain = new URL(validUrl).hostname;
            const siteName = domain.replace(/^www\./, '').split('.')[0].charAt(0).toUpperCase() + 
                           domain.replace(/^www\./, '').split('.')[0].slice(1);

            // Update brand profile
            brandName.textContent = siteName;
            brandDomain.textContent = domain;
            brandLogo.innerHTML = `<img src="${faviconUrl}" class="w-16 h-16">`;

            // Display hours in the dedicated Hours card
            if (businessHours) {
                if (hours) {
                    const hoursLines = hours.split('\n').map(line => line.trim()).filter(line => line);
                    businessHours.innerHTML = `
                        <div class="grid grid-cols-1 gap-1">
                            ${hoursLines.map(line => {
                                const [day, time] = line.split(':').map(part => part.trim());
                                return `
                                    <div class="flex justify-between items-center">
                                        <span class="text-[var(--square-text)]">${day}</span>
                                        <span class="text-[var(--square-text-secondary)]">${time}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                } else {
                    businessHours.innerHTML = `
                        <div class="col-span-3 bg-[var(--square-card)] rounded-lg p-4 text-center">
                            <p class="text-[var(--square-text-secondary)]">Hours information not available.</p>
                        </div>
                    `;
                }
            }

            // Generate insights
            generateBrandInsights(colors);

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
            const businessHours = document.getElementById('businessHours');
            
            if (siteName) siteName.textContent = placeDetails.name;
            if (siteUrl) siteUrl.textContent = placeDetails.formatted_address;
            
            // Display hours in the dedicated Hours card
            if (businessHours) {
                if (placeDetails.opening_hours) {
                    businessHours.innerHTML = `
                        <div class="grid grid-cols-1 gap-1">
                            ${placeDetails.opening_hours.weekday_text.map(day => `
                                <div class="flex justify-between items-center">
                                    <span class="text-[var(--square-text)]">${day.split(': ')[0]}</span>
                                    <span class="text-[var(--square-text-secondary)]">${day.split(': ')[1]}</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    businessHours.innerHTML = `
                        <div class="col-span-3 bg-[var(--square-card)] rounded-lg p-4 text-center">
                            <p class="text-[var(--square-text-secondary)]">Hours information not available.</p>
                        </div>
                    `;
                }
            }
            
            // Update screenshot with the first photo if available
            if (siteScreenshot && placeDetails.photos && placeDetails.photos.length > 0) {
                const photo = placeDetails.photos[0];
                const photoUrl = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
                
                // Create a new image element with error handling
                const img = new Image();
                img.className = 'w-full h-full object-cover';
                img.alt = `${placeDetails.name} photo`;
                
                // Add loading state
                siteScreenshot.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-[var(--square-card)]">
                        <svg class="animate-spin h-8 w-8 text-[var(--square-text-secondary)]" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                `;
                
                // Handle successful load
                img.onload = () => {
                    siteScreenshot.innerHTML = '';
                    siteScreenshot.appendChild(img);
                };
                
                // Handle error
                img.onerror = () => {
                    siteScreenshot.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-[var(--square-card)]">
                            <div class="text-center">
                                <svg class="w-12 h-12 mx-auto text-[var(--square-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="mt-2 text-[var(--square-text-secondary)]">Image not available</p>
                            </div>
                        </div>
                    `;
                };
                
                // Set the source after setting up handlers
                img.src = photoUrl;
            } else {
                // Show placeholder when no photos are available
                siteScreenshot.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-[var(--square-card)]">
                        <div class="text-center">
                            <svg class="w-12 h-12 mx-auto text-[var(--square-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="mt-2 text-[var(--square-text-secondary)]">No photos available</p>
                        </div>
                    </div>
                `;
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
                        <div class="col-span-3 bg-[var(--square-card)] rounded-lg p-4 text-center">
                            <p class="text-[var(--square-text-secondary)]">Unable to extract brand colors. The available images don't contain enough distinct, high-quality colors to generate a meaningful palette.</p>
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
                        return rgbToHsl(...rgb);
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

    // Add this function after the other utility functions
    function getContrastingTextColor(backgroundColor) {
        // Extract RGB values from the color string
        const rgb = backgroundColor.match(/\d+/g).map(Number);
        if (!rgb || rgb.length < 3) return { color: '#000000', needsShadow: false }; // Default to black if parsing fails
        
        // Calculate relative luminance (perceived brightness)
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
        // For very light colors, use black text with shadow
        if (luminance > 0.85) {
            return { color: '#000000', needsShadow: true };
        }
        // For very dark colors, use white text
        else if (luminance < 0.15) {
            return { color: '#FFFFFF', needsShadow: false };
        }
        // For medium colors, use contrasting color without shadow
        else {
            return { color: luminance > 0.5 ? '#000000' : '#FFFFFF', needsShadow: false };
        }
    }

    // Update the generatePaletteFromColors function
    function generatePaletteFromColors(colors) {
        palette.innerHTML = '';
        colors.forEach(color => {
            const { color: textColor, needsShadow } = getContrastingTextColor(color);
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch p-4 rounded-lg cursor-pointer';
            swatch.style.backgroundColor = color;
            swatch.innerHTML = `
                <div class="text-sm font-medium text-center" style="
                    color: ${textColor};
                    text-shadow: 
                        0 1px 1px rgba(0,0,0,0.2),
                        0 -1px 1px rgba(0,0,0,0.2),
                        1px 0 1px rgba(0,0,0,0.2),
                        -1px 0 1px rgba(0,0,0,0.2),
                        0 0 3px rgba(0,0,0,0.15);
                ">
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
        if (brandInsights) {
            if (!colors || colors.length < 2) {
                brandInsights.innerHTML = `
                    <div class="col-span-3 bg-[var(--square-card)] rounded-lg p-4 text-center">
                        <p class="text-[var(--square-text-secondary)]">Unable to extract brand insights. The available data doesn't contain enough information to generate meaningful insights.</p>
                    </div>
                `;
            } else {
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
                    <div class="bg-[var(--square-card)] rounded-lg p-4">
                        <h4 class="font-semibold mb-2">${insight.title}</h4>
                        <p class="text-[var(--square-text-secondary)] text-sm">${insight.description}</p>
                    </div>
                `).join('');
            }
        }
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

        typography.innerHTML = `
            <div class="col-span-3 bg-[var(--square-card)] rounded-lg p-4 text-center">
                <p class="text-[var(--square-text-secondary)]">Unable to analyze typography. The available data doesn't contain enough information to generate meaningful insights.</p>
            </div>
        `;
    }

    // Color analysis functions
    function analyzeColorHarmony(colors) {
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
            return "Color harmony analysis not available";
        }

        try {
            const hues = colors.map(color => {
                const match = color.match(/hsl\((\d+)/);
                return match ? parseInt(match[1]) : 0;
            }).filter(hue => !isNaN(hue));

            if (hues.length < 2) {
                return "Insufficient color data for harmony analysis";
            }

            const huesDiff = Math.abs(Math.max(...hues) - Math.min(...hues));
            
            if (huesDiff < 30) return "Monochromatic harmony - creates a sophisticated and cohesive look";
            if (huesDiff > 150) return "Complementary harmony - creates strong contrast and visual interest";
            return "Analogous harmony - creates a harmonious and balanced feel";
        } catch (error) {
            console.error('Error in analyzeColorHarmony:', error);
            return "Color harmony analysis not available";
        }
    }

    function analyzeBrandPersonality(colors) {
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
            return "Professional and reliable brand presence";
        }

        try {
            const personalities = {
                warm: ["Friendly", "Energetic", "Approachable"],
                cool: ["Professional", "Trustworthy", "Calm"],
                bright: ["Dynamic", "Innovative", "Bold"],
                muted: ["Sophisticated", "Traditional", "Reliable"]
            };

            const validColors = colors.filter(color => color && typeof color === 'string');
            if (validColors.length === 0) {
                return "Professional and balanced brand personality";
            }

            const avgSaturation = validColors.reduce((sum, color) => {
                const match = color.match(/hsl\(\d+,\s*(\d+)%/);
                return sum + (match ? parseInt(match[1]) : 0);
            }, 0) / validColors.length;

            if (avgSaturation > 60) return personalities.bright.join(", ");
            if (avgSaturation > 40) return personalities.warm.join(", ");
            if (avgSaturation > 20) return personalities.cool.join(", ");
            return personalities.muted.join(", ");
        } catch (error) {
            console.error('Error in analyzeBrandPersonality:', error);
            return "Professional and balanced brand personality";
        }
    }

    function analyzeVisualImpact(colors) {
        if (!colors || !Array.isArray(colors) || colors.length === 0) {
            return "Balanced visual impact suitable for professional use";
        }

        try {
            const validColors = colors.filter(color => color && typeof color === 'string');
            if (validColors.length === 0) {
                return "Balanced visual impact suitable for professional use";
            }

            const avgLightness = validColors.reduce((sum, color) => {
                const match = color.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%/);
                return sum + (match ? parseInt(match[1]) : 50);
            }, 0) / validColors.length;

            if (avgLightness > 70) return "Light and airy - creates an open, modern feel";
            if (avgLightness < 30) return "Dark and bold - creates a premium, dramatic feel";
            return "Balanced contrast - creates a professional, readable feel";
        } catch (error) {
            console.error('Error in analyzeVisualImpact:', error);
            return "Balanced visual impact suitable for professional use";
        }
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
            types: ['establishment']
        };
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        
        // When a place is selected from dropdown or via Enter key
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.place_id) {
                input.dataset.placeId = place.place_id;
                input.dataset.businessName = place.name;
                analyzeLocation();
            }
        });

        // Handle Enter key
        input.addEventListener('keydown', async function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                
                const pacContainer = document.querySelector('.pac-container');
                if (pacContainer && pacContainer.style.display !== 'none') {
                    // Get the first result
                    const firstResult = pacContainer.querySelector('.pac-item');
                    if (firstResult) {
                        // Get the place description from the first result
                        const placeDescription = firstResult.textContent;
                        
                        // Use the Places Service to get the place details
                        const mapElement = document.createElement('div');
                        document.body.appendChild(mapElement);
                        const map = new google.maps.Map(mapElement, {
                            center: { lat: 0, lng: 0 },
                            zoom: 1
                        });
                        const placesService = new google.maps.places.PlacesService(map);
                        
                        // Search for the place
                        placesService.textSearch({
                            query: placeDescription
                        }, function(results, status) {
                            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                                const firstPlace = results[0];
                                input.dataset.placeId = firstPlace.place_id;
                                input.dataset.businessName = firstPlace.name;
                                input.value = firstPlace.name;
                                analyzeLocation();
                            }
                            document.body.removeChild(mapElement);
                        });
                    }
                } else if (input.value.startsWith('http://') || input.value.startsWith('https://')) {
                    analyzeWebsite(input.value);
                } else {
                    analyzeLocation();
                }
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
                    // Select the most representative photo
                    const selectedPhoto = selectBestPhoto(placeDetails.photos);
                    if (selectedPhoto) {
                        const photoUrl = selectedPhoto.getUrl({ maxWidth: 800, maxHeight: 600 });
                        const photoColors = await extractColorsFromPhoto(photoUrl);
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

    // Helper function to select the best photo for color extraction
    function selectBestPhoto(photos) {
        if (!photos || photos.length === 0) return null;
        
        // Prioritize photos that are likely to contain brand elements
        const prioritizedPhotos = photos.filter(photo => {
            const width = photo.width || 0;
            const height = photo.height || 0;
            // Prefer photos that are more square or landscape (better for storefronts)
            return width > height * 0.8;
        });
        
        // If we have prioritized photos, use the first one
        if (prioritizedPhotos.length > 0) {
            return prioritizedPhotos[0];
        }
        
        // Otherwise, use the first photo
        return photos[0];
    }

    // Enhanced function to extract colors from photos
    async function extractColorsFromPhoto(url) {
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
                    
                    // Focus on the top third of the image (where signs and logos often are)
                    const topThirdHeight = Math.floor(img.height / 3);
                    const topThirdData = ctx.getImageData(0, 0, img.width, topThirdHeight).data;
                    
                    // Also sample from the center (where storefronts often are)
                    const centerWidth = Math.floor(img.width / 3);
                    const centerHeight = Math.floor(img.height / 3);
                    const centerX = Math.floor((img.width - centerWidth) / 2);
                    const centerY = Math.floor((img.height - centerHeight) / 2);
                    const centerData = ctx.getImageData(centerX, centerY, centerWidth, centerHeight).data;
                    
                    // Combine colors from both regions
                    const colors = new Set();
                    
                    // Process top third
                    for (let i = 0; i < topThirdData.length; i += 16) {
                        const r = topThirdData[i];
                        const g = topThirdData[i + 1];
                        const b = topThirdData[i + 2];
                        if (isGoodColor([r, g, b])) {
                            colors.add(`rgb(${r},${g},${b})`);
                        }
                    }
                    
                    // Process center
                    for (let i = 0; i < centerData.length; i += 16) {
                        const r = centerData[i];
                        const g = centerData[i + 1];
                        const b = centerData[i + 2];
                        if (isGoodColor([r, g, b])) {
                            colors.add(`rgb(${r},${g},${b})`);
                        }
                    }
                    
                    // Convert to HSL and filter
                    const hslColors = Array.from(colors)
                        .map(color => {
                            const rgb = color.match(/\d+/g).map(Number);
                            return rgbToHsl(...rgb);
                        })
                        .filter(hsl => hsl && !hsl.some(isNaN))
                        .map(hsl => `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`);
                    
                    resolve(hslColors);
                };
                
                img.onerror = () => resolve([]);
                img.src = URL.createObjectURL(blob);
            });
        } catch (error) {
            console.error('Error extracting colors from photo:', error);
            return [];
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

    // Add this function after the other utility functions
    async function extractBusinessHours(websiteUrl) {
        try {
            // Create a proxy URL to handle CORS
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(websiteUrl)}`;
            
            // Fetch the website content
            const response = await fetch(proxyUrl);
            const html = await response.text();
            
            // Create a temporary DOM to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Common selectors for business hours
            const hourSelectors = [
                // Class-based selectors
                '.hours', '.business-hours', '.store-hours', '.opening-hours',
                '.hours-of-operation', '.opening-times', '.business-times',
                '.store-schedule', '.opening-schedule',
                // ID-based selectors
                '#hours', '#business-hours', '#store-hours', '#opening-hours',
                '#hours-of-operation', '#opening-times', '#business-times',
                // Schema.org markup
                '[itemprop="openingHours"]', 
                'time[itemprop="openingHours"]',
                // Data attributes
                '[data-hours]', '[data-business-hours]', '[data-store-hours]',
                // Common patterns
                '[class*="hours"]', '[id*="hours"]',
                '[class*="schedule"]', '[id*="schedule"]',
                // Footer sections
                'footer [class*="hours"]', 'footer [id*="hours"]',
                // Contact sections
                '.contact-info [class*="hours"]', '.contact [class*="hours"]'
            ];
            
            // Try to find hours container
            let hoursElement = null;
            for (const selector of hourSelectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    hoursElement = element;
                    break;
                }
            }
            
            if (!hoursElement) {
                // Try searching for text containing days of the week near time patterns
                const textNodes = [...doc.querySelectorAll('*')].filter(el => {
                    const text = el.textContent.toLowerCase();
                    const hasDay = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text);
                    const hasTime = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)|24\/7|all day|closed)/i.test(text);
                    return hasDay && hasTime;
                });
                
                if (textNodes.length > 0) {
                    // Find the most likely container by looking for the element with the most time patterns
                    hoursElement = textNodes.reduce((best, current) => {
                        const bestCount = (best.textContent.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)|24\/7|all day|closed)/gi) || []).length;
                        const currentCount = (current.textContent.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)|24\/7|all day|closed)/gi) || []).length;
                        return currentCount > bestCount ? current : best;
                    });
                }
            }
            
            if (hoursElement) {
                // Clean up the text
                let hoursText = hoursElement.textContent
                    .replace(/\s+/g, ' ')
                    .replace(/\n/g, ' ')
                    .trim();
                
                // Normalize time formats
                hoursText = hoursText
                    .replace(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi, (match, hour, minute, period) => {
                        hour = parseInt(hour);
                        if (period.toLowerCase() === 'pm' && hour < 12) hour += 12;
                        if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
                        return `${hour.toString().padStart(2, '0')}:${minute || '00'}`;
                    });
                
                // Split into lines if it contains multiple days
                if (hoursText.toLowerCase().includes('monday') || 
                    hoursText.toLowerCase().includes('tuesday')) {
                    // Format the hours text
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    let formattedHours = '';
                    
                    days.forEach(day => {
                        const dayRegex = new RegExp(`${day}[^\\n]*`, 'i');
                        const dayMatch = hoursText.match(dayRegex);
                        if (dayMatch) {
                            const dayHours = dayMatch[0]
                                .replace(day, `${day}:`)
                                .replace(/\s+/g, ' ')
                                .trim();
                            formattedHours += dayHours + '\n';
                        }
                    });
                    
                    return formattedHours.trim();
                }
                
                return hoursText;
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting business hours:', error);
            return null;
        }
    }
}); 