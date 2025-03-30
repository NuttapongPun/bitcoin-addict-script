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

const highlightNum = 4;
const gridNum = 8;

function setElem(id, value, attr = 'innerHTML') {
  const elem = document.getElementById(id);
  if (attr === 'innerHTML') {
    elem.innerHTML = value;
  } else if (attr === 'src') {
    elem.setAttribute(attr, value);
    child.srcset = '';
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
    elem.setAttribute(attr, value);
    child.srcset = '';
  } else {
    child.setAttribute(attr, value);
  }
  return child;
}

function getDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

async function getEventList() {
  try {
    const response = await fetch(`${strapiUrl}/api/events?populate=*&sort[0]=highlight:desc&sort[1]=createdAt:desc`, {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    });
    const data = await response.json();
    const hc = displayGrid(data.data, 'eh', highlightNum);
    const gc = displayGrid(data.data, 'e', gridNum);

    removeExceedLimit('eh', hc, highlightNum);
    removeExceedLimit('e', gc, gridNum);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayGrid(data, id, num) {
  let itemCount = 1;
  for (const item of data) {
    if (itemCount > num) break;
    const elem = setElem(`${id}-${itemCount}`, item.eventLink, 'href');
    setChildElem(elem, `${id}-time`, item.eventTime, itemCount);
    setChildElem(elem, `${id}-date`, item.date, itemCount);
    setChildElem(elem, `${id}-month`, item.month, itemCount);
    setChildElem(elem, `${id}-name`, item.name, itemCount);
    setChildElem(elem, `${id}-location`, item.location, itemCount);
    setChildElem(elem, `${id}-img`, `${strapiUrl}${item?.eventImage?.url || ''}`, itemCount, 'src');

    itemCount++;
  }
  data.splice(0, itemCount - 1)
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
  getEventList();
  getAnnouncement()
})();
