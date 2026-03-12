export const productColors = {
    "little-millet": "#46633C",
    "kodo-flour": "#5F3E37",
    "kodo": "#5D3F37",
    "barnyard": "#414C5B",
    "foxtail-flour": "#5C683B",
    "porso": "#62386D",
    "browntop": "#BD8A3A",
    "foxtail": "#5C693B",
    "ragi-flour": "#682829",
    "multi-millet-khichdi": "#9F673B",
    "ragi": "#4C1113",
};

// build a key that can be used to look up the mapping
const normalizeKey = (input = '') => {
    let key = input.toLowerCase().trim();

    // convert spaces to hyphens
    key = key.replace(/\s+/g, '-');

    // ignore the word "millet" unless the term also contains "flour"
    if (key.includes('millet') && !key.includes('flour')) {
        key = key.replace(/-?millet/g, '');
    }

    // collapse duplicate hyphens and trim dashes
    key = key.replace(/-+/g, '-').replace(/^-|-$/g, '');

    return key;
};

export const getProductColor = (slugOrName, name, defaultColor = "#10B981") => {
    // If only one argument passed and it's the slug, try to derive from it
    let key = '';
    if (slugOrName) {
        key = normalizeKey(slugOrName);
    }
    // if we still don't have a key or mapping didn't hit, try using the product name
    if ((!key || !productColors[key]) && name) {
        key = normalizeKey(name);
    }

    return productColors[key] || defaultColor;
};

// Helper to check if a color is light or dark (to decide text color)
export const getContrastColor = (hexcolor) => {
    if (!hexcolor) return "#FFFFFF";
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#FFFFFF";
};
