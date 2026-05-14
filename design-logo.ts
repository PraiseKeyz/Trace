import * as fs from 'fs';
import * as path from 'path';

const svgContent = `
<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Premium Gradient Background Plate -->
  <rect width="100" height="100" rx="22" fill="url(#trace-bg)" />
  
  <!-- Ambient Backlight Trace (Represents historical data / history) -->
  <path 
    d="M20 50 L50 20 L80 50 M50 20 V80" 
    stroke="white" 
    stroke-opacity="0.2"
    stroke-width="8" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
  />

  <!-- Main Foreground T-Shape (Represents 'Trace' and current economic standing) -->
  <path 
    d="M32 38 H68 M50 38 V72" 
    stroke="white" 
    stroke-width="12" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
  />

  <!-- Economic Nodes (The network of the user) -->
  <circle cx="32" cy="38" r="6" fill="white" />
  <circle cx="68" cy="38" r="6" fill="white" />
  <circle cx="50" cy="72" r="6" fill="white" />
  
  <!-- The Core Identity Node (Center) -->
  <circle cx="50" cy="38" r="4" fill="#ea580c" />

  <defs>
    <linearGradient id="trace-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F97316" />
      <stop offset="1" stop-color="#9A3412" />
    </linearGradient>
  </defs>
</svg>
`;

const outputPath = path.join(process.cwd(), 'frontend', 'public', 'trace-logo.svg');

fs.writeFileSync(outputPath, svgContent.trim());
console.log('✅ Success! Trace Logo SVG has been designed and saved to:', outputPath);
