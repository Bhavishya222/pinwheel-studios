/* ==========================================================================
   PINWHEEL STUDIOS — INTERACTIVE BEHAVIORS
   Zero external libraries. Static GitHub Pages ready.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initScrollWheel();
  initMobileNav();
  initCopyButtons();
  initThreadSandbox();
  initMotionTester();
  initDocsFiltering();
});

/* 1. Subtle Scroll Rotation on Background Pinwheel Emblem */
function initScrollWheel() {
  const wheel = document.querySelector(".bg-pinwheel");
  if (!wheel) return;

  let ticking = false;
  const update = () => {
    wheel.style.transform = `rotate(${(window.scrollY * 0.08).toFixed(2)}deg)`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* 2. Mobile Navigation Drawer */
function initMobileNav() {
  const btn = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".nav-links");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.textContent = isOpen ? "Close" : "Menu";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "Menu";
    });
  });
}

/* 3. Copy Buttons (Support Email + Code Blocks) */
function initCopyButtons() {
  document.querySelectorAll("[data-copy], [data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-copy-target");
      const text = targetId
        ? document.getElementById(targetId)?.textContent || ""
        : btn.getAttribute("data-copy") || "";

      try {
        await navigator.clipboard.writeText(text.trim());
        const prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = prev), 1800);
      } catch {
        const prev = btn.textContent;
        btn.textContent = "Copy manually";
        setTimeout(() => (btn.textContent = prev), 1800);
      }
    });
  });
}

