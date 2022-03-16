import moment from 'moment';

/**
 * Formats a timestamp  to human readable format
 * @param timestamp_in_seconds - timestamp in seconds
 * @param pattern - format to represent the date
 * @returns human readable version of the timestamp
 */
export const formatDate = (
  timestamp_in_seconds: number | number,
  pattern = `YYYY-MM-DD HH:mm:ss`
) => {
  return moment(timestamp_in_seconds * 1_000).format(pattern);
};
