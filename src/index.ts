import { getLending } from './crabada';

/**
 *
 */
const Main = async () => {
  let filters = {
    orderBy: 'price',
    order: 'asc',
    page: '1',
    limit: 1000,
    class_ids: undefined,
    is_origin: undefined,
    origin: undefined,
  };
  await getLending(filters);
};

Main();
