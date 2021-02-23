const axios = require("axios");
const Twitter = require("twitter");
require("dotenv").config();

const today = new Date().toISOString().slice(0, 10);

//twitter client config
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const options = {
  headers: { "Ocp-Apim-Subscription-Key": process.env.CBB_API_KEY },
};

const bubbleTeams = [
  "VCU",
  "SETON",
  "IND",
  "DRAKE",
  "XAV",
  "MINNST",
  "MARY",
  "COLST",
  "STAN",
  "UCONN",
  "STBON",
  "STLOU",
  "RICH",
  "UTAHST",
  "DUKE",
  "SYRA",
];

const getTeams = async () => {
  try {
    return await axios.get(
      "https://api.sportsdata.io/v3/cbb/scores/json/teams",
      options
    );
  } catch (error) {
    console.error(error);
  }
};

const getScores = async () => {
  try {
    return await axios.get(
      `https://api.sportsdata.io/v3/cbb/scores/json/GamesByDate/${today}`,
      options
    );
  } catch (error) {
    console.error(error);
  }
};

const tweetTodaysResults = async () => {
  const bubbleGames = [];
  const games = await getScores();
  const teams = await getTeams();

  games.data.forEach((game) => {
    bubbleTeams.forEach((team) => {
      if (team === game.HomeTeam || game === game.AwayTeam) {
        bubbleGames.push({
          gameStatus: score.Status,
          homeTeam: score.HomeTeam,
          awayTeam: score.AwayTeam,
          homeScore: score.HomeTeamScore,
          awayScore: score.AwayTeamScore,
          half: score.Period,
          timeRemaining: `${score.TimeRemainingMinutes}:${score.TimeRemainingSeconds}`,
          location: `${score.Stadium.Name}, ${score.Stadium.City}, ${score.Stadium.State}`,
        });
      }
    });
  });

  bubbleGames.forEach((game) => {
    teams.data.forEach((team) => {
      if (team.Key == game.homeTeam) {
        game.homeTeam = team.School;
      } else if (team.Key == game.awayTeam) {
        game.awayTeam = team.School;
      }
    });
  });

  const filteredBubbleGames = bubbleGames.filter(
    (game) => game.gameStatus == "Final"
  );
  let todaysResultsBlock = "";
  if (!filteredBubbleGames.length === 0) {
    try {
      filteredBubbleGames.forEach((game) => {
        if (game.homeScore > game.awayScore) {
          todaysResultsBlock += `FINAL ${game.homeTeam} ${game.homeScore} - ${game.awayTeam} ${game.awayScore}\n`;
        } else if (game.awayScore > game.homeScore) {
          todaysResultsBlock += `FINAL ${game.awayTeam} ${game.awayScore} - ${game.homeTeam} ${game.homeScore}\n`;
        }
      });
      try {
        client.post("statuses/update", {
          status: `TODAY'S BUBBLE WATCH RESULTS

${todaysResultsBlock}
        `,
        });
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    }
  }
};
tweetTodaysResults();
