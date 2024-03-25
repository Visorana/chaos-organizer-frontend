import DOM from "./DOM";

export default class SidePanel {
  constructor(element, messageClass, requestClass) {
    // Gather DOM elements
    this.parentElement = element;
    this.listElement = this.parentElement.querySelector(".chaos_side_list");

    // Initialize auxiliary classes
    this.messageClass = messageClass;
    this.request = requestClass;

    // Bind methods to context
    this.render = this.render.bind(this);
    this.closeCategory = this.closeCategory.bind(this);
    this.showCategoryItems = this.showCategoryItems.bind(this);
    this.showFavouritesDescription = this.showFavouritesDescription.bind(this);

    // Define categories for storage
    this.categoryItems = {
      links: {
        class: "chaos_side_links",
        text: "Links",
        handler: DOM.createSideLinkElement,
      },
      favourites: {
        class: "chaos_side_favourites",
        text: "Favorites",
        handler: DOM.createSideFavouriteElement,
      },
      image: {
        class: "chaos_side_images",
        text: "Images",
        handler: DOM.createSideImageElement,
      },
      file: {
        class: "chaos_side_files",
        text: "Files",
        handler: DOM.createSideFileElement,
      },
      video: {
        class: "chaos_side_videos",
        text: "Video",
        handler: DOM.createSideVideoElement,
      },
      audio: {
        class: "chaos_side_audios",
        text: "Audio",
        handler: DOM.createSideAudioElement,
      },
    };
  }

  // Render the list of storage categories
  render(data) {
    this.listElement.innerHTML = "";
    for (const type in data) {
      const sideElement = DOM.createSideElement(
        this.categoryItems[type].class,
        this.categoryItems[type].text,
        data[type],
      );
      this.listElement.append(sideElement);
      if (data[type] > 0) {
        sideElement.addEventListener("click", () =>
          this.requestCategoryItems(type),
        );
      }
    }
  }

  // Request items of a selected category from the database
  requestCategoryItems(type) {
    // Request favourite messages for drawing
    if (type === "favourites") {
      this.category = "favourites";
      this.openCategory(this.categoryItems[type].text);
      while (this.messageClass.messagesElement.firstChild) {
        this.messageClass.messagesElement.removeChild(
          this.messageClass.messagesElement.firstChild,
        );
      }
      this.messageClass.messages.clear();
      this.request.send("favouritesLoad");
      return;
    }

    // Request other types based on the selected category
    this.openCategory(this.categoryItems[type].text);
    this.request.send("storage", type);
  }

  // Open a selected storage category
  openCategory(text) {
    const subheadElement = DOM.createSideSubheadElement(text);
    const closeElement = subheadElement.querySelector(".chaos_side_close");
    this.listElement.replaceWith(subheadElement);
    closeElement.addEventListener("click", this.closeCategory);
  }

  // Close the currently open category and return to the list of categories
  closeCategory() {
    this.parentElement.querySelector(".chaos_side_subhead").remove();
    this.parentElement.querySelector(".chaos_side_list").remove();

    // Return to the main feed if closing category is favourites
    if (this.category === "favourites") {
      while (this.messageClass.messagesElement.firstChild) {
        this.messageClass.messagesElement.removeChild(
          this.messageClass.messagesElement.firstChild,
        );
      }
      this.messageClass.messages.clear();
      this.request.send("load");
      this.parentElement.append(this.listElement);
      this.category = "";
      return;
    }

    this.parentElement.append(this.listElement);
    this.messageClass.closeSelectMessage();
  }

  // Draw items of a selected category
  showCategoryItems(data) {
    const categoryListElement = DOM.createSideCategoryList();
    for (const item of data.data) {
      const categoryElement = this.categoryItems[data.category].handler(
        item.name,
        this.request.server,
      );
      categoryListElement.append(categoryElement);
      categoryElement
        .querySelector(".chaos_side_open_select")
        .addEventListener("click", () =>
          this.request.send("select", item.messageId),
        );
    }
    this.parentElement.append(categoryListElement);
  }

  // Show the description of the favourites category
  showFavouritesDescription(data) {
    const categoryListElement = DOM.createSideCategoryList();
    const descriptionElement = DOM.createFavouritesDescription(data.length);
    categoryListElement.append(descriptionElement);
    this.parentElement.append(categoryListElement);
  }
}
