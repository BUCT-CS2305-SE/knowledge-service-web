import type { Artifact } from '@/types/artifact';

export const artifacts: Artifact[] = [
  {
    id: '001',
    name: '罗塞塔石碑',
    nameEn: 'Rosetta Stone',
    era: '公元前196年',
    region: '古埃及',
    category: '石碑铭文',
    material: '花岗闪长岩',
    dimensions: { height: 114.4, width: 72.3, depth: 28.4 },
    description: '罗塞塔石碑是一块制作于公元前196年的花岗闪长岩石碑，刻有古埃及国王托勒密五世的诏书。这块石碑的特殊之处在于其内容以三种文字书写：古埃及象形文字、埃及草书和古希腊文。',
    history: '1799年由法国士兵发现于埃及罗塞塔城。1801年英国获得此石碑，1822年法国学者商博良成功破译象形文字。现藏大英博物馆。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rosetta_Stone.jpg/800px-Rosetta_Stone.jpg'
    ],
    museum: '大英博物馆',
    location: '英国伦敦',
    tags: ['石碑', '文字', '解码', '托勒密王朝']
  },
  {
    id: '002',
    name: '图坦卡蒙黄金面具',
    era: '约公元前1323年',
    region: '古埃及',
    category: '丧葬用品',
    material: '黄金、青金石、黑曜石',
    dimensions: { height: 54, width: 39.3, depth: 49 },
    description: '由纯金打造，重约11公斤。镶嵌青金石、黑曜石等宝石，完美呈现年轻法老容貌。',
    history: '1922年霍华德·卡特在帝王谷发现图坦卡蒙陵墓。这是保存最完整的法老陵墓之一。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tutanchamun_Maske.jpg/800px-Tutanchamun_Maske.jpg'
    ],
    museum: '埃及博物馆',
    location: '埃及开罗',
    tags: ['黄金', '法老', '面具', '陵墓']
  },
  {
    id: '003',
    name: '断臂维纳斯',
    nameEn: 'Venus de Milo',
    era: '公元前130-100年左右',
    region: '古希腊',
    category: '雕塑',
    material: '帕罗斯大理石',
    dimensions: { height: 202, width: 52 },
    // 注意：depth 字段缺失
    description: '描绘希腊爱与美之神阿佛洛狄忒。虽失去双臂，但优美的身体曲线使其成为艺术史经典之作。',
    history: '1820年在希腊米洛斯岛被发现。关于双臂缺失原因至今有争议。现藏卢浮宫。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Venus_de_Milo_Louvre_Ma399_n1.jpg/800px-Venus_de_Milo_Louvre_Ma399_n1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Venus_de_Milo_Louvre_Ma399_n4.jpg/400px-Venus_de_Milo_Louvre_Ma399_n4.jpg'
    ],
    museum: '卢浮宫博物馆',
    // location 字段缺失 - 模拟真实数据不完整
    tags: ['雕塑', '女神', '希腊化时期', '美']
  },
  {
    id: '004',
    name: '大卫像',
    nameEn: 'David',
    era: '1501-1504',
    region: '意大利文艺复兴',
    category: '圆雕',
    material: '卡拉拉大理石',
    dimensions: { height: 517, width: 150, depth: 81 },
    description: '米开朗基罗26岁时创作的大理石雕像，高5.17米。描绘圣经英雄大卫与歌利亚战斗前的瞬间，展现完美人体比例和解剖学准确性。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Michelangelo%27s_David_-_right_view_2.jpg/400px-Michelangelo%27s_David_-_right_view_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Michelangelo%27s_David_face_detail.jpg/320px-Michelangelo%27s_David_face_detail.jpg'
    ],
    museum: '学院美术馆 (Galleria dell\'Accademia)',
    location: '意大利佛罗伦萨',
    tags: ['文艺复兴', '米开朗基罗', '圣经', '人体美']
  },
  {
    id: '005',
    name: '蒙娜丽莎',
    era: '1503-1519年间',
    region: '意大利',
    category: '肖像油画',
    material: '杨木板油画',
    dimensions: { height: 77, width: 53 },
    description: '达·芬奇最著名的画作。"神秘的微笑"成为世界文化符号。运用独创的"晕涂法"技法。',
    // history 字段较短 - 模拟数据差异
    history: '1911年曾失窃两年后找回。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
    ],
    museum: '卢浮宫',
    location: '法国巴黎',
    tags: ['达·芬奇', '肖像画', '文艺复兴', '世界名画']
  },
  {
    id: '006',
    name: '秦始皇陵兵马俑',
    // nameEn 缺失
    era: '秦代（约公元前210年）',
    region: '中国古代',
    category: '陶塑',
    material: '陶土',
    dimensions: { height: 185, width: 60, depth: 60 },
    description: '1973年陕西临潼发现。已发掘三个兵马俑坑，总计约8000件陶俑陶马。每个兵马俑的面部表情、发型、服饰各不相同。',
    history: '1987年被列入联合国教科文组织世界遗产名录。被誉为"世界第八大奇迹"。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Terracotta_Army_in_Xian.jpg/800px-Terracotta_Army_in_Xian.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Terracotta_Army_%281287103754%29.jpg/320px-Terracotta_Army_%281287103754%29.jpg'
    ],
    museum: '秦始皇帝陵博物院',
    location: '中国陕西西安临潼区',
    tags: ['秦朝', '世界遗产', '考古发现', '中国文物']
  },
  {
    id: '007',
    name: '帕特农神庙浮雕',
    era: '公元前447-432年',
    region: '古希腊',
    category: '建筑构件',
    material: '彭特利克大理石',
    dimensions: { height: 120, width: 80 },
    description: '原属雅典卫城帕特农神庙的装饰性雕刻。包括三角楣饰、间板和浮雕带，描绘众神与巨人战斗等神话场景。',
    // museum 和 location 使用不同格式
    museum: 'British Museum',
    location: 'London, UK',
    tags: ['古典希腊', '建筑雕塑', '埃尔金大理石', '争议文物']
  },
  {
    id: '008',
    name: '纳尔逊纪念柱',
    era: '1840-1843年建成',
    region: '英国',
    category: '纪念碑',
    material: '花岗岩基座 + 铜制雕像',
    dimensions: { height: 516, width: 40 },
    // description 较短
    description: '纪念特拉法加海战中阵亡的海军中将纳尔逊。',
    history: '',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Nelsons_Column_Looking_West_-_Trafalgar_Square_-_London_-_England_-_01_July_2014.jpg/800px-Nelsons_Column_Looking_West_-_Trafalgar_Square_-_London_-_England_-_01_July_2014.jpg'
    ],
    // 直接位于广场，无博物馆收藏
    tags: ['纪念碑', '维多利亚时代', '英国历史']
  },
  {
    id: '009',
    name: '三星堆青铜纵目面具',
    era: '商代晚期（约公元前1200-1046年）',
    region: '中国古蜀文明',
    category: '青铜礼器',
    material: '青铜',
    dimensions: { height: 138, width: 98, depth: 45 },
    description: '1986年祭祀坑出土。高度超过1.3米，重量超过100公斤。突出的圆柱形双眼暗示古蜀人可能存在不同的审美观念或宗教信仰。',
    history: '2021年新发现6个祭祀坑再次出土大量珍贵文物，进一步证实三星堆文明的高度发达。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sanxingdui_bronze_mask_with_protruding_eyes.jpg/800px-Sanxingdui_bronze_mask_with_protruding_eyes.jpg'
    ],
    museum: '三星堆博物馆',
    location: '四川广汉市',
    tags: ['青铜器', '古蜀国', '神秘文明', '考古']
  },
  {
    id: '010',
    name: '自由女神像',
    nameEn: 'Statue of Liberty',
    era: '1886年10月28日揭幕',
    region: '美国',
    category: '纪念碑式雕塑',
    material: '铜片外包 + 钢铁内部框架',
    dimensions: { height: 930, width: 270 }, // 含底座总高
    description: '法国人民赠送给美国独立100周年的礼物。右手高举火炬，左手持独立宣言书牌，脚下散落着断裂的锁链。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/800px-Statue_of_Liberty_7.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Liberty_Crown_from_Base.jpg/320px-Liberty_Crown_from_Base.jpg'
    ],
    museum: '美国国家公园管理局 (National Park Service)',
    location: '纽约港自由岛',
    tags: ['自由', '法国赠礼', '美国象征', '世界文化遗产']
  },
  // 新增更多不规则数据
  {
    id: '011',
    name: '死海古卷轴',
    era: '公元前3世纪至公元1世纪',
    region: '古代近东',
    category: '手稿文献',
    material: '羊皮纸、莎草纸',
    dimensions: { height: 26, width: 18 },
    description: '1947-1956年间在死海附近的昆兰洞穴中发现。包含《希伯来圣经》除《以斯帖记》外的全部经卷，以及大量次经和教派文献。',
    // images 数组为空 - 模拟部分文物无公开图片
    images: [],
    museum: '以色列博物馆',
    location: '耶路撒冷',
    tags: ['圣经研究', '考古发现', '犹太教', '手稿']
  },
  {
    id: '012',
    name: '敦煌莫高窟壁画',
    era: '北魏至元代（公元4-14世纪）',
    region: '中国',
    category: '佛教艺术',
    material: '矿物颜料 + 泥地',
    dimensions: { height: 1600, width: 45000 }, // 整体规模
    description: '现存洞窟735个，壁画4.5万平方米，彩塑2415身。内容涵盖佛本生故事、经变画、供养人像等，被誉为"东方艺术明珠"。',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mogao_Caves_Flying_Apsaras.jpg/320px-Mogao_Caves_Flying_Apsaras.jpg'
    ],
    museum: '敦煌研究院管理',
    location: '甘肃敦煌',
    tags: ['丝绸之路', '佛教艺术', '世界遗产', '壁画']
  }
];

export default artifacts;
