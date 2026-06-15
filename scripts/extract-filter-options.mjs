/**
 * 从 artifacts.ts 自动提取 categories, regions, materials, museums
 * 生成对应的 mock/data 文件
 */
import fs from 'fs';
import path from 'path';

const ARTIFACTS_PATH = path.resolve('src/mock/data/artifacts.ts');

// 读取 artifacts.ts 并用正则提取所有值
const content = fs.readFileSync(ARTIFACTS_PATH, 'utf-8');

function extractField(fieldName) {
  const values = new Set();
  // 匹配 `fieldName: 'value'` 模式
  const regex = new RegExp(`${fieldName}:\\s*'([^']*)'`, 'g');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const val = match[1].trim();
    if (val && val.length > 0 && val.length < 100) {
      values.add(val);
    }
  }
  return Array.from(values).sort();
}

// 提取所有字段
const categories = extractField('category');
const regions = extractField('region');
const materials = extractField('material');
const museums = extractField('museum');

console.log(`Extracted:`);
console.log(`  categories: ${categories.length}`);
console.log(`  regions: ${regions.length}`);
console.log(`  materials: ${materials.length}`);
console.log(`  museums: ${museums.length}`);

// 生成 categories.ts
const catContent = `export const categories = [\n${categories.map(c => `  { value: '${c.replace(/'/g, "\\'")}', label: '${c.replace(/'/g, "\\'")}' }`).join(',\n')}\n];\n\nexport default categories;\n`;
fs.writeFileSync(path.resolve('src/mock/data/categories.ts'), catContent, 'utf-8');
console.log('categories.ts generated');

// 生成 regions.ts
const regContent = `export const regions = [\n${regions.map(r => `  { value: '${r.replace(/'/g, "\\'")}', label: '${r.replace(/'/g, "\\'")}' }`).join(',\n')}\n];\n\nexport default regions;\n`;
fs.writeFileSync(path.resolve('src/mock/data/regions.ts'), regContent, 'utf-8');
console.log('regions.ts generated');

// 生成 museums.ts
const musContent = `export const museums = [\n${museums.map(m => `  { value: '${m.replace(/'/g, "\\'")}', label: '${m.replace(/'/g, "\\'")}' }`).join(',\n')}\n];\n\nexport default museums;\n`;
fs.writeFileSync(path.resolve('src/mock/data/museums.ts'), musContent, 'utf-8');
console.log('museums.ts generated');

// 生成 materials.ts（材料太多，取前80个最常见的）
const matSubset = materials.slice(0, 80);
const matContent = `export const materials = [\n${matSubset.map(m => `  { value: '${m.replace(/'/g, "\\'")}', label: '${m.replace(/'/g, "\\'")}' }`).join(',\n')}\n];\n\nexport default materials;\n`;
fs.writeFileSync(path.resolve('src/mock/data/materials.ts'), matContent, 'utf-8');
console.log(`materials.ts generated (${matSubset.length} of ${materials.length})`);

console.log('\nAll filter option files generated successfully!');
