#!/usr/bin/env python3
"""
CSV → 中文 TypeScript Artifact 数据转换脚本

从 knowledge-graph-subsystem 的 CSV 数据生成前端 mock 数据（中文版）
- 翻译名称、朝代、类别、材质、区域为中文
- 保留英文原名到 nameEn 字段
- 解析尺寸、生成中文标签
- 直接输出 TypeScript 格式的 artifacts.ts
"""

import csv
import os
import re
import sys
import json

# ===== 配置 =====
CSV_PATH = os.path.join(
    os.path.dirname(__file__),
    '../../knowledge-graph-subsystem/scrapers/data/chicago_museum.csv'
)
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__),
    '../src/mock/data/artifacts.ts'
)

# ===== 中文翻译映射表 =====

# 朝代/时期映射
PERIOD_MAP = {
    # 完整匹配
    "Qing dynasty (1644–1911)": "清朝 (1644–1911)",
    "Qing dynasty (1644–1911), 19th century": "清朝 (1644–1911)，19世纪",
    "Ming dynasty (1368–1644)": "明朝 (1368–1644)",
    "Ming dynasty (1368–1644), 16th/17th century": "明朝 (1368–1644)，16-17世纪",
    "Yuan dynasty (1271–1368)": "元朝 (1271–1368)",
    "Song dynasty (960–1279)": "宋朝 (960–1279)",
    "Tang dynasty (618–907)": "唐朝 (618–907)",
    "Han dynasty (202 BC–220 AD)": "汉朝 (公元前202–公元220)",
    "Shang dynasty (c. 1600–1046 BC)": "商朝 (约公元前1600–1046)",
    "Zhou dynasty (c. 1046–256 BC)": "周朝 (约公元前1046–256)",
    "Jin dynasty (1115–1234)": "金朝 (1115–1234)",
    "Ming dynasty (1368–1644), 17th century": "明朝 (1368–1644)，17世纪",
}

# 朝代关键词映射（用于模糊匹配）
PERIOD_KEYWORDS = {
    'qing': '清',
    "ch'ing": '清',
    'ming': '明',
    'yuan': '元',
    'song': '宋',
    'sung': '宋',
    'tang': '唐',
    'han': '汉',
    'shang': '商',
    'zhou': '周',
    'chou': '周',
    'jin': '金',
}

# 类型映射
TYPE_MAP = {
    'Sculpture': '雕塑',
    'Painting': '绘画',
    'Ceramics': '陶瓷器',
    'Vessel': '容器',
    'Textile': '纺织品',
    'Costume and Accessories': '服饰配饰',
    'Print': '版画',
    'Drawing and Watercolor': '素描水彩',
    'Metalwork': '金属工艺',
    'Furniture': '家具',
    'Book': '书籍',
    'Arms': '兵器',
    'Photograph': '摄影',
    'Religious/Ritual Object': '宗教礼器',
    'Architectural fragment': '建筑残件',
    'Architectural Drawing': '建筑图纸',
    'Decorative Arts': '装饰艺术',
    'Furnishings': '陈设品',
    'Coverings and Hangings': '挂毯帷幔',
    'Miniature room': '微缩房间',
    'Other': '其他',
}

# 材质关键词替换（按优先级排序）
MATERIAL_KEYWORDS = [
    # 完整短语优先
    ('hard-paste porcelain', '硬质瓷'),
    ('soft-paste porcelain', '软质瓷'),
    ('stoneware', '炻器'),
    ('earthenware', '陶器'),
    ('porcelain', '瓷'),
    ('celadon-glazed', '青釉'),
    ('celadon', '青瓷'),
    ('underglaze blue', '青花'),
    ('overglaze enamels', '釉上彩'),
    ('polychrome enamels', '五彩'),
    ('famille rose', '粉彩'),
    ('famille verte', '五彩'),
    ('gilt copper alloy', '鎏金铜合金'),
    ('gilt bronze', '鎏金青铜'),
    ('bronze', '青铜'),
    ('brass alloy', '黄铜合金'),
    ('brass', '黄铜'),
    ('copper alloy', '铜合金'),
    ('copper', '铜'),
    ('iron', '铁'),
    ('steel', '钢'),
    ('gold', '金'),
    ('silver', '银'),
    ('enamel', '珐琅'),
    ('cloisonné', '景泰蓝'),
    ('lacquer', '漆'),
    ('jade', '玉'),
    ('ivory', '象牙'),
    ('bamboo', '竹'),
    ('wood', '木'),
    ('silk', '丝'),
    ('cotton', '棉'),
    ('linen', '麻'),
    ('wool', '毛'),
    ('paper', '纸'),
    ('ink', '墨'),
    ('pigment', '颜料'),
    ('glaze', '釉'),
    ('gilding', '描金'),
    ('gilded', '鎏金'),
    ('lapis', '青金石'),
    ('coral', '珊瑚'),
    ('malachite', '孔雀石'),
    ('turquoise', '绿松石'),
    ('amber', '琥珀'),
    ('pearl', '珍珠'),
    ('crystal', '水晶'),
    ('glass', '玻璃'),
    ('embroidered', '绣'),
    ('embroidery', '刺绣'),
    ('tapestry', '挂毯'),
    ('brocade', '织锦'),
    ('damask', '缎'),
    ('gauze', '纱'),
    ('satin', '缎'),
    ('twill', '斜纹'),
    ('plain weave', '平纹'),
    ('textile', '织物'),
]

