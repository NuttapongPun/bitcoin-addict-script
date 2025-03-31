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
async function getNewsList(page = 1) {
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
            `${strapiUrl}/api/news-blocks?populate=*&sort[0]=createdAt:desc&pagination[limit]=${gridNum}&pagination[start]=${(+page - 1) * (gridNum)}`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );

        const latestRes = await fetch(
            `${strapiUrl}/api/news-blocks?populate=*&sort[0]=createdAt:desc&pagination[limit]=${highlightNum}`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );

        const data = await response.json()
        const highlight = await highlightRes.json()
        const latest = await latestRes.json()
        const nsc = displayNewsGrid(highlight.data, 'ns', rightSideNum, false, false, false, true);
        const nhc = displayNewsGrid(latest.data, 'nh', highlightNum, true, true, false);
        const ntc = displayNewsGrid(data.data, 'nt', gridNum, true, false, false);

        removeExceedLimit('nh', nhc, highlightNum);
        removeExceedLimit('ns', nsc, rightSideNum);
        removeExceedLimit('nt', ntc, gridNum);

        displayPagination(data.meta.pagination.total, gridNum, +page)
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

function displayPagination(total, pageSize, page = 1) {
    const totalPages = Math.ceil(total / pageSize);
    const maxButtons = 10;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages <= maxButtons) {
        // Case: total pages is less than maximum buttons
        // Show all pages (e.g., [1,2,3,4,5,6,7] for 7 pages)
        startPage = 1;
        endPage = totalPages;
    } else {
        // Case: total pages is more than maximum buttons
        const halfMax = Math.floor(maxButtons / 2);

        if (page <= halfMax) {
            // Case: current page is close to the beginning
            // (e.g., [1,2,3,4,5,6,7,8,9,10] for page 1-5)
            startPage = 1;
            endPage = maxButtons;
        } else if (page > totalPages - halfMax) {
            // Case: current page is close to the end
            // (e.g., [8,9,10,11,12,13,14,15,16,17] for last pages)
            startPage = totalPages - maxButtons + 1;
            endPage = totalPages;
        } else {
            // Case: current page is in the middle
            // Center the current page
            startPage = page - halfMax;
            endPage = page + halfMax - 1;
        }
    }
    const btnGroup = document.getElementById('btn-group');
    let btnCount = 1;
    for (let i = startPage; i <= endPage; i++) {
        const btn = setChildElem(btnGroup, `btn-${btnCount++}`, i)
        if (i === page) {
            btn.style.backgroundColor = 'var(--opacity--brand-1)';
            btn.classList.add('active');
        }
        btn.addEventListener('click', function () {
            window.location.search = `?page=${i}`
        });
    }
    removeExceedLimit('btn', btnCount, maxButtons);
}

(function () {
    const page = window.location.search.substring(6)
    // get page params from url
    getNewsList(page || 1)
    getAdsBanners()
    getAnnouncement()
})()
