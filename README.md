# Progress Tracker for GitHub Pages

A real-time progress tracker that visualizes the elapsed time between **March 4, 2026** and **April 4, 2026** with second-level precision.

## Features

- **Real-time updates**: Progress updates every second
- **Precise calculation**: Accurate percentage calculation to 2 decimal places
- **Countdown timer**: Shows days, hours, minutes, and seconds remaining
- **Responsive design**: Works on all devices
- **Visual progress bar**: Color-changing bar that fills as time progresses
- **Current time display**: Always shows the exact current time

## How to Use

### Local Testing

1. **Download all files** to a folder on your computer
2. **Open `index.html`** in your web browser
3. The progress tracker should load and start updating automatically

### Deploy to GitHub Pages

1. **Create a new repository** on GitHub (e.g., `progress-tracker`)
2. **Upload all files** to the repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `favicon.ico`
   - `.nojekyll`
   - `README.md`
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **Deploy from a branch**
   - Under **Branch**, select **main** (or your default branch) and **/ (root)**
   - Click **Save**
4. **Wait for deployment** (usually takes 1-2 minutes)
5. **Access your site** at `https://[your-username].github.io/[repository-name]/`

### Customizing Dates

To change the start and end dates:

1. Open `script.js` in a text editor
2. Find these lines (around line 6-7):
   ```javascript
   const START_DATE = new Date(2026, 2, 4, 0, 0, 0); // March 4, 2026
   const END_DATE = new Date(2026, 3, 4, 0, 0, 0);  // April 4, 2026
   ```
3. Change the dates (remember: months are 0-indexed in JavaScript)
   - `new Date(year, month-1, day, hour, minute, second)`
   - Example: `new Date(2025, 0, 1, 0, 0, 0)` = January 1, 2025
4. Update the dates in `index.html` if you want to change the displayed text

## File Structure

```
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # JavaScript logic with real-time updates
├── favicon.ico         # Website icon
├── .nojekyll           # Disables Jekyll processing on GitHub Pages
└── README.md           # This documentation file
```

## How It Works

The tracker calculates:
1. **Total duration** between start and end dates
2. **Elapsed time** from start date to current time
3. **Percentage completed** = (elapsed time / total duration) × 100
4. **Time remaining** = end date - current time

All calculations are done in milliseconds for maximum precision.

## Browser Compatibility

Works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use and modify for your own projects.

## Credits

- Icons: Font Awesome
- Font: Inter from Google Fonts
- Colors: Tailwind CSS inspired palette

## Support

If you encounter any issues or have questions:
1. Check the browser console for errors
2. Ensure your system clock is accurate
3. Verify JavaScript is enabled in your browser