# 文物名称翻译模式（按优先级排序）
NAME_TRANSLATIONS = {
    # 完整精确匹配
    'Deity from a Set of Five Pancharaksha Goddesses': '五守护神女尊像',
    'Dinner Plate': '餐盘',
    'Cup': '杯',
    'Tureen with Cover': '带盖汤盆',
    'Fragment (Sleeve Band)': '袖带残片',
    'Tea Bowl and Dish': '茶碗与碟',
    'Coffee Pot with Lid': '带盖咖啡壶',
    'Sugar Bowl with Cover': '带盖糖罐',
    'Punch Bowl': '潘趣酒碗',
    'Teapot with Cover': '带盖茶壶',
    'Teapot': '茶壶',
    'Cider Jug with Lid': '带盖苹果酒壶',
    'Jar with Tubular Handles': '双耳罐',
    'Vase': '花瓶',
    'Bottle': '瓶',
    'Bowl': '碗',
    'Plate': '盘',
    'Dish': '碟',
    'Box with Cover': '带盖盒',
    'Covered Box': '盖盒',
    'Jar': '罐',
    'Ewer': '执壶',
    'Wine Vessel': '酒器',
    'Water Pot': '水丞',
    'Brush Pot': '笔筒',
    'Brush Rest': '笔搁',
    'Incense Burner': '香炉',
    'Censer': '香炉',
    'Snuff Bottle': '鼻烟壶',
    'Wine Cup': '酒杯',
    'Stem Cup': '高足杯',
    'Tea Bowl': '茶碗',
    'Saucer': '茶碟',
    'Pitcher': '壶',
    'Beaker': '烧杯',
    'Flask': '扁壶',
    'Jug': '壶',
    'Tankard': '大杯',
    'Goblet': '高脚杯',
    'Charger': '大盘',
    'Tray': '托盘',
    'Basin': '盆',
    'Urn': '瓮',
    'Casket': '匣',
    'Chest': '箱',
    'Screen': '屏风',
    'Panel': '面板',
    'Mirror': '镜',
    'Figure of': '像',
    'Standing Figure': '立像',
    'Seated Figure': '坐像',
    'Bust': '半身像',
    'Head': '头像',
    'Mask': '面具',
    'Plaque': '饰板',
    'Medallion': '圆章',
    'Relief': '浮雕',
    'Fragment': '残片',
    'Border': '边饰',
    'Band': '带饰',
    'Sleeve Band': '袖带',
    'Collar': '领饰',
    'Skirt': '裙',
    'Robe': '袍',
    'Coat': '外套',
    'Jacket': '夹克',
    'Vest': '背心',
    'Trousers': '裤',
    'Shoe': '鞋',
    'Hat': '帽',
    'Cap': '帽',
    'Fan': '扇子',
    'Umbrella': '伞',
    'Handkerchief': '手帕',
    'Shawl': '披肩',
    'Scarf': '围巾',
    'Rug': '地毯',
    'Carpet': '地毯',
    'Tapestry': '挂毯',
    'Hanging Scroll': '挂轴',
    'Handscroll': '手卷',
    'Album Leaf': '册页',
    'Fan Painting': '扇面画',
    'Print': '版画',
    'Woodblock Print': '木版画',
    'Portrait': '肖像',
    'Landscape': '山水',
    'Bird-and-Flower': '花鸟',
    'Calligraphy': '书法',
    'Sword': '剑',
    'Dagger': '匕首',
    'Spear': '矛',
    'Arrowhead': '箭头',
    'Armor': '甲胄',
    'Helmet': '头盔',
    'Saddle': '马鞍',
    'Stool': '凳',
    'Table': '桌',
    'Chair': '椅',
    'Cabinet': '柜',
    'Desk': '书桌',
    'Bed': '床',
    'Throne': '宝座',
    'Stand': '架',
    'Candle Holder': '烛台',
    'Lamp': '灯',
    'Candlestick': '烛台',
    'Clock': '钟',
    'Vessel': '容器',
    'Ritual Vessel': '礼器',
    'Wine Container': '盛酒器',
    'Food Container': '食器',
    'Water Container': '水器',
    'Cooking Vessel': '炊器',
    'Woman\'s Ao': '女袄',
    'Woman\'s Qun': '女裙',
    'Woman\'s Robe': '女袍',
    'Man\'s Robe': '男袍',
    'Boy\'s Robe': '男童袍',
    'Bridal Robe': '嫁衣',
    'Dragon Robe': '龙袍',
    'Long Pao': '长袍',
    'Jiasha': '袈裟',
    'Mantle': '披风',
    'Buddha': '佛像',
    'Bodhisattva': '菩萨像',
    'Guardian Figure': '护法像',
    'Guardian': '护法',
    'Lohan': '罗汉',
    'Arhat': '罗汉',
    'Altar': '供桌',
    'Altarpiece': '祭坛画',
    'Shrine': '神龛',
    'Temple Banner': '寺庙幡旗',
    'Pagoda': '塔',
    'Brush Washer': '笔洗',
    'Brush Holder': '笔筒',
    'Ink Stone': '砚台',
    'Inkstick': '墨',
    'Seal': '印章',
    'Seal Paste Box': '印泥盒',
    'Belt Hook': '带钩',
    'Belt Buckle': '带扣',
    'Hairpin': '发簪',
    'Earring': '耳环',
    'Necklace': '项链',
    'Bracelet': '手镯',
    'Ring': '戒指',
    'Pendant': '挂坠',
    'Girdle': '腰带',
    'Sash': '腰带',
}

