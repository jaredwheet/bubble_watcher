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

const tweetScores = async (filteredBubbleScores) => {
  try {
    filteredBubbleScores.forEach((score) => {
      if (
        (score.homeScore > score.awayScore) &
        (score.gameStatus === "InProgress")
      )
        inProgHomeWinning(
          score.homeTeam,
          score.homeScore,
          score.awayTeam,
          score.awayScore,
          score.timeRemaining,
          score.location
        );
      else if (
        (score.homeScore > score.awayScore) &
        (score.gameStatus === "Final")
      )
        finalHomeWinner(
          score.homeTeam,
          score.homeScore,
          score.awayTeam,
          score.awayScore,
          score.gameStatus,
          score.location
        );
      else if (
        (score.homeScore < score.awayScore) &
        (score.gameStatus === "InProgress")
      ) {
        inProgAwayWinning(
          score.homeTeam,
          score.homeScore,
          score.awayTeam,
          score.awayScore,
          score.timeRemaining,
          score.location
        );
      } else if (
        (score.homeScore < score.awayScore) &
        (score.gameStatus === "Final")
      ) {
        finalAwayWinner(
          score.homeTeam,
          score.homeScore,
          score.awayTeam,
          score.awayScore,
          score.gameStatus,
          score.location
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
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

  bubbleScores.forEach((score) => {
    teams.data.forEach((team) => {
      if (team.Key == score.homeTeam) {
        score.homeTeam = team.School;
      } else if (team.Key == score.awayTeam) {
        score.awayTeam = team.School;
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

  await tweetScores(filteredBubbleScores);
};

const inProgHomeWinning = async (
  homeTeam,
  homeScore,
  awayTeam,
  awayScore,
  timeLeft,
  location
) => {
  try {
    await client.post("statuses/update", {
      status: `BUBBLE WATCHER SCORE UPDATE
                                      
          ${homeTeam} ${homeScore} - ${awayTeam} ${awayScore}
          ${timeLeft}
          ${location}`,
    });
  } catch (e) {
    console.error(e);
  }
};
const inProgAwayWinning = async (
  homeTeam,
  homeScore,
  awayTeam,
  awayScore,
  timeLeft,
  location
) => {
  try {
    await client.post("statuses/update", {
      status: `BUBBLE WATCHER SCORE UPDATE
  
  ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}
  ${timeLeft}
  ${location}
                                  `,
    });
  } catch (e) {
    console.error(e);
  }
};

const finalHomeWinner = async (
  homeTeam,
  homeScore,
  awayTeam,
  awayScore,
  status,
  location
) => {
  try {
    await client.post("statuses/update", {
      status: `BUBBLE WATCHER FINAL SCORE 
        
        ${homeTeam} ${homeScore} - ${awayTeam} ${awayScore}
        ${status}
        ${location}
                                  `,
    });
  } catch (e) {
    console.error(e);
  }
};

const finalAwayWinner = async (
  homeTeam,
  homeScore,
  awayTeam,
  awayScore,
  status,
  location
) => {
  try {
    await client.post("statuses/update", {
      status: `BUBBLE WATCHER FINAL SCORE 
    
    ${awayTeam} ${awayScore} - ${homeTeam} ${homeScore}
    ${status}
    ${location}
                                                    `,
    });
  } catch (e) {
    console.error(e);
  }
};

displayScores();
