// Category and attribute functions for Greek NT Visualization

// Category definitions and filter options
const categories = ["Noun", "Verb", "Adjective", "Pronoun", "Article", "Preposition", "Conjunction", "Adverb", "Particle", "Interjection", "Indeclinable"];

const verbFilterOptions = {
    tense: { 'P': 'Present', 'I': 'Imperfect', 'F': 'Future', 'T': 'Future-perfect', 'A': 'Aorist', 'R': 'Perfect', 'L': 'Pluperfect' },
    voice: { 'A': 'Active', 'M': 'Middle', 'P': 'Passive', 'U': 'Middle-Passive' },
    mood: { 'I': 'Indicative', 'S': 'Subjunctive', 'O': 'Optative', 'M': 'Imperative', 'N': 'Infinitive', 'P': 'Participle' },
    person: { '1': '1st Person', '2': '2nd Person', '3': '3rd Person' },
    number: { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' }
};

const nounFilterOptions = {
    case: { 'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative' },
    number: { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' },
    gender: { 'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter' }
};

const adjectiveFilterOptions = {
    case: { 'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative' },
    number: { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' },
    gender: { 'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter' },
    degree: { 'C': 'Comparative', 'S': 'Superlative', 'O': 'Other' }
};

const pronounFilterOptions = {
    type: { 'R': 'Relative', 'C': 'Reciprocal', 'D': 'Demonstrative', 'K': 'Correlative', 'I': 'Interrogative', 
            'X': 'Indefinite', 'F': 'Reflexive', 'S': 'Possessive', 'P': 'Personal' },
    person: { '1': '1st Person', '2': '2nd Person', '3': '3rd Person' },
    case: { 'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative' },
    number: { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' },
    gender: { 'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter' },
    subtype: { 'A': 'Intensive Attributive', 'P': 'Intensive Predicative' }
};

const conjunctionFilterOptions = {
    type: {
        'L': {
            name: 'Logical',
            subtypes: {
                'A': 'Ascensive',
                'N': 'Connective',
                'C': 'Contrastive',
                'K': 'Correlative',
                'D': 'Disjunctive',
                'M': 'Emphatic',
                'X': 'Explanatory',
                'I': 'Inferential',
                'T': 'Transitional'
            }
        },
        'A': {
            name: 'Adverbial',
            subtypes: {
                'Z': 'Causal',
                'M': 'Comparative',
                'N': 'Concessive',
                'C': 'Conditional',
                'D': 'Declarative',
                'L': 'Local',
                'P': 'Purpose',
                'R': 'Result',
                'T': 'Temporal'
            }
        },
        'S': {
            name: 'Substantival',
            subtypes: {
                'C': 'Content',
                'E': 'Epexegetical'
            }
        }
    }
};

const articleFilterOptions = {
    case: { 'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative' },
    number: { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' },
    gender: { 'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter' }
};

const adverbFilterOptions = {
    type: { 
        'C': 'Conditional',
        'K': 'Correlative',
        'E': 'Emphatic',
        'X': 'Indefinite',
        'I': 'Interrogative',
        'N': 'Negative',
        'P': 'Place',
        'S': 'Superlative'
    }
};

const particleFilterOptions = {
    type: { 
        'C': 'Conditional',
        'K': 'Correlative',
        'E': 'Emphatic',
        'X': 'Indefinite',
        'I': 'Interrogative',
        'N': 'Negative',
        'P': 'Place',
        'S': 'Superlative'
    }
};

const indeclinableFilterOptions = {
    type: {
        'L': 'Letter',
        'P': 'Proper Noun',
        'N': 'Numeral',
        'F': 'Foreign Word',
        'O': 'Other'
    }
};

// Functions for getting word categories and attributes
function getCategory(posTag) {
    if (!posTag) return null;
    let tag = posTag.split(",")[0].trim();
    if (tag.startsWith("N")) return "Noun";
    if (tag.startsWith("V")) return "Verb";
    if (tag.startsWith("C")) return "Conjunction";
    if (tag.startsWith("P")) return "Preposition";
    if (tag.startsWith("J") || tag.startsWith("A")) return "Adjective";
    if (tag.startsWith("R")) return "Pronoun";
    if (tag.startsWith("D")) return "Article";
    if (tag.startsWith("B")) return "Adverb";
    if (tag.startsWith("T")) return "Particle";
    if (tag.startsWith("I")) return "Interjection";
    if (tag.startsWith("X")) return "Indeclinable";
    return null;
}

function getVerbAttributes(posTag) {
    if (!posTag || !posTag.startsWith("V")) {
        return { tense: '', voice: '', mood: '', person: '', number: '', case: '', gender: '' };
    }
    const tag = posTag.split(",")[0].trim();
    const details = tag.slice(1);

    const tenseCode = details.charAt(0) || '';
    const voiceCode = details.charAt(1) || '';
    const moodCode = details.charAt(2) || '';
    const personCode = details.charAt(3) || '';
    const numberCode = details.charAt(4) || '';

    let caseCode = '';
    let genderCode = '';
    if (moodCode === 'P' && details.length > 5) {
        caseCode = details.charAt(5) || '';
        genderCode = details.charAt(6) || '';
    }

    return {
        tense: tenseCode,
        voice: voiceCode,
        mood: moodCode,
        person: personCode,
        number: numberCode,
        case: caseCode,
        gender: genderCode
    };
}

function getNounAttributes(posTag) {
    if (!posTag || !posTag.startsWith("N")) return { case: '', number: '', gender: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(3, '-');
    return {
        case: details.charAt(0) || '',
        number: details.charAt(1) || '',
        gender: details.charAt(2) || ''
    };
}

function getAdjectiveAttributes(posTag) {
    if (!posTag || !posTag.startsWith("J")) return { case: '', number: '', gender: '', degree: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(4, '-');
    return {
        case: details.charAt(0) || '',
        number: details.charAt(1) || '',
        gender: details.charAt(2) || '',
        degree: details.charAt(3) || ''
    };
}

function getPronounAttributes(posTag) {
    if (!posTag || !posTag.startsWith("R")) return { type: '', person: '', case: '', number: '', gender: '', subtype: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(6, '-');
    return {
        type: details.charAt(0) || '',
        person: details.charAt(1) || '',
        case: details.charAt(2) || '',
        number: details.charAt(3) || '',
        gender: details.charAt(4) || '',
        subtype: details.charAt(5) || ''
    };
}

function getConjunctionAttributes(posTag) {
    if (!posTag || !posTag.startsWith("C")) return { type: '', subtype: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(2, '-');
    const typeCode = details.charAt(0);
    const subtypeCode = details.charAt(1);
    
    // Get the type info
    const typeInfo = conjunctionFilterOptions.type[typeCode];
    if (!typeInfo) return { type: '', subtype: '' };
    
    // Get the subtype name if it exists
    const subtypeName = typeInfo.subtypes[subtypeCode];
    
    return {
        type: typeCode,
        subtype: typeCode + subtypeCode, // Combined code for filtering
        typeName: typeInfo.name,
        subtypeName: subtypeName || ''
    };
}

function getArticleAttributes(posTag) {
    if (!posTag || !posTag.startsWith("D")) return { case: '', number: '', gender: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(3, '-');
    return {
        case: details.charAt(0) || '',
        number: details.charAt(1) || '',
        gender: details.charAt(2) || ''
    };
}

function getAdverbAttributes(posTag) {
    if (!posTag || !posTag.startsWith("B")) return { type: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(1, '-');
    return {
        type: details.charAt(0) || ''
    };
}

function getParticleAttributes(posTag) {
    if (!posTag || !posTag.startsWith("T")) return { type: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(1, '-');
    return {
        type: details.charAt(0) || ''
    };
}

function getIndeclinableAttributes(posTag) {
    if (!posTag || !posTag.startsWith("X")) return { type: '' };
    let tag = posTag.split(",")[0].trim();
    let details = tag.slice(1).padEnd(1, '-');
    return {
        type: details.charAt(0) || ''
    };
}

function getInterjectionAttributes(posTag) {
    if (!posTag || !posTag.startsWith("I")) return { type: '' };
    return { type: 'I' }; // Interjections don't have subtypes in this dataset
}

function getPrepositionAttributes(posTag) {
    if (!posTag || !posTag.startsWith("P")) return { type: '' };
    return { type: 'P' }; // Prepositions don't have subtypes in this dataset
}

function interpretPosTag(posTag) {
    if (!posTag) return 'Unknown';
    const part = posTag.charAt(0);
    const details = posTag.slice(1);
    switch (part) {
        case 'N': return `Noun - ${interpretCaseNumberGender(details)}`;
        case 'V': return `Verb - ${interpretVerbDetails(details)}`;
        case 'C': return `Conjunction - ${details}`;
        case 'P': return 'Preposition';
        case 'J': return `Adjective - ${interpretCaseNumberGender(details)}`;
        case 'R': return `Pronoun - ${details}`;
        default: return `${part} - ${details}`;
    }
}

function interpretCaseNumberGender(details) {
    const caseMap = {'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative'};
    const numberMap = {'S': 'Singular', 'P': 'Plural', 'D': 'Dual'};
    const genderMap = {'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter'};
    return `${caseMap[details.charAt(0)] || 'Unknown'}, ${numberMap[details.charAt(1)] || 'Unknown'}, ${genderMap[details.charAt(2)] || 'Unknown'}`;
}

function interpretVerbDetails(details) {
    const tenseMap = verbFilterOptions.tense;
    const voiceMap = verbFilterOptions.voice;
    const moodMap = verbFilterOptions.mood;
    const personMap = { '1': '1st Person', '2': '2nd Person', '3': '3rd Person' };
    const numberMap = { 'S': 'Singular', 'P': 'Plural', 'D': 'Dual' };
    const caseMap = { 'N': 'Nominative', 'G': 'Genitive', 'D': 'Dative', 'A': 'Accusative', 'V': 'Vocative' };
    const genderMap = { 'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter' };

    let tense = '', voice = '', mood = '', person = '', number = '', caseValue = '', gender = '';

    // Parse the first 5 characters (core verb attributes)
    if (details.length >= 1) tense = tenseMap[details.charAt(0)] || '';
    if (details.length >= 2) voice = voiceMap[details.charAt(1)] || '';
    if (details.length >= 3) mood = moodMap[details.charAt(2)] || '';
    if (details.length >= 4) person = personMap[details.charAt(3)] || '';
    if (details.length >= 5) number = numberMap[details.charAt(4)] || '';

    // Handle participles (optional case and gender, starting from position 6)
    if (mood === 'Participle' && details.length > 5) {
        if (details.length >= 6) caseValue = caseMap[details.charAt(5)] || '';
        if (details.length >= 7) gender = genderMap[details.charAt(6)] || '';
    }

    // Return the simplified output, removing empty values
    return [tense, voice, mood, person, number, caseValue, gender].filter(Boolean).join(', ');
} 