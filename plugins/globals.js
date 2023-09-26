const TAGS = {
    X: '-χ'
};

let styleCache = {};

async function getStyle(cssFile) {
    if (styleCache[cssFile] == undefined) {
        let response = await fetch(config.base_path + cssFile);
        styleCache[cssFile] = await response.text();
    }

    let style = document.createElement('style');
    style.textContent = styleCache[cssFile];
    return style;
}

async function getStyles(...cssFiles) {
    let style = document.createElement('style');

    if (Array.isArray(cssFiles[0]))
        cssFiles = cssFiles[0];
    
    for(const f of cssFiles) {
        if (styleCache[f] == undefined) {
            let response = await fetch(config.base_path + f);
            styleCache[f] = await response.text();
        }
    
        style.textContent += styleCache[f];
    };

    return style;
}

async function getSemantic(...components) {
    return await getStyles(components.map(c => `/semantic/components/${c}.min.css`));
}