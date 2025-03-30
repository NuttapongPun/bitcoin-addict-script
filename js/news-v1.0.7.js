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
const highlightNum = 5
const rightSideNum = 6
const gridNum = 12
const bannerCount = 2
let offset = 0

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
        const highlightRes = await fetch(
            `${strapiUrl}/api/news-blocks?populate=*&sort[0]=highlight:desc&filters[highlight][$eq]=true&sort[1]=ranking:asc&sort[2]=createdAt:desc&pagination[limit]=${rightSideNum}`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );

        const response = await fetch(
            `${strapiUrl}/api/news-blocks?populate=*&sort[0]=createdAt:desc&pagination[limit]=${highlightNum + gridNum}&pagination[start]=${offset * (highlightNum + gridNum)}`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );

        const data = await response.json()
        const highlight = await highlightRes.json()
        const nsc = displayNewsGrid(highlight.data, 'ns', rightSideNum, false, false, false, true);

        const newsList = data.data
        const nhc = displayNewsGrid(newsList, 'nh', highlightNum, true, true);
        const ntc = displayNewsGrid(newsList, 'nt', gridNum, true, false, false);

        removeExceedLimit('nh', nhc, highlightNum);
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
    getAnnouncement()
})()
