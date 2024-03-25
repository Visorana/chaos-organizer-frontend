import DOM from "./DOM";

export default class Favourites {
  constructor(messageClass, requestClass) {
    // Initialize auxiliary classes
    this.messageClass = messageClass;
    this.request = requestClass;

    // Bind methods to context
    this.addToFavourites = this.addToFavourites.bind(this);
    this.removeFromFavourites = this.removeFromFavourites.bind(this);
    this.showFavouriteMark = this.showFavouriteMark.bind(this);
    this.removeFavouriteMark = this.removeFavouriteMark.bind(this);
  }

  // Request to add to favourites
  addToFavourites(event) {
    const messageId = this.messageClass.messages.get(
      event.target.closest(".chaos_messages_message"),
    );

    const isFavouriteMark = event.target
      .closest(".chaos_messages_message")
      .querySelector(".chaos_message_favourite");
    if (isFavouriteMark) {
      return;
    }
    this.request.send("favourite", messageId);
    this.messageClass.closeMessageTools(event);
  }

  // Request to remove from favourites
  removeFromFavourites(event) {
    const messageId = this.messageClass.messages.get(
      event.target.closest(".chaos_messages_message"),
    );
    this.request.send("favouriteRemove", messageId);
  }

  // Add favourite mark to the message
  showFavouriteMark(messageId) {
    const messageElement = [...this.messageClass.messages.entries()]
      .filter(({ 1: id }) => id === messageId)
      .map(([key]) => key);

    const favouriteElement = DOM.getFavouriteMark();
    messageElement[0]
      .querySelector(".chaos_message_header")
      .prepend(favouriteElement);
    favouriteElement.addEventListener("click", this.removeFromFavourites);
  }

  // Remove favourite mark from the message
  removeFavouriteMark(messageId) {
    const messageElement = [...this.messageClass.messages.entries()]
      .filter(({ 1: id }) => id === messageId)
      .map(([key]) => key);
    messageElement[0].querySelector(".chaos_message_favourite").remove();
  }
}
