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
const listNo = 10

function setElem(id, value, attr = 'innerHTML') {
    const elem = document.getElementById(id);
    if (attr === 'innerHTML') {
      elem.innerHTML = value;
    } else if (attr === 'src') {
      child.srcset = '';
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
async function getExchangeList() {
    try {
        const response = await fetch(
            `${strapiUrl}/api/exchanges?populate=*&sort=createdAt:desc`,
            {
                headers: {
                    Authorization: `Bearer ${strapiToken}`,
                },
            },
        );
        const data = await response.json();
        const newsList = data.data
        const ec = displayNewsGrid(newsList, 'e', listNo);

        removeExceedLimit('e', ec, listNo);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
function displayNewsGrid(data, id, num) {
    let itemCount = 1;
    for (const item of data) {
        if (itemCount > num) break;
        const elem = setElem(`${id}-${itemCount}`, item.exchangeLink, 'href');
        setChildElem(elem, `${id}-link`, item.exchangeLink, itemCount, 'href');
        setChildElem(elem, `${id}-name`, item.name, itemCount);
        setChildElem(elem, `${id}-rate`, item?.rate || 'FREE', itemCount);
        setChildElem(elem, `${id}-currency`, item?.currencyPair || '', itemCount);
        setChildElem(elem, `${id}-name-btn`, item.name || '', itemCount);
        setChildElem(elem, `${id}-verify`, item.verify || false, itemCount);

        const img = setChildElem(elem, `${id}-img`, `${strapiUrl}${item?.exchangeImage?.url || ''}`, itemCount, 'src');
        img.alt = `news-blog-${itemCount}`;

        itemCount++;
    }
    return itemCount;
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
    getExchangeList()
    getAnnouncement()
})()
