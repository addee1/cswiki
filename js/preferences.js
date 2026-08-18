const preferencesTeamList = document.querySelector("#preferencesTeamList");
const preferencesTeamCount = document.querySelector("#preferencesTeamCount");
const currentFavorite = document.querySelector("#currentFavorite");
const currentFavoriteName = document.querySelector("#currentFavoriteName");
const menuButton = document.querySelector("#menuButton");
const mainNav = document.querySelector("#mainNav");
const removeFavoriteButton = document.querySelector("#removeFavoriteButton");
let teams = [];

/* LOAD TEAMS */
/*
    Loads all teams from teams.json.

    When the teams have been loaded:
    They are sorted by world ranking.
    The current favorite team is displayed.
    All teams are rendered in the preferences list.
*/
async function loadTeams() {
    try {
        const response = await fetch("data/teams.json");

        if (!response.ok) {
            throw new Error("Could not load teams.");
        }

        teams = await response.json();

        teams.sort((a, b) => {
            return a.ranking - b.ranking;
        });

        updateCurrentFavorite();
        renderTeams();

    } catch (error) {
        console.error(error);
        preferencesTeamList.innerHTML = `<p>Could not load teams.</p>`;
    }
}


/* RENDER TEAMS */
/*
    Creates one row for every team in teams.json.

    If a team is already selected as favorite,
    that row is marked as the current favorite.

    All other teams get a button that can be used
    to select them as the new favorite team.
*/
function renderTeams() {
    preferencesTeamList.innerHTML = "";
    preferencesTeamCount.textContent = `${teams.length} teams`;

    const favoriteTeamId = localStorage.getItem("favoriteTeam");


    teams.forEach(team => {
        const teamRow = document.createElement("div");

        teamRow.classList.add("preferences-team");


        if (team.id === favoriteTeamId) {
            teamRow.classList.add("preferences-team--favorite");
        }


        teamRow.innerHTML = `
            <div class="preferences-team__team">
                <img src="${team.logo}" alt="${team.name} logo" class="preferences-team__logo">
                <span class="preferences-team__name">
                    ${team.name}
                </span>
            </div>
            <div class="preferences-team__region">
                ${team.region}
            </div>
            <div class="preferences-team__ranking">
                #${team.ranking}
            </div>
            <div class="preferences-team__action">
                ${
                    team.id === favoriteTeamId
                        ?  `
                                <span class="preferences-team__selected">
                                    ★ Current Favorite
                                </span>
                           `
                        :  `
                                <button
                                    type="button"
                                    class="button button--primary favorite-team-button"
                                    data-team-id="${team.id}">
                                    Set as Favorite
                                </button>
                           `
                }
            </div>
        `;

        preferencesTeamList.append(teamRow);
    });

    addFavoriteButtonEvents();
}


/* FAVORITE BUTTON EVENTS */
/*
    Finds all "Set as Favorite" buttons after the team
    list has been rendered.

    The team id is read from the button's data-team-id
    attribute and sent to setFavoriteTeam().
*/
function addFavoriteButtonEvents() {
    const favoriteButtons = document.querySelectorAll(".favorite-team-button");

    favoriteButtons.forEach(button => {
        button.addEventListener("click", () => {
            const teamId = button.dataset.teamId;

            setFavoriteTeam(teamId);
        });
    });
}


/* SET FAVORITE TEAM */
/*
    Saves the selected team's id in localStorage.

    After saving:
    - The current favorite section is updated.
    - The team list is rendered again so the selected
      team gets the "Current Favorite" state.
*/
function setFavoriteTeam(teamId) {
    localStorage.setItem("favoriteTeam", teamId);

    updateCurrentFavorite();
    renderTeams();
}


/* CURRENT FAVORITE */
/*
    Reads the favorite team id from localStorage
    and finds the matching team from teams.json.

    If no favorite has been selected yet,
    the default message is displayed.
*/
function updateCurrentFavorite() {
    const favoriteTeamId =
        localStorage.getItem("favoriteTeam");

    if (!favoriteTeamId) {
        currentFavoriteName.textContent = "No favorite team selected";

        currentFavorite.classList.remove("has-favorite");
        removeFavoriteButton.hidden = true;
        return;
    }

    const favoriteTeam = teams.find(team => {
        return team.id === favoriteTeamId;
    });

    if (!favoriteTeam) {
        currentFavoriteName.textContent = "No favorite team selected";

        currentFavorite.classList.remove("has-favorite");
        removeFavoriteButton.hidden = true;
        return;
    }

    currentFavoriteName.textContent = favoriteTeam.name;
    currentFavorite.classList.add("has-favorite");
    removeFavoriteButton.hidden = false;
}


/* Removes the saved favorite team from localStorage and resets the preferences page. */
removeFavoriteButton.addEventListener("click", () => {
    localStorage.removeItem("favoriteTeam");

    updateCurrentFavorite();
    renderTeams();
});


/* MOBILE MENU */
/* Opens and closes the navigation menu on mobile. */
menuButton.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    menuButton.classList.toggle("open");
    const isOpen = mainNav.classList.contains("open");
    menuButton.setAttribute(
        "aria-expanded",
        isOpen
    );
});


/* Closes the mobile navigation menu when one of the navigation links is clicked.*/
mainNav.querySelectorAll(".main-nav__link").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuButton.classList.remove("open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    });
});


/* START */
loadTeams();