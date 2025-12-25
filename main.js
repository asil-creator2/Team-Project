
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQYuaGNzwCPQ1kecl6_cQZVvDxiS9HtG8",
  authDomain: "movies-app-7dab2.firebaseapp.com",
  projectId: "movies-app-7dab2",
  storageBucket: "movies-app-7dab2.firebasestorage.app",
  messagingSenderId: "138953300462",
  appId: "1:138953300462:web:95a3b6e1e91699c82956ff"
};


// Firebase App
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase Auth
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { GoogleAuthProvider, signInWithCredential } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


window.signUpCallback = async function (response) {
  const credential = GoogleAuthProvider.credential(response.credential);

  try {
    const result = await signInWithCredential(auth, credential);
    console.log("Firebase user:", result.user);
    signupModel.classList.remove('active')
    loginModal.classList.remove('active')
        Swal.fire({
          title: `Welcome ${result.user.displayName} !`,
          text: "We Hope You Enjoy our website!",
          background: "#9d4edd",
          icon: "success",
          color: "#fff",
          customClass: {
            popup: "rounded-swal",
            confirmButton: "swal-confirm",
          },
        })
  } catch (error) {
    console.error(error);
  }
};



// API Configuration
const apiKey = "38d4fc734b633813b0de7e5758379d2a";

// DOM Elements
const navbar = document.querySelector(".navbar");
const favoritesIcon = document.getElementById("favorites-icon");
const loginModal = document.getElementById("login-modal");
const movieModal = document.getElementById("movie-modal");
const favoritesModal = document.getElementById("favorites-modal");
const loginModalClose = document.getElementById("login-modal-close");
const movieModalClose = document.getElementById("movie-modal-close");
const favoritesModalClose = document.getElementById("favorites-modal-close");
const signupBtn = document.getElementById("signup-btn");
const searchInput = document.querySelector(".search-input");
const faqItems = document.querySelectorAll(".faq-item");
const browseMoviesBtn = document.getElementById("browse-movies-btn");
const favoritesCountElement = document.getElementById("favorites-count");
const favoritesCountText = document.getElementById("favorites-count-text");
const favoritesBody = document.getElementById("favorites-body");
const favoritesEmpty = document.getElementById("favorites-empty");
const loginBtnNavigation = document.getElementById("login-btn");
const signupModel = document.getElementById("signUpModel");
const signupModelClose = document.getElementById("signUp-modal-close");
const notificationModal = document.getElementById("notificationModal");


// Notifications (GLOBAL)
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
let unreadCount = 0;

// Global variables
let favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
let nowWatching = JSON.parse(localStorage.getItem("nowWatching")) || [];

/* ===== Subscription helpers (persisted per user or guest) ===== */
function getCurrentUserKey() {
  return auth.currentUser?.uid || 'guest';
}

function loadPlansMap() {
  try {
    return JSON.parse(localStorage.getItem('plans_map') || '{}');
  } catch (e) {
    console.warn('Invalid plans_map in localStorage, resetting');
    localStorage.removeItem('plans_map');
    return {};
  }
}

function savePlansMap(map) {
  localStorage.setItem('plans_map', JSON.stringify(map));
}

function ensurePlanInfo() {
  const key = getCurrentUserKey();
  const map = loadPlansMap();
  if (!map[key]) {
    map[key] = { plan: 'free', monthStart: Date.now(), moviesWatchedThisMonth: 0 };
    savePlansMap(map);
  } else {
    const info = map[key];
    const start = new Date(info.monthStart);
    const now = new Date();
    if (start.getMonth() !== now.getMonth() || start.getFullYear() !== now.getFullYear()) {
      info.monthStart = Date.now();
      info.moviesWatchedThisMonth = 0;
      savePlansMap(map);
    }
  }
  return map[key];
}

function getPlanForCurrentUser() {
  return ensurePlanInfo();
}

function setPlanForCurrentUser(plan) {
  const key = getCurrentUserKey();
  const map = loadPlansMap();
  map[key] = map[key] || { plan: 'free', monthStart: Date.now(), moviesWatchedThisMonth: 0 };
  map[key].plan = plan;
  map[key].monthStart = Date.now();
  map[key].moviesWatchedThisMonth = 0;
  savePlansMap(map);
}

function remainingMoviesForUser() {
  const info = ensurePlanInfo();
  const limits = { free: 4, pro: 10, premium: Infinity };
  const limit = limits[info.plan] ?? 4;
  return limit === Infinity ? Infinity : Math.max(0, limit - info.moviesWatchedThisMonth);
}

function incrementMovieCount() {
  const key = getCurrentUserKey();
  const map = loadPlansMap();
  map[key] = map[key] || { plan: 'free', monthStart: Date.now(), moviesWatchedThisMonth: 0 };
  map[key].moviesWatchedThisMonth = (map[key].moviesWatchedThisMonth || 0) + 1;
  savePlansMap(map);
}

// Update the small plan badge in the navbar (desktop and mobile)
function updatePlanBadge() {
  const el = document.getElementById('plan-badge');
  const mobileEl = document.getElementById('plan-badge-mobile');
  try {
    const info = getPlanForCurrentUser();
    const planName = (info.plan || 'free').replace(/^./, s => s.toUpperCase());
    const remaining = remainingMoviesForUser();
    const remText = remaining === Infinity ? 'Unlimited' : `${remaining} left`;
    if (el) el.textContent = `${planName} • ${remText}`;
    if (mobileEl) mobileEl.textContent = `${planName}`;
  } catch (e) {
    if (el) el.textContent = 'Free • 4 left';
    if (mobileEl) mobileEl.textContent = 'Free';
    console.warn('updatePlanBadge error', e);
  }

  // Attach click handler once
  const elDesktop = document.getElementById('plan-badge');
  if (elDesktop && !elDesktop.dataset.bound) {
    elDesktop.addEventListener('click', (e) => { e.preventDefault(); scrollToPlans(); });
    elDesktop.dataset.bound = '1';
  }
  const elMobile = document.getElementById('plan-badge-mobile');
  if (elMobile && !elMobile.dataset.bound) {
    elMobile.addEventListener('click', () => scrollToPlans());
    elMobile.dataset.bound = '1';
  }
}

