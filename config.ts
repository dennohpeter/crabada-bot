import 'dotenv/config';

if (!process.env.PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY Must be in your .env file.');
}

export const config = {
  /**
   * WALLET
   */
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  /**
   * Enviroment
   * @options `true` for test mode and
   * `false` for live mode
   */
  TEST_MODE: true,

  /*
   * Reinforcement Filters
   */
  filters: {
    maxPrice: 100, // max price in TUS
    minPrice: 0, // min price in TUS
    mine_point: true, //sort by highest MP?
    battle_point: true, // tiebreak based on BP?
  },

  TESTNET_JSON_RPC_URL: `https://testnet-rpc.swimmer.network/ext/bc/2Sk6j8TYVQc2oR1TtUz64EWHAYjDUoDQ4hpbu6FMN2JBKC77xa/rpc`,
  TESTNET_CHAIN_ID: 73771,
  TESTNET_EXPLORER: `https://testnet-explorer.swimmer.network`,

  MAINNET_JSON_RPC_URL: `https://rpc.swimmer.network/ext/bc/2Sk6j8TYVQc2oR1TtUz64EWHAYjDUoDQ4hpbu6FMN2JBKC77xa/rpc`,
  MAINNET_CHAIN_ID: 73771,
  MAINNET_EXPLORER: `https://testnet-explorer.swimmer.network`,

  IdleGame: '0x801b5bb19e9052db964b94ed5b4d6730d8fcca25',
};
