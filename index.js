const config = {
  herName: "安琪",
  titleSymbol: "❀",
  tagline: "从遇见你开始，星辰都变得温柔",
  carouselInterval: 2000,
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
    `提笔想写点什么给你，却发现千言万语都不足以表达我的心意。`,
    `💕我们在不同风景，相同时光里。`,
    `我总是想把我看到的，一切美好的东西都当做礼物送给你`
  ],
  signature: "Mr.Wang"
};

const state = {
  currentSlide: 0,
  touchStartX: 0,
  touchDeltaX: 0,
  longPressTimer: null,
  currentPage: 0,
  unlockComplete: false,
  footerStarIndex: 0,
  footerUnlocked: false,
  petalsActive: false,
  autoSlideTimer: null,
  musicAwaitingUserInteraction: false,
  aixinHideTimer: null,
  flowerHideTimer: null,
  hugHideTimer: null,
  letterTypingTimer: null,
  letterAutoTimer: null
};

const LETTER_TYPING_DELAY = 65;
const LETTER_SIGNATURE_DELAY = 90;
const LETTER_AUTO_ADVANCE_DELAY = 2000;

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
  bgMusic: document.querySelector("#bg-music"),
  aixinOverlay: document.querySelector(".aixin-overlay"),
  flowerOverlay: document.querySelector(".flower-overlay"),
  flowerOverlayImage: document.querySelector(".flower-overlay img"),
  hugOverlayModal: document.querySelector(".hug-overlay-modal"),
  hugOverlayImage: document.querySelector(".hug-overlay-modal img")
};

elements.footerStarItems = elements.footerStars
  ? Array.from(elements.footerStars.querySelectorAll("span"))
  : [];

const storyModalBody = elements.storyModal.querySelector(".modal-body");
const countdownModalBody = elements.countdownModal.querySelector(".modal-body");

applyTheme(config.theme);
initHero();
initCarousel();
initTimeline();
initLetters();
initFooter();
initModals();
initAixinOverlay();
initFlowerOverlay();
initButtons();
initUnlock();
initBackgroundMusic();

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
  if (!elements.heroBadge.querySelector(".hero-avatar")) {
    elements.heroBadge.textContent = config.titleSymbol ?? "♡";
  }
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
    img.setAttribute("draggable", "false");
    img.addEventListener("contextmenu", preventImageContextMenu);

    const caption = document.createElement("div");
    caption.className = "carousel-caption";
    caption.textContent = photo.caption || "";

    slide.appendChild(img);
    slide.appendChild(caption);
    elements.carouselTrack.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "carousel-dot";
    dot.type = "div";
    dot.setAttribute("aria-label", `查看第 ${index + 1} 张照片`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoSlide();
    });
    elements.carouselDots.appendChild(dot);

    slide.addEventListener("pointerdown", (event) =>
      handlePointerDown(event, photo.story)
    );
    slide.addEventListener("pointerup", handlePointerRelease);
    slide.addEventListener("pointerleave", handlePointerRelease);
    slide.addEventListener("pointercancel", handlePointerRelease);
    slide.addEventListener("contextmenu", preventImageContextMenu);
  });

  const carousel = elements.carouselTrack.closest(".carousel");
  carousel.addEventListener("touchstart", handleTouchStart, { passive: true });
  carousel.addEventListener("touchmove", handleTouchMove, { passive: true });
  carousel.addEventListener("touchend", handleTouchEnd);

  goToSlide(0);
  startAutoSlide();
}

