var PREF_UPDATE_FREQ = "update-frequency";
var PREF_FOLLOWED_ONLY = "followed-only";

var PREF_LEAGUES = {
    Bund: "bund-enabled",
    UCL: "ucl-enabled",
    EPL: "epl-enabled",
    LaLiga: "laliga-enabled",
    "Ligue 1": "ligue1-enabled",
    MLB: "mlb-enabled",
    NBA: "nba-enabled",
    NFL: "nfl-enabled",
    NHL: "nhl-enabled",
    "Serie A": "seriea-enabled",
    WNBA: "wnba-enabled"
};

var PREF_TOURNAMENTS = {
  "CONCACAF Gold Cup": "concacafgold-enabled",
  "Copa America": "conmebol-enabled",
  "UEFA Champions League": "uefachampions-enabled",
  "UEFA European Championship": "uefaeuro-enabled"
};

var SPORTS = {
  Bund: [
    { id: 2506, name: "Arminia Bielefeld", pref: "bund-dsc" },
    { id: 131, name: "Bayer Leverkusen", pref: "bund-lev" },
    { id: 132, name: "Bayern Munich", pref: "bund-mun" },
    { id: 124, name: "Borussia Dortmund", pref: "bund-dor" },
    { id: 268, name: "Borussia Monchengladbach", pref: "bund-mon" },
    { id: 125, name: "Eintracht Frankfurt", pref: "bund-einf" },
    { id: 3841, name: "FC Augsburg", pref: "bund-aug" },
    { id: 122, name: "FC Cologne", pref: "bund-col" },
    { id: 598, name: "FC Union Berlin", pref: "bund-fcub" },
    { id: 129, name: "Hertha Berlin", pref: "bund-hert" },
    { id: 2950, name: "Mainz", pref: "bund-main" },
    { id: 11420, name: "RB Leipzig", pref: "bund-lei" },
    { id: 126, name: "SC Freiburg", pref: "bund-frei" },
    { id: 133, name: "Schalke 04", pref: "bund-scha" },
    { id: 7911, name: "TSG Hoffenheim", pref: "bund-hof" },
    { id: 134, name: "VfB Stuttgart", pref: "bund-stu" },
    { id: 138, name: "VfL Wolfsburg", pref: "bund-wolf" },
    { id: 137, name: "Werder Bremen", pref: "bund-wer" }
  ],
  UCL: [
    { id: 139, name: "Ajax Amsterdam", pref: "ucl-aja" },
    { id: 105, name: "Atalanta", pref: "ucl-ata" },
    { id: 83, name: "Barcelona", pref: "ucl-bar" },
    { id: 132, name: "Bayern Munich", pref: "ucl-mun" },
    { id: 124, name: "Borussia Dortmund", pref: "ucl-dor" },
    { id: 268, name: "Borussia Monchengladbach", pref: "ucl-mon" },
    { id: 363, name: "Chelsea", pref: "ucl-che" },
    { id: 570, name: "Club Brugge", pref: "ucl-brug" },
    { id: 440, name: "Dynamo Kiev", pref: "ucl-kiev" },
    { id: 572, name: "FC Midtjylland", pref: "ucl-midt" },
    { id: 437, name: "FC Porto", pref: "ucl-por" },
    { id: 110, name: "Internazionale", pref: "ucl-int" },
    { id: 111, name: "Juventus", pref: "ucl-juv" },
    { id: 112, name: "Lazio", pref: "ucl-laz" },
    { id: 364, name: "Liverpool", pref: "ucl-livs" },
    { id: 442, name: "Lokomotiv Moscow", pref: "ucl-lmo" },
    { id: 382, name: "Manchester City", pref: "ucl-mnc" },
    { id: 360, name: "Manchester United", pref: "ucl-man" },
    { id: 176, name: "Marseille", pref: "ucl-mar" },
    { id: 435, name: "Olympiakos", pref: "ucl-oly" },
    { id: 160, name: "Paris Saint-Germain", pref: "ucl-psg" },
    { id: 86, name: "Real Madrid", pref: "ucl-mad" },
    { id: 243, name: "Sevilla FC", pref: "ucl-sev" },
    { id: 493, name: "Shakhtar Donetsk", pref: "ucl-shk" },
    { id: 169, name: "Stade Rennes", pref: "ucl-renn" }
  ],
  EPL: [
    { id: 359, name: "Arsenal", pref: "epl-ars" },
    { id: 362, name: "Aston Villa", pref: "epl-avl" },
    { id: 331, name: "Brighton & Hove Albion", pref: "epl-bha" },
    { id: 379, name: "Burnley", pref: "epl-bur" },
    { id: 363, name: "Chelsea", pref: "epl-che" },
    { id: 384, name: "Crystal Palace", pref: "epl-cry" },
    { id: 368, name: "Everton", pref: "epl-eve" },
    { id: 370, name: "Fulham", pref: "epl-ful" },
    { id: 357, name: "Leeds United", pref: "epl-lee" },
    { id: 375, name: "Leicester City", pref: "epl-lei" },
    { id: 364, name: "Liverpool", pref: "epl-liv" },
    { id: 382, name: "Manchester City", pref: "epl-mnc" },
    { id: 360, name: "Manchester United", pref: "epl-man" },
    { id: 361, name: "Newcastle United", pref: "epl-new" },
    { id: 398, name: "Sheffield United", pref: "epl-shu" },
    { id: 376, name: "Southampton", pref: "epl-sou" },
    { id: 367, name: "Tottenham Hotspur", pref: "epl-tot" },
    { id: 383, name: "West Bromwich Albion", pref: "epl-wba" },
    { id: 371, name: "West Ham United", pref: "epl-whu" },
    { id: 380, name: "Wolverhampton Wanderers", pref: "epl-wol" }
  ],
  LaLiga: [
    { id: 96, name: "Alavés", pref: "laliga-alv" },
    { id: 93, name: "Athletic Bilbao", pref: "laliga-ath" },
    { id: 1068, name: "Atletico Madrid", pref: "laliga-atl" },
    { id: 83, name: "Barcelona", pref: "laliga-bar" },
    { id: 85, name: "Celta Vigo", pref: "laliga-cel" },
    { id: 3842, name: "Cádiz", pref: "laliga-cad" },
    { id: 3752, name: "Eibar", pref: "laliga-eib" },
    { id: 3751, name: "Elche", pref: "laliga-elc" },
    { id: 2922, name: "Getafe", pref: "laliga-get" },
    { id: 3747, name: "Granada", pref: "laliga-gcf" },
    { id: 5413, name: "Huesca", pref: "laliga-hue" },
    { id: 29, name: "Levante", pref: "laliga-lev" },
    { id: 97, name: "Osasuna", pref: "laliga-osa" },
    { id: 244, name: "Real Betis", pref: "laliga-bet" },
    { id: 86, name: "Real Madrid", pref: "laliga-mad" },
    { id: 89, name: "Real Sociedad", pref: "laliga-rso" },
    { id: 95, name: "Real Valladolid", pref: "laliga-vall" },
    { id: 243, name: "Sevilla FC", pref: "laliga-sev" },
    { id: 94, name: "Valencia", pref: "laliga-val" },
    { id: 102, name: "Villarreal", pref: "laliga-vill" }
  ],
  "Ligue 1": [
    { id: 174, name: "AS Monaco", pref: "ligue1-mon" },
    { id: 7868, name: "Angers", pref: "ligue1-ang" },
    { id: 159, name: "Bordeaux", pref: "ligue1-bor" },
    { id: 6997, name: "Brest", pref: "ligue1-bres" },
    { id: 3170, name: "Dijon FCO", pref: "ligue1-dijo" },
    { id: 175, name: "Lens", pref: "ligue1-rcl" },
    { id: 166, name: "Lille", pref: "ligue1-lill" },
    { id: 273, name: "Lorient", pref: "ligue1-lor" },
    { id: 167, name: "Lyon", pref: "ligue1-lyon" },
    { id: 176, name: "Marseille", pref: "ligue1-mar" },
    { id: 177, name: "Metz", pref: "ligue1-metz" },
    { id: 274, name: "Montpellier", pref: "ligue1-mont" },
    { id: 165, name: "Nantes", pref: "ligue1-nant" },
    { id: 2502, name: "Nice", pref: "ligue1-nice" },
    { id: 7730, name: "Nimes", pref: "ligue1-nim" },
    { id: 160, name: "Paris Saint-Germain", pref: "ligue1-psg" },
    { id: 178, name: "Saint-Etienne", pref: "ligue1-asse" },
    { id: 169, name: "Stade Rennes", pref: "ligue1-renn" },
    { id: 3243, name: "Stade de Reims", pref: "ligue1-reim" },
    { id: 180, name: "Strasbourg", pref: "ligue1-stra" }
  ],
  MLB: [
    { id: 29, name: "Arizona Diamondbacks", pref: "mlb-ari" },
    { id: 15, name: "Atlanta Braves", pref: "mlb-atl" },
    { id: 1, name: "Baltimore Orioles", pref: "mlb-bal" },
    { id: 2, name: "Boston Red Sox", pref: "mlb-bos" },
    { id: 16, name: "Chicago Cubs", pref: "mlb-chc" },
    { id: 4, name: "Chicago White Sox", pref: "mlb-chw" },
    { id: 17, name: "Cincinnati Reds", pref: "mlb-cin" },
    { id: 5, name: "Cleveland Indians", pref: "mlb-cle" },
    { id: 27, name: "Colorado Rockies", pref: "mlb-col" },
    { id: 6, name: "Detroit Tigers", pref: "mlb-det" },
    { id: 18, name: "Houston Astros", pref: "mlb-hou" },
    { id: 7, name: "Kansas City Royals", pref: "mlb-kc" },
    { id: 3, name: "Los Angeles Angels", pref: "mlb-laa" },
    { id: 19, name: "Los Angeles Dodgers", pref: "mlb-lad" },
    { id: 28, name: "Miami Marlins", pref: "mlb-mia" },
    { id: 8, name: "Milwaukee Brewers", pref: "mlb-mil" },
    { id: 9, name: "Minnesota Twins", pref: "mlb-min" },
    { id: 21, name: "New York Mets", pref: "mlb-nym" },
    { id: 10, name: "New York Yankees", pref: "mlb-nyy" },
    { id: 11, name: "Oakland Athletics", pref: "mlb-oak" },
    { id: 22, name: "Philadelphia Phillies", pref: "mlb-phi" },
    { id: 23, name: "Pittsburgh Pirates", pref: "mlb-pit" },
    { id: 25, name: "San Diego Padres", pref: "mlb-sd" },
    { id: 26, name: "San Francisco Giants", pref: "mlb-sf" },
    { id: 12, name: "Seattle Mariners", pref: "mlb-sea" },
    { id: 24, name: "St. Louis Cardinals", pref: "mlb-stl" },
    { id: 30, name: "Tampa Bay Rays", pref: "mlb-tb" },
    { id: 13, name: "Texas Rangers", pref: "mlb-tex" },
    { id: 14, name: "Toronto Blue Jays", pref: "mlb-tor" },
    { id: 20, name: "Washington Nationals", pref: "mlb-wsh" }
  ],
  NBA: [
    { id: 1, name: "Atlanta Hawks", pref: "nba-atl" },
    { id: 2, name: "Boston Celtics", pref: "nba-nos" },
    { id: 17, name: "Brooklyn Nets", pref: "nba-bkn" },
    { id: 30, name: "Charlotte Hornets", pref: "nba-cha" },
    { id: 4, name: "Chicago Bulls", pref: "nba-chi" },
    { id: 5, name: "Cleveland Cavaliers", pref: "nba-cle" },
    { id: 6, name: "Dallas Mavericks", pref: "nba-dal" },
    { id: 7, name: "Denver Nuggets", pref: "nba-den" },
    { id: 8, name: "Detroit Pistons", pref: "nba-det" },
    { id: 9, name: "Golden State Warriors", pref: "nba-gs" },
    { id: 10, name: "Houston Rockets", pref: "nba-hou" },
    { id: 11, name: "Indiana Pacers", pref: "nba-ind" },
    { id: 12, name: "LA Clippers", pref: "nba-lac" },
    { id: 13, name: "Los Angeles Lakers", pref: "nba-lal" },
    { id: 29, name: "Memphis Grizzlies", pref: "nba-mem" },
    { id: 14, name: "Miami Heat", pref: "nba-mia" },
    { id: 15, name: "Milwaukee Bucks", pref: "nba-mil" },
    { id: 16, name: "Minnesota Timberwolves", pref: "nba-min" },
    { id: 3, name: "New Orleans Pelicans", pref: "nba-no" },
    { id: 18, name: "New York Knicks", pref: "nba-ny" },
    { id: 25, name: "Oklahoma City Thunder", pref: "nba-okc" },
    { id: 19, name: "Orlando Magic", pref: "nba-orl" },
    { id: 20, name: "Philadelphia 76ers", pref: "nba-phi" },
    { id: 21, name: "Phoenix Suns", pref: "nba-phx" },
    { id: 22, name: "Portland Trail Blazers", pref: "nba-por" },
    { id: 23, name: "Sacramento Kings", pref: "nba-sac" },
    { id: 24, name: "San Antonio Spurs", pref: "nba-sa" },
    { id: 25, name: "Toronto Raptors", pref: "nba-tor" },
    { id: 26, name: "Utah Jazz", pref: "nba-utah" },
    { id: 27, name: "Washington Wizards", pref: "nba-wsh" },
  ],
  NFL: [
    { id: 22, name: "Arizona Cardinals", pref: "nfl-ari" },
    { id: 1, name: "Atlanta Falcons", pref: "nfl-atl" },
    { id: 33, name: "Baltimore Ravens", pref: "nfl-bal" },
    { id: 2, name: "Buffalo Bills", pref: "nfl-buf" },
    { id: 29, name: "Carolina Panthers", pref: "nfl-car" },
    { id: 3, name: "Chicago Bears", pref: "nfl-chi" },
    { id: 4, name: "Cincinnati Bengals", pref: "nfl-cin" },
    { id: 5, name: "Cleveland Browns", pref: "nfl-cli" },
    { id: 6, name: "Dallas Cowboys", pref: "nfl-dal" },
    { id: 7, name: "Denver Broncos", pref: "nfl-den" },
    { id: 8, name: "Detroit Lions", pref: "nfl-det" },
    { id: 9, name: "Green Bay Packers", pref: "nfl-gb" },
    { id: 34, name: "Houston Texans", pref: "nfl-hou" },
    { id: 11, name: "Indianapolis Colts", pref: "nfl-ind" },
    { id: 30, name: "Jacksonville Jaguars", pref: "nfl-jax" },
    { id: 12, name: "Kansas City Chiefs", pref: "nfl-kc" },
    { id: 13, name: "Las Vegas Raiders", pref: "nfl-lv" },
    { id: 24, name: "Los Angeles Chargers", pref: "nfl-lac" },
    { id: 14, name: "Los Angeles Rams", pref: "nfl-lar" },
    { id: 15, name: "Miami Dolphins", pref: "nfl-mia" },
    { id: 16, name: "Minnesota Vikings", pref: "nfl-min" },
    { id: 17, name: "New England Patriots", pref: "nfl-ne" },
    { id: 18, name: "New Orleans Saints", pref: "nfl-no" },
    { id: 19, name: "New York Giants", pref: "nfl-nyg" },
    { id: 20, name: "New York Jets", pref: "nfl-nyj" },
    { id: 21, name: "Philadelphia Eagles", pref: "nfl-phi" },
    { id: 23, name: "Pittsburgh Steelers", pref: "nfl-pit" },
    { id: 25, name: "San Francisco 49ers", pref: "nfl-sf" },
    { id: 26, name: "Seattle Seahawks", pref: "nfl-sea" },
    { id: 27, name: "Tampa Bay Buccaneers", pref: "nfl-tb" },
    { id: 10, name: "Tennessee Titans", pref: "nfl-ten" },
    { id: 28, name: "Washington", pref: "nfl-wsh" }
  ],
  NHL: [
    { id: 25, name: "Anaheim Ducks", pref: "nhl-ana" },
    { id: 24, name: "Arizona Coyotes", pref: "nhl-ari" },
    { id: 1, name: "Boston Bruins", pref: "nhl-bos" },
    { id: 2, name: "Buffalo Sabres", pref: "nhl-buf" },
    { id: 3, name: "Calgary Flames", pref: "nhl-cgy" },
    { id: 7, name: "Carolina Hurricanes", pref: "nhl-car" },
    { id: 4, name: "Chicago Blackhawks", pref: "nhl-chi" },
    { id: 17, name: "Colorado Avalanche", pref: "nhl-col" },
    { id: 29, name: "Columbus Blue Jackets", pref: "nhl-cbj" },
    { id: 9, name: "Dallas Stars", pref: "nhl-dal" },
    { id: 5, name: "Detroit Red Wings", pref: "nhl-det" },
    { id: 6, name: "Edmonton Oilers", pref: "nhl-edm" },
    { id: 26, name: "Florida Panthers", pref: "nhl-fla" },
    { id: 8, name: "Los Angeles Kings", pref: "nhl-la" },
    { id: 30, name: "Minnesota Wild", pref: "nhl-min" },
    { id: 10, name: "Montreal Canadiens", pref: "nhl-mtl" },
    { id: 27, name: "Nashville Predators", pref: "nhl-nsh" },
    { id: 11, name: "New Jersey Devils", pref: "nhl-nj" },
    { id: 12, name: "New York Islanders", pref: "nhl-nyi" },
    { id: 13, name: "New York Rangers", pref: "nhl-nyr" },
    { id: 14, name: "Ottawa Senators", pref: "nhl-ott" },
    { id: 15, name: "Philadelphia Flyers", pref: "nhl-phi" },
    { id: 16, name: "Pittsburgh Penguins", pref: "nhl-pit" },
    { id: 18, name: "San Jose Sharks", pref: "nhl-sj" },
    { id: 19, name: "St. Louis Blues", pref: "nhl-stl" },
    { id: 20, name: "Tampa Bay Lightning", pref: "nhl-tb" },
    { id: 21, name: "Toronto Maple Leafs", pref: "nhl-tor" },
    { id: 22, name: "Vancouver Canucks", pref: "nhl-van" },
    { id: 37, name: "Vegas Golden Knights", pref: "nhl-vgs" },
    { id: 23, name: "Washington Capitals", pref: "nhl-wsh" },
    { id: 28, name: "Winnipeg Jets", pref: "nhl-wpg" }
  ],
  "Serie A": [
    { id: 103, name: "AC Milan", pref: "seriea-mil" },
    { id: 104, name: "AS Roma", pref: "seriea-roma" },
    { id: 105, name: "Atalanta", pref: "seriea-ata" },
    { id: 4059, name: "Benevento", pref: "seriea-ben" },
    { id: 107, name: "Bologna", pref: "seriea-bol" },
    { id: 2925, name: "Cagliari", pref: "seriea-cag" },
    { id: 3173, name: "Crotone", pref: "seriea-cro" },
    { id: 109, name: "Fiorentina", pref: "seriea-fio" },
    { id: 3263, name: "Genoa", pref: "seriea-gen" },
    { id: 119, name: "Hellas Verona", pref: "seriea-ver" },
    { id: 110, name: "Internazionale", pref: "seriea-int" },
    { id: 111, name: "Juventus", pref: "seriea-juv" },
    { id: 112, name: "Lazio", pref: "seriea-laz" },
    { id: 114, name: "Napoli", pref: "seriea-nap" },
    { id: 115, name: "Parma", pref: "seriea-par" },
    { id: 2734, name: "Sampdoria", pref: "seriea-samp" },
    { id: 3997, name: "Sassuolo", pref: "seriea-sas" },
    { id: 4056, name: "Spezia", pref: "seriea-spez" },
    { id: 239, name: "Torino", pref: "seriea-tor" },
    { id: 118, name: "Udinese", pref: "seriea-udn" }
  ],
  WNBA: [
    { id: 20, name: "Atlanta Dream", pref: "wnba-atl" },
    { id: 19, name: "Chicago Sky", pref: "wnba-chi" },
    { id: 18, name: "Connecticut Sun", pref: "wnba-conn" },
    { id: 3, name: "Dallas Wings", pref: "wnba-dal" },
    { id: 5, name: "Indiana Fever", pref: "wnba-ind" },
    { id: 17, name: "Las Vegas Aces", pref: "wnba-lv" },
    { id: 6, name: "Los Angeles Sparks", pref: "wnba-la" },
    { id: 8, name: "Minnesota Lynx", pref: "wnba-min" },
    { id: 9, name: "New York Liberty", pref: "wnba-ny" },
    { id: 11, name: "Phoenix Mercury", pref: "wnba-phx" },
    { id: 14, name: "Seattle Storm", pref: "wnba-sea" },
    { id: 16, name: "Washington Mystics", pref: "wnba-wsh" }
  ],
};