# 名称模式翻译（基于关键词组合）
NAME_PATTERN_MAP = [
    (r'(.*)\s+with\s+Cover\s+and\s+Stand', r'带盖托\1'),
    (r'(.*)\s+with\s+Cover', r'带盖\1'),
    (r'(.*)\s+with\s+Lid', r'带盖\1'),
    (r'(.*)\s+and\s+Cover', r'带盖\1'),
    (r'Covered\s+(.*)', r'带盖\1'),
    (r'(.*)\s+with\s+Stand', r'带座\1'),
    (r'Pair of\s+(.*)', r'一对\1'),
    (r'Set of\s+(.*)', r'一套\1'),
    (r'Bottle-shaped\s+(.*)', r'瓶形\1'),
]

# 区域映射
REGION_MAP = {
    'Chinese Ceramics': '中国陶瓷',
    'Chinese Painting': '中国绘画',
    'Chinese Sculpture': '中国雕塑',
    'Chinese Textiles': '中国织物',
    'Chinese Jade': '中国玉器',
    'Chinese Bronzes': '中国青铜器',
    'Chinese Art Collection': '中国艺术藏品',
    'Chinese Furniture': '中国家具',
    'Chinese Metalwork': '中国金属工艺',
    'Chinese Lacquerware': '中国漆器',
}

# 博物馆/地点
MUSEUM_ZH = '芝加哥艺术博物馆'
LOCATION_ZH = '美国芝加哥'

# 中文标签关键词（生成tags用）
TAG_KEYWORDS_ZH = {
    'porcelain': '瓷器',
    'ceramic': '陶瓷',
    'jade': '玉器',
    'bronze': '青铜',
    'silk': '丝绸',
    'gold': '金',
    'silver': '银',
    'stoneware': '炻器',
    'earthenware': '陶器',
    'ivory': '象牙',
    'lacquer': '漆器',
    'bamboo': '竹',
    'wood': '木',
    'iron': '铁',
    'copper': '铜',
    'glass': '玻璃',
    'enamel': '珐琅',
    'textile': '织物',
    'embroider': '刺绣',
    'painting': '绘画',
    'ink': '水墨',
    'paper': '纸本',
    'stone': '石',
    'gilt': '鎏金',
    'celadon': '青瓷',
    'underglaze': '青花',
}

# ===== 翻译函数 =====

def translate_period(period_str):
    """翻译朝代/时期为中文"""
    if not period_str or not period_str.strip():
        return '未知'

    period = period_str.strip()

    # 完整匹配
    if period in PERIOD_MAP:
        return PERIOD_MAP[period]

    # 关键词匹配
    period_lower = period.lower()
    matched_dynasty = None
    for eng_key, zh_name in PERIOD_KEYWORDS.items():
        if eng_key in period_lower:
            matched_dynasty = zh_name
            break

    if matched_dynasty:
        # 保留详细的时间范围
        # 提取年份信息
        year_pattern = r'(\d{3,4})\s*(BC|BCE|B\.C\.)?\s*[-–]\s*(\d{3,4})?\s*(AD|CE|A\.D\.)?'
        year_match = re.search(year_pattern, period)

        # 世纪匹配
        century_pattern = r'(\d{1,2})(?:st|nd|rd|th)\s*(?:/\s*(\d{1,2})(?:st|nd|rd|th))?\s*century'
        century_match = re.search(century_pattern, period_lower)

        parts = [matched_dynasty + '朝']

        if year_match:
            start_year = year_match.group(1)
            end_year = year_match.group(3) if year_match.group(3) else ''
            is_bc = year_match.group(2)
            if is_bc:
                parts.append(f'(公元前{start_year}–{end_year}年)' if end_year else f'(公元前{start_year}年)')
            else:
                parts.append(f'({start_year}–{end_year}年)' if end_year else f'({start_year}年)')
        elif century_match:
            c1 = int(century_match.group(1))
            c2 = int(century_match.group(2)) if century_match.group(2) else None
            if c2:
                parts.append(f'({c1}-{c2}世纪)')
            else:
                parts.append(f'({c1}世纪)')
        else:
            # 保留原始详细信息
            remaining = re.sub(r'[A-Za-z]+\s+dynasty', '', period, flags=re.IGNORECASE).strip(' (),')
            if remaining:
                parts.append(f'({remaining})')

        return ' '.join(parts)

    # 没有朝代匹配，翻译世纪/年份
    result = period

    # 世纪翻译
    result = re.sub(
        r'(\d{1,2})(?:st|nd|rd|th)\s*century',
        lambda m: f'{m.group(1)}世纪',
        result,
        flags=re.IGNORECASE
    )
    result = re.sub(
        r'(\d{1,2})(?:st|nd|rd|th)\s*/\s*(\d{1,2})(?:st|nd|rd|th)\s*century',
        lambda m: f'{m.group(1)}/{m.group(2)}世纪',
        result,
        flags=re.IGNORECASE
    )

    # BC/BCE → 公元前
    result = re.sub(r'(\d+)\s*(BC|BCE|B\.C\.)', r'公元前\1年', result, flags=re.IGNORECASE)
    result = re.sub(r'(\d+)\s*(AD|CE|A\.D\.)', r'公元\1年', result, flags=re.IGNORECASE)

    # c./circa → 约
    result = re.sub(r'\bc\.?\s*(\d)', r'约\1', result, flags=re.IGNORECASE)
    result = re.sub(r'\bcirca\s+(\d)', r'约\1', result, flags=re.IGNORECASE)

    # dynasty → 朝
    result = re.sub(r'([A-Za-z]+)\s+dynasty', lambda m: PERIOD_KEYWORDS.get(m.group(1).lower(), m.group(1)) + '朝', result, flags=re.IGNORECASE)

    # early/mid/late
    result = result.replace('early', '早').replace('Early', '早')
    result = result.replace('mid', '中').replace('Mid', '中')
    result = result.replace('late', '晚').replace('Late', '晚')

    # 纯年份范围 (如 "1796–1810"、"1750–70")
    year_range = re.match(r'^(\d{3,4})\s*[–\-]\s*(\d{2,4})$', result)
    if year_range:
        start = year_range.group(1)
        end = year_range.group(2)
        if len(end) == 2:
            end = start[:2] + end
        result = f'{start}–{end}年'

    # 纯单年份 (如 "1790")
    single_year = re.match(r'^(\d{3,4})$', result)
    if single_year:
        result = f'{single_year.group(1)}年'

    # 修复 "朝(..." 为 "朝 (..."
    result = re.sub(r'朝\(', '朝 (', result)

    # 修复 "...世纪)(" 为 "...世纪) ("
    result = re.sub(r'\)(\()', r') (', result)

    # 修复 "约1787–90" → "约1787–1790年"
    def fix_short_year(m):
        full_start = m.group(1)
        short_end = m.group(2)
        full_end = full_start[:len(full_start) - len(short_end)] + short_end
        return f'约{full_start}–{full_end}年'
    result = re.sub(r'约(\d{3,4})[–\-](\d{2})$', fix_short_year, result)

    # 修复 year–year 后加 "年"（如果没有朝代名的话）
    if not any(kw in result for kw in PERIOD_KEYWORDS.values()):
        result = re.sub(r'(\d{3,4})[–\-](\d{3,4})$', r'\1–\2年', result)

    # 清理多余空格
    result = re.sub(r'\s+', ' ', result).strip()

    return result


