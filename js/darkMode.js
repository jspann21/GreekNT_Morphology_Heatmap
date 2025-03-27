/**
 * Dark Mode functionality for Greek NT Visualization
 */

// Initialize dark mode based on user preference
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
});

/**
 * Initialize dark mode settings and event listeners
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    // Check for saved preference in localStorage
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    
    // Set initial state
    document.body.classList.toggle('dark', darkModeEnabled);
    darkModeToggle.checked = darkModeEnabled;
    
    // Apply to plotly charts if they exist
    updatePlotlyTheme(darkModeEnabled);
    
    // Set up event listener for toggle
    darkModeToggle.addEventListener('change', function() {
        const isDarkMode = this.checked;
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update Plotly charts
        updatePlotlyTheme(isDarkMode);
        
        // Replot any existing heatmaps if needed
        updateExistingHeatmaps(isDarkMode);
    });
}

/**
 * Updates Plotly theme colors based on dark mode state
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function updatePlotlyTheme(isDarkMode) {
    if (isDarkMode) {
        Plotly.setPlotConfig({
            colorway: ['#28a745', '#17a2b8', '#ffc107', '#dc3545', '#6610f2', '#fd7e14'],
            template: {
                layout: {
                    paper_bgcolor: '#2d2d2d',
                    plot_bgcolor: '#1e1e1e',
                    font: {
                        color: '#e0e0e0'
                    },
                    xaxis: {
                        gridcolor: '#444',
                        linecolor: '#555'
                    },
                    yaxis: {
                        gridcolor: '#444',
                        linecolor: '#555'
                    }
                }
            }
        });
    } else {
        Plotly.setPlotConfig({
            colorway: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
            template: {
                layout: {
                    paper_bgcolor: '#fff',
                    plot_bgcolor: '#fff',
                    font: {
                        color: '#000'
                    },
                    xaxis: {
                        gridcolor: '#eee',
                        linecolor: '#ddd'
                    },
                    yaxis: {
                        gridcolor: '#eee',
                        linecolor: '#ddd'
                    }
                }
            }
        });
    }
}

/**
 * Updates existing heatmaps with the appropriate dark/light mode theme
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 */
function updateExistingHeatmaps(isDarkMode) {
    // If there's a heatmap currently displayed, redraw it
    if (currentView === 'overview') {
        drawOverviewHeatmap();
    } else if (currentView === 'breakdown' && currentCategory) {
        showGenericBreakdown(currentCategory);
    }
}

/**
 * Gets the current dark mode state
 * @returns {boolean} Whether dark mode is currently enabled
 */
function isDarkModeEnabled() {
    return document.body.classList.contains('dark');
} 