/* 4. Interactive Pinwheel Thread Flow Preview */
function initThreadSandbox() {
  const stage = document.getElementById("threadNodeStage");
  if (!stage) return;

  const presets = {
    settings: {
      nodes: [
        {
          color: "purple",
          role: "Lifecycle",
          name: "Start Disabled",
          ports: [["Disable On Start", "→ SettingsMenu_Screen"]],
          desc: "Runs in Awake() before frame 1. Keeps secondary screens hidden on boot even if you left them visible while editing in Pinwheel Compose.",
          code: `// Generated in PinwheelThread_UIFlow.cs\nvoid Awake() {\n  settingsMenuScreen.SetActive(false);\n  languageSubmenu.SetActive(false);\n}`
        },
        {
          color: "blue",
          role: "Trigger",
          name: "Screen Buttons Card",
          ports: [
            ["PLAY", "●"],
            ["SETTINGS", "→ Switch Menu"],
            ["Escape / Back Key", "→ In 2"]
          ],
          desc: "Groups all buttons of a screen into one card (skipping stepper arrows) and pairs with a scoped Escape/Back Key via Multi-Input.",
          code: `btnSettings.onClick.AddListener(OpenSettings);\nbtnBack.onClick.AddListener(GoBackAutoHistory);\nescapeAction.performed += _ => GoBackScoped();`
        },
        {
          color: "gold",
          role: "Action",
          name: "Switch Menu + Refresh",
          ports: [
            ["In 1 / In 2", "Multi-Input"],
            ["Open", "→ SettingsMenu_Screen"],
            ["Close", "→ MainMenu_Screen"]
          ],
          desc: "AutoParentScreenRoot closes the parent backdrop cleanly, resets ScrollViews to the top, closes leftover sub-panels, and replays Panel Intro animations.",
          code: `void OpenSettings() {\n  RefreshPanel(settingsMenuScreen);\n  SwitchMenu(open: settingsMenuScreen,\n             close: mainMenuScreen);\n}`
        },
        {
          color: "green",
          role: "Target",
          name: "SettingsMenu_Screen",
          ports: [
            ["Start Off", "Connected"],
            ["GlobalObjectId", "Tracked"]
          ],
          desc: "Tracked via Unity's GlobalObjectId and Hierarchy Path. Renaming or reparenting the object automatically updates the path without breaking wires.",
          code: `// Health Badge: Ready (0 Issues)\n// Bound via GlobalObjectId + sibling index\n[SerializeField] GameObject settingsMenuScreen;`
        }
      ]
    },
    lobby: {
      nodes: [
        {
          color: "purple",
          role: "Lifecycle",
          name: "Start Disabled",
          ports: [["Disable On Start", "→ LobbyRoom_Screen"]],
          desc: "Snapshots default child states of the Lobby and Side Loadout Panel on boot so returning from a match always starts clean.",
          code: `void Awake() {\n  SnapshotPanelDefaults(lobbyRoomScreen);\n  lobbyRoomScreen.SetActive(false);\n}`
        },
        {
          color: "blue",
          role: "Trigger",
          name: "Create Lobby Card",
          ports: [
            ["HOST LOBBY", "→ Refresh Panel"],
            ["BACK", "→ Auto-History"]
          ],
          desc: "Reads buttons directly from Compose's Create Lobby screen. Click 'Refresh Child Buttons' anytime you add a new button without losing existing wires.",
          code: `btnHostLobby.onClick.AddListener(EnterLobby);\nbtnLobbyBack.onClick.AddListener(ReturnPrev);`
        },
        {
          color: "gold",
          role: "Action",
          name: "Refresh Panel",
          ports: [
            ["Panel", "→ LobbyRoom_Screen"],
            ["Then", "→ Switch Menu"]
          ],
          desc: "Resets roster scroll positions, collapses any open loadout sub-panels, and calls SetActive(true) so Pinwheel Motion's Panel Intro replays.",
          code: `void EnterLobby() {\n  RestoreSnapshot(lobbyRoomScreen);\n  ResetScrollRects(lobbyRoomScreen);\n  SwitchMenu(lobbyRoomScreen, createLobbyScreen);\n}`
        },
        {
          color: "green",
          role: "Target",
          name: "LobbyRoom_Screen",
          ports: [
            ["Room Code Bar", "Ready"],
            ["Side Loadout Slot", "Custom Prefab"]
          ],
          desc: "Supports Compose Custom Slots so you can insert your own character preview or map selector prefab without breaking surrounding layouts.",
          code: `// Shareable via .pwui + .pwthread files\n// Import into another project and compile`
        }
      ]
    },
    purrnet: {
      nodes: [
        {
          color: "purple",
          role: "Share",
          name: ".pwthread Export",
          ports: [["Local IDs Stripped", "Project Safe"]],
          desc: "Export .pwui and .pwthread files to share across separate Unity projects. Local GlobalObjectIds are stripped automatically on export.",
          code: `// Share -> Export Graph (.pwthread)\n// Re-binds paths cleanly on import`
        },
        {
          color: "blue",
          role: "Trigger",
          name: "Btn_CreateLobby",
          ports: [["OnClick", "→ Custom Hook"]],
          desc: "Connects any Compose or hand-built Legacy Button to a decoupled C# hook without modifying generated router code.",
          code: `btnCreateLobby.onClick.AddListener(() => {\n  OnCreateLobbyClicked?.Invoke();\n});`
        },
        {
          color: "gold",
          role: "Action",
          name: "Custom Hook",
          ports: [
            ["Event", "OnCreateLobbyClicked"],
            ["Code", "Public C# Event"]
          ],
          desc: "Generates a public C# event on PinwheelThread_UIFlow. Recompiling your UI graph later never overwrites your networking or gameplay code.",
          code: `public event Action OnCreateLobbyClicked;\n// Optional UnityEvent toggle in Inspector`
        },
        {
          color: "green",
          role: "Gameplay Script",
          name: "LobbyNetworkBridge.cs",
          ports: [
            ["OnEnable", "+= HandleCreateLobby"],
            ["OnDisable", "-= HandleCreateLobby"]
          ],
          desc: "Subscribe from PurrNet, Mirror, Netcode, or your own GameManager in a few lines of C# to keep UI wiring separate from game logic.",
          code: `void OnEnable()  => uiFlow.OnCreateLobbyClicked += Host;\nvoid OnDisable() => uiFlow.OnCreateLobbyClicked -= Host;`
        }
      ]
    }
  };

  const labelEl = document.getElementById("inspectorLabel");
  const descEl = document.getElementById("inspectorDesc");
  const codeEl = document.getElementById("inspectorCode");
  const tabBtns = document.querySelectorAll(".preset-tab");

  let currentPreset = "settings";
  let selectedIndex = 2;

  function render() {
    const data = presets[currentPreset];
    stage.innerHTML = "";

    data.nodes.forEach((node, idx) => {
      const card = document.createElement("div");
      card.className = "node-card" + (idx === selectedIndex ? " selected" : "");
      card.setAttribute("data-color", node.color);
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const portsHtml = node.ports
        .map(
          ([left, right]) =>
            `<div class="port-row"><span>${left}</span><span style="display:inline-flex;align-items:center;gap:6px;">${right}<span class="port-dot"></span></span></div>`
        )
        .join("");

      card.innerHTML = `
        <div class="node-head">
          <span class="node-role">${node.role}</span>
          <span class="port-dot"></span>
        </div>
        <div class="node-name">${node.name}</div>
        <div class="node-ports">${portsHtml}</div>
      `;

      const selectNode = () => {
        selectedIndex = idx;
        render();
      };
      card.addEventListener("click", selectNode);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectNode();
        }
      });

      stage.appendChild(card);
    });

    const activeNode = data.nodes[selectedIndex];
    labelEl.textContent = `Selected Node: ${activeNode.name}`;
    descEl.textContent = activeNode.desc;
    codeEl.textContent = activeNode.code;
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPreset = btn.getAttribute("data-flow");
      selectedIndex = 2;
      render();
    });
  });

  render();
}

