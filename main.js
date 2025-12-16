
// API Configuration
const apiKey = '38d4fc734b633813b0de7e5758379d2a';

// DOM Elements
const navbar = document.querySelector('.navbar');
const loginIcon = document.getElementById('login-icon');
const favoritesIcon = document.getElementById('favorites-icon');
const loginModal = document.getElementById('login-modal');
const movieModal = document.getElementById('movie-modal');
const favoritesModal = document.getElementById('favorites-modal');
const loginModalClose = document.getElementById('login-modal-close');
const movieModalClose = document.getElementById('movie-modal-close');
const favoritesModalClose = document.getElementById('favorites-modal-close');
const signupBtn = document.getElementById('signup-btn');
const searchInput = document.querySelector('.search-input');
const faqItems = document.querySelectorAll('.faq-item');
const browseMoviesBtn = document.getElementById('browse-movies-btn');
const favoritesCountElement = document.getElementById('favorites-count');
const favoritesCountText = document.getElementById('favorites-count-text');
const favoritesBody = document.getElementById('favorites-body');
const favoritesEmpty = document.getElementById('favorites-empty');
const loginBtnNavigation = document.getElementById('login-btn')
const signupModel = document.getElementById('signUpModel')
const signupModelClose = document.getElementById('signUp-modal-close')

// Global variables
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
let nowWatching  = JSON.parse(localStorage.getItem('nowWatching')) || []
let users = JSON.parse(localStorage.getItem('users')) || [];
let user = JSON.parse(localStorage.getItem('currentUser')) || false;


// Update login icon based on user status
if (user) {
    loginIcon.classList.add('fa-user-check');
    loginIcon.classList.remove('fa-user');
}
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Update favorites count
    updateFavoritesCount();
    
    // Load movies data
    loadPopularMovies();
    loadPopularSeries();
    loadNowPlayingMovies();
    loadContinuePlayingMovies(); 

    // Setup event listeners
    setupEventListeners();
    
    // Setup FAQ accordion - Netflix Style
    setupNetflixFAQAccordion();
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
});

// Setup all event listeners
function setupEventListeners() {
    // Login icon click
    loginIcon.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
    
    // Favorites icon click
    favoritesIcon.addEventListener('click', (e) => {
        e.stopPropagation(); 
        showFavoritesModal();
    });
    
    // Modal close buttons
    loginModalClose.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
    
    signupModelClose.addEventListener('click', () => {
        signupModel.classList.remove('active')
    })

    movieModalClose.addEventListener('click', () => {
        movieModal.classList.remove('active');
    });
    
    favoritesModalClose.addEventListener('click', () => {
        favoritesModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    [loginModal, movieModal, favoritesModal , signupModel].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Sign up button
    signupBtn.addEventListener('click', () => {
            loginModal.classList.remove('active');
            signupModel.classList.add('active')
    });
    loginBtnNavigation.addEventListener('click', () => {
            loginModal.classList.add('active');
            signupModel.classList.remove('active')
    })

    // Browse movies button in favorites modal
    browseMoviesBtn.addEventListener('click', () => {
        favoritesModal.classList.remove('active');
        // Scroll to movies section
        document.querySelector('#movies-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Login form submission
    document.querySelector('.login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulate login process
        let userExists = users.find(user => user.email === email && user.password === password)
        if (email && password) {
            if (userExists){
                localStorage.setItem('currentUser', JSON.stringify(userExists))
                loginModal.classList.remove('active');
                loginIcon.classList.add('fa-user-check');
                loginIcon.classList.remove('fa-user');
            }
            else {
                loginModal.classList.remove('active')
                Swal.fire({
                    text: "Email Doesn't Exist",
                    background: "#9d4edd",
                    icon : 'error',
                    color: '#fff',
                    customClass: {
                        popup: 'rounded-swal',
                        confirmButton: 'swal-confirm',
                    },
                });
            }
        }else{
            showNotification('Please Fill All Fields')
        }
    });
    // signUp form submission 
    document.querySelector('.signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('emailSign').value;
        const password = document.getElementById('passwordSign').value;
        
        // Simulate login process
        if (email && password && name) {
            const user = {
                name : name,
                email : email,
                password : password,
            }
            let userExists = users.find(user => user.email === email && user.password === password)
            if (userExists){
                Swal.fire({
                    text: 'Email Already Exists',
                    background: "#9d4edd",
                    icon : 'error',
                    color: '#fff',
                    customClass: {
                        popup: 'rounded-swal',
                        confirmButton: 'swal-confirm',
                    },
                });
                signupModel.classList.remove('active')
            }
            else {
                localStorage.setItem('currentUser', JSON.stringify(user)); // Stringify here
                users.push(user)
                localStorage.setItem('users', JSON.stringify(users))
                Swal.fire({
                    title: 'Hello!',
                    text: 'Signed Up Sucesss',
                    background: "#9d4edd",
                    icon : 'success',
                    color: '#fff',
                    customClass: {
                        popup: 'rounded-swal',
                        confirmButton: 'swal-confirm',
                    },
                });
                signupModel.classList.remove('active');
                loginIcon.classList.add('fa-user-check');
                loginIcon.classList.remove('fa-user');

            }
        }else{
            showNotification('Please Fill All Fields')
        }
    });


    // Search input functionality
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                alert(`Search functionality would show results for: "${query}"`);
                this.value = '';
            }
        }
    });
    
    // Setup slider buttons
    setupSliderButtons();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active class
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Notification icon click
    document.getElementById('notifications-icon').addEventListener('click', function() {
        alert('You have 3 new notifications:\n1. New season of "Stranger Things" added\n2. "The Batman" now available\n3. Weekly recommendations ready');
    });
}

