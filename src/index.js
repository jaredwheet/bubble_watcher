const axios = require("axios");
const Twitter = require("twitter");
require("dotenv").config();

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
      "https://api.sportsdata.io/v3/cbb/scores/json/GamesByDate/2021-Feb-21",
      options
    );
  } catch (error) {
    console.error(error);
  }
};

const switchTeamName = async (shortName) => {
  let teams = await getTeams();

  teams.data.forEach((team) => {
    if (team.Key === shortName) return team.School;
  });
};

const displayScores = async () => {
  const bubbleScores = [];
  const scores = await getScores();
  const teams = await getTeams();

  // Trying to replace the key (short name ) with the school name which is easier to read
  //   await scores.data.forEach((score) => {
  //     score.HomeTeam = switchTeamName(score.HomeTeam);
  //     score.AwayTeam = "away";
  //   });

  scores.data.forEach((score) => {
    bubbleTeams.forEach((team) => {
      if (team === score.HomeTeam || team === score.AwayTeam) {
        bubbleScores.push({
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

  const filteredBubbleScores = bubbleScores.filter(
    (score) =>
      score.gameStatus == "Final" ||
      score.gameStatus == "InProgress" ||
      score.gameStatus == "Scheduled"
  );

  console.log(filteredBubbleScores);
  filteredBubbleScores.forEach((score) => {
    if (
      (score.homeScore > score.awayScore) &
      (score.gameStatus === "InProgress")
    ) {
      client.post(
        "statuses/update",
        {
          status: `BUBBLE WATCHER SCORE UPDATE

  ${score.homeTeam} ${score.homeScore} - ${score.awayTeam} ${score.awayScore}
  ${score.timeRemaining}
  ${score.location}
                            `,
        },
        function (error, tweet, response) {
          if (!error) {
            console.log(tweet);
          }
        }
      );
    } else if (
      (score.homeScore > score.awayScore) &
      (score.gameStatus === "Final")
    ) {
      client.post(
        "statuses/update",
        {
          status: `BUBBLE WATCHER FINAL SCORE UPDATE

  ${score.homeTeam} ${score.homeScore} - ${score.awayTeam} ${score.awayScore}
  ${score.gameStatus}
  ${score.location}
                              `,
        },
        function (error, tweet, response) {
          if (!error) {
            console.log(tweet);
          }
        }
      );
    } else if (
      (score.homeScore < score.awayScore) &
      (score.gameStatus === "InProgress")
    ) {
      client.post(
        "statuses/update",
        {
          status: `BUBBLE WATCHER SCORE UPDATE

  ${score.awayTeam} ${score.awayScore} - ${score.homeTeam} ${score.homeScore}
  ${score.timeRemaining}
  ${score.location}
                                `,
        },
        function (error, tweet, response) {
          if (!error) {
            console.log(tweet);
          }
        }
      );
    } else if (
      (score.homeScore < score.awayScore) &
      (score.gameStatus === "Final")
    ) {
      client.post(
        "statuses/update",
        {
          status: `BUBBLE WATCHER FINAL SCORE UPDATE

  ${score.awayTeam} ${score.awayScore} - ${score.homeTeam} ${score.homeScore}
  ${score.gameStatus}
  ${score.location}
                                  `,
        },
        function (error, tweet, response) {
          if (!error) {
            console.log(tweet);
          }
        }
      );
    }
  });
};

displayScores();
