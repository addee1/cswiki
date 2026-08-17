const teamList = document.querySelector("#teamList");
const teamCount = document.querySelector("#teamCount");
const teamSearch = document.querySelector("#teamSearch");
const regionFilter = document.querySelector("#regionFilter");
const teamSort = document.querySelector("#teamSort");
const resetFiltersButton = document.querySelector("#resetFiltersButton");
const regionDropdownElement = document.querySelector('[data-dropdown="region"]');
const sortDropdownElement = document.querySelector('[data-dropdown="sort"]');
const teamPagination = document.querySelector("#teamPagination");
const playerList = document.querySelector("#playerList");
const menuButton = document.querySelector("#menuButton");
const mainNav = document.querySelector("#mainNav");

let currentTeamPage = 1;
let teams = [];
let players = [];
let previousTeamsPerPage = getTeamsPerPage();


/* HELP FUNCTION TO DECIDE HOW MANY CARDS PER PAGE */
function getTeamsPerPage() {
    if (window.innerWidth <= 1100) {
        return 6;
    }

    return 10;
}


/*  CUSTOM DROPDOWN */
function initializeCustomDropdown(dropdown) {
    const select = dropdown.querySelector("select");
    const button = dropdown.querySelector(".custom-dropdown__button");
    const selectedValue = dropdown.querySelector(".custom-dropdown__value");
    const menu = dropdown.querySelector(".custom-dropdown__menu");

    function closeDropdown() {
        dropdown.classList.remove("open");

        button.setAttribute("aria-expanded", "false");
    }

    function refreshDropdown() {
        menu.innerHTML = "";
        const currentOption = select.options[select.selectedIndex];
        selectedValue.textContent = currentOption.textContent;

        Array.from(select.options).forEach(option => {
            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.classList.add("custom-dropdown__option");
            optionButton.textContent = option.textContent;

            if (option.value === select.value) {
                optionButton.classList.add("active");
            }

            optionButton.addEventListener("click", () => {
                select.value = option.value;

                select.dispatchEvent(new Event("change"));

                refreshDropdown();
                closeDropdown();
            });

            menu.append(optionButton);
        });
    }

    button.addEventListener("click", () => {
        const isOpen = dropdown.classList.toggle("open");

        button.setAttribute(
            "aria-expanded",
            isOpen
        );
    });

    document.addEventListener("click", event => {
        if (!dropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    refreshDropdown();

    return {
        refresh: refreshDropdown
    };
}
const regionDropdown = initializeCustomDropdown(regionDropdownElement);
const sortDropdown = initializeCustomDropdown(sortDropdownElement);


/* LOAD TEAMS */
async function loadTeams() {
    try {
        const response = await fetch("data/teams.json");

        if (!response.ok) {
            throw new Error("Could not load teams.");
        }

        teams = await response.json();

        createRegionOptions(teams);
        updateTeams();

    } catch (error) {
        console.error(error);

        teamList.innerHTML = `
            <p>Could not load teams.</p>
        `;
    }
}


/* LOAD PLAYERS */
async function loadPlayers() {
    try {
        const response = await fetch("data/players.json");

        if (!response.ok) {
            throw new Error("Could not load players.");
        }

        players = await response.json();

        const randomPlayers = getRandomPlayers(players, 5);

        renderPlayers(randomPlayers);

    } catch (error) {
        console.error(error);

        playerList.innerHTML = `
            <p>Could not load players.</p>
        `;
    }
}


/*  RENDER TEAMS */
function renderTeams(teamsToShow) {
    teamList.innerHTML = "";

    teamsToShow.forEach(team => {
        const teamCard = document.createElement("a");

        teamCard.classList.add("team-card");

        teamCard.href = `team-details.html?id=${team.id}`;

        teamCard.innerHTML = `
            <div class="team-card__top">
                <span class="team-card__rank">
                    #${team.ranking}
                </span>
            </div>

            <img
                src="${team.logo}"
                alt="${team.name} logo"
                class="team-card__logo"
            >

            <h3 class="team-card__name">
                ${team.name}
            </h3>

            <p class="team-card__country">
                ${team.country}
            </p>

            <span class="team-card__ranking">
                Rank #${team.ranking}
            </span>
        `;

        teamList.append(teamCard);
    });
}


/* RENDER PLAYERS */
function renderPlayers(playersToShow) {
    playerList.innerHTML = "";

    playersToShow.forEach(player => {
        const playerCard = document.createElement("article");

        playerCard.classList.add("player-card");

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

        playerList.append(playerCard);
    });
}


/* GETS 5 RANDOM PLAYERS */
function getRandomPlayers(players, amount) {
    const shuffledPlayers = [...players];

    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(
            Math.random() * (i + 1)
        );

        const currentPlayer = shuffledPlayers[i];

        shuffledPlayers[i] = shuffledPlayers[randomIndex];
        shuffledPlayers[randomIndex] = currentPlayer;
    }

    return shuffledPlayers.slice(0, amount);
}


/* REGION OPTIONS */
function createRegionOptions(teams) {
    const regions = [];


    teams.forEach(team => {
        if (!regions.includes(team.region)) {
            regions.push(team.region);
        }
    });


    regions.sort();


    regions.forEach(region => {
        const option = document.createElement("option");

        option.value = region;
        option.textContent = region;

        regionFilter.append(option);
    });


    /*
        The regions were added to the hidden select.
        Now update our custom dropdown as well.
    */
    regionDropdown.refresh();
}


/* SEARCH, SORT, FILTER */
function updateTeams() {
    const searchText = teamSearch.value.toLowerCase().trim();
    const selectedRegion = regionFilter.value;
    const selectedSort = teamSort.value;
    const teamsPerPage = getTeamsPerPage();

    let filteredTeams = teams.filter(team => {
        const teamName = team.name.toLowerCase();

        const matchesSearch =
            teamName.includes(searchText);

        const matchesRegion =
            selectedRegion === "all" ||
            team.region === selectedRegion;

        return matchesSearch && matchesRegion;
    });


    if (selectedSort === "ranking") {
        filteredTeams.sort((a, b) => {
            return a.ranking - b.ranking;
        });
    }

    if (selectedSort === "name-asc") {
        filteredTeams.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }

    if (selectedSort === "name-desc") {
        filteredTeams.sort((a, b) => {
            return b.name.localeCompare(a.name);
        });
    }


    // Total number of teams matching search/filter
    teamCount.textContent = `${filteredTeams.length} teams`;


    // Pagiination
    const totalPages =
        Math.ceil(filteredTeams.length / teamsPerPage);

    if (currentTeamPage > totalPages) {
        currentTeamPage = totalPages || 1;
    }

    const startIndex =
        (currentTeamPage - 1) * teamsPerPage;

    const endIndex =
        startIndex + teamsPerPage;

    const teamsForCurrentPage =
        filteredTeams.slice(startIndex, endIndex);


    renderTeams(teamsForCurrentPage);
    renderTeamPagination(totalPages);
}


function renderTeamPagination(totalPages) {
    teamPagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }


    // Previous
    const previousButton = document.createElement("button");

    previousButton.type = "button";
    previousButton.classList.add("pagination__button");
    previousButton.textContent = "←";

    previousButton.disabled = currentTeamPage === 1;

    previousButton.addEventListener("click", () => {
        currentTeamPage--;

        updateTeams();
    });

    teamPagination.append(previousButton);


    // Page numbers
    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement("button");

        pageButton.type = "button";
        pageButton.classList.add("pagination__button");

        pageButton.textContent = page;


        if (page === currentTeamPage) {
            pageButton.classList.add("active");
        }


        pageButton.addEventListener("click", () => {
            currentTeamPage = page;

            updateTeams();
        });


        teamPagination.append(pageButton);
    }


    // Next
    const nextButton = document.createElement("button");

    nextButton.type = "button";
    nextButton.classList.add("pagination__button");
    nextButton.textContent = "→";

    nextButton.disabled = currentTeamPage === totalPages;

    nextButton.addEventListener("click", () => {
        currentTeamPage++;

        updateTeams();
    });

    teamPagination.append(nextButton);
}


