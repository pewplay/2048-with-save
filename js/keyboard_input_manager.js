function KeyboardInputManager() {
  this.events = {};
  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3,
    Up: 0, Right: 1, Down: 2, Left: 3,       // old Edge / IE names
    KeyW: 0, KeyD: 1, KeyS: 2, KeyA: 3,
    KeyK: 0, KeyL: 1, KeyJ: 2, KeyH: 3       // Vim keys
  };

  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    var mapped = map[event.code];
    if (mapped === undefined) mapped = map[event.key];

    if (mapped !== undefined) {
      event.preventDefault();
      self.emit("move", mapped);
    } else if (event.code === "Space" || event.key === " ") {
      if (event.target.closest && event.target.closest("button, a, label, input")) return;
      event.preventDefault();
      self.emit("restart");
    }
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-game", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // Save: the link already holds the PNG as a data URL with a download name
  var saveLink = document.querySelector(".save-game");
  saveLink.addEventListener("click", function (event) {
    if (!saveLink.getAttribute("href") || saveLink.getAttribute("href") === "#") {
      event.preventDefault();
      return;
    }
    self.emit("saved");
  });

  // Load from a file picker...
  var loadGameFile = document.querySelector(".load-game-file");
  loadGameFile.addEventListener("change", function () {
    var file = loadGameFile.files[0];
    self.readFile(file);
    loadGameFile.value = "";
  });

  // ...or from a file dropped on the board
  var gameContainer = document.querySelector(".game-container");
  var dragDepth = 0;
  function hasFiles(e) {
    return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") !== -1;
  }
  gameContainer.addEventListener("dragenter", function (e) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth++;
    gameContainer.classList.add("dragging");
  });
  gameContainer.addEventListener("dragleave", function () {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) gameContainer.classList.remove("dragging");
  });
  gameContainer.addEventListener("dragover", function (e) {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  gameContainer.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth = 0;
    gameContainer.classList.remove("dragging");
    var files = e.dataTransfer.files;
    if (files.length) self.readFile(files[0]);
  });
  // Dropping a file elsewhere must not navigate away from the game
  document.addEventListener("dragover", function (e) { e.preventDefault(); });
  document.addEventListener("drop", function (e) { e.preventDefault(); });

  // Swipes anywhere on the page (touch, pen or mouse drag)
  this.listenSwipes(document.getElementById("app") || document.body);
};

// One move per gesture: it fires as soon as the finger has travelled far enough,
// so moves feel instant, and a short quick flick still counts on release.
KeyboardInputManager.prototype.listenSwipes = function (area) {
  var self = this;
  var start = null;

  function threshold() {
    return Math.max(14, Math.min(40, Math.min(window.innerWidth, window.innerHeight) * 0.045));
  }

  function direction(dx, dy) {
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
  }

  area.addEventListener("pointerdown", function (event) {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest && event.target.closest("button, a, label, input")) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId, done: false };
    try { area.setPointerCapture(event.pointerId); } catch (e) {}
    if (event.pointerType !== "mouse") event.preventDefault();
  });

  area.addEventListener("pointermove", function (event) {
    if (!start || start.done || event.pointerId !== start.id) return;
    var dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= threshold()) {
      start.done = true;
      self.emit("move", direction(dx, dy));
    }
  });

  function end(event) {
    if (!start || event.pointerId !== start.id) return;
    var s = start;
    start = null;
    if (s.done || event.type === "pointercancel") return;
    var dx = event.clientX - s.x, dy = event.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 10) self.emit("move", direction(dx, dy));
  }

  area.addEventListener("pointerup", end);
  area.addEventListener("pointercancel", end);
  area.addEventListener("contextmenu", function (event) { event.preventDefault(); });
  // Stop iOS from scrolling or zooming the page while swiping.
  area.addEventListener("touchmove", function (event) { event.preventDefault(); }, { passive: false });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.readFile = function (file) {
  var self = this, reader = new FileReader();
  reader.addEventListener("load", function () {
    self.emit("loadGame", String(reader.result));
  });
  if (file) reader.readAsText(file);
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  if (button) button.addEventListener("click", fn.bind(this));
};
