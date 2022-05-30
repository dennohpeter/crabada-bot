const padTime = (time: number) => {
  return String(time).length === 1 ? `0${time}` : `${time}`;
};

export const displayRemainingTime = (seconds: number) => {
  let days = '0';
  let hours = '0';
  let mins = '0';
  let secs = '0';

  if (seconds > 0) {
    days = padTime(Math.floor(seconds / (60 * 60 * 24)));
    seconds %= 60 * 60 * 24;

    hours = padTime(Math.floor(seconds / (60 * 60)));
    seconds %= 60 * 60;

    mins = padTime(Math.floor(seconds / 60));
    seconds %= 60;

    secs = padTime(seconds);
  }
  let time: Record<string, string> = {};
  if (Number(days) > 0) {
    time.days = days;
  }
  if (Number(hours) > 0) {
    time.hours = hours;
  }
  if (Number(mins) > 0) {
    time.mins = mins;
  }
  if (Number(secs) > 0) {
    time.secs = secs;
  }

  return time;
};
