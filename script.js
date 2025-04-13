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
const analytics = firebase.analytics();

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
  // Log screen view to Firebase Analytics
  analytics.logEvent('screen_view', { screen_name: screenId });
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

  // Log answer event to Firebase Analytics
  analytics.logEvent('view_answer', {
    question_id: questionId,
    question_text: questionText,
    answer_text: answer
  });

  // Show ad
  showAd();

  showScreen("answer-screen");
}

// Share answer as image
async function shareAnswer() {
  const answerContent = document.getElementById("answer-content");
  try {
    const canvas = await html2canvas(answerContent, {
      backgroundColor: null, // Preserve the background
      useCORS: true,
      scale: 2, // Improve image quality
    });
    const image = canvas.toDataURL("image/png");

    // Log share event to Firebase Analytics
    analytics.logEvent('share_answer');

    if (window.Telegram.WebApp.shareTo) {
      window.Telegram.WebApp.shareTo(image);
    } else {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], "answer.png", { type: "image/png" });
      navigator.share({
        files: [file],
        text: "ဗေဒင်အဖြေ",
      }).catch((error) => console.error("Error sharing:", error));
    }
  } catch (error) {
    console.error("Error generating image:", error);
    alert("မျှဝေရန် မအောင်မြင်ပါ။");
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initAdSonar();
  showScreen("home-screen");
});
