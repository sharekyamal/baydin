// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS0gyUpvvvp8EoEQpsbNNZ4HOHeJcMzFI",
  authDomain: "natymetsi.firebaseapp.com",
  projectId: "natymetsi",
  storageBucket: "natymetsi.firebasestorage.app",
  messagingSenderId: "1026866134400",
  appId: "1:1026866134400:web:2f577f051b2d564a84d565",
  measurementId: "G-H1K543SS8T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

// AdSonar Banner Ad (300x250)
window.AdSonar = window.AdSonar || {};
window.AdSonar.loadAd = function () {
  const adBanner = document.getElementById("adsonar-banner");
  if (adBanner) {
    adBanner.innerHTML = "<div>AdSonar Banner Ad (300x250)</div>";
  }
};

// Telegram WebApp Initialization
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Sample Data
const categories = [
  {
    name: "အချစ်ရေး",
    icon: "💕",
    questions: [
      { text: "သူငါ့ကိုချစ်ရဲ့လား", answers: ["ချစ်တယ်", "မချစ်ဘူး", "နည်းနည်းချစ်တယ်"] },
      { text: "ငါတို့လက်ထပ်နိုင်မလား", answers: ["နိုင်တယ်", "မနိုင်ဘူး", "နောက်မှပေါ့"] },
    ],
  },
  {
    name: "အလုပ်အကိုင်",
    icon: "💼",
    questions: [
      { text: "ငါ့အလုပ်သစ်အဆင်ပြေမလား", answers: ["ပြေတယ်", "မပြေဘူး", "နည်းနည်းခက်မယ်"] },
      { text: "ငါရာထူးတိုးမလား", answers: ["တိုးမယ်", "မတိုးဘူး", "နောက်မှတိုးမယ်"] },
    ],
  },
];

// Show Screen Function
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });
  document.getElementById(screenId).classList.remove("hidden");
}

// Show Categories
function showCategories() {
  const grid = document.getElementById("categories-grid");
  grid.innerHTML = "";
  categories.forEach((category, index) => {
    const item = document.createElement("div");
    item.className = "grid-item";
    item.innerHTML = `<span class="icon">${category.icon}</span><br>${category.name}`;
    item.onclick = () => showQuestions(index);
    grid.appendChild(item);
  });
  showScreen("categories-screen");
}

// Show Questions
function showQuestions(categoryIndex) {
  const category = categories[categoryIndex];
  document.getElementById("category-title").textContent = category.name;
  const list = document.getElementById("question-list");
  list.innerHTML = "";
  category.questions.forEach((question, questionIndex) => {
    const item = document.createElement("div");
    item.className = "question-item";
    item.textContent = question.text;
    item.onclick = () => showAnswer(categoryIndex, questionIndex);
    list.appendChild(item);
  });
  showScreen("questions-screen");
}

// Show Answer
async function showAnswer(categoryIndex, questionIndex) {
  const category = categories[categoryIndex];
  const question = category.questions[questionIndex];
  const randomAnswer =
    question.answers[Math.floor(Math.random() * question.answers.length)];
  document.getElementById("question-text").textContent = question.text;
  document.getElementById("answer-text").textContent = randomAnswer;
  showScreen("answer-screen");

  // Save to Firestore
  const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "anonymous";
  await db.collection("history").add({
    userId: userId,
    category: category.name,
    question: question.text,
    answer: randomAnswer,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// Share Answer
function shareAnswer() {
  const question = document.getElementById("question-text").textContent;
  const answer = document.getElementById("answer-text").textContent;
  const shareText = `မေးခွန်း: ${question}\nအဖြေ: ${answer}\n- နတ်မျက်စိ`;
  const encodedText = encodeURIComponent(shareText);
  
  // Use Telegram's Share URL Scheme
  const shareUrl = `https://t.me/share/url?url=${encodedText}&text=${encodedText}`;
  
  // Open the Share URL using Telegram WebApp
  if (window.Telegram.WebApp) {
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    // Fallback for non-Telegram environments
    window.open(shareUrl, "_blank");
  }
}

// Show History
async function showHistory() {
  const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "anonymous";
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";
  const querySnapshot = await db
    .collection("history")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.category}: ${data.question} - ${data.answer}`;
    historyList.appendChild(li);
  });
  showScreen("history-screen");
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  showScreen("home-screen");
  window.AdSonar.loadAd();
});