def translate_type(type_str):
    """翻译文物类型为中文"""
    if not type_str or not type_str.strip():
        return '其他'

    typ = type_str.strip()

    # 完整匹配
    if typ in TYPE_MAP:
        return TYPE_MAP[typ]

    # 关键词匹配
    typ_lower = typ.lower()
    if 'paint' in typ_lower or 'scroll' in typ_lower:
        return '绘画'
    if 'ceramic' in typ_lower or 'porcelain' in typ_lower or 'pottery' in typ_lower:
        return '陶瓷器'
    if 'bronze' in typ_lower or 'metal' in typ_lower:
        return '金属工艺'
    if 'jade' in typ_lower:
        return '玉器'
    if 'sculpture' in typ_lower or 'statue' in typ_lower or 'figure' in typ_lower:
        return '雕塑'
    if 'calligraphy' in typ_lower:
        return '书法'
    if 'textile' in typ_lower or 'silk' in typ_lower or 'garment' in typ_lower or 'costume' in typ_lower:
        return '纺织品'
    if 'vessel' in typ_lower:
        return '容器'
    if 'print' in typ_lower:
        return '版画'
    if 'furniture' in typ_lower:
        return '家具'
    if 'architect' in typ_lower:
        return '建筑相关'
    if 'religious' in typ_lower or 'ritual' in typ_lower:
        return '宗教礼器'
    if 'book' in typ_lower:
        return '书籍'
    if 'arm' in typ_lower or 'weapon' in typ_lower:
        return '兵器'
    if 'photograph' in typ_lower:
        return '摄影'
    if 'drawing' in typ_lower or 'watercolor' in typ_lower:
        return '素描水彩'
    if 'decorative' in typ_lower:
        return '装饰艺术'

    return typ  # 保持原样


def translate_material(material_str):
    """翻译材质为中文"""
    if not material_str or not material_str.strip():
        return ''

    mat = material_str.strip()

    # Step 1: 应用关键词映射
    result = mat
    for eng_key, zh_term in MATERIAL_KEYWORDS:
        result = re.sub(
            r'\b' + re.escape(eng_key) + r'\b',
            zh_term,
            result,
            flags=re.IGNORECASE
        )

    # Step 2: 替换剩余常见英文词
    COMMON_WORD_MAP = {
        'and': '与',
        'with': '镶嵌',
        'in': '',
        'on': '',
        'colors': '彩',
        'traces of': '微量',
        'polychrome': '多色',
        'overglaze': '釉上',
        'underglaze': '釉下',
        'blue': '蓝',
        'red': '红',
        'green': '绿',
        'white': '白',
        'black': '黑',
        'yellow': '黄',
        'brown': '棕',
        'orange': '橙',
        'pink': '粉',
        'purple': '紫',
        'gold-': '金',
        'silver-': '银',
        'piece': '件',
        'technique': '工艺',
        'decoration': '装饰',
        'molded': '模制',
        'carved': '雕刻',
        'painted': '彩绘',
        'applied': '施加',
        'enamels': '珐琅彩',
        'enamel': '珐琅',
        'enamelled': '珐琅',
    }
    for eng, zh in COMMON_WORD_MAP.items():
        result = re.sub(r'\b' + re.escape(eng) + r'\b', zh, result, flags=re.IGNORECASE)

    # Step 3: 清理
    result = result.replace(';', '，')
    result = result.replace(',', '，')
    result = result.replace(':', '：')
    result = result.strip(' ，')

    # 清理多余空格和标点
    result = re.sub(r'\s+', '', result)
    result = result.replace('，，', '，')
    result = result.replace('，，', '，')
    # 修复重复字符 (如 "珐琅彩彩" → "珐琅彩")
    result = re.sub(r'(.)\1{2,}', r'\1\1', result)  # 3+ repeats → 2 (keep intentional doubles)
    result = re.sub(r'彩彩', '彩', result)  # specific fix
    result = re.sub(r'镶嵌镶嵌', '镶嵌', result)
    result = re.sub(r'与与', '与', result)
    result = result.replace('与，', '，').replace('，与', '，')
    result = result.strip('，与,')
    result = re.sub(r'^[，,\s]+|[，,\s]+$', '', result)

    # 如果太长，提取关键词
    if len(result) > 60:
        keywords_found = []
        mat_lower = mat.lower()
        for eng_key, zh_term in MATERIAL_KEYWORDS:
            if eng_key in mat_lower:
                keywords_found.append(zh_term)
        seen = set()
        unique_kw = []
        for kw in keywords_found:
            if kw not in seen:
                seen.add(kw)
                unique_kw.append(kw)
        if unique_kw:
            return '，'.join(unique_kw[:6])

    return result if result else mat


