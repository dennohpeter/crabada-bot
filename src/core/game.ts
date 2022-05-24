import { utils } from 'ethers';
import { schedule } from 'node-cron';
import { config, TeamConfig } from '../config';
import { gameContract } from '../contract';
import { api } from '../api';
import { Mine, Process, Team, TEAM_ROLE } from '../types';
import { sendMessage } from '../integration';
import { displayRemainingTime, displayTable, formatDate } from '../helpers';

class GameWrapper {
  private readonly teamManager: Map<number, Team>;
  private readonly mineManager: Map<number, Mine>;
  private logs: string;
  private explorerUrl: string;
  constructor() {
    this.teamManager = new Map();
    this.mineManager = new Map();
    this.logs = '';
    this.explorerUrl = config.TEST_MODE
      ? config.TESTNET_EXPLORER
      : config.MAINNET_EXPLORER;
  }
  start = async () => {
    sendMessage('Starting bot at ' + formatDate(Date.now()));

    schedule(
      `*/${config.CHECK_INTERVAL} * * * * *`,
      async () => {
        console.log(`-----`.repeat(10));
        // Check for free teams
        console.info(`Checking for free teams....`);
        const teams = await api.fetchTeams({
          user_address: config.PUBLIC_KEY,
          page: 1,
          limit: 300,
          is_team_available: 1,
        });
        if (teams.length > 0) {
          // Deploy the free team to a mining or looting expedition
          teams.forEach(async (team) => {
            if (!this.teamManager.has(team.team_id)) {
              console.log(`-----`.repeat(10));
              this.logs = `Found a new free team, Team ${team.team_id} ✔️`;
              console.log(this.logs);
              sendMessage(this.logs);

              this.teamManager.set(team.team_id, team);
              console.log(`-----`.repeat(2));
              let teamRole = TeamConfig[team.team_id] || TEAM_ROLE.MINE;

              // TODO check other things like looting points left if teamRole is LOOT
              // if no looting points left, then change to mining

              if (teamRole === TEAM_ROLE.MINE) {
                await this.deployTeamToMine(team);
              } else {
                await this.deployTeamToLoot(team);
              }
            }
          });
        } else {
          console.log(`-----`.repeat(2));
          console.info(`No free teams found!`);
          console.log(`-----`.repeat(10));
        }

        ////////////////////////////////////////////////////////////////////////////////
        //            CHECK TEAM STATUS - ACTIVITY - PROGRESS
        ////////////////////////////////////////////////////////////////////////////////
        console.log(`-----`.repeat(10));
        console.info(`Checking for active mines....`);
        let mines = await api.fetchMines({
          user_address: config.PUBLIC_KEY,
          status: 'open',
          page: 1,
          limit: 100,
        });

        if (mines.length > 0) {
          console.log(`-----`.repeat(2));
          mines.map((mine) => this._manageMine(mine));
        } else {
          console.log(`-----`.repeat(2));
          console.info(`No active mines found!`);
          console.log(`-----`.repeat(10));
        }

        console.log(`-----`.repeat(10));
        console.info(`Checking for active lootings....`);
        let loots = await api.fetchLootings({
          looter_address: config.PUBLIC_KEY,
          status: 'open',
          page: 1,
          limit: 100,
        });

        if (loots.length > 0) {
          loots.map((loot) => this._manageLooting(loot));
          console.log(`-----`.repeat(2));
        } else {
          console.log(`-----`.repeat(2));
          console.info(`No active lootings found!`);
          console.log(`-----`.repeat(10));
        }
      },
      {
        scheduled: true,
        timezone: 'Africa/Nairobi',
      }
    );
  };

  private deployTeamToMine = async (team: Team) => {
    this.logs = `Deploying team ${team.team_id} to a mining expedition...`;
    console.log(this.logs);
    sendMessage(this.logs);
    gameContract
      .startGame(team.team_id)
      .then((tx) => {
        if (tx?.hash) {
          console.log(`-----`.repeat(2));
          this.logs = `Deployed team ${team.team_id} to a mining expedition! ✔️`;
          this.logs += `\nHash: [${tx.hash.toUpperCase()}](${
            this.explorerUrl
          }/tx/${tx.hash})`;
          console.log(this.logs);
          sendMessage(this.logs);
          console.log(`-----`.repeat(10));
        }
        //  remove game track list
        this.teamManager.delete(team.team_id);
      })
      .catch((err) => {
        console.log(`-----`.repeat(2));
        let msg = '';

        try {
          let error = JSON.parse(JSON.stringify(err));
          console.log({
            error,
          });
          msg = error.reason || JSON.parse(error?.body).error?.message || err;
        } catch (e) {
          msg = err;
        }
        this.logs = `Error while deploying team ${team.team_id}, ${msg}`;
        console.error(this.logs);
        sendMessage(this.logs);
        //  remove team from track list
        this.teamManager.delete(team.team_id);
        console.log(`-----`.repeat(10));
      });
  };

