import axios from 'axios';

export const config = {
  idle: axios.create({
    baseURL: 'https://idle-api.crabada.com/public/idle/crabadas/',
  }),
  api: axios.create({
    baseURL: 'https://api.crabada.com/public/crabadas/',
  }),
};