def translate_name(title, type_zh, material_str):
    """翻译文物名称为中文，结合类型和材质信息"""
    if not title or not title.strip():
        return '未命名文物'

    title = title.strip()

    # 完整精确匹配
    if title in NAME_TRANSLATIONS:
        return NAME_TRANSLATIONS[title]

    # 移除引号
    clean_title = title.strip('"\'')

    # 再次尝试匹配
    if clean_title in NAME_TRANSLATIONS:
        return NAME_TRANSLATIONS[clean_title]

    # 尝试模式匹配
    for pattern, replacement in NAME_PATTERN_MAP:
        m = re.match(pattern, clean_title, re.IGNORECASE)
        if m:
            inner = m.group(1)
            # 递归翻译内部部分
            inner_zh = translate_name(inner, type_zh, material_str)
            result = replacement.replace('\\1', inner_zh)
            return result

    # 尝试部分匹配：如果名称包含已知的词
    title_lower = clean_title.lower()

    # 检查是否包含 "Woman's" 或 "Man's" 等前缀
    prefix_map = {
        "woman's": '女式',
        "man's": '男式',
        "boy's": '男童',
        "girl's": '女童',
        "child's": '儿童',
        "bridal": '婚礼',
        "ceremonial": '礼仪',
        "imperial": '御制',
        "semiformal": '半正式',
        "formal": '正式',
        "domestic": '家用',
        "trousers": '裤',
    }

    for prefix_en, prefix_zh in prefix_map.items():
        if prefix_en in title_lower:
            # 尝试匹配更具体的模式
            specific_match = re.match(
                r"([A-Za-z']+)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)",
                clean_title
            )
            if specific_match:
                desc = specific_match.group(1)
                item = specific_match.group(2)
                desc_zh = prefix_map.get(desc.lower(), desc)
                item_zh = NAME_TRANSLATIONS.get(item, item)
                if item_zh != item:
                    return f'{desc_zh}{item_zh}'
                # 尝试翻译 item
                item_lower = item.lower()
                for eng, zh in NAME_TRANSLATIONS.items():
                    if eng.lower() == item_lower:
                        return f'{desc_zh}{zh}'

    # 按大写字母拆分，尝试匹配每个部分
    words = clean_title.split()
    translated_parts = []
    for word in words:
        # 跳过介词和冠词
        if word.lower() in ('a', 'an', 'the', 'of', 'from', 'with', 'and', 'or', 'in', 'on', 'at', 'for', 'to'):
            translated_parts.append(word)
            continue

        # 尝试在映射表中查找
        word_stripped = word.strip('(),;')
        found = False
        for eng, zh in NAME_TRANSLATIONS.items():
            if eng.lower() == word_stripped.lower():
                translated_parts.append(zh)
                found = True
                break

        if not found:
            translated_parts.append(word)

    result = ' '.join(translated_parts)

    # 如果翻译后基本不变（只有介词等），基于类型生成名称
    if result.lower() == clean_title.lower() or len(result) == len(clean_title):
        # 尝试基于类型生成更合理的名称
        if type_zh:
            # 提取材质关键词用于命名
            mat_short = material_str[:20] if material_str else ''
            mat_lower = mat_short.lower() if mat_short else ''

            # 根据类型推断名称
            if '绘画' in type_zh:
                return get_painting_name_zh(title, mat_short)
            elif '纺织品' in type_zh or '服饰' in type_zh:
                return get_textile_name_zh(title, mat_short)
            elif '雕塑' in type_zh:
                return get_sculpture_name_zh(title, mat_short)
            elif '陶瓷' in type_zh:
                return get_ceramic_name_zh(title, mat_short)
            elif '容器' in type_zh:
                return get_vessel_name_zh(title, mat_short)

    # 清理结果中的多余空格
    result = re.sub(r'\s+', ' ', result).strip()

    return result if result and result != clean_title else clean_title


