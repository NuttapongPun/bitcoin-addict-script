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
const topicNum = 4;
const gridNum = 16;
let start = 0

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

async function getArticleList(page = 1) {
  try {
    const limit = gridNum + topicNum + 1
    const response = await fetch(`${strapiUrl}/api/articles?populate=*&sort=createdAt:desc&pagination[limit]=${limit}&pagination[start]=${(+page - 1) * limit}`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    displayHighlight(data.data);
    const hc = displayHighlightTopics(data.data);
    const gc = displayGrid(data.data);

    removeExceedLimit('sha', hc, topicNum);
    removeExceedLimit('tha', gc, gridNum);
    displayPagination(data.meta.pagination.total, limit, +page)
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayHighlight(data) {
  const item = data[0];
  setElem('ha-link', `/articles/detail?slug=${item.slug}`, 'href');
  setElem('ha-img', `${strapiUrl}${item?.blogImage?.url || ''}`, 'src');
  setElem('ha-type', item.category);
  setElem('ha-title', item.name);
  setElem('ha-body', item.shortDescription);
  setElem('ha-read', item.read);
  setElem('ha-date', getDate(item?.dateCreated || item?.createdAt));
  data.splice(0, 1)
}

function displayHighlightTopics(data) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > topicNum) break;
    const elem = setElem(`sha-${itemCount}`, `/articles/detail?slug=${item.slug}`, 'href');
    setChildElem(elem, 'sha-img', `${strapiUrl}${item?.blogImage?.url || ''}`, itemCount, 'src');
    setChildElem(elem, 'sha-date', getDate(item?.dateCreated || item?.createdAt), itemCount);
    setChildElem(elem, 'sha-type', item.category, itemCount);
    setChildElem(elem, 'sha-blog', item.name, itemCount);
    setChildElem(elem, 'sha-read', item.read, itemCount);
    itemCount++;
  }
  data.splice(0, itemCount - 1)
  return itemCount;
}

function displayGrid(data) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > gridNum) break;
    const elem = setElem(`tha-${itemCount}`, `/articles/detail?slug=${item.slug}`, 'href');
    setChildElem(elem, 'tha-img', `${strapiUrl}${item?.blogImage?.url || ''}`, itemCount, 'src');
    setChildElem(elem, 'tha-date', getDate(item?.dateCreated || item?.createdAt), itemCount);
    setChildElem(elem, 'tha-type', item.category, itemCount);
    setChildElem(elem, 'tha-blog', item.name, itemCount);
    setChildElem(elem, 'tha-read', item.read, itemCount);
    itemCount++;
  }
  return itemCount;
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

async function getAdsBanners() {
  try {
    const response = await fetch(`${strapiUrl}/api/ads-banners?populate=*`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    const adsBannerContainer = document.getElementById('ads-banner-link');
    if (data.data.length > 0) {
      const item = data.data[0];
      adsBannerContainer.href = item.adsLink || '#';

      const adsBannerImg = document.getElementById('ads-banner-img');
      adsBannerImg.src = `${strapiUrl}${item.adsImage.url}`;
      adsBannerImg.alt = 'ads-banner';
    } else {
      adsBannerContainer.remove();
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
  getArticleList(page || 1);
  getAdsBanners();
  getAnnouncement();
})();