// Smoothly scroll to the plans section, with debug logging
function scrollToPlans() { 
  // Prefer explicit id anchor
  let el = document.querySelector('#planssection') || document.querySelector('.plans-wrapper');
  if (!el) {
    console.warn('scrollToPlans: plans element not found');
    return;
  }

  console.log('scrollToPlans: target element found:', el);

  const headerOffset = 80; // adjust if your navbar height differs

  try {
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.pageYOffset + rect.top - headerOffset;
    const targetTop = Math.max(0, Math.floor(absoluteTop));
    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // briefly highlight the section
    const prev = el.style.boxShadow;
    el.style.boxShadow = '0 12px 36px rgba(157,78,221,0.18)';
    setTimeout(() => (el.style.boxShadow = prev || ''), 1600);
  } catch (err) {
    console.warn('scrollToPlans: error during scrollIntoView', err);
    // fallback: compute absolute position and scroll
    try {
      const rect = el.getBoundingClientRect();
      const absoluteTop = window.pageYOffset + rect.top;
      window.scrollTo({ top: Math.max(0, absoluteTop - headerOffset), behavior: 'smooth' });
      const prev = el.style.boxShadow;
      el.style.boxShadow = '0 12px 36px rgba(157,78,221,0.18)';
      setTimeout(() => (el.style.boxShadow = prev || ''), 1600);
      console.log('scrollToPlans: fallback scrolled to', absoluteTop - headerOffset);
    } catch (err2) {
      console.warn('scrollToPlans: fallback also failed', err2);
    }
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
// Update favorites count
updateFavoritesCount();

// Load movies data
loadPopularMovies();
loadPopularSeries();
loadNowPlayingMovies();
loadContinuePlayingMovies();

// Setup event listeners
setupEventListeners();

updateBadge();
renderNotifications();
  updatePlanBadge();

// Navbar scroll effect
window.addEventListener("scroll", handleNavbarScroll);
});




// Setup all event listeners
function setupEventListeners() {
  // Login icon click
  const openSignupModel = () => {
    signupModel.classList.add('active');
};
  document.getElementById('user-icon').addEventListener("click", openSignupModel)
// Favorites icon click
favoritesIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  showFavoritesModal();
});

// Modal close buttons
loginModalClose.addEventListener("click", () => {
  loginModal.classList.remove("active");
});

signupModelClose.addEventListener("click", () => {
  signupModel.classList.remove("active");
});

movieModalClose.addEventListener("click", () => {
  movieModal.classList.remove("active");
});

favoritesModalClose.addEventListener("click", () => {
  favoritesModal.classList.remove("active");
});

// Close modal when clicking outside
[loginModal, movieModal, favoritesModal, signupModel, notificationModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});

// Sign up button
signupBtn.addEventListener("click", () => {
  loginModal.classList.remove("active");
  signupModel.classList.add("active");
});
loginBtnNavigation.addEventListener("click", () => {
  loginModal.classList.add("active");
  signupModel.classList.remove("active");
});

// Browse movies button in favorites modal
browseMoviesBtn.addEventListener("click", () => {
  favoritesModal.classList.remove("active");
  // Scroll to movies section
  document
    .querySelector("#movies-section")
    .scrollIntoView({ behavior: "smooth" });
});

  // Login form submission
  document.querySelector(".login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginModal.classList.remove('active')
    Swal.fire({
          title: "Welcome!",
          text: "loged in Sucesss",
          background: "#9d4edd",
          icon: "success",
          color: "#fff",
          customClass: {
            popup: "rounded-swal",
            confirmButton: "swal-confirm",
          },
        })
    
  } catch (err) {
    showNotification("Invalid email or password");
  }
  });

onAuthStateChanged(auth, async (user) => {
  const text = document.getElementById('text');
  const logout = document.getElementById('logout');
  const userIcon = document.getElementById('user-icon');
  const logoutMobile = document.getElementById('mobileLogout')
  const mobileAccount = document.getElementById('account')
  if (user) {
    await user.reload(); 

    console.log("Logged in:", user.email);
    console.log("Name:", user.displayName);

    text.innerText = user.displayName || 'User';
    mobileAccount.innerText = user.displayName || 'User';
    logoutMobile.style.display = 'block'
    userIcon.style.display = 'block';
    logout.style.display = 'block';
    userIcon.removeEventListener('click', openSignupModel)

    // Show current plan and remaining allowance on login
    try {
      const planInfo = getPlanForCurrentUser();
      const remaining = remainingMoviesForUser();
      showNotification(`Plan: ${planInfo.plan} • ${remaining === Infinity ? 'Unlimited' : remaining + ' left'}`);
      updatePlanBadge();
    } catch (err) {
      // ignore if helpers not yet available
      console.warn('Plan info not available yet', err);
    }

  } else {
    console.log("Logged out");
     switch (document.documentElement.lang) {
        case 'ar':
          text.innerText = 'تسجيل الدخول';
          break;
        case 'en':
          text.innerText = 'Sign up';
          break;
        case 'tr':
          text.innerText = 'Giriş Yap';
          break;
     }
    logoutMobile.style.display = 'none'
    logout.style.display = 'none';
    userIcon.addEventListener('click',() => {
      signupModel.classList.add('active')
    })
    // Update plan badge to reflect guest state when logged out
    try { updatePlanBadge(); } catch(e) { /* ignore */ }

  }
});


