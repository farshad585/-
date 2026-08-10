import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://40gates.ir';
const TODAY = new Date().toISOString().split('T')[0];

function extractProducts() {
  const filePath = path.join(process.cwd(), 'src/data/products.ts');
  if (!fs.existsSync(filePath)) return [];
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const products = [];
  const regex = /id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    products.push({ id: match[1], title: match[2] });
  }
  return products;
}

function extractBlogPosts() {
  const filePath = path.join(process.cwd(), 'src/data/blog.ts');
  if (!fs.existsSync(filePath)) return [];
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const posts = [];
  // Focus on BLOG_ARTICLES array
  const articlesSection = fileContent.split('export const ALL_FAQS')[0] || fileContent;
  const regex = /id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(articlesSection)) !== null) {
    if (!match[1].startsWith('faq-')) {
      posts.push({ id: match[1], title: match[2] });
    }
  }
  return posts;
}

export function generateSitemapXML() {
  const products = extractProducts();
  const blogPosts = extractBlogPosts();

  const staticUrls = [
    { loc: `${DOMAIN}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${DOMAIN}/shop`, priority: '0.9', changefreq: 'daily' },
    { loc: `${DOMAIN}/blog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${DOMAIN}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${DOMAIN}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${DOMAIN}/faq`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${DOMAIN}/legal`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${DOMAIN}/dream-game`, priority: '0.6', changefreq: 'weekly' },
  ];

  const productUrls = products.flatMap(p => [
    { loc: `${DOMAIN}/product/${p.id}`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${DOMAIN}/#product/${p.id}`, priority: '0.8', changefreq: 'weekly' }
  ]);

  const blogUrls = blogPosts.flatMap(b => [
    { loc: `${DOMAIN}/blog/${b.id}`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${DOMAIN}/#blog/${b.id}`, priority: '0.8', changefreq: 'weekly' }
  ]);

  const allUrls = [...staticUrls, ...productUrls, ...blogUrls];

  const xmlUrls = allUrls.map(item => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

export function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${DOMAIN}/sitemap.xml
`;
}

function run() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const xml = generateSitemapXML();
  const robots = generateRobotsTxt();

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

  console.log(`✅ Automated sitemap.xml generated with ${xml.split('<url>').length - 1} URLs!`);
  console.log(`✅ robots.txt generated successfully!`);
}

run();
