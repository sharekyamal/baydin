// Initialize Telegram WebApp
window.Telegram.WebApp.ready();
const telegramUser = window.Telegram.WebApp.initDataUnsafe.user || { id: "test_user" };

// Initialize Firebase
const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sample AdSonar initialization (replace with actual credentials)
function initAdSonar() {
  console.log("Initializing AdSonar...");
  // AdSonar.init({
  //   appId: "YOUR_APP_ID",
  //   apiKey: "YOUR_API_KEY",
  // });
  // Banner ad
  console.log("Loading AdSonar banner...");
  // AdSonar.loadBanner({
  //   adUnitId: "YOUR_BANNER_AD_UNIT_ID",
  //   containerId: "adsonar-banner",
  //   width: 300,
  //   height: 250,
  // });
}

// Show AdSonar interstitial ad (placeholder)
function showAd() {
  console.log("Showing AdSonar interstitial ad...");
  // AdSonar.showInterstitial({
  //   onClose: () => console.log("Ad closed"),
  // });
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

let selectedQuestionId = null;

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
    item.onclick = () => selectQuestion(q.id, item);
    list.appendChild(item);
  });
  selectedQuestionId = null;
  document.getElementById("ask-button").classList.add("hidden");
  showScreen("questions-screen");
}

// Select question
function selectQuestion(questionId, element) {
  selectedQuestionId = questionId;
  document.querySelectorAll(".question-item").forEach((item) => {
    item.classList.remove("selected");
  });
  element.classList.add("selected");
  document.getElementById("ask-button").classList.remove("hidden");
}

// Show answer screen
async function showAnswer() {
  if (!selectedQuestionId) return;

  const data = await loadData();
  let questionText = "";
  let answers = [];
  data.categories.forEach((category) => {
    const question = category.questions.find((q) => q.id === selectedQuestionId);
    if (question) {
      questionText = question.text;
      answers = question.answers;
    }
  });

  const answer = answers[Math.floor(Math.random() * answers.length)];
  document.getElementById("answer-text").textContent = answer;

  // Save to Firebase
  try {
    await db.collection("history").add({
      userId: telegramUser.id,
      question: questionText,
      answer,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving to Firebase:", error);
  }

  // Show ad
  showAd();

  selectedQuestionId = null;
  showScreen("answer-screen");
}

// Share answer
function shareAnswer() {
  const answer = document.getElementById("answer-text").textContent;
  const shareText = `ဗေဦဦဦဦဦဦဦဦဦဦဒင်အဖြေ: ${answer} \nသင်လည်း ဗေဦဦဦဦဦဦဦဦဦဦဒင်မေးကြည့်ပါ: [Your Bot Link]`;
  if (window.Telegram.WebApp.shareTo) {
    window.Telegram.WebApp.shareTo(shareText);
  } else {
    navigator.share({
      text: shareText,
    }).catch((error) => console.error("Error sharing:", error));
  }
  console.log("Sharing:", shareText);
}

// Show history screen
async function showHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  try {
    const snapshot = await db
      .collection("history")
      .where("userId", "==", telegramUser.id)
      .orderBy("timestamp", "desc")
      .get();
    if (snapshot.empty) {
      list.innerHTML = "<li>မှတ်တမ်းမရှိသေးပါ</li>";
    } else {
      snapshot.forEach((doc) => {
        const item = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `
          <p><strong>မေးခွန်း:</strong> ${item.question}</p>
          <p><strong>အဖြေ:</strong> ${item.answer}</p>
          <p><strong>အချိန်:</strong> ${
            item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : "N/A"
          }</p>
        `;
        list.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error loading history:", error);
    list.innerHTML = "<li>မှတ်တမ်းများကို မဖတ်နိုင်ပါ</li>";
  }
  showScreen("history-screen");
}

// Initialize particles
function initParticles() {
  particlesJS("particles-js", {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      move: { enable: true, speed: 1, direction: "none", random: true },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  });
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initAdSonar();
  initParticles();
  showScreen("home-screen");
});
