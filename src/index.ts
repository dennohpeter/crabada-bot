import { displayTable } from './utils';
import { miningWrapper } from './core';
import { schedule } from 'node-cron';
import { config } from '../config';
import { utils } from 'ethers';

/**
 * Entry point
 */
const Main = async () => {
  const user_address = '0xb6d48251389644de50736a80f87d8e7ce57f00be';

  // schedule(`*/5 * * * * *`, async () => {
  //   // TODO 1 Check 4 free teams
  //   let teams = await miningWrapper.fetchMyTeams({
  //     user_address,
  //     page: '1',
  //     limit: 1000,
  //     is_team_available: 1,
  //   });
  //   displayTable(teams);
  //   console.log(`-----`.repeat(20));
  //   // TODO 2 Check 4 active mines
  //   // TODO 3 Deploy free mine team
  //   //
  //   //
  // });
  schedule(`*/5 * * * * *`, async () => {
    // TODO 4 Monitor for attacks
    // 5 Get Lendings from tarven
    const lendings = await miningWrapper.fetchLendings({
      orderBy: 'price',
      order: 'desc',
      page: '1',
      limit: 1000,
      class_ids: undefined,
      is_origin: undefined,
      origin: undefined,
    });
    // console.log(`-----`.repeat(20));
    // 6 Filter Lending by user's filter criteria and select the best fit
    console.log(`-----`.repeat(20));
    const best_mercenary = await miningWrapper.getBestMercenary(lendings);
    console.info(`Best mercenary crabada selected: `);
    displayTable(best_mercenary);
    console.log(`-----`.repeat(20));
  });
};

Main();
