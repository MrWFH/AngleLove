const config = {
  herName: "安琪",
  titleSymbol: "❀",
  tagline: "从遇见你开始，星辰都变得温柔",
  theme: {
    primary: "#f3a6c4",
    secondary: "#c9b6ff",
    accent: "#ff7ea6",
    dark: "#4a2a4f",
    light: "#fff6fb"
  },
  photos: [
    {
      src: "./image/sun.jpg",
      caption: "第一次一起看的日落",
      story: "那天的晚风很温柔，你说晚霞把我染成了粉红色，我知道那是喜欢。"
    },
    {
      src: "./image/game.jpg",
      caption: "笑声定格的瞬间",
      story: "我们在峡谷里厮杀，你总是让我先选英雄，你说你相信我的实力。"
    },
    {
      src: "./image/cut.jpg",
      caption: "把你守护在怀里",
      story: "我发誓以后要给你所有的温暖和安全感。"
    }
  ],
  timeline: [
    {
      date: "2019-05-20",
      label: "第一次认识你",
      icon: "🌅"
    },
    {
      date: "2019-06-18",
      label: "一起谈天说地",
      icon: "💬"
    },
    {
      date: "20225-10-09",
      label: "第一次和你一起玩铲铲游戏",
      icon: "🎮"
    },
    {
      date: "20225-11-11",
      label: "最浪漫的夜晚",
      icon: "🌙"
    }
  ],
  letters: [
    `我以为我早就忘了你，直到我在人群中一眼就认出了你。`,
    `提笔想写点什么给你，却发现千言万语都不足以表达我的心意。`,
    `未来很长，但我知道每一个明天都有你陪伴。愿我永远是你疲惫时的港湾，快乐时的伙伴，失落时的依靠。`,
    `翻到这里的时候，花瓣会为我们落下。谢谢你选择我，让我有机会把世界上最真诚的爱给你。`
  ],
  signature: "你猜我是谁"
};

const state = {
  currentSlide: 0,
  touchStartX: 0,
  touchDeltaX: 0,
  longPressTimer: null,
  currentPage: 0,
  unlockComplete: false,
  footerTapCount: 0,
  footerTapTimer: null,
  petalsActive: false
};

const elements = {
  lockScreen: document.querySelector(".lock-screen"),
  heartLock: document.querySelector(".heart-lock"),
  unlockButton: document.querySelector(".unlock-button"),
  mainContent: document.querySelector(".main-content"),
  heroTitle: document.querySelector(".hero-title"),
  heroSubtitle: document.querySelector(".hero-subtitle"),
  heroBadge: document.querySelector(".hero-badge"),
  carouselTrack: document.querySelector(".carousel-track"),
  carouselDots: document.querySelector(".carousel-dots"),
  carouselSection: document.querySelector(".carousel-section"),
  timelineList: document.querySelector(".timeline"),
  letterPagesWrapper: document.querySelector(".letter-pages"),
  pageIndicator: document.querySelector(".page-indicator"),
  pulseButton: document.querySelector(".pulse-button"),
  hugButton: document.querySelector(".hug-button"),
  storyModal: document.querySelector(".story-modal"),
  countdownModal: document.querySelector(".countdown-modal"),
  toast: document.querySelector(".toast"),
  footerStars: document.querySelector(".footer-stars"),
  footerSecret: document.querySelector(".footer-secret"),
  petalContainer: document.querySelector(".petal-container"),
  bgMusic: document.querySelector("#bg-music")
};

const storyModalBody = elements.storyModal.querySelector(".modal-body");
const countdownModalBody = elements.countdownModal.querySelector(".modal-body");

applyTheme(config.theme);
initHero();
initCarousel();
initTimeline();
initLetters();
initFooter();
initModals();
initButtons();
initUnlock();

function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.primary) root.style.setProperty("--theme-primary", theme.primary);
  if (theme.secondary) root.style.setProperty("--theme-secondary", theme.secondary);
  if (theme.accent) root.style.setProperty("--theme-accent", theme.accent);
  if (theme.dark) root.style.setProperty("--theme-dark", theme.dark);
  if (theme.light) root.style.setProperty("--theme-light", theme.light);
}

