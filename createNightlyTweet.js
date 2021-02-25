const sdv = require("sportsdataverse");
const Twitter = require("twitter");
require("dotenv").config();

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const bubbleTeams = [
  "RICH",
  "VCU",
  "SBU",
  "SLU",
  "DUKE",
  "UNC",
  "SYR",
  "GT",
  "LOU",
  "MEM",
  "DRKE",
  "WICH",
  "SMU",
  "CONN",
  "SJU",
  "XAV",
  "HALL",
  "IU",
  "MD",
  "RUTG",
  "MINN",
  "MSU",
  "LUC",
  "BSU",
  "CSU",
  "SDSU",
  "USU",
  "COLO",
  "ORE",
  "STAN",
  "UCLA",
  "MISS",
  "BYU",
  "WKU",
  "BEL",
  "WIN",
];

const inputs = {
  year: 2021,
  month: 02,
  day: 24,
  groups: 50,
  seasontype: 2,
};

async function getScores() {
  const scores = await sdv.cbbScoreboard.getScoreboard(inputs);
  return scores;
}

async function getTeams() {
  const teams = await sdv.cbbTeams.getTeamList();
  return teams;
}

async function createDaysBubbleGames(bubbleTeams) {
  const scores = await getScores();
  const teams = await getTeams();
  const bubbleScores = [];
  const allScores = [];

  scores.events.forEach((event) => {
    let homeTeam = "";
    let awayTeam = "";
    let homeScore = "";
    let awayScore = "";
    let homeAbbv = "";
    let awayAbbv = "";

    event.competitions[0].competitors.forEach((competitor) => {
      if (competitor.homeAway === "home") {
        homeTeam = competitor.team.shortDisplayName;
        homeScore = competitor.score;
        homeAbbv = competitor.team.abbreviation;
      } else if (competitor.homeAway === "away") {
        awayTeam = competitor.team.shortDisplayName;
        awayScore = competitor.score;
        awayAbbv = competitor.team.abbreviation;
      }
      bubbleGame = {
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeScore: homeScore,
        awayScore: awayScore,
        homeAbbv: homeAbbv,
        awayAbbv: awayAbbv,
      };
    });
    allScores.push(bubbleGame);

    allScores.forEach((score) => {
      bubbleTeams.forEach((team) => {
        if (team === score.homeAbbv || team == score.awayAbbv) {
          var index = bubbleScores.findIndex(
            (x) => x.bubbleGame.homeTeam == score.homeTeam
          );
          index === -1
            ? bubbleScores.push({ bubbleGame })
            : console.log(`already exists`);
        }
      });
    });
  });

  let tweetBlock = "";
  bubbleScores.forEach((score) => {
    if (score.bubbleGame.homeScore > score.bubbleGame.awayScore) {
      tweetBlock += `${score.bubbleGame.homeTeam} ${score.bubbleGame.homeScore} - ${score.bubbleGame.awayTeam} ${score.bubbleGame.awayScore}\n`;
    } else if (score.bubbleGame.awayScore > score.bubbleGame.homeScore) {
      tweetBlock += `${score.bubbleGame.awayTeam} ${score.bubbleGame.awayScore} - ${score.bubbleGame.homeTeam} ${score.bubbleGame.homeScore} \n`;
    }
  });

  console.log(bubbleScores);
  console.log(tweetBlock);

  client.post(
    "statuses/update",
    {
      status: `Bubble Watch Scoreboard
  
${tweetBlock}
  
  #bubblewatch
  `,
    },
    function (error, tweet, response) {
      if (!error) {
        console.log("Tweet Successful");
      }
    }
  );
}

// getScores();
// getTeams();
createDaysBubbleGames(bubbleTeams);
