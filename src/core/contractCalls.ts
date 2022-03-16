import { BigNumber, Contract, providers, utils, Wallet } from 'ethers';
import { config } from '../../config';
import IdleGameBI from './abis//IdleGame.json';

const provider = new providers.JsonRpcProvider(config.TESTNET_JSON_RPC_URL, {
  chainId: config.TESTNET_CHAIN_ID,
  name: 'Swimmers Network',
});
const signer = new Wallet(config.PRIVATE_KEY, provider);

const idleGameInterface = new utils.Interface(IdleGameBI);
const idleGameContract = new Contract(
  config.IdleGame,
  idleGameInterface,
  signer
);

export const startGame = async (gameId: number) => {
  return await idleGameContract.startGame(gameId);
};
export const closeGame = async (gameId: number) => {
  return await idleGameContract.closeGame(gameId);
};
export const settleGame = async (gameId: number) => {
  return await idleGameContract.settleGame(gameId);
};

export const reinforceDefense = async (
  gameId: number,
  crabadaId: number,
  borrowPrice: BigNumber | string
) => {
  return await idleGameContract.reinforceDefense(
    gameId,
    crabadaId,
    borrowPrice
  );
};