function initHero() {
  elements.heroTitle.textContent = `${config.herName}❤️`;
  elements.heroSubtitle.textContent = config.tagline;
  elements.heroBadge.textContent = config.titleSymbol ?? "♡";
}

function initCarousel() {
  if (!Array.isArray(config.photos)) return;

  elements.carouselTrack.innerHTML = "";
  elements.carouselDots.innerHTML = "";

  config.photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    slide.dataset.index = index.toString();

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || `我们的合照 ${index + 1}`;

    const caption = document.createElement("div");
    caption.className = "carousel-caption";
    caption.textContent = photo.caption || "";

    slide.appendChild(img);
    slide.appendChild(caption);
    elements.carouselTrack.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `查看第 ${index + 1} 张照片`);
    dot.addEventListener("click", () => goToSlide(index));
    elements.carouselDots.appendChild(dot);

    slide.addEventListener("pointerdown", (event) =>
      handlePointerDown(event, photo.story)
    );
    slide.addEventListener("pointerup", clearLongPress);
    slide.addEventListener("pointerleave", clearLongPress);
    slide.addEventListener("pointercancel", clearLongPress);
  });

  const carousel = elements.carouselTrack.closest(".carousel");
  carousel.addEventListener("touchstart", handleTouchStart, { passive: true });
  carousel.addEventListener("touchmove", handleTouchMove, { passive: true });
  carousel.addEventListener("touchend", handleTouchEnd);

  goToSlide(0);
}

function handlePointerDown(event, story) {
  if (!story) return;
  clearLongPress();
  state.longPressTimer = window.setTimeout(() => {
    showStory(story);
  }, 600);
}

function clearLongPress() {
  if (state.longPressTimer) {
    clearTimeout(state.longPressTimer);
    state.longPressTimer = null;
  }
}

function handleTouchStart(event) {
  state.touchStartX = event.touches[0].clientX;
  state.touchDeltaX = 0;
}

function handleTouchMove(event) {
  state.touchDeltaX = event.touches[0].clientX - state.touchStartX;
}

function handleTouchEnd() {
  const threshold = 50;
  if (state.touchDeltaX > threshold) {
    goToSlide(state.currentSlide - 1);
  } else if (state.touchDeltaX < -threshold) {
    goToSlide(state.currentSlide + 1);
  }
  state.touchStartX = 0;
  state.touchDeltaX = 0;
}

function goToSlide(index) {
  const total = config.photos.length;
  if (total === 0) return;
  state.currentSlide = (index + total) % total;
  const offset = -state.currentSlide * 100;
  elements.carouselTrack.style.transform = `translateX(${offset}%)`;

  elements.carouselTrack
    .querySelectorAll(".carousel-slide")
    .forEach((slide, idx) => {
      slide.classList.toggle("active", idx === state.currentSlide);
    });

  elements.carouselDots
    .querySelectorAll(".carousel-dot")
    .forEach((dot, idx) => {
      dot.classList.toggle("active", idx === state.currentSlide);
    });
}

function initTimeline() {
  if (!Array.isArray(config.timeline)) return;
  elements.timelineList.innerHTML = "";

  config.timeline.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "timeline-item";
    item.tabIndex = 0;

    const bullet = document.createElement("div");
    bullet.className = "timeline-bullet";
    bullet.textContent = entry.icon || "❤";

    const date = document.createElement("p");
    date.className = "timeline-date";
    date.textContent = formatDate(entry.date);

    const label = document.createElement("p");
    label.className = "timeline-label";
    label.textContent = entry.label || "";

    item.dataset.date = entry.date;

    item.append(bullet, date, label);
    elements.timelineList.appendChild(item);

    item.addEventListener("click", () => showCountdown(entry.date, entry.label));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCountdown(entry.date, entry.label);
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.35 }
  );

  elements.timelineList
    .querySelectorAll(".timeline-item")
    .forEach((item) => observer.observe(item));
}

