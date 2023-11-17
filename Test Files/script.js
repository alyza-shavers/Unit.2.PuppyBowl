//Refence constants for HTML fields
const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');
const playerSingleDetails = document.getElementById('player-details');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2308-ACC-PT-WEB-PT-B';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;
//Constant for state
const state = {
    players: [],
  };
  
/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(APIURL + "/players");
       if (!response.ok) {
        throw new Error("Failed to fetch players");
       }
        
        const { data } = await response.json();
        console.log(data);
        return data.players;
      } catch (error) {
        console.error('Uh oh, trouble fetching players!', err);
      }     
};
//Fetches single player information with details button on player card
const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(APIURL + "/players/" + playerId);
        if (!response.ok) {
        throw new Error(`Failed to fetch player #${playerId}`);
        }

        const playerData = await response.json();

        console.log(`Fetched player #${playerId}:`, playerData);
        return playerData;

    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};
//Create new player using form inputs
const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch(APIURL + "/players", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(playerObj),
                
        });

        if (!response.ok) {
            throw new Error("Failed to create new player");
        }

        const updatedPlayers = await fetchAllPlayers();
        renderAllPlayers(updatedPlayers);
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};
//Removes player with delete button on player card
const removePlayer = async (playerId) => {
    try {
        const response = await fetch(APIURL + "/players" + `/${playerId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            // Log for debugging purposes, players deleted but errored on 200 code which should be success
            console.log("Failed to delete player. Response status:", response.status);
            throw new Error("Failed to delete player");
        }

        const updatedPlayers = await fetchAllPlayers();
        renderAllPlayers(updatedPlayers);
    } catch (err) {
        console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
    if (!playerList || !playerList.length) {
        console.log(playerList);
            playerContainer.innerHTML = "<li>No Players</li>";
            return;
        }

        //Player cards in list format and delete/details buttons
        const playerCards = playerList.map((player) => {
            const li = document.createElement("li");
            const img = displayImage(player.imageUrl, 125, 125);
            li.innerHTML = `
            <h2>${player.name}</h2>` 
            li.appendChild(img); // Append the image to the list format
            li.innerHTML +=
            `<p>Breed: ${player.breed}</p>
            <p>Status: ${player.status}</p> 
            <p>Team ID: ${player.teamId}</p>
            <button class="delete-button" data-player-id="${player.id}">Delete</button>
            <button class="details-button" data-player-id="${player.id}">See Details</button>
            `;
            return li;
        });

        playerContainer.replaceChildren(...playerCards);

        function displayImage(src, width, height) {
            var img = document.createElement("img");
            img.src = src;
            img.width = width;
            img.height = height;
            return img;
            }

};

//Listener for removePlayer function and delete button
playerContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-button")) {
      const playerId = event.target.getAttribute("data-player-id");
      removePlayer(playerId);
    }
  });
  //Listener for fetchSinglePlayer function and details button
  playerContainer.addEventListener("click", async (event) => {
    if (event.target.classList.contains("details-button")) {
      const playerId = event.target.getAttribute("data-player-id");
      
      try {
        const playerData = await fetchSinglePlayer(playerId);
        //Logged for testing purposes to show structure for details
        console.log("Details:", playerData);
        
        playerSingleDetails.innerHTML = `
        <h2>Name: ${playerData.data.player.name}</h2>
        <p>ID: ${playerData.data.player.id}</p>
        <p>Breed: ${playerData.data.player.breed}</p>
        <p>Url: ${playerData.data.player.imageUrl}</p>
        <p>Status: ${playerData.data.player.status}</p>
        <p>Team ID: ${playerData.data.player.teamId}</p>
        <p>Created: ${playerData.data.player.createdAt}</p>
        <p>Last Update: ${playerData.data.player.updatedAt}</p>
        <p>Cohort ID: ${playerData.data.player.cohortId}</p>
        `;

      } catch (error) {
        // Displaying an error message for debugging
        console.error("Error fetching player details:", error.message);
      }
   
    }
  });

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        const newPlayerFormContainer = document.getElementById('new-player-form');
        
        //Listener for addNewPlayer function and new player submit button
        newPlayerFormContainer.addEventListener('submit', async (event) => {
            event.preventDefault();

            const playerObj = {
                name: newPlayerFormContainer.name.value,
                breed: newPlayerFormContainer.breed.value, 
                status: newPlayerFormContainer.status.value,
                imageUrl: newPlayerFormContainer.imageUrl.value,
                teamId: newPlayerFormContainer.teamId.value,
            };

            await addNewPlayer(playerObj);
            console.log(newPlayerFormContainer);

            //Clears the form after submission
            newPlayerFormContainer.reset();
        });

    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
};

const init = async () => {
    try {
        const playerList = await fetchAllPlayers();
        renderAllPlayers(playerList);
        renderNewPlayerForm();

    } catch (err) {
        console.error('Initialization error:', err);
    }
};

init();