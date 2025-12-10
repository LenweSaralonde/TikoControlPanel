const fs = require('fs');
const path = require('path');

// Simple function to create PNG icons without sharp
// We'll create a minimal valid PNG file programmatically

function createSimplePNG(width, height, outputPath) {
  // For simplicity, let's create a basic colored square PNG
  const PNG = require('pngjs').PNG;
  const png = new PNG({ width, height });

  // Draw a simple pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Background color (#121212)
      png.data[idx] = 0x12;
      png.data[idx + 1] = 0x12;
      png.data[idx + 2] = 0x12;
      png.data[idx + 3] = 0xff;

      // Draw simple heater icon
      const centerX = width / 2;
      const centerY = height / 2;
      const size = Math.min(width, height);
      const padding = size * 0.2;

      // Draw rectangle border
      if ((x > padding && x < width - padding && (y === Math.floor(padding) || y === Math.floor(height - padding))) ||
          (y > padding && y < height - padding && (x === Math.floor(padding) || x === Math.floor(width - padding)))) {
        png.data[idx] = 0xbb;
        png.data[idx + 1] = 0x86;
        png.data[idx + 2] = 0xfc;
      }

      // Draw horizontal lines
      const lineY1 = Math.floor(height * 0.4);
      const lineY2 = Math.floor(height * 0.5);
      const lineY3 = Math.floor(height * 0.6);
      const lineX1 = Math.floor(width * 0.35);
      const lineX2 = Math.floor(width * 0.65);

      if ((y === lineY1 || y === lineY2 || y === lineY3) && x >= lineX1 && x <= lineX2) {
        png.data[idx] = 0xbb;
        png.data[idx + 1] = 0x86;
        png.data[idx + 2] = 0xfc;
      }

      // Draw red indicator dot
      const dotX = centerX;
      const dotY = height * 0.7;
      const dotRadius = size * 0.02;
      if (Math.sqrt((x - dotX) ** 2 + (y - dotY) ** 2) < dotRadius) {
        png.data[idx] = 0xff;
        png.data[idx + 1] = 0x6b;
        png.data[idx + 2] = 0x6b;
      }
    }
  }

  png.pack().pipe(fs.createWriteStream(outputPath));
}

// Check if pngjs is installed
try {
  require('pngjs');
} catch (e) {
  console.log('Installing pngjs...');
  require('child_process').execSync('npm install --save-dev pngjs', { stdio: 'inherit' });
}

const publicDir = path.join(__dirname, '..', 'public');

// Generate icons
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-167.png', size: 167 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

console.log('Generating icons...');
sizes.forEach(({ name, size }) => {
  const outputPath = path.join(publicDir, name);
  createSimplePNG(size, size, outputPath);
  console.log(`Created ${name}`);
});

console.log('All icons generated successfully!');