// Setup Netflix-Style FAQ Accordion
function setupNetflixFAQAccordion() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = 0;
                    otherAnswer.style.opacity = 0;
                    otherAnswer.style.padding = '0 30px';
                }
            });
            
            // Toggle current item
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                answer.style.maxHeight = 0;
                answer.style.opacity = 0;
                answer.style.padding = '0 30px';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = 1;
                answer.style.padding = '30px';
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
        favoritesCountElement.style.display = 'none';
    } else {
        favoritesCountElement.style.display = 'flex';
    }
}

// Show favorites modal
function showFavoritesModal() {
    favoritesModal.classList.add('active');
    renderFavorites();
}

// Render favorites in the modal
function renderFavorites() {
    // Update count text
    const count = favoriteMovies.length;
    favoritesCountText.textContent = `You have ${count} favorite ${count === 1 ? 'movie' : 'movies'}`;
    
    // Clear current content
    favoritesBody.innerHTML = '';
    
    if (count === 0) {
        // Show empty state
        favoritesBody.appendChild(favoritesEmpty.cloneNode(true));
        // Re-add event listener to browse movies button
        favoritesBody.querySelector('#browse-movies-btn').addEventListener('click', () => {
            favoritesModal.classList.remove('active');
            document.querySelector('#movies-section').scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        // Create favorites grid
        const favoritesGrid = document.createElement('div');
        favoritesGrid.className = 'favorites-grid';
        
        // Add each favorite movie
        favoriteMovies.forEach(movie => {
            const favoriteCard = createFavoriteCard(movie);
            favoritesGrid.appendChild(favoriteCard);
        });
        
        favoritesBody.appendChild(favoritesGrid);
    }
}

// Create a favorite card element
function createFavoriteCard(movie) {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    card.dataset.id = movie.id;
    card.dataset.type = movie.type;
    
    const imageUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${movie.title}" class="favorite-poster">
        <div class="favorite-info">
            <h3 class="favorite-title">${movie.title}</h3>
            <div class="favorite-rating">
                <i class="fas fa-star"></i>
                <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
            <button class="favorite-remove-btn" data-id="${movie.id}">
                <i class="fas fa-trash"></i> Remove from Favorites
            </button>
        </div>
    `;
    
    // Add event listener to remove button
    const removeBtn = card.querySelector('.favorite-remove-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        removeFromFavorites(movie.id);
    });
    
    // Make card clickable to show details
    card.addEventListener('click', () => {
        showMovieDetails(movie.id, movie.type);
    });
    
    return card;
}

// Remove movie from favorites
function removeFromFavorites(movieId) {
    const index = favoriteMovies.findIndex(fav => fav.id === movieId);
    
    if (index !== -1) {
        // Remove from array
        favoriteMovies.splice(index, 1);
        
        // Update localStorage
        localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
        
        // Update UI
        updateFavoritesCount();
        renderFavorites();
        
        // Update favorite buttons on movie cards
        updateMovieCardFavoriteButtons(movieId);
        
        // Show notification
        showNotification('Removed from favorites!');
    }
}

// Update favorite buttons on movie cards when a movie is removed from favorites
function updateMovieCardFavoriteButtons(movieId) {
    // Find all movie cards with this ID
    const movieCards = document.querySelectorAll(`.movie-card[data-id="${movieId}"]`);
    
    movieCards.forEach(card => {
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
        }
    });
}

// Navbar scroll effect
function handleNavbarScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Setup slider navigation buttons
function setupSliderButtons() {
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sliderId = this.getAttribute('data-slider');
            const slider = document.getElementById(sliderId);
            const scrollAmount = 400;
            
            if (this.classList.contains('prev')) {
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
    crossFade: true
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

// Fetch popular movies from TMDB API
async function loadPopularMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        
        // Remove spinner
        const spinnerElement = document.getElementById('popular-movies-spinner');
        if (spinnerElement) { // Check if the element exists before trying to remove it
            spinnerElement.remove();
        }        
        // Display movies
        displayMovies(data.results, 'popular-movies-slider', 'movie');
    } catch (error) {
        console.error('Error loading popular movies:', error);
        document.getElementById('popular-movies-slider').innerHTML = '<p class="text-center">Failed to load movies. Please try again later.</p>';
    }
}

// Fetch popular TV series from TMDB API
async function loadPopularSeries() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        
        // Remove spinner
        const spinnerElement = document.getElementById('popular-series-spinner');

        if (spinnerElement) { // Check if the element exists before trying to remove it
            spinnerElement.remove();
        }
        // Display series
        displayMovies(data.results, 'popular-series-slider', 'tv');
    } catch (error) {
        console.error('Error loading popular series:', error);
        document.getElementById('popular-series-slider').innerHTML = '<p class="text-center">Failed to load TV series. Please try again later.</p>';
    }
}

// Fetch now playing movies from TMDB API
async function loadNowPlayingMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        
        // Remove spinner
        
        const spinnerElement = document.getElementById('now-playing-spinner');
        if (spinnerElement) { // Check if the element exists before trying to remove it
            spinnerElement.remove();
        }       
        // Display movies
        displayMovies(data.results, 'now-playing-slider', 'movie');
    } catch (error) {
        console.error('Error loading now playing movies:', error);
        document.getElementById('now-playing-slider').innerHTML = '<p class="text-center">Failed to load movies. Please try again later.</p>';
    }
}
// load continue playing movies from TMDB API
function loadContinuePlayingMovies() {
    const slider = document.getElementById('continue-playing-slider');

    // شيل الـ spinner
    const spinner = document.getElementById('continue-playing-spinner');
    if (spinner) spinner.remove();

    slider.innerHTML = '';

    if (nowWatching.length === 0) {
        slider.innerHTML = `<p style="color:white; padding:20px;">
            You haven't watched anything yet 👀
        </p>`;
        return;
    }

    nowWatching.forEach(movie => {
        const card = createMovieCard(movie, movie.type);
        slider.appendChild(card);
    });
}

// add the movie to continue watching when the user click to play the movie
async function addToContinueWatchingFromPlayer(id, type) {
    localStorage.setItem('nowWatching', JSON.stringify(nowWatching));
    // لو موجود خلاص
    if (nowWatching.some(m => m.id === id)) return;

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
            type: type
        });

        nowWatching = nowWatching.slice(0, 10);
        localStorage.setItem('nowWatching', JSON.stringify(nowWatching));

        // تحديث لحظي
        loadContinuePlayingMovies();

    } catch (err) {
        console.error('Continue Watching error:', err);
    }
}



// Display movies in a slider
function displayMovies(movies, sliderId, type) {
    const slider = document.getElementById(sliderId);
    
    // Limit to 10 movies for performance
    const limitedMovies = movies.slice(0, 10);
    
    limitedMovies.forEach(movie => {
        const movieCard = createMovieCard(movie, type);
        slider.appendChild(movieCard);
    });
}

// Create a movie card element
function createMovieCard(movie, type) {
    const isFavorite = favoriteMovies.some(fav => fav.id === movie.id);

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = movie.id;
    card.dataset.type = type;

    // Title (safe for movie + tv + localStorage)
    const title = movie.title || movie.name || 'Unknown';

    // Rating (safe)
    const rating =
        typeof movie.vote_average === 'number'
            ? movie.vote_average.toFixed(1)
            : 'N/A';

    // Image (safe)
    const imageUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1';

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

            <button class="favorite-btn ${isFavorite ? 'active' : ''}">
                <i class="fas fa-heart"></i>
                ${isFavorite ? 'In Favorites' : 'Add to Favorites'}
            </button>
        </div>
    `;

    // Elements
    const playBtn = card.querySelector('.play-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');

    // Play
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showMovieDetails(movie.id, type);
    });

    // Favorite
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(movie, favoriteBtn, type);
    });

    // Card click → show details
    card.addEventListener('click', () => {
        showMovieDetails(movie.id, type);
    });

    return card;
}