  private deployTeamToLoot = async (team: Team) => {
    throw new Error('Method not implemented.');
  };

  //- - - - - - - - - - - - - - - - - - - - - - -- - - - -//
  //  MINE MANAGEMENT
  //- - - - - - - - - - - - - - - - - - - - - - -- - - - -//
  private _manageMine = async (mine: Mine) => {
    const {
      process: levels,
      round,
      start_time,
      end_time,
      game_id,
      faction,
      team_id,
      winner_team_id,
    } = mine;

    console.log(`-----`.repeat(10));
    const level = levels[levels.length - 1];
    const timeLeftInSec = end_time - Math.floor(Date.now() / 1_000);

    console.log(`Mine ID:`, game_id);
    console.log(`Team ID`, team_id);
    console.log(`Start Time:`, formatDate(start_time * 1000));
    console.log(`End Time:`, formatDate(end_time * 1000));
    console.log(
      `Time Left:`,
      Object.entries(displayRemainingTime(timeLeftInSec))
        .map(([key, value]) => `${value.padStart(2)} ${key}`)
        .join(', ') || '< 0 secs'
    );

    console.log(`Faction:`, faction);
    console.log(
      `Game level:`,
      levels
        .map(
          (level) =>
            `${level.action} ${formatDate(level.transaction_time * 1000)}`
        )
        .join(', ')
    );
    console.log(`Round:`, round);
    winner_team_id && console.log(`Winner Team ID:`, winner_team_id);
    console.log(
      `Game Status:`,
      winner_team_id
        ? winner_team_id == team_id
          ? 'We Won 🎉🎉🎊. Waiting to settle...'
          : 'We Lost 😔😔'
        : timeLeftInSec > 0
        ? 'Active'
        : 'Ended'
    );
    console.log(`-----`.repeat(10));

    if (this.mineManager.has(game_id)) {
      let _mine = this.mineManager.get(game_id);
      if (_mine?.status !== mine.status) {
        this.logs = `Mine ${game_id} ${
          level.action.includes('attack')
            ? 'is under attack!'
            : level.action.includes('reinforce-defence')
            ? 'is under defence!'
            : level.action.includes('create-game')
            ? 'was just created at ' + formatDate(level.transaction_time * 1000)
            : level.action.includes('settle')
            ? 'is settling...'
            : level.action
        }`;

        sendMessage(this.logs);
        this.mineManager.set(game_id, mine);
      }
    } else {
      this.mineManager.set(game_id!, mine);
    }

    timeLeftInSec > 0
      ? this._checkMineStatus(mine, level)
      : this._endMine(mine);
  };
  private _checkMineStatus = async (mine: Mine, level: Process) => {
    // check if the mine has been attacked and if we should send reinforcement
    if (
      ['attack', 'reinforce-attack'].includes(level.action) && // mine was attacked
      mine.process.reduce(
        (acc, l2) =>
          l2.action == 'attack' || l2.action == 'reinforce-attack'
            ? (acc += 1)
            : acc,
        0
      ) < 3 && // we have sent less than 3 reinforcements
      this._delayBeforeReinforcementIsOver(level.transaction_time) && // delay before we reinforce is over
      this._notTooLate(level.transaction_time) // we are not late
    ) {
      console.log(`-----`.repeat(2));
      console.info(`Sending reinforcement...`);
      console.log(`-----`.repeat(2));
      await this._sendReinforcement(mine);
    }
  };

