/**
 * Validates the dimensions and content of data for Plotly heatmap.
 * @param {Array} x - Array of x-axis labels.
 * @param {Array} y - Array of y-axis labels.
 * @param {Array<Array>} z - 2D array of z-values.
 * @param {string} title - Title of the heatmap for error logging.
 * @returns {boolean} True if data is valid, false otherwise.
 */
function validateHeatmapData(x, y, z, title) {
    // Check basic array existence and length
    if (!x || !Array.isArray(x) || !y || !Array.isArray(y) || !z || !Array.isArray(z)) {
         console.error(`Invalid data structure for ${title}: Input arrays may be missing or not arrays.`);
         return false;
    }
     if (!x.length || !y.length || !z.length) {
         console.error(`Empty data arrays for ${title}: x=${x.length}, y=${y.length}, z=${z.length}`);
        return false;
    }
    // Check if every row in z has the same length as x
    if (z.some(row => !Array.isArray(row) || row.length !== x.length)) {
        console.error(`Invalid data dimensions for ${title}: Mismatch between x-axis length (${x.length}) and z-data row lengths (${z.map(row => Array.isArray(row) ? row.length : 'not array')}).`);
        return false;
    }
    // Check for null, undefined, or NaN in z data
    const zFlat = z.flat();
    const invalidZ = zFlat.some(val => val == null || isNaN(val));
    if (invalidZ) {
        // Provide more context for debugging
        const invalidValues = zFlat.filter(val => val == null || isNaN(val));
        console.error(`Invalid z values found in ${title}: Found ${invalidValues.length} invalid entries like [${invalidValues.slice(0, 5).join(', ')}...]. Full z-data: ${JSON.stringify(z)}`);
        return false;
    }
    return true;
}


/**
 * Draws the main overview heatmap showing category frequency per chapter.
 */
