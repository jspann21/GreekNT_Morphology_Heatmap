// --- Tutorial Functions for Greek NT Visualization ---

/**
 * Generates the HTML content for a tutorial step.
 * @param {string} title - The title of the step.
 * @param {string} description - The description/text content for the step.
 * @param {number} currentStep - The current step number (1-based).
 * @param {number} totalSteps - The total number of steps in the tour.
 * @returns {string} - The HTML string for the step content.
 */
function createTutorialStepText(title, description, currentStep, totalSteps) {
    const progressPercent = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
    return `
        <div class="tutorial-step">
            <h3>${title}</h3>
            <p>${description}</p>
            ${totalSteps > 0 ? `
                <div class="tutorial-progress">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Initializes a Shepherd tour with common settings.
 * @param {string} localStorageKey - The key to use for storing completion status in localStorage.
 * @param {object} defaultStepOptions - Default options for the tour steps.
 * @returns {Shepherd.Tour} - The initialized Shepherd tour instance.
 */
function initializeTour(localStorageKey, defaultStepOptions) {
    // Detect if dark mode is active
    const isDarkMode = document.body.classList.contains('dark');
    
    // Create theme classes based on current mode
    const themeClasses = isDarkMode ? 'shepherd-theme-dark' : 'shepherd-theme-default';
    
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        keyboardNavigation: true,
        exitOnEsc: true,
        defaultStepOptions: {
            scrollTo: { behavior: 'smooth', block: 'center', passive: true },
            cancelIcon: {
                enabled: true
            },
            classes: themeClasses,
            ...defaultStepOptions // Merge custom defaults
        }
    });

    // Add cancel handler
    tour.on('cancel', () => {
        localStorage.setItem(localStorageKey, 'true');
    });

    return tour;
}

// --- Common Button Definitions ---

const nextButton = {
    text: 'Next',
    classes: 'shepherd-button-primary',
    action: function() { return this.next(); }
};

const backButton = {
    text: 'Back',
    classes: 'shepherd-button-secondary', // Consistent styling for back
    action: function() { return this.back(); }
};

const finishButton = (localStorageKey) => ({
    text: 'Finish',
    action: function() {
        localStorage.setItem(localStorageKey, 'true');
        return this.complete();
    }
});

const skipButton = (localStorageKey) => ({
    text: 'Skip Tutorial',
    classes: 'shepherd-button-secondary',
    action: function() {
        localStorage.setItem(localStorageKey, 'true');
        return this.complete();
    }
});


// --- Main Tutorial ---

/**
 * Starts the main application tutorial that introduces the visualization.
 */
function startTutorial() {
    const localStorageKey = 'tutorialShown';
    const totalSteps = 6; // Welcome, Book Select, X-Axis, Y-Axis, Scale, Interaction

    const tour = initializeTour(localStorageKey, {
        classes: 'shepherd-main-tutorial', // Specific class for this tour
    });

    tour.addSteps([
        {
            id: 'welcome',
            text: createTutorialStepText(
                'Welcome to the Greek NT Morphology Heatmap!',
                'Let\'s take a quick tour of the visualization.',
                1, totalSteps
            ),
            buttons: [
                skipButton(localStorageKey),
                nextButton
            ]
        },
        {
            id: 'book-select',
            text: createTutorialStepText(
                'Book Selection',
                'Select any book of the Bible to analyze its morphological patterns.',
                2, totalSteps
            ),
            attachTo: { element: '#bookSelect', on: 'bottom' },
            buttons: [ backButton, nextButton ]
        },
        {
            id: 'x-axis',
            text: createTutorialStepText(
                'Chapter Numbers',
                'The X-axis shows the chapter numbers of the selected book.',
                3, totalSteps
            ),
            attachTo: { element: '#heatmapDiv', on: 'bottom' },
            popperOptions: {
                modifiers: [
                    { name: 'offset', options: { offset: [0, 100] } },
                    { name: 'flip', options: { fallbackPlacements: ['top', 'right', 'left'] } }
                ]
            },
            buttons: [ backButton, nextButton ]
        },
        {
            id: 'y-axis',
            text: createTutorialStepText(
                'Parts of Speech',
                'The Y-axis shows different parts of speech found in the text.',
                4, totalSteps
            ),
            attachTo: { element: '#heatmapDiv', on: 'left' },
            popperOptions: {
                modifiers: [
                    { name: 'offset', options: { offset: [-100, 0] } },
                    { name: 'flip', options: { fallbackPlacements: ['right', 'top', 'bottom'] } }
                ]
            },
            buttons: [ backButton, nextButton ]
        },
        {
            id: 'scale',
            text: createTutorialStepText(
                'Word Frequency Scale',
                'The color scale on the right shows the frequency of words.',
                5, totalSteps
            ),
            attachTo: { element: '.colorbar', on: 'left' },
            buttons: [ backButton, nextButton ]
        },
        {
            id: 'interaction',
            text: createTutorialStepText(
                'Interactive Features',
                'Click any heatmap block to go to that chapter and part of speech. Try clicking a block to explore!',
                6, totalSteps
            ),
            attachTo: { element: '#heatmapDiv', on: 'left' },
            buttons: [
                backButton,
                finishButton(localStorageKey)
            ]
        }
    ]);

    tour.start();
}

// --- Breakdown View Tutorial ---

/**
 * Starts the tutorial for the breakdown view.
 */
