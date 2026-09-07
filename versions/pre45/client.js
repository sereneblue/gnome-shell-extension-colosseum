const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

const Config = imports.misc.config;
const [major] = Config.PACKAGE_VERSION.split(".");
const SHELL_VER = Number.parseInt(major);
const HTTP_OK = SHELL_VER <= 42 ? Soup.KnownStatusCode.OK : Soup.Status.OK;

function warn(message) {
  console.warn(message);
}

const STATUS = {
  TBD: "0",
  SCHEDULED: "1",
  IN_PROGRESS: "2",
  FINAL: "3",
  FORFEIT: "4",
  CANCELLED: "5",
  POSTPONED: "6",
  DELAYED: "7",
  SUSPENDED: "8",
  FORFEIT_HOME: "9",
  FORFEIT_AWAY: "10",
  RAIN_DELAY: "17",
  BEGIN_PERIOD: "21",
  END_PERIOD: "22",
  HALFTIME: "23",
  OVERTIME: "24",
  FIRST_HALF: "25",
  SECOND_HALF: "26",
  ABANDONED: "27",
  FULLTIME: "28",
  RESCHEDULED: "29",
  START_LIST: "30",
  INTERMEDIATE: "31",
  UNOFFICIAL: "32",
  MEDAL_OFFICIAL: "33",
  GROUPINGS_OFFICIAL: "34",
  PLAY_COMPELTE: "35",
  OFFICIAL_EVENT_SHORTENED: "36",
  CORRECTED_RESULT: "37",
  RETIRED: "38",
  BYE: "39",
  WALKOVER: "40",
  VOID: "41",
  PRELIMINARY: "42",
  GOLDEN_TIME: "43",
  SHOOTOUT: "44",
  FINAL_SCORE_AFTER_EXTRA_TIME: "45",
  FINAL_SCORE_AFTER_GOLDEN_GOAL: "46",
  FINAL_SCORE_AFTER_PENALTIES: "47",
  END_EXTRA_TIME: "48",
  EXTRA_TIME_HALF_TIME: "49",
  FIXTURE_NO_LIVE_COVERAGE: "50",
  FINAL_SCORE_ABANDONED: "51",
};

