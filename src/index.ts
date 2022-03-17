import { displayTable, formatDate } from './utils';
import {
  closeGame,
  miningWrapper,
  reinforceDefense,
  settleGame,
  startGame,
} from './core';
import { schedule } from 'node-cron';
import moment from 'moment';
import { Process } from './types';
import { utils } from 'ethers';
import { config } from '../config';

/**
 * Entry point
 */
const Main = async () => {
  const user_address = config.PUBLIC_KEY;
  const CHECK_INTERVAL = 10;

  schedule(`*/${CHECK_INTERVAL * 3} * * * * *`, async () => {
    // 1 Check for free teams
    console.log(`-----`.repeat(10));
    console.info(`Checking for free teams....`);
    let teams = await miningWrapper.fetchTeams({
      user_address,
      page: 1,
      limit: 1000,
      is_team_available: 1,
    });

    if (teams.length) {
      // 2 Deploy free  team to a mining expedition
      teams.map(async (t) => {
        const {
          team_id,
          battle_point,
          faction,
          process_status,
          status,
          time_point,
        } = t;

        const team = game_manager.get(team_id);
        if (!team) {
          console.log(`-----`.repeat(10));
          console.info(`Found a free team, Team Name: Team ${team_id}  ✔️`);
          game_manager.set(team_id, {
            team_id,
          });
          console.log(`-----`.repeat(2));
          console.info(`Deploying Team ${team_id} to a mining expedition...`);
          await startGame(team_id)
            .then((tx) => {
              const { hash } = tx;
              console.log(`-----`.repeat(2));
              console.info(`Tx Hash:`, hash);
              if (hash) {
                console.log(`-----`.repeat(2));
                //  remove game track list
                game_manager.delete(team_id);
                console.info(
                  `Team ${team_id} has been deployed successfully ✔️`
                );
                console.log(`-----`.repeat(10));
              }
            })
            .catch((err) => {
              console.log(`-----`.repeat(2));
              console.error(`Error while deploying Team ${team_id}`, err);
              //  remove game track list
              game_manager.delete(team);
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
  schedule(`*/${CHECK_INTERVAL * 4} * * * * *`, async () => {
    // 4 Monitor active for attacks
    console.log(`-----`.repeat(10));
    console.info(`Checking for active mines....`);
    let mines = await miningWrapper.fetchMines({
      user_address,
      status: 'open',
      page: 1,
      limit: 500,
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
        console.log(`Winner Team Id:`, winner_team_id);
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
          if (
            (level.action === 'attack' ||
              (level.action === 'reinforce-attack' &&
                levels.reduce(
                  (acc, l2) =>
                    l2.action == 'attack' || l2.action == 'reinforce-attack'
                      ? acc++
                      : acc,
                  0
                ) < 2)) && // FIXED check to ensure that we go upto 2 reinforcements
            Math.floor(Date.now() / 1_000) - level.transaction_time >=
              config.DELAY_B4_REINFORCEMENT_IN_MIN * 60
          ) {
            // 5 Get reinforcements from tarven
            const lendings = await miningWrapper.fetchLendings({
              orderBy: 'price',
              order: 'desc',
              page: 1,
              limit: 1000,
              class_ids: undefined,
              is_origin: undefined,
              origin: undefined,
            });
            // 6 Select the best reinforcement according to the user filter criteria
            const mercenaries = await miningWrapper.getBestMercenary(lendings);
            const best_mercenary = mercenaries[0];
            console.info(`Best mercenary crabada selected:`);
            displayTable(mercenaries);
            console.log(`-----`.repeat(10));

            const game = game_manager.get(game_id);
            if (!game && !best_mercenary.is_being_borrowed) {
              game_manager.set(game_id, {
                game_id,
              });
              console.info(
                `Sending a reinforcement mercenary ${best_mercenary.crabada_id} to Mine ${game_id}...`
              );
              await reinforceDefense(
                game_id,
                best_mercenary.crabada_id,
                utils.parseUnits(`${best_mercenary.price}`, 0)
              )
                .then((tx) => {
                  const { hash } = tx;
                  console.log(`-----`.repeat(2));
                  console.info(`Tx Hash:`, hash);
                  if (hash) {
                    console.log(`-----`.repeat(2));
                    //  remove game track list
                    game_manager.delete(game_id);
                    console.info(
                      `Mercenary ${best_mercenary.id} has been deployed successfully to  Mine ${game_id} ✔️`
                    );
                    console.log(`-----`.repeat(10));
                  }
                })
                .catch((err) => {
                  console.log(`-----`.repeat(2));
                  console.error(
                    `Error while deploying  mercenary ${best_mercenary.id}  to Mine ${game_id}`,
                    err
                  );
                  //  remove game track list
                  game_manager.delete(game);
                  console.log(`-----`.repeat(10));
                });
            }
          }
        } else {
          // 7: claim rewards and end game
          const mine = game_manager.get(game_id);
          if (!mine) {
            console.info(`New mine ${game_id} to claim rewards recorded  ✔️`);
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

            // if (level.action?.toLowerCase() == 'settle') {
            console.info(
              `Claiming rewards for Mine ${game_id}, Team ${team_id}`
            );
            await closeGame(game_id)
              .then((tx: { hash: string }) => {
                const { hash } = tx;
                console.log(`-----`.repeat(2));
                console.info(`Tx Hash:`, hash);
                if (hash) {
                  console.log(`-----`.repeat(2));
                  //  remove game track list
                  game_manager.delete(game_id);
                  console.log(`-----`.repeat(10));
                }
              })
              .catch((err: any) => {
                console.log(`-----`.repeat(2));
                console.error(`Error:`, err);
                //  remove game track list
                game_manager.delete(game_id);
              });
            // } else {
            //   console.info(
            //     `Settling Mine ${game_id}, Team Name: Team ${team_id}`
            //   );
            //   await settleGame(game_id)
            //     .then((tx: { hash: string }) => {
            //       const { hash } = tx;
            //       console.info(`Tx Hash:`, hash);
            //       if (hash) {
            //         console.log(`-----`.repeat(2));
            //         //  remove game track list
            //         game_manager.delete(game_id);
            //         console.log(`-----`.repeat(10));
            //       }
            //     })
            //     .catch((err: any) => {
            //       console.log(`-----`.repeat(2));
            //       console.error(`Error:`, err);
            //       //  remove game track list
            //       game_manager.delete(game_id);
            //     });
            // }
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
