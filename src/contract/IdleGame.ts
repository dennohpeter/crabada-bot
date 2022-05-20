import { BigNumber, Contract, providers, utils, Wallet } from 'ethers';
import { config } from '../config';
import { IdleGameABI } from './abis';

/**
 * @title IdleGame
 * @notice Class for interacting with IdleGame contract
 * @dev This class is used to interact with IdleGame contract
 */
class IdleGame {
  private readonly signer: Wallet;
  private readonly contract: Contract;

  constructor() {
    const provider = new providers.JsonRpcProvider(
      config.TEST_MODE
        ? config.TESTNET_JSON_RPC_URL
        : config.MAINNET_JSON_RPC_URL,
      config.TEST_MODE
        ? {
            chainId: config.TESTNET_CHAIN_ID,
            name: 'Swimmers Testnet',
          }
        : {
            chainId: config.MAINNET_CHAIN_ID,
            name: 'Swimmer Mainnet',
          }
    );
    this.signer = new Wallet(config.PRIVATE_KEY, provider);
    this.contract = new Contract(
      config.TEST_MODE ? config.IdleGame_TESTNET : config.IdleGame_MAINNET,
      IdleGameABI,
      this.signer
    );
  }

  startGame = async (teamId: number) => {
    await this._checkGasPrice();
    return await this.contract.startGame(teamId);
  };

  closeGame = async (gameId: number) => {
    await this._checkGasPrice();

    return await this.contract.closeGame(gameId);
  };
  settleGame = async (gameId: number) => {
    return await this.contract.settleGame(gameId);
  };

  /**
   * Reinforce a team that is mining when attacked
   * @param gameId - The gameId of the game
   * @param crabadaId - The crabadaId of the game
   * @param borrowPrice - The hire price of the mercenary
   * @returns
   */
  reinforceDefense = async (
    gameId: number,
    crabadaId: number,
    borrowPrice: BigNumber | string
  ) => {
    await this._checkGasPrice();
    return await this.contract.reinforceDefense(gameId, crabadaId, borrowPrice);
  };

  /**
   * Used to estimate gas cost for a transaction
   */
  _checkGasPrice = async () => {
    const gasPrice = await this.signer.getGasPrice();
    const gasPriceInGwei = parseFloat(utils.formatUnits(gasPrice, 'gwei'));
    console.log('Current Gas price in gwei: ', gasPriceInGwei);
    if (gasPriceInGwei >= config.GAS_CAP) {
      throw new Error(
        `Gas price of ${gasPriceInGwei} Gwei is greater than gas cap of ${config.GAS_CAP} Gwei. Please try again later or increase the gas cap.`
      );
    }
  };
}

export const gameContract = new IdleGame();