  private _sendReinforcement = async (mine: Mine) => {
    // Get reinforcements from tarven
    const lendings = await api.fetchLendings({
      orderBy: 'price',
      order: 'asc',
      page: 1,
      limit: 100,
      class_ids: undefined,
      is_origin: undefined,
      origin: undefined,
    });
    // Select the best reinforcement according to the user filter criteria
    let bestMercenaries = await api.getBestMercenary(lendings, {
      bp: Math.abs(mine.defense_point - mine.attack_point),
    });
    displayTable(bestMercenaries);
    // filter out the one being borrowed
    bestMercenaries = bestMercenaries.filter(
      (mercenary) => !mercenary.is_being_borrowed
    );

    const [bestMercenary, ...rest] = bestMercenaries;

    this.logs = `Best mercenary found`;
    this.logs += `\nCrabada: \`${bestMercenary.crabada_id}\``;
    this.logs += `\nPrice: \`${utils.formatEther(
      `${bestMercenary.price}`
    )} TUS\``;
    this.logs += `\nClass: \`${bestMercenary.class_name}\``;
    this.logs += `\nBattle Point: \`${bestMercenary.battle_point} BP\``;
    this.logs += `\nMine Point: \`${bestMercenary.mine_point} MP\``;
    sendMessage(this.logs);

    gameContract
      .reinforceDefense(
        mine.game_id,
        bestMercenary.crabada_id,
        utils.parseUnits(`${bestMercenary.price}`, 0)
      )
      .then((tx: { hash: string }) => {
        if (tx?.hash) {
          console.log(`-----`.repeat(2));
          this.logs = `Reinforcement sent to mine ${mine.game_id}`;
          this.logs += `\nHash: [${tx.hash.toUpperCase()}](${
            this.explorerUrl
          }/tx/${tx.hash})`;
          sendMessage(this.logs);
          console.log(`-----`.repeat(10));
        }
      })
      .catch((err) => {
        console.log(`-----`.repeat(2));
        let msg = '';
        try {
          try {
            let error = JSON.parse(JSON.stringify(err));
            console.log({
              error,
            });
            msg = error.reason || JSON.parse(error?.body).error?.message || err;
          } catch (e) {
            msg = err;
          }
        } catch (e) {
          msg = err;
        }
        this.logs = `Error while sending reinforcement to mine ${mine.game_id}`;
        this.logs += `\nReason: ${msg}`;
        console.error(this.logs);
        sendMessage(this.logs);
        //  remove mine from track list
        console.log(`-----`.repeat(10));
      });
  };
  private _delayBeforeReinforcementIsOver = (transaction_time: number) => {
    const timeElapsedInSec = Math.floor(Date.now() / 1_000) - transaction_time;
    return timeElapsedInSec > config.REINFORCEMENT_DELAY_IN_MIN * 60;
  };

  private _notTooLate = (transaction_time: number) => {
    const REINFORCEMENT_WINDOW_IN_MIN = 30; // 30 minutes
    return (
      Math.floor(Date.now() / 1_000) - transaction_time <
      REINFORCEMENT_WINDOW_IN_MIN * 60
    );
  };

  private _endMine = (mine: Mine) => {
    this.logs = `Mine ${mine.game_id} has ended`;
    this.logs += `\nClaiming rewards...`;
    sendMessage(this.logs);
    console.log(this.logs);
    console.log(`-----`.repeat(2));

    gameContract
      .closeGame(mine.game_id)
      .then((tx: { hash: string }) => {
        if (tx?.hash) {
          console.log(`-----`.repeat(2));
          this.logs = `Successfully claimed rewards for mine \`${mine.game_id}\``;
          this.logs += `\nHash: [${tx.hash.toUpperCase()}](${
            this.explorerUrl
          }/tx/${tx.hash})`;
          sendMessage(this.logs);
          console.log(`-----`.repeat(10));
        }
        this.mineManager.delete(mine.game_id);
      })
      .catch((err) => {
        console.log(`-----`.repeat(2));
        let msg = '';

        try {
          let error = JSON.parse(JSON.stringify(err));
          console.log({
            error,
          });
          msg = error.reason || JSON.parse(error?.body).error?.message || err;
        } catch (e) {
          msg = err;
        }
        this.logs = `Error while claiming rewards for mine ${mine.game_id}`;
        this.logs += `\nReason: ${msg}`;
        console.error(this.logs);
        sendMessage(this.logs);
        console.log(`-----`.repeat(10));
      });
  };

