window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : null;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

// Every PewPlay game shares one domain, so all keys carry the game slug.
function LocalScoreManager() {
  this.key      = "2048-with-save:bestScore";
  this.gridKey  = "2048-with-save:grid";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalScoreManager.prototype.localStorageSupported = function () {
  var testKey = "2048-with-save:test";

  try {
    var storage = window.localStorage;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

LocalScoreManager.prototype.get = function () {
  return +this.storage.getItem(this.key) || 0;
};

LocalScoreManager.prototype.set = function (score) {
  try { this.storage.setItem(this.key, score); } catch (e) {}
};

LocalScoreManager.prototype.getGrid = function () {
  return this.storage.getItem(this.gridKey);
};

LocalScoreManager.prototype.setGrid = function (json) {
  try { this.storage.setItem(this.gridKey, json); } catch (e) {}
};

LocalScoreManager.prototype.clearGrid = function () {
  try { this.storage.removeItem(this.gridKey); } catch (e) {}
};
