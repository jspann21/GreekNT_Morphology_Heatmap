// --- Text display functions for Greek NT Visualization ---

/**
 * Gets the filter options map for a given category and attribute.
 * @param {string} category - The word category (e.g., 'Verb', 'Noun').
 * @param {string} attribute - The attribute name (e.g., 'tense', 'case').
 * @returns {object|null} The filter options map or null if not found.
 */
function getFilterOptionsForCategory(category, attribute) {
    if (!category || !attribute) return null;
    const attrKey = attribute.toLowerCase();
    switch (category) {
        case 'Verb': return verbFilterOptions[attrKey];
        case 'Noun': return nounFilterOptions[attrKey];
        case 'Adjective': return adjectiveFilterOptions[attrKey];
        case 'Pronoun': return pronounFilterOptions[attrKey];
        case 'Article': return articleFilterOptions[attrKey];
        case 'Conjunction': return conjunctionFilterOptions[attrKey];
        case 'Adverb': return adverbFilterOptions[attrKey];
        case 'Particle': return particleFilterOptions[attrKey];
        case 'Indeclinable': return indeclinableFilterOptions[attrKey];
        // Interjection and Preposition might not have filter options map depending on implementation
        case 'Interjection': return getInterjectionAttributes(attribute); // Assuming this returns relevant info or null
        case 'Preposition': return getPrepositionAttributes(attribute); // Assuming this returns relevant info or null
        default: return null;
    }
}

/**
 * Gets the parsed attributes object for a word based on its category and POS tag.
 * @param {string} category - The word category.
 * @param {string} posTag - The POS tag string.
 * @returns {object|null} An object containing parsed attributes or null.
 */
function getAttributesForCategory(category, posTag) {
    if (!category || !posTag) return null;
    switch (category) {
        case 'Verb': return getVerbAttributes(posTag);
        case 'Noun': return getNounAttributes(posTag);
        case 'Adjective': return getAdjectiveAttributes(posTag);
        case 'Pronoun': return getPronounAttributes(posTag);
        case 'Article': return getArticleAttributes(posTag);
        case 'Conjunction': return getConjunctionAttributes(posTag);
        case 'Adverb': return getAdverbAttributes(posTag);
        case 'Particle': return getParticleAttributes(posTag);
        case 'Indeclinable': return getIndeclinableAttributes(posTag);
        case 'Interjection': return getInterjectionAttributes(posTag); // May return simple object or null
        case 'Preposition': return getPrepositionAttributes(posTag); // May return simple object or null
        default: return null;
    }
}

/**
 * Converts a single-letter code to its display name using filter options.
 * @param {string} category - The word category.
 * @param {string} attribute - The attribute name.
 * @param {string} code - The single-letter code.
 * @returns {string} The display name or the original code if not found.
 */
function getDisplayValueFromCode(category, attribute, code) {
    if (!code || code.length !== 1) return code; // Return original if not a single char or null/empty

    const filterOptions = getFilterOptionsForCategory(category, attribute);
    return (filterOptions && filterOptions[code]) ? filterOptions[code] : code;
}


// --- Core Display Functions ---

/**
 * Sets up the text display container, controls, and close button.
 * @returns {d3.Selection} The created or existing text display container.
 */
function setupTextDisplayContainer() {
    let textContainer = d3.select('#textDisplayContainer');
    if (textContainer.empty()) {
        textContainer = d3.select('#heatmapWrapper') // Ensure #heatmapWrapper exists
            .append('div')
            .attr('id', 'textDisplayContainer');

        const modeToggleDiv = textContainer.append('div')
            .attr('class', 'text-display-controls');

        // Create a container for paragraph mode toggle
        const paragraphModeContainer = modeToggleDiv.append('div')
            .attr('class', 'paragraph-mode-container');

        paragraphModeContainer.append('label')
            .attr('for', 'paragraph-mode-toggle')
            .text('Paragraph Mode:');

        paragraphModeContainer.append('input')
            .attr('type', 'checkbox')
            .attr('id', 'paragraph-mode-toggle')
            .property('checked', isParagraphMode)
            .on('change', function() {
                isParagraphMode = this.checked;
                // Re-render with the current filter if it exists
                if (displayedChapter && displayedCategoryFilter) {
                    renderChapterText(
                        displayedChapter,
                        displayedCategoryFilter.category,
                        displayedCategoryFilter.attribute,
                        displayedCategoryFilter.value
                    );
                }
            });

        modeToggleDiv.append('button')
            .attr('class', 'close-text-button')
            .text('Close Text')
            .on('click', function() {
                textContainer.remove();
                displayedChapter = null;
                displayedCategoryFilter = null;
            });
    }
    return textContainer;
}


