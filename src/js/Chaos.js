import Request from "./Request";
import DOM from "./DOM";
import SidePanel from "./SidePanel";
import FileLoader from "./FileLoader";
import MediaLoader from "./MediaLoader";
import Geolocation from "./Geolocation";
import Pin from "./Pin";
import Favourites from "./Favourites";

export default class Chaos {
  constructor(element, server) {
    this.server = server;

    // Gathering DOM elements
    this.parentElement = element;
    this.formElement = this.parentElement.querySelector(".chaos_form");
    this.inputElement = this.formElement.querySelector(".chaos_form_input");
    this.clipElement = this.formElement.querySelector(".chaos_form_clip");
    this.addFormElement = this.formElement.querySelector(
      ".chaos_add_container",
    );
    this.addFileElement = this.addFormElement.querySelector(".chaos_add_files");
    this.addAudioElement =
      this.addFormElement.querySelector(".chaos_add_audio");
    this.addVideoElement =
      this.addFormElement.querySelector(".chaos_add_video");
    this.addGeoElement = this.addFormElement.querySelector(".chaos_add_geo");
    this.messagesElement = this.parentElement.querySelector(".chaos_messages");
    this.messages = new Map();

    // Initialize auxiliary classes
    this.request = new Request(this.server);
    this.sidePanel = new SidePanel(
      this.parentElement.querySelector(".chaos_side"),
      this,
      this.request,
    );
    this.geolocation = new Geolocation(this.formElement);
    this.fileLoader = new FileLoader(
      this.parentElement,
      this.geolocation,
      this.request,
    );
    this.mediaLoader = new MediaLoader(
      this.formElement,
      this.geolocation,
      this.request,
    );
    this.pin = new Pin(this, this.request);
    this.favourites = new Favourites(this, this.request);

    // Bind methods to context
    this.submitForm = this.submitForm.bind(this);
    this.showAddForm = this.showAddForm.bind(this);
    this.removeError = this.removeError.bind(this);
    this.connectionPending = this.connectionPending.bind(this);
    this.connectionSuccess = this.connectionSuccess.bind(this);
    this.connectionError = this.connectionError.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.addFile = this.addFile.bind(this);
    this.renderMessages = this.renderMessages.bind(this);
    this.lazyLoad = this.lazyLoad.bind(this);
    this.showSelectMessage = this.showSelectMessage.bind(this);
    this.closeSelectMessage = this.closeSelectMessage.bind(this);
    this.showMessageDot = this.showMessageDot.bind(this);
    this.removeMessageDot = this.removeMessageDot.bind(this);
    this.showMessageTools = this.showMessageTools.bind(this);
    this.closeMessageTools = this.closeMessageTools.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.deleteMessageElement = this.deleteMessageElement.bind(this);
  }

  init() {
    // Connect to WebSocket
    this.request.callbacks = {
      pending: this.connectionPending,
      success: this.connectionSuccess,
      error: this.connectionError,
      load: this.renderMessages,
      message: this.addMessage,
      file: this.addFile,
      showMessage: this.showSelectMessage,
      delete: this.deleteMessageElement,
      favourite: this.favourites.showFavouriteMark,
      favouriteRemove: this.favourites.removeFavouriteMark,
      sideLoad: this.sidePanel.render,
      sideCategory: this.sidePanel.showCategoryItems,
      sideFavourites: this.sidePanel.showFavouritesDescription,
      pin: this.pin.markPinnedMessage,
      pinMessage: this.pin.showPinnedMessage,
      unpin: this.pin.unmarkPinnedMessage,
    };
    this.request.init();

    // Attach events
    this.messagesElement.addEventListener("scroll", this.lazyLoad);
    this.formElement.addEventListener("submit", this.submitForm);
    this.clipElement.addEventListener("click", this.showAddForm);
    this.addFileElement.addEventListener("click", this.fileLoader.openForm);
    this.addAudioElement.addEventListener("click", this.mediaLoader.openMedia);
    this.addVideoElement.addEventListener("click", this.mediaLoader.openMedia);
    this.addGeoElement.addEventListener("click", this.geolocation.attachGeo);
  }

