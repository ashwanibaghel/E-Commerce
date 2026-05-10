import { ProductData } from './ProductContext.js';

type ProductDetails = {
  highlights: string[];
  specs: Array<{ label: string; value: string }>;
  box: string[];
  service: string[];
};

const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

const getRawHtml = (product: ProductData) =>
  (product.description || [])
    .flatMap((row) => row.columns || [])
    .flatMap((column) => column.data?.blocks || [])
    .filter((block) => block.type === 'raw')
    .map((block) => block.data?.html || '')
    .join('\n');

const extractList = (html: string, className: string) => {
  const match = html.match(
    new RegExp(`<ul[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/ul>`, 'i')
  );
  if (!match) {
    return [];
  }
  return Array.from(match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map((item) => stripTags(item[1]))
    .filter(Boolean);
};

const extractSpecs = (html: string) => {
  const match = html.match(
    /<div[^>]*class=["'][^"']*baghel-detail-specs[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  );
  if (!match) {
    return [];
  }
  return Array.from(match[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map((item) => {
      const text = stripTags(item[1]);
      const [label, ...rest] = text.split(':');
      return {
        label: (label || '').trim(),
        value: rest.join(':').trim()
      };
    })
    .filter((item) => item.label && item.value);
};

const extractWarranty = (html: string) => {
  const match = html.match(
    /<p[^>]*class=["'][^"']*baghel-detail-warranty[^"']*["'][^>]*>([\s\S]*?)<\/p>/i
  );
  return match ? stripTags(match[1]) : '';
};

const getCustomDetails = (product: ProductData): ProductDetails | null => {
  const html = getRawHtml(product);
  if (!html.includes('baghel-product-data')) {
    return null;
  }

  const highlights = extractList(html, 'baghel-detail-highlights');
  const specs = extractSpecs(html);
  const box = extractList(html, 'baghel-detail-box');
  const service = extractList(html, 'baghel-detail-service');
  const warranty = extractWarranty(html);

  return {
    highlights,
    specs: [
      { label: 'Brand', value: 'Baghel Digital' },
      { label: 'Model', value: product.name },
      { label: 'SKU', value: product.sku },
      ...specs,
      { label: 'Payment', value: 'Cash on Delivery available' },
      { label: 'Warranty', value: warranty || '1 year standard service support' }
    ],
    box,
    service
  };
};

const profileMap: Array<{
  test: RegExp;
  highlights: string[];
  specs: Array<{ label: string; value: string }>;
  box: string[];
}> = [
  {
    test: /PHONE|SMARTPHONE/i,
    highlights: [
      '6.7 inch AMOLED display with smooth refresh rate',
      '5G ready performance for streaming, gaming and work',
      'Pro camera system for low-light photos and crisp video',
      'Fast charging battery built for all-day usage'
    ],
    specs: [
      { label: 'Display', value: '6.7 inch AMOLED, 120Hz' },
      { label: 'Storage', value: '256GB internal storage' },
      { label: 'Camera', value: 'Triple pro camera with night mode' },
      { label: 'Battery', value: '5000mAh with fast charging' },
      { label: 'Connectivity', value: '5G, Wi-Fi, Bluetooth, USB-C' }
    ],
    box: ['Smartphone', 'USB-C cable', 'SIM ejector tool', 'Warranty card']
  },
  {
    test: /LAPTOP|AIRBOOK/i,
    highlights: [
      'Slim metal laptop for office, study and business work',
      'Fast SSD storage for quick boot and app loading',
      'Bright 14 inch display with premium viewing clarity',
      'Comfort keyboard and long battery backup'
    ],
    specs: [
      { label: 'Display', value: '14 inch FHD IPS display' },
      { label: 'Memory', value: '16GB RAM' },
      { label: 'Storage', value: '512GB SSD' },
      { label: 'Battery', value: 'Up to 10 hours typical usage' },
      { label: 'Ports', value: 'USB-C, USB-A, HDMI, audio jack' }
    ],
    box: ['Laptop', 'Power adapter', 'User guide', 'Warranty card']
  },
  {
    test: /HEADPHONES|ANC/i,
    highlights: [
      'Active noise cancellation for focused listening',
      'Soft over-ear cushions for long comfort',
      'Deep bass tuning with clear voice calls',
      'Wireless playback with quick pairing'
    ],
    specs: [
      { label: 'Audio', value: 'ANC wireless stereo headphones' },
      { label: 'Battery', value: 'Up to 35 hours playback' },
      { label: 'Controls', value: 'On-ear controls with voice assistant' },
      { label: 'Charging', value: 'USB-C fast charging' },
      { label: 'Microphone', value: 'Dual mic call clarity' }
    ],
    box: ['Headphones', 'USB-C cable', 'Carry pouch', 'User guide']
  },
  {
    test: /WATCH|SMARTWATCH/i,
    highlights: [
      'AMOLED display with premium metal finish',
      'Health tracking, activity modes and sleep insights',
      'Bluetooth calling and smart notifications',
      'Long battery backup for daily use'
    ],
    specs: [
      { label: 'Display', value: 'AMOLED touch display' },
      { label: 'Sensors', value: 'Heart rate, SpO2, sleep tracking' },
      { label: 'Calling', value: 'Bluetooth calling supported' },
      { label: 'Battery', value: 'Up to 7 days typical use' },
      { label: 'Water Resistance', value: 'Splash resistant body' }
    ],
    box: ['Smartwatch', 'Magnetic charger', 'Strap', 'Warranty card']
  },
  {
    test: /TV|QLED|MONITOR/i,
    highlights: [
      'Premium large-screen viewing with sharp detail',
      'Rich colors for movies, sports and gaming',
      'Smart connectivity for entertainment and work',
      'Slim modern design for a clean setup'
    ],
    specs: [
      { label: 'Panel', value: '4K display with vivid color tuning' },
      { label: 'Refresh Rate', value: 'Smooth motion panel' },
      { label: 'Audio', value: 'Built-in stereo speakers' },
      { label: 'Connectivity', value: 'HDMI, USB, Wi-Fi, Bluetooth' },
      { label: 'Use Case', value: 'Entertainment, gaming and office setup' }
    ],
    box: ['Display unit', 'Remote or stand kit', 'Power cable', 'Warranty card']
  },
  {
    test: /SPEAKER|SOUNDBAR|CINEBAR/i,
    highlights: [
      'Powerful bass with clear vocals',
      'Wireless playback for music and entertainment',
      'Premium cabinet design with rich sound output',
      'Easy setup for home, shop or office'
    ],
    specs: [
      { label: 'Audio Type', value: 'Wireless premium speaker system' },
      { label: 'Connectivity', value: 'Bluetooth, AUX and USB support' },
      { label: 'Sound', value: 'Bass tuned stereo output' },
      { label: 'Controls', value: 'Button and remote control support' },
      { label: 'Best For', value: 'Music, TV and gatherings' }
    ],
    box: ['Audio unit', 'Charging or power cable', 'User guide', 'Warranty card']
  },
  {
    test: /CAMERA|DRONE|CCTV|SECURECAM|FOCUSPRO/i,
    highlights: [
      'Sharp video capture for creators and security',
      'Compact body with reliable performance',
      'Easy mobile-friendly setup and usage',
      'Clear recording for travel, shop and home needs'
    ],
    specs: [
      { label: 'Video', value: 'High-resolution video recording' },
      { label: 'Lens', value: 'Wide-angle capture' },
      { label: 'Storage', value: 'Memory card support' },
      { label: 'Connectivity', value: 'Wi-Fi or USB transfer' },
      { label: 'Use Case', value: 'Travel, vlogging, security and events' }
    ],
    box: ['Camera unit', 'Cable', 'Mounting accessories', 'Warranty card']
  },
  {
    test: /POWER|CHARGER|VOLT|SPARK/i,
    highlights: [
      'Fast charging support for daily devices',
      'Compact and travel-friendly design',
      'Multiple safety protections built in',
      'Reliable backup for phones and accessories'
    ],
    specs: [
      { label: 'Output', value: 'Fast charging supported' },
      { label: 'Ports', value: 'USB and USB-C support' },
      { label: 'Protection', value: 'Overload and temperature protection' },
      { label: 'Compatibility', value: 'Phones, earbuds, tablets and accessories' },
      { label: 'Build', value: 'Compact premium casing' }
    ],
    box: ['Charging device', 'Cable if applicable', 'User guide', 'Warranty card']
  },
  {
    test: /ROUTER|HYPERLINK/i,
    highlights: [
      'Wi-Fi 6 performance for fast home and office internet',
      'Stable coverage for multiple connected devices',
      'Smooth streaming, gaming and work calls',
      'Simple setup with secure network controls'
    ],
    specs: [
      { label: 'Wi-Fi Standard', value: 'Wi-Fi 6 dual band' },
      { label: 'Coverage', value: 'Designed for home and office spaces' },
      { label: 'Ports', value: 'WAN and LAN ethernet ports' },
      { label: 'Security', value: 'Modern network encryption' },
      { label: 'Best For', value: 'Streaming, gaming and multi-device use' }
    ],
    box: ['Router', 'Power adapter', 'Ethernet cable', 'Quick start guide']
  },
  {
    test: /KEYBOARD|MOUSE|GLIDE|TITAN/i,
    highlights: [
      'Premium desk accessory for work and gaming',
      'Comfortable control for long usage',
      'Reliable wireless or wired performance',
      'Modern finish for a clean setup'
    ],
    specs: [
      { label: 'Type', value: 'Premium computer accessory' },
      { label: 'Connectivity', value: 'Wireless or USB support' },
      { label: 'Design', value: 'Ergonomic daily-use build' },
      { label: 'Compatibility', value: 'Windows, macOS and supported devices' },
      { label: 'Best For', value: 'Office, gaming and study setup' }
    ],
    box: ['Accessory unit', 'Cable or receiver', 'User guide', 'Warranty card']
  },
  {
    test: /PRINTER|PROJECTOR|BEAMPRO|OFFICEJET/i,
    highlights: [
      'Office-ready performance for professional use',
      'Compact setup with premium finish',
      'Reliable output for daily business needs',
      'Simple controls and easy maintenance'
    ],
    specs: [
      { label: 'Type', value: 'Smart office electronics' },
      { label: 'Output', value: 'High clarity professional output' },
      { label: 'Connectivity', value: 'USB and wireless support where applicable' },
      { label: 'Use Case', value: 'Office, meetings and business work' },
      { label: 'Support', value: 'Local guidance and setup help' }
    ],
    box: ['Main unit', 'Power cable', 'Starter accessories', 'Warranty card']
  },
  {
    test: /FRIDGE|WASHER|WASHING|AC|COOLAIR|FROSTMAX/i,
    highlights: [
      'Premium home appliance for modern families',
      'Energy-efficient operation for everyday savings',
      'Clean design with dependable performance',
      'Installation guidance and local support available'
    ],
    specs: [
      { label: 'Type', value: 'Premium home appliance' },
      { label: 'Efficiency', value: 'Energy-saving performance' },
      { label: 'Build', value: 'Durable body with premium finish' },
      { label: 'Use Case', value: 'Home, shop and office utility' },
      { label: 'Support', value: 'Installation guidance available' }
    ],
    box: ['Appliance unit', 'Required accessories', 'User manual', 'Warranty card']
  }
];

export function getProductDetails(product: ProductData): ProductDetails {
  const customDetails = getCustomDetails(product);
  if (customDetails) {
    return {
      highlights:
        customDetails.highlights.length > 0
          ? customDetails.highlights
          : ['Premium electronics item from Baghel Digital'],
      specs: customDetails.specs,
      box:
        customDetails.box.length > 0
          ? customDetails.box
          : ['Main unit', 'Required accessories', 'Warranty card'],
      service:
        customDetails.service.length > 0
          ? customDetails.service
          : [
              'Cash on Delivery available on eligible local orders',
              'Quality checked before dispatch',
              'Local setup guidance and after-sales support',
              'Secure packaging for safer delivery'
            ]
    };
  }

  const searchable = `${product.sku} ${product.name}`;
  const profile =
    profileMap.find(({ test }) => test.test(searchable)) || profileMap[0];
  const weight = product.weight?.value
    ? `${product.weight.value} ${product.weight.unit || 'kg'}`
    : 'As per selected model';

  return {
    highlights: profile.highlights,
    specs: [
      { label: 'Brand', value: 'Baghel Digital' },
      { label: 'Model', value: product.name },
      { label: 'SKU', value: product.sku },
      ...profile.specs,
      { label: 'Weight', value: weight },
      { label: 'Payment', value: 'Cash on Delivery available' },
      { label: 'Warranty', value: '1 year standard service support' }
    ],
    box: profile.box,
    service: [
      'Cash on Delivery available on eligible local orders',
      'Quality checked before dispatch',
      'Local setup guidance and after-sales support',
      'Secure packaging for safer delivery'
    ]
  };
}
