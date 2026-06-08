/**
 * CSV → TypeScript Artifact 数据转换脚本
 * 
 * 从 knowledge-graph-subsystem 的 CSV 数据生成前端 mock 数据
 * 支持多行描述字段的 CSV 解析
 * 
 * 字段映射：
 *   object_id      → id
 *   title          → name
 *   period         → era
 *   type           → category
 *   material       → material
 *   description    → description
 *   dimensions     → dimensions (解析 cm 数值)
 *   museum         → museum
 *   location       → location
 *   image_url      → images[0]
 *   credit_line    → 并入 history
 */

import fs from 'fs';
import path from 'path';

// ===== 配置 =====
const CSV_PATH = path.resolve('../knowledge-graph-subsystem/scrapers/data/chicago_museum.csv');
const OUTPUT_PATH = path.resolve('src/mock/data/artifacts.ts');
const HEADER_FIELDS = 15; // CSV header 字段数

// ===== 多行 CSV 解析器 =====
function parseCSVContent(content) {
  const records = [];
  let currentRecord = [];
  let currentField = '';
  let inQuotes = false;
  let pos = 0;

  function finishField() {
    currentRecord.push(currentField.trim());
    currentField = '';
  }

  function finishRecord() {
    if (currentRecord.length > 0 || currentField.trim()) {
      if (currentField.trim()) finishField();
      if (currentRecord.length > 0) {
        records.push([...currentRecord]);
      }
      currentRecord = [];
      currentField = '';
    }
  }

  while (pos < content.length) {
    const char = content[pos];

    if (inQuotes) {
      // 在引号内
      if (char === '"') {
        if (pos + 1 < content.length && content[pos + 1] === '"') {
          // 双引号转义 ""
          currentField += '"';
          pos += 2;
          continue;
        } else {
          // 引号结束
          inQuotes = false;
          pos++;
          continue;
        }
      }
      currentField += char;
      pos++;
      continue;
    }

    // 不在引号内
    if (char === '"') {
      inQuotes = true;
      pos++;
      continue;
    }

    if (char === ',') {
      finishField();
      pos++;
      continue;
    }

    if (char === '\r') {
      // \r 之后如果是 \n 则一起跳过
      if (pos + 1 < content.length && content[pos + 1] === '\n') {
        pos += 2;
      } else {
        pos++;
      }
      finishRecord();
      continue;
    }

    if (char === '\n') {
      pos++;
      finishRecord();
      continue;
    }

    currentField += char;
    pos++;
  }

  // 处理最后一条
  finishRecord();

  return records;
}

// ===== Dimensions 解析 =====
function parseDimensions(dimStr) {
  const result = { height: 0, width: 0 };
  if (!dimStr) return result;

  const cmPart = dimStr.split('(')[0] || dimStr;
  const numbers = cmPart.match(/[\d]+\.?[\d]*/g);
  if (!numbers) return result;

  const nums = numbers.map(Number);
  if (nums.length === 2) {
    result.height = Math.max(nums[0], nums[1]);
    result.width = Math.min(nums[0], nums[1]);
  } else if (nums.length >= 3) {
    result.height = nums[0];
    result.width = nums[1];
    result.depth = nums[2];
  } else if (nums.length === 1) {
    result.height = nums[0];
    result.width = nums[0];
  }
  return result;
}

// ===== History 提取 =====
function extractHistory(description, creditLine) {
  const parts = [];
  if (description && description.length > 10) {
    const firstSentence = description.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 5 && firstSentence.length < 300) {
      parts.push(firstSentence.trim());
    }
  }
  if (creditLine && creditLine.length > 2) {
    parts.push(`来源: ${creditLine}`);
  }
  return parts.join('。') || '';
}

// ===== Tags 生成 =====
function generateTags(type, materialStr, period) {
  const tags = new Set();
  if (type) {
    type.split(/[,/&]/).forEach(t => {
      const tag = t.trim();
      if (tag && tag.length < 30) tags.add(tag);
    });
  }
  if (materialStr) {
    const keywords = ['porcelain', 'ceramic', 'jade', 'bronze', 'silk', 'gold',
      'silver', 'stoneware', 'earthenware', 'ivory', 'lacquer',
      'bamboo', 'wood', 'iron', 'copper', 'glass', 'enamel',
      'textile', 'embroider', 'painting', 'ink'];
    const lower = materialStr.toLowerCase();
    keywords.forEach(kw => {
      if (lower.includes(kw)) tags.add(kw.charAt(0).toUpperCase() + kw.slice(1));
    });
  }
  const dynastyMatch = period && period.match(/([A-Z][a-z]+)\s+(dynasty|Dynasty)/);
  if (dynastyMatch) tags.add(dynastyMatch[1] + ' Dynasty');
  tags.add('Chinese Art');
  return Array.from(tags).slice(0, 8);
}

// ===== 推断地区 =====
function inferRegion(type) {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('ceramic') || lowerType.includes('porcelain') || lowerType.includes('pottery')) return 'Chinese Ceramics';
  if (lowerType.includes('painting') || lowerType.includes('scroll')) return 'Chinese Painting';
  if (lowerType.includes('jade')) return 'Chinese Jade';
  if (lowerType.includes('bronze')) return 'Chinese Bronzes';
  if (lowerType.includes('textile') || lowerType.includes('costume') || lowerType.includes('silk')) return 'Chinese Textiles';
  if (lowerType.includes('sculpture') || lowerType.includes('figure')) return 'Chinese Sculpture';
  return 'Chinese Art Collection';
}

