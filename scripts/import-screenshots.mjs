import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const [sourceDirectory,mobileDirectory,expectedRun] = process.argv.slice(2);
assert(sourceDirectory && mobileDirectory && expectedRun, 'Usage: node scripts/import-screenshots.mjs <store-latest directory> <mobile checkout> <expected store run>');
const run = (await readFile(path.join(sourceDirectory,'SOURCE.txt'),'utf8')).trim();
assert.equal(run,expectedRun,'Capture run is stale or unexpected');
assert(/^store-\d{8}-\d{6}$/.test(run),'Invalid capture run');
const pkg = JSON.parse(await readFile(path.join(mobileDirectory,'package.json'),'utf8'));
const images = [];
for(const screen of ['home','inventory','sharing']) {
  const source = path.join(sourceDirectory,`store-${screen}.png`);
  const bytes = await readFile(source);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Expected a raw PNG capture');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert.equal(width,1280,'Update the HTML dimensions for a different capture device');
  assert.equal(height,2856,'Update the HTML dimensions for a different capture device');
  assert(bytes.length>100000,'Capture appears incomplete');
  const name=`app-${screen}-fr.png`;
  const sha256=createHash('sha256').update(bytes).digest('hex');
  images.push({screen,file:name,width,height,sha256,capturedAt:(await stat(source)).mtime.toISOString()});
  await writeFile(new URL(`../assets/${name}`,import.meta.url),bytes);
}
assert.equal(new Set(images.map(i=>i.sha256)).size,3,'Screenshots must show different screens');
await writeFile(new URL('../assets/screenshots.json',import.meta.url),JSON.stringify({app:'Milkee',appVersion:pkg.version,expoVersion:pkg.dependencies.expo,language:'fr',demoData:true,captureRun:run,images},null,2)+'\n');
console.log(`Imported three raw demo captures from ${run}.`);
