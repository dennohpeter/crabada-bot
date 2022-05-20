import { utils } from 'ethers';
import dateFormat from 'dateformat';
import { schedule } from 'node-cron';
import { config, TeamConfig } from '../config';
import { gameContract } from '../contract';
import { api } from '../api';
import { Team, TEAM_ROLE } from '../types';
import { sendMessage } from '../integration';

class GameWrapper {
  private readonly teamManager: Map<number, Team>;
  private logs: string;
  private explorerUrl: string;
  constructor() {
    this.teamManager = new Map();
    this.logs = '';
    this.explorerUrl = config.TEST_MODE
      ? config.TESTNET_EXPLORER
      : config.MAINNET_EXPLORER;
  }
  start = async () => {
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
        } else {
          console.log(`-----`.repeat(2));
          console.info(`No active mines found!`);
          console.log(`-----`.repeat(10));
        }

        console.log(`-----`.repeat(10));
        console.info(`Checking for active loots....`);
        let loots = await api.fetchLoots({
          user_address: config.PUBLIC_KEY,
          status: 'open',
          page: 1,
          limit: 100,
        });

        if (loots.length > 0) {
          console.log(`-----`.repeat(2));
        } else {
          console.log(`-----`.repeat(2));
          console.info(`No active loots found!`);
          console.log(`-----`.repeat(10));
        }
      },
      {
        scheduled: true,
        timezone: 'Africa/Nairobi',
      }
    );
  };

  deployTeamToMine = async (team: Team) => {
    this.logs = `Deploying team ${team.team_id} to a mining expedition...`;
    console.log(this.logs);
    sendMessage(this.logs);
    gameContract
      .startGame(team.team_id)
      .then((tx) => {
        if (tx?.hash) {
          console.log(`-----`.repeat(2));
          this.logs = `Deployed team ${team.team_id} to a mining expedition! ✔️`;
          this.logs += `\nHash: [${utils.getAddress(tx.hash)}](${
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
        let msg = err.message || err.msg || err.data.message || err.error;

        try {
          if (!msg) {
            let error = JSON.parse(JSON.stringify(msg));
            msg =
              error.message || error.msg || error.data.message || error.error;
          }
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

  deployTeamToLoot = async (team: Team) => {
    throw new Error('Method not implemented.');
  };
}

export const gameWraper = new GameWrapper();
