import axios, { AxiosInstance } from 'axios';
import { Crabada, Mine, Team } from '../types';
import { config } from '../config';
import { sleep } from '../helpers';

/**
 * A Wrapper that contains all the necessary functions for interacting
 * with crabadas idle subnet test https://idle-game-subnet-test.crabada.com
 * and mainnet https://play.crabada.com
 *
 * Author @dennohpeter
 */
class APIWrapper {
  _instance: AxiosInstance;
  constructor() {
    this._instance = axios.create({
      baseURL: config.TEST_MODE
        ? `https://idle-game-subnet-test-api.crabada.com/public/idle`
        : `https://idle-game-api.crabada.com/public/idle`,
    });
  }

  filterCrabs = async (
    crabadas: Crabada[],
    filter: {
      max_price: number;
      min_price: number;
    }
  ) => {
    return crabadas.filter((crabada) => {
      return (
        crabada.price >= filter.min_price &&
        crabada.price <= filter.max_price &&
        crabada.battle_point
      );
    });
  };
  /**
   * Fetches user's teams and filters them agains the given filters
   * @param _params.orderBy - Field to order by
   * @param _params.order - sort direction
   * @param _params.page - page to start on
   * @param _params.limit - teams per page
   * @param _params.user_address - user to fetch their crabs
   * @param _params.is_team_available - team availability `1` or `0`. `1` -
   * @returns Array of teams found `Team[]`
   */
  fetchTeams = async (_params: {
    orderBy?: string;
    order?: string;
    page: number;
    limit: number;
    user_address: string;
    is_team_available?: number;
  }): Promise<Team[]> => {
    return this._fetch('/teams', _params);
  };
  /**
   * Fetches mining expenditions
   * @param _params.user_address - user to fetch their mines
   * @param _params.page - page to start on
   * @param _params.limit - mines per page
   * @param _params.status - mining status || my mines, options: `open` | ``
   * @param _params.looter_address - looter address to get active mines
   * @param _params.can_loot - whether you can loot this mine || global active mines
   * @returns Array of mines found `Mine[]`
   */
  fetchMiningExpeditions = async (_params: {
    user_address?: string;
    page: number;
    limit?: number;
    status?: string;
    can_loot?: boolean;
  }) => {
    return this._fetch('/mines', _params);
  };
  /**
   * Fetches lendings from tarven
   * @param _params.orderBy - Field to order by
   * @param _params.order - sort direction
   * @param _params.page - page to start on
   * @param _params.limit - lendings per page
   * @param _params.class_ids -  list of crabadas class ids
   * @param _params.is_origin - whether crabada is origin
   * @param _params.origin - crabada origin
   *
   * @returns
   */
  fetchLendings = async (_params: {
    orderBy?: string;
    order?: string;
    page: number;
    limit?: number;
    class_ids?: any;
    is_origin?: any;
    origin?: any;
    from_price?: number;
    to_price?: number;
  }): Promise<Crabada[]> => {
    return this._fetch('/crabadas/lending', _params);
  };
  /**
   * Fetches active mining expeditions
   * @param _params.user_address - Looters address
   * @param _params.status - status of looting i.e. `open` | ``
   * @param _params.page - page to start on
   * @param _params.limit - lootings per page
   *
   * @returns
   */
  fetchMines = async (_params: {
    user_address: string;
    status: string;
    page: number;
    limit?: number;
  }): Promise<Mine[]> => {
    return this._fetch('/mines', _params);
  };

  /**
   * Fetches lootings
   * @param _params.looter_address - Looters address
   * @param _params.status - status of looting i.e. `open` | ``
   * @param _params.page - page to start on
   * @param _params.limit - lootings per page
   *
   * @returns
   */
  fetchLootings = async (_params: {
    looter_address: string;
    status: string;
    page: number;
    limit?: number;
  }): Promise<Mine[]> => {
    return this._fetch('/mines', _params);
  };
  getBestMercenary = async (filters?: any) => {
    // Get reinforcements from tarven
    const lendings = await this.fetchLendings({
      orderBy: 'price',
      order: 'asc',
      page: 1,
      limit: 50,
    });

    const max_price = config.filters.maxPrice * Math.pow(10, 18);
    const min_price = config.filters.minPrice * Math.pow(10, 18);

    console.log({
      size: lendings.length,
      max_price,
      min_price,
    });
    let matches = lendings.filter((lending) => {
      let batte_point = filters.batte_point >= 235 ? 235 : filters.batte_point;
      return (
        lending.price >= min_price &&
        lending.price <= max_price &&
        lending.battle_point >= batte_point
      );
    });

    // sort crabadas matches by mine_point(mp) and batte_point(bp) in descending order i.e
    // from highest to lowest
    matches = matches.sort(
      (l1, l2) => l2.battle_point - l1.battle_point || l1.price - l2.price
      //  ||
      // l2.mine_point - l1.mine_point
    );
    // console.log({
    //   size: matches.length,
    //   max_price,
    //   min_price,
    // });

    return matches.slice(0, 10);
  };

  _fetch = async (
    url: string,
    params: {
      orderBy?: string | undefined;
      order?: string | undefined;
      page: number;
      limit?: number | undefined;
      user_address?: string | undefined;
      is_team_available?: number | undefined;
      status?: string | undefined;
      can_loot?: boolean | undefined;
      class_ids?: any;
      is_origin?: any;
      origin?: any;
      from_price?: number | undefined;
      to_price?: number | undefined;
    }
  ) => {
    let records: any = [];
    let currentPage = params.page;
    while (true) {
      try {
        // console.log(
        //   `Fetching ${url.substring(url.lastIndexOf('/') + 1)} on page`,
        //   currentPage
        // );
        let { data } = await this._instance({
          url,
          method: 'GET',
          params,
        });

        if (!data?.error_code) {
          let { data: record, totalRecord, totalPages, page } = data?.result;

          records = records.concat(record);

          if (totalPages == page || records.length > 200) {
            break;
          }
          currentPage += 1;
          params.page = currentPage;
        } else {
          console.error(`Error:`, data?.error_code, data?.message);
          break;
        }
      } catch (error: any) {
        let message = JSON.parse(JSON.stringify(error));
        console.error(`Error:`, message);
        console.error(`Error:`, message.message, message.url);
        // throw new Error(error);
      }
    }
    records = records.filter(Boolean);
    // console.log({
    //   totalRecords: records.length,
    //   // records,
    // });

    return records;
  };
}

export const api = new APIWrapper();