  //- - - - - - - - - - - - - - - - - - - - - - -- - - - -//
  //  LOOTING MANAGEMENT
  //- - - - - - - - - - - - - - - - - - - - - - -- - - - -//
  private _manageLooting = async (loot: Mine) => {
    const {
      process: levels,
      round,
      start_time,
      end_time,
      game_id,
      faction,
      team_id,
      winner_team_id,
    } = loot;

    console.log(`-----`.repeat(10));
    const level = levels[levels.length - 1];
    const timeLeftInSec = end_time - Math.floor(Date.now() / 1_000);

    console.log(`Looting ID:`, game_id);
    console.log(`Team ID`, team_id);
    console.log(`Start Time:`, formatDate(start_time * 1000));
    console.log(`End Time:`, formatDate(end_time * 1000));
    console.log(
      `Time Left:`,
      Object.entries(displayRemainingTime(timeLeftInSec))
        .map(([key, value]) => `${value.padStart(2)} ${key}`)
        .join(', ') || '< 0 secs'
    );

    console.log(`Faction:`, faction);
    console.log(
      `Game level:`,
      levels
        .map(
          (level) =>
            `${level.action} ${formatDate(level.transaction_time * 1000)}`
        )
        .join(', ')
    );
    console.log(`Round:`, round);
    winner_team_id && console.log(`Winner Team ID:`, winner_team_id);
    console.log(
      `Game Status:`,
      winner_team_id
        ? winner_team_id == team_id
          ? 'We Won 🎉🎉🎊. Waiting to settle...'
          : 'We Lost 😔😔'
        : timeLeftInSec > 0
        ? 'Active'
        : 'Ended'
    );
    console.log(`-----`.repeat(10));

    if (this.mineManager.has(game_id)) {
      let _mine = this.mineManager.get(game_id);
      if (_mine?.status !== loot.status) {
        this.logs = `Looting ${game_id} ${
          level.action.includes('attack')
            ? 'is under attack!'
            : level.action.includes('reinforce-defence')
            ? 'is under defence!'
            : level.action.includes('create-game')
            ? 'was just created at ' + formatDate(level.transaction_time * 1000)
            : level.action.includes('settle')
            ? 'is settling...'
            : level.action
        }`;

        sendMessage(this.logs);
        this.mineManager.set(game_id, loot);
      }
    } else {
      this.mineManager.set(game_id!, loot);
    }

    timeLeftInSec > 0
      ? this._checkLootingStatus(loot, level)
      : this._endLooting(loot);
  };

  private _checkLootingStatus = async (mine: Mine, level: Process) => {
    // check if the miner has reinforced
    console.log({
      _checkLootingStatus: '_checkLootingStatus',
      mine,
      level: level.action,
    });
    if (['reinforce-defense'].includes(level.action)) {
      console.log(`-----`.repeat(2));
      console.info(`Sending reinforcement...`);
      console.log(`-----`.repeat(2));
      await this._sendReinforcement(mine);
    }
  };
  private _endLooting = (mine: Mine) => {
    this.logs = `Looting for mine ${mine.game_id} has ended`;
    this.logs += `\nClaiming rewards...`;
    sendMessage(this.logs);
    console.log(this.logs);
    console.log(`-----`.repeat(2));

    gameContract
      .settleGame(mine.game_id)
      .then((tx: { hash: string }) => {
        if (tx?.hash) {
          console.log(`-----`.repeat(2));
          this.logs = `Successfully claimed rewards for mine \`${mine.game_id}\``;
          this.logs += `\nHash: [${tx.hash.toUpperCase()}](${
            this.explorerUrl
          }/tx/${tx.hash})`;
          sendMessage(this.logs);
          console.log(`-----`.repeat(10));
        }
        this.mineManager.delete(mine.game_id);
      })
      .catch((err) => {
        console.log(`-----`.repeat(2));
        let msg = '';

        try {
          let error = JSON.parse(JSON.stringify(err));
          console.log({
            error,
          });
          msg = error.reason || JSON.parse(error?.body).error?.message || err;
        } catch (e) {
          msg = err;
        }
        this.logs = `Error while claiming rewards for mine ${mine.game_id}`;
        this.logs += `\nReason: ${msg}`;
        console.error(this.logs);
        sendMessage(this.logs);
        console.log(`-----`.repeat(10));
      });
  };
}

export const gameWraper = new GameWrapper();
