import Chaos from "./Chaos";

const chaos = new Chaos(
  document.querySelector(".chaos_organizer"),
  "http://localhost:7070",
);
chaos.init();
