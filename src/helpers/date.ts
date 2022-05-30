import dateFormat from 'dateformat';

/**
 * Formats a timestamp  to human readable format
 * @param timestamp_in_seconds - timestamp in seconds
 * @param pattern - format to represent the date
 * @returns human readable version of the timestamp
 */
export const formatDate = (
  timeStamp: number,
  pattern = `yyyy-mm-dd HH:MM:ss TT`
) => {
  return dateFormat(timeStamp, pattern);
};
