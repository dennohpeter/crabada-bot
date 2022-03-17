import { BigNumber, Contract, providers, utils, Wallet } from 'ethers';
import { config } from '../../config';
import IdleGameBI from './abis//IdleGame.json';

const provider = new providers.JsonRpcProvider(
  config.TEST_MODE ? config.TESTNET_JSON_RPC_URL : config.MAINNET_JSON_RPC_URL,
  config.TEST_MODE
    ? {
        chainId: config.TESTNET_CHAIN_ID,
        name: 'Swimmers Network',
      }
    : {
        chainId: config.MAINNET_CHAIN_ID,
        name: 'Avalanche Mainnet C-Chain',
      }
);

const signer = new Wallet(config.PRIVATE_KEY, provider);

const idleGameInterface = new utils.Interface(IdleGameBI);
const idleGameContract = new Contract(
  config.TEST_MODE ? config.IdleGame_TESTNET : config.IdleGame_MAINNET,
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
