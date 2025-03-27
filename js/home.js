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
const newsHighlighCount = 3;
const newsTopicCount = 4;
const newsBlogCount = 12;
const eventTopicCount = 3;
const articleCount = 8;

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

async function getNewsList() {
  try {
    const response = await fetch(
      `${strapiUrl}/api/news-blocks?populate=*&sort[0]=highlight:desc&sort[1]=ranking:asc&sort[2]=dateCreated:desc`,
      {
        headers: {
          Authorization: `Bearer ${strapiToken}`,
        },
      },
    );
    const data = await response.json();

    const nhc = displayHighlightSlider(data);
    const ntc = displayNewsGrid(data.data, 'nht', newsTopicCount);
    const nbc = displayNewsGrid(data.data, 'nb', newsBlogCount, true);

    removeExceedLimit('nht', ntc, newsTopicCount);
    removeExceedLimit('nb', nbc, newsBlogCount);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayHighlightSlider(data) {
  let highlightCount = 1;
  for (const item of data.data) {
    if (highlightCount > newsHighlighCount) break;
    const aTag = document.getElementById(`a-news-${highlightCount}`);
    const imgTag = document.getElementById(`img-news-${highlightCount}`);

    aTag.href = `/news/${item.slug}`;
    imgTag.src = `${strapiUrl}${item?.blogImage?.url || ''}`;
    imgTag.alt = `slider-${highlightCount}`;
    highlightCount++;
  }
  return highlightCount;
}

function displayNewsGrid(data, id, num, hasImg = false) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > num) break;
    const elem = setElem(`${id}-${itemCount}`, `/news/${item.slug}`, 'href');
    setChildElem(elem, `${id}-date`, getDate(item?.dateCreated || item?.createdAt), itemCount);
    setChildElem(elem, `${id}-type`, item?.category || '', itemCount);
    setChildElem(elem, `${id}-body`, item?.name || '', itemCount);
    setChildElem(elem, `${id}-read`, item?.read || 1, itemCount);
    if (hasImg) {
      const img = setChildElem(elem, `${id}-img`, `${strapiUrl}${item?.blogImage?.url || ''}`, itemCount, 'src');
      img.alt = `news-blog-${itemCount}`;
    }
    itemCount++;
  }
  return itemCount;
}

async function getEventList() {
  try {
    const response = await fetch(`${strapiUrl}/api/events?populate=*&sort[0]=highlight:desc&sort[1]=dateCreated:desc`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();
    const elc = displayEventGrid(data.data, 'el', eventTopicCount);

    removeExceedLimit('el', elc, eventTopicCount);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayEventGrid(data, id, num) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > num) break;
    const elem = setElem(`${id}-${itemCount}`, item.eventLink, 'href');
    setChildElem(elem, `${id}-time`, item.eventTime, itemCount);
    setChildElem(elem, `${id}-date`, item.date, itemCount);
    setChildElem(elem, `${id}-month`, item.month, itemCount);
    setChildElem(elem, `${id}-title`, item.name, itemCount);
    setChildElem(elem, `${id}-body`, item.shortDescription, itemCount);
    setChildElem(elem, `${id}-location`, item.location, itemCount);
    setChildElem(elem, `${id}-location-link`, item.locationLink, itemCount, 'href');
    setChildElem(elem, `${id}-img`, `${strapiUrl}${item?.eventImage?.url || ''}`, itemCount, 'src');
    itemCount++;
  }
  return itemCount;
}

async function getAdsBanners() {
  try {
    const response = await fetch(`${strapiUrl}/api/ads-banners?populate=*`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    for (let i = 1; i <= 2; i++) {
      if (!data.data[i - 1]) {
        continue;
      }
      const elem = setElem(`ab-${i}`, data.data[i - 1]?.adsLink || '#', 'href');
      const img = setChildElem(elem, `ab-img`, `${strapiUrl}${data.data[i - 1]?.adsImage?.url || ''}`, i, 'src');
      img.alt = `ads-banner-${i}`;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

$(document).ready(() => {
  getNewsList();
  getEventList();
  getAdsBanners();
});
