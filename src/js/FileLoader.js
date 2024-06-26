import DOM from "./DOM";

export default class FileLoader {
  constructor(element, geoClass, requestClass) {
    // Gather DOM elements
    this.parentElement = element;
    this.formElement = this.parentElement.querySelector(".chaos_form");
    this.mainElement = this.parentElement.querySelector(".chaos_main");
    this.clipElement = this.formElement.querySelector(".chaos_form_clip");
    this.inputElement = this.formElement.querySelector(".chaos_form_input");
    this.buttonElement = this.formElement.querySelector(".chaos_file_button");
    this.dropplace = this.parentElement.querySelector(".chaos_dropplace");

    // Initialize auxiliary classes
    this.geolocation = geoClass;
    this.request = requestClass;

    // Bind methods to context
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.showDropPlace = this.showDropPlace.bind(this);
    this.hideDropPlace = this.hideDropPlace.bind(this);
    this.loadFile = this.loadFile.bind(this);
  }

  // Open file attachment form
  openForm() {
    while (this.formElement.firstChild) {
      this.formElement.removeChild(this.formElement.firstChild);
    }
    this.closeElement = DOM.getCloseForm();
    this.addFormElement = DOM.getAddForm();
    this.formElement.append(
      this.closeElement,
      this.addFormElement,
      this.clipElement,
    );

    if (this.geolocation.coords) {
      this.formElement.append(this.geolocation.geoElement);
    }

    this.inputFileElement = this.addFormElement.querySelector(
      "input.chaos_file_hidden",
    );
    this.dropplace = DOM.createDropPlace();
    this.mainElement.prepend(this.dropplace);
    this.closeElement.addEventListener("click", this.closeForm);
    this.mainElement.addEventListener("dragover", this.showDropPlace);
    this.dropplace.addEventListener("dragleave", this.hideDropPlace);
    this.dropplace.addEventListener("drop", this.loadFile);
    this.inputFileElement.addEventListener("change", this.loadFile);
  }

  // Close the file attachment form
  closeForm() {
    this.closeElement.remove();
    this.clipElement.classList.remove("chaos_form_clip_active");
    this.addFormElement.replaceWith(this.inputElement);
  }

  // Show the Drag and Drop area
  showDropPlace(event) {
    event.preventDefault();
    this.dropplace.style.visibility = "visible";
  }

  // Hide the Drag and Drop area
  hideDropPlace() {
    this.dropplace.style.visibility = "hidden";
  }

  // Send the file
  loadFile(event) {
    event.preventDefault();

    const file = this.inputFileElement.files[0] || event.dataTransfer.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("geo", this.geolocation.coords);

    this.request.sendFile(formData);

    this.hideDropPlace();
    this.mainElement.removeEventListener("dragover", this.showDropPlace);
    this.closeForm();
    this.geolocation.removeCoords();
  }
}