// logout click
document.getElementById('logout').addEventListener('click', () => {
  Swal.fire({
    title: "Do you want to logout?",
    text: "You will be logged out from the website (Note: This action cannot be undone)",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    customClass: {
      popup: "rounded-swal",
      confirmButton: "swal-confirm",
      cancelButton : "swal-confirm"
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      await signOut(auth);

      Swal.fire({
        title: "Loged out success",
        icon: "success",
        confirmButtonText: "Ok",
        customClass: {
          popup: "rounded-swal",
          confirmButton: "swal-confirm",
        },
      });
    }
  });
});

  // signup form submission

  document.querySelector(".signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailSign").value.trim();
    const password = document.getElementById("passwordSign").value.trim();
    const name = document.getElementById('name').value.trim()
    try {

      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });

      await user.reload();

      console.log("Saved name:", user.displayName);
      signupModel.classList.remove("active");

      Swal.fire({
        title: `Welcome ${user.displayName}!`,
        text: "Signed Up Sucesssfully",
        background: "#9d4edd",
        icon: "success",
        color: "#fff",
        customClass: {
          popup: "rounded-swal",
          confirmButton: "swal-confirm",
        },
        })
    } catch (err) {
      showNotification(err.message);
    }
  });




// Setup slider buttons
setupSliderButtons();

// Smooth scrolling for navigation links
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    // Update active class
    document
      .querySelectorAll(".nav-links a")
      .forEach((a) => a.classList.remove("active"));
    this.classList.add("active");

    // Scroll to section
    const targetId = this.getAttribute("href");
    if (targetId !== "#") {
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: "smooth",
        });
      }
    }
  });
});

// ----------------------Notification icon click----------------
document.getElementById("notifications-icon").addEventListener("click", () => {
  notificationModal.classList.add("active");
  unreadCount = 0;
  updateBadge();
  renderNotifications();
});

const closeNotifBtn = document.getElementById("closeNotification");
if (closeNotifBtn) {
closeNotifBtn.addEventListener("click", () => {
  notificationModal.classList.remove("active");
});
}

document.getElementById("clearNotifications").addEventListener("click", () => {
  notifications = [];
  localStorage.removeItem("notifications");
  unreadCount = 0;
  updateBadge();
  renderNotifications();
});


}




setTimeout(() => {
addNotification("Your watch progress was saved.");
showNotification('Your watch progress was saved.')
}, 8000);

setInterval(() => {
if (notificationModal.classList.contains("active")) {
  renderNotifications();
}
}, 60000);


function updateBadge() {
const badge = document.getElementById("notificationBadge");
if (!badge) return;

if (unreadCount > 0) {
  badge.style.display = "inline-block";
  badge.textContent = unreadCount;
} else {
  badge.textContent = unreadCount;
}
}

function renderNotifications() {
const list = document.getElementById("notificationList");
if (!list) return;

list.innerHTML = "";

if (notifications.length === 0) {
  list.innerHTML = `<p style="font-size:14px;color:#6b7280;">No notifications</p>`;
  return;
}

notifications.forEach(n => {
list.innerHTML += `
  <div class="notification-item">
    <p class="notification-text">${n.message}</p>
    <span class="notification-time">${timeAgo(n.createdAt)}</span>
  </div>
`;
});

};


function addNotification(message) {
const newNotification = {
  message,
  createdAt: Date.now() // ✅ real timestamp
};

notifications.unshift(newNotification);
localStorage.setItem("notifications", JSON.stringify(notifications));

unreadCount++;
updateBadge();

if (notificationModal.classList.contains("active")) {
  renderNotifications();
}
}
function timeAgo(timestamp) {
const seconds = Math.floor((Date.now() - timestamp) / 1000);

if (seconds < 60) return "Just now";

const minutes = Math.floor(seconds / 60);
if (minutes < 60) return `${minutes} min ago`;

const hours = Math.floor(minutes / 60);
if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

const days = Math.floor(hours / 24);
return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Setup Netflix-Style FAQ Accordion
function setupNetflixFAQAccordion() {
faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  question.addEventListener("click", () => {
    // Close all other FAQ items
    faqItems.forEach((otherItem) => {
      if (otherItem !== item && otherItem.classList.contains("active")) {
        otherItem.classList.remove("active");
        const otherAnswer = otherItem.querySelector(".faq-answer");
        otherAnswer.style.maxHeight = 0;
        otherAnswer.style.opacity = 0;
        otherAnswer.style.padding = "0 30px";
      }
    });

    // Toggle current item
    if (item.classList.contains("active")) {
      item.classList.remove("active");
      answer.style.maxHeight = 0;
      answer.style.opacity = 0;
      answer.style.padding = "0 30px";
    } else {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";
      answer.style.opacity = 1;
      answer.style.padding = "30px";
    }
  });
});
}

// Update favorites count in navbar
function updateFavoritesCount() {
const count = favoriteMovies.length;
favoritesCountElement.textContent = count;

// Hide count if zero
if (count === 0) {
  favoritesCountElement.style.display = "none";
} else {
  favoritesCountElement.style.display = "flex";
}
}

// Show favorites modal
function showFavoritesModal() {
favoritesModal.classList.add("active");
renderFavorites();
}

// Render favorites in the modal
function renderFavorites() {
// Update count text
const count = favoriteMovies.length;
favoritesCountText.textContent = `You have ${count} favorite ${
  count === 1 ? "movie" : "movies"
}`;

// Clear current content
favoritesBody.innerHTML = "";

if (count === 0) {
  // Show empty state
  favoritesBody.appendChild(favoritesEmpty.cloneNode(true));
  // Re-add event listener to browse movies button
  favoritesBody
    .querySelector("#browse-movies-btn")
    .addEventListener("click", () => {
      favoritesModal.classList.remove("active");
      document
        .querySelector("#movies-section")
        .scrollIntoView({ behavior: "smooth" });
    });
} else {
  // Create favorites grid
  const favoritesGrid = document.createElement("div");
  favoritesGrid.className = "favorites-grid";

  // Add each favorite movie
  favoriteMovies.forEach((movie) => {
    const favoriteCard = createFavoriteCard(movie);
    favoritesGrid.appendChild(favoriteCard);
  });

  favoritesBody.appendChild(favoritesGrid);
}
}

