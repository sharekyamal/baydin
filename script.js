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
      adContainer.classList.add("loaded"); // Mark as loaded
      adContainer.classList.remove("hidden"); // Show ad
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
      window.clickCount = 0; // Reset counter
    }
  } catch (error) {
    console.error("Interstitial ad error:", error);
    window.clickCount = 0;
  }
}

// Show specific screen
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });
  document.getElementById(screenId).classList.remove("hidden");

  // Show ad for specific screens (e.g., all screens except home)
  if (screenId !== "home-screen") {
    initAdSonar();
  } else {
    hideAd();
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  // Only show ad after user interaction, not on initial load
  showScreen("home-screen");
});
