const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

const REWARD_INPUT= {address: "*authorized_reward*"};

const MINING_REWARD = 50;

const STARTING_BALANCE = 1000;
////"dev": "npm run start-redis && nodemon index.js",

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, MINING_REWARD, REWARD_INPUT};
