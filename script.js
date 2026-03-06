// Progress Tracker
// Uses configuration from config.js for start and end dates
// Updates with second-level precision

// Global variables (will be initialized in init())
let START_DATE, END_DATE, TOTAL_DURATION;
let percentageElement, progressFillElement, daysElement, hoursElement, minutesElement, secondsElement, currentTimeElement;

// Configuration is loaded from config.js
if (typeof window.CONFIG === 'undefined') {
    console.error('CONFIG not found. Make sure config.js is loaded before script.js');
    // Fallback to default dates if config is missing
    window.CONFIG = {
        START_DATE: new Date(2026, 2, 4, 0, 0, 0),
        END_DATE: new Date(2026, 3, 4, 0, 0, 0),
        DATE_FORMAT: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    };
}

// Format number with leading zero
function padZero(num, length = 2) {
    return num.toString().padStart(length, '0');
}

// Format date to readable string
function formatDate(date) {
    const options = window.CONFIG.DATE_FORMAT || {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

// Format time to HH:MM:SS
function formatTime(date) {
    return `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

// Calculate progress and update display
function updateProgress() {
    const now = new Date();

    // Update current time display
    currentTimeElement.textContent = `${formatDate(now)} ${formatTime(now)}`;

    // Calculate progress
    let progress = 0;
    let timeRemaining = 0;

    if (now < START_DATE) {
        // Period hasn't started yet
        progress = 0;
        timeRemaining = END_DATE - START_DATE;
    } else if (now > END_DATE) {
        // Period has ended
        progress = 1;
        timeRemaining = 0;
    } else {
        // Period is ongoing
        progress = (now - START_DATE) / TOTAL_DURATION;
        timeRemaining = END_DATE - now;
    }

    // Update progress bar and percentage
    const percentage = progress * 100;
    percentageElement.textContent = `${percentage.toFixed(2)}%`;
    progressFillElement.style.width = `${percentage}%`;

    // Calculate time remaining
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Update countdown display
    daysElement.textContent = days;
    hoursElement.textContent = padZero(hours);
    minutesElement.textContent = padZero(minutes);
    secondsElement.textContent = padZero(seconds);

    // Update progress bar color based on progress
    updateProgressBarColor(percentage);

    // Update background gradient based on time of day
    updateBackgroundGradient();
}

// Convert hex color to RGB array
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

// Convert RGB array to hex color
function rgbToHex(rgb) {
    const [r, g, b] = rgb;
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Linear interpolation between two RGB colors
function interpolateColor(color1, color2, factor) {
    const result = color1.map((channel, index) => {
        return Math.round(channel + (color2[index] - channel) * factor);
    });
    return result;
}

// Get color at specific percentage based on gradient stops
function getColorAtPercentage(percentage) {
    // Gradient stops: position (0-1) and hex color
    const stops = [
        { pos: 0.0, color: '#4f46e5' },
        { pos: 0.2, color: '#8b5cf6' },
        { pos: 0.57, color: '#ec4899' },
        { pos: 1.0, color: '#f59e0b' }
    ];

    // Convert percentage to fraction (0-1)
    const p = percentage / 100;

    // Find which segment the percentage falls into
    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];

        if (p >= start.pos && p <= end.pos) {
            // Calculate factor within this segment (0-1)
            const segmentLength = end.pos - start.pos;
            const factor = segmentLength > 0 ? (p - start.pos) / segmentLength : 0;

            // Interpolate between the two colors
            const rgb1 = hexToRgb(start.color);
            const rgb2 = hexToRgb(end.color);
            const interpolated = interpolateColor(rgb1, rgb2, factor);

            return rgbToHex(interpolated);
        }
    }

    // Fallback to last color
    return stops[stops.length - 1].color;
}

// Generate gradient string for current percentage
function generateGradientForPercentage(percentage) {
    // Original gradient stops
    const stops = [
        { pos: 0.0, color: '#4f46e5' },
        { pos: 0.2, color: '#8b5cf6' },
        { pos: 0.57, color: '#ec4899' },
        { pos: 1.0, color: '#f59e0b' }
    ];

    // Convert percentage to fraction (0-1)
    const p = percentage / 100;

    // Collect stops that are before or at current percentage
    const gradientStops = [];

    // Always include the first stop
    gradientStops.push(`${stops[0].color} 0%`);

    // Add intermediate stops that are before current percentage
    for (let i = 1; i < stops.length; i++) {
        if (stops[i].pos <= p) {
            // This stop is within the current progress
            const percentagePos = (stops[i].pos / p) * 100;
            gradientStops.push(`${stops[i].color} ${percentagePos.toFixed(2)}%`);
        }
    }

    // Add the current color at 100%
    const currentColor = getColorAtPercentage(percentage);
    gradientStops.push(`${currentColor} 100%`);

    return `linear-gradient(90deg, ${gradientStops.join(', ')})`;
}

// Update progress bar color based on percentage
function updateProgressBarColor(percentage) {
    const gradient = generateGradientForPercentage(percentage);
    progressFillElement.style.background = gradient;
}

// Calculate background color based on time of day (0-24 hours)
function getTimeBasedColor(hour, minute, second) {
    // Convert time to fraction of day (0-1)
    const totalSeconds = hour * 3600 + minute * 60 + second;
    const dayFraction = totalSeconds / 86400; // 24 * 60 * 60

    // Define color stops for time of day (from midnight to midnight)
    // These colors represent a smooth transition from night to day to night
    const timeStops = [
        { pos: 0.0, color: '#000033' },    // Midnight - deep blue
        { pos: 0.15, color: '#1A237E' },
        { pos: 0.23, color: '#9393e2' },
        { pos: 0.27, color: '#87b9eb' },   // Early morning - sky blue (6:00)
        { pos: 0.38, color: '#B0E2FF' },   // Morning - light sky blue (8:24)
        { pos: 0.49, color: '#FFFFE0' },   // Late morning - light yellow (10:48)
        { pos: 0.55, color: '#FFFFCC' },   // Noon - bright yellow (13:12)
        { pos: 0.65, color: '#FFCC99' },   // Afternoon - light orange (15:36)
        { pos: 0.75, color: '#FFA500' },   // Evening - orange (18:00)
        { pos: 0.85, color: '#FF8C00' },   // Sunset - dark orange (20:24)
        { pos: 0.90, color: '#C71585' },
        { pos: 0.95, color: '#4B0082' },   // Night - indigo (22:48)
        { pos: 1.0, color: '#000033' }     // Midnight - deep blue
    ];

    // Find which segment the time fraction falls into
    for (let i = 0; i < timeStops.length - 1; i++) {
        const start = timeStops[i];
        const end = timeStops[i + 1];

        if (dayFraction >= start.pos && dayFraction <= end.pos) {
            // Calculate factor within this segment (0-1)
            const segmentLength = end.pos - start.pos;
            const factor = segmentLength > 0 ? (dayFraction - start.pos) / segmentLength : 0;

            // Interpolate between the two colors
            const rgb1 = hexToRgb(start.color);
            const rgb2 = hexToRgb(end.color);
            const interpolated = interpolateColor(rgb1, rgb2, factor);

            return rgbToHex(interpolated);
        }
    }

    // Fallback to midnight color
    return '#000033';
}

// Get color at specific fraction of day (0-1)
function getColorAtDayFraction(dayFraction) {
    // Ensure dayFraction is in 0-1 range
    dayFraction = dayFraction % 1;
    if (dayFraction < 0) dayFraction += 1;

    // Convert to hours, minutes, seconds for getTimeBasedColor
    const totalSeconds = Math.floor(dayFraction * 86400);
    const hour = Math.floor(totalSeconds / 3600);
    const minute = Math.floor((totalSeconds % 3600) / 60);
    const second = totalSeconds % 60;

    return getTimeBasedColor(hour, minute, second);
}

// Update background gradient based on time of day
function updateBackgroundGradient() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calculate current time as fraction of day (0-1)
    const currentTotalSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;
    const currentDayFraction = currentTotalSeconds / 86400;

    // Calculate colors for five time points: -2h, -1h, current, +1h, +2h
    // This creates a richer gradient with more color variation
    const hourOffset = 1 / 12; // 2 hours as fraction of day (2/24 = 1/12)
    const halfHourOffset = 1 / 24; // 1 hour as fraction of day (1/24)

    const colorMinus2 = getColorAtDayFraction(currentDayFraction - hourOffset);
    const colorMinus1 = getColorAtDayFraction(currentDayFraction - halfHourOffset);
    const colorCurrent = getColorAtDayFraction(currentDayFraction);
    const colorPlus1 = getColorAtDayFraction(currentDayFraction + halfHourOffset);
    const colorPlus2 = getColorAtDayFraction(currentDayFraction + hourOffset);

    // Create a smooth diagonal gradient with five color stops
    const linearGradient = `linear-gradient(135deg,
        ${colorMinus2} 0%,
        ${colorMinus1} 25%,
        ${colorCurrent} 50%,
        ${colorPlus1} 75%,
        ${colorPlus2} 100%)`;

    // Create a radial gradient for a glowing center effect
    // The color is based on current time with slight transparency (using hex alpha channel)
    const radialGradient = `radial-gradient(circle at 50% 50%,
        ${colorCurrent}11 0%,
        ${colorCurrent}04 40%,
        transparent 60%)`;

    // Create a subtle noise texture using repeating-radial-gradient
    // This adds a fine grain effect without being distracting
    const noiseTexture = `repeating-radial-gradient(circle at 50% 50%,
        transparent 0px,
        rgba(255, 255, 255, 0.02) 1px,
        transparent 2px)`;

    // Combine all layers: noise texture on top, radial glow in middle, linear gradient at bottom
    const background = `${noiseTexture}, ${radialGradient}, ${linearGradient}`;

    // Apply to body background
    document.body.style.background = background;

    // Also update CSS variable for use in other elements if needed
    document.documentElement.style.setProperty('--time-based-bg', colorCurrent);

    // Add smooth transition for background color changes (subtle)
    document.body.style.transition = 'background 0.5s ease';
}

// Initialize the page
function init() {
    // Initialize global variables
    START_DATE = window.CONFIG.START_DATE;
    END_DATE = window.CONFIG.END_DATE;
    TOTAL_DURATION = END_DATE - START_DATE;

    // Initialize DOM element references
    percentageElement = document.getElementById('percentage');
    progressFillElement = document.getElementById('progress-fill');
    daysElement = document.getElementById('days');
    hoursElement = document.getElementById('hours');
    minutesElement = document.getElementById('minutes');
    secondsElement = document.getElementById('seconds');
    currentTimeElement = document.getElementById('current-time');

    // Debug: Check if elements were found
    if (!currentTimeElement) {
        console.error('currentTimeElement not found');
    }
    if (!percentageElement) {
        console.error('percentageElement not found');
    }

    // Update immediately on load
    updateProgress();

    // Update every second
    setInterval(updateProgress, 1000);

    // Display start and end dates
    document.querySelector('.start-date .date').textContent = formatDate(START_DATE);
    document.querySelector('.start-date .time').textContent = formatTime(START_DATE);
    document.querySelector('.end-date .date').textContent = formatDate(END_DATE);
    document.querySelector('.end-date .time').textContent = formatTime(END_DATE);

    // Update page title and subtitle
    document.title = `Progress Tracker: ${formatDate(START_DATE)} - ${formatDate(END_DATE)}`;
    document.getElementById('subtitle').textContent = `Tracking time from ${formatDate(START_DATE)} to ${formatDate(END_DATE)}`;

    // Update info card dates
    document.getElementById('info-start-date').textContent = formatDate(START_DATE);
    document.getElementById('info-end-date').textContent = formatDate(END_DATE);

    // Add some visual feedback when countdown updates
    const countdownValues = [daysElement, hoursElement, minutesElement, secondsElement];

    setInterval(() => {
        countdownValues.forEach(element => {
            element.style.transform = 'scale(1.05)';
            element.style.transition = 'transform 0.2s';

            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        });
    }, 1000);
}

// Start everything when page loads
window.addEventListener('DOMContentLoaded', init);

// Add a simple animation for the progress bar on first load
window.addEventListener('load', () => {
    setTimeout(() => {
        progressFillElement.style.transition = 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 500);
});

// ============================================================================
// Firework Effect on Click
// ============================================================================

// Get current background color from CSS variable or calculate from current time
function getCurrentBackgroundColor() {
    // Try to get from CSS variable first (set by updateBackgroundGradient)
    const cssColor = getComputedStyle(document.documentElement).getPropertyValue('--time-based-bg').trim();
    if (cssColor && cssColor !== '') {
        return cssColor;
    }

    // Fallback: calculate from current time
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    return getTimeBasedColor(hour, minute, second);
}

// Create a single firework particle
function createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = color;
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

    // Random velocity direction
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4; // pixels per frame
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Random lifespan
    const lifespan = 800 + Math.random() * 700; // ms

    document.body.appendChild(particle);

    // Animate particle
    let startTime = Date.now();
    const startX = x;
    const startY = y;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / lifespan, 1);

        if (progress >= 1) {
            // Remove particle when animation complete
            particle.remove();
            return;
        }

        // Apply easing out for fade effect
        const easeOut = 1 - Math.pow(1 - progress, 3);

        // Position with gravity
        const gravity = 0.05;
        const currentX = startX + vx * elapsed * 0.1;
        const currentY = startY + vy * elapsed * 0.1 + 0.5 * gravity * Math.pow(elapsed * 0.1, 2);

        // Update position and opacity
        particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px)`;
        particle.style.opacity = 1 - easeOut;
        particle.style.scale = 1 - easeOut * 0.5;

        // Continue animation
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    return particle;
}

// Create firework explosion at position (x, y)
function createFirework(x, y, color = null) {
    const fireworkColor = color || getCurrentBackgroundColor();
    const particleCount = 30 + Math.floor(Math.random() * 20);

    // Create main explosion particles
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle(x, y, fireworkColor);
        }, i * 10); // Stagger particles slightly
    }

    // Create a few secondary particles with lighter/darker variants
    const rgb = hexToRgb(fireworkColor);

    // Lighter variant
    const lighterRgb = rgb.map(channel => Math.min(255, channel + 50));
    const lighterColor = rgbToHex(lighterRgb);

    // Darker variant
    const darkerRgb = rgb.map(channel => Math.max(0, channel - 30));
    const darkerColor = rgbToHex(darkerRgb);

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createParticle(x, y, Math.random() > 0.5 ? lighterColor : darkerColor);
        }, 100 + i * 20);
    }
}

// Add click event listener for firework effect
function setupFireworkClickListener() {
    document.addEventListener('click', (e) => {
        // Don't trigger on interactive elements to avoid interference
        if (e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'A' ||
            e.target.tagName === 'INPUT' ||
            e.target.closest('button') ||
            e.target.closest('a') ||
            e.target.closest('input')) {
            return;
        }

        createFirework(e.clientX, e.clientY);
    });
}

// Initialize firework effect after page loads
window.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other initialization to complete
    setTimeout(() => {
        setupFireworkClickListener();
    }, 1000);
});