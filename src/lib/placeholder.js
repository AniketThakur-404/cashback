export const getPlaceholderImage = (width, height, text = '', bgColor = '#cccccc', textColor = '#969696') => {
    const fontSize = Math.min(width, height) * 0.4;
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" font-family="sans-serif" font-weight="bold" font-size="${fontSize}px" fill="${textColor}" dominant-baseline="middle" text-anchor="middle">${text}</text>
</svg>`.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};
