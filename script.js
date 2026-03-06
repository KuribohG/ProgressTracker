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

// Update progress bar color based on percentage
function updateProgressBarColor(percentage) {
    let color;

    // Use thresholds from config or defaults
    const thresholds = window.CONFIG.COLOR_THRESHOLDS || { low: 25, medium: 50, high: 75 };

    if (percentage < thresholds.low) {
        color = 'linear-gradient(90deg, #4f46e5, #8b5cf6)'; // Purple
    } else if (percentage < thresholds.medium) {
        color = 'linear-gradient(90deg, #3b82f6, #4f46e5)'; // Blue to purple
    } else if (percentage < thresholds.high) {
        color = 'linear-gradient(90deg, #8b5cf6, #ec4899)'; // Purple to pink
    } else {
        color = 'linear-gradient(90deg, #ec4899, #f59e0b)'; // Pink to orange
    }

    progressFillElement.style.background = color;
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