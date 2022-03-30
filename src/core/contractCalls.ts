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

export const checkAllowance = async () => {
  const abi = ['function allowance(address,address) view returns (uint256)'];
  const tusContract = new Contract(
    config.TEST_MODE ? config.TUS_TESTNET : config.TUS_MAINNET,
    abi,
    signer
  );
  const allowance = await tusContract.allowance(
    await signer.getAddress(),
    config.TEST_MODE ? config.IdleGame_TESTNET : config.IdleGame_MAINNET
  );
  return allowance;
};

export const approveTUS = async () => {
  console.log('approving IdleGame contract.....');
  const abi = ['function approve(address,uint256) returns (bool)'];
  const tusContract = new Contract(
    config.TEST_MODE ? config.TUS_TESTNET : config.TUS_MAINNET,
    abi,
    signer
  );
  const approve = await tusContract.approve(
    config.TEST_MODE ? config.IdleGame_TESTNET : config.IdleGame_MAINNET,
    utils.parseUnits(
      '57896044618658097711785492504343953926634992332820282019728792003956564819968',
      0
    )
  );
  return approve;
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