function drawOverviewHeatmap() {
    // console.log("Drawing Overview Heatmap for:", currentBookName);
    currentView = 'overview';
    currentCategory = null; // Reset category when showing overview
    const container = d3.select("#heatmapContainer").html(''); // Clear previous content

    // Basic check for book data
    if (!currentBookData || typeof currentBookData !== 'object' || Object.keys(currentBookData).length === 0) {
         console.error("Cannot draw overview: currentBookData is missing, invalid, or empty.");
         container.append('div').attr('id', 'errorMessage').text('Error: Book data is not available or empty.');
         return;
    }
     // Ensure categories are defined
     if (!categories || !Array.isArray(categories) || categories.length === 0) {
        console.error("Cannot draw overview: Global 'categories' array is missing or empty.");
        container.append('div').attr('id', 'errorMessage').text('Error: Word categories configuration is missing.');
        return;
     }

    const chapters = Object.keys(currentBookData).sort((a, b) => +a - +b).map(String);
    if (!chapters.length) {
        console.warn("No chapters found in currentBookData for:", currentBookName);
        container.append('div').attr('id', 'errorMessage').text('No chapters found in the data for this book.');
        return;
    }

    // Create a dedicated container for the heatmap plot
    const heatmapDiv = container.append('div').attr('id', 'heatmapDiv');

    // Calculate heatmap data (zData)
    const zData = categories.map(cat => {
        return chapters.map(chap => {
            let count = 0;
            // Safely access chapter data
            const chapterData = currentBookData[chap];
            if (chapterData && typeof chapterData === 'object') {
                try {
                    for (const verse in chapterData) {
                        // Safely access verse data
                        const verseData = chapterData[verse];
                        if (Array.isArray(verseData)) {
                            verseData.forEach(word => {
                                // Ensure word and pos_tag exist before processing
                                if (word && word.pos_tag) {
                                    const category = getCategory(word.pos_tag);
                                    if (category === cat) {
                                        count++;
                                    }
                                } else {
                                     // console.warn(`Skipping invalid word object in ${currentBookName} ${chap}:${verse}:`, word);
                                }
                            });
                        } else {
                            // console.warn(`Expected an array for verse data in ${currentBookName} ${chap}:${verse}, got:`, verseData);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing ${currentBookName} Chapter ${chap} for category ${cat}:`, error);
                    // Decide how to handle errors: return 0, NaN, or throw
                    return NaN; // Returning NaN will fail validation below
                }
            } else {
                 // console.warn(`Chapter ${chap} data missing or invalid in ${currentBookName}`);
                 return 0; // Return 0 if chapter data is missing/invalid
            }
            return count;
        });
    });

    // Validate the calculated data before plotting
    if (!validateHeatmapData(chapters, categories, zData, `Overview - ${currentBookName}`)) {
        heatmapDiv.html(''); // Clear the div if validation fails
        heatmapDiv.append('div').attr('id', 'errorMessage').text('Error: Invalid data calculated for overview heatmap. Check console for details.');
        return;
    }

    // Check if dark mode is enabled
    const isDarkMode = document.body.classList.contains('dark');

    // --- Plotly Configuration ---
    const layout = {
        title: `${currentBookName} - Word Frequency by Category`,
        xaxis: {
            title: 'Chapter',
            type: 'category',
            tickangle: -45,
            automargin: true,
            fixedrange: true,
            gridcolor: isDarkMode ? '#444' : '#eee',
            linecolor: isDarkMode ? '#555' : '#ddd'
        },
        yaxis: {
            title: 'Part of Speech',
            type: 'category',
            automargin: true,
            tickangle: 0,
            tickfont: { size: 12 },
            fixedrange: true, // Disable zoom/pan on y-axis
            gridcolor: isDarkMode ? '#444' : '#eee',
            linecolor: isDarkMode ? '#555' : '#ddd'
        },
        height: 600, // Adjust as needed, or make dynamic
        margin: { t: 100, l: 150, r: 50, b: 50 }, // Adjust margins if labels get cut off
        plot_bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
        paper_bgcolor: isDarkMode ? '#2d2d2d' : '#fff',
        hoverlabel: { 
            bgcolor: isDarkMode ? '#3d3d3d' : '#FFF', 
            bordercolor: isDarkMode ? '#555' : '#333',
            font: { color: isDarkMode ? '#e0e0e0' : '#000' }
        },
        font: {
            color: isDarkMode ? '#e0e0e0' : '#000'
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
            'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale',
            'hoverClosestCartesian', 'hoverCompareCartesian', 'pan2d', 'zoom2d',
            'resetScale2d' // Covers resetScale, zoom, pan
        ],
        toImageButtonOptions: {
            format: 'png', filename: `${currentBookName}_overview_heatmap`,
            height: 1000, width: 1000, scale: 2
        },
        scrollZoom: false, // Disable scroll zoom
        doubleClick: false,
        // modeBarButtons: [['toImage']], // Add only specific buttons if needed
        dragmode: false // Disable drag modes like zoom or pan
    };

    // --- Plotting ---
    Plotly.newPlot('heatmapDiv', [{
        z: zData,
        x: chapters,
        y: categories,
        type: 'heatmap',
        colorscale: isDarkMode ? 'Viridis' : 'Portland', // Different colorscale for dark mode
        hoverongaps: false,
        hovertemplate: '<b>Chapter</b>: %{x}<br><b>Category</b>: %{y}<br><b>Count</b>: %{z}<extra></extra>' // <extra></extra> removes trace info
    }], layout, config)
        .then(gd => {
             // console.log("Overview heatmap plotted successfully.");
             // --- Click Handler ---
             gd.on('plotly_click', function(data) {
                if (!data.points || data.points.length === 0) {
                    console.warn("Plotly click event on overview heatmap had no points.");
                    return;
                }
                const point = data.points[0];
                const clickedCategory = point.y; // Get the category name from the y-axis
                const clickedChapter = point.x; // Get the chapter from x-axis

                if (!clickedCategory) {
                     console.error("Plotly click event missing category (point.y).", data);
                     return;
                }

                // console.log(`Overview heatmap clicked. Category: ${clickedCategory}, Chapter: ${clickedChapter}. Navigating to breakdown...`);

                // First show the breakdown view
                showGenericBreakdown(clickedCategory);

                // Then display the chapter text with the category highlighted
                displayChapterText(clickedChapter, clickedCategory, null, null);
             });
        })
        .catch(err => {
            console.error('Plotly error during overview heatmap plotting:', err);
             // Display error in the UI as well
             heatmapDiv.html(''); // Clear div
             heatmapDiv.append('div').attr('id', 'errorMessage')
                .html(`Error plotting overview heatmap. Check console.<br><pre>${err.message || err}</pre>`);
        });
}

/**
 * Plots a heatmap with the provided data.
 * @param {Array} x - Array of x-axis labels (chapters).
 * @param {Array} y - Array of y-axis labels (categories).
 * @param {Array<Array>} z - 2D array of z-values (counts).
 * @param {string} title - Title of the heatmap.
 * @param {number} customHeight - Optional custom height for the heatmap (default: 600).
 */
function plotHeatmap(x, y, z, title, customHeight = 600) {
    if (!validateHeatmapData(x, y, z, title)) return;

    // First, purge any existing plot to prevent memory leaks and height issues
    Plotly.purge('heatmapDiv');

    // Extract attribute name from title if it exists (e.g., "Verb Breakdown by Tense" -> "Tense")
    const attributeMatch = title.match(/by\s+(\w+)$/);
    const attributeName = attributeMatch ? attributeMatch[1] : 'Category';

    // Determine if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // Check if dark mode is enabled
    const isDarkMode = document.body.classList.contains('dark');

    // Calculate height based on number of rows (y categories) with fixed block height
    const minBlockHeight = 40; // Minimum height per block in pixels
    const marginHeight = isMobile ? 100 : 150; // Total margin height (top + bottom)
    
    // Calculate height based directly on the number of categories
    // For small category sets (like single preposition), keep height compact
    const minTotalHeight = 300; // Reduced minimum height for smaller datasets
    const totalHeight = Math.max(minTotalHeight, y.length * minBlockHeight + marginHeight);
    
    // Reset heatmap container height to avoid excess whitespace
    document.getElementById('heatmapDiv').style.height = `${totalHeight}px`;

    // Adjust font sizes and margins for mobile
    const layout = {
        title: {
            text: title,
            font: {
                size: isMobile ? 16 : 20,
                color: isDarkMode ? '#e0e0e0' : '#000'
            }
        },
        xaxis: {
            title: 'Chapter',
            type: 'category',
            tickangle: isMobile ? -45 : -45,
            automargin: true,
            tickfont: {
                size: isMobile ? 10 : 12,
                color: isDarkMode ? '#e0e0e0' : '#000'
            },
            gridcolor: isDarkMode ? '#444' : '#eee',
            linecolor: isDarkMode ? '#555' : '#ddd'
        },
        yaxis: {
            title: attributeName,
            type: 'category',
            automargin: true,
            tickangle: 0,
            tickfont: {
                size: isMobile ? 10 : 12,
                color: isDarkMode ? '#e0e0e0' : '#000'
            },
            gridcolor: isDarkMode ? '#444' : '#eee',
            linecolor: isDarkMode ? '#555' : '#ddd'
        },
        height: totalHeight,
        margin: isMobile ? 
            { t: 50, l: 100, r: 30, b: 80 } : 
            { t: 100, l: 150, r: 50, b: 80 },
        plot_bgcolor: isDarkMode ? '#1e1e1e' : '#fff',
        paper_bgcolor: isDarkMode ? '#2d2d2d' : '#fff',
        autosize: true,
        hoverongaps: false,
        hoverdistance: 100,
        hoverlabel: {
            bgcolor: isDarkMode ? '#3d3d3d' : '#FFF',
            bordercolor: isDarkMode ? '#555' : '#333',
            font: { 
                size: isMobile ? 12 : 14,
                color: isDarkMode ? '#e0e0e0' : '#000'
            }
        },
        font: {
            color: isDarkMode ? '#e0e0e0' : '#000'
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
            'select2d',
            'lasso2d',
            'zoomIn2d',
            'zoomOut2d',
            'autoScale',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            'pan',
            'zoom',
            'resetScale'
        ],
        toImageButtonOptions: {
            format: 'png',
            filename: 'heatmap',
            height: 1000,
            width: 1000,
            scale: 2
        },
        scrollZoom: false,
        doubleClick: false,
        showTips: true,
        modeBarButtons: [['toImage']],
        dragmode: false
    };

    // Also disable zooming on axes
    layout.xaxis.fixedrange = true;
    layout.yaxis.fixedrange = true;

    Plotly.newPlot('heatmapDiv', [{
        z: z,
        x: x,
        y: y,
        type: 'heatmap',
        colorscale: isDarkMode ? 'Viridis' : 'Portland',
        hoverongaps: false,
        customdata: Array(z.length).fill(attributeName),
        hovertemplate: '<b>Chapter</b>: %{x}<br><b>' + attributeName + '</b>: %{y}<br><b>Count</b>: %{z}<extra></extra>'
    }], layout, config)
    .catch(err => console.error('Plotly error:', err));

    // Add click event handler for heatmap blocks
    document.getElementById('heatmapDiv').on('plotly_click', function(data) {
        const point = data.points[0];
        const chapter = point.x;
        const category = currentCategory; // The current breakdown category (e.g., Verb, Noun)
        const attribute = currentView === 'breakdown' ? attributeName : null;
        const value = point.y; // The specific attribute value (e.g., Present, Imperative)
        
        // Display the chapter text with highlighting
        displayChapterText(chapter, category, attribute, value);
    });

    // Add window resize handler
    window.addEventListener('resize', () => {
        Plotly.Plots.resize('heatmapDiv');
    });
} 