def get_painting_name_zh(title, material):
    """为绘画类生成中文名称"""
    title_lower = title.lower()
    if 'landscape' in title_lower:
        return title.replace('Landscape', '山水图').replace('landscape', '山水图')
    if 'bird' in title_lower and 'flower' in title_lower:
        return title.replace('Bird', '花鸟').replace('bird', '花鸟').replace('and Flower', '').replace('and flower', '').replace('Flower', '').replace('flower', '')
    if 'portrait' in title_lower:
        return title.replace('Portrait', '肖像画').replace('portrait', '肖像画')
    if 'figure' in title_lower:
        return title.replace('Figure', '人物图').replace('figure', '人物图')
    if 'bamboo' in title_lower:
        return title.replace('Bamboo', '竹').replace('bamboo', '竹')
    if 'flower' in title_lower or 'blossom' in title_lower or 'peony' in title_lower:
        return title.replace('Flowers', '花卉图').replace('flowers', '花卉图').replace('Flower', '花卉图').replace('flower', '花卉图').replace('Blossom', '花卉图').replace('blossom', '花卉图').replace('Peonies', '牡丹图').replace('peonies', '牡丹图')
    # 通用处理
    parts = title.split(',')
    if len(parts) > 1:
        return parts[0].strip()
    return title


def get_textile_name_zh(title, material):
    """为纺织品/服饰类生成中文名称"""
    title_lower = title.lower()
    # 服饰类常见模式
    for eng, zh in [('robe', '袍'), ('skirt', '裙'), ('jacket', '夹克'), ('coat', '外套'),
                     ('vest', '背心'), ('trousers', '裤'), ('sleeve band', '袖带'),
                     ('collar', '领'), ('border', '边饰'), ('panel', '织片'),
                     ('fragment', '残片'), ('band', '带饰'), ('hat', '帽'),
                     ('shoe', '鞋'), ('boot', '靴'), ('sash', '腰带'),
                     ('shawl', '披肩'), ('cape', '斗篷'), ('apron', '围裙'),
                     ('textile', '织物'), ('hanging', '挂饰'), ('cover', '罩'),
                     ('cushion', '垫'), ('curtain', '帘'), ('tapestry', '挂毯'),
                     ('rug', '地毯'), ('carpet', '地毯'), ('mat', '席')]:
        if eng in title_lower:
            return title.replace(eng.capitalize(), zh).replace(eng.title(), zh).replace(eng, zh)
    return title


def get_sculpture_name_zh(title, material):
    """为雕塑类生成中文名称"""
    title_lower = title.lower()
    for eng, zh in [('figure', '像'), ('buddha', '佛像'), ('bodhisattva', '菩萨像'),
                     ('guardian', '护法像'), ('deity', '神像'), ('lion', '狮子'),
                     ('horse', '马'), ('dragon', '龙'), ('bird', '鸟'),
                     ('head', '头像'), ('bust', '半身像'), ('mask', '面具'),
                     ('stele', '碑'), ('statue', '雕像'), ('statuette', '小雕像')]:
        if eng in title_lower:
            return title.replace(eng.capitalize(), zh).replace(eng.title(), zh).replace(eng, zh)
    return title


def get_ceramic_name_zh(title, material):
    """为陶瓷器类生成中文名称"""
    title_lower = title.lower()
    # 青花、釉里红等特殊命名
    if 'blue and white' in title_lower:
        return title.replace('Blue and White', '青花').replace('blue and white', '青花').replace('Blue-and-White', '青花').replace('blue-and-white', '青花')
    for eng, zh in [('vase', '瓶'), ('bowl', '碗'), ('plate', '盘'), ('dish', '碟'),
                     ('jar', '罐'), ('ewer', '执壶'), ('bottle', '瓶'), ('cup', '杯'),
                     ('teapot', '茶壶'), ('tureen', '汤盆'), ('basin', '盆'),
                     ('charger', '大盘'), ('stem cup', '高足杯'), ('beaker', '杯'),
                     ('flask', '扁壶'), ('pot', '壶'), ('box', '盒')]:
        if eng in title_lower:
            return title.replace(eng.capitalize(), zh).replace(eng.title(), zh).replace(eng, zh)
    return title


def get_vessel_name_zh(title, material):
    """为容器类生成中文名称"""
    title_lower = title.lower()
    for eng, zh in [('vessel', '器'), ('container', '容器'), ('jar', '罐'),
                     ('bowl', '碗'), ('bottle', '瓶'), ('ewer', '执壶'),
                     ('basin', '盆'), ('urn', '瓮'), ('wine', '酒'),
                     ('ritual', '礼'), ('ceremonial', '礼仪'), ('sacrificial', '祭'),
                     ('storage', '储'), ('water', '水'), ('food', '食'),
                     ('cooking', '炊'), ('incense', '香'), ('cosmetic', '妆')]:
        if eng in title_lower:
            return title.replace(eng.capitalize(), zh).replace(eng.title(), zh).replace(eng, zh)
    return title


def translate_region(type_str):
    """根据类型返回中文区域描述"""
    if not type_str:
        return '中国艺术藏品'

    typ = type_str.strip()
    typ_lower = typ.lower()

    if 'ceramic' in typ_lower or 'porcelain' in typ_lower or 'pottery' in typ_lower:
        return '中国陶瓷'
    if 'painting' in typ_lower or 'scroll' in typ_lower:
        return '中国绘画'
    if 'jade' in typ_lower:
        return '中国玉器'
    if 'bronze' in typ_lower:
        return '中国青铜器'
    if 'textile' in typ_lower or 'costume' in typ_lower or 'silk' in typ_lower:
        return '中国织物'
    if 'sculpture' in typ_lower or 'figure' in typ_lower:
        return '中国雕塑'
    if 'furniture' in typ_lower:
        return '中国家具'
    if 'metal' in typ_lower:
        return '中国金属工艺'
    if 'lacquer' in typ_lower:
        return '中国漆器'

    return '中国艺术藏品'


