import axios, { AxiosInstance } from 'axios';
import { Crabada } from '../types';
import { config } from '../../config';
import { displayTable } from '../utils';

/**
 * A Wrapper that contains all the necessary functions for interacting
 * with crabadas idle subnet test https://idle-game-subnet-test.crabada.com
 * and mainnet https://play.crabada.com
 *
 * Author @dennohpeter
 */
class MiningWrapper {
  _instance: AxiosInstance;
  constructor() {
    this._instance = axios.create({
      baseURL: config.TEST_MODE
        ? `https://idle-game-subnet-test-api.crabada.com/public/idle`
        : `https://idle-api.crabada.com/public/idle`,
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
        crabada.price >= filter.min_price && crabada.price <= filter.max_price
      );
    });
  };
  /**
   * Fetches user's teams and filters them agains the given filters
   * @param params.orderBy - Field to order by
   * @param params.order - sort direction
   * @param params.page - page to start on
   * @param params.limit - teams per page
   * @param params.user_address - user to fetch their crabs
   * @param params.is_team_available - team availability `1` or `0`. `1` -
   * @returns Array of teams found `Team[]`
   */
  fetchMyTeams = async (params: {
    orderBy?: string;
    order?: string;
    page: string;
    limit: number;
    user_address: string;
    is_team_available?: number;
  }) => {
    return this._fetch('/teams', params);
  };
  /**
   * Fetches mining expenditions
   * @param params.user_address - user to fetch their mines
   * @param params.page - page to start on
   * @param params.limit - mines per page
   * @param params.status - mining status || my mines, options: `open` | ``
   * @param params.looter_address - looter address to get active mines
   * @param params.can_loot - whether you can loot this mine || global active mines
   * @returns Array of mines found `Mine[]`
   */
  fetchMiningExpeditions = async (params: {
    user_address?: string;
    page?: string;
    limit?: number;
    status?: string;
    can_loot?: boolean;
  }) => {
    return this._fetch('/mines', params);
  };

  /**
   * Fetches lendings from tarven
   * @param params.orderBy - Field to order by
   * @param params.order - sort direction
   * @param params.page - page to start on
   * @param params.limit - lendings per page
   * @param params.class_ids -  list of crabadas class ids
   * @param params.is_origin - whether crabada is origin
   * @param params.origin - crabada origin
   *
   * @returns
   */
  fetchLendings = async (params: {
    orderBy?: string;
    order?: string;
    page?: string;
    limit?: number;
    class_ids?: any;
    is_origin?: any;
    origin?: any;
    from_price?: number;
    to_price?: number;
  }): Promise<Crabada[]> => {
    return this._fetch('/crabadas/lending', params);
  };

  _fetch = async (url: string, params) => {
    let records = [];
    let currentPage = params.page;
    while (true) {
      try {
        console.log(
          `Fetching ${url.substring(url.lastIndexOf('/') + 1)} on page`,
          currentPage
        );
        let { data } = await this._instance({
          url,
          method: 'GET',
          params,
        });

        if (!data?.error_code) {
          let { data: record, totalRecord, totalPages, page } = data?.result;
          records = records.concat(record);

          if (totalPages == page) {
            break;
          }
          currentPage += 1;
          params.page = currentPage;
        } else {
          console.error(`Error:`, data?.error_code, data?.message);
          break;
        }
      } catch (error) {
        console.error(`Error:`, error);
        throw new Error(error);
      }
    }
    records = records.filter(Boolean);
    console.log({
      totalRecords: records.length,
      // records,
    });

    return records;
  };

  getBestMercenary = async (lendings: Crabada[]) => {
    const max_price = config.filters.maxPrice * Math.pow(10, 18);
    const min_price = config.filters.minPrice * Math.pow(10, 18);

    console.log({
      size: lendings.length,
      max_price,
      min_price,
    });
    let matches = lendings.filter((lending) => {
      return lending.price >= min_price && lending.price <= max_price;
    });

    // sort crabadas matches by mine_point(mp) and batte_point(bp) in descending order i.e
    // from highest to lowest
    matches = matches.sort(
      (l1, l2) =>
        (config.filters.mine_point && l2.mine_point - l1.mine_point) ||
        (config.filters.battle_point && l2.battle_point - l1.battle_point)
    );
    console.log({
      size: matches.length,
      max_price,
      min_price,
    });

    displayTable(matches);
    return matches.slice(0, 1);
  };
}

export const miningWrapper = new MiningWrapper();