/**
 * Displays chapter text when clicking on a heatmap block.
 * @param {string|number} chapter - The chapter number.
 * @param {string} category - The word category (e.g., 'Verb', 'Noun').
 * @param {string} attribute - The attribute name (e.g., 'tense', 'case').
 * @param {string} value - The attribute value to filter by.
 */
function displayChapterText(chapter, category, attribute, value) {
    // Ensure chapter is a string for consistency if needed later
    const chapterStr = String(chapter);
    let filterValue = value;

    // Log filter information for debugging
    logAttributeDetails(); // Keep this if useful for debugging

    // Special case handling for conjunction subtypes which might need to be converted
    if (category === 'Conjunction' && attribute === 'subtype') {
        // If value is in format "Type, Subtype" we should extract just the "Subtype" part
        if (filterValue && filterValue.includes(',')) {
            filterValue = filterValue.split(',')[1].trim();
        }
    }

    // Store the potentially modified filter value
    displayedChapter = chapterStr;
    displayedCategoryFilter = { category, attribute, value: filterValue };

    // Get the display value (e.g., "Nominative" instead of "N")
    const displayValue = getDisplayValueFromCode(category, attribute, filterValue);

    // Create or get the text display container and controls
    const textContainer = setupTextDisplayContainer();

    // Clear existing text content
    textContainer.selectAll('.text-content').remove();

    // Create text content container
    const textContent = textContainer.append('div')
        .attr('class', 'text-content');

    // Create chapter heading
    textContent.append('h3')
        .text(`${currentBookName} ${chapterStr}`); // Use potentially stringified chapter

    // Add description of filter
    let filterDescription = '';
    if (category) {
        if (attribute && filterValue) {
            // Special case for verb participles with case/gender/number
            if (category === 'Verb' && attribute !== 'mood' &&
                (attribute === 'case' || attribute === 'gender' || attribute === 'number')) {
                 // Check if the filter is actually for participles based on current view/context if possible
                 // This might require more context about how 'currentView' or similar state is managed
                 // Assuming for now that if we filter Verb by case/gender/number, it implies Participle context
                filterDescription = `Highlighting Participle verbs with ${attribute}: ${displayValue}`;
            }
            // Special case for verb participles (mood filter)
            else if (category === 'Verb' && attribute === 'mood' && filterValue === 'P') { // Assuming 'P' is the code for Participle
                filterDescription = `Highlighting Participle verbs`; // Display value might be "Participle"
            }
            // General case
            else {
                filterDescription = `Highlighting ${category}s with ${attribute}: ${displayValue}`;
            }
        } else {
            // For overview/general category filter
            filterDescription = `Highlighting all ${category}s`;
        }
    }

    textContent.append('p')
        .attr('class', 'filter-description')
        .text(filterDescription);

    // Render the chapter text
    renderChapterText(chapterStr, category, attribute, filterValue);
}

/**
 * Renders the chapter text content based on filtering criteria.
 * @param {string} chapter - The chapter number as a string.
 * @param {string} category - The word category to highlight.
 * @param {string} attribute - The attribute to filter by.
 * @param {string} value - The attribute value to filter by.
 */
async function renderChapterText(chapter, category, attribute, value) {
    const textContent = d3.select('.text-content'); // Assumes this exists
    if (textContent.empty()) {
        console.error("Text content container not found for rendering.");
        return;
    }

    // Ensure currentBookData is available
    if (!currentBookData || Object.keys(currentBookData).length === 0) {
        textContent.append('p').text('Book data not loaded.');
        return;
    }

    const chapterData = currentBookData[chapter];
    if (!chapterData) {
        textContent.selectAll('.chapter-text').remove(); // Clear previous potentially
        textContent.append('p').text(`No data available for ${currentBookName} ${chapter}.`);
        return;
    }

    // Clear previous text
    textContent.selectAll('.chapter-text').remove();

    // Create container for the text
    const textDisplay = textContent.append('div')
        .attr('class', 'chapter-text');

    try {
        if (isParagraphMode) {
            await renderParagraphMode(textDisplay, chapter, chapterData, category, attribute, value);
        } else {
            renderNonParagraphMode(textDisplay, chapterData, category, attribute, value);
        }
    } catch (error) {
        console.error(`Error rendering chapter ${chapter} text:`, error);
        textDisplay.append('p').text('An error occurred while rendering the text.');
        // Optionally fall back to non-paragraph mode if paragraph mode failed
        if (isParagraphMode) {
            textDisplay.append('p').text('Falling back to verse-by-verse mode.');
            renderNonParagraphMode(textDisplay, chapterData, category, attribute, value);
        }
    }
}


