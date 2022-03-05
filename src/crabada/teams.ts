import { config } from '../../config';

export const myTeams = async (params: {
  orderBy?: string;
  order?: string;
  page: string;
  limit: number;
  user_address: string;
}) => {
  let teams = [];
  let page = params.page;
  while (true) {
    try {
      let { data } = await config.idle({
        url: 'teams',
        method: 'GET',
        params,
      });

      console.log(`Fetching teams on page`, params.page);
      if (!data?.error_code) {
        let { data: team, totalRecord, totalPages, page } = data?.result;
        teams = teams.concat(team);

        if (totalPages == page) {
          break;
        }

        page++;
        params.page = page;
      } else {
        console.error(`Error:`, data?.error_code, data?.message);
        break;
      }
    } catch (error) {
      console.error(`Error:`, error);
      throw new Error(error);
    }
  }
  console.log({
    totalRecords: teams.length,
  });

  return teams;
};
export const createTeam = async () => {};

export const withdrawTeam = async () => {};

export const transferCrabadaFromInvetory = async () => {};

export const canJoinTeam = async (params: { user_address: string }) => {
  try {
    let { data } = await config.idle({
      url: 'teams',
      method: 'GET',
      params,
    });

    if (!data?.error_code) {
      let { data: status, totalRecord, totalPages, page } = data?.result;
    } else {
      console.error(`Error:`, data?.error_code, data?.message);
      throw new Error(data?.message);
    }
  } catch (error) {
    console.log(`Error:`, error);
    throw new Error(error);
  }
};