function initLetters() {
  if (!Array.isArray(config.letters)) return;
  elements.letterPagesWrapper.innerHTML = "";
  elements.pageIndicator.innerHTML = "";

  config.letters.forEach((text, index) => {
    const page = document.createElement("article");
    page.className = "letter-page";
    page.dataset.index = index.toString();

    const paragraph = document.createElement("p");
    paragraph.textContent = text.trim();
    page.appendChild(paragraph);

    if (index === config.letters.length - 1) {
      const signature = document.createElement("p");
      signature.className = "letter-signature";
      signature.textContent = config.signature;
      page.appendChild(signature);
    }

    elements.letterPagesWrapper.appendChild(page);

    const dot = document.createElement("span");
    dot.className = "page-dot";
    elements.pageIndicator.appendChild(dot);
  });

  const book = elements.letterPagesWrapper.closest(".letter-book");
  book.addEventListener("touchstart", handleLetterTouchStart, { passive: true });
  book.addEventListener("touchmove", handleLetterTouchMove, { passive: true });
  book.addEventListener("touchend", handleLetterTouchEnd);
  book.addEventListener("wheel", handleLetterWheel, { passive: false });

  goToPage(0);
}

function handleLetterTouchStart(event) {
  state.letterTouchStartY = event.touches[0].clientY;
  state.letterTouchDeltaY = 0;
}

function handleLetterTouchMove(event) {
  state.letterTouchDeltaY = event.touches[0].clientY - state.letterTouchStartY;
}

function handleLetterTouchEnd() {
  const threshold = 60;
  if (state.letterTouchDeltaY > threshold) {
    goToPage(state.currentPage - 1);
  } else if (state.letterTouchDeltaY < -threshold) {
    goToPage(state.currentPage + 1);
  }
  state.letterTouchStartY = 0;
  state.letterTouchDeltaY = 0;
}

function handleLetterWheel(event) {
  event.preventDefault();
  const direction = Math.sign(event.deltaY);
  if (direction > 0) {
    goToPage(state.currentPage + 1);
  } else if (direction < 0) {
    goToPage(state.currentPage - 1);
  }
}

function goToPage(index) {
  const total = config.letters.length;
  if (total === 0) return;
  state.currentPage = Math.max(0, Math.min(index, total - 1));

  elements.letterPagesWrapper
    .querySelectorAll(".letter-page")
    .forEach((page, idx) => {
      page.classList.toggle("active", idx === state.currentPage);
    });

  elements.pageIndicator
    .querySelectorAll(".page-dot")
    .forEach((dot, idx) => {
      dot.classList.toggle("active", idx === state.currentPage);
    });

  if (state.currentPage === total - 1 && !state.petalsActive) {
    state.petalsActive = true;
    launchPetalRain();
    showToast("花瓣为你飘落");
  }
}

function initFooter() {
  elements.footerStars.addEventListener("click", handleFooterTap);
  elements.footerStars.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleFooterTap();
    }
  });
}

function handleFooterTap() {
  state.footerTapCount += 1;
  if (!state.footerTapTimer) {
    state.footerTapTimer = window.setTimeout(resetFooterTap, 4000);
  }
  if (state.footerTapCount >= 5) {
    resetFooterTap();
    elements.footerSecret.hidden = false;
    showToast("我一直在偷偷想你");
  }
}

function resetFooterTap() {
  state.footerTapCount = 0;
  if (state.footerTapTimer) {
    clearTimeout(state.footerTapTimer);
    state.footerTapTimer = null;
  }
}

function initButtons() {
  elements.pulseButton.addEventListener("click", handlePulse);
  elements.hugButton.addEventListener("click", handleHug);
}

function handlePulse(event) {
  const button = event.currentTarget;
  playHeartbeatSound();
  createHeartWave(button);
  const originalText = button.textContent;
  button.textContent = "收到你的心跳啦";
  showToast("心跳同步中...");
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 3000);
}

function createHeartWave(button) {
  const wave = document.createElement("span");
  wave.className = "heart-pulse-wave";
  button.style.position = "relative";
  button.appendChild(wave);
  window.setTimeout(() => wave.remove(), 1600);
}

