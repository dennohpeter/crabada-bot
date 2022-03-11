#### OVERVIEW

Some further details on the job. I am looking at making a bot to directly interact with the smart contract in a Play 2 Earn Crypto game on crabada.
The game is called Crabada, the site of the game is https://play.crabada.com/
Whitepaper with contract information: https://docs.crabada.com/
I need 2 bots or a bot that can handle multiple different actions.
There are two elements to the game, mining and looting. This is an axie like game with teams of 3 nft characters in team combinations with varying bonuses.

#### MINING #1

Mining requires 4 steps: This is largely an idle game with just 2 steps in between beginning games

1. Selecting the team to begin the mine
2. Reinforcing - Hiring a defender from the "tavern" to protect the mine
3. Reincforing Round 2 - Same as above
4. Claim - Game ends after 3.5/4 hours depending on team with either a win or loss depending on reinforment strength which gave a ~35-37% Chance to win, Capped at 40%
   Restart the above loop, select team and begin mining again

The reinforcement step shows you a list of available crabs to hire that are rented out by other players with varying stats and costs

`CRITERIA`
Need to have an ability to view entire available list of crabs for hire (can be 1,000+ at a time) and **create a criteria for which to hire the best crab based on stats and cost**

Criteria relatively simple for reinforcements,

- costs <20 (tus)
- highest MP but >70 (type of stat),
- tiebreak based on highest BP(other stat)

`Mining Features`

- Handle multiple teams
- Handle multiple reinforcements
- Allow the mining process which can begin every 3.5/4 hours to **continously** mine 24/7

#### LOOTING #2

Looting: This is trickier, there are bots doing this competing against you and there are "anti bot" measures coming out at some point.
Looting is the process of attacking a mine. This is more profitable than mining but is currently nearly impossible due to trying to compete against a bot. The bots are getting the contract info from the contract list before the UI of the game loads the teams, and "looting" the mine before humans have a chance to react.
Looting needs to be done extremely quickly, but given the likelihood of failures here given competition. You need to be able to control the gas effectively here and make sure the bot doesnt burn excess AVAX on gas fees when the network gets too congested and there are repeated failures.
