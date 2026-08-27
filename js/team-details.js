const teamDetailsContent = document.querySelector("#teamDetailsContent");
const teamNotFound = document.querySelector("#teamNotFound");
const teamHeroImage = document.querySelector("#teamHeroImage");
const teamLogo = document.querySelector("#teamLogo");
const teamName = document.querySelector("#teamName");
const teamDescription = document.querySelector("#teamDescription");
const teamRanking = document.querySelector("#teamRanking");
const teamRegion = document.querySelector("#teamRegion");
const teamCountry = document.querySelector("#teamCountry");
const teamCoach = document.querySelector("#teamCoach");
const teamShortName = document.querySelector("#teamShortName");
const teamPlayerList = document.querySelector("#teamPlayerList");
const playerCount = document.querySelector("#playerCount");
const reviewForm = document.querySelector("#reviewForm");
const reviewFormTitle = document.querySelector("#reviewFormTitle");
const reviewName = document.querySelector("#reviewName");
const reviewRating = document.querySelector("#reviewRating");
const reviewMessage = document.querySelector("#reviewMessage");
const reviewNameError = document.querySelector("#reviewNameError");
const reviewRatingError = document.querySelector("#reviewRatingError");
const reviewMessageError = document.querySelector("#reviewMessageError");
const reviewList = document.querySelector("#reviewList");
const reviewCount = document.querySelector("#reviewCount");
const menuButton = document.querySelector("#menuButton");
const mainNav = document.querySelector("#mainNav");

let teams = [];
let players = [];
let currentTeam = null;


/* Reads the team id from the URL.*/
function getTeamIdFromUrl() {
    const params = new URLSearchParams(window.location.search);

    return params.get("id");
}


/* Loads all teams from teams.json */
async function loadTeams() {
    try {
        const response = await fetch("data/teams.json");

        if (!response.ok) {
            console.error("Could not load teams.");
            return false;
        }

        teams = await response.json();
        return true;

    } catch (error) {
        console.error(error);
        return false;
    }
}


/* Loads all players from players.json */
async function loadPlayers() {
    try {
        const response = await fetch("data/players.json");

        if (!response.ok) {
            console.error("Could not load players.");
            return false;
        }

        players = await response.json();
        return true;

    } catch (error) {
        console.error(error);
        return false;
    }
}

/* Finds the team that matches the id from the URL*/
function findCurrentTeam() {
    const teamId = getTeamIdFromUrl();

    if (!teamId) {
        return null;
    }

    return teams.find(team => {
        return team.id === teamId;
    }) || null;
}

/* RENDER TEAM INFORMATION */
function renderTeamInformation(team) {
    document.title = `${team.name} - CSWiki`;
    teamHeroImage.src = team.heroImage;
    teamHeroImage.alt = `${team.name} players`;
    teamLogo.src = team.logo;
    teamLogo.alt = `${team.name} logo`;
    teamName.textContent = team.name;
    teamDescription.textContent = team.description;
    teamRanking.textContent = `#${team.ranking}`;
    teamRegion.textContent = team.region;
    teamCountry.textContent = team.country;
    teamCoach.textContent = team.coach;
    teamShortName.textContent = team.shortName;
    reviewFormTitle.textContent = `Review ${team.name}`;
}

/* GET TEAM PLAYERS */
/*
    Uses the playerIds stored on the team and
    finds the matching players in players.json.

    The players remain in the same order as
    the playerIds in teams.json
*/
function getTeamPlayers(team) {
    return team.playerIds
        .map(playerId => {
            return players.find(player => {
                return player.id === playerId;
            });
        })
        .filter(player => player);
}


/* RENDER PLAYERS */
/*Creates one player card for every player for to the selected team.*/
function renderPlayers(teamPlayers) {
    teamPlayerList.innerHTML = "";
    playerCount.textContent = `${teamPlayers.length} players`;

    teamPlayers.forEach(player => {
        const playerCard = document.createElement("article");

        playerCard.classList.add(
            "player-card"
        );

        playerCard.innerHTML = `
            <img
                src="${player.image}"
                alt="${player.nickname}"
                class="player-card__image"
            >
            <h3 class="player-card__nickname">
                ${player.nickname}
            </h3>
            <p class="player-card__name">
                ${player.name}
            </p>
            <div class="player-card__details">
                <span class="player-card__country">
                    ${player.country}
                </span>
                <span class="player-card__age">
                    ${player.age} years
                </span>
            </div>
        `;

        teamPlayerList.append(playerCard);
    });
}