  // Message element constructor based on type
  buildMessageElement(type, id, message, geo, date) {
    // Return the ready element from Map if already rendered before
    if ([...this.messages.values()].indexOf(id) !== -1) {
      const messageElement = [...this.messages.entries()]
        .filter(({ 1: messageId }) => messageId === id)
        .map(([key]) => key);
      return messageElement[0];
    }

    let messageElement = "";
    switch (type) {
      case "text": {
        messageElement = DOM.createMessageElement(message, geo, date);
        break;
      }
      case "image": {
        messageElement = DOM.createImageElement(
          this.server,
          message,
          geo,
          date,
        );
        break;
      }
      case "video": {
        messageElement = DOM.createVideoElement(
          this.server,
          message,
          geo,
          date,
        );
        break;
      }
      case "audio": {
        messageElement = DOM.createAudioElement(
          this.server,
          message,
          geo,
          date,
        );
        break;
      }
      case "file": {
        messageElement = DOM.createFileElement(this.server, message, geo, date);
        break;
      }
      default: {
        break;
      }
    }

    this.messages.set(messageElement, id);

    messageElement.addEventListener("mouseenter", this.showMessageDot);
    messageElement.addEventListener("mouseleave", this.removeMessageDot);

    return messageElement;
  }

  // Drawing messages from bottom to top
  renderMessages(data, favourites, position) {
    for (const message of data) {
      const messageElement = this.buildMessageElement(
        message.type,
        message.id,
        message.message,
        message.geo,
        message.date,
      );

      if (favourites.indexOf(message.id) !== -1) {
        this.favourites.showFavouriteMark(message.id);
      }

      if (message.pinned) {
        this.pin.markPinnedMessage(message.id);
      }

      this.messagesElement.prepend(messageElement);

      // Scroll down after loading content if it's the initial load
      if (!this.databasePosition) {
        this.scrollBottom(messageElement);
      }
    }
    // Record how many more elements can be loaded from the top if it's "lazy" loading
    this.databasePosition = position;

    // Upper trigger element for "lazy" loading
    if (this.databasePosition > 0) {
      this.upperMessageElement = this.messagesElement.querySelector(
        ".chaos_messages_message:nth-child(3)",
      );
    }
  }

  // "Lazy" loading
  lazyLoad() {
    if (this.databasePosition <= 0) return;
    if (
      this.upperMessageElement &&
      this.upperMessageElement.getBoundingClientRect().bottom > 0
    ) {
      this.upperMessageElement = "";
      this.request.send("load", this.databasePosition);
    }
  }

  // Show selected message from storage
  showSelectMessage(message) {
    const messageElement = this.buildMessageElement(
      message.type,
      message.id,
      message.message,
      message.geo,
      message.date,
    );

    const selectContainerElement = DOM.createSelectContainer(message.date);
    const selectCloseElement = selectContainerElement.querySelector(
      ".chaos_select_close",
    );
    selectContainerElement.append(messageElement);
    this.parentElement
      .querySelector(".chaos_messages")
      .replaceWith(selectContainerElement);
    selectCloseElement.addEventListener("click", this.closeSelectMessage);
  }

  // Closing the selected message from the storage
  closeSelectMessage() {
    const ifSelectedMessage = this.parentElement.querySelector(
      ".chaos_select_container",
    );
    if (!ifSelectedMessage) {
      return;
    }
    this.parentElement
      .querySelector(".chaos_select_container")
      .replaceWith(this.messagesElement);
    this.messagesElement.scrollTop =
      this.messagesElement.scrollHeight -
      this.messagesElement.getBoundingClientRect().height;
  }

  // Showing the file attachment form
  showAddForm() {
    this.addFormElement.classList.toggle("chaos_add_container_visible");
    this.clipElement.classList.toggle("chaos_form_clip_active");
  }

  // Submitting text messages
  submitForm(event) {
    event.preventDefault();
    const inputValue = this.inputElement.value;
    if (!inputValue) {
      this.showError();
      return;
    }

    this.request.send("message", {
      text: this.inputElement.value,
      geo: this.geolocation.coords,
    });
  }

  // Adding sent message to the end
  addMessage(id, text, geo, date) {
    const messageElement = this.buildMessageElement(
      "text",
      id,
      text,
      geo,
      date,
    );
    messageElement.classList.add("chaos_messages_message_animation");
    messageElement.addEventListener("animationend", () => {
      messageElement.classList.remove("chaos_messages_message_animation");
    });
    this.messagesElement.append(messageElement);

    this.scrollBottom(messageElement);

    this.inputElement.value = "";
    this.geolocation.removeCoords();
  }

  // Adding sent file to the end
  addFile(type, id, fileName, date) {
    const messageElement = this.buildMessageElement(type, id, fileName, date);
    messageElement.classList.add("chaos_messages_message_animation");
    this.messagesElement.append(messageElement);
    this.scrollBottom(messageElement);
  }

  // Showing dot to open additional message menu
  showMessageDot(event) {
    const dotElement = event.target.querySelector(".chaos_message_tools");
    dotElement.classList.add("chaos_message_tools_show");
    dotElement.addEventListener("click", this.showMessageTools);
  }

