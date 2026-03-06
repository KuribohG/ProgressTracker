// Progress Tracker Configuration
// Edit these values to change the start and end dates

// Start date: March 4, 2026, 00:00:00
// Format: new Date(year, month, day, hour, minute, second)
// Note: Months are 0-indexed (0 = January, 1 = February, etc.)
const CONFIG = {
    START_DATE: new Date(2026, 2, 4, 0, 0, 0),
    END_DATE: new Date(2026, 3, 4, 0, 0, 0),

    // Display settings
    DATE_FORMAT: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    },

    // Progress bar color thresholds (percentages)
    COLOR_THRESHOLDS: {
        low: 25,
        medium: 50,
        high: 75
    },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make CONFIG available globally in browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}