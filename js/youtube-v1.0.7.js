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

const gridNum = 8;

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

async function getYoutubeList() {
  try {
    const response = await fetch(`${strapiUrl}/api/youtubes?populate=*&sort=createdAt:desc`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();

    displayHighlight(data.data);
    const gc = displayGrid(data.data);
    removeExceedLimit('vl', gc, gridNum);
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
  setElem('vh-date', getDate(item.createdAt));
  setElem('vh-type', item.category);
  setElem('vh-title', item.name);
  setElem('vh-des', item.shortDescription);
  const video = setElem(
    'vh-video',
    `<iframe src="https://www.youtube.com/embed/${getYoutubeId(item?.youtubeLinkAll || '')}?rel=0&amp;controls=1&amp;autoplay=0&amp;mute=0&amp;start=0" frameborder="0" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:auto" allow="autoplay; encrypted-media" allowfullscreen="" title="${item.name}"></iframe>`,
    'innerHTML',
  );
  video.style = 'padding-top:56.17021276595745%';
  data.splice(0, 1)
}

function displayGrid(data) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > gridNum) break;
    const elem = document.getElementById(`vl-${itemCount}`);
    setChildElem(elem, 'vl-date', getDate(item.createdAt), itemCount);
    setChildElem(elem, 'vl-type', item.category, itemCount);
    setChildElem(elem, 'vl-title', item.name, itemCount);
    setChildElem(elem, 'vl-des', item.shortDescription, itemCount);

    const video = setChildElem(
      elem,
      'vl-video',
      `<iframe src="https://www.youtube.com/embed/${getYoutubeId(item?.youtubeLinkAll || '')}?rel=0&amp;controls=1&amp;autoplay=0&amp;mute=0&amp;start=0" frameborder="0" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:auto" allow="autoplay; encrypted-media" allowfullscreen="" title="${item.name}"></iframe>`,
      itemCount,
    );
    video.style = 'padding-top:56.17021276595745%';

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
  getYoutubeList();
  getAnnouncement()
})();