/**
 * Renders text in paragraph mode with verses grouped into paragraphs.
 * @param {d3.Selection} container - The container element.
 * @param {string} chapter - The chapter number.
 * @param {object} chapterData - The chapter data object.
 * @param {string} category - The word category to highlight.
 * @param {string} attribute - The attribute to filter by.
 * @param {string} value - The attribute value to filter by.
 */
async function renderParagraphMode(container, chapter, chapterData, category, attribute, value) {
    let paragraphs;
    try {
        // Fetch paragraph data
        const response = await fetch(`sblgnt_json/paragraphs/${currentBookName}/${String(chapter).padStart(3, '0')}-paragraphs.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        paragraphs = await response.json();

    } catch (error) {
        console.error(`Failed to fetch or parse paragraphs for ${currentBookName} ${chapter}:`, error);
        container.append('p').text('Error loading paragraph data. Falling back to verse-by-verse mode.');
        // Fallback to non-paragraph mode
        renderNonParagraphMode(container, chapterData, category, attribute, value);
        return; // Stop execution for paragraph mode
    }

    // Check if paragraphs array is valid
    if (!Array.isArray(paragraphs)) {
         console.error(`Invalid paragraph data format for ${currentBookName} ${chapter}. Expected an array.`);
         container.append('p').text('Invalid paragraph data format. Falling back to verse-by-verse mode.');
         renderNonParagraphMode(container, chapterData, category, attribute, value);
         return;
    }

    // Create each paragraph
    paragraphs.forEach((paragraphVerses, index) => {
        // Ensure paragraphVerses is an array
        if (!Array.isArray(paragraphVerses)) {
            console.warn(`Paragraph ${index + 1} in chapter ${chapter} is not an array, skipping.`);
            return;
        }

        const paragraphElement = container.append('div')
            .attr('class', 'paragraph');

        paragraphVerses.forEach(verseNum => {
            const verseNumStr = String(verseNum); // Ensure verseNum is treated as string key
            if (chapterData[verseNumStr]) {
                const verseElement = paragraphElement.append('span')
                    .attr('class', 'verse'); // Verses within a paragraph are spans

                addVerseContent(verseElement, chapterData[verseNumStr], category, attribute, value);
            } else {
                console.warn(`Verse data for ${chapter}:${verseNumStr} not found in chapterData.`);
            }
        });
    });
}

/**
 * Renders text in non-paragraph mode (one verse per line).
 * @param {d3.Selection} container - The container element.
 * @param {object} chapterData - The chapter data object.
 * @param {string} category - The word category to highlight.
 * @param {string} attribute - The attribute to filter by.
 * @param {string} value - The attribute value to filter by.
 */
function renderNonParagraphMode(container, chapterData, category, attribute, value) {
    const combinedVerses = {};

    // Combine verses with variants (e.g., 3a, 3b)
    Object.keys(chapterData).forEach(verseNum => {
        // Remove any trailing letter (e.g. for variants)
        const baseVerseNum = verseNum.replace(/[a-z]$/, '');
        if (!combinedVerses[baseVerseNum]) {
            combinedVerses[baseVerseNum] = [];
        }
        // Ensure chapterData[verseNum] is an array before spreading
        if (Array.isArray(chapterData[verseNum])) {
            combinedVerses[baseVerseNum].push(...chapterData[verseNum]);
        } else {
            console.warn(`Data for verse ${verseNum} is not an array, skipping.`);
        }
    });

    // Sort verse numbers numerically and render
    Object.keys(combinedVerses)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .forEach(verseNum => {
            const verseElement = container.append('div')
                .attr('class', 'verse-line'); // Each verse is a div

            addVerseContent(verseElement, combinedVerses[verseNum], category, attribute, value);
        });
}

/**
 * Adds verse content to an element (either span in paragraph or div in non-paragraph).
 * @param {d3.Selection} element - The element to add verse content to.
 * @param {Array} verseWords - Array of word objects for this verse.
 * @param {string} category - The word category to highlight.
 * @param {string} attribute - The attribute to filter by.
 * @param {string} value - The attribute value to filter by.
 */
function addVerseContent(element, verseWords, category, attribute, value) {
    // Basic validation
    if (!verseWords || verseWords.length === 0) {
        console.warn("addVerseContent called with empty or invalid verseWords");
        return;
    }

    // Get the verse number from the first word's book_chapter_verse
    const verseNumStr = verseWords[0].book_chapter_verse; // e.g., "0100101"
    let verseNum = '??'; // Default if parsing fails
    if (verseNumStr && verseNumStr.length >= 2) {
         // Extract last two digits, assuming standard format like "BookChapVerse" (e.g., 4000101 -> 01)
         // Adjust slicing if format is different
        try {
            verseNum = parseInt(verseNumStr.slice(-2), 10);
        } catch (e) {
            console.error(`Could not parse verse number from ${verseNumStr}`);
        }
    }


    element.append('span')
        .attr('class', 'verse-number')
        .text(verseNum); // Display parsed verse number

    // Add each word
    verseWords.forEach(wordInfo => {
        if (!wordInfo || !wordInfo.pos_tag || !wordInfo.word_forms || !wordInfo.word_forms[0]) {
            console.warn("Skipping invalid wordInfo:", wordInfo);
            return; // Skip malformed word data
        }

        const wordCategory = getCategory(wordInfo.pos_tag); // Assumes getCategory exists
        let shouldHighlight = false;

        if (category && wordCategory === category) {
            if (!attribute || !value) {
                // Highlight based on category only
                shouldHighlight = true;
            } else {
                // Highlight based on specific attribute and value
                const wordAttributes = getAttributesForCategory(wordCategory, wordInfo.pos_tag);
                const attrKey = attribute.toLowerCase();

                if (wordAttributes && wordAttributes.hasOwnProperty(attrKey)) {
                    const wordAttrValue = wordAttributes[attrKey];

                    // Special case: Verb Participle + case/number/gender filter
                    if (category === 'Verb' && wordAttributes.mood === 'P' && // Check if word is a participle
                        (attrKey === 'case' || attrKey === 'number' || attrKey === 'gender')) {
                        // Compare the word's attribute value (code) with the filter value (which might be code or display name)
                        // We need to potentially convert filter `value` back to code if it's a display name
                        const filterOptions = getFilterOptionsForCategory(category, attribute);
                        let filterCode = value; // Assume value is code initially
                        if (filterOptions && !filterOptions[value]) { // If value is not a direct key (code)
                            // Try finding the code corresponding to the display name `value`
                            const foundCode = Object.keys(filterOptions).find(code => filterOptions[code] === value);
                            if (foundCode) {
                                filterCode = foundCode;
                            }
                        }
                        if (wordAttrValue === filterCode) {
                            shouldHighlight = true;
                        }
                    }
                    // Special handling for conjunction subtypes (value should be the subtype code/name)
                    else if (category === 'Conjunction' && attrKey === 'subtype') {
                        // Direct comparison assumes 'value' is the correct subtype identifier expected in wordAttributes.subtype
                        if (wordAttrValue === value) {
                            shouldHighlight = true;
                        }
                    }
                    // General case: Compare word's attribute value with filter value
                    else {
                        // Similar logic as Verb Participle case: check if filter `value` needs conversion from display name to code
                        const filterOptions = getFilterOptionsForCategory(category, attribute);
                        let filterCode = value; // Assume value is code initially
                        if (filterOptions && !filterOptions[value]) { // If value is not a direct key (code)
                            const foundCode = Object.keys(filterOptions).find(code => filterOptions[code] === value);
                            if (foundCode) {
                                filterCode = foundCode;
                            }
                        }
                         if (wordAttrValue === filterCode) {
                            shouldHighlight = true;
                        }
                    }
                } else if (category === 'Interjection' || category === 'Preposition') {
                    // These might not have specific attributes to filter by, highlight if category matches
                    shouldHighlight = true;
                }
            }
        }

        // Create word span
        const wordSpan = element.append('span')
            .attr('class', shouldHighlight ? 'word highlighted' : 'word')
            .text(wordInfo.word_forms[0]); // Don't add space to the word itself
            
        // Add space after word (outside the highlighted span)
        element.append('span')
            .text(' ');

        // Store word info and add click listener for tooltip
        wordSpan.datum(wordInfo)
            .on('click', function(event) {
                event.stopPropagation(); // Prevent triggering body click listener immediately
                const wordData = d3.select(this).datum();
                if (wordData) {
                    showTooltip(event, wordData);
                }
            });
    });
}


/**
 * Logs attribute and value details for debugging purposes.
 */
function logAttributeDetails() {
    // console.log('Current Category:', currentCategory); // Assumes global currentCategory
    // console.log('Current View:', currentView); // Assumes global currentView
    // console.log('Current Filter:', displayedCategoryFilter); // Uses global displayedCategoryFilter

    if (displayedCategoryFilter) {
        const { category, attribute, value } = displayedCategoryFilter;
        // console.log(`Filtering by ${category} with ${attribute}: ${value}`);

        // Log the filter options for this category/attribute using the helper
        if (category && attribute) {
            const options = getFilterOptionsForCategory(category, attribute);
            // console.log('Filter Options:', options || 'Not applicable or not found');
        }
    }
}

// --- Tooltip Functionality ---

// Create tooltip element (run once on script load)
const tooltipElement = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip')
    .node(); // Get the raw DOM node

/**
 * Shows tooltip with word information.
 * @param {Event} event - The click event.
 * @param {object} wordInfo - The word data object.
 */
function showTooltip(event, wordInfo) {
    // Ensure tooltipElement exists
    if (!tooltipElement) return;

    // Hide any existing tooltips before showing a new one
    tooltipElement.classList.remove('visible');

    // Basic validation for wordInfo
    if (!wordInfo || typeof wordInfo !== 'object') {
        console.error("Invalid wordInfo provided to showTooltip");
        return;
    }

    // Extract necessary information, providing defaults
    const gloss = wordInfo.gloss || 'No gloss available';
    const literal = wordInfo.literal || 'No literal available';
    const louw = wordInfo.louw || 'N/A';
    const strong = wordInfo.strong || 'N/A';
    const lemma = (wordInfo.word_forms && wordInfo.word_forms[3]) ? wordInfo.word_forms[3] : 'N/A';
    const posTag = interpretPosTag(wordInfo.pos_tag); // Already handles missing tag

    // Build the tooltip content
    tooltipElement.innerHTML = `
        <div class="tooltip-header">
            <span class="tooltip-lemma"><strong>${lemma}</strong></span>
            <span class="tooltip-close"><button type="button" class="close-button">&times;</button></span>
        </div>
        <div class="tooltip-content">
            <div class="tooltip-gloss"><strong>Gloss:</strong> ${gloss}</div>
            <div class="tooltip-literal"><strong>Literal:</strong> ${literal}</div>
            <div class="tooltip-pos-tag"><strong>Part of Speech:</strong> ${posTag}</div>
            <div class="tooltip-louw"><strong>Louw-Nida:</strong> ${louw}</div>
            <div class="tooltip-strong"><strong>Strong's:</strong> ${strong}</div>
        </div>
    `;

    // Add close button functionality within the tooltip
    const closeButton = tooltipElement.querySelector('.close-button');
    if (closeButton) {
        closeButton.onclick = hideTooltip; // Assign the hide function directly
    }


    // Positioning logic (remains largely the same, added minor safety checks)
    const targetElement = event.target;
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Mobile handling: Fixed to the bottom
    if (viewportWidth <= 768) {
        tooltipElement.style.position = 'fixed';
        tooltipElement.style.top = 'auto';
        tooltipElement.style.left = '0';
        tooltipElement.style.right = '0';
        tooltipElement.style.bottom = '0';
        tooltipElement.style.width = '100%';
        tooltipElement.style.transform = 'none'; // Reset any potential transform
    } else {
        // Desktop handling: Position near the word
        tooltipElement.style.position = 'absolute';
        tooltipElement.style.width = 'auto'; // Reset width for desktop
        tooltipElement.style.bottom = 'auto'; // Reset bottom for desktop
        tooltipElement.style.right = 'auto'; // Reset right for desktop

        // Initial position below the word
        let top = rect.bottom + window.scrollY + 5;
        let left = rect.left + window.scrollX;

        tooltipElement.style.top = `${top}px`;
        tooltipElement.style.left = `${left}px`;

        // Use requestAnimationFrame to ensure layout is calculated before checking bounds
        requestAnimationFrame(() => {
            if (!tooltipElement.classList.contains('visible')) return; // Check if still visible

            const tooltipHeight = tooltipElement.offsetHeight;
            const tooltipWidth = tooltipElement.offsetWidth;

            // Check vertical overflow
            if (rect.bottom + tooltipHeight > viewportHeight) {
                // Position above if not enough space below
                top = rect.top + window.scrollY - tooltipHeight - 5;
            }

            // Check horizontal overflow
            if (rect.left + tooltipWidth > viewportWidth) {
                // Shift left if overflowing right
                left = viewportWidth - tooltipWidth - 10; // Add some padding
            }

            // Prevent going off left edge
            if (left < window.scrollX) {
                left = window.scrollX + 10;
            }

             // Prevent going off top edge
            if (top < window.scrollY) {
                top = window.scrollY + 10;
            }


            tooltipElement.style.top = `${Math.max(0, top)}px`; // Ensure top is not negative
            tooltipElement.style.left = `${Math.max(0, left)}px`; // Ensure left is not negative
        });
    }

    // Make the tooltip visible after positioning calculation starts
    tooltipElement.classList.add('visible');
}

/**
 * Hides the tooltip element.
 * @param {Event} event - The event that triggered the hiding (optional).
 */
function hideTooltip(event) {
    // event might be undefined if called directly (e.g., by close button)
    if (event) {
        event.preventDefault();
        event.stopPropagation(); // Prevent potential conflicts
    }
    if (tooltipElement) {
        tooltipElement.classList.remove('visible');
        tooltipElement.innerHTML = ''; // Clear content when hiding
    }
}

// --- POS Tag Interpretation ---

/**
 * Interprets a POS tag and returns a human-readable description.
 * @param {string} posTag - The POS tag to interpret.
 * @returns {string} Human-readable description of the POS tag.
 */
function interpretPosTag(posTag) {
    if (!posTag || typeof posTag !== 'string' || posTag.length === 0) return 'No POS data available';

    const partOfSpeechCode = posTag.charAt(0);
    const details = posTag.slice(1); // Can be empty

    let posDescription;
    let additionalInfo = '';

    switch (partOfSpeechCode) {
        case 'N': // Noun
            posDescription = 'Noun';
            additionalInfo = interpretCaseNumberGender(details);
            break;
        case 'V': // Verb
            posDescription = 'Verb';
            additionalInfo = interpretVerbDetails(details);
            break;
        case 'J': // Adjective
            posDescription = 'Adjective';
            additionalInfo = interpretAdjectiveDetails(details);
            break;
        case 'R': // Pronoun
            posDescription = 'Pronoun';
            additionalInfo = interpretPronounDetails(details);
            break;
        case 'D': // Definite article
            posDescription = 'Definite Article';
            additionalInfo = interpretCaseNumberGender(details);
            break;
        case 'C': // Conjunction
            posDescription = 'Conjunction';
            additionalInfo = interpretConjunctionDetails(details);
            break;
        case 'B': // Adverb
            posDescription = 'Adverb';
            additionalInfo = interpretAdverbDetails(details);
            break;
        case 'T': // Particle
            posDescription = 'Particle';
            // Particles often share codes with Adverbs in some schemes
            additionalInfo = interpretParticleDetails(details); // Reuse or specific logic
            break;
        case 'P': // Preposition
            posDescription = 'Preposition';
            // No details expected typically
            break;
        case 'I': // Interjection
            posDescription = 'Interjection';
            // No details expected typically
            break;
        case 'X': // Indeclinable
            posDescription = 'Indeclinable';
            additionalInfo = interpretIndeclinableDetails(details);
            break;
        default:
            posDescription = `Unknown POS Code: ${partOfSpeechCode}`;
    }

    return `${posDescription}${additionalInfo ? ' - ' + additionalInfo : ''}`;
}

// --- Helper Functions for POS Tag Interpretation ---

/**
 * Interprets case, number, and gender codes from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted case, number, and gender description.
 */
function interpretCaseNumberGender(details) {
    if (!details || details.length < 3) return ''; // Need at least 3 chars normally
    const caseMap = {'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative'};
    const numberMap = {'S': 'Singular', 'P': 'Plural', 'D': 'Dual'}; // Dual is rare in NT Greek
    const genderMap = {'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter'};

    const caseValue = caseMap[details.charAt(0)] || '';
    const numberValue = numberMap[details.charAt(1)] || '';
    const genderValue = genderMap[details.charAt(2)] || '';

    return [caseValue, numberValue, genderValue].filter(Boolean).join(', ');
}

/**
 * Interprets verb details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted verb attributes description.
 */
function interpretVerbDetails(details) {
     if (!details || details.length < 3) return ''; // Need at least Tense, Voice, Mood
    const tenseMap = {
        'P': 'Present', 'I': 'Imperfect', 'F': 'Future', 'T': 'Future-perfect', // T is rare
        'A': 'Aorist', 'R': 'Perfect', 'L': 'Pluperfect'
    };
    const voiceMap = {'A': 'Active', 'M': 'Middle', 'P': 'Passive', 'U': 'Middle-Passive'}; // U might be custom
    const moodMap = {
        'I': 'Indicative', 'S': 'Subjunctive', 'O': 'Optative',
        'M': 'Imperative', 'N': 'Infinitive', 'P': 'Participle'
    };
    // Person/Number only apply to finite moods (Indicative, Subjunctive, Optative, Imperative)
    const personMap = {'1': '1st Person', '2': '2nd Person', '3': '3rd Person'};
    const numberMap = {'S': 'Singular', 'P': 'Plural', 'D': 'Dual'}; // Dual is rare

    const tense = tenseMap[details.charAt(0)] || '';
    const voice = voiceMap[details.charAt(1)] || '';
    const mood = moodMap[details.charAt(2)] || '';

    let person = '';
    let number = '';
    let caseNumberGender = ''; // Only for Participles

    if ('ISOM'.includes(details.charAt(2)) && details.length >= 5) { // Finite verbs
        person = personMap[details.charAt(3)] || '';
        number = numberMap[details.charAt(4)] || '';
    } else if (details.charAt(2) === 'P' && details.length > 3) { // Participles have CNG
        // Assuming Participle details format V-P[CNG] e.g., V-PASNMS (Aorist Passive Participle Nom Masc Sing)
        // The CNG part starts after the mood 'P'
        caseNumberGender = interpretCaseNumberGender(details.slice(3));
    }
    // Infinitive ('N') has no person/number/CNG

    return [tense, voice, mood, person, number, caseNumberGender].filter(Boolean).join(', ');
}

/**
 * Interprets adjective details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted adjective attributes description.
 */
function interpretAdjectiveDetails(details) {
    if (!details || details.length < 3) return ''; // Need at least CNG
    const caseNumberGender = interpretCaseNumberGender(details.slice(0, 3));
    const degreeMap = {'C': 'Comparative', 'S': 'Superlative', 'O': 'Other'}; // O might be custom

    // Degree is often the 4th char if present
    const degree = details.length > 3 ? (degreeMap[details.charAt(3)] || '') : '';

    return [caseNumberGender, degree].filter(Boolean).join(', ');
}

/**
 * Interprets pronoun details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted pronoun attributes description.
 */
function interpretPronounDetails(details) {
    if (!details || details.length < 1) return '';
    const pronounTypeMap = {
        'R': 'Relative', 'C': 'Reciprocal', 'D': 'Demonstrative', 'K': 'Correlative',
        'I': 'Interrogative', 'X': 'Indefinite', 'F': 'Reflexive', 'S': 'Possessive', 'P': 'Personal'
    };
    // Subtype might apply to specific types like Demonstrative Intensive ('A'/'P')
    const pronounSubtypeMap = {'A': 'Intensive Attributive', 'P': 'Intensive Predicative'};

    const pronounType = pronounTypeMap[details.charAt(0)] || '';
    // Person (1, 2, 3) is often the second char for Personal, Reflexive, Possessive
    const person = (details.length > 1 && '123'.includes(details.charAt(1))) ? `${details.charAt(1)}${details.charAt(1) === '1' ? 'st' : details.charAt(1) === '2' ? 'nd' : 'rd'} Person` : '';

    // CNG usually follows Type or Type+Person
    const cngStartIndex = person ? 2 : 1;
    const caseNumberGender = details.length > cngStartIndex + 2 ? interpretCaseNumberGender(details.slice(cngStartIndex, cngStartIndex + 3)) : '';

    // Subtype might be after CNG (e.g., 6th char)
    const subtypeIndex = cngStartIndex + 3;
    const pronounSubtype = details.length > subtypeIndex ? (pronounSubtypeMap[details.charAt(subtypeIndex)] || '') : '';


    return [pronounType, person, caseNumberGender, pronounSubtype].filter(Boolean).join(', ');
}

/**
 * Interprets conjunction details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted conjunction attributes description.
 */
function interpretConjunctionDetails(details) {
    if (!details || details.length < 1) return '';
    // These maps seem specific to a particular tagging scheme. Ensure they match the data source.
    const conjunctionTypeMap = {'L': 'Logical', 'A': 'Adverbial', 'S': 'Substantival'};

    const logicalSubtypeMap = {
        'A': 'Ascensive', 'N': 'Connective', 'C': 'Contrastive', 'K': 'Correlative',
        'D': 'Disjunctive', 'M': 'Emphatic', 'X': 'Explanatory', 'I': 'Inferential',
        'T': 'Transitional'
    };
    const adverbialSubtypeMap = {
        'Z': 'Causal', 'M': 'Comparative', 'N': 'Concessive', 'C': 'Conditional',
        'D': 'Declarative', 'L': 'Local', 'P': 'Purpose', 'R': 'Result', 'T': 'Temporal'
    };
    const substantivalSubtypeMap = {'C': 'Content', 'E': 'Epexegetical'};

    const conjunctionType = conjunctionTypeMap[details.charAt(0)] || '';
    let conjunctionSubtype = '';

    if (details.length > 1) {
        const subtypeCode = details.charAt(1);
        if (conjunctionType === 'Logical') {
            conjunctionSubtype = logicalSubtypeMap[subtypeCode] || '';
        } else if (conjunctionType === 'Adverbial') {
            conjunctionSubtype = adverbialSubtypeMap[subtypeCode] || '';
        } else if (conjunctionType === 'Substantival') {
            conjunctionSubtype = substantivalSubtypeMap[subtypeCode] || '';
        }
    }

    return [conjunctionType, conjunctionSubtype].filter(Boolean).join(', ');
}

/**
 * Interprets adverb details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted adverb attributes description.
 */
function interpretAdverbDetails(details) {
     if (!details || details.length < 1) return '';
    // Adverb types/subtypes can vary greatly by scheme. This map might need adjustment.
    const adverbTypeMap = {
        'C': 'Conditional', 'K': 'Correlative', 'E': 'Emphatic', 'X': 'Indefinite',
        'I': 'Interrogative', 'N': 'Negative', 'P': 'Place', 'S': 'Superlative',
        'T': 'Temporal' // Added Temporal as common adverb type
    };

    return adverbTypeMap[details.charAt(0)] || '';
}

/**
 * Interprets particle details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted particle attributes description.
 */
function interpretParticleDetails(details) {
    // Particles often overlap with adverbs or have their own codes.
    // Reusing adverb logic might be okay, or a specific map might be needed.
    // Example: 'N' for Negative particle (οὐ, μή) might be coded 'T-N' or 'B-N'
    // For now, let's assume it might share codes with adverbs or have none.
    if (!details || details.length < 1) return '';
    // Example specific map (adjust based on actual data)
    const particleTypeMap = {
        'I': 'Interrogative', 'N': 'Negative', 'E': 'Emphatic', 'C': 'Connective'
    };
    return particleTypeMap[details.charAt(0)] || interpretAdverbDetails(details); // Fallback or combine
}

/**
 * Interprets indeclinable details from POS tag details.
 * @param {string} details - The details portion of the POS tag.
 * @returns {string} Formatted indeclinable attributes description.
 */
function interpretIndeclinableDetails(details) {
    if (!details || details.length < 1) return '';
    const indeclinableTypeMap = {
        'L': 'Letter', 'P': 'Proper Noun', 'N': 'Numeral',
        'F': 'Foreign Word', 'O': 'Other/Unclassified'
    };
    return indeclinableTypeMap[details.charAt(0)] || '';
}


// --- Global Event Listeners ---

// Hide tooltip when clicking outside of it or a word
document.addEventListener('click', (event) => {
    if (tooltipElement && tooltipElement.classList.contains('visible')) {
        // Check if the click was outside the tooltip and not on a word span
        if (!tooltipElement.contains(event.target) && !event.target.closest('.word')) {
            hideTooltip();
        }
    }
});

// Hide tooltip on scroll
window.addEventListener('scroll', () => {
    // Only hide if it's currently visible to avoid unnecessary checks
    if (tooltipElement && tooltipElement.classList.contains('visible')) {
        hideTooltip();
    }
}, true); // Use capture phase to catch scroll early

// Handle touch events for mobile (optional: click listener might suffice)
// If keeping, ensure it doesn't conflict with word click/tap
document.addEventListener('touchstart', (event) => {
    if (tooltipElement && tooltipElement.classList.contains('visible')) {
        if (!tooltipElement.contains(event.target) && !event.target.closest('.word')) {
            hideTooltip();
        }
    }
}, { passive: true }); // Use passive listener for performance 