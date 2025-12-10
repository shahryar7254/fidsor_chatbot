import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Endpoint to extract text from URL (with comprehensive crawling)
app.post('/api/extract-url', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🌍 Starting full website crawl from: ${url}`);

    let browser;
    try {
        // Launch browser with explicit path
        browser = await puppeteer.launch({
            headless: true,
            executablePath: puppeteer.executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
        });

        const page = await browser.newPage();

        // Extract domain from URL
        const urlObj = new URL(url);
        const baseDomain = urlObj.hostname;
        const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

        // Set to track visited URLs
        const visitedUrls = new Set();
        const toVisit = [url];
        const maxPages = 1500;

        // Priority keywords for important pages
        const priorityKeywords = [
            'about', 'service', 'product', 'career', 'job', 'team',
            'contact', 'technology', 'industry', 'solution', 'portfolio',
            'mission', 'vision', 'who-we-are', 'what-we-do', 'insight'
        ];

        let allContent = '';
        let pageCount = 0;

        // Helper to check if URL contains priority keywords
        const isPriorityUrl = (url) => {
            const urlLower = url.toLowerCase();
            return priorityKeywords.some(keyword => urlLower.includes(keyword));
        };

        // Crawl pages
        while (toVisit.length > 0 && pageCount < maxPages) {
            // Sort toVisit to prioritize important pages
            toVisit.sort((a, b) => {
                const aPriority = isPriorityUrl(a) ? 0 : 1;
                const bPriority = isPriorityUrl(b) ? 0 : 1;
                return aPriority - bPriority;
            });

            const currentUrl = toVisit.shift();

            // Skip if already visited
            if (visitedUrls.has(currentUrl)) continue;

            visitedUrls.add(currentUrl);
            pageCount++;

            console.log(`  📄 Crawling page ${pageCount}/${maxPages}: ${currentUrl}`);

            try {
                // Navigate to URL
                await page.goto(currentUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 60000
                });

                // Wait for JavaScript to render (3000ms - safer for SPAs)
                await new Promise(r => setTimeout(r, 3000));

                // Try to interact with navigation menus
                try {
                    await page.evaluate(() => {
                        const navItems = document.querySelectorAll('nav a, nav button, .menu a, .navbar a, header a');
                        navItems.forEach(item => {
                            item.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                            item.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                        });
                    });
                    await new Promise(r => setTimeout(r, 300));
                } catch (e) {
                    // Menu interaction failed, continue
                }

                // Extract content and links
                const pageData = await page.evaluate((currentUrl, baseUrl) => {
                    const clean = (str) => str ? str.replace(/\s+/g, ' ').trim() : '';

                    // Safety check
                    if (!document.body) {
                        return {
                            title: 'Page Not Loaded',
                            text: '',
                            links: [],
                            buttons: [],
                            url: currentUrl
                        };
                    }

                    const pageTitle = document.title || 'Untitled Page';
                    const bodyText = document.body.innerText || '';

                    // Get all links
                    const linkSelectors = [
                        'a[href]', 'nav a', 'header a', 'footer a',
                        '[role="navigation"] a', '.menu a', '.nav a',
                        '.navbar a', '.dropdown a', 'ul li a'
                    ];

                    const allLinks = new Set();
                    linkSelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(a => {
                            if (a.href) allLinks.add(a);
                        });
                    });

                    const links = Array.from(allLinks).map(a => {
                        const text = clean(a.innerText || a.textContent);
                        let href = a.getAttribute('href');

                        if (!href) return null;

                        try {
                            if (!href.startsWith('http')) {
                                href = new URL(href, baseUrl).href;
                            }
                        } catch (e) {
                            return null;
                        }

                        href = href.split('#')[0];

                        if (!href || href === baseUrl || href === baseUrl + '/' ||
                            href.startsWith('javascript') ||
                            href.startsWith('mailto') || href.startsWith('tel')) {
                            return null;
                        }

                        return text && href
                            ? { text, href, display: `- [Link] ${text}: ${href}` }
                            : null;
                    }).filter(Boolean);

                    const buttons = Array.from(document.querySelectorAll('button')).map(b => {
                        const text = clean(b.innerText);
                        return text ? `- [Button] ${text}` : null;
                    }).filter(Boolean);

                    return {
                        title: pageTitle,
                        text: bodyText,
                        links: links,
                        buttons: buttons,
                        url: currentUrl
                    };
                }, currentUrl, baseUrl);

                console.log(`    Found ${pageData.links.length} links on this page`);

                if (pageData.links.length > 0 && pageData.links.length <= 10) {
                    console.log(`    Links: ${pageData.links.map(l => l.text).join(', ')}`);
                }

                // Add this page's content
                allContent += `
========================================
PAGE: ${pageData.title}
URL: ${pageData.url}
========================================

CONTENT:
${pageData.text}

INTERACTIVE ELEMENTS:
${pageData.links.map(l => l.display).join('\n')}
${pageData.buttons.join('\n')}

`;

                // Find new internal links to visit
                for (const link of pageData.links) {
                    try {
                        const linkUrl = new URL(link.href);
                        if (linkUrl.hostname === baseDomain && !visitedUrls.has(link.href)) {
                            toVisit.push(link.href);
                        }
                    } catch (e) {
                        // Invalid URL, skip
                    }
                }

            } catch (error) {
                console.log(`    ⚠️ Failed to crawl ${currentUrl}: ${error.message}`);
            }
        }

        console.log(`✅ Crawled ${pageCount} pages from ${baseDomain}`);
        console.log(`📊 Total content length: ${allContent.length} characters`);

        const limitedText = allContent.slice(0, 200000);

        res.json({ text: limitedText });

    } catch (error) {
        console.error('❌ Scraping failed:', error);
        res.status(500).json({
            error: 'Failed to extract content',
            details: error.message
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(port, () => {
    console.log(`🚀 Backend server running at http://localhost:3000`);
    console.log(`📡 Endpoint: POST /api/extract-url`);
    console.log(`🕷️  Will crawl up to 1500 pages per website`);
    console.log(`⭐ Prioritizes: About, Services, Products, Career, Team, Contact, etc.`);
    console.log(`⚡ OPTIMIZED MODE: 0.6s wait per page (~12-15 mins for 1000 pages)`);
    console.log(`🌐 Works with ANY website!`);
});
