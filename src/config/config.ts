import 'dotenv/config';

if (
  !process.env.PRIVATE_KEY &&
  !process.env.PUBLIC_KEY &&
  !process.env.BOT_TOKEN
) {
  throw new Error(
    'PRIVATE_KEY && PUBLIC_KEY && BOT_TOKEN, Must be in your .env file.'
  );
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
  GAS_CAP: 15000,

  /**
   * Enviroment
   * @options `true` for test mode and
   * `false` for live mode
   */
  TEST_MODE: false,

  TESTNET_JSON_RPC_URL: `https://testnet-rpc.swimmer.network/ext/bc/2Sk6j8TYVQc2oR1TtUz64EWHAYjDUoDQ4hpbu6FMN2JBKC77xa/rpc`,
  TESTNET_CHAIN_ID: 73771,
  TESTNET_EXPLORER: `https://testnet-explorer.swimmer.network`,

  MAINNET_JSON_RPC_URL: `https://rpc.swimmer.network/ext/bc/2K33xS9AyP9oCDiHYKVrHe7F54h2La5D8erpTChaAhdzeSu2RX/rpc`,
  MAINNET_CHAIN_ID: 73772,
  MAINNET_EXPLORER: `https://explorer.swimmer.network`,

  IdleGame_TESTNET: '0x801b5bb19e9052db964b94ed5b4d6730d8fcca25',
  IdleGame_MAINNET: '0x9ab9e81Be39b73de3CCd9408862b1Fc6D2144d2B',

  /*
   * The Telegram bot token.
   */
  BOT_TOKEN: process.env.BOT_TOKEN!,

  /*
   * List of the whitelisted users.
   * Users who can receive messages/notifications from the bot.
   */
  WHITELISTED_USERS: ['251669027'],
};
