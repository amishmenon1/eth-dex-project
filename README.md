# EthSwap DEX Project

_THIS PROJECT IS FOR DEVELOPMENT AND TESTING ONLY_

This EthSwap DEX allows you to swap between ETH and a custom token using a local testnet via Ganache.

## Prerequisites

1. Node version 10.15.0 / npm version 6.4.1
   - if you have multiple versions, you can use NVM to switch between them
   - if `nvm` is not accessible globally in your terminal, you can run:
     - `source ~/.nvm/nvm.sh`
     - then you can run `nvm use 10.5.0`
2. Truffle version 5.0.0 (core: 5.0.0)
3. Solidity version 0.5.0 (solc-js)
4. identicon.js version 2.3.3
5. Ganache version 2.5.4 (2.5.4.1367)

## Setup

1. Install identicon.js version 2.3.3

   - `npm install identicon.js@^2.3.3`

2. Install project dependencies

   - `npm install`

3. Ensure Ganache is running and the port matches `networks.development.port` in `truffle-config.js`

4. Compile the smart contracts and migrate them into the build ("/abis") folder

   - `truffle compile`
   - `truffle migrate`

5. Open a separate terminal within the project and run the node server
   - `npm run start`

## Upon Successful Load

![EthSwap Home Page](home-page-screenshot.png "EthSwap DEX")
