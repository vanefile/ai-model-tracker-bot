const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");
const MAX_SEEN_PER_FEED = 300; // batasi biar file tidak membengkak
const MAX_RECENT_CACHE = 20; // untuk command /latest

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return { seen: {}, recent: [], lastCheck: null, channelId: null };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan data.json:", err.message);
  }
}

let state = loadData();

function isSeen(feedName, guid) {
  const list = state.seen[feedName] || [];
  return list.includes(guid);
}

function markSeen(feedName, guid) {
  if (!state.seen[feedName]) state.seen[feedName] = [];
  state.seen[feedName].push(guid);
  if (state.seen[feedName].length > MAX_SEEN_PER_FEED) {
    state.seen[feedName] = state.seen[feedName].slice(-MAX_SEEN_PER_FEED);
  }
}

function addRecent(item) {
  state.recent.unshift(item);
  if (state.recent.length > MAX_RECENT_CACHE) {
    state.recent = state.recent.slice(0, MAX_RECENT_CACHE);
  }
}

function getRecent(limit = 5) {
  return state.recent.slice(0, limit);
}

function setLastCheck(date) {
  state.lastCheck = date;
}

function getLastCheck() {
  return state.lastCheck;
}

function setChannelId(id) {
  state.channelId = id;
}

function getChannelId() {
  return state.channelId;
}

function persist() {
  saveData(state);
}

module.exports = {
  isSeen,
  markSeen,
  addRecent,
  getRecent,
  setLastCheck,
  getLastCheck,
  setChannelId,
  getChannelId,
  persist,
};