// Create a favorite card element
function createFavoriteCard(movie) {
const card = document.createElement("div");
card.className = "favorite-card";
card.dataset.id = movie.id;
card.dataset.type = movie.type;

const imageUrl = movie.poster_path
  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";

card.innerHTML = `
      <img src="${imageUrl}" alt="${movie.title}" class="favorite-poster">
      <div class="favorite-info">
          <h3 class="favorite-title">${movie.title}</h3>
          <div class="favorite-rating">
              <i class="fas fa-star"></i>
              <span>${
                movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
              }</span>
          </div>
          <button class="favorite-remove-btn" data-id="${movie.id}">
              <i class="fas fa-trash"></i> Remove from Favorites
          </button>
      </div>
  `;

// Add event listener to remove button
const removeBtn = card.querySelector(".favorite-remove-btn");
removeBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent card click event
  removeFromFavorites(movie.id);
});

// Make card clickable to show details
card.addEventListener("click", () => {
  showMovieDetails(movie.id, movie.type);
});

return card;
}

// Remove movie from favorites
function removeFromFavorites(movieId) {
const index = favoriteMovies.findIndex((fav) => fav.id === movieId);
const movie = favoriteMovies.find((fav) => fav.id === movieId);
if (index !== -1) {
  // Remove from array
  favoriteMovies.splice(index, 1);

  // Update localStorage
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));

  // Update UI
  updateFavoritesCount();
  renderFavorites();

  // Update favorite buttons on movie cards
  updateMovieCardFavoriteButtons(movieId);

  // Show notification
  showNotification("Removed from favorites!");

  addNotification(`${movie.title || movie.name || 'unknown'} was removed from your favorites`);

}
}

// Update favorite buttons on movie cards when a movie is removed from favorites
function updateMovieCardFavoriteButtons(movieId) {
// Find all movie cards with this ID
const movieCards = document.querySelectorAll(
  `.movie-card[data-id="${movieId}"]`
);

movieCards.forEach((card) => {
  const favoriteBtn = card.querySelector(".favorite-btn");
  if (favoriteBtn) {
    favoriteBtn.classList.remove("active");
    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
  }
});
}

// Navbar scroll effect
function handleNavbarScroll() {
if (window.scrollY > 100) {
  navbar.classList.add("scrolled");
} else {
  navbar.classList.remove("scrolled");
}
}

// Setup slider navigation buttons
function setupSliderButtons() {
document.querySelectorAll(".slider-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const sliderId = this.getAttribute("data-slider");
    const slider = document.getElementById(sliderId);
    const scrollAmount = 400;

    if (this.classList.contains("prev")) {
      slider.scrollLeft -= scrollAmount;
    } else {
      slider.scrollLeft += scrollAmount;
    }
  });
});
}

// swiper //
const swiper = new Swiper(".mySwiper", {
loop: true,
autoplay: {
  delay: 4000,
  disableOnInteraction: false,
},
effect: "fade",
fadeEffect: {
  crossFade: true,
},
pagination: {
  el: ".swiper-pagination",
  clickable: true,
},
});

// Fetch popular movies from TMDB API
async function loadPopularMovies() {
try {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
  );
  const data = await response.json();

  // Remove spinner
  const spinnerElement = document.getElementById("popular-movies-spinner");
  if (spinnerElement) {
    // Check if the element exists before trying to remove it
    spinnerElement.remove();
  }
  // Display movies
  displayMovies(data.results, "popular-movies-slider", "movie");
} catch (error) {
  console.error("Error loading popular movies:", error);
  document.getElementById("popular-movies-slider").innerHTML =
    '<p class="text-center">Failed to load movies. Please try again later.</p>';
}
}

// Fetch popular TV series from TMDB API
async function loadPopularSeries() {
try {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`
  );
  const data = await response.json();

  // Remove spinner
  const spinnerElement = document.getElementById("popular-series-spinner");

  if (spinnerElement) {
    // Check if the element exists before trying to remove it
    spinnerElement.remove();
  }
  // Display series
  displayMovies(data.results, "popular-series-slider", "tv");
} catch (error) {
  console.error("Error loading popular series:", error);
  document.getElementById("popular-series-slider").innerHTML =
    '<p class="text-center">Failed to load TV series. Please try again later.</p>';
}
}

// Fetch now playing movies from TMDB API
async function loadNowPlayingMovies() {
try {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`
  );
  const data = await response.json();

  // Remove spinner

  const spinnerElement = document.getElementById("now-playing-spinner");
  if (spinnerElement) {
    // Check if the element exists before trying to remove it
    spinnerElement.remove();
  }
  // Display movies
  displayMovies(data.results, "now-playing-slider", "movie");
} catch (error) {
  console.error("Error loading now playing movies:", error);
  document.getElementById("now-playing-slider").innerHTML =
    '<p class="text-center">Failed to load movies. Please try again later.</p>';
}
}
// load continue playing movies from TMDB API
function loadContinuePlayingMovies() {
const slider = document.getElementById("continue-playing-slider");

// شيل الـ spinner
const spinner = document.getElementById("continue-playing-spinner");
if (spinner) spinner.remove();

slider.innerHTML = "";

if (nowWatching.length === 0) {
  slider.innerHTML = `<p style="color:white; padding:20px;">
          You haven't watched anything yet 👀
      </p>`;
  return;
}

nowWatching.forEach((movie) => {
  const card = createMovieCard(movie, movie.type);
  slider.appendChild(card);
});
}

