// Main application file for Greek NT Visualization

// --- Global Variables ---

// Application state variables
let currentBookData = null;
let currentBookName = null;
let currentView = 'overview';
let currentCategory = null;

// Text display variables
let isParagraphMode = false; // Default to non-paragraph mode
let displayedChapter = null; // Currently displayed chapter
let displayedCategoryFilter = null; // Currently displayed category filter

// --- Application Functions ---

/**
 * Loads book data from JSON and initializes visualization.
 * @param {string} bookName - The name of the book to load.
 */
function loadBookData(bookName) {
    d3.json(`sblgnt_json/${bookName}.json`).then(data => {
        currentBookName = bookName;
        currentBookData = data[bookName];
        if (!currentBookData || Object.keys(currentBookData).length === 0) {
            d3.select('#heatmapContainer').html('').append('div')
                .attr('id', 'errorMessage')
                .text('No data available for this book.');
            return;
        }
        drawOverviewHeatmap();
        
        // Start the tutorial if it hasn't been shown before
        if (!localStorage.getItem('tutorialShown')) {
            startTutorial();
        }
    }).catch(err => {
        console.error('Error loading JSON:', err);
        d3.select('#heatmapContainer').html('').append('div')
            .attr('id', 'errorMessage')
            .text('Failed to load book data.');
    });
}

// --- Initialization ---

// Initialize application and load books list
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    
    d3.json("books.json").then(books => {
        const select = d3.select("#bookSelect");
        select.selectAll("option")
            .data(books)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);
        loadBookData(books[0]);
        select.on("change", function() {
            loadBookData(this.value);
        });
    }).catch(err => {
        console.error('Error loading books.json:', err);
        d3.select('#heatmapContainer').html('').append('div')
            .attr('id', 'errorMessage')
            .text('Failed to load book list.');
    });

    // Info button functionality
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeInfo = document.querySelector('.close-info');

    if (infoBtn && infoModal) {
        infoBtn.addEventListener('click', function(event) {
            infoModal.style.display = 'block';
            event.stopPropagation(); // Prevent immediate propagation to document
        });

        closeInfo.addEventListener('click', function() {
            infoModal.style.display = 'none';
        });

        // Close the modal when clicking anywhere outside the modal content
        document.addEventListener('click', function(event) {
            // Close if click is not on the button and not inside the modal content
            if (infoModal.style.display === 'block' && 
                event.target !== infoBtn && 
                !infoModal.contains(event.target)) {
                infoModal.style.display = 'none';
            }
        });
    }
}); 