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

// AdSonar configuration
const adSonarConfig = {
  appId: "YOUR_APP_ID", // Replace with your actual App ID
  apiKey: "YOUR_API_KEY", // Replace with your actual API Key
  bannerAdUnitId: "YOUR_BANNER_AD_UNIT_ID", // Replace with your actual Banner Ad Unit ID
  interstitialAdUnitId: "YOUR_INTERSTITIAL_AD_UNIT_ID", // Replace with your actual Interstitial Ad Unit ID
};

// Initialize AdSonar and load Banner Ad
function initAdSonar() {
  console.log("Initializing AdSonar...");
  // Uncomment and replace with actual AdSonar initialization
  /*
  AdSonar.init({
    appId: adSonarConfig.appId,
    apiKey: adSonarConfig.apiKey,
  });
  */
  
  // Load Banner Ad
  const bannerDiv = document.getElementById("adsonar-banner");
  if (bannerDiv) {
    bannerDiv.innerHTML = '<div>AdSonar Banner Ad (300x250)</div>'; // Placeholder
    // Uncomment to enable actual Banner Ad
    /*
    AdSonar.showBanner({
      adUnitId: adSonarConfig.bannerAdUnitId,
      size: "300x250",
      container: bannerDiv,
    });
    */
  }
}

// Show AdSonar Interstitial Ad
function showInterstitialAd() {
  console.log("Showing AdSonar interstitial ad...");
  // Uncomment to enable actual Interstitial Ad
  /*
  AdSonar.showInterstitial({
    adUnitId: adSonarConfig.interstitialAdUnitId,
    onClose: () => console.log("Interstitial Ad closed"),
  });
  */
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

  // Show Interstitial Ad
  showInterstitialAd();

  showScreen("answer-screen");
}

// Share answer
function shareAnswer() {
  const question = document.getElementById("question-text").textContent;
  const answer = document.getElementById("answer-text").textContent;
  const shareText = `ဗေဦဦဒင်\nမေးခွန်း: ${question}\nအဖြေ: ${answer}\nသင်လည်း ဗေဦဦဒင်မေးကြည့်ပါ: [Your Bot Link]`;
  
  try {
    // For Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const encodedText = encodeURIComponent(shareText);
      const shareUrl = `https://t.me/share/url?text=${encodedText}`;
      window.Telegram.WebApp.openLink(shareUrl);
    } 
    // For other platforms
    else if (navigator.share) {
      navigator.share({
        text: shareText,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert("မျှဝေရန်အတွက် စာသားကို ကူးယူလိုက်ပါပြီ။");
      });
    }
  } catch (error) {
    console.error("Error sharing:", error);
    alert("မျှဝေရန် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်ကြိုးစားပါ။");
  }
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

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initAdSonar();
  showScreen("home-screen");
});