// add the movie to continue watching when the user click to play the movie
async function addToContinueWatchingFromPlayer(id, type) {
localStorage.setItem("nowWatching", JSON.stringify(nowWatching));
// لو موجود خلاص
if (nowWatching.some((m) => m.id === id)) return;

const endpoint =
  type === "tv"
    ? `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`
    : `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`;

try {
  const res = await fetch(endpoint);
  const movie = await res.json();

  nowWatching.unshift({
    id: movie.id,
    title: movie.title,
    name: movie.name,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    type: type,
  });

  nowWatching = nowWatching.slice(0, 10);
  localStorage.setItem("nowWatching", JSON.stringify(nowWatching));

  // تحديث لحظي
  loadContinuePlayingMovies();
} catch (err) {
  console.error("Continue Watching error:", err);
}
}

// Display movies in a slider
function displayMovies(movies, sliderId, type) {
const slider = document.getElementById(sliderId);

// Limit to 10 movies for performance
const limitedMovies = movies.slice(0, 10);

limitedMovies.forEach((movie) => {
  const movieCard = createMovieCard(movie, type);
  slider.appendChild(movieCard);
});
}

// Create a movie card element
function createMovieCard(movie, type) {
const isFavorite = favoriteMovies.some((fav) => fav.id === movie.id);

const card = document.createElement("div");
card.className = "movie-card";
card.dataset.id = movie.id;
card.dataset.type = type;

// Title (safe for movie + tv + localStorage)
const title = movie.title || movie.name || "Unknown";

// Rating (safe)
const rating =
  typeof movie.vote_average === "number"
    ? movie.vote_average.toFixed(1)
    : "N/A";

// Image (safe)
const imageUrl = movie.poster_path
  ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
  : "https://images.unsplash.com/photo-1536440136628-849c177e76a1";

card.innerHTML = `
      <img src="${imageUrl}" alt="${title}" class="movie-poster">

      <div class="movie-info">
          <h3 class="movie-title">${title}</h3>
          <div class="movie-rating">
              <i class="fas fa-star"></i>
              <span>${rating}</span>
          </div>
      </div>

      <div class="movie-actions">
          <button class="play-btn">
              <i class="fas fa-play"></i> Play Now
          </button>

          <button class="favorite-btn ${isFavorite ? "active" : ""}">
              <i class="fas fa-heart"></i>
              ${isFavorite ? "In Favorites" : "Add to Favorites"}
          </button>
      </div>
  `;

// Elements
const playBtn = card.querySelector(".play-btn");
const favoriteBtn = card.querySelector(".favorite-btn");

// Play
playBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  showMovieDetails(movie.id, type);
});

// Favorite
favoriteBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleFavorite(movie, favoriteBtn, type);
});

// Card click → show details
card.addEventListener("click", () => {
  showMovieDetails(movie.id, type);
});

return card;
}

// Toggle movie as favorite
function toggleFavorite(movie, button, type) {
const index = favoriteMovies.findIndex((fav) => fav.id === movie.id);

if (index === -1) {
  // Add to favorites
  favoriteMovies.push({
    id: movie.id,
    title: type === "tv" ? movie.name : movie.title,
    poster_path: movie.poster_path,
    type: type,
    vote_average: movie.vote_average,
  });
  button.classList.add("active");
  button.innerHTML = '<i class="fas fa-heart"></i> In Favorites';

  // Update favorites count
  updateFavoritesCount();

  // Show notification
  showNotification("Added to favorites!");
  addNotification(`${type === 'tv' ? movie.name : movie.title} was added to you favorites`)
} else {
  // Remove from favorites
  favoriteMovies.splice(index, 1);
  button.classList.remove("active");
  button.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';

  // Update favorites count
  updateFavoritesCount();

  // Show notification
  showNotification("Removed from favorites!");

  // Update favorites modal if it's open
  if (favoritesModal.classList.contains("active")) {
    renderFavorites();
  }
}

// Save to localStorage
localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
}

