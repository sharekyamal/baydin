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
  const botLink = "https://t.me/YourBaydinBot"; // Replace with your actual bot link
  const shareText = `မေးခွန်း: ${questionText}\nအဖြေ: ${answerText}\n- လက်ထောက်ဗေဒင်\nBot: ${botLink}`;
  const encodedText = encodeURIComponent(shareText);

  try {
    if (window.Telegram && window.Telegram.WebApp) {
      // Share to Telegram chats
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodedText}`;
      window.Telegram.WebApp.openTelegramLink(shareUrl);
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
    try {
      await navigator.clipboard.writeText(shareText);
      alert("မျှဝေရန် မအောင်မြင်ပါ။ စာသားကို ကူးယူပြီးပါပြီ။ သင်နှစ်သက်ရာ နေရာတွင် ထည့်သွင်းမျှဝေနိုင်ပါသည်။");
    } catch (clipboardError) {
      console.error("Clipboard error:", clipboardError);
      alert("မျှဝေရန် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ စာသားကို ကိုယ်တိုင်ကူးယူပြီး မျှဝေပါ။");
    }
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initAdSonar();
  showScreen("home-screen");
});
