require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("dotenv").config()

module.exports = {
  solidity: "0.8.9",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    feeCollector: {
      default: 0,
    },
  },
  networks: {
    lukso: {
      url: "https://rpc.l16.lukso.network",
      chainId: 2828,
      accounts: [process.env.L16_PRIVATE_KEY],
      gasPrice: 100000000000 //100 gwei
    },
  }
};