/* RESET FILTERS ETC */
function resetFilters() {
    teamSearch.value = "";

    regionFilter.value = "all";
    teamSort.value = "ranking";
    currentTeamPage = 1;
    regionDropdown.refresh();
    sortDropdown.refresh();

    updateTeams();
}


/* EVENTS */
teamSearch.addEventListener("input", () => {
    currentTeamPage = 1;
    updateTeams();
});

regionFilter.addEventListener("change", () => {
    currentTeamPage = 1;
    updateTeams();
});


/* Resets the pagination to page 1 when the user changes how the teams are sorted. */
teamSort.addEventListener("change", () => {
    currentTeamPage = 1;
    updateTeams();
});


/* Resets all filters and sorting options when the user click the reset filter btn */
resetFiltersButton.addEventListener("click", resetFilters);


/* Opens and closes the mobile nav menu */
menuButton.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    menuButton.classList.toggle("open");

    const isOpen = mainNav.classList.contains("open");

    menuButton.setAttribute("aria-expanded", isOpen);
});


/* Closes the mobile menu when the user clicks one of the navigation links. */
mainNav.querySelectorAll(".main-nav__link").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuButton.classList.remove("open");

        menuButton.setAttribute("aria-expanded", "false");
    });
});


/* Updates the team pagination when the browser window changes size. */
window.addEventListener("resize", () => {
    const currentTeamsPerPage = getTeamsPerPage();

    if (currentTeamsPerPage !== previousTeamsPerPage) {
        previousTeamsPerPage = currentTeamsPerPage;

        currentTeamPage = 1;

        updateTeams();
    }
});

loadTeams();
loadPlayers();