export const config = {
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
    maxPrice: 10, // max price in TUS
    minPrice: 0, // min price in TUS
    mine_point: true, //sort by highest MP?
    battle_point: true, // tiebreak based on BP?
  },
};
