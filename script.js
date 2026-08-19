const TOTAL = 35;
const MUSIC_FILE = ""; // 添加音乐后改为，例如："audio/music.mp3"
const image = document.querySelector("#image");
const artwork = document.querySelector("#next");
const counter = document.querySelector("#current");
const hint = document.querySelector(".hint");
const audio = document.querySelector("#audio");
const sound = document.querySelector("#sound");
let index = 1;
let touchStart = 0;
let lastClick = 0;
let lastTouch = 0;

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

image.addEventListener("click", event => {
  const now = Date.now();
  if (now - lastClick < 300 || now - lastTouch < 500) return;
  lastClick = now;
  const bounds = image.getBoundingClientRect();
  const direction = event.clientX < bounds.left + bounds.width / 2 ? -1 : 1;
  show(index + direction);
});
document.addEventListener("keydown", event => {
  if (["ArrowRight"," ","Enter"].includes(event.key)) { event.preventDefault(); show(index + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
});
artwork.addEventListener("touchstart", event => { touchStart = event.changedTouches[0].clientX; }, {passive:true});
artwork.addEventListener("touchend", event => {
  lastTouch = Date.now();
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 45) show(index + (distance < 0 ? 1 : -1));
}, {passive:true});
if (MUSIC_FILE) {
  audio.src = MUSIC_FILE;
  sound.hidden = false;
  sound.addEventListener("click", async () => {
    if (audio.paused) { await audio.play(); sound.textContent = "声音：开"; }
    else { audio.pause(); sound.textContent = "声音：关"; }
  });
}

window.addEventListener("load", () => window.setTimeout(preloadNext, 800), {once:true});
