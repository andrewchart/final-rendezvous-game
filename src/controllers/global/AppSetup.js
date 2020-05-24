
// Game Prefix
const GAME_PREFIX = process.env.REACT_APP_PREFIX;

// Game Expiry Time
const MILLISECONDS_IN_A_DAY = 86400000;
const GAME_EXPIRY = parseFloat(process.env.REACT_APP_GAME_EXPIRES_AFTER_DAYS) *
                    MILLISECONDS_IN_A_DAY;

/**
 * The AppSetup controller performs general tasks when the user first instantiates
 * the app e.g. cleaning up localStorage entries.
 */
export default class AppSetup {

  /**
   * When players are added to games, we create a localStorage entry which
   * associates the local player with their playerId for each game they are
   * currently a player in. See: `/controllers/GameHost.js`.
   *
   * This utility looks in localStorage for player/game associations which are
   * older than the expiry date of the game, and deletes them to avoid clogging
   * up localStorage with redundant entries.
   * @return {undefined}
   */
  removeOldPlayerIdAssociations() {

    // Get the localStorage keys with the playerId prefixes
    let playerIdAssocs = Object.keys(localStorage).filter(key => {
      const search = GAME_PREFIX + 'playerId_';
      return key.substr(0,search.length) === search;
    });

    // Iterate through the keys, checking the dates they were created. Delete
    // keys that are old enough that they will relate to expired games.
    return playerIdAssocs.forEach(key => {
      let entry = JSON.parse(localStorage.getItem(key));

      const now = new Date();
      const createDate = entry.date;

      if (now - Date.parse(createDate) > GAME_EXPIRY) {
        localStorage.removeItem(key);
      }
    });

  }
}