function handleHug() {
  document.body.classList.add("hugging");
  showToast("给你温暖的拥抱");
  window.setTimeout(() => document.body.classList.remove("hugging"), 2400);
}

function initModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        hideModal(modal);
      }
    });
    modal.querySelector(".modal-close")?.addEventListener("click", () => {
      hideModal(modal);
    });
  });
}

function showStory(story) {
  storyModalBody.textContent = story;
  showModal(elements.storyModal);
}

function showCountdown(dateStr, label) {
  const { days, hours, minutes } = calculateDurationFrom(dateStr);
  const lines = [
    `${label || "我们的纪念日"}`,
    `距离现在已经过去`,
    `${days} 天 ${hours} 小时 ${minutes} 分钟`
  ];
  countdownModalBody.textContent = lines.join("\n");
  showModal(elements.countdownModal);
}

function initUnlock() {
  elements.unlockButton.addEventListener("click", handleUnlock);
}

function handleUnlock() {
  if (state.unlockComplete) return;
  state.unlockComplete = true;
  elements.heartLock.classList.add("unlocking");
  playUnlockSound();
  window.setTimeout(() => {
    elements.lockScreen.classList.add("hidden");
    elements.mainContent.classList.add("active");
    document.body.style.overflow = "auto";
    playBackgroundMusic();
    showToast("欢迎来到我们的世界");
  }, 1100);
}

function playBackgroundMusic() {
  const audio = elements.bgMusic;
  if (!audio) return;
  audio.volume = 0.65;
  audio.play().catch(() => {
    showToast("轻触任意位置即可播放背景音乐");
    const resume = () => {
      audio.play().catch(() => {});
      document.removeEventListener("click", resume);
      document.removeEventListener("touchstart", resume);
    };
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });
  });
}

function showModal(modal) {
  modal.hidden = false;
}

function hideModal(modal) {
  modal.hidden = true;
}

function calculateDurationFrom(dateStr) {
  const now = new Date();
  const date = parseDate(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes - days * 24 * 60) / 60);
  const remainingMinutes = minutes - days * 24 * 60 - hours * 60;
  return {
    days: Math.max(days, 0),
    hours: Math.max(hours, 0),
    minutes: Math.max(remainingMinutes, 0)
  };
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const normalized = dateStr.replace(/[.]/g, "-");
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, ".").replace(/\//g, ".");
}

function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  requestAnimationFrame(() => elements.toast.classList.add("show"));
  window.setTimeout(() => {
    elements.toast.classList.remove("show");
    window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 400);
  }, 2600);
}

function launchPetalRain() {
  const total = 30;
  for (let i = 0; i < total; i += 1) {
    window.setTimeout(() => spawnPetal(i), i * 120);
  }
}

function spawnPetal(index) {
  const petal = document.createElement("span");
  petal.className = "petal";
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() * 20 - 10);
  petal.style.left = `${startX}%`;
  petal.style.setProperty("--start-x", `${startX}%`);
  petal.style.setProperty("--end-x", `${endX}%`);
  petal.style.animationDuration = `${3.5 + Math.random() * 2}s`;
  petal.style.animationDelay = `${Math.random() * 0.6}s`;
  elements.petalContainer.appendChild(petal);
  petal.addEventListener(
    "animationend",
    () => {
      petal.remove();
      if (index === 29) {
        window.setTimeout(() => {
          state.petalsActive = false;
        }, 8000);
      }
    },
    { once: true }
  );
}

function playUnlockSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(660, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.6);
    o.onended = () => ctx.close();
  } catch (error) {
    console.error("unlock sound error", error);
  }
}

function playHeartbeatSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = 0;

    function thump(delay) {
      const osc = ctx.createOscillator();
      const now = ctx.currentTime + delay;
      osc.type = "sine";
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }

    thump(0);
    thump(0.32);
    window.setTimeout(() => ctx.close(), 1200);
  } catch (error) {
    console.error("heartbeat sound error", error);
  }
}
