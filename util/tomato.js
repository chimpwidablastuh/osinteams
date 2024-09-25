function logStatusChange(contactName, status) {
  let now = new Date();
  let formattedDate = now.toLocaleDateString("fr-FR");
  let formattedTime = now.toLocaleTimeString("fr-FR");

  const message = `%c${formattedDate} ${formattedTime} - ${contactName} est maintenant %c${status}`;
  const nameStyle = "color: blue; font-weight: bold; font-size: 14px;";
  const statusStyle = `color: ${getStatusColor(
    status
  )}; font-weight: bold; font-size: 14px;`;

  console.log(message, nameStyle, statusStyle);

  let log = `${formattedDate} ${formattedTime} - ${contactName} est maintenant ${status}`;
  // chrome.storage.local.get({ logs: [] }, function(result) {
  //     let logs = result.logs;
  //     logs.push(log);
  //     chrome.storage.local.set({ logs: logs });
  // });
}

function extractContactNameFromImageUrl(imageUrl) {
  let match = imageUrl.match(/displayname=([^&]*)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return "Inconnu";
}

function getStatusColor(status) {
  switch (status) {
    case "Occupé(e)":
    case "En communication":
      return "red";
    case "Absent":
      return "yellow";
    case "Disponible":
      return "green";
    default:
      return "gray";
  }
}

function observeStatusChanges(element) {
  let statusObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-label"
      ) {
        let status = mutation.target.getAttribute("aria-label");

        let avatarElement = mutation.target.closest("span.fui-Avatar");
        let contactName = "Inconnu";

        if (avatarElement) {
          let imgElement = avatarElement.querySelector("img");
          if (imgElement) {
            let imageUrl = imgElement.src;
            contactName = extractContactNameFromImageUrl(imageUrl);
          }
        }

        logStatusChange(contactName, status);
      }
    });
  });

  let statusElements = element.querySelectorAll('div[role="img"][aria-label]');

  statusElements.forEach((el) => {
    statusObserver.observe(el, { attributes: true });
  });
}
function autoScroll(element) {
  let step = 10;

  function scroll() {
    element.scrollTop += step;

    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
      element.scrollTop = 0;
    }

    requestAnimationFrame(scroll);
  }

  scroll();
}

let chatListContainer = document.querySelector(
  ".virtual-tree-list-scroll-container"
);

if (chatListContainer) {
  observeStatusChanges(chatListContainer);

  let containerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            observeStatusChanges(node);
          }
        });
      }
    });
  });

  containerObserver.observe(chatListContainer, {
    childList: true,
    subtree: true,
  });

  autoScroll(chatListContainer);
}
