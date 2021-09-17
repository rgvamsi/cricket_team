const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => 
      console.log("Server running");
    );
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// Get All Players

app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team;`;
  const players = await db.all(playersQuery);
  response.send(players.map((eachPlayer)=>convertDbObjectToResponseObject(eachPlayer)));
});
//Get player details

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const dbResponse = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(dbResponse));
});

//Adding a player

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber,role} = request.body;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES ("${playerName}",${jerseyNumber},"${role}");`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});


//Update Player details

app.put("players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const {playerId}=request.params
  const updatePlayer = `UPDATE cricket_team SET
    player_name="${playerName}",
    jersey_number=${jerseyNumber},
    role="${role}
    WHERE player_id=${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});
//delete player
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