// Show notification
function showNotification(message) {
// Create notification element
const notification = document.createElement("div");
notification.className = "notification";
notification.textContent = message;
notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, var(--primary-color), #7b2cbf);
      color: white;
      padding: 18px 30px;
      border-radius: 12px;
      z-index: 2000;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(157, 78, 221, 0.3);
      animation: fadeInOut 3s ease;
      border: 1px solid rgba(224, 170, 255, 0.3);
  `;

// Add CSS for animation
const style = document.createElement("style");
style.textContent = `
      @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(100px); }
          10% { opacity: 1; transform: translateX(0); }
          90% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(100px); }
      }
  `;
document.head.appendChild(style);

document.body.appendChild(notification);

// Remove notification after animation
setTimeout(() => {
  notification.remove();
  style.remove();
}, 3000);
}

// Show movie details in modal
async function showMovieDetails(id, type) {
try {
  const endpoint =
    type === "tv"
      ? `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`
      : `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`;

  const response = await fetch(endpoint);
  const data = await response.json();
  document.getElementById('viewAll-modal').classList.remove('active')
  // Title
  document.getElementById("modal-title").textContent =
    type === "tv" ? data.name : data.title;

  // Rating
  document.getElementById("modal-rating").textContent = data.vote_average
    ? data.vote_average.toFixed(1)
    : "N/A";

  // Year
  const releaseDate = type === "tv" ? data.first_air_date : data.release_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  document.getElementById(
    "modal-year"
  ).innerHTML = `<i class="far fa-calendar"></i> ${year}`;

  // Runtime
  const runtime = type === "tv" ? data.episode_run_time?.[0] : data.runtime;

  document.getElementById("modal-runtime").innerHTML = runtime
    ? `<i class="far fa-clock"></i> ${runtime} min`
    : `<i class="far fa-clock"></i> N/A`;

  // Language
  const language = data.original_language
    ? data.original_language.toUpperCase()
    : "N/A";
  document.getElementById(
    "modal-language"
  ).innerHTML = `<i class="fas fa-globe"></i> ${language}`;

  // Description
  document.getElementById("modal-description").textContent =
    data.overview || "No description available.";

  // Backdrop
  const backdropUrl = data.backdrop_path
    ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
    : "https://images.unsplash.com/photo-1536440136628-849c177e76a1";

  const modalBackdrop = document.getElementById("modal-backdrop");
  modalBackdrop.src = backdropUrl;
  modalBackdrop.style.display = "block";

  // Genres
  const genresContainer = document.getElementById("modal-genres");
  genresContainer.innerHTML = "";

  if (data.genres && data.genres.length > 0) {
    data.genres.forEach((genre) => {
      const span = document.createElement("span");
      span.className = "genre-tag";
      span.textContent = genre.name;
      genresContainer.appendChild(span);
    });
  }

  // Play button
  const playBtn = document.getElementById("modal-play-btn");
  playBtn.onclick = () => play_Movies(id, type);

  // Reset iframe
  const iframe = document.getElementById("model_iframe");
  iframe.src = "";
  iframe.style.display = "none";

  document.querySelector(".modal-body").style.display = "block";

  // Show modal
  movieModal.classList.add("active");
} catch (error) {
  console.error("Error loading movie details:", error);
  showNotification("Failed to load movie details.");
}
}

// Event Listener  View All
document.querySelectorAll(".view-all").forEach((btn) => {
btn.addEventListener("click", (e) => {
  e.preventDefault();

  const type = btn.dataset.type;
  const category = btn.dataset.category;

  openViewAllModal(type, category);
});
});

// open View All Modal
async function openViewAllModal(type, category) {
const modal = document.getElementById("viewAll-modal");
const content = document.getElementById("viewAll-content");
const title = document.getElementById("viewAll-title");

content.innerHTML = "";

if (type === "movie" && category === "popular")
  title.textContent = "All Popular Movies";

if (type === "tv" && category === "popular")
  title.textContent = "All Popular TV Series";

if (category === "now_playing") title.textContent = "Now Playing Movies";

if (type === "continue") {
  title.textContent = "Continue Watching";
  nowWatching.forEach((item) => {
    content.appendChild(createMovieCard(item, item.type));
  });
  modal.classList.add("active");
  return;
}

// API Endpoint
let endpoint = "";

if (type === "movie" && category === "popular") endpoint = "movie/popular";

if (type === "movie" && category === "now_playing")
  endpoint = "movie/now_playing";

if (type === "tv") endpoint = "tv/popular";

try {
  const res = await fetch(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=en-US&page=1`
  );
  const data = await res.json();

  data.results.forEach((item) => {
    content.appendChild(createMovieCard(item, type));
  });

  modal.classList.add("active");
} catch (err) {
  console.error(err);
}
}

document.getElementById("viewAll-close").addEventListener("click", () => {
document.getElementById("viewAll-modal").classList.remove("active");
});

// Play movie / tv trailer
async function play_Movies(id, type) {
  // Require sign-in
  if (!auth.currentUser) {
    // Hide movie modal and clear iframe when prompting to sign in
    try {
      if (movieModal && movieModal.classList.contains('active')) {
        movieModal.classList.remove('active');
      }
      const iframeEl = document.getElementById('model_iframe');
      if (iframeEl) {
        iframeEl.style.display = 'none';
        iframeEl.src = '';
      }
    } catch (e) {
      console.warn('Error hiding movie modal:', e);
    }

    Swal.fire({
      title: 'Sign in required',
      text: 'You must sign in to watch movies. Sign in now?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sign in',
      cancelButtonText: 'Cancel',
      customClass : {
        confirmButton : 'swal-confirm',
        cancelButton : 'swal-confirm',
        popup : 'rounded-swal',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        loginModal.classList.add('active');
        signupModel.classList.remove('active');
      }
    });
    return;
  }
try {
    // Enforce subscription quotas per month
    try {
      const info = getPlanForCurrentUser();
      const limits = { free: 4, pro: 10, premium: Infinity };
      const limit = limits[info.plan] ?? 4;

      if (info.moviesWatchedThisMonth >= limit) {
        // Hide movie modal and reset iframe so details disappear when alert shows
        try {
          if (movieModal && movieModal.classList.contains('active')) {
            movieModal.classList.remove('active');
          }
          const iframeEl = document.getElementById('model_iframe');
          if (iframeEl) {
            iframeEl.style.display = 'none';
            iframeEl.src = '';
          }
          const modalBackdropEl = document.getElementById('modal-backdrop');
          if (modalBackdropEl) modalBackdropEl.style.display = 'none';
        } catch (hideErr) {
          console.warn('Could not hide modal before limit alert:', hideErr);
        }

        Swal.fire({
          title: 'Monthly limit reached',
          text: `Your ${info.plan} plan allows ${limit === Infinity ? 'unlimited' : limit} movies per month. ${info.plan !== 'premium' ? 'Consider upgrading for more.' : ''}`,
          icon: 'warning',
          confirmButtonText: 'View Plans',
          customClass: { popup: 'rounded-swal', confirmButton: 'swal-confirm' }
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('View Plans clicked — attempting to scroll to plans section');
            // Wait briefly for Swal to finish its close animation (and restore body scroll)
            setTimeout(() => {
              try {
                // Try setting hash (anchor) first
                location.hash = '#planssection';
              } catch (e) {
                console.warn('Could not set location.hash', e);
              }

              scrollToPlans();

              // Gentle correction: after a short delay, smooth-correct if still off
              setTimeout(() => {
                const target = document.querySelector('#planssection') || document.querySelector('.plans-wrapper');
                if (!target) return;
                const targetTop = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - 80);
                if (Math.abs(window.pageYOffset - targetTop) > 120) {
                  console.warn('scrollToPlans: applying smooth correction to target');
                  window.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
              }, 900);
            }, 420);
          }
        });
        return;
      }

      // Allowed → increment usage now
      incrementMovieCount();
      const remaining = remainingMoviesForUser();
      if (remaining !== Infinity) showNotification(`You have ${remaining} movie${remaining === 1 ? '' : 's'} left this month.`);
    } catch (err) {
      console.warn('Plan enforcement error:', err);
    }

  let type_Movies;

  if (type === "tv") {
    type_Movies = `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}&language=en-US`;
  } else {
    type_Movies = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`;
  }

  let result = await fetch(type_Movies);
  let data_res = await result.json();

  let find_Vid = data_res.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  if (!find_Vid) {
    showNotification("The video is not available 😢");
    return;
  }

  let modal_Backdrop = document.getElementById("modal-backdrop");
  modal_Backdrop.style.display = "none";

  let modal_Body = document.querySelector(".modal-body");
  modal_Body.style.display = "none";

  let iframe = document.getElementById("model_iframe");
  iframe.src = `https://www.youtube.com/embed/${find_Vid.key}?autoplay=1`;
  iframe.style.display = "block";
  
  addToContinueWatchingFromPlayer(id, type);
} catch (error) {
  alert("An error occurred while playing the video");
  console.error(error);
}
}