function handlePointerDown(event, story) {
  clearAutoSlide();
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

function handlePointerRelease() {
  clearLongPress();
  restartAutoSlide();
}

function preventImageContextMenu(event) {
  event.preventDefault();
}

function handleTouchStart(event) {
  clearAutoSlide();
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
  restartAutoSlide();
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

function startAutoSlide() {
  clearAutoSlide();
  const total = Array.isArray(config.photos) ? config.photos.length : 0;
  if (total <= 1) return;
  const interval = getCarouselInterval();
  if (!interval || interval <= 0) return;
  state.autoSlideTimer = window.setInterval(() => {
    goToSlide(state.currentSlide + 1);
  }, interval);
}

function clearAutoSlide() {
  if (state.autoSlideTimer !== null) {
    window.clearInterval(state.autoSlideTimer);
    state.autoSlideTimer = null;
  }
}

function restartAutoSlide() {
  startAutoSlide();
}

function getCarouselInterval() {
  const defaultInterval = 1000;
  const value = Number(config.carouselInterval);
  if (Number.isFinite(value)) {
    if (value <= 0) return value;
    return value;
  }
  return defaultInterval;
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
  if (!elements.letterPagesWrapper || !elements.pageIndicator) return;
  elements.letterPagesWrapper.innerHTML = "";
  elements.pageIndicator.innerHTML = "";

  config.letters.forEach((text, index) => {
    const page = document.createElement("article");
    page.className = "letter-page";
    page.dataset.index = index.toString();

    const paragraph = document.createElement("p");
    paragraph.className = "letter-content";
    paragraph.dataset.fullText = text.trim();
    paragraph.textContent = "";
    page.appendChild(paragraph);

    if (index === config.letters.length - 1) {
      const signature = document.createElement("p");
      signature.className = "letter-signature";
      signature.dataset.fullText = (config.signature ?? "").trim();
      signature.textContent = "";
      signature.hidden = true;
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
  clearLetterTimers();
  state.currentPage = Math.max(0, Math.min(index, total - 1));

  elements.letterPagesWrapper
    .querySelectorAll(".letter-page")
    .forEach((page, idx) => {
      const isActive = idx === state.currentPage;
      page.classList.toggle("active", isActive);
      if (!isActive) {
        resetLetterPageContent(page);
      }
    });

  elements.pageIndicator
    .querySelectorAll(".page-dot")
    .forEach((dot, idx) => {
      dot.classList.toggle("active", idx === state.currentPage);
    });

  startLetterTyping(state.currentPage);

  if (state.currentPage === total - 1 && !state.petalsActive) {
    state.petalsActive = true;
    launchPetalRain();
    showToast("花瓣为你飘落");
  }
}

function resetLetterPageContent(page) {
  if (!page) return;
  const content = page.querySelector(".letter-content");
  if (content) {
    content.textContent = "";
  }
  const signature = page.querySelector(".letter-signature");
  if (signature) {
    signature.textContent = "";
    signature.hidden = true;
  }
}

function startLetterTyping(index) {
  clearLetterTypingTimer();
  const total = config.letters.length;
  if (total === 0) return;
  if (!elements.letterPagesWrapper) return;
  const page = elements.letterPagesWrapper.querySelector(`.letter-page[data-index="${index}"]`);
  if (!page) {
    scheduleLetterAutoAdvance(index);
    return;
  }

  resetLetterPageContent(page);

  const content = page.querySelector(".letter-content");
  if (!content) {
    scheduleLetterAutoAdvance(index);
    return;
  }

  const fullText = content.dataset.fullText ?? "";
  const chars = Array.from(fullText);
  let charIndex = 0;

  const typeNextChar = () => {
    state.letterTypingTimer = null;
    if (charIndex < chars.length) {
      content.textContent += chars[charIndex];
      charIndex += 1;
      state.letterTypingTimer = window.setTimeout(typeNextChar, LETTER_TYPING_DELAY);
      return;
    }
    typeSignature();
  };

  const typeSignature = () => {
    const signatureEl = page.querySelector(".letter-signature");
    if (!signatureEl) {
      scheduleLetterAutoAdvance(index);
      return;
    }
    const signatureText = signatureEl.dataset.fullText ?? "";
    if (!signatureText) {
      signatureEl.hidden = false;
      scheduleLetterAutoAdvance(index);
      return;
    }
    signatureEl.hidden = false;
    const signatureChars = Array.from(signatureText);
    let signatureIndex = 0;

    const typeSignatureChar = () => {
      state.letterTypingTimer = null;
      if (signatureIndex < signatureChars.length) {
        signatureEl.textContent += signatureChars[signatureIndex];
        signatureIndex += 1;
        state.letterTypingTimer = window.setTimeout(typeSignatureChar, LETTER_SIGNATURE_DELAY);
        return;
      }
      scheduleLetterAutoAdvance(index);
    };

    typeSignatureChar();
  };

  typeNextChar();
}

function scheduleLetterAutoAdvance(index) {
  const total = config.letters.length;
  if (total <= 1) return;
  clearLetterAutoTimer();
  state.letterAutoTimer = window.setTimeout(() => {
    state.letterAutoTimer = null;
    goToPage((index + 1) % total);
  }, LETTER_AUTO_ADVANCE_DELAY);
}

function clearLetterTypingTimer() {
  if (state.letterTypingTimer !== null) {
    clearTimeout(state.letterTypingTimer);
    state.letterTypingTimer = null;
  }
}

function clearLetterAutoTimer() {
  if (state.letterAutoTimer !== null) {
    clearTimeout(state.letterAutoTimer);
    state.letterAutoTimer = null;
  }
}

function clearLetterTimers() {
  clearLetterTypingTimer();
  clearLetterAutoTimer();
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
  if (!elements.footerStarItems || elements.footerStarItems.length === 0) {
    return;
  }
  if (state.footerUnlocked) {
    showToast("彩蛋已经点亮啦");
    return;
  }
  const star = elements.footerStarItems[state.footerStarIndex];
  if (!star) {
    return;
  }
  star.classList.add("lit");
  state.footerStarIndex += 1;
  const remaining = elements.footerStarItems.length - state.footerStarIndex;
  if (remaining > 0) {
    showToast(`再轻触 ${remaining} 次发现惊喜`);
    return;
  }
  state.footerUnlocked = true;
  elements.footerSecret.hidden = false;
  showToast("我一直在偷偷想你");
  showFlowerOverlay();
}

function initButtons() {
  elements.pulseButton.addEventListener("click", handlePulse);
  elements.hugButton.addEventListener("click", handleHug);
}

function handlePulse(event) {
  const button = event.currentTarget;
  playHeartbeatSound();
  createHeartWave(button);
  showAixinOverlay();
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
  showHugOverlayModal();
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

function initAixinOverlay() {
  if (!elements.aixinOverlay) return;
  elements.aixinOverlay.addEventListener("click", hideAixinOverlay);
}

function initFlowerOverlay() {
  if (!elements.flowerOverlay) return;
  elements.flowerOverlay.addEventListener("click", hideFlowerOverlay);
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

function initBackgroundMusic() {
  const audio = elements.bgMusic;
  if (!audio) return;

  const ensurePlayback = () => ensureBackgroundMusic();
  const ensurePlaybackWithPrompt = () => ensureBackgroundMusic({ showPrompt: true });

  audio.addEventListener("ended", ensurePlayback);
  audio.addEventListener("stalled", ensurePlayback);
  audio.addEventListener("suspend", () => window.setTimeout(ensurePlayback, 400));
  audio.addEventListener("waiting", ensurePlayback);
  audio.addEventListener("error", ensurePlaybackWithPrompt);
  audio.addEventListener("pause", () => {
    if (document.hidden || state.musicAwaitingUserInteraction) return;
    window.setTimeout(() => {
      if (!audio.paused && !audio.ended) return;
      ensureBackgroundMusic();
    }, 200);
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ensureBackgroundMusic();
    }
  });

  window.addEventListener("focus", ensurePlayback);
  window.addEventListener("pageshow", ensurePlayback);
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
  ensureBackgroundMusic({ showPrompt: true });
}

function ensureBackgroundMusic(options = {}) {
  const { showPrompt = false } = options;
  const audio = elements.bgMusic;
  if (!audio) return;

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.65;

  if (!audio.paused && !audio.ended) {
    state.musicAwaitingUserInteraction = false;
    return;
  }

  const requestByGesture = () => {
    if (state.musicAwaitingUserInteraction) return;
    state.musicAwaitingUserInteraction = true;
    const resume = () => {
      state.musicAwaitingUserInteraction = false;
      ensureBackgroundMusic();
    };
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("touchstart", resume, { once: true });
  };

  audio
    .play()
    .then(() => {
      state.musicAwaitingUserInteraction = false;
    })
    .catch(() => {
      if (showPrompt) {
        showToast("轻触任意位置即可播放背景音乐");
      }
      requestByGesture();
    });
}

function showModal(modal) {
  modal.hidden = false;
}

function hideModal(modal) {
  modal.hidden = true;
}

function showAixinOverlay() {
  if (!elements.aixinOverlay) return;
  clearAixinHideTimer();
  elements.aixinOverlay.hidden = false;
  requestAnimationFrame(() => {
    elements.aixinOverlay.classList.add("show");
  });
  state.aixinHideTimer = window.setTimeout(() => {
    hideAixinOverlay();
  }, 3000);
}

function hideAixinOverlay() {
  if (!elements.aixinOverlay) return;
  clearAixinHideTimer();
  elements.aixinOverlay.classList.remove("show");
  window.setTimeout(() => {
    if (!elements.aixinOverlay.classList.contains("show")) {
      elements.aixinOverlay.hidden = true;
    }
  }, 280);
}

function clearAixinHideTimer() {
  if (state.aixinHideTimer !== null) {
    clearTimeout(state.aixinHideTimer);
    state.aixinHideTimer = null;
  }
}

function showFlowerOverlay() {
  if (!elements.flowerOverlay) return;
  clearFlowerHideTimer();
  restartGif(elements.flowerOverlayImage);
  elements.flowerOverlay.hidden = false;
  requestAnimationFrame(() => {
    elements.flowerOverlay.classList.add("show");
  });
  state.flowerHideTimer = window.setTimeout(() => {
    hideFlowerOverlay();
  }, 5000);
}

function hideFlowerOverlay() {
  if (!elements.flowerOverlay) return;
  clearFlowerHideTimer();
  elements.flowerOverlay.classList.remove("show");
  window.setTimeout(() => {
    if (!elements.flowerOverlay.classList.contains("show")) {
      elements.flowerOverlay.hidden = true;
    }
  }, 320);
}

function clearFlowerHideTimer() {
  if (state.flowerHideTimer !== null) {
    clearTimeout(state.flowerHideTimer);
    state.flowerHideTimer = null;
  }
}

function showHugOverlayModal() {
  if (!elements.hugOverlayModal) return;
  clearHugHideTimer();
  restartGif(elements.hugOverlayImage);
  elements.hugOverlayModal.hidden = false;
  requestAnimationFrame(() => {
    elements.hugOverlayModal.classList.add("show");
  });
  state.hugHideTimer = window.setTimeout(() => {
    hideHugOverlayModal();
  }, 3000);
}

function hideHugOverlayModal() {
  if (!elements.hugOverlayModal) return;
  clearHugHideTimer();
  elements.hugOverlayModal.classList.remove("show");
  window.setTimeout(() => {
    if (!elements.hugOverlayModal.classList.contains("show")) {
      elements.hugOverlayModal.hidden = true;
    }
  }, 280);
}

function clearHugHideTimer() {
  if (state.hugHideTimer !== null) {
    clearTimeout(state.hugHideTimer);
    state.hugHideTimer = null;
  }
}

function restartGif(image) {
  if (!image) return;
  const src = image.getAttribute("src");
  if (!src) return;
  image.setAttribute("src", "");
  // 强制重绘以确保浏览器重新加载 GIF
  void image.offsetWidth;
  image.setAttribute("src", src);
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