// Toggle movie as favorite
function toggleFavorite(movie, button, type) {
    const index = favoriteMovies.findIndex(fav => fav.id === movie.id);
    
    if (index === -1) {
        // Add to favorites
        favoriteMovies.push({
            id: movie.id,
            title: type === 'tv' ? movie.name : movie.title,
            poster_path: movie.poster_path,
            type: type,
            vote_average: movie.vote_average
        });
        button.classList.add('active');
        button.innerHTML = '<i class="fas fa-heart"></i> In Favorites';
        
        // Update favorites count
        updateFavoritesCount();
        
        // Show notification
        showNotification('Added to favorites!');
    } else {
        // Remove from favorites
        favoriteMovies.splice(index, 1);
        button.classList.remove('active');
        button.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
        
        // Update favorites count
        updateFavoritesCount();
        
        // Show notification
        showNotification('Removed from favorites!');
        
        // Update favorites modal if it's open
        if (favoritesModal.classList.contains('active')) {
            renderFavorites();
        }
    }
    
    // Save to localStorage
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
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
    const style = document.createElement('style');
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

    // Title
    document.getElementById("modal-title").textContent =
      type === "tv" ? data.name : data.title;

    // Rating
    document.getElementById("modal-rating").textContent =
      data.vote_average ? data.vote_average.toFixed(1) : "N/A";

    // Year
    const releaseDate = type === "tv" ? data.first_air_date : data.release_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
    document.getElementById("modal-year").innerHTML =
      `<i class="far fa-calendar"></i> ${year}`;

    // Runtime
    const runtime = type === "tv"
      ? data.episode_run_time?.[0]
      : data.runtime;

    document.getElementById("modal-runtime").innerHTML = runtime
      ? `<i class="far fa-clock"></i> ${runtime} min`
      : `<i class="far fa-clock"></i> N/A`;

    // Language
    const language = data.original_language
      ? data.original_language.toUpperCase()
      : "N/A";
    document.getElementById("modal-language").innerHTML =
      `<i class="fas fa-globe"></i> ${language}`;

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
    playBtn.onclick = () => play_Movies(id, type)


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

// Play movie / tv trailer
async function play_Movies(id, type) {
  try {
    let type_Movies;

    if (type === "tv") {
      type_Movies = `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${apiKey}&language=en-US`
    } else {
      type_Movies = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`
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
};

//  Close Modal

const closeBtn = document.getElementById("movie-modal-close");

closeBtn.addEventListener("click", () => {
  const iframe = document.getElementById("model_iframe");
    // إخفاء iframe بدل تفريغ الـ src
  iframe.style.display = "none";
  iframe.src = ""; // ⛔ إيقاف الفيديو
  movieModal.classList.remove("active");
});


///////// Search Movies ////////////

// Search functionality

let searchTimeout;

searchInput.addEventListener('input', () => {
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
    document.getElementById('search-section').classList.remove('active');

    // إظهار الأقسام العادية
    document.getElementById('movies-section').classList.remove('nonActive');
    document.getElementById('series-section').classList.remove('nonActive');
    document.getElementById('popular-section').classList.remove('nonActive');

    // إعادة تحميل البيانات
    document.getElementById('popular-movies-slider').innerHTML = '';
    document.getElementById('popular-series-slider').innerHTML = '';
    document.getElementById('now-playing-slider').innerHTML = '';

    loadPopularMovies();
    loadPopularSeries();
    loadNowPlayingMovies();
}


async function searchMoviesAndSeriesLive(query) {
    try {
        const [movieData, tvData] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`)
                .then(res => res.json()),

            fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US`)
                .then(res => res.json())
        ]);

        const allResults = [
            ...(movieData.results || []).map(m => ({ ...m, type: 'movie' })),
            ...(tvData.results || []).map(t => ({ ...t, type: 'tv' }))
        ];

        // إخفاء الأقسام العادية
        document.getElementById('movies-section').classList.add('nonActive');
        document.getElementById('series-section').classList.add('nonActive');
        document.getElementById('popular-section').classList.add('nonActive');

        // إظهار البحث
        const searchSection = document.getElementById('search-section');
        const searchSlider = document.getElementById('search-slider');

        searchSection.classList.add('active');
        searchSlider.innerHTML = '';

        if (allResults.length === 0) {
            searchSlider.innerHTML =
                `<p style="color:white;padding:20px">No results for "${query}"</p>`;
            return;
        }

        allResults.forEach(item => {
            const card = createMovieCard(item, item.type);
            searchSlider.appendChild(card);
        });

    } catch (error) {
        console.error('Search error:', error);
    }
}

