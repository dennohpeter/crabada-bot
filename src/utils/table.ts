import { Crabada } from '../types';
import chalk from 'chalk';

// tslint:disable:no-var-requires
const chalkTable = require('chalk-table');

export const displayTable = (data: Crabada[], start = 0, limit = 10000) => {
  const options = {
    leftPad: 2,
    columns: [
      { field: '#', name: chalk.cyan('#') },
      { field: 'id', name: chalk.cyan('ID') },
      { field: 'crabada_name', name: chalk.magenta('Name 🦀') },
      { field: 'class_name', name: chalk.green('Class') },
      { field: 'display_price', name: chalk.green('Price in TUS 🪙') },
      { field: 'speed', name: chalk.yellow('Speed ⚡️') },
      { field: 'damage', name: chalk.yellow('Damage') },
      { field: 'critical', name: chalk.yellow('Critical') },
      { field: 'armor', name: chalk.cyan('Armor') },
      { field: 'hp', name: chalk.yellow('HP') },
      { field: 'time_point', name: chalk.yellow('TP') },
      { field: 'battle_point', name: chalk.bgMagenta('BP') },
      { field: 'mine_point', name: chalk.yellow('MP') },
    ],
    skinny: true,
  };

  let end = start + limit;
  const table = chalkTable(
    options,
    data.slice(start, end).map((l, i) => {
      let price = l.price / Math.pow(10, 18);
      return {
        ...l,
        '#': `${i + start + 1}`,
        display_price: `${price} TUS`,
        price,
      };
    })
  );

  console.log(table);

  let footerOptions = {
    leftPad: 2,
    columns: [
      { field: 'page', name: chalk.cyan('Pages') },
      { field: 'total', name: chalk.cyan('Total') },
    ],
  };

  let totalPages = Math.ceil(data.length / limit);
  let page = Math.abs(Math.floor(totalPages / (totalPages - end)));

  const footer = chalkTable(footerOptions, [
    {
      page: `Page ${page} of ${totalPages}`,
      total: `Total: ${data.length}`,
    },
  ]);

  console.log(footer);
};
