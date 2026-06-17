/* =========================================================================
   ESG — Tweaks app. Mounts a React panel that reshapes the vanilla site via
   [data-mood] / [data-motion] on <html> and a swapped brand colour ramp.
   ========================================================================= */
(function () {
  "use strict";

  var TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "mood": "showroom",
    "accent": "esg",
    "motion": "lively"
  }/*EDITMODE-END*/;

  // full brand ramps (50..950) + accent pair per identity
  var PALETTES = {
    esg: {
      ramp: ["#e9f6fd","#ccebfb","#9bd9f6","#5fc4f0","#1faae7","#008ccf","#0072ac","#075c89","#0d4c70","#103f5d","#0a2638"],
      accent: "#00c2c8", accentStrong: "#00a6ad"
    },
    ocean: {
      ramp: ["#eef0fb","#dadffb","#b7c0f5","#8e9bed","#6473e3","#3f4fd6","#2f3bb8","#283193","#252c75","#222a5e","#161937"],
      accent: "#4f8bff", accentStrong: "#2f6fe6"
    },
    aqua: {
      ramp: ["#e8faf3","#c6f3e3","#92e6c9","#56d3aa","#21bd8d","#06a376","#018460","#046a50","#085441","#0a4537","#04271f"],
      accent: "#34d399", accentStrong: "#1fae74"
    },
    graphite: {
      ramp: ["#eef1f5","#dde2ea","#bcc6d3","#94a3b6","#6c7d94","#4c5d73","#3c4a5d","#333d4c","#2c3441","#272d38","#161a21"],
      accent: "#5b8def", accentStrong: "#3f6fd0"
    }
  };

  // 3-colour swatch shown in the panel, per identity
  var SWATCH = {
    esg:      ["#008ccf", "#00c2c8", "#5fc4f0"],
    ocean:    ["#3f4fd6", "#4f8bff", "#8e9bed"],
    aqua:     ["#06a376", "#34d399", "#56d3aa"],
    graphite: ["#4c5d73", "#5b8def", "#94a3b6"]
  };
  var SWATCH_ORDER = ["esg", "ocean", "aqua", "graphite"];
  function keyFromSwatch(arr) {
    var j = arr.join("|");
    for (var k in SWATCH) { if (SWATCH[k].join("|") === j) return k; }
    return "esg";
  }

  var STEPS = [50,100,200,300,400,500,600,700,800,900,950];

  function applyTweaks(t) {
    var root = document.documentElement;
    root.setAttribute("data-mood", t.mood || "showroom");
    root.setAttribute("data-motion", t.motion || "lively");
    var p = PALETTES[t.accent] || PALETTES.esg;
    STEPS.forEach(function (s, i) { root.style.setProperty("--brand-" + s, p.ramp[i]); });
    root.style.setProperty("--accent", p.accent);
    root.style.setProperty("--accent-strong", p.accentStrong);
  }

  // apply defaults immediately (before React mounts) to avoid a flash
  applyTweaks(TWEAK_DEFAULTS);

  function App() {
    var ref = useTweaks(TWEAK_DEFAULTS);
    var t = ref[0], setTweak = ref[1];
    React.useEffect(function () { applyTweaks(t); }, [t.mood, t.accent, t.motion]);

    return React.createElement(TweaksPanel, { title: "Tweaks" },
      React.createElement(TweakSection, { label: "Atmosphere" }),
      React.createElement(TweakRadio, {
        label: "Mood",
        value: t.mood,
        options: ["daylight", "showroom", "nocturne"],
        onChange: function (v) { setTweak("mood", v); }
      }),
      React.createElement(TweakSection, { label: "Identity" }),
      React.createElement(TweakColor, {
        label: "Accent",
        value: SWATCH[t.accent] || SWATCH.esg,
        options: SWATCH_ORDER.map(function (k) { return SWATCH[k]; }),
        onChange: function (v) { setTweak("accent", keyFromSwatch(v)); }
      }),
      React.createElement(TweakSection, { label: "Energy" }),
      React.createElement(TweakRadio, {
        label: "Motion",
        value: t.motion,
        options: ["calm", "lively", "electric"],
        onChange: function (v) { setTweak("motion", v); }
      })
    );
  }

  var mount = document.getElementById("tweaks-root");
  if (mount && window.ReactDOM && window.useTweaks) {
    ReactDOM.createRoot(mount).render(React.createElement(App));
  }
})();