var ColosseumClient = class ColosseumClient {
  constructor(constants, settings) {
    this.session = new Soup.Session();
    this.session.user_agent = constants.USER_AGENT;
    this.session.timeout = 30;
    this.dateFmt = new Intl.DateTimeFormat("en", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      timeZone: "Etc/UTC",
    });

    let locale = new Intl.DateTimeFormat();
    this.timeFmt = new Intl.DateTimeFormat(
      locale.resolvedOptions().locale === "en-US" ? "en-US" : "en-GB",
      {
        hour: "numeric",
        minute: "numeric",
      },
    );

    this.BASE_API_URL = "https://site.api.espn.com/apis/site/v2/sports/";
    this.API_URLS = {
      Bund: [this.BASE_API_URL + "soccer/ger.1/scoreboard"],
      Bund2: [this.BASE_API_URL + "soccer/ger.2/scoreboard"],
      "CONCACAF Gold Cup": [
        this.BASE_API_URL + "soccer/concacaf.gold/scoreboard",
        this.BASE_API_URL + "soccer/concacaf.gold_qual/scoreboard",
      ],
      "Copa America": [
        this.BASE_API_URL + "soccer/conmebol.america/scoreboard",
      ],
      UCL: [this.BASE_API_URL + "soccer/uefa.champions/scoreboard"],
      "English League Championship": [
        this.BASE_API_URL + "soccer/eng.2/scoreboard",
      ],
      "English League One": [this.BASE_API_URL + "soccer/eng.3/scoreboard"],
      EPL: [this.BASE_API_URL + "soccer/eng.1/scoreboard"],
      ISR: [this.BASE_API_URL + "soccer/isr.1/scoreboard"],
      "FA Cup": [this.BASE_API_URL + "soccer/eng.fa/scoreboard"],
      "FIFA World Cup": [this.BASE_API_URL + "soccer/fifa.world/scoreboard"],
      LaLiga: [this.BASE_API_URL + "soccer/esp.1/scoreboard"],
      "Leagues Cup": [
        this.BASE_API_URL + "soccer/concacaf.leagues.cup/scoreboard",
      ],
      "Ligue 1": [this.BASE_API_URL + "soccer/fra.1/scoreboard"],
      MLB: [this.BASE_API_URL + "baseball/mlb/scoreboard"],
      MLS: [this.BASE_API_URL + "soccer/usa.1/scoreboard"],
      NBA: [this.BASE_API_URL + "basketball/nba/scoreboard"],
      NCAAF: [this.BASE_API_URL + "football/college-football/scoreboard"],
      NCAAM: [
        this.BASE_API_URL + "basketball/mens-college-basketball/scoreboard",
      ],
      NCAAW: [
        this.BASE_API_URL + "basketball/womens-college-basketball/scoreboard",
      ],
      NFL: [this.BASE_API_URL + "football/nfl/scoreboard"],
      NHL: [this.BASE_API_URL + "hockey/nhl/scoreboard"],
      "Serie A": [this.BASE_API_URL + "soccer/ita.1/scoreboard"],
      "UEFA Champions League": [
        this.BASE_API_URL + "soccer/uefa.champions/scoreboard",
        this.BASE_API_URL + "soccer/uefa.champions_qual/scoreboard",
      ],
      "UEFA Europa Conference League": [
        this.BASE_API_URL + "soccer/uefa.europa.conf/scoreboard",
        this.BASE_API_URL + "soccer/uefa.europa.conf_qual/scoreboard",
      ],
      "UEFA Europa League": [
        this.BASE_API_URL + "soccer/uefa.europa/scoreboard",
        this.BASE_API_URL + "soccer/uefa.europa_qual/scoreboard",
      ],
      "UEFA European Championship": [
        this.BASE_API_URL + "soccer/uefa.euro/scoreboard",
        this.BASE_API_URL + "soccer/uefa.euroq/scoreboard",
      ],
      "UEFA Women's Champions League": [
        this.BASE_API_URL + "soccer/uefa.wchampions/scoreboard",
      ],
      WNBA: [this.BASE_API_URL + "basketball/wnba/scoreboard"],
      "ATP": [this.BASE_API_URL + "tennis/atp/scoreboard"],
      "WTA": [this.BASE_API_URL + "tennis/wta/scoreboard"],
    };

    this._CONSTANTS = constants;
    this._leagues = Object.keys(this._CONSTANTS.PREF_LEAGUES);
    this._tournaments = Object.keys(this._CONSTANTS.PREF_TOURNAMENTS);
    this._settings = settings;

    if (SHELL_VER >= 43) {
      this._decoder = new TextDecoder();
    }
  }

  getLeagueScoreboard(league, date, cacheBuster) {
    if (!this.API_URLS[league]) {
      warn(`colosseum: no API URL configured for league "${league}"`);
      return Promise.resolve([]);
    }

    let urls = this.API_URLS[league].map(
      (l) => `${l}?limit=1000&dates=${date}&${cacheBuster}`,
    );

    let requests = [];

    for (let i = 0; i < urls.length; i++) {
      let message = Soup.Message.new("GET", urls[i]);

      if (!message) {
        warn(`colosseum: failed to build request for URL "${urls[i]}"`);
        continue;
      }

      message.request_headers.replace(
        "Accept",
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      );
      message.request_headers.replace("Accept-Language", "en-US,en;q=0.5");

      requests.push(
        new Promise((resolve) => {
          if (SHELL_VER <= 42) {
            this.session.queue_message(message, () => {
              try {
                if (message.status_code === HTTP_OK) {
                  resolve(JSON.parse(message.response_body.data));
                } else {
                  warn(
                    `colosseum: request to "${urls[i]}" failed with status ${message.status_code}`,
                  );
                  resolve([]);
                }
              } catch (e) {
                warn(`colosseum: request to "${urls[i]}" failed: ${e}`);
                resolve([]);
              }
            });
          } else {
            try {
              this.session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                function (session, res) {
                  try {
                    let data = session.send_and_read_finish(res);

                    if (
                      !data ||
                      message.status_code !== HTTP_OK
                    ) {
                      warn(
                        `colosseum: request to "${urls[i]}" failed with status ${message.status_code}`,
                      );
                      resolve([]);
                      return;
                    }

                    resolve(JSON.parse(this._decoder.decode(data.toArray())));
                  } catch (e) {
                    warn(`colosseum: request to "${urls[i]}" failed: ${e}`);
                    resolve([]);
                  }
                }.bind(this),
              );
            } catch (e) {
              warn(`colosseum: request to "${urls[i]}" failed: ${e}`);
              resolve([]);
            }
          }
        }),
      );
    }

    return Promise.all(requests);
  }

  async getScores() {
    let scoreboardDate = new Date();

    // show previous day's scores until 7:00 UTC
    let utcHour = scoreboardDate.getUTCHours();
    if (utcHour < 7) {
      scoreboardDate.setUTCHours(utcHour - 8);
    }

    let events = [];

    let leagues = this.getEnabledLeagues();
    let tournaments = this.getEnabledTournaments();
    let followOnlyMode = this.isFollowOnlyEnabled();

    for (let i = 0; i < leagues.length; i++) {
      let l = {
        league: leagues[i],
        games: [],
        following: [],
      };

      let followedTeams = this.getFollowedTeams(leagues[i]);

      try {
        let data = await this.getLeagueScoreboard(
          l.league,
          this.getDate(scoreboardDate),
          scoreboardDate.getTime(),
        );

        for (let j = 0; j < data.length; j++) {
          let events = data[j] && data[j].events ? data[j].events : [];

          for (let k = 0; k < events.length; k++) {
            let e = this.parseEvent(events[k]);

            if (!e) {
              continue;
            }

            let isFollowedTeam = [e.home.id, e.away.id].some(
              (t) => followedTeams.indexOf(t) >= 0,
            );

            if (followOnlyMode) {
              if (isFollowedTeam) l.games.push(e);
            } else {
              l.games.push(e);
            }

            if (isFollowedTeam && e.live) {
              l.following.push(
                `${e.home.teamAbbr}  ${e.home.score} - ${e.away.score}  ${e.away.teamAbbr} [${e.meta}]`,
              );
            }
          }
        }
      } catch (error) {
        warn(
          `colosseum: failed to load scoreboard for league "${l.league}": ${error}`,
        );
      }

      l.games = this.sortGamesByLive(l.games);

      if (l.games.length) {
        events.push(l);
      }
    }

    for (let i = 0; i < tournaments.length; i++) {
      let l = {
        league: tournaments[i],
        games: [],
        following: [],
      };

      try {
        let data = await this.getLeagueScoreboard(
          l.league,
          this.getDate(scoreboardDate),
          scoreboardDate.getTime(),
        );

        for (let j = 0; j < data.length; j++) {
          let events = data[j] && data[j].events ? data[j].events : [];

          for (let k = 0; k < events.length; k++) {
            if (this._isTennis(l.league)) {
              // tennis scoreboards return whole tournaments; flatten to matches
              let matches = this.parseTennisEvent(
                events[k],
                this.getDate(scoreboardDate),
                l.league === "ATP" ? "mens-singles" : "womens-singles",
              );
              for (let m = 0; m < matches.length; m++) {
                l.games.push(matches[m]);
              }
            } else {
              let e = this.parseEvent(events[k]);

              if (e) {
                l.games.push(e);
              }
            }
          }
        }
      } catch (error) {
        warn(
          `colosseum: failed to load scoreboard for tournament "${l.league}": ${error}`,
        );
      }

      l.games = this.sortGamesByLive(l.games);

      if (l.games.length) {
        events.push(l);
      }
    }

    return events;
  }

  getDate(date) {
    let parts = this.dateFmt.format(date).split("/");
    return parts[2] + parts[0] + parts[1];
  }

  sortGamesByLive(games) {
    let live = [];
    let rest = [];

    for (let i = 0; i < games.length; i++) {
      if (games[i].live) {
        live.push(games[i]);
      } else {
        rest.push(games[i]);
      }
    }

    // live games first, everything else in the original (ESPN) order
    return live.concat(rest);
  }

  _formatEventTime(dateStr) {
    let date = dateStr ? new Date(dateStr) : null;

    if (!date || isNaN(date.getTime())) {
      return null;
    }

    return this.timeFmt.format(date);
  }

  parseEvent(evt) {
    if (
      !evt ||
      !evt.status ||
      !evt.status.type ||
      !evt.competitions ||
      !evt.competitions[0] ||
      !evt.competitions[0].competitors
    ) {
      return null;
    }

    let home = evt.competitions[0].competitors.find(
      (c) => c.homeAway === "home",
    );
    let away = evt.competitions[0].competitors.find(
      (c) => c.homeAway === "away",
    );

    if (!home || !away) {
      return null;
    }

    let event = {};

    let gameLink = evt.links.filter(
      (l) => l.text === "Gamecast" || l.text === "Summary",
    )[0];

    event.live = false;
    event.link = gameLink ? gameLink.href : null;
    event.isComplete = evt.status.type.completed;
    event.home = {};
    event.home.id = home.id;
    event.home.team = home.team.shortDisplayName;
    event.home.teamAbbr = home.team.abbreviation;
    event.home.score = home.score;
    event.home.isWinner = "winner" in home ? home.winner : false;
    event.home.isLoser =
      "winner" in home ? (home.winner === false ? true : false) : false;

    event.away = {};
    event.away.id = away.id;
    event.away.team = away.team.shortDisplayName;
    event.away.teamAbbr = away.team.abbreviation;
    event.away.score = away.score;
    event.away.isWinner = "winner" in away ? away.winner : false;
    event.away.isLoser =
      "winner" in away ? (away.winner === false ? true : false) : false;

    if (
      evt.status.type.id === STATUS.SCHEDULED ||
      evt.status.type.id === STATUS.DELAYED ||
      evt.status.type.id === STATUS.RAIN_DELAY
    ) {
      event.home.score = "";
      event.away.score = "";
      event.meta =
        this._formatEventTime(evt.date) || evt.status.type.shortDetail || "";
    } else if (
      evt.status.type.id === STATUS.FINAL ||
      evt.status.type.id === STATUS.FINAL_SCORE_ABANDONED ||
      evt.status.type.id === STATUS.FINAL_SCORE_AFTER_PENALTIES ||
      evt.status.type.id === STATUS.FINAL_SCORE_AFTER_EXTRA_TIME ||
      evt.status.type.id === STATUS.FINAL_SCORE_AFTER_GOLDEN_GOAL ||
      evt.status.type.id === STATUS.WALKOVER
    ) {
      event.meta = "Final";
    } else if (
      evt.status.type.id === STATUS.IN_PROGRESS ||
      evt.status.type.id === STATUS.BEGIN_PERIOD ||
      evt.status.type.id === STATUS.END_PERIOD ||
      evt.status.type.id === STATUS.HALFTIME ||
      evt.status.type.id === STATUS.OVERTIME ||
      evt.status.type.id === STATUS.FIRST_HALF ||
      evt.status.type.id === STATUS.SECOND_HALF ||
      evt.status.type.id === STATUS.SHOOTOUT ||
      evt.status.type.id === STATUS.GOLDEN_TIME ||
      evt.status.type.id === STATUS.INTERMEDIATE ||
      evt.status.type.id === STATUS.EXTRA_TIME_HALF_TIME ||
      evt.status.type.id === STATUS.FIXTURE_NO_LIVE_COVERAGE
    ) {
      event.live = true;
      event.meta = evt.status.type.shortDetail || "";
    } else if (evt.status.type.id === STATUS.POSTPONED) {
      event.isComplete = true;
      event.meta = "Post";
    } else if (evt.status.type.id === STATUS.SUSPENDED) {
      event.isComplete = true;
      event.meta = "Susp";
    } else {
      event.home.score = event.isComplete ? home.score : "";
      event.away.score = event.isComplete ? away.score : "";
      event.meta = evt.status.type.shortDetail || "";
    }

    return event;
  }

  _isTennis(league) {
    return league === "ATP" || league === "WTA";
  }

  // Tennis scoreboards return whole tournaments (an `event` = tournament) with
  // all of their matches nested under `groupings[].competitions[]`. Flatten
  // those into individual "games" so they render like any other league.
  parseTennisEvent(evt, queryDate, drawSlug) {
    let link = null;

    for (let i = 0; i < (evt.links || []).length; i++) {
      if (
        evt.links[i].rel &&
        evt.links[i].rel.indexOf("summary") >= 0
      ) {
        link = evt.links[i].href;
        break;
      }
    }

    let games = [];

    for (let i = 0; i < (evt.groupings || []).length; i++) {
      let competitions = evt.groupings[i].competitions || [];

      for (let j = 0; j < competitions.length; j++) {
        // A grand slam event carries every draw (men's/women's singles and
        // doubles) regardless of tour slug, so keep only the requested draw.
        if (competitions[j].type && competitions[j].type.slug !== drawSlug) {
          continue;
        }

        let match = this.parseTennisMatch(competitions[j], link, queryDate);
        if (match) {
          games.push(match);
        }
      }
    }

    return games;
  }

  parseTennisMatch(comp, link, queryDate) {
    if (
      !comp ||
      !comp.status ||
      !comp.status.type ||
      !comp.competitors ||
      comp.competitors.length < 2
    ) {
      return null;
    }

    let status = comp.status.type;
    let isLive = status.id === STATUS.IN_PROGRESS;

    // An entire tournament's draw is returned for the week, so only keep
    // matches that are live right now or scheduled/finished on the queried
    // day. Canceled matches fall through to the other statuses below.
    if (!isLive) {
      let date =
        (comp.date || "").slice(0, 4) +
        (comp.date || "").slice(5, 7) +
        (comp.date || "").slice(8, 10);

      if (date !== queryDate) {
        return null;
      }
    }

    let competitors = comp.competitors;
    let home = competitors.find((c) => c.homeAway === "home");
    let away = competitors.find((c) => c.homeAway === "away");

    if (!home) {
      home = competitors[0];
    }
    if (!away) {
      away = competitors[competitors.length - 1];
    }

    let setsWon = (competitor) => {
      let sets = 0;
      for (let i = 0; i < (competitor.linescores || []).length; i++) {
        if (competitor.linescores[i].winner === true) {
          sets++;
        }
      }
      return sets;
    };

    let homeSets = setsWon(home);
    let awaySets = setsWon(away);

    let homeWon = "winner" in home ? home.winner === true : homeSets > awaySets;
    let awayWon = "winner" in away ? away.winner === true : awaySets > homeSets;
    let homeLost =
      "winner" in home ? home.winner === false : homeSets < awaySets;
    let awayLost =
      "winner" in away ? away.winner === false : awaySets < homeSets;

    let round = this._getTennisRound(comp.round);
    let prefix = round ? `${round} \u00B7 ` : "";
    let meta;

    if (status.id === STATUS.SCHEDULED) {
      meta =
        prefix +
        (comp.timeValid === false
          ? "TBD"
          : this._formatEventTime(comp.date) || "TBD");
    } else if (status.id === STATUS.IN_PROGRESS) {
      meta = prefix + (status.detail || status.shortDetail);
    } else if (status.id === STATUS.FINAL) {
      meta = prefix + "Final";
    } else if (status.id === STATUS.RETIRED) {
      meta = prefix + "Retired";
    } else if (status.id === STATUS.CANCELLED) {
      meta = prefix + "Canceled";
    } else {
      meta =
        prefix +
        (status.detail ||
          status.shortDetail ||
          status.description ||
          status.name ||
          "");
    }

    let event = {
      live: isLive,
      link: link,
      isComplete: status.completed === true || status.state === "post",
      home: {
        id: home.id,
        team:
          (home.athlete &&
            (home.athlete.shortName ||
              home.athlete.displayName ||
              home.athlete.fullName)) ||
          "TBD",
        teamAbbr: home.athlete ? home.athlete.shortName || "" : "",
        score:
          status.id === STATUS.SCHEDULED || status.id === STATUS.CANCELLED
            ? ""
            : String(homeSets),
        isWinner: homeWon,
        isLoser: homeLost,
      },
      away: {
        id: away.id,
        team:
          (away.athlete &&
            (away.athlete.shortName ||
              away.athlete.displayName ||
              away.athlete.fullName)) ||
          "TBD",
        teamAbbr: away.athlete ? away.athlete.shortName || "" : "",
        score:
          status.id === STATUS.SCHEDULED || status.id === STATUS.CANCELLED
            ? ""
            : String(awaySets),
        isWinner: awayWon,
        isLoser: awayLost,
      },
      meta: meta,
    };

    return event;
  }

  _getTennisRound(round) {
    if (!round) {
      return "";
    }

    // ESPN's round ids are a stable enum: 1-4 are the main draw rounds,
    // 5/6/7 the finals stages and 11+ the qualifying draw.
    let roundNames = {
      "1": "R1",
      "2": "R2",
      "3": "R3",
      "4": "R4",
      "5": "QF",
      "6": "SF",
      "7": "F",
      "11": "QR1",
      "12": "QR2",
      "13": "QR3",
      "14": "QRF",
    };

    let abbr = roundNames[String(round.id)];
    if (abbr) {
      return abbr;
    }

    // Unknown or missing round ids (round robin, bronze and other formats):
    // fall back to the display name so nothing is lost.
    return round.displayName || "";
  }

  getEnabledLeagues() {
    let leagues = [];

    for (let i = 0; i < this._leagues.length; i++) {
      if (
        this._settings.get_boolean(
          this._CONSTANTS.PREF_LEAGUES[this._leagues[i]],
        )
      ) {
        leagues.push(this._leagues[i]);
      }
    }

    return leagues;
  }

  getEnabledTournaments() {
    let tournaments = [];

    for (let i = 0; i < this._tournaments.length; i++) {
      if (
        this._settings.get_boolean(
          this._CONSTANTS.PREF_TOURNAMENTS[this._tournaments[i]],
        )
      ) {
        tournaments.push(this._tournaments[i]);
      }
    }

    return tournaments;
  }

  getFollowedTeams(league) {
    let teams = [];

    for (let i = 0; i < this._CONSTANTS.SPORTS[league].length; i++) {
      if (this._settings.get_boolean(this._CONSTANTS.SPORTS[league][i].pref)) {
        teams.push(this._CONSTANTS.SPORTS[league][i].id.toString());
      }
    }

    return teams;
  }

  isFollowOnlyEnabled() {
    return this._settings.get_boolean(this._CONSTANTS.PREF_FOLLOWED_ONLY);
  }

  destroy() {
    this.session.abort();
  }
};
