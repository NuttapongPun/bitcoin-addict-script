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
}

function getDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

async function getArticleList() {
  try {
    const response = await fetch(`${strapiUrl}/api/articles?populate=*&sort=createdAt:desc&pagination[limit]=${gridNum + topicNum + 1}&pagination[start]=${start}`, {
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

(function () {
  getArticleList();
  getAdsBanners();
  getAnnouncement();
})();

const Webflow = window.Webflow || [];
Webflow.push(function () {
  // USER CONFIGURATION
  // ==================

  // Enter the class names of your styled page number links
  const linkClassName = 'page-link';
  const currentClassName = 'current-page';

  // Set the max range of page numbers to show (false or integer)
  const maxPageCount = 10;

  // PAGINATION MAGIC (DON'T EDIT)
  // =============================
  $('.w-page-count').each(function () {
    const collectionUrl = $(this)
      .closest('.w-pagination-wrapper')
      .find('[class*="w-pagination"]')
      .first()
      .prop('href')
      .split('=')[0];
    const totalPageCount = parseInt(/[^/]*$/.exec($(this).text())[0].trim());
    const currentPageNumber = parseInt($(this).text().split('/')[0].trim());
    let pageCount = maxPageCount || totalPageCount;
    const pagesToDisplay = Math.max(1, Math.min(pageCount, totalPageCount));
    const middlePageNumber = Math.ceil((pagesToDisplay - 1) / 2);
    const endingPageNumber = Math.min(
      Math.max(1, currentPageNumber - middlePageNumber) + (pagesToDisplay - 1),
      totalPageCount,
    );
    const startingPageNumber = endingPageNumber - (pagesToDisplay - 1);

    $(this).empty();

    for (let i = startingPageNumber; i <= endingPageNumber; i++) {
      let pageNumber = i;
      let pageLink = collectionUrl + '=' + pageNumber;
      let isCurrentPage = pageNumber == currentPageNumber;
      const $anchor = $('<a>', {
        class: [isCurrentPage && currentClassName, linkClassName].filter((a) => a).join(' '),
        href: pageLink,
        text: pageNumber,
      });
      $(this).append($anchor);
    }
  });
});