def generate_tags_zh(type_en, material_str, period):
    """生成中文标签"""
    tags = set()

    # 从类型翻译标签
    type_zh = translate_type(type_en)
    if type_zh:
        tags.add(type_zh)

    # 从材质提取关键词
    if material_str:
        mat_lower = material_str.lower()
        for eng_key, zh_tag in TAG_KEYWORDS_ZH.items():
            if eng_key in mat_lower:
                tags.add(zh_tag)

    # 从朝代提取
    if period:
        for eng_key, zh_dynasty in PERIOD_KEYWORDS.items():
            if eng_key in period.lower():
                tags.add(zh_dynasty + '朝')
                break

    # 添加"中国艺术"标签
    tags.add('中国艺术')

    # 博物馆标签
    tags.add('芝加哥艺术博物馆')

    return list(tags)[:8]


def parse_dimensions(dim_str):
    """解析尺寸字符串为 {height, width, depth}"""
    result = {'height': 0, 'width': 0}
    if not dim_str:
        return result

    # 取第一部分（cm部分）
    cm_part = dim_str.split('(')[0] if '(' in dim_str else dim_str

    numbers = re.findall(r'[\d]+\.?[\d]*', cm_part)
    if not numbers:
        return result

    nums = [float(n) for n in numbers]

    if len(nums) >= 3:
        result['height'] = nums[0]
        result['width'] = nums[1]
        result['depth'] = nums[2]
    elif len(nums) == 2:
        result['height'] = max(nums[0], nums[1])
        result['width'] = min(nums[0], nums[1])
    elif len(nums) == 1:
        result['height'] = nums[0]
        result['width'] = nums[0]

    return result


def translate_description(desc):
    """基本描述翻译（关键词替换）"""
    if not desc or not desc.strip():
        return ''

    desc = desc.strip()

    # HTML 标签清理
    desc = re.sub(r'<[^>]+>', '', desc)
    desc = re.sub(r'&amp;', '&', desc)
    desc = re.sub(r'&lt;', '<', desc)
    desc = re.sub(r'&gt;', '>', desc)
    desc = re.sub(r'&quot;', '"', desc)
    desc = re.sub(r'&apos;', "'", desc)

    # 基本材质关键词翻译
    for eng_key, zh_term in MATERIAL_KEYWORDS:
        desc = re.sub(
            r'\b' + re.escape(eng_key) + r'\b',
            zh_term,
            desc,
            flags=re.IGNORECASE
        )

    # 世纪/年份翻译
    desc = re.sub(
        r'(\d{1,2})(?:st|nd|rd|th)\s*century',
        lambda m: f'{m.group(1)}世纪',
        desc,
        flags=re.IGNORECASE
    )

    # 基本中文术语替换
    china_terms = {
        'porcelain': '瓷器',
        'ceramic': '陶瓷',
        'Chinese': '中国',
        'Canton': '广州',
        'Beijing': '北京',
        'Nanjing': '南京',
        'Jingdezhen': '景德镇',
        'Taoist': '道教',
        'Buddhist': '佛教',
        'Confucian': '儒家',
        'emperor': '皇帝',
        'dynasty': '朝代',
        'imperial': '皇家',
        'court': '宫廷',
        'temple': '寺庙',
        'palace': '宫殿',
        'garden': '园林',
        'mountain': '山',
        'river': '河',
        'lake': '湖',
        'flower': '花',
        'bird': '鸟',
        'dragon': '龙',
        'phoenix': '凤',
        'lion': '狮',
    }
    for eng, zh in china_terms.items():
        desc = re.sub(r'\b' + re.escape(eng) + r'\b', zh, desc, flags=re.IGNORECASE)

    # 清理多余空格和换行
    desc = re.sub(r'\s+', ' ', desc).strip()

    return desc


def extract_history(description, credit_line):
    """构建历史/来源信息"""
    parts = []

    if description and len(description) > 10:
        # 取第一句
        first_sentence = re.split(r'[.!?]', description)[0].strip()
        if 5 < len(first_sentence) < 300:
            parts.append(first_sentence)

    if credit_line and len(credit_line) > 2:
        parts.append(f'来源: {credit_line}')

    return '。'.join(parts) if parts else ''


def escape_ts(s):
    """转义 TypeScript 字符串"""
    if not s:
        return ''
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')


def build_thumbnail_url(image_url):
    """构建 IIIF 缩略图 URL"""
    if not image_url:
        return ''
    return image_url.replace('/full/full/0/default.jpg', '/full/400,/0/default.jpg')


# ===== 主函数 =====

