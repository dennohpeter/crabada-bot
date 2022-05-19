import { displayTable, formatDate } from './helpers';
import {
  closeGame,
  miningWrapper,
  reinforceDefense,
  startGame,
  sendMessage,
} from './core';
import { schedule } from 'node-cron';
import moment from 'moment';
import { Process } from './types';
import { utils } from 'ethers';
import dateFormat from 'dateformat';
import { config } from './config';

/**
 * Entry point
 */
const Main = async () => {
  const user_address = config.PUBLIC_KEY;
  const CHECK_INTERVAL = 15;

  let message = '';

  message = 'Starting bot at ' + dateFormat(new Date());
  sendMessage(message);

  let messageManages: Map<string, { lastKnownAction: string }> = new Map();

  schedule(`*/${CHECK_INTERVAL * 4} * * * * *`, async () => {
    // 1 Check for free teams
    console.log(`-----`.repeat(10));
    console.info(`Checking for free teams....`);
    let teams = await miningWrapper.fetchTeams({
      user_address,
      page: 1,
      limit: 300,
      is_team_available: 1,
    });

    if (teams.length) {
      // 2 Deploy free  team to a mining expedition
      teams.map(async (t) => {
        const { team_id } = t;

        const team = game_manager.get(team_id);
        if (!team) {
          console.log(`-----`.repeat(10));
          message = `Found a free team, Team Name: Team ${team_id}  ✔️`;
          console.log(message);
          sendMessage(message);
          game_manager.set(team_id, {
            team_id,
            lastKnownAction: '',
          });
          console.log(`-----`.repeat(2));
          message = `Deploying Team ${team_id} to a mining expedition...`;
          console.log(message);
          sendMessage(message);
          await startGame(team_id)
            .then((tx) => {
              const { hash } = tx;
              console.log(`-----`.repeat(2));
              message = `Tx Hash: [${utils.getAddress(hash)}](${
                config.TEST_MODE
                  ? config.TESTNET_EXPLORER
                  : config.MAINNET_EXPLORER
              }/tx/${hash})`;
              console.log(message);
              sendMessage(message);
              if (hash) {
                console.log(`-----`.repeat(2));

                message = `Team ${team_id} has been deployed successfully ✔️`;
                console.log(message);
                sendMessage(message);
                console.log(`-----`.repeat(10));
              }
              //  remove game track list
              game_manager.delete(team_id);
            })
            .catch((err) => {
              console.log(`-----`.repeat(2));
              message = `Error while deploying Team ${team_id} err: ${err}`;
              console.error(message);
              sendMessage(message);
              //  remove game track list
              game_manager.delete(team_id);
              console.log(`-----`.repeat(10));
            });
        }
      });
    } else {
      console.log(`-----`.repeat(2));
      console.info(`No free teams found!`);
      console.log(`-----`.repeat(10));
    }
  });
  const game_manager: Map<number, any> = new Map();
  schedule(`*/${CHECK_INTERVAL * 3} * * * * *`, async () => {
    // 4 Monitor active for attacks
    console.log(`-----`.repeat(10));
    console.info(`Checking for active mines....`);
    let mines = await miningWrapper.fetchMines({
      user_address,
      status: 'open',
      page: 1,
      limit: 100,
    });
    if (mines.length) {
      mines.map(async (mine) => {
        const {
          process: levels,
          round: game_round,
          start_time: mine_start_time,
          end_time: mine_end_time,
          game_id,
          faction,
          team_id,
          winner_team_id,
        } = mine;
        console.log(`-----`.repeat(10));
        const level = levels[levels.length - 1];
        const timeLeft = mine_end_time - Math.floor(Date.now() / 1_000);

        console.log(`Team Name:`, `Team ${team_id}`);
        console.log(`Mine Id:`, game_id);
        console.log(`Team Id:`, team_id);
        console.log(`Start Time:`, formatDate(mine_start_time));
        console.log(`End Time:`, formatDate(mine_end_time));

        if (timeLeft > 0) {
          console.log(`Game Ends:`, moment(mine_end_time * 1_000).fromNow());
        }
        console.log(`Faction:`, faction);
        console.log(
          `Game Level:`,
          levels?.map((level: Process) => {
            return {
              level: `${level.action.replace('-', ' ')}`,
              startedAt: formatDate(level.transaction_time),
            };
          })
        );
        console.log(`Game Round:`, game_round);
        if (winner_team_id) {
          console.log(`Winner Team Id:`, winner_team_id);
        }
        console.log(
          `Game Status:`,
          winner_team_id
            ? winner_team_id == team_id
              ? 'We Won 🎉🎉🎊. Waiting to settle...'
              : 'We Lost 😔😔'
            : timeLeft > 0
            ? 'Active'
            : 'Ended'
        );
        console.log(`-----`.repeat(10));

        if (timeLeft > 0) {
          var current_ms = new Date(level.transaction_time).getTime();
          // add 30 minutes to attack time
          var in30min = new Date(current_ms + 1000 * 60 * 30);
          ///  send message when my team is attacked
          let messages = messageManages.get(game_id.toString());
          if (level.action != messages?.lastKnownAction) {
            message = `Mine ${game_id} ${
              level.action.includes('attack')
                ? 'is under attack!'
                : level.action.includes('reinforce-defence')
                ? 'is under defence!'
                : level.action.includes('create_game')
                ? 'was just created at ' +
                  dateFormat(level.transaction_time * 1000)
                : level.action.includes('settle')
                ? 'is settling...'
                : level.action
            }`;
            sendMessage(message);
            messageManages.set(game_id.toString(), {
              lastKnownAction: level.action,
            });
          }

          if (
            (level.action === 'attack' ||
              (level.action === 'reinforce-attack' &&
                levels.reduce(
                  (acc, l2) =>
                    l2.action == 'attack' || l2.action == 'reinforce-attack'
                      ? (acc += 1)
                      : acc,
                  0
                ) < 3)) && // FIXED check to ensure that we go upto 2 reinforcements
            Math.floor(Date.now() / 1_000) - level.transaction_time >=
              config.DELAY_B4_REINFORCEMENT_IN_MIN * 60 &&
            in30min.getTime() > Date.now()
          ) {
            // 5 Get reinforcements from tarven
            const lendings = await miningWrapper.fetchLendings({
              orderBy: 'price',
              order: 'desc',
              page: 1,
              limit: 100,
              class_ids: undefined,
              is_origin: undefined,
              origin: undefined,
            });
            // 6 Select the best reinforcement according to the user filter criteria
            const mercenaries = await miningWrapper.getBestMercenary(lendings);
            const best_mercenary = mercenaries[0];
            console.info(
              `Best mercenaries found from tarven ranging from minPrice: ${config.filters.minPrice} to maxPrice: ${config.filters.maxPrice} TUS`
            );
            displayTable(mercenaries);
            console.log(`-----`.repeat(10));

            const game = game_manager.get(game_id);
            if (!game && !best_mercenary.is_being_borrowed) {
              game_manager.set(game_id, {
                ...game,
              });
              message = `Sending a reinforcement mercenary ${best_mercenary.crabada_id} to Mine ${game_id}...`;
              console.log(message);
              sendMessage(message);

              await reinforceDefense(
                game_id,
                best_mercenary.crabada_id,
                utils.parseUnits(`${best_mercenary.price}`, 0)
              )
                .then((tx) => {
                  const { hash } = tx;
                  console.log(`-----`.repeat(2));
                  message = `Tx Hash: [${utils.getAddress(hash)}](${
                    config.TEST_MODE
                      ? config.TESTNET_EXPLORER
                      : config.MAINNET_EXPLORER
                  }/tx/${hash})`;
                  console.log(message);
                  sendMessage(message);
                  if (hash) {
                    console.log(`-----`.repeat(2));
                    //  remove game track list
                    game_manager.delete(game_id);
                    message = `Mercenary ${best_mercenary.id} has been deployed successfully to  Mine ${game_id} ✔️`;
                    console.log(message);
                    sendMessage(message);
                    console.log(`-----`.repeat(10));
                  }
                })
                .catch((err: any) => {
                  console.log(`-----`.repeat(2));
                  // let message =
                  //   JSON.parse(err?.error?.error?.body || {})?.error?.message ||
                  //   err;
                  message = `Error while deploying  mercenary ${best_mercenary.id}  to Mine ${game_id}, Error: ${err}`;
                  console.error(message);
                  sendMessage(message);
                  //  remove game track list
                  game_manager.delete(game_id);
                  console.log(`-----`.repeat(10));
                });
            }
          }
        } else {
          // 7: claim rewards and end game
          const mine = game_manager.get(game_id);
          if (!mine) {
            message = `New mine ${game_id} to claim rewards recorded  ✔️`;
            console.log(message);
            sendMessage(message);
            console.log(`-----`.repeat(2));
            game_manager.set(game_id, {
              levels,
              game_round,
              mine_start_time,
              mine_end_time,
              game_id,
              faction,
              team_id,
              winner_team_id,
            });

            message = `Claiming rewards for Mine ${game_id}, Team ${team_id}`;
            console.log(message);
            sendMessage(message);
            await closeGame(game_id)
              .then((tx: { hash: string }) => {
                const { hash } = tx;
                console.log(`-----`.repeat(2));
                message = `Tx Hash: [${utils.getAddress(hash)}](${
                  config.TEST_MODE
                    ? config.TESTNET_EXPLORER
                    : config.MAINNET_EXPLORER
                }/tx/${hash})`;
                console.log(message);
                sendMessage(message);
                if (hash) {
                  console.log(`-----`.repeat(2));
                }
                //  remove game track list
                game_manager.delete(game_id);
                console.log(`-----`.repeat(10));
              })
              .catch((err: any) => {
                console.log(`-----`.repeat(2));
                message = `Error while closing game, ${err}`;
                console.error(message);
                sendMessage(message);
                //  remove game track list
                game_manager.delete(game_id);
              });
          }
        }
      });
    } else {
      console.log(`-----`.repeat(2));
      console.info(`No active mines found`);
      console.log(`-----`.repeat(10));
    }
  });
};

Main();
