/**
 * Main Application - Orchestrates the dashboard
 */

import { initSupabase, getEvents, getEventsByType, getLeaderboard, getActiveEvent, processScorecard } from '/dashboard/data.js';
import { createEventSelector, createPodium, createPlayerList, createLoadingState, createEmptyState } from '/dashboard/components.js';

// Supabase configuration
const SUPABASE_URL = 'https://bcovevbtcdsgzbrieiin.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjb3ZldmJ0Y2RzZ3picmllaWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA3OTEsImV4cCI6MjA3NjIwNjc5MX0.etzrLL8yw4n_NUdYnr_bdcrKphW67dYln8CjR54NSLA';

// App state
const state = {
    currentPage: 'home',
    eventType: 'season',
    selectedEventId: null,
    allEvents: [],
    currentEvents: [],
    leaderboard: [],
    expandedPlayers: new Set()
};

// Disc golf jokes/puns
const discGolfJokes = [
    "I'm having a disc-traction free day! 🥏",
    "Keep calm and throw on! 🎯",
    "Life is full of obstacles... just like my putting line 🥏",
    "Every throw is a chance to be pargeous! ⛓️",
    "Disc golf: where the chains call your name 🔗",
    "I came, I threw, I chained! ⛓️",
    "My favorite exercise? Running for my disc 🏃‍♂️",
    "Throwing plastic at trees since... well, today! 🌲",
    "Par for the course? More like par-ty time! 🎉",
    "Keep your friends close and your discs closer 🥏",
    "When life gives you trees, ace through them! 🌲",
    "Disc golf: cheaper than therapy, just as frustrating 😅",
    "I've got 99 problems and they're all in the rough 🌿",
    "Stay calm and crush chains ⛓️",
    "Warning: May spontaneously throw discs 🥏"
];

// Initialize app
async function init() {
    console.log('Initializing ParSaveables Dashboard...');

    // Show random joke
    showRandomJoke();

    // Initialize Supabase
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initSupabase(supabaseClient);

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    await loadInitialData();

    // Render home page
    renderCurrentPage();
}

/**
 * Show random disc golf joke in banner
 */
function showRandomJoke() {
    const jokeElement = document.getElementById('discGolfJoke');
    const randomJoke = discGolfJokes[Math.floor(Math.random() * discGolfJokes.length)];
    jokeElement.textContent = randomJoke;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Bottom navigation tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const page = tab.dataset.page;
            switchPage(page);
        });
    });

    // Process scorecard button
    const processFab = document.getElementById('processFab');
    processFab.addEventListener('click', handleProcessScorecard);

    // Admin button
    const adminBtn = document.getElementById('adminBtn');
    adminBtn.addEventListener('click', () => {
        window.location.href = '/admin.html';
    });
}

/**
 * Load initial data
 */
async function loadInitialData() {
    try {
        // Get all events
        state.allEvents = await getEvents();

        // Try to get active event, otherwise use most recent season
        let activeEvent = await getActiveEvent();

        if (!activeEvent) {
            const seasons = state.allEvents.filter(e => e.type === 'season');
            activeEvent = seasons[0]; // Most recent season
        }

        if (activeEvent) {
            state.eventType = activeEvent.type;
            state.selectedEventId = activeEvent.id;
        }

        // Filter events by type
        state.currentEvents = state.allEvents.filter(e => e.type === state.eventType);

        // Load leaderboard for selected event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
        }

        console.log('Initial data loaded:', {
            totalEvents: state.allEvents.length,
            currentEventType: state.eventType,
            selectedEvent: state.selectedEventId,
            playersCount: state.leaderboard.length
        });
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

/**
 * Switch page
 */
function switchPage(page) {
    state.currentPage = page;

    // Update active tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.dataset.page === page) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    renderCurrentPage();
}

/**
 * Render current page
 */
function renderCurrentPage() {
    const content = document.getElementById('content');

    switch (state.currentPage) {
        case 'home':
            renderHomePage(content);
            break;
        case 'stats':
            renderStatsPage(content);
            break;
        case 'podcast':
            renderPodcastPage(content);
            break;
        case 'about':
            renderAboutPage(content);
            break;
    }
}

/**
 * Render home page (leaderboard)
 */
function renderHomePage(container) {
    container.innerHTML = '';

    // Event selector
    const eventSelector = createEventSelector(
        state.currentEvents,
        state.eventType,
        state.selectedEventId,
        handleEventChange
    );
    container.appendChild(eventSelector);

    // Show loading or empty state
    if (state.leaderboard.length === 0) {
        container.appendChild(createEmptyState('No players found for this event'));
        return;
    }

    // Podium (top 3)
    const topThree = state.leaderboard.slice(0, 3);
    if (topThree.length > 0) {
        const podium = createPodium(topThree, handlePlayerClick, state.expandedPlayers);
        container.appendChild(podium);
    }

    // Player list (rest)
    const remaining = state.leaderboard.slice(3);
    if (remaining.length > 0) {
        const playerList = createPlayerList(remaining, state.expandedPlayers, handlePlayerClick);
        container.appendChild(playerList);
    }
}

/**
 * Render stats page
 */
function renderStatsPage(container) {
    container.innerHTML = '';
    container.className = 'stats-page';

    // Stat cards data
    const statCards = [
        { title: 'Top Performers', icon: '🏆', description: 'Most Total Points' },
        { title: 'Most Birdies', icon: '🐦', description: 'Best Birdie Leaders' },
        { title: 'Most Eagles', icon: '🦅', description: 'Eagle Champions' },
        { title: 'Most Aces', icon: '🎯', description: 'Hole-in-One Kings' },
        { title: 'Most Wins', icon: '👑', description: 'Round Winners' },
        { title: 'Best Average', icon: '📊', description: 'Highest Avg Score' }
    ];

    // Create swipeable carousel
    const carousel = document.createElement('div');
    carousel.className = 'stats-carousel';
    carousel.id = 'statsCarousel';

    // Create cards
    statCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'stat-card';
        cardElement.innerHTML = `
            <div class="stat-card-header">
                <span class="stat-card-icon">${card.icon}</span>
                <h2 class="stat-card-title">${card.title}</h2>
            </div>
            <div class="stat-card-content">
                <div class="stat-card-description">${card.description}</div>
                <div class="stat-card-placeholder">Coming soon...</div>
            </div>
        `;
        carousel.appendChild(cardElement);
    });

    container.appendChild(carousel);

    // Add position indicators (dots)
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    indicators.id = 'carouselIndicators';

    statCards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `indicator-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        indicators.appendChild(dot);
    });

    container.appendChild(indicators);

    // Initialize swipe handling
    initStatsCarousel(carousel, statCards.length);
}

/**
 * Render podcast page
 */
function renderPodcastPage(container) {
    container.innerHTML = '';

    const section = document.createElement('div');
    section.className = 'about-section';
    section.innerHTML = `
        <div class="about-title">🎙️ Season Podcast</div>
        <div class="about-content">
            <p>Automated podcast generation coming soon!</p>
            <br>
            <p>Listen to AI-generated recaps of the season highlights, player performances, and memorable moments.</p>
        </div>
    `;
    container.appendChild(section);
}

/**
 * Render about page
 */
function renderAboutPage(container) {
    container.innerHTML = '';

    const sections = [
        {
            title: '🏆 How Scoring Works',
            content: `
                <p>Points are awarded based on placement in each round, with bonuses for exceptional performance.</p>
                <ul class="about-list">
                    <li>1st Place: Most points</li>
                    <li>Birdie Bonus: Extra points per birdie</li>
                    <li>Eagle Bonus: Extra points per eagle</li>
                    <li>Ace Bonus: Extra points for hole-in-one</li>
                </ul>
            `
        },
        {
            title: '📅 Season Info',
            content: `
                <p>Track your disc golf league performance throughout the season.</p>
                <ul class="about-list">
                    <li>Multiple events per season</li>
                    <li>Tournament competitions</li>
                    <li>Year-round leaderboards</li>
                </ul>
            `
        }
    ];

    sections.forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'about-section';
        sectionEl.innerHTML = `
            <div class="about-title">${section.title}</div>
            <div class="about-content">${section.content}</div>
        `;
        container.appendChild(sectionEl);
    });
}

/**
 * Handle event type/selection change
 */
async function handleEventChange(type, eventId) {
    // Show loading
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(createLoadingState());

    try {
        // Update type if changed
        if (type !== state.eventType) {
            state.eventType = type;
            state.currentEvents = await getEventsByType(type);

            // Select first event of new type
            if (state.currentEvents.length > 0) {
                state.selectedEventId = state.currentEvents[0].id;
            }
        } else if (eventId) {
            // Just update selected event
            state.selectedEventId = eventId;
        }

        // Load leaderboard for new event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
            state.expandedPlayers.clear(); // Reset expanded state
        }

        renderHomePage(content);
    } catch (error) {
        console.error('Failed to change event:', error);
        showError('Failed to load event data');
    }
}

/**
 * Handle player row click (expand/collapse)
 */
function handlePlayerClick(player) {
    if (state.expandedPlayers.has(player.name)) {
        state.expandedPlayers.delete(player.name);
    } else {
        state.expandedPlayers.add(player.name);
    }
    renderHomePage(document.getElementById('content'));
}

/**
 * Handle process scorecard button
 */
async function handleProcessScorecard() {
    const fab = document.getElementById('processFab');
    fab.disabled = true;
    fab.style.opacity = '0.5';

    try {
        const result = await processScorecard();
        alert(`Scorecard processed successfully!\n\n${result.message || 'Data updated.'}`);

        // Reload data
        await loadInitialData();
        renderCurrentPage();
    } catch (error) {
        console.error('Process scorecard failed:', error);
        alert(`Failed to process scorecard: ${error.message}`);
    } finally {
        fab.disabled = false;
        fab.style.opacity = '1';
    }
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
}

/**
 * Initialize stats carousel with swipe handling
 */
function initStatsCarousel(carousel, totalCards) {
    let currentIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;

    const updateCarousel = (index, animate = true) => {
        currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        const offset = -currentIndex * 100;

        if (animate) {
            carousel.style.transition = 'transform 0.3s ease-out';
        } else {
            carousel.style.transition = 'none';
        }

        carousel.style.transform = `translateX(${offset}%)`;

        // Update indicators
        const indicators = document.querySelectorAll('.indicator-dot');
        indicators.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    };

    const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        startTime = Date.now();
        carousel.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const offset = -currentIndex * 100 + (diff / window.innerWidth) * 100;

        carousel.style.transform = `translateX(${offset}%)`;
    };

    const handleTouchEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentX - startX;
        const duration = Date.now() - startTime;
        const velocity = Math.abs(diff) / duration;

        // Swipe threshold: 50px or fast swipe (velocity > 0.3)
        if (Math.abs(diff) > 50 || velocity > 0.3) {
            if (diff > 0 && currentIndex > 0) {
                // Swipe right - go to previous
                updateCarousel(currentIndex - 1);
            } else if (diff < 0 && currentIndex < totalCards - 1) {
                // Swipe left - go to next
                updateCarousel(currentIndex + 1);
            } else {
                // Snap back
                updateCarousel(currentIndex);
            }
        } else {
            // Snap back to current
            updateCarousel(currentIndex);
        }
    };

    // Touch events
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Click on indicator dots
    document.querySelectorAll('.indicator-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            updateCarousel(parseInt(dot.dataset.index));
        });
    });

    // Initialize position
    updateCarousel(0, false);
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