  // Hiding dot to open additional message menu
  removeMessageDot(event) {
    const dotElement = event.target.querySelector(".chaos_message_tools");
    dotElement.classList.remove("chaos_message_tools_show");
    dotElement.classList.remove("chaos_message_tools_active");
    const toolsElement = event.target.querySelector(
      ".chaos_message_tools_container",
    );
    if (toolsElement) {
      dotElement.removeEventListener("click", this.closeMessageTools);
      toolsElement.remove();
    }
  }

  // Showing additional message menu
  showMessageTools(event) {
    const dotElement = event.target;
    dotElement.classList.add("chaos_message_tools_active");
    dotElement.removeEventListener("click", this.showMessageTools);
    dotElement.addEventListener("click", this.closeMessageTools);
    const toolsElement = DOM.createToolsElements();
    dotElement.after(toolsElement);

    const deleteElement = toolsElement.querySelector(
      ".chaos_message_tools_delete",
    );
    const pinElement = toolsElement.querySelector(".chaos_message_tools_pin");
    const favouriteElement = toolsElement.querySelector(
      ".chaos_message_tools_favourite",
    );
    deleteElement.addEventListener("click", this.deleteMessage);
    pinElement.addEventListener("click", this.pin.pinMessage);
    favouriteElement.addEventListener("click", this.favourites.addToFavourites);
  }

  // Hiding additional message menu
  closeMessageTools(event) {
    const dotElement = event.target;
    const toolsElement = dotElement
      .closest(".chaos_message_header")
      .querySelector(".chaos_message_tools_container");
    if (toolsElement) {
      toolsElement.remove();
    }
    dotElement.classList.toggle("chaos_message_tools_active");
    dotElement.removeEventListener("click", this.closeMessageTools);
    dotElement.addEventListener("click", this.showMessageTools);
  }

  // Request message deletion
  deleteMessage(event) {
    const messageId = this.messages.get(
      event.target.closest(".chaos_messages_message"),
    );
    this.request.send("delete", messageId);
  }

  // Deleting message element from the feed
  deleteMessageElement(messageId) {
    const ifSelectedMessage = this.parentElement.querySelector(
      ".chaos_select_container",
    );
    if (ifSelectedMessage) {
      this.closeSelectMessage();
      this.sidePanel.closeCategory();
    }

    if (this.pin.pinnedMessage === messageId) {
      this.pin.removePinnedMessage();
    }

    const messagesElement = [...this.messages.entries()]
      .filter(({ 1: id }) => id === messageId)
      .map(([key]) => key);

    messagesElement.forEach((item) => {
      this.messages.delete(item);
      item.remove();
    });
  }

  // Scrolling messages to the bottom after loading their content
  scrollBottom(messageElement) {
    // If content is a media element
    let checkLoad = messageElement.querySelectorAll(
      ".chaos_message_body video, .chaos_message_body audio",
    );
    [...checkLoad].forEach((element) => {
      element.addEventListener("loadeddata", () => {
        this.messagesElement.scrollTop =
          this.messagesElement.scrollHeight -
          this.messagesElement.getBoundingClientRect().height;
      });
    });
    // If an image
    checkLoad = messageElement.querySelectorAll(".chaos_message_body img");
    [...checkLoad].forEach((element) => {
      element.addEventListener("load", () => {
        this.messagesElement.scrollTop =
          this.messagesElement.scrollHeight -
          this.messagesElement.getBoundingClientRect().height;
      });
    });
    // If a text
    this.messagesElement.scrollTop =
      this.messagesElement.scrollHeight -
      this.messagesElement.getBoundingClientRect().height;
  }

  // Error when sending an empty message
  showError() {
    this.inputElement.classList.add("chaos_form_invalid");
    this.inputElement.addEventListener("keydown", this.removeError);
  }

  // Disabling the error for an empty message
  removeError() {
    this.inputElement.classList.remove("chaos_form_invalid");
    this.inputElement.removeEventListener("keydown", this.removeError);
  }

  // Connecting to the server
  connectionPending() {
    this.connectionPendingElement = DOM.createPendingConnectionElement();
    this.parentElement
      .querySelector(".chaos_container")
      .append(this.connectionPendingElement);
  }

  // Connection established
  connectionSuccess() {
    if (this.connectionPendingElement) {
      this.connectionPendingElement.remove();
    }
  }

  // Connection error
  connectionError() {
    const connectionErrorElement = DOM.createErrorConnectionElement();
    this.parentElement
      .querySelector(".chaos_container")
      .append(connectionErrorElement);
  }
}
