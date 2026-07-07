const fs = require('fs');
const files = [
  'functions/src/hotspots.test.ts',
  'scripts/seedDummyHotspots.ts',
  'functions/src/risk.test.ts',
  'functions/src/index.ts',
  'functions/src/createAhmedabadHotspot.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/waste_burning_smoke/g, 'unpicked_waste');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Replaced in ' + file);
  }
}
