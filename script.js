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

// Global click counter for interstitial ads
window.clickCount = 0;

// Sample AdSonar initialization with error handling
function initAdSonar() {
  console.log("Initializing AdSonar...");
  try {
    const adContainer = document.getElementById("ad-container");
    if (adContainer && typeof window.Sonar !== "undefined" && !adContainer.classList.contains("loaded")) {
      window.Sonar.show({ adUnit: "nms_banner" });
      adContainer.classList.add("loaded");
      adContainer.classList.remove("hidden");
      console.log("AdSonar banner loaded successfully.");
    } else {
      console.warn("AdSonar not loaded or no ad container found.");
    }
  } catch (error) {
    console.error("AdSonar initialization error:", error);
  }
}

// Hide ad container
function hideAd() {
  const adContainer = document.getElementById("ad-container");
  if (adContainer) {
    adContainer.classList.add("hidden");
    console.log("Ad hidden.");
  }
}

// Track clicks and show interstitial ad every 5 clicks
function trackClick() {
  window.clickCount++;
  console.log(`Click count: ${window.clickCount}`);
  try {
    if (window.clickCount >= 5 && typeof window.Sonar !== "undefined") {
      console.log("Showing AdSonar interstitial ad...");
      window.Sonar.show({ adUnit: "nms_inter" });
      window.clickCount = 0;
    }
  } catch (error) {
    console.error("Interstitial ad error:", error);
    window.clickCount = 0;
  }
}

// Show specific screen
function showScreen(screenId) {
  console.log(`Showing screen: ${screenId}`);
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove("hidden");
  } else {
    console.error(`Screen with ID ${screenId} not found.`);
  }

  // Show ad for specific screens (e.g., all screens except home)
  if (screenId !== "home-screen") {
    initAdSonar();
  } else {
    hideAd();
  }
}

// Show categories screen and load categories
function showCategories() {
  console.log("showCategories called");
  try {
    showScreen("categories-screen");
    loadCategories();
  } catch (error) {
    console.error("Error in showCategories:", error);
  }
}

// Load categories from Firestore
function loadCategories() {
  console.log("Loading categories...");
  const categoriesGrid = document.getElementById("categories-grid");
  if (!categoriesGrid) {
    console.error("Categories grid not found.");
    return;
  }
  categoriesGrid.innerHTML = "";

  db.collection("categories")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const category = doc.data();
        const categoryCard = document.createElement("div");
        categoryCard.className = "category-card";
        categoryCard.innerHTML = `
          <img src="${category.icon || 'default-icon.png'}" alt="${category.name}">
          <p>${category.name}</p>
        `;
        categoryCard.onclick = () => showQuestions(doc.id, category.name);
        categoriesGrid.appendChild(categoryCard);
      });
      console.log("Categories loaded successfully.");
    })
    .catch((error) => {
      console.error("Error loading categories:", error);
    });
}

// Show questions for a category
function showQuestions(categoryId, categoryName) {
  console.log(`Showing questions for category: ${categoryName}`);
  try {
    showScreen("questions-screen");
    document.getElementById("category-title").textContent = categoryName;
    const questionList = document.getElementById("question-list");
    if (!questionList) {
      console.error("Question list not found.");
      return;
    }
    questionList.innerHTML = "";

    db.collection("categories")
      .doc(categoryId)
      .collection("questions")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const question = doc.data();
          const questionItem = document.createElement("div");
          questionItem.className = "question-item";
          questionItem.innerHTML = `<p>${question.text}</p>`;
          questionItem.onclick = () => showAnswer(categoryId, doc.id, question.text);
          questionList.appendChild(questionItem);
        });
        console.log("Questions loaded successfully.");
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
      });
  } catch (error) {
    console.error("Error in showQuestions:", error);
  }
}

// Show answer for a question
function showAnswer(categoryId, questionId, questionText) {
  console.log(`Showing answer for question: ${questionText}`);
  try {
    showScreen("answer-screen");
    trackClick();
    document.getElementById("question-text").textContent = questionText;
    const answerText = document.getElementById("answer-text");
    answerText.textContent = "အဖြေကို ဖွင့်နေပါသည်...";

    db.collection("categories")
      .doc(categoryId)
      .collection("questions")
      .doc(questionId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const answer = doc.data().answer || "အဖြေမရှိပါ။";
          answerText.textContent = answer;
          console.log("Answer loaded successfully.");
        } else {
          answerText.textContent = "အဖြေမတွေ့ပါ။";
          console.error("Answer not found.");
        }
      })
      .catch((error) => {
        console.error("Error loading answer:", error);
        answerText.textContent = "အဖြေဖွင့်ရာတွင် အမှားအယွင်းရှိပါသည်။";
      });
  } catch (error) {
    console.error("Error in showAnswer:", error);
  }
}

// Share answer
function shareAnswer() {
  console.log("Sharing answer...");
  const question = document.getElementById("question-text").textContent;
  const answer = document.getElementById("answer-text").textContent;
  const shareText = `မေးခွန်း: ${question}\nအဖြေ: ${answer}\n\nနတ်မျက်စိဖြင့် ဗေဒင်မေးကြည့်ပါ - https://t.me/NatMyetSiBot`;
  window.Telegram.WebApp.shareTo(shareText);
  trackClick();
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");
  showScreen("home-screen");
});