// ===== IIIF 缩略图 URL =====
function buildThumbnailUrl(imageUrl) {
  if (!imageUrl) return '';
  return imageUrl.replace(/\/full\/full\/0\/default\.jpg$/, '/full/400,/0/default.jpg');
}

// ===== 字符串转义 =====
function escapeTS(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// ===== 主函数 =====
function main() {
  console.log(`Reading CSV from: ${CSV_PATH}`);
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV file not found!');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  
  // 使用多行 CSV 解析器
  const allRecords = parseCSVContent(csvContent);
  
  if (allRecords.length < 2) {
    console.error('CSV file is empty or has no data rows');
    process.exit(1);
  }

  // 第一条是 header
  const headerLine = allRecords[0];
  console.log(`CSV Header (${headerLine.length} fields): ${headerLine.slice(0, 5).join(' | ')}...`);
  
  const dataRecords = allRecords.slice(1);
  console.log(`Total data records found: ${dataRecords.length}`);

  const artifacts = [];
  let skipped = 0;

  for (let i = 0; i < dataRecords.length; i++) {
    try {
      const fields = dataRecords[i];
      
      // 跳过完整的 header 重复行
      if (fields.length <= 2 || (fields[0] === 'object_id' && i > 0)) {
        skipped++;
        continue;
      }

      if (fields.length < 10) {
        skipped++;
        continue;
      }

      const object_id = fields[0];
      const title = fields[1] || '';
      const period = fields[2] || '';
      const type = fields[3] || '';
      const material = fields[4] || '';
      const description = fields[5] || '';
      const dimensions = fields[6] || '';
      const museum = fields[7] || '';
      const location = fields[8] || '';
      const detail_url = fields[9] || '';
      const image_url = fields[10] || '';
      // fields[11] = image_path
      const credit_line = fields[12] || '';

      if (!object_id || !title) {
        skipped++;
        continue;
      }

      const dims = parseDimensions(dimensions);
      const tags = generateTags(type, material, period);
      const region = inferRegion(type);
      const history = extractHistory(description, credit_line);
      const thumbnailUrl = buildThumbnailUrl(image_url);

      const artifact = {
        id: String(object_id).trim(),
        name: title.trim(),
        nameEn: title.trim(),
        era: period.trim(),
        region: region,
        category: type.trim(),
        material: material.trim(),
        dimensions: dims,
        description: description.trim(),
        history: history,
        images: thumbnailUrl ? [thumbnailUrl] : [],
        museum: museum.trim(),
        location: location.trim(),
        tags: tags,
      };

      artifacts.push(artifact);
    } catch (err) {
      skipped++;
      console.warn(`Record ${i + 1}: parse error - ${err.message}`);
    }
  }

  console.log(`Successfully parsed: ${artifacts.length} artifacts`);
  console.log(`Skipped: ${skipped} records`);

  // ===== 生成 TypeScript 文件 =====
  const tsLines = [];
  tsLines.push(`import type { Artifact } from '@/types/artifact';`);
  tsLines.push('');
  tsLines.push(`/**`);
  tsLines.push(` * 真实文物 Mock 数据`);
  tsLines.push(` * 数据来源: Art Institute of Chicago (芝加哥艺术博物馆)`);
  tsLines.push(` * 爬取时间: 2026-05-10`);
  tsLines.push(` * 数据提供: knowledge-graph-subsystem (BUCT-CS2305-SE)`);
  tsLines.push(` * 总记录数: ${artifacts.length}`);
  tsLines.push(` */`);
  tsLines.push(`export const artifacts: Artifact[] = [`);

  for (let i = 0; i < artifacts.length; i++) {
    const a = artifacts[i];
    const isLast = i === artifacts.length - 1;
    const d = a.dimensions;
    const dimParts = [`height: ${d.height}`, `width: ${d.width}`];
    if (d.depth) dimParts.push(`depth: ${d.depth}`);
    const tagsStr = a.tags.map(t => `'${escapeTS(t)}'`).join(', ');
    
    tsLines.push(`  {`);
    tsLines.push(`    id: '${escapeTS(a.id)}',`);
    tsLines.push(`    name: '${escapeTS(a.name)}',`);
    tsLines.push(`    nameEn: '${escapeTS(a.nameEn)}',`);
    tsLines.push(`    era: '${escapeTS(a.era)}',`);
    tsLines.push(`    region: '${escapeTS(a.region)}',`);
    tsLines.push(`    category: '${escapeTS(a.category)}',`);
    tsLines.push(`    material: '${escapeTS(a.material)}',`);
    tsLines.push(`    dimensions: { ${dimParts.join(', ')} },`);
    tsLines.push(`    description: '${escapeTS(a.description)}',`);
    tsLines.push(`    history: '${escapeTS(a.history)}',`);
    tsLines.push(`    images: ${a.images.length > 0 ? `['${escapeTS(a.images[0])}']` : '[]'},`);
    tsLines.push(`    museum: '${escapeTS(a.museum)}',`);
    tsLines.push(`    location: '${escapeTS(a.location)}',`);
    tsLines.push(`    tags: [${tagsStr}],`);
    tsLines.push(`  }${isLast ? '' : ','}`);
  }

  tsLines.push(`];`);
  tsLines.push('');
  tsLines.push(`export default artifacts;`);
  tsLines.push('');

  const output = tsLines.join('\n');
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
  const sizeMB = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`Written to: ${OUTPUT_PATH}`);
  console.log(`Output size: ${sizeMB} MB`);
}

main();
