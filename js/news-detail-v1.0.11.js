import { remark } from "https://cdn.skypack.dev/remark";
import html from "https://cdn.skypack.dev/remark-html";

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const rightSideNum = 4
const gridNum = 4
const bannerCount = 2

function setElem(id, value, attr = 'innerHTML') {
    const elem = document.getElementById(id);
    if (attr === 'innerHTML') {
        elem.innerHTML = value;
    } else if (attr === 'src') {
        elem.srcset = '';
        elem.setAttribute(attr, value);
    } else {
        elem.setAttribute(attr, value);
    }
    return elem;
}

function setChildElem(elem, id, value, count, attr = 'innerHTML') {
    const child = elem.querySelector(`#${id}`);
    child.id = `${id}-${count}`;
    if (attr === 'innerHTML') {
        child.innerHTML = value;
    } else if (attr === 'src') {
        child.setAttribute("srcset", '');
        child.setAttribute(attr, value);
    } else {
        child.setAttribute(attr, value);
    }
    return child;
}

function isMarkdown(str) {
    // Common Markdown patterns to check for
    const markdownPatterns = [
        /#{1,6}\s+.+/m,                     // Headers (# Header)
        /\*\*.+?\*\*/,                      // Bold (**bold**)
        /\*.+?\*/,                          // Italic (*italic*)
        /~~.+?~~/,                          // Strikethrough (~~text~~)
        /^\s*[-*+]\s+.+/m,                  // Unordered lists (- item)
        /^\s*\d+\.\s+.+/m,                  // Ordered lists (1. item)
        /\[.+?\]\(.+?\)/,                   // Links ([text](url))
        /!\[.+?\]\(.+?\)/,                  // Images (![alt](url))
        /`{1,3}[\s\S]+?`{1,3}/,             // Code (inline or blocks)
        /^\s*>\s+.+/m,                      // Blockquotes (> quote)
        /^\s*-{3,}\s*$/m,                   // Horizontal rules (---)
        /^\s*`{3,}(\w+)?\n[\s\S]+?\n`{3,}/m // Code blocks (```code```)
    ];

    // Check if the string matches any of the Markdown patterns
    return markdownPatterns.some(pattern => pattern.test(str));
}

// Enhanced version that also handles HTML within Markdown
function isMarkdownWithHtml(str) {
    return isMarkdown(str);;
}

function getDate(dateStr) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function removeExceedLimit(id, start, end) {
    if (start > end) return;
    for (let i = start; i <= end; i++) {
        const elem = document.getElementById(`${id}-${i}`);
        if (elem) {
            elem.remove();
        }
    }
}
async function getNewsList() {
    try {
        const response = await fetch(
            `${strapiUrl}/api/news-blocks?populate=*&sort[0]=highlight:desc&sort[1]=ranking:asc&sort[2]=createdAt:desc&pagination[limit]=8`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );
        const data = await response.json();
        const newsList = data.data
        const nsc = displayNewsGrid(newsList, 'ns', rightSideNum, false, false, true, true);
        const ntc = displayNewsGrid(newsList, 'nt', gridNum, true, false, false);

        removeExceedLimit('ns', nsc, rightSideNum);
        removeExceedLimit('nt', ntc, gridNum);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayNewsGrid(data, id, num, hasImg = false, hasDes = false, rmDisplay = true, isHighlight = false) {
    let itemCount = 1;
    for (const item of data) {
        if (isHighlight && !item.highlight) continue;
        if (itemCount > num) break;
        const elem = setElem(`${id}-${itemCount}`, `/news/detail?slug=${item.slug}`, 'href');
        setChildElem(elem, `${id}-date`, getDate(item?.dateCreated || item?.createdAt), itemCount);
        setChildElem(elem, `${id}-type`, item?.category || '', itemCount);
        setChildElem(elem, `${id}-title`, item?.name || '', itemCount);
        setChildElem(elem, `${id}-read`, item?.read || 1, itemCount);
        if (hasImg) {
            const img = setChildElem(elem, `${id}-img`, `${strapiUrl}${item?.blogImage?.url || ''}`, itemCount, 'src');
            img.alt = `news-blog-${itemCount}`;
        }
        if (hasDes) {
            setChildElem(elem, `${id}-des`, item?.shortDescription || "", itemCount);
        }
        itemCount++;
    }
    if (rmDisplay) {
        data.splice(0, itemCount - 1)
    }
    return itemCount;
}
async function getAdsBanners() {
    try {
        const response = await fetch(`${strapiUrl}/api/ads-banners?populate=*&sort=createdAt:desc&pagination[limit]=2`, {
            headers: {
                Authorization: `Bearer ${strapiToken}`,
            },
        });
        const data = await response.json();

        for (let i = 1; i <= bannerCount; i++) {
            if (!data.data[i - 1]) {
                continue;
            }
            const elem = setElem(`bb-${i}`, data.data[i - 1]?.adsLink || '#', 'href');
            const img = setChildElem(elem, `bb-img`, `${strapiUrl}${data.data[i - 1]?.adsImage?.url || ''}`, i, 'src');
            img.alt = `ads-banner-${i}`;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
async function convertMarkdownToHTML(markdown) {
    const result = await remark().use(html).process(markdown);
    return result.toString();
}


async function getNewsDetail() {
    const sectionId = window.location.search.substring(6)
    if (!sectionId) return;

    try {
        const response = await fetch(
            `${strapiUrl}/api/news-blocks?populate=*&filters[slug][$eq]=${sectionId}`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );
        const data = await response.json()
        const item = data.data[0]
        setElem('n-img', `${strapiUrl}${item?.blogImage?.url || 'https://btc-addict-cms.meesolution.com/uploads/67c66d67c8f5765d23303f14_bn_20350_20web_172107fa04.png'}`, 'src')
        setElem('n-date', getDate(item?.createdAt))
        setElem('n-type', item?.category || '')
        setElem('n-title', item?.name || '')
        setElem('n-read', item?.read || '')

        if (isMarkdownWithHtml(item?.content)) {
            const htmlContent = await convertMarkdownToHTML(item?.content)
            setElem('n-des', htmlContent || '')
        } else {
            setElem('n-des', item?.content || '')
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

async function getAnnouncement() {
    try {
        const response = await fetch(
            `${strapiUrl}/api/announcements?populate=*&sort=createdAt:desc`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );
        const data = await response.json();
        const announcement = data.data[0]
        if (announcement) {
            setElem('announcement-text', announcement.description)
        } else {
            const announcementTab = document.getElementById('announcement')
            if (announcementTab) {
                announcementTab.remove()
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

(function () {
    getNewsList()
    getAdsBanners()
    getNewsDetail()
    getAnnouncement()
})()
