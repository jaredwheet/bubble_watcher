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
  day: 25,
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
    event.competitions[0].competitors.forEach((competitor) => {
      const abbreviation = competitor.team.abbreviation;
      bubbleTeams.forEach((team) => {
        if (team === abbreviation) {
          bubbleGame = {
            teamsLong: event.name,
            teamsShort: event.shortName,
            tipoff: event.date,
            venue: event.competitions[0].venue.fullName,
            city: event.competitions[0].venue.address.city,
            state: event.competitions[0].venue.address.state,
          };
          var index = bubbleScores.findIndex(
            (x) => x.bubbleGame.teamsLong == event.name
          );
          index === -1
            ? bubbleScores.push({ bubbleGame })
            : console.log(`${bubbleGame.teamsLong} already exists`);
        }
      });
    });
  });

  let tweetLongBlock = "";
  let tweetShortBlock = "";

  bubbleScores.forEach((score) => {
    // console.log(score);
    // i++;
    // console.log(i);
    tweetLongBlock += `${score.bubbleGame.teamsLong}\n`;
    tweetShortBlock += `${score.bubbleGame.teamsShort}\n`;
  });

  let tweetBlock = "";
  if (tweetLongBlock.length > 250) {
    tweetBlock = tweetShortBlock;
  }
  if (tweetLongBlock.length <= 250) {
    tweetBlock = tweetLongBlock;
  }

  client.post(
    "statuses/update",
    {
      status: `Today's Bubble Games to Watch
  
${tweetBlock}
  
  #bubblewatch
  `,
    },
    function (error, tweet, response) {
      if (!error) {
        console.log("Tweet Successful");
      } else {
        console.log(error);
      }
    }
  );
  // console.log(bubbleScores);
}

// getScores();
// getTeams();
createDaysBubbleGames(bubbleTeams);
