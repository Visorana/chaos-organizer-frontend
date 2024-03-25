export default class Request {
  constructor(server) {
    // Change server protocol to WebSocket
    this.server = server;
    this.wsServer = this.server.replace(/^http/i, "ws");

    // Initialize data and error callback
    this.data = { event: "load" };
    this.callbacks = {
      error: () => {
        throw Error("Connection error");
      },
    };

    // Bind methods to context
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  // Initialize WebSocket connection
  init() {
    this.ws = new WebSocket(this.wsServer);
    this.callbacks.pending();

    // Request initial data when connected
    this.ws.addEventListener("open", this.onOpen);
    this.ws.addEventListener("message", this.onMessage);
    this.ws.addEventListener("error", this.callbacks.error);
    this.ws.addEventListener("close", this.callbacks.error);
  }

  // Open WebSocket connection
  onOpen() {
    this.callbacks.success();
    this.ws.send(JSON.stringify(this.data));
  }

  // Receive messages from the server
  onMessage(event) {
    const data = JSON.parse(event.data);
    // Response with database messages
    if (data.event === "database") {
      this.callbacks.load(data.dB, data.favourites, data.position);
      if (data.pinnedMessage) {
        this.callbacks.pinMessage(
          data.pinnedMessage.type,
          data.pinnedMessage.id,
          data.pinnedMessage.message,
          data.pinnedMessage.geo,
          data.pinnedMessage.date,
        );
      }
      this.callbacks.sideLoad(data.side);
    }

    // Successful text message sending
    if (data.event === "text") {
      this.callbacks.message(data.id, data.message, data.geo, data.date);
      this.callbacks.sideLoad(data.side);
    }
    // Successful file sending
    if (data.event === "file") {
      this.callbacks.file(
        data.type,
        data.id,
        data.message,
        data.geo,
        data.date,
      );
      this.callbacks.sideLoad(data.side);
    }
    // Response with database based on storage category
    if (data.event === "storage") {
      this.callbacks.sideCategory(data);
    }
    // Response with selected message from storage
    if (data.event === "select") {
      this.callbacks.showMessage(data.message);
    }
    // Successful message deletion
    if (data.event === "delete") {
      this.callbacks.delete(data.id);
      this.callbacks.sideLoad(data.side);
    }
    // Successful addition of message to favorites
    if (data.event === "favourite") {
      this.callbacks.favourite(data.id);
      this.callbacks.sideLoad(data.side);
    }
    // Successful removal of message from favourites
    if (data.event === "favouriteRemove") {
      this.callbacks.favouriteRemove(data.id);
      this.callbacks.sideLoad(data.side);
    }
    // Response with favourite messages
    if (data.event === "favouritesLoad") {
      this.callbacks.load(data.dB, data.favourites, 0);
      if (data.pinnedMessage) {
        this.callbacks.pinMessage(
          data.pinnedMessage.type,
          data.pinnedMessage.id,
          data.pinnedMessage.message,
          data.pinnedMessage.geo,
          data.pinnedMessage.date,
        );
      }
      this.callbacks.sideFavourites(data.dB);
    }
    // Successful pinning of a message
    if (data.event === "pin") {
      this.callbacks.pin(data.pinnedMessage.id);
      this.callbacks.pinMessage(
        data.pinnedMessage.type,
        data.pinnedMessage.id,
        data.pinnedMessage.message,
        data.pinnedMessage.geo,
        data.pinnedMessage.date,
      );
    }
    // Successful unpinning of a message
    if (data.event === "unpin") {
      this.callbacks.unpin(data.id);
    }
  }

  // Send a message to the server
  send(event, message) {
    if (this.ws.readyState === 1) {
      this.data = { event, message };
      this.ws.send(JSON.stringify(this.data));
    } else {
      this.callbacks.error();
    }
  }

  // Send a file to the server
  sendFile(formData) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${this.server}/upload`);
    xhr.addEventListener("error", () => this.callbacks.error());
    xhr.send(formData);
  }
}
