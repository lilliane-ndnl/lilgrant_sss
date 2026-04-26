import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../src/data/colleges-2026-04-24.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWikiImage(collegeName) {
  const title = collegeName.replace(/ /g, '_');
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1200&origin=*`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

const colleges = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const total = colleges.length;
let hits = 0;
let misses = 0;

console.log(`Fetching Wikipedia images for ${total} schools...\n`);

for (let i = 0; i < colleges.length; i++) {
  const college = colleges[i];
  const imageUrl = await fetchWikiImage(college.name);

  if (imageUrl) {
    college.wiki_image_url = imageUrl;
    hits++;
  } else {
    college.wiki_image_url = null;
    misses++;
  }

  if ((i + 1) % 50 === 0 || i + 1 === total) {
    console.log(`Progress: ${i + 1}/${total}  (${hits} images found, ${misses} no image)`);
  }

  if (i < colleges.length - 1) await sleep(100);
}

writeFileSync(DATA_PATH, JSON.stringify(colleges, null, 2), 'utf8');

console.log(`\nDone!`);
console.log(`  Got real image : ${hits}`);
console.log(`  No image found : ${misses}`);
console.log(`\nJSON written to ${DATA_PATH}`);
