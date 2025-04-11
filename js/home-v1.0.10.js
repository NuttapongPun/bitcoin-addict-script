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
const articleNum = 8;
const youtubeNum = 3;
const adsBanner = 3;

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
    const response = await fetch(
      `${strapiUrl}/api/news-blocks?populate=*&sort[0]=highlight:desc&sort[1]=ranking:asc&sort[2]=createdAt:desc&pagination[limit]=20`,
      {
        headers: {
          Authorization: `Bearer ${strapiToken}`,
        },
      },
    );
    const data = await response.json();

    displayHighlightSlider(data.data);
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
  for (const item of data) {
    if (highlightCount > newsHighlighCount) break;
    const aTag = document.getElementById(`a-news-${highlightCount}`);
    const imgTag = document.getElementById(`img-news-${highlightCount}`);

    aTag.href = `/news/detail?slug=${item.slug}`;
    imgTag.srcset = '';
    imgTag.src = `${strapiUrl}${item?.blogImage?.url || ''}`;
    imgTag.alt = `slider-${highlightCount}`;
    highlightCount++;
  }
  data.splice(0, highlightCount - 1)
  return highlightCount;
}

function displayNewsGrid(data, id, num, hasImg = false) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > num) break;
    const elem = setElem(`${id}-${itemCount}`, `/news/detail?slug=${item.slug}`, 'href');
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
  data.splice(0, itemCount - 1)
  return itemCount;
}

async function getEventList() {
  try {
    const response = await fetch(`${strapiUrl}/api/events?populate=*&sort[0]=highlight:desc&sort[1]=createdAt:desc&pagination[limit]=5`, {
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
    const response = await fetch(`${strapiUrl}/api/ads-banners?populate=*&sort[0]=rank:asc&sort[1]=createdAt:desc&pagination[limit]=3`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    for (let i = 1; i <= adsBanner; i++) {
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

async function getArticleList() {
  try {
    const response = await fetch(`${strapiUrl}/api/articles?populate=*&sort=createdAt:desc&pagination[limit]=10`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    const gc = displayArticleGrid(data.data, 'al', articleNum);

    removeExceedLimit('al', gc, articleNum);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayArticleGrid(data, id, num) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > num) break;
    const elem = setElem(`${id}-${itemCount}`, `/articles/detail?slug=${item.slug}`, 'href');
    const img = setChildElem(elem, `${id}-img`, `${strapiUrl}${item?.blogImage?.url || ''}`, itemCount, 'src');
    img.alt = `article-${itemCount}`
    setChildElem(elem, `${id}-date`, getDate(item?.dateCreated || item?.createdAt), itemCount);
    setChildElem(elem, `${id}-type`, item.category, itemCount);
    setChildElem(elem, `${id}-title`, item.name, itemCount);
    setChildElem(elem, `${id}-read`, item.read, itemCount);
    itemCount++;
  }
  return itemCount;
}

async function getYoutubeList() {
  try {
    const response = await fetch(`${strapiUrl}/api/youtubes?populate=*&sort=createdAt:desc&pagination[limit]=4`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    displayHighlight(data.data);
    const gc = displayYoutubeGrid(data.data, 'yl', youtubeNum);
    removeExceedLimit('yl', gc, youtubeNum);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function getYoutubeId(youtubeLink) {
  if (youtubeLink.includes('live')) {
    const splits = youtubeLink.split('/');
    return splits[splits.length - 1].substring(0, 11);
  } else if (youtubeLink.includes('embed')) {
    const splits = youtubeLink.split('/');
    return splits[splits.length - 1].substring(0, 11);
  } else {
    return youtubeLink.split('?v=')[1].substring(0, 11);
  }
}

function displayHighlight(data) {
  const item = data[0];
  setElem('yh-date', getDate(item.createdAt));
  setElem('yh-type', item.category);
  setElem('yh-title', item.name);
  setElem('yh-des', item.shortDescription);
  const video = setElem(
    'yh-video',
    `<iframe src="https://www.youtube.com/embed/${getYoutubeId(item?.youtubeLinkAll || '')}?rel=0&amp;controls=1&amp;autoplay=0&amp;mute=0&amp;start=0" frameborder="0" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:auto" allow="autoplay; encrypted-media" allowfullscreen="" title="${item.name}"></iframe>`,
    'innerHTML',
  );
  video.style = 'padding-top:56.17021276595745%';
  data.splice(0, 1)
}

function displayYoutubeGrid(data, id, num) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > num) break;
    const elem = document.getElementById(`${id}-${itemCount}`);
    setChildElem(elem, `${id}-date`, getDate(item.createdAt), itemCount);
    setChildElem(elem, `${id}-type`, item.category, itemCount);
    setChildElem(elem, `${id}-title`, item.name, itemCount);
    const video = setChildElem(
      elem,
      `${id}-video`,
      `<iframe src="https://www.youtube.com/embed/${getYoutubeId(item?.youtubeLinkAll || '')}?rel=0&amp;controls=1&amp;autoplay=0&amp;mute=0&amp;start=0" frameborder="0" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:auto" allow="autoplay; encrypted-media" allowfullscreen="" title="${item.name}"></iframe>`,
      itemCount,
    );
    video.style = 'padding-top:56.17021276595745%';

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



$(document).ready(() => {
  getNewsList();
  getEventList();
  getAdsBanners();
	getArticleList();
  getYoutubeList();
  getAnnouncement();
});