/* 5. Interactive Pinwheel Motion Preset Tester */
function initMotionTester() {
  const note = document.getElementById("motionNote");
  const chips = document.querySelectorAll(".motion-chip");
  if (!note || !chips.length) return;

  const descriptions = {
    crisp: "Crisp Pop: 1.04x hover scale with a 0.95x click squish.",
    forge: "Heavy Forge: Firm hover lock-in with a downward click dip.",
    nudge: "Slide Nudge: Glides right (+9px) on hover for menu lists.",
    spring: "Spring Bounce: Underdamped spring overshoot on hover and release.",
    tilt: "Subtle Tilt: +1.8° rotation and lift on hover; straightens on click.",
    dread: "Dread Flicker: Brief alpha micro-flicker on hover for horror UI."
  };

  chips.forEach((chip) => {
    const key = chip.getAttribute("data-preset");
    const show = () => {
      note.textContent = descriptions[key] || "";
    };
    chip.addEventListener("mouseenter", show);
    chip.addEventListener("click", show);
    chip.addEventListener("focus", show);
  });
}

/* 6. Documentation Search, Asset Filter & Active TOC Highlight */
function initDocsFiltering() {
  const input = document.getElementById("docsSearch");
  const chapters = document.querySelectorAll(".docs-chapter");
  const banners = document.querySelectorAll(".doc-group-banner");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const tocLinks = document.querySelectorAll(".toc-list a");
  if (!chapters.length) return;

  let activeAsset = "all";

  function applyFilters() {
    const q = input ? input.value.trim().toLowerCase() : "";

    chapters.forEach((sec) => {
      const asset = sec.getAttribute("data-asset");
      const assetOk = activeAsset === "all" || asset === activeAsset;
      const queryOk = !q || sec.textContent.toLowerCase().includes(q);
      sec.classList.toggle("hidden-by-filter", !assetOk);
      sec.classList.toggle("hidden-by-search", !queryOk);
    });

    banners.forEach((banner) => {
      const asset = banner.getAttribute("data-asset");
      const assetOk = activeAsset === "all" || asset === activeAsset;
      banner.classList.toggle("hidden-by-filter", !assetOk);
    });
  }

  if (input) {
    input.addEventListener("input", applyFilters);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeAsset = btn.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });

  if ("IntersectionObserver" in window && tocLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            tocLinks.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    chapters.forEach((sec) => observer.observe(sec));
  }
}