//  Close Modal

const closeBtn = document.getElementById("movie-modal-close");

closeBtn.addEventListener("click", () => {
const iframe = document.getElementById("model_iframe");
// إخفاء iframe 
iframe.style.display = "none";
iframe.src = ""; 
movieModal.classList.remove("active");
});

///////// Search Movies ////////////

// Search functionality

let searchTimeout;

searchInput.addEventListener("input", () => {
const query = searchInput.value.trim();

clearTimeout(searchTimeout);

if (!query) {
  reloadHomeMovies();
  return;
}

searchTimeout = setTimeout(() => {
  searchMoviesAndSeriesLive(query);
}, 400);
});

function reloadHomeMovies() {
// إخفاء البحث
document.getElementById("search-section").classList.remove("active");

// إظهار الأقسام العادية
document.getElementById("movies-section").classList.remove("nonActive");
document.getElementById("series-section").classList.remove("nonActive");
document.getElementById("popular-section").classList.remove("nonActive");

// إعادة تحميل البيانات
document.getElementById("popular-movies-slider").innerHTML = "";
document.getElementById("popular-series-slider").innerHTML = "";
document.getElementById("now-playing-slider").innerHTML = "";

loadPopularMovies();
loadPopularSeries();
loadNowPlayingMovies();
}

async function searchMoviesAndSeriesLive(query) {
try {
  const [movieData, tvData] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&language=en-US`
    ).then((res) => res.json()),

    fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&language=en-US`
    ).then((res) => res.json()),
  ]);

  const allResults = [
    ...(movieData.results || []).map((m) => ({ ...m, type: "movie" })),
    ...(tvData.results || []).map((t) => ({ ...t, type: "tv" })),
  ];

  // إخفاء الأقسام العادية
  document.getElementById("movies-section").classList.add("nonActive");
  document.getElementById("series-section").classList.add("nonActive");
  document.getElementById("popular-section").classList.add("nonActive");

  // إظهار البحث
  const searchSection = document.getElementById("search-section");
  const searchSlider = document.getElementById("search-slider");

  searchSection.classList.add("active");
  searchSlider.innerHTML = "";

  if (allResults.length === 0) {
    searchSlider.innerHTML = `<p style="color:white;padding:20px">No results for "${query}"</p>`;
    return;
  }

  allResults.forEach((item) => {
    const card = createMovieCard(item, item.type);
    searchSlider.appendChild(card);
  });
} catch (error) {
  console.error("Search error:", error);
}
}

// scroll To Top
const scrollBtn = document.getElementById("scrollToTop");

// إظهار السهم عند النزول لآخر الصفحة
window.addEventListener("scroll", () => {
  if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 100) {
      scrollBtn.style.display = "flex";
  } else {
      scrollBtn.style.display = "none";
  }
});

// عند الضغط يرجع لأول الصفحة ويختفي
scrollBtn.addEventListener("click", () => {
  window.scrollTo({
      top: 0,
      behavior: "smooth"
  });
  scrollBtn.style.display = "none";
});


// Underline nav
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let currentSection = "";

  sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // ارتفاع الناف
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop &&
          window.scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute("id");
      }
  });

  navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
          link.classList.add("active");
      }
  });
});








// Scroll to top button functionality
const scrollToTopBtn = document.getElementById('scrollToTop');
if (scrollToTopBtn) {
  window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
          scrollToTopBtn.style.display = 'flex';
      } else {
          scrollToTopBtn.style.display = 'none';
      }
  });

  scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
          top: 0,
          behavior: 'smooth'
      });
  });
}



const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

menuToggle.addEventListener("click", () => {
  mobileNav.classList.toggle("active");
});

/* تسكير المنيو لما نضغط رابط */
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("active");
  });
});

const mobileLogout = document.getElementById("mobileLogout");
if (mobileLogout) {
  mobileLogout.addEventListener("click", () => {
    document.getElementById("logout").click();
  });
}

// Mobile buttons connect to original actions
document.getElementById("mobileNotifications").onclick = () =>
  document.getElementById("notifications-icon").click();

document.getElementById("mobileFavorites").onclick = () =>
  document.getElementById("favorites-icon").click();

document.getElementById("mobileAccount").onclick = () =>
  document.getElementById("user-icon").click();

document.getElementById("mobileLogout").onclick = () =>
  document.getElementById("logout").click();



const menuToggle2 = document.querySelector(".menu-toggle");
const mobileNav2 = document.querySelector(".mobile-nav");
const closeMenu = document.querySelector(".close-menu");

menuToggle2.addEventListener("click", () => {
  mobileNav2.classList.add("active");
});

closeMenu.addEventListener("click", () => {
  mobileNav2.classList.remove("active");
});

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    removeTyping();
    addMessage(data.reply, "bot");

  } catch (error) {
    removeTyping();
    addMessage("Something went wrong. Try again 🎬", "bot");
  }
}


