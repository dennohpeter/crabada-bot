import { config } from '../../config';

export const getLending = async (params: {
  orderBy: string;
  order: string;
  page: string;
  limit: number;
  class_ids: any;
  is_origin: any;
  origin: any;
}) => {
  let lendings = [];
  let page = params.page;
  while (true) {
    try {
      let { data } = await config.idle({
        url: 'lending',
        method: 'GET',
        params,
      });

      console.log(`Fetching lendings on page`, params.page);
      if (!data?.error_code) {
        let { data: lending, totalRecord, totalPages, page } = data?.result;
        lendings = lendings.concat(lending);

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
    totalRecords: lendings.length,
  });

  return lendings;
};
