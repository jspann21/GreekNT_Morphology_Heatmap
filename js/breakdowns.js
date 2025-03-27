// --- Helper Functions ---

/**
 * Creates the standard header section for breakdown views.
 * @param {d3.Selection} container - The D3 selection of the container element.
 * @param {string} title - The title for the header.
 * @param {function} backButtonHandler - The function to call when the back button is clicked.
 * @returns {d3.Selection} The created header section.
 */
function _createBreakdownHeader(container, title, backButtonHandler) {
    const headerSection = container.append('div')
        .attr('class', 'header-section');

    headerSection.append('h2')
        .text(title);

    headerSection.append('button')
        .attr('class', 'back-button')
        .text('Back to Overview')
        .on('click', backButtonHandler);

    return headerSection;
}

/**
 * Creates the container div for the heatmap plot.
 * @param {d3.Selection} container - The D3 selection of the container element.
 * @returns {d3.Selection} The created heatmap div.
 */
function _createHeatmapContainer(container) {
    return container.append('div')
        .attr('id', 'heatmapDiv');
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str The input string.
 * @returns {string} The capitalized string.
 */
function _capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Generic Dispatcher ---

/**
 * Main dispatcher function to show the correct breakdown view based on category.
 * @param {string} category - The part-of-speech category (e.g., 'Verb', 'Noun').
 */
function showGenericBreakdown(category) {
    // Define configurations for categories with multiple attributes
    const multiAttributeConfigs = {
        'Verb': { filterOptions: verbFilterOptions, getAttributesFn: getVerbAttributes, defaultAttribute: 'tense' },
        'Noun': { filterOptions: nounFilterOptions, getAttributesFn: getNounAttributes, defaultAttribute: 'case' },
        'Adjective': { filterOptions: adjectiveFilterOptions, getAttributesFn: getAdjectiveAttributes, defaultAttribute: 'case' },
        'Pronoun': { filterOptions: pronounFilterOptions, getAttributesFn: getPronounAttributes, defaultAttribute: 'type' },
        'Article': { filterOptions: articleFilterOptions, getAttributesFn: getArticleAttributes, defaultAttribute: 'case' },
    };

    // Define configurations for categories with a single 'type' attribute
    const singleAttributeConfigs = {
        'Adverb': { filterOptions: adverbFilterOptions, getAttributesFn: getAdverbAttributes },
        'Particle': { filterOptions: particleFilterOptions, getAttributesFn: getParticleAttributes },
        'Indeclinable': { filterOptions: indeclinableFilterOptions, getAttributesFn: getIndeclinableAttributes },
    };

    if (multiAttributeConfigs[category]) {
        const config = multiAttributeConfigs[category];
        showAttributeBasedBreakdown(
            category,
            config.filterOptions,
            config.getAttributesFn,
            config.defaultAttribute
        );
    } else if (category === 'Conjunction') {
        showConjunctionBreakdown(); // Conjunctions have a unique structure
    } else if (singleAttributeConfigs[category]) {
        const config = singleAttributeConfigs[category];
        showSingleAttributeBreakdown(
            category,
            config.filterOptions,
            config.getAttributesFn
        );
    } else if (category === 'Interjection' || category === 'Preposition') {
        showSimpleFrequencyBreakdown(category); // Categories with simple frequency count
    } else {
        console.error(`Unknown or unsupported category for breakdown: ${category}`);
        // Optionally display an error message to the user
        d3.select("#heatmapContainer").html(
            `<div class="header-section"><h2>Error</h2></div>
             <p>Breakdown view for category "${category}" is not available.</p>`
        );
    }
}

// --- Simple Frequency Breakdown (Interjection, Preposition) ---

/**
 * Shows a simple frequency heatmap for categories without detailed attributes.
 * @param {string} category - The part-of-speech category.
 */
function showSimpleFrequencyBreakdown(category) {
    currentView = 'breakdown';
    currentCategory = category;
    const container = d3.select("#heatmapContainer").html('');

    _createBreakdownHeader(container, `${currentBookName} - ${category} Frequency`, drawOverviewHeatmap);
    const heatmapDiv = _createHeatmapContainer(container);

    // Basic error check for currentBookData
    if (!currentBookData || typeof currentBookData !== 'object') {
        console.error("currentBookData is not available or invalid.");
        heatmapDiv.text("Error: Book data not loaded.");
        return;
    }

    const chapters = Object.keys(currentBookData).sort((a, b) => +a - +b).map(String);
    const zData = [chapters.map(chap => {
        let count = 0;
        // Handle cases where a chapter might be missing or empty
        if (!currentBookData[chap] || typeof currentBookData[chap] !== 'object') return 0;
        try {
            for (const verse in currentBookData[chap]) {
                // Ensure verse data is an array
                if (Array.isArray(currentBookData[chap][verse])) {
                    currentBookData[chap][verse].forEach(word => {
                        // Basic check on word structure
                        if (word && word.pos_tag && getCategory(word.pos_tag) === category) {
                            count++;
                        }
                    });
                }
            }
        } catch (error) {
            console.error(`Error processing chapter ${chap} for category ${category}:`, error);
            // Return NaN or some indicator of error for this chapter's count
            return NaN;
        }
        return count;
    })];

    // Validate zData before plotting
    if (zData[0].some(val => val == null || isNaN(val))) {
         console.error(`Invalid count data generated for ${category}:`, zData[0]);
         heatmapDiv.text(`Error: Could not generate valid frequency data for ${category}.`);
         return;
    }

    plotHeatmap(chapters, [category], zData, `${currentBookName} - ${category} Frequency`, 300);

    // Add specific click handler for simple frequency heatmap
    const heatmapElement = document.getElementById('heatmapDiv');
    if (heatmapElement) {
        heatmapElement.on('plotly_click', function(data) {
            if (data.points && data.points.length > 0) {
                const point = data.points[0];
                const chapter = point.x;
                // Display chapter text with all words of this category highlighted
                displayChapterText(chapter, category, null, null);
            }
        });
    } else {
        console.error("Heatmap container 'heatmapDiv' not found after plotting.");
    }

    maybeStartBreakdownTutorial();
}


// --- Single Attribute Breakdown (Adverb, Particle, Indeclinable) ---

/**
 * Shows a breakdown heatmap based on a single 'type' attribute.
 * @param {string} category - The part-of-speech category.
 * @param {object} filterOptions - The filter options object (expected to have a 'type' key).
 * @param {function} getAttributesFn - Function to get attributes from a pos_tag.
 */
function showSingleAttributeBreakdown(category, filterOptions, getAttributesFn) {
    currentView = 'breakdown';
    currentCategory = category;
    const container = d3.select("#heatmapContainer").html('');

    _createBreakdownHeader(container, `${currentBookName} - ${category} Breakdown`, drawOverviewHeatmap);
    const heatmapDiv = _createHeatmapContainer(container);

    // Basic error check for dependencies
    if (!currentBookData || !filterOptions || typeof filterOptions.type !== 'object' || !getAttributesFn) {
        console.error(`Missing dependencies for showSingleAttributeBreakdown: category=${category}`);
        heatmapDiv.text("Error: Configuration or data missing for this breakdown.");
        return;
    }

    const typeOptions = filterOptions.type;
    const selectedCodes = Object.keys(typeOptions);

    if (selectedCodes.length === 0) {
        heatmapDiv.append('div')
            .attr('id', 'errorMessage')
            .text('No type options available for this category.');
        return;
    }

    const chapters = Object.keys(currentBookData).sort((a, b) => +a - +b).map(String);
    const subCategories = selectedCodes.map(code => typeOptions[code] || `Unknown (${code})`); // Labels for Y-axis

    const zData = subCategories.map((_, subIdx) => {
        const code = selectedCodes[subIdx];
        return chapters.map(chap => {
            let count = 0;
            if (!currentBookData[chap] || typeof currentBookData[chap] !== 'object') return 0;
            try {
                for (const verse in currentBookData[chap]) {
                    if (Array.isArray(currentBookData[chap][verse])) {
                        currentBookData[chap][verse].forEach(word => {
                            if (word && word.pos_tag && getCategory(word.pos_tag) === category) {
                                const attrs = getAttributesFn(word.pos_tag);
                                // Ensure attributes are valid and check the type
                                if (attrs && attrs.type === code) {
                                    count++;
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing chapter ${chap} for ${category} type ${code}:`, error);
                return NaN; // Indicate error for this cell
            }
            return count;
        });
    });

    // Validate zData
     const zFlat = zData.flat();
    if (zFlat.some(val => val == null || isNaN(val))) {
        console.error(`Invalid zData values found for ${category}:`, zFlat.filter(val => val == null || isNaN(val)));
        heatmapDiv.text(`Error: Could not calculate valid data for ${category} breakdown.`);
        return;
    }

    plotHeatmap(chapters, subCategories, zData, `${currentBookName} - ${category} Types`);

    // Add click handler for the heatmap
    const heatmapElement = document.getElementById('heatmapDiv');
    if (heatmapElement) {
        heatmapElement.on('plotly_click', function(data) {
            if (data.points && data.points.length > 0) {
                const point = data.points[0];
                const chapter = point.x;
                const subCategoryLabel = point.y; // The display name (e.g., 'Temporal')

                // Find the code corresponding to the clicked label
                const codeIndex = subCategories.indexOf(subCategoryLabel);
                const code = codeIndex !== -1 ? selectedCodes[codeIndex] : null;

                if (code) {
                    // Display chapter text with this type highlighted
                    displayChapterText(chapter, category, 'type', code);
                } else {
                    console.warn(`Could not find code for label "${subCategoryLabel}" in category ${category}`);
                }
            }
        });
    } else {
         console.error("Heatmap container 'heatmapDiv' not found after plotting.");
    }

    maybeStartBreakdownTutorial();
}


// --- Multi-Attribute Breakdown (Verb, Noun, Adjective, Pronoun, Article) ---

/**
 * Updates the heatmap for categories with multiple selectable attributes.
 * @param {string} category - The part-of-speech category.
 * @param {object} filterOptions - The filter options object for this category.
 * @param {function} getAttributesFn - Function to get attributes from a pos_tag.
 * @param {string} selectedAttribute - The attribute currently selected in the dropdown (e.g., 'tense', 'case').
 */
function updateAttributeBasedHeatmap(category, filterOptions, getAttributesFn, selectedAttribute) {
    const heatmapDiv = d3.select("#heatmapDiv");
    heatmapDiv.html(''); // Clear previous plot or error message

    // Validate inputs
    if (!currentBookData || !filterOptions || !getAttributesFn || !selectedAttribute || !filterOptions[selectedAttribute]) {
        console.error(`Invalid arguments for updateAttributeBasedHeatmap: category=${category}, attribute=${selectedAttribute}`);
        heatmapDiv.text("Error: Cannot update heatmap due to invalid configuration or data.");
        return;
    }

    const attributeKey = selectedAttribute.toLowerCase(); // e.g., 'tense', 'case'
    const attributeOptions = filterOptions[selectedAttribute]; // e.g., { 'P': 'Present', 'I': 'Imperfect', ... }
    const selectedCodes = Object.keys(attributeOptions);

    if (selectedCodes.length === 0) {
        heatmapDiv.append('div')
            .attr('id', 'errorMessage')
            .text(`No options available for attribute: ${selectedAttribute}`);
        return;
    }

    const chapters = Object.keys(currentBookData).sort((a, b) => +a - +b).map(String);
    // Ensure labels are retrieved correctly, providing a fallback
    const subCategories = selectedCodes.map(code => attributeOptions[code] || `Unknown (${code})`); // Labels for Y-axis

    const zData = subCategories.map((_, subIdx) => {
        const code = selectedCodes[subIdx]; // The code (e.g., 'P', 'N')
        return chapters.map(chap => {
            let count = 0;
            if (!currentBookData[chap] || typeof currentBookData[chap] !== 'object') return 0;
            try {
                for (const verse in currentBookData[chap]) {
                     if (Array.isArray(currentBookData[chap][verse])) {
                        currentBookData[chap][verse].forEach(word => {
                            if (word && word.pos_tag && getCategory(word.pos_tag) === category) {
                                const attrs = getAttributesFn(word.pos_tag);
                                // Check if attributes are valid and if the specific attribute matches the code
                                if (attrs && attrs[attributeKey] === code) {
                                    count++;
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                 console.error(`Error processing chapter ${chap} for ${category} ${attributeKey} ${code}:`, error);
                 return NaN; // Indicate error for this cell
            }
            return count;
        });
    });

     // Validate zData
     const zFlat = zData.flat();
     if (zFlat.some(val => val == null || isNaN(val))) {
         console.error(`Invalid zData values found for ${category} by ${selectedAttribute}:`, zFlat.filter(val => val == null || isNaN(val)));
         heatmapDiv.text(`Error: Could not calculate valid data for ${category} / ${selectedAttribute} breakdown.`);
         return;
     }

    const titleAttribute = _capitalizeFirstLetter(selectedAttribute);
    plotHeatmap(chapters, subCategories, zData, `${currentBookName} - ${category} Breakdown by ${titleAttribute}`);

    // Add generic click handler for these heatmaps
    const heatmapElement = document.getElementById('heatmapDiv');
     if (heatmapElement) {
        heatmapElement.on('plotly_click', function(data) {
             if (data.points && data.points.length > 0) {
                const point = data.points[0];
                const chapter = point.x;
                const subCategoryLabel = point.y; // The display name (e.g., 'Present', 'Nominative')

                // Find the code corresponding to the clicked label
                const codeIndex = subCategories.indexOf(subCategoryLabel);
                const code = codeIndex !== -1 ? selectedCodes[codeIndex] : null;

                if (code) {
                    // Display chapter text highlighting words with this specific attribute code
                    displayChapterText(chapter, category, attributeKey, code);
                } else {
                     console.warn(`Could not find code for label "${subCategoryLabel}" in category ${category}, attribute ${attributeKey}`);
                }
            }
        });
    } else {
         console.error("Heatmap container 'heatmapDiv' not found after plotting.");
    }
}

/**
 * Sets up the UI for categories with multiple selectable attributes.
 * @param {string} category - The part-of-speech category.
 * @param {object} filterOptions - The filter options object for this category.
 * @param {function} getAttributesFn - Function to get attributes from a pos_tag.
 * @param {string} defaultAttribute - The attribute to show by default.
 */
function showAttributeBasedBreakdown(category, filterOptions, getAttributesFn, defaultAttribute) {
    currentView = 'breakdown';
    currentCategory = category;
    const container = d3.select("#heatmapContainer").html('');

    _createBreakdownHeader(container, `${currentBookName} - ${category} Breakdown`, drawOverviewHeatmap);

    const filterPanel = container.append('div')
        .attr('id', 'filterPanel');

    filterPanel.append('label')
        .attr('for', `${category.toLowerCase()}Attribute`)
        .text('Group By:');

    const select = filterPanel.append('select')
        .attr('id', `${category.toLowerCase()}Attribute`); // e.g., verbAttribute, nounAttribute

    const attributeKeys = Object.keys(filterOptions);

    select.selectAll('option')
        .data(attributeKeys)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => _capitalizeFirstLetter(d))
        .property('selected', d => d === defaultAttribute); // Set default selection

     _createHeatmapContainer(container);

    // Initial heatmap draw with the default attribute
    updateAttributeBasedHeatmap(category, filterOptions, getAttributesFn, defaultAttribute);

    // Add event listener to update heatmap when selection changes
    select.on('change', function() {
        updateAttributeBasedHeatmap(category, filterOptions, getAttributesFn, this.value);
    });

    maybeStartBreakdownTutorial();
}


// --- Conjunction Breakdown (Special Case) ---

/**
 * Updates the heatmap specifically for Conjunctions based on selected main type.
 * @param {string} selectedType - The selected conjunction type name ('Logical', 'Adverbial', 'Substantival').
 */
function updateConjunctionHeatmap(selectedType) {
    const heatmapDiv = d3.select("#heatmapDiv");
    heatmapDiv.html(''); // Clear previous plot or error message

    // Validate inputs
    if (!currentBookData || !conjunctionFilterOptions || !conjunctionFilterOptions.type) {
        console.error("Missing dependencies for updateConjunctionHeatmap.");
        heatmapDiv.text("Error: Cannot update conjunction heatmap due to missing configuration or data.");
        return;
    }

    // Find the type code (L, A, or S) based on the selected display name
    const typeCode = Object.keys(conjunctionFilterOptions.type).find(
        code => conjunctionFilterOptions.type[code]?.name === selectedType
    );

    if (!typeCode || !conjunctionFilterOptions.type[typeCode]?.subtypes) {
        console.error(`Invalid or misconfigured conjunction type: ${selectedType}`);
         heatmapDiv.append('div')
            .attr('id', 'errorMessage')
            .text(`Configuration error for conjunction type: ${selectedType}`);
        return;
    }

    const subtypes = conjunctionFilterOptions.type[typeCode].subtypes;
    const subtypeCodes = Object.keys(subtypes);
    const subtypeNames = subtypeCodes.map(code => subtypes[code] || `Unknown (${code})`); // Labels for Y-axis

     if (subtypeCodes.length === 0) {
        heatmapDiv.append('div')
            .attr('id', 'errorMessage')
            .text(`No subtypes available for conjunction type: ${selectedType}`);
        return;
    }

    const chapters = Object.keys(currentBookData).sort((a, b) => +a - +b).map(String);

    const zData = subtypeNames.map((_, subIdx) => {
        const subtypeCode = subtypeCodes[subIdx];
        return chapters.map(chap => {
            let count = 0;
            if (!currentBookData[chap] || typeof currentBookData[chap] !== 'object') return 0;
             try {
                for (const verse in currentBookData[chap]) {
                    if (Array.isArray(currentBookData[chap][verse])) {
                        currentBookData[chap][verse].forEach(word => {
                            if (word && word.pos_tag && getCategory(word.pos_tag) === 'Conjunction') {
                                // Expected format: C[Type Code][Subtype Code][Suffix]? , ...
                                // Example: CLN, CSA
                                const tagPrefix = word.pos_tag.split(",")[0].trim().toUpperCase();
                                // Check if it's a conjunction starting with 'C', matches the type code (2nd char)
                                // and matches the subtype code (3rd char)
                                if (tagPrefix.startsWith('C') && tagPrefix.length >= 3 && tagPrefix.charAt(1) === typeCode && tagPrefix.charAt(2) === subtypeCode) {
                                    count++;
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                 console.error(`Error processing chapter ${chap} for Conjunction type ${typeCode}, subtype ${subtypeCode}:`, error);
                 return NaN; // Indicate error for this cell
            }
            return count;
        });
    });

    // Validate zData
     const zFlat = zData.flat();
     if (zFlat.some(val => val == null || isNaN(val))) {
         console.error(`Invalid zData values found for Conjunction type ${selectedType}:`, zFlat.filter(val => val == null || isNaN(val)));
         heatmapDiv.text(`Error: Could not calculate valid data for ${selectedType} conjunctions.`);
         return;
     }


    plotHeatmap(chapters, subtypeNames, zData, `${currentBookName} - ${selectedType} Conjunctions`);

    // Add click handler specific to conjunction subtypes
    const heatmapElement = document.getElementById('heatmapDiv');
    if (heatmapElement) {
        heatmapElement.on('plotly_click', function(data) {
            if (data.points && data.points.length > 0) {
                const point = data.points[0];
                const chapter = point.x;
                const subtypeName = point.y; // Label like 'Nominative', 'Accusative' etc.

                // Find the subtype code that corresponds to this name within the current type
                const subtypeIndex = subtypeNames.indexOf(subtypeName);
                const subtypeCode = subtypeIndex !== -1 ? subtypeCodes[subtypeIndex] : null;


                if (subtypeCode) {
                    // Pass the *combined* type+subtype code (e.g., 'LN', 'SA') for filtering
                    displayChapterText(chapter, 'Conjunction', 'subtype', typeCode + subtypeCode);
                } else {
                    console.warn(`Could not find subtype code for label "${subtypeName}" under type ${selectedType}`);
                }
            }
        });
    } else {
        console.error("Heatmap container 'heatmapDiv' not found after plotting.");
    }
}

/**
 * Sets up the UI specifically for the Conjunction breakdown view.
 */
function showConjunctionBreakdown() {
    currentView = 'breakdown';
    currentCategory = 'Conjunction';
    const container = d3.select("#heatmapContainer").html('');

    _createBreakdownHeader(container, `${currentBookName} - Conjunction Breakdown`, drawOverviewHeatmap);

    const filterPanel = container.append('div')
        .attr('id', 'filterPanel');

    filterPanel.append('label')
        .attr('for', 'conjunctionAttribute')
        .text('Group By Type:');

    const select = filterPanel.append('select')
        .attr('id', 'conjunctionAttribute');

    // Get type names from filterOptions to ensure consistency
    const typeNames = Object.values(conjunctionFilterOptions?.type || {})
                            .map(typeInfo => typeInfo?.name)
                            .filter(name => name); // Filter out any potential undefined/null names

    if (typeNames.length === 0) {
         console.error("Conjunction types are not defined correctly in filter options.");
         container.append('p').text("Error: Conjunction types not configured.");
         return;
    }

    select.selectAll('option')
        .data(typeNames) // Use names derived from config
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

    _createHeatmapContainer(container);

    const defaultType = typeNames[0]; // Default to the first type in the list
    updateConjunctionHeatmap(defaultType); // Start with the first type

    select.on('change', function() {
        updateConjunctionHeatmap(this.value);
    });

    maybeStartBreakdownTutorial();
}

/**
 * Common function to initialize breakdown tutorial for all breakdown views
 */
function maybeStartBreakdownTutorial() {
    // Check if the tutorial has already been shown
    if (!localStorage.getItem('breakdownTutorialShown')) {
        startBreakdownTutorial();
    }
}