/* SHOW TEAM NOT FOUND */
/* Hides the normal team details content when the team id don't exist.*/
function showTeamNotFound() {
    teamDetailsContent.hidden = true;
    teamNotFound.hidden = false;
    document.title = "Team Not Found - CSWiki";
}


/* GET REVIEW STORAGE KEY */
/*
    Every team gets am own review key in localStorage.
    Example: reviews-team-falcons
*/
function getReviewStorageKey() {
    return `reviews-${currentTeam.id}`;
}

/* GET REVIEWS */
/* Reads the current teams reviews from localStorage.*/
function getReviews() {
    const savedReviews =
        localStorage.getItem(
            getReviewStorageKey()
        );

    if (!savedReviews) {
        return [];
    }

    return JSON.parse(savedReviews);
}

/* Saves the current teams reviews to localStorage. */
function saveReviews(reviews) {
    localStorage.setItem(
        getReviewStorageKey(),
        JSON.stringify(reviews)
    );
}



/* Show all reviews for the specific team*/
function renderReviews() {
    const reviews = getReviews();
    reviewList.innerHTML = "";
    reviewCount.textContent =
        `${reviews.length} ${
            reviews.length === 1
                ? "review"
                : "reviews"
        }`;


    if (reviews.length === 0) {
        reviewList.innerHTML = `
            <div class="review-empty">
                No reviews yet. Be the first to review
                ${currentTeam.name}.
            </div>
        `;

        return;
    }


    reviews.forEach(review => {
        const reviewCard = document.createElement("article");

        reviewCard.classList.add(
            "review-card"
        );

        reviewCard.innerHTML = `
            <div class="review-card__header">
                <span class="review-card__name">
                    ${review.name}
                </span>
                <span class="review-card__rating">
                    ${review.rating}/5 ★
                </span>
            </div>
            <p class="review-card__message">
                ${review.message}
            </p>
        `;

        reviewList.append(reviewCard);
    });
}


/* CLEAR REVIEW ERRORS */
function clearReviewErrors() {
    reviewNameError.textContent = "";
    reviewRatingError.textContent = "";
    reviewMessageError.textContent = "";
}


/* VALIDATE REVIEW */
/*
    Validates the review form.
    Returns true if all fields are valid.
*/
function validateReviewForm() {
    clearReviewErrors();

    let isValid = true;
    const name = reviewName.value.trim();
    const rating = reviewRating.value;
    const message = reviewMessage.value.trim();

    if (name.length < 2) {
        reviewNameError.textContent = "Please enter at least 2 characters.";

        isValid = false;
    }

    if (!rating) {
        reviewRatingError.textContent = "Please select a rating.";

        isValid = false;
    }


    if (message.length < 10) {
        reviewMessageError.textContent = "The review must contain at least 10 characters.";

        isValid = false;
    }

    return isValid;
}


/* SUBMIT REVIEw */
reviewForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        if (!validateReviewForm()) {
            return;
        }

        const reviews = getReviews();

        const newReview = {
            name: reviewName.value.trim(),
            rating: Number(reviewRating.value),
            message: reviewMessage.value.trim()
        };

        reviews.unshift(
            newReview
        );

        saveReviews(
            reviews
        );

        reviewForm.reset();
        clearReviewErrors();
        renderReviews();
    }
);


/* MOBILE MENU */
/* Opens and closes the navigation menu on mobile.*/
menuButton.addEventListener(
    "click",
    () => {

        mainNav.classList.toggle(
            "open"
        );

        menuButton.classList.toggle(
            "open"
        );

        const isOpen =
            mainNav.classList.contains(
                "open"
            );

        menuButton.setAttribute(
            "aria-expanded",
            isOpen
        );
    }
);


/* Closes the mobile menu when one of the navigation links is clicked */
mainNav
    .querySelectorAll(".main-nav__link")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mainNav.classList.remove(
                    "open"
                );

                menuButton.classList.remove(
                    "open"
                );

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    });


/* INITIALIZE TEAM DETAILS */
/*
    Loads teams and players before rendering
    the Team Details page.
*/
async function initializeTeamDetails() {
    const teamsLoaded = await loadTeams();
    const playersLoaded = await loadPlayers();

    if (!teamsLoaded || !playersLoaded) {
        showTeamNotFound();

        return;
    }

    currentTeam = findCurrentTeam();

    if (!currentTeam) {
        showTeamNotFound();

        return;
    }

    renderTeamInformation(currentTeam);
    const teamPlayers = getTeamPlayers(currentTeam);
    renderPlayers(teamPlayers);

    renderReviews();
}

initializeTeamDetails();