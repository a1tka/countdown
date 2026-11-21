(function () {
  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var target = null, timer = null;

  /* ---------- Countdown ---------- */
  var now = new Date();
  var nextNewYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);

  function toLocalInput(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function setMsg(text, isError) {
    var m = $("msg");
    m.textContent = text;
    m.className = "msg" + (isError ? " err" : "");
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      ["d", "h", "m", "s"].forEach(function (k) { $(k).textContent = "00"; });
      clearInterval(timer); timer = null;
      setMsg("It's time: " + ($("name").value || "your event") + " has arrived.");
      return;
    }
    var t = Math.floor(diff / 1000);
    $("d").textContent = pad(Math.floor(t / 86400));
    $("h").textContent = pad(Math.floor((t % 86400) / 3600));
    $("m").textContent = pad(Math.floor((t % 3600) / 60));
    $("s").textContent = pad(t % 60);
  }

  function start() {
    var v = $("when").value;
    if (!v) { setMsg("Choose a date and time first.", true); return; }
    var d = new Date(v);
    if (isNaN(d) || d <= Date.now()) { setMsg("Pick a date and time in the future.", true); return; }

    target = d.getTime();
    var name = $("name").value.trim() || "Your event";
    $("title").textContent = name;
    $("label").textContent = "Until " + d.toLocaleString([], { dateStyle: "full", timeStyle: "short" });
    setMsg("");
    save("countdown", { name: name, when: v });

    clearInterval(timer);
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Colours ---------- */
  var defaults = { bg: "#f3f5f2", card: "#ffffff", accent: "#1f6f50", text: "#14231c" };
  var vars = { bg: "--bg", card: "--card", accent: "--accent", text: "--text" };

  // Pick black or white text for the buttons, whichever is easier to read
  function onColour(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#000000" : "#ffffff";
  }
  function applyColours(c) {
    var root = document.documentElement.style;
    Object.keys(vars).forEach(function (k) {
      root.setProperty(vars[k], c[k]);
      $("c-" + k).value = c[k];
    });
    root.setProperty("--on-accent", onColour(c.accent));
  }
  function currentColours() {
    var c = {};
    Object.keys(vars).forEach(function (k) { c[k] = $("c-" + k).value; });
    return c;
  }

  /* ---------- Storage (safe if blocked) ---------- */
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } }

  /* ---------- Init ---------- */
  $("when").value = toLocalInput(nextNewYear);
  var saved = load("countdown");
  if (saved && saved.when) { $("name").value = saved.name || ""; $("when").value = saved.when; }

  applyColours(load("colours") || defaults);
  Object.keys(vars).forEach(function (k) {
    $("c-" + k).addEventListener("input", function () {
      var c = currentColours();
      applyColours(c);
      save("colours", c);
    });
  });
  $("reset").addEventListener("click", function () {
    applyColours(defaults);
    save("colours", defaults);
  });

  $("start").addEventListener("click", start);
  start();
})();
