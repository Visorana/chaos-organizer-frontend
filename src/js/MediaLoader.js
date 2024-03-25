import DOM from "./DOM";

export default class MediaLoader {
  constructor(element, geoClass, requestClass) {
    // Gather DOM elements
    this.formElement = element;
    this.inputElement = this.formElement.querySelector(".chaos_form_input");
    this.clipElement = this.formElement.querySelector(".chaos_form_clip");

    // Initialize auxiliary classes
    this.geolocation = geoClass;
    this.request = requestClass;

    // Bind methods to context
    this.openMedia = this.openMedia.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
  }

  // Check API availability and create stream for recording
  openMedia(event) {
    const navigatorDevices = { audio: true };
    let formName = "аудио";
    if (event.target.classList.contains("chaos_add_video")) {
      navigatorDevices.video = true;
      this.blobType = "video/mp4";
      formName = "видео";
    } else {
      this.blobType = "audio/wav";
    }

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      this.showError();
      return;
    }
    try {
      navigator.mediaDevices
        .getUserMedia(navigatorDevices)
        .then((stream) => {
          this.stream = stream;
          this.recorder = new MediaRecorder(this.stream);
        })
        .catch(() => this.showError());
    } catch (error) {
      this.showError();
    }
    this.openMediaForm(formName);
  }

  // Open form with recording controls
  openMediaForm(formName) {
    while (this.formElement.firstChild) {
      this.formElement.removeChild(this.formElement.firstChild);
    }

    this.closeElement = DOM.getCloseForm();
    this.addMediaElement = DOM.getMediaForm(formName);
    this.formElement.append(
      this.closeElement,
      this.addMediaElement,
      this.clipElement,
    );

    if (this.geolocation.coords) {
      this.formElement.append(this.geolocation.geoElement);
    }

    this.recordStart = this.addMediaElement.querySelector(
      ".chaos_media_record",
    );
    this.recordStop = this.addMediaElement.querySelector(".chaos_media_stop");
    this.statusRecord = this.addMediaElement.querySelector(
      ".chaos_media_status",
    );

    this.recordStart.addEventListener("click", this.startRecording);
    this.recordStop.addEventListener("click", this.stopRecording);
    this.closeElement.addEventListener("click", this.closeForm);
  }

  // Close the recording form
  closeForm() {
    this.closeElement.remove();
    this.clipElement.classList.remove("chaos_form_clip_active");
    this.addMediaElement.replaceWith(this.inputElement);
  }

  // Show error message for unavailable API
  showError() {
    while (this.formElement.firstChild) {
      this.formElement.removeChild(this.formElement.firstChild);
    }
    this.closeElement = DOM.getCloseForm();
    this.addMediaElement = DOM.errorMediaForm();
    this.formElement.append(
      this.closeElement,
      this.addMediaElement,
      this.clipElement,
    );

    this.closeElement.addEventListener("click", this.closeForm);
  }

  // Start recording
  startRecording() {
    this.chunks = [];
    this.recorder.addEventListener("dataavailable", (event) => {
      this.chunks.push(event.data);
    });
    this.recorder.addEventListener("stop", () => {
      this.loadFile();
    });
    this.recorder.start();

    this.showStatus();
  }

  // Stop recording
  stopRecording() {
    if (this.recorder.state === "inactive") {
      return;
    }
    clearInterval(this.timerInterval);
    this.statusRecord.innerText = "Recording is complete. Sending.";
    this.recorder.stop();
    this.stream.getTracks().forEach((track) => track.stop());
  }

  // Show recording status
  showStatus() {
    let timer = 0;
    this.statusRecord.innerText = `Recording: ${timer} sec.`;
    this.timerInterval = setInterval(() => {
      timer += 1;
      this.statusRecord.innerText = `Recording: ${timer} sec.`;
    }, 1000);
  }

  // Send the recorded file to the server
  loadFile() {
    const mediaFile = new Blob(this.chunks, {
      type: this.blobType,
    });
    const formData = new FormData();
    formData.append("file", mediaFile);
    formData.append("geo", this.geolocation.coords);
    this.request.sendFile(formData);
    this.closeForm();
    this.geolocation.removeCoords();
  }
}