function addMessage(text, sender, save = true) {
  const div = document.createElement("div");
  div.classList.add("message", sender);
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  if (save) saveMessage(text, sender);
}



function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot");
  typingDiv.id = "typing";

  typingDiv.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}


const chatToggle = document.getElementById("chat-toggle");
const chatContainer = document.getElementById("chat-container");
const chatClose = document.getElementById("chat-close");
const chatClear = document.getElementById("chat-clear");

chatToggle.addEventListener("click", () => {
  chatContainer.style.display = "flex";
  chatToggle.style.display = "none";
});

chatClose.addEventListener("click", () => {
  chatContainer.style.display = "none";
  chatToggle.style.display = "flex";
});

chatClear.addEventListener("click", () => {
  // Clear all messages and typing indicator
  removeTyping();
  input.focus();
  clearChat()
  
});

const CHAT_KEY = "movie_chat_history";

function saveMessage(text, sender) {
  const history = JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
  history.push({ text, sender });
  localStorage.setItem(CHAT_KEY, JSON.stringify(history));
}

function loadMessages() {
  const history = JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
  history.forEach(msg => addMessage(msg.text, msg.sender, false));
}
window.addEventListener("load", loadMessages);

function clearChat() {
  localStorage.removeItem(CHAT_KEY);
  messages.innerHTML = "";
}


// plans cards

const modal = document.getElementById("paymentModal");
const alertBox = document.getElementById("successAlert");

const email = document.getElementById("userEmail");
const card = document.getElementById("cardNumber");
const amount = document.getElementById("totalAmount");

const payBtn = document.getElementById("confirmPayBtn");

/* ===== MAKE FUNCTIONS GLOBAL ===== */
let selectedPlan = null; // 'free' | 'pro' | 'premium'

window.openModal = function(price){
  // try to infer plan from the selected card if not set
  if (!selectedPlan) {
    if (price === 29) selectedPlan = 'pro';
    else if (price === 49) selectedPlan = 'premium';
  }
  if (typeof amount !== 'undefined' && amount) amount.value = price + " $";
  if (modal) modal.style.display = "flex"; else console.warn('paymentModal element not found');
};

window.closeModal = function(){
  modal.style.display = "none";
};

window.closeAlert = function(){
  alertBox.style.display = "none";
};

window.freeAlert = function(){
  try {
    const info = getPlanForCurrentUser();
    const freeLimit = 4;

    // If user is already on Free plan
    if (info.plan === 'free') {
      if (info.moviesWatchedThisMonth >= freeLimit) {
        // They've already used their free allowance — don't reset counters, encourage upgrade
        Swal.fire({
          title: 'Free limit reached',
          text: `You've already watched ${info.moviesWatchedThisMonth} movies this month on the Free plan (limit ${freeLimit}). Consider upgrading for more.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'View Plans',
          cancelButtonText: 'Cancel',
          customClass: { popup: 'rounded-swal', confirmButton: 'swal-confirm', cancelButton: 'swal-confirm' }
        }).then((res) => {
          if (res.isConfirmed) scrollToPlans();
        });
      } else {
        const remaining = Math.max(0, freeLimit - info.moviesWatchedThisMonth);
        Swal.fire({
          title: 'Free Plan Active',
          text: `You're already on the Free plan. You have ${remaining} movie${remaining === 1 ? '' : 's'} left this month.`,
          icon: 'info',
          customClass: { popup: 'rounded-swal', confirmButton: 'swal-confirm' }
        });
      }

      return;
    }

    // If not currently free, assign free plan (resets counters)
    setPlanForCurrentUser('free');
    updatePlanBadge();
    Swal.fire({ title: 'Free Plan Activated', text: 'You are now on the Free plan (4 movies / month).', icon: 'success', customClass: { popup: 'rounded-swal', confirmButton: 'swal-confirm' } });
  } catch (e) {
    console.warn('Could not set free plan:', e);
    Swal.fire({ title: 'Error', text: 'Could not activate Free plan. Try again.', icon: 'error' });
  }
};

/* ===== EVENTS ===== */
// When the user confirms payment, assign the selected plan (simulated)
if (payBtn) {
  payBtn.addEventListener("click", () => {
    // Try to infer plan from amount if the selectedPlan wasn't set
    if (!selectedPlan) {
      const val = amount.value || '';
      if (val.includes('29')) selectedPlan = 'pro';
      if (val.includes('49')) selectedPlan = 'premium';
    }

    if (selectedPlan) {
      setPlanForCurrentUser(selectedPlan);
      updatePlanBadge();
      closeModal();
      // Show only one alert (SweetAlert) to avoid duplicates
      Swal.fire({ title: `Subscribed to ${selectedPlan}`, text: `Your ${selectedPlan} plan is active.`, icon: 'success' });
      selectedPlan = null;
    } else {
      closeModal();
      Swal.fire({ title: 'No plan selected', text: 'Please choose a plan before confirming payment.', icon: 'info' });
    }
  });
} else {
  console.warn('payBtn not found - payment confirmation listener not attached');
}

// Hook up quick selection so buttons set the pending plan (no change to HTML required)
document.querySelectorAll('.plan-card').forEach(card => {
  const btn = card.querySelector('.plan-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (card.classList.contains('plan-free')) selectedPlan = 'free';
    else if (card.classList.contains('plan-six-months')) selectedPlan = 'pro';
    else if (card.classList.contains('plan-premium')) selectedPlan = 'premium';
  });
});

email.addEventListener("input", validate);

card.addEventListener("input", () => {
  card.value = card.value
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
  validate();
});

function validate(){
  const emailOk =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

  const cardOk =
    card.value.replace(/\s/g, "").length >= 12;

  payBtn.disabled = !(emailOk && cardOk);
}