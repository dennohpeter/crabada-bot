import dateFormat from 'dateformat';
import { gameWraper } from './core';

/**
 * Entry point
 */
const Main = async () => {
  await gameWraper.start();
};

Main();
