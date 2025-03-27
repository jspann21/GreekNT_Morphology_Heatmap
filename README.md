# Greek New Testament Morphology Visualization

An interactive web-based visualization tool for exploring morphological patterns in the Greek New Testament. This project provides a unique way to analyze and understand the linguistic structure of the biblical text through dynamic heatmaps and detailed morphological breakdowns.

**View the page here**: [https://jspann21.github.io/GreekNT_Morphology_Heatmap/](https://jspann21.github.io/GreekNT_Morphology_Heatmap/)

## Features

- **Interactive Heatmap Visualization**: Dynamic visualization of morphological patterns across entire books of the New Testament
- **Book Navigation**: Easy selection and navigation between different books of the New Testament
- **Morphological Analysis**: Detailed breakdown of:
  - Parts of Speech
  - Person
  - Number
  - Tense
  - Voice
  - Mood
  - Case
  - Gender
- **Multiple View Modes**:
  - Overview mode showing patterns across entire books
  - Detailed chapter view for in-depth analysis
  - Paragraph mode for contextual reading
- **Responsive Design**: Fully responsive interface that works on both desktop and mobile devices
- **Interactive Tutorial**: Built-in guided tour of features for new users

## Getting Started

**View the page here**: [https://jspann21.github.io/GreekNT_Morphology_Heatmap/](https://jspann21.github.io/GreekNT_Morphology_Heatmap/)
   - No build process required
   - All dependencies are loaded via CDN

## Technical Details

### Dependencies
- D3.js (v7) for data visualization
- Plotly.js for advanced plotting capabilities
- Shepherd.js for interactive tutorials

### Project Structure
```
├── index.html          # Main application entry point
├── styles.css          # Application styling
├── js/                 # JavaScript modules
│   ├── main.js         # Core application logic
│   ├── attributes.js   # Morphological attributes handling
│   ├── heatmaps.js     # Heatmap visualization logic
│   ├── textDisplay.js  # Text rendering functions
│   ├── breakdowns.js   # Morphological analysis
│   ├── tutorials.js    # Interactive tutorial system
│   └── darkMode.js     # Dark mode theme handling
├── sblgnt_json/        # Greek text and morphological data
└── books.json          # Book index and metadata
```

## Usage

1. Select a book from the dropdown menu at the top of the page
2. The main view shows a heatmap of morphological patterns across the entire book
3. Click on specific chapters or sections to view detailed breakdowns
4. Use the various filters and controls to explore different morphological aspects
5. Toggle paragraph mode for contextual reading

## Data Sources and Credits

This project utilizes data from the following sources:

- **SBL Greek New Testament (SBLGNT)**:
  - Text: [https://github.com/LogosBible/SBLGNT](https://github.com/LogosBible/SBLGNT)
  - Paragraph Divisions: [https://github.com/aaronshaf/sblgnt](https://github.com/aaronshaf/sblgnt)
- **MORPHGNT**:
  - Morphological and Lexical Data: [https://github.com/morphgnt/sblgnt](https://github.com/morphgnt/sblgnt)
- **Lexham English Bible English–Greek Reverse Interlinear New Testament**:
  - *Used with permission.*
  - Available at: [https://www.sblgnt.com/download/](https://www.sblgnt.com/download/)
- **Additional Resources**:
  - [Greek New Testament](https://github.com/jcuenod/greek-new-testament) by [jcuenod](https://github.com/jcuenod)
  - [Awesome Bible Data](https://github.com/jcuenod/awesome-bible-data) by [jcuenod](https://github.com/jcuenod)
  - [MACULA Greek](https://github.com/Clear-Bible/macula-greek) by [Clear-Bible](https://github.com/Clear-Bible)
  - [SBLGNT Add-ons](https://github.com/eliranwong/SBLGNT-add-ons/tree/master) by [eliranwong](https://github.com/eliranwong)
  - [Missing data for John 7:53-8:11](https://gist.github.com/chadwhitacre/21497c4d0a7326dccfed79798cfb9dc8) by [chadwhitacre](https://gist.github.com/chadwhitacre)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](https://github.com/jspann21/GreekNT_Morphology_Heatmap?tab=GPL-3.0-1-ov-file) file for details.