def main():
    # 检查 CSV 文件
    csv_path = os.path.normpath(CSV_PATH)
    if not os.path.exists(csv_path):
        print(f'ERROR: CSV file not found at {csv_path}')
        sys.exit(1)

    print(f'Reading CSV: {csv_path}')

    # 读取 CSV
    with open(csv_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 使用 csv.DictReader 解析（处理引号内逗号和换行）
    lines = content.splitlines()
    reader = csv.DictReader(lines)

    artifacts = []
    skipped = 0
    stats = {
        'name_translated': 0,
        'name_kept_english': 0,
        'period_mapped': 0,
        'period_rule': 0,
        'period_original': 0,
        'type_mapped': 0,
        'type_original': 0,
        'material_translated': 0,
    }

    for row in reader:
        object_id = row.get('object_id', '').strip()
        title = row.get('title', '').strip()

        if not object_id or not title:
            skipped += 1
            continue

        # 提取字段
        period_en = row.get('period', '').strip()
        type_en = row.get('type', '').strip()
        material_en = row.get('material', '').strip()
        description_en = row.get('description', '').strip()
        dimensions_raw = row.get('dimensions', '').strip()
        museum_en = row.get('museum', '').strip()
        location_en = row.get('location', '').strip()
        image_url = row.get('image_url', '').strip()
        credit_line = row.get('credit_line', '').strip()

        # ===== 翻译 =====

        # 朝代
        era_zh = translate_period(period_en)
        if era_zh != period_en:
            if period_en in PERIOD_MAP:
                stats['period_mapped'] += 1
            else:
                stats['period_rule'] += 1
        else:
            stats['period_original'] += 1

        # 类型
        type_zh = translate_type(type_en)
        if type_zh != type_en:
            stats['type_mapped'] += 1
        else:
            stats['type_original'] += 1

        # 材质
        material_zh = translate_material(material_en)
        if material_zh != material_en:
            stats['material_translated'] += 1

        # 名称
        name_zh = translate_name(title, type_zh, material_zh)
        if name_zh != title:
            stats['name_translated'] += 1
        else:
            stats['name_kept_english'] += 1

        # 区域
        region_zh = translate_region(type_en)

        # 描述
        description_zh = translate_description(description_en)

        # 来源
        history = extract_history(description_en, credit_line)

        # 尺寸
        dims = parse_dimensions(dimensions_raw)

        # 标签
        tags = generate_tags_zh(type_en, material_en, period_en)

        # 图片
        thumbnail = build_thumbnail_url(image_url)

        artifact = {
            'id': object_id,
            'name': name_zh,
            'nameEn': title,  # 保留英文原名
            'era': era_zh,
            'region': region_zh,
            'category': type_zh,
            'material': material_zh,
            'dimensions': dims,
            'description': description_zh,
            'history': history,
            'images': [thumbnail] if thumbnail else [],
            'museum': MUSEUM_ZH if museum_en else '',
            'location': LOCATION_ZH if location_en else '',
            'tags': tags,
        }

        artifacts.append(artifact)

    print(f'\n--- Processing Summary ---')
    print(f'Total artifacts: {len(artifacts)}')
    print(f'Skipped: {skipped}')
    print(f'\nTranslation stats:')
    print(f'  Name translated: {stats["name_translated"]}, kept English: {stats["name_kept_english"]}')
    print(f'  Period: mapped={stats["period_mapped"]}, rule={stats["period_rule"]}, original={stats["period_original"]}')
    print(f'  Type: mapped={stats["type_mapped"]}, original={stats["type_original"]}')
    print(f'  Material translated: {stats["material_translated"]}')

    # ===== 生成 TypeScript =====
    ts_lines = []
    ts_lines.append("import type { Artifact } from '@/types/artifact';")
    ts_lines.append('')
    ts_lines.append('/**')
    ts_lines.append(' * 海外藏中国文物 Mock 数据（中文版）')
    ts_lines.append(' * 数据来源: Art Institute of Chicago (芝加哥艺术博物馆)')
    ts_lines.append(' * 爬取时间: 2026-05-10')
    ts_lines.append(' * 数据提供: knowledge-graph-subsystem (BUCT-CS2305-SE)')
    ts_lines.append(f' * 总记录数: {len(artifacts)}')
    ts_lines.append(' * 翻译: 自动翻译脚本 (scripts/translate_artifacts.py)')
    ts_lines.append(' */')
    ts_lines.append('export const artifacts: Artifact[] = [')

    for i, a in enumerate(artifacts):
        is_last = i == len(artifacts) - 1
        d = a['dimensions']
        dim_parts = [f"height: {d['height']}"]
        dim_parts.append(f"width: {d['width']}")
        if d.get('depth', 0) > 0:
            dim_parts.append(f"depth: {d['depth']}")

        tags_str = ', '.join(f"'{escape_ts(t)}'" for t in a['tags'])
        imgs_str = f"['{escape_ts(a['images'][0])}']" if a['images'] else '[]'

        ts_lines.append('  {')
        ts_lines.append(f"    id: '{escape_ts(a['id'])}',")
        ts_lines.append(f"    name: '{escape_ts(a['name'])}',")
        ts_lines.append(f"    nameEn: '{escape_ts(a['nameEn'])}',")
        ts_lines.append(f"    era: '{escape_ts(a['era'])}',")
        ts_lines.append(f"    region: '{escape_ts(a['region'])}',")
        ts_lines.append(f"    category: '{escape_ts(a['category'])}',")
        ts_lines.append(f"    material: '{escape_ts(a['material'])}',")
        ts_lines.append(f"    dimensions: {{ {', '.join(dim_parts)} }},")
        ts_lines.append(f"    description: '{escape_ts(a['description'])}',")
        ts_lines.append(f"    history: '{escape_ts(a['history'])}',")
        ts_lines.append(f"    images: {imgs_str},")
        ts_lines.append(f"    museum: '{escape_ts(a['museum'])}',")
        ts_lines.append(f"    location: '{escape_ts(a['location'])}',")
        ts_lines.append(f"    tags: [{tags_str}],")
        ts_lines.append('  }' + ('' if is_last else ','))

    ts_lines.append('];')
    ts_lines.append('')
    ts_lines.append('export default artifacts;')
    ts_lines.append('')

    output = '\n'.join(ts_lines)

    # 写入文件
    output_path = os.path.normpath(OUTPUT_PATH)
    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f'\nWritten to: {output_path}')
    print(f'Output size: {size_mb:.2f} MB')
    print('Done!')


if __name__ == '__main__':
    main()
