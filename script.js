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