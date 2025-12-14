
// API Configuration
const apiKey = '38d4fc734b633813b0de7e5758379d2a';

// DOM Elements
const navbar = document.querySelector('.navbar');
const loginIcon = document.getElementById('login-icon');
const loginModal = document.getElementById('login-modal');
const movieModal = document.getElementById('movie-modal');
const loginModalClose = document.getElementById('login-modal-close');
const movieModalClose = document.getElementById('movie-modal-close');
const signupBtn = document.getElementById('signup-btn');
const searchInput = document.querySelector('.search-input');
const faqItems = document.querySelectorAll('.faq-item');

// Global variables
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load movies data
    loadPopularMovies();
    loadPopularSeries();
    loadNowPlayingMovies();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup FAQ accordion
    setupFAQAccordion();
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
});

// Setup all event listeners
function setupEventListeners() {
    // Login icon click
    loginIcon.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
    
    // Modal close buttons
    loginModalClose.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
    
    movieModalClose.addEventListener('click', () => {
        movieModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    [loginModal, movieModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Sign up button
    signupBtn.addEventListener('click', () => {
        alert('Sign up functionality would be implemented here!');
        loginModal.classList.remove('active');
    });
    
    // Login form submission
    document.querySelector('.login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulate login process
        if (email && password) {
            alert(`Welcome back! You're now logged in as ${email}`);
            loginModal.classList.remove('active');
            loginIcon.classList.add('fa-user-check');
            loginIcon.classList.remove('fa-user');
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

// Setup FAQ accordion functionality
function setupFAQAccordion() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
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

// Fetch popular movies from TMDB API
async function loadPopularMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
        const data = await response.json();
        
        // Remove spinner
        document.getElementById('popular-movies-spinner').remove();
        
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
        document.getElementById('popular-series-spinner').remove();
        
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
        document.getElementById('now-playing-spinner').remove();
        
        // Display movies
        displayMovies(data.results, 'now-playing-slider', 'movie');
    } catch (error) {
        console.error('Error loading now playing movies:', error);
        document.getElementById('now-playing-slider').innerHTML = '<p class="text-center">Failed to load movies. Please try again later.</p>';
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
    
    // Determine title based on type (movie or tv)
    const title = type === 'tv' ? movie.name : movie.title;
    const releaseDate = type === 'tv' ? movie.first_air_date : movie.release_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    
    // Use higher resolution image for better quality
    const imageUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-rating">
                <i class="fas fa-star"></i>
                <span>${movie.vote_average.toFixed(1)}</span>
            </div>
        </div>
        <div class="movie-actions">
            <button class="play-btn" data-id="${movie.id}" data-type="${type}">
                <i class="fas fa-play"></i> Play Now
            </button>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${movie.id}">
                <i class="fas fa-heart"></i> ${isFavorite ? 'In Favorites' : 'Add to Favorites'}
            </button>
        </div>
    `;
    
    // Add event listeners to buttons
    const playBtn = card.querySelector('.play-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');
    
    playBtn.addEventListener('click', () => showMovieDetails(movie.id, type));
    favoriteBtn.addEventListener('click', () => toggleFavorite(movie, favoriteBtn, type));
    
    // Make the entire card clickable to show details
    card.addEventListener('click', (e) => {
        if (!playBtn.contains(e.target) && !favoriteBtn.contains(e.target)) {
            showMovieDetails(movie.id, type);
        }
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
        
        // Show notification
        showNotification('Added to favorites!');
    } else {
        // Remove from favorites
        favoriteMovies.splice(index, 1);
        button.classList.remove('active');
        button.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
        
        // Show notification
        showNotification('Removed from favorites!');
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
        const endpoint = type === 'tv' 
            ? `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`
            : `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        // Update modal content
        document.getElementById('modal-title').textContent = type === 'tv' ? data.name : data.title;
        document.getElementById('modal-rating').textContent = data.vote_average.toFixed(1);
        
        // Set year
        const releaseDate = type === 'tv' ? data.first_air_date : data.release_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        document.getElementById('modal-year').innerHTML = `<i class="far fa-calendar"></i> ${year}`;
        
        // Set runtime
        const runtime = type === 'tv' ? data.episode_run_time?.[0] : data.runtime;
        document.getElementById('modal-runtime').innerHTML = runtime 
            ? `<i class="far fa-clock"></i> ${runtime} min` 
            : `<i class="far fa-clock"></i> N/A`;
        
        // Set language
        const language = data.original_language ? data.original_language.toUpperCase() : 'N/A';
        document.getElementById('modal-language').innerHTML = `<i class="fas fa-globe"></i> ${language}`;
        
        // Set description
        document.getElementById('modal-description').textContent = data.overview || 'No description available.';
        
        // Set backdrop image
        const backdropUrl = data.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
        document.getElementById('modal-backdrop').src = backdropUrl;
        
        // Set genres
        const genresContainer = document.getElementById('modal-genres');
        genresContainer.innerHTML = '';
        if (data.genres && data.genres.length > 0) {
            data.genres.forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre.name;
                genresContainer.appendChild(genreTag);
            });
        }
        
        // Update play button
        const playBtn = document.getElementById('modal-play-btn');
        playBtn.dataset.id = id;
        playBtn.dataset.type = type;
        
        // Show modal
        movieModal.classList.add('active');
        
        // Add event listener to play button
        playBtn.onclick = () => {
            alert(`Now playing: ${type === 'tv' ? data.name : data.title}`);
        };
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        alert('Failed to load movie details. Please try again.');
    }
}
