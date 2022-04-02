import 'dotenv/config';

if (!process.env.PRIVATE_KEY && !process.env.PUBLIC_KEY) {
  throw new Error('PRIVATE_KEY && PUBLIC_KEY, Must be in your .env file.');
}

export const config = {
  /**
   * WALLET
   */
  PRIVATE_KEY: process.env.PRIVATE_KEY!,
  PUBLIC_KEY: process.env.PUBLIC_KEY!,

  /*
   * Reinforcement Filters
   */
  filters: {
    maxPrice: 20, // max price in TUS
    minPrice: 0, // min price in TUS
    mine_point: true, //sort by highest MP?
    battle_point: true, // tiebreak based on BP?
  },

  DELAY_B4_REINFORCEMENT_IN_MIN: 20, // in Minutes i.e delay for x minutes b4 sending a reinforcement

  /**
   * GAS CAP IN GWEI
   * @notice bot will not send a reinforcement, claim or start a game if estimated gas is greater than this value
   * @notice units are in GWEI e.g 300 GWEI
   */
  GAS_CAP: 300,

  /**
   * Enviroment
   * @options `true` for test mode and
   * `false` for live mode
   */
  TEST_MODE: false,

  TESTNET_JSON_RPC_URL: `https://testnet-rpc.swimmer.network/ext/bc/2Sk6j8TYVQc2oR1TtUz64EWHAYjDUoDQ4hpbu6FMN2JBKC77xa/rpc`,
  TESTNET_CHAIN_ID: 73771,
  TESTNET_EXPLORER: `https://testnet-explorer.swimmer.network`,

  MAINNET_JSON_RPC_URL: `https://api.avax.network/ext/bc/C/rpc`,
  MAINNET_CHAIN_ID: 43114,
  MAINNET_EXPLORER: `https://snowtrace.io`,

  IdleGame_TESTNET: '0x801b5bb19e9052db964b94ed5b4d6730d8fcca25',
  IdleGame_MAINNET: '0x82a85407BD612f52577909F4A58bfC6873f14DA8',

  TUS_TESTNET: '',
  TUS_MAINNET: '0xf693248F96Fe03422FEa95aC0aFbBBc4a8FdD172',
};
