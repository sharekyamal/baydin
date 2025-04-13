// Initialize Telegram WebApp
window.Telegram.WebApp.ready();
const telegramUser = window.Telegram.WebApp.initDataUnsafe.user || { id: "test_user" };

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBS0gyUpvvvp8EoEQpsbNNZ4HOHeJcMzFI",
  authDomain: "natymetsi.firebaseapp.com",
  projectId: "natymetsi",
  storageBucket: "natymetsi.firebasestorage.app",
  messagingSenderId: "1026866134400",
  appId: "1:1026866134400:web:2f577f051b2d564a84d565",
  measurementId: "G-H1K543SS8T"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sample AdSonar initialization (replace with actual credentials)
function initAdSonar() {
  console.log("Initializing AdSonar...");
  const bannerDiv = document.getElementById("adsonar-banner");
  bannerDiv.innerHTML = '<div>AdSonar Banner Ad (300x250)</div>'; // Placeholder
}

// Show AdSonar ad (placeholder)
function showAd() {
  console.log("Showing AdSonar interstitial ad...");
}

// Load JSON data
async function loadData() {
  try {
    const response = await fetch("data.json");
    return await response.json();
  } catch (error) {
    console.error("Error loading data:", error);
    return { categories: [] };
  }
}

// Show specific screen
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });
  document.getElementById(screenId).classList.remove("hidden");
}

// Show categories screen
async function showCategories() {
  const data = await loadData();
  const grid = document.getElementById("categories-grid");
  grid.innerHTML = "";
  data.categories.forEach((category) => {
    const item = document.createElement("div");
    item.className = "grid-item";
    item.innerHTML = `
      <div class="icon">${category.icon}</div>
      <div>${category.name}</div>
    `;
    item.onclick = () => showQuestions(category.id);
    grid.appendChild(item);
  });
  showScreen("categories-screen");
}

// Show questions screen
async function showQuestions(categoryId) {
  const data = await loadData();
  const category = data.categories.find((c) => c.id === categoryId);
  if (!category) return;

  document.getElementById("category-title").textContent = category.name;
  const list = document.getElementById("question-list");
  list.innerHTML = "";
  category.questions.forEach((q) => {
    const item = document.createElement("div");
    item.className = "question-item";
    item.textContent = q.text;
    item.onclick = () => showAnswer(q.id);
    list.appendChild(item);
  });
  showScreen("questions-screen");
}

// Show answer screen
async function showAnswer(questionId) {
  const data = await loadData();
  let questionText = "";
  let answers = [];
  data.categories.forEach((category) => {
    const question = category.questions.find((q) => q.id === questionId);
    if (question) {
      questionText = question.text;
      answers = question.answers;
    }
  });

  const answer = answers[Math.floor(Math.random() * answers.length)];
  document.getElementById("question-text").textContent = questionText;
  document.getElementById("answer-text").textContent = answer;

  // Show ad
  showAd();

  showScreen("answer-screen");
}

// Share answer as text
async function shareAnswer() {
  const questionText = document.getElementById("question-text").textContent;
  const answerText = document.getElementById("answer-text").textContent;
  const shareText = `မေးခွန်း: ${questionText}\nအဖြေ: ${answerText}\n- လက်ထောက်ဗေဒင်`;
  const encodedText = encodeURIComponent(shareText);

  try {
    if (window.Telegram.WebApp) {
      // Use Telegram's share URL for more reliable sharing
      const telegramShareUrl = `https://t.me/share/url?text=${encodedText}`;
      window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else if (navigator.share) {
      // Fallback to Web Share API
      await navigator.share({
        text: shareText,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      alert("မျှဝေရန်အတွက် စာသားကို ကူးယူပြီးပါပြီ။ သင်နှစ်သက်ရာ နေရာတွင် ထည့်သွင်းမျှဝေနိုင်ပါသည်။");
    }
  } catch (error) {
    console.error("Share error:", error);
    // Try clipboard as a final fallback
    try {
      await navigator.clipboard.writeText(shareText);
      alert("မျှဝေရန် မအောင်မြင်ပါ။ စာသားကို ကူးယူပြီးပါပြီ။ သင်နှစ်သက်ရာ နေရာတွင် ထည့်သွင်းမျှဝေနိုင်ပါသည်။");
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError);
      alert("မျှဝေရန် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ စာသားကို ကိုယ်တိုင်ကူးယူပြီး မျှဝေပါ။");
    }
  }
}

// Falling stars animation
function initStarsAnimation() {
  const canvas = document.getElementById("stars-canvas");
  if (!canvas) {
    console.error("Canvas not found!");
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas context not available!");
    return;
  }

  console.log("Initializing stars animation...");

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Resize canvas on window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Star object
  const stars = [];
  const numStars = 50;
  const colors = ["#FFFFFF", "#FF69B4", "#00FFFF", "#FFD700"]; // White, Pink, Cyan, Gold

  function Star() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * -1; // Start above screen
    this.size = Math.random() * 2 + 2; // Larger stars
    this.baseSize = this.size;
    this.speed = Math.random() * 3 + 2; // Faster fall
    this.opacity = Math.random() * 0.5 + 0.5; // Varying opacity
    this.color = colors[Math.floor(Math.random() * colors.length)]; // Random color
    this.phase = Math.random() * Math.PI * 2; // For twinkling

    this.draw = function () {
      // Twinkle effect
      const twinkle = this.baseSize * (1 + 0.3 * Math.sin(this.phase));
      ctx.beginPath();
      ctx.arc(this.x, this.y, twinkle, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1; // Reset alpha

      // Draw faint trail
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y - this.speed * 2);
      ctx.strokeStyle = `${this.color}80`; // Semi-transparent
      ctx.lineWidth = twinkle * 0.5;
      ctx.stroke();
    };

    this.update = function () {
      this.y += this.speed;
      this.phase += 0.1; // Twinkle speed
      if (this.y > canvas.height + this.size) {
        this.y = -this.size;
        this.x = Math.random() * canvas.width;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)]; // New color
        this.phase = Math.random() * Math.PI * 2;
      }
      this.draw();
    };
  }

  // Initialize stars
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => star.update());
    requestAnimationFrame(animate);
  }

  animate();
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initAdSonar();
  initStarsAnimation();
  showScreen("home-screen");
});
