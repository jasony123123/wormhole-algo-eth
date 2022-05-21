# Usage

**Setup**

- clone repo. `git clone https://github.com/jasony123123/wormhole-algo-eth.git`
- install node. `sudo apt install curl`, `curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`, `source ~/.profile`, `nvm install 16`.

**Use**

- set enviornment variables. `export ALGORAND_SEEDPHRASE="word word ..."`. Must have WETH enabled (id 90650110), and some ALGO
- eth env variable `export ETH_PRIVATE_KEY="0x..."`. must have some eth. Must use this wallet and goto [here](https://ropsten.etherscan.io/token/0xc778417e063141139fce010982780140aa0cd5ab#writeContract) and hit `approve` with the staking contract address (0x88b9E8a6211466aF42B1D92402d4075dE6cf2ffe) and wad (115792089237316195423570985008687907853269984665640564039457584007913129639935).
- set run parameters. inside `src/index.ts`, `ALGORAND_WETH_AMNT_THRESHOLD = 123...`, `TESTING = true/false`. make sure `STAKING_CONTRACT_ADDRESS` and `STAKING_CONTRACT_ABI` are ok.
- run `npm run bridger`

Demo prep for wormhole hackathon (https://www.activate.build/miami)

[Github](https://github.com/certusone/wormhole)

[NPM](https://www.npmjs.com/package/@certusone/wormhole-sdk)

[Testnet Bridge](https://certusone.github.io/wormhole/#/transfer)

[Production Bridge](https://www.portalbridge.com/#/transfer)


Wormhole is a multisig bridge with 19 "guardian" validators that watch blocks on the chains they're connected to. When they see a relevant transaction on some originating chain, they sign a VAA. Once a sufficient number of the guardians sign the VAA it can be passed to the target chain to create an asset or claim tokens for an asset.


Run with
``` use azure vm, use node 16 ```

```sh
git clone https://github.com/algorand-devrel/wormhole-demo 
cd wormhole-demo
npm install
```

Tweak the keys and clients in `src/wormhole/helpers.ts`
Tweak the method calls in index.ts
```sh
npm run demo
```


### TODO:

Nontrivial demos:

    - [ ]  message service where specific token xfer w/note represents a message? 

    - [ ]  xfer oracle data like randomness?

    - [ ]  X chain DLL ("why would you do this?")


Testing?

ContractTransfer/Redeem w/ !Algorand chains

#### Chains

- [x] Algorand
- [x] Ethereum
- [x] Solana
- [x] Avalanche

// ABUILD49, QuickNode API Credits