function startBreakdownTutorial() {
    const localStorageKey = 'breakdownTutorialShown';

    // Skip if the user has already seen the tutorial
    if (localStorage.getItem(localStorageKey) === 'true') {
        return;
    }

    const tour = initializeTour(localStorageKey, {
        classes: 'shepherd-breakdown-tutorial', // Specific class for this tour
    });

    // Check if this is a single attribute or multi-attribute breakdown
    const filterPanelElement = document.getElementById('filterPanel');
    const hasFilterPanel = filterPanelElement !== null;
    // Total steps: Base (6) + Filter (1 if present) + Word Tooltip (1)
    const totalSteps = 6 + (hasFilterPanel ? 1 : 0) + 1;
    let currentStep = 0;

    const steps = [];

    // Step 1: Intro
    currentStep++;
    steps.push({
        id: 'breakdown-intro',
        text: createTutorialStepText(
            'Breakdown View',
            'This view shows a detailed breakdown of a specific part of speech. You\'ll see how different attributes of this word type are distributed across chapters.',
            currentStep, totalSteps
        ),
        attachTo: { element: '.header-section h2', on: 'bottom' },
        buttons: [
            skipButton(localStorageKey),
            nextButton
        ]
    });

    // Step 2: Back Button
    currentStep++;
    steps.push({
        id: 'back-button',
        text: createTutorialStepText(
            'Navigation',
            'Click this button to return to the overview heatmap where you can select different parts of speech.',
            currentStep, totalSteps
        ),
        attachTo: { element: '.back-button', on: 'bottom' },
        buttons: [ backButton, nextButton ]
    });

    // Step 3: Filter Options (Conditional)
    if (hasFilterPanel) {
        currentStep++;
        steps.push({
            id: 'filter-options',
            text: createTutorialStepText(
                'Filter Options',
                'Use this dropdown to group the data by different attributes. The heatmap will update to show the distribution based on your selection.',
                currentStep, totalSteps
            ),
            attachTo: { element: '#filterPanel select', on: 'bottom' },
            buttons: [ backButton, nextButton ]
        });
    }

    // Step 4: Heatmap
    currentStep++;
    steps.push({
        id: 'heatmap-breakdown',
        text: createTutorialStepText(
            'The Heatmap',
            'This heatmap shows the distribution of the selected attribute across chapters. Hover over a cell to see exact counts. Click on a cell to view the actual text with these words highlighted.',
            currentStep, totalSteps
        ),
        attachTo: { element: '#heatmapDiv', on: 'top' },
        buttons: [ backButton, nextButton ]
    });

    // Step 5: Text Content
    currentStep++;
    steps.push({
        id: 'text-content',
        text: createTutorialStepText(
            'Text Display',
            'The SBL Greek New Testament for the selected chapter will appear here with words that match the selected part of speech highlighted.',
            currentStep, totalSteps
        ),
        attachTo: { element: '.text-content', on: 'top' },
        buttons: [ backButton, nextButton ]
    });

    // Step 6: Word Tooltip
    currentStep++;
    steps.push({
        id: 'word-tooltip',
        text: createTutorialStepText(
            'Word Information',
            'Click on any word in the text to see detailed morphological information about it in a tooltip.',
            currentStep, totalSteps
        ),
        attachTo: { element: '.text-content .word', on: 'bottom' },
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
        },
        beforeShowPromise: function() {
            // This specific logic remains as it's unique to this step
            return new Promise(function(resolve) {
                const wordElements = document.querySelectorAll('.text-content .word');
                let targetWord = null;
                if (wordElements.length > 0) {
                    // Select the first word element
                    targetWord = wordElements[0];
                    targetWord.style.backgroundColor = '#FFEB3B';
                    targetWord.style.padding = '2px';
                    targetWord.style.borderRadius = '3px';
                }
                // Ensure the style is removed even if the user advances quickly
                const stepElement = this.el; // Get the Shepherd step element
                const removeHighlight = () => {
                    if (targetWord) {
                        targetWord.style.backgroundColor = '';
                        targetWord.style.padding = '';
                        targetWord.style.borderRadius = '';
                    }
                    // Clean up listeners if the step element exists
                    if (stepElement) {
                        stepElement.removeEventListener('before-hide', removeHighlight);
                    }
                };
                // Remove highlight when the step is hidden or after a timeout
                if (stepElement) {
                    stepElement.addEventListener('before-hide', removeHighlight, { once: true });
                }
                setTimeout(removeHighlight, 5000); // Fallback timeout

                resolve();
            }.bind(this)); // Bind 'this' to access Shepherd step context
        },
        buttons: [ backButton, nextButton ]
    });

    // Step 7: Paragraph Mode
    currentStep++;
    steps.push({
        id: 'paragraph-mode',
        text: createTutorialStepText(
            'Paragraph Mode',
            'Toggle whether each verse is a new line or if verses are shown in paragraphs.',
            currentStep, totalSteps
        ),
        attachTo: { element: '#paragraph-mode-toggle', on: 'right' },
        buttons: [ backButton, nextButton ]
    });

    // Step 8: Close Text
    currentStep++;
    steps.push({
        id: 'close-text',
        text: createTutorialStepText(
            'Close Text',
            'Close the text display and return to just viewing the heatmap.',
            currentStep, totalSteps // Should be 100%
        ),
        attachTo: { element: '.close-text-button', on: 'left' },
        buttons: [
            backButton,
            finishButton(localStorageKey)
        ]
    });

    tour.addSteps(steps);
    
    tour.on('complete', () => {
        // Mark tutorial as complete when finished
        localStorage.setItem(localStorageKey, 'true');
    });
    
    tour.on('cancel', () => {
        // Mark tutorial as complete even if canceled
        localStorage.setItem(localStorageKey, 'true');
    });
    
    tour.start();
}
