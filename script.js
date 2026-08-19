const TOTAL = 35;
const MUSIC_FILE = ""; // 添加音乐后改为，例如："audio/music.mp3"
const image = document.querySelector("#image");
const artwork = document.querySelector("#next");
const counter = document.querySelector("#current");
const hint = document.querySelector(".hint");
const audio = document.querySelector("#audio");
const sound = document.querySelector("#sound");
let index = 1;
let gestureStartX = null;
let gestureStartY = null;
let activePointerId = null;
let lastPointerAction = 0;

function preloadNext() {
  const next = (index % TOTAL) + 1;
  const preload = new Image();
  preload.src = `images/${String(next).padStart(2,"0")}.webp?v=2`;
}

function show(next) {
  index = ((next - 1 + TOTAL) % TOTAL) + 1;
  const number = String(index).padStart(2,"0");
  artwork.classList.add("changing");
  window.setTimeout(() => {
    image.src = `images/${number}.webp?v=2`;
    image.alt = `星云像，作品切片 ${index}，共 ${TOTAL} 张`;
    counter.textContent = number;
    image.onload = () => {
      artwork.classList.remove("changing");
      window.setTimeout(preloadNext, 500);
    };
  }, 180);
  hint.classList.add("hidden");
}

function navigateFromPoint(clientX) {
  const now = Date.now();
  if (now - lastPointerAction < 300) return;
  lastPointerAction = now;
  const bounds = image.getBoundingClientRect();
  const direction = clientX < bounds.left + bounds.width / 2 ? -1 : 1;
  show(index + direction);
}

function startGesture(clientX, clientY, pointerId) {
  gestureStartX = clientX;
  gestureStartY = clientY;
  activePointerId = pointerId;
}

function resetGesture() {
  gestureStartX = null;
  gestureStartY = null;
  activePointerId = null;
}

function finishGesture(clientX, clientY, pointerType, pointerId) {
  if (activePointerId !== pointerId || gestureStartX === null || gestureStartY === null) return;
  const distanceX = clientX - gestureStartX;
  const distanceY = clientY - gestureStartY;
  const horizontal = Math.abs(distanceX);
  const vertical = Math.abs(distanceY);
  resetGesture();

  if (horizontal > 45 && horizontal > vertical) {
    const now = Date.now();
    if (now - lastPointerAction < 300) return;
    lastPointerAction = now;
    show(index + (distanceX < 0 ? 1 : -1));
    return;
  }

  const tapTolerance = pointerType === "mouse" ? 5 : 12;
  if (horizontal <= tapTolerance && vertical <= tapTolerance) navigateFromPoint(clientX);
}

if ("PointerEvent" in window) {
  image.addEventListener("pointerdown", event => {
    if (event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
    startGesture(event.clientX, event.clientY, event.pointerId);
    image.setPointerCapture?.(event.pointerId);
  });
  image.addEventListener("pointerup", event => {
    finishGesture(event.clientX, event.clientY, event.pointerType, event.pointerId);
  });
  image.addEventListener("pointercancel", resetGesture);
} else {
  image.addEventListener("click", event => navigateFromPoint(event.clientX));
  image.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];
    startGesture(touch.clientX, touch.clientY, "touch");
  }, {passive:true});
  image.addEventListener("touchend", event => {
    const touch = event.changedTouches[0];
    finishGesture(touch.clientX, touch.clientY, "touch", "touch");
  }, {passive:true});
  image.addEventListener("touchcancel", resetGesture, {passive:true});
}

document.addEventListener("keydown", event => {
  if (["ArrowRight"," ","Enter"].includes(event.key)) { event.preventDefault(); show(index + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
});
if (MUSIC_FILE) {
  audio.src = MUSIC_FILE;
  sound.hidden = false;
  sound.addEventListener("click", async () => {
    if (audio.paused) { await audio.play(); sound.textContent = "声音：开"; }
    else { audio.pause(); sound.textContent = "声音：关"; }
  });
}

window.addEventListener("load", () => window.setTimeout(preloadNext, 800), {once:true});
