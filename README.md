# Crabada Mining Bot

# INSTALL

1. Open a terminal or commandline and `git clone git@github.com:JoshuaGX/carbada_mining_bot.git`
2. change directory to `crabada_mining_bot` in your terminal
   `cd crabada_mining_bot`

3. Install deps by running, (this assumes you have installed nodejs and optionallly yarn)
   `yarn install`

   NB: if you have not installed yarn, install deps by running `npm install instead`

# SETUP

1. Rename `.env.example` to `.env`
2. Open .env and set your wallet public key and private key
   // NB Private is needed to sign tx automatically
3. Once done open `config.ts`
4. On `config.ts` check `filters`, `DELAY_B4_REINFORCEMENT_IN_MIN` and `TEST_MODE` and ensure they are set correctly before running the bot

   `filters` - The are filters that are used to filter lendings from tarven to select the best mercenary for reinforcement

   `DELAY_B4_REINFORCEMENT_IN_MIN` - Minutes to wait before sending a reinforcement

   `TEST_MODE` - `true` for when on testnet i.e Swimmer Network and false for when on mainnet i.e Avalanche Mainet
