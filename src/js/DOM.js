export default class DOM {
  // Main template for all messages
  static createMessageContainer(bodyElement, geo, date) {
    const dateFormat = new Intl.DateTimeFormat("ru", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageElement = document.createElement("div");
    messageElement.classList.add("chaos_messages_message");
    messageElement.innerHTML = `
      <div class="chaos_message_header">
        <div class="chaos_message_tools"></div>
      </div>
      <div class="chaos_message_body">
        ${bodyElement}
      </div>`;

    if (geo) {
      messageElement.innerHTML += `
        <div class="chaos_message_geo">
          <div class="chaos_geo_icon"></div>
          <a href="https://yandex.ru/maps/?text=${geo}" target="_blank">[${geo}]</a>
        </div>`;
    }

    messageElement.innerHTML += `
      <div class="chaos_message_date">
        ${dateFormat.format(date)}
      </div>`;

    return messageElement;
  }

  // Element for text message in the feed
  static createMessageElement(text, geo, date) {
    const textElement = `<p>${this.linkify(text)}</p>`;
    return DOM.createMessageContainer(textElement, geo, date);
  }

  // Element for message with image in the feed
  static createImageElement(url, fileName, geo, date) {
    const imageElement = `<img class="chaos_messages_image" src="${url}/${fileName}">`;
    return DOM.createMessageContainer(imageElement, geo, date);
  }

  // Element for message with video in the feed
  static createVideoElement(url, fileName, geo, date) {
    const videoElement = `<video class="chaos_messages_video" src="${url}/${fileName}" controls></video>`;
    return DOM.createMessageContainer(videoElement, geo, date);
  }

  // Element for message with audio in the feed
  static createAudioElement(url, fileName, geo, date) {
    const audioElement = `<audio class="chaos_messages_audio" src="${url}/${fileName}" controls></audio>`;
    return DOM.createMessageContainer(audioElement, geo, date);
  }

  // Element for message with file in the feed
  static createFileElement(url, fileName, geo, date) {
    const fileElement = `
      <div class="chaos_messages_file">
        <a href="${url}/${fileName}">
          <div class="chaos_messages_file_bg"></div>
        </a>
        <a href="${url}/${fileName}">${fileName}</a>
      </div>`;
    return DOM.createMessageContainer(fileElement, geo, date);
  }

  // Control elements for a message (delete, pin, favourite)
  static createToolsElements() {
    const toolsElements = document.createElement("div");
    toolsElements.classList.add("chaos_message_tools_container");
    toolsElements.innerHTML = `
        <div class="chaos_message_tools_delete"></div>
        <div class="chaos_message_tools_pin"></div>
        <div class="chaos_message_tools_favourite"></div>
      `;
    return toolsElements;
  }

  // Element with a favourite mark for a message
  static getFavouriteMark() {
    const favouriteElement = document.createElement("div");
    favouriteElement.classList.add("chaos_message_favourite");
    return favouriteElement;
  }

  // Element with a pin mark for a message
  static getPinMark() {
    const pinMarkElement = document.createElement("div");
    pinMarkElement.classList.add("chaos_message_pin");
    return pinMarkElement;
  }

  // Pinned message banner
  static getPinnedMessage(element) {
    const pinnedElement = document.createElement("div");
    pinnedElement.classList.add("chaos_pinned");
    pinnedElement.innerHTML = `
        <div class="chaos_pinned_container">
          ${element.innerHTML}
        </div>
        <div class="chaos_pinned_side">
          <div class="chaos_pinned_title">Pinned message<div class="chaos_pinned_close"></div></div>
          <div class="chaos_pinned_select"></div>
        </div>
      `;
    return pinnedElement;
  }

  // Container for a selected message from storage
  static createSelectContainer(date) {
    const selectContainerElement = document.createElement("div");
    selectContainerElement.classList.add(
      "chaos_messages",
      "chaos_select_container",
    );

    const dateFormat = new Intl.DateTimeFormat("ru", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    selectContainerElement.innerHTML = `
    <div class="chaos_select_header">
      Message from ${dateFormat.format(date)}
      <div class="chaos_select_close"></div>
    </div>`;
    return selectContainerElement;
  }

  // Element displaying the connection process with the server
  static createPendingConnectionElement() {
    const connectionPendingElement = document.createElement("div");
    connectionPendingElement.classList.add("chaos_connection_pending");
    return connectionPendingElement;
  }

  // Element displaying connection error
  static createErrorConnectionElement() {
    const connectionErrorElement = document.createElement("div");
    connectionErrorElement.classList.add("chaos_connection_error");
    return connectionErrorElement;
  }

  // Category elements for storage
  static createSideElement(className, text, count) {
    const sideElement = document.createElement("li");
    sideElement.classList.add("chaos_side_item", className);
    sideElement.innerHTML = `${text}: <span>${count}</span>`;
    return sideElement;
  }

  // Opened storage category header
  static createSideSubheadElement(text) {
    const subheadElement = document.createElement("div");
    subheadElement.classList.add("chaos_side_subhead");
    subheadElement.innerHTML = `<h3>${text}</h3><div class="chaos_side_close"></div>`;
    return subheadElement;
  }

  // List for elements of an opened storage category
  static createSideCategoryList() {
    const categoryListElement = document.createElement("ul");
    categoryListElement.classList.add("chaos_side_list");
    return categoryListElement;
  }

  // Main template for all elements of an opened category
  static createSideElementContainer(bodyElement) {
    const listElement = document.createElement("li");
    listElement.classList.add("chaos_side_item", "chaos_side_open_item");
    listElement.innerHTML = `
      <div class="chaos_side_open_container">
        <div class="chaos_side_open_select"></div>
        <div class="chaos_side_open_element">
          ${bodyElement}
        </div>
      </div>
    `;
    return listElement;
  }

  // Element for links in an opened category
  static createSideLinkElement(link) {
    const bodyElement = `<p><a href="${link}">${link}</a></p>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Elements for an open category of images
  static createSideImageElement(fileName, url) {
    const bodyElement = `<img class="chaos_messages_image" src="${url}/${fileName}">`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Elements for an open category of videos
  static createSideVideoElement(fileName, url) {
    const bodyElement = `<video class="chaos_messages_video" src="${url}/${fileName}" controls></video>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Elements for an open category of audios
  static createSideAudioElement(fileName, url) {
    const bodyElement = `<audio class="chaos_messages_audio" src="${url}/${fileName}" controls></audio>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Elements for an open category of files
  static createSideFileElement(fileName, url) {
    const bodyElement = `<p><a href="${url}/${fileName}">${fileName}</a></p>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Element describing the favorites category
  static createFavouritesDescription(count) {
    const listElement = document.createElement("li");
    listElement.classList.add("chaos_side_item", "chaos_side_open_item");
    listElement.innerHTML = `
      <div class="chaos_side_open_container">
        <div class="chaos_side_open_element">
          <p class="chaos_side_favourites_description">Total messages: <b>${count}</b><br>
        </div>
      </div>
    `;
    return listElement;
  }

  // Form for file upload
  static getAddForm() {
    const addFormElement = document.createElement("label");
    addFormElement.classList.add("chaos_file_label");
    addFormElement.innerHTML = `
      <div class="chaos_file_input">Choose file</div>
      <input type="file" class="chaos_file_hidden">`;
    return addFormElement;
  }

  // Form for media recording (audio/video)
  static getMediaForm(type) {
    const mediaContainerElement = document.createElement("div");
    mediaContainerElement.classList.add("chaos_media_container");
    mediaContainerElement.innerHTML = `
      <div class="chaos_media_record"></div>
      <div class="chaos_media_status">
        Ожидание ${type}
      </div>
      <div class="chaos_media_stop"></div>`;
    return mediaContainerElement;
  }

  // Element with geographical coordinates
  static createGeoElement(value) {
    const geoElement = document.createElement("div");
    geoElement.classList.add("chaos_geo");
    geoElement.innerHTML = `
      <div class="chaos_geo_icon"></div>
      [${value}]
      <div class="chaos_geo_close"></div>
      `;
    return geoElement;
  }

  // Error for media recording unavailability
  static errorMediaForm() {
    const mediaContainerElement = document.createElement("div");
    mediaContainerElement.classList.add("chaos_media_container");
    mediaContainerElement.innerHTML = `
      <div class="chaos_media_status">
        Ваш браузер не поддерживает запись медиа
      </div>`;
    return mediaContainerElement;
  }

  // Element for closing the form
  static getCloseForm() {
    const closeElement = document.createElement("div");
    closeElement.classList.add("chaos_form_close");
    return closeElement;
  }

  // Drop area for Drag and Drop file upload
  static createDropPlace() {
    const dropplaceContainerElement = document.createElement("div");
    dropplaceContainerElement.classList.add("chaos_dropplace_container");
    dropplaceContainerElement.innerHTML = '<div class="chaos_dropplace"></div>';
    return dropplaceContainerElement;
  }

  // Make all links in the message clickable
  static linkify(text) {
    const textWithLinks = text.replace(
      /((http:\/\/|https:\/\/){1}(www)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-?%#&-]*)*\/?)/gi,
      '<a href="$1">$1</a>',
    );
    return textWithLinks;
  }
}
