const searchNum = 10

function setElem(id, value, attr = 'innerHTML') {
    const elem = document.getElementById(id);
    if (attr === 'innerHTML') {
        elem.innerHTML = value;
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

async function getArticleList(search) {
    try {
        const response = await fetch(`${strapiUrl}/api/articles?populate=*&sort=createdAt:desc&pagination[limit]=5&filters[$or][0][name][$containsi]=${search}&filters[$or][1][shortDescription][$containsi]=${search}`, {
            headers: {
                Authorization: `Bearer ${strapiToken}`,
            },
        });
        const data = await response.json();
        return data.data.map((item) => ({
            img: `${strapiUrl}${item?.blogImage?.url || ''}`,
            link: `${window.location.origin}/articles/detail?slug=${item.slug}`,
            name: item.name
        }))
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getEventList(search) {
    try {
        const response = await fetch(`${strapiUrl}/api/events?populate=*&sort=createdAt:desc&pagination[limit]=5&filters[$or][0][name][$containsi]=${search}&filters[$or][1][shortDescription][$containsi]=${search}`, {
            headers: {
                Authorization: `Bearer ${strapiToken}`,
            },
        });
        const data = await response.json();
        return data.data.map((item) => ({
            img: `${strapiUrl}${item?.eventImage?.url || ''}`,
            link: item.eventLink,
            name: item.name
        }))
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getNewsList(search) {
    try {
        const response = await fetch(
            `${strapiUrl}/api/news-blocks?populate=*&sort=createdAt:desc&pagination[limit]=5&filters[$or][0][name][$containsi]=${search}&filters[$or][1][shortDescription][$containsi]=${search}`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );

        const data = await response.json()
        return data.data.map((item) => ({
            img: `${strapiUrl}${item?.blogImage?.url || ''}`,
            link: `${window.location.origin}/news/detail?slug=${item.slug}`,
            name: item.name
        }))
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getYoutubeList(search) {
    try {
        const response = await fetch(`${strapiUrl}/api/youtubes?populate=*&sort=createdAt:desc&pagination[limit]=5&filters[$or][0][name][$containsi]=${search}&filters[$or][1][shortDescription][$containsi]=${search}`, {
            headers: {
                Authorization: `Bearer ${strapiToken}`,
            },
        });
        const data = await response.json()
        return data.data.map((item) => ({
            img: `${strapiUrl}${item?.blogImage?.url || ''}`,
            link: item.youtubeLinkAll,
            name: item.name
        }))
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getAllData() {
    const queryString = window.location.search.substring(7)
    if (!queryString) return;
    const [newsList, youtubes, articles, events] = await Promise.all([
        getNewsList(queryString),
        getYoutubeList(queryString),
        getArticleList(queryString),
        getEventList(queryString)
    ])
    const data = [...newsList, ...youtubes, ...articles, ...events]

    let itemNum = 1;
    for (const item of data) {
        if (itemNum > searchNum) return;
        const blog = setElem(`s-${itemNum}`, item.link, "href")
        setChildElem(blog, "s-img", item.img, itemNum, attr = 'src')
        setChildElem(blog, "s-name", item.name, itemNum)
        setChildElem(blog, "s-link", item.link, itemNum)
        itemNum++;
    }
    removeExceedLimit('s', itemNum, searchNum)
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
    getAllData()
    getAnnouncement()
})()
