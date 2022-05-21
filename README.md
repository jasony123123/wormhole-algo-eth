# Usage

**Setup**

- clone repo. `git clone https://github.com/jasony123123/wormhole-algo-eth.git`
- install node. `sudo apt install curl`, `curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`, `source ~/.profile`, `nvm install 16`.

**Use**

- set enviornment variables. `export ALGORAND_SEEDPHRASE="word word ..."`, `export ETH_PRIVATE_KEY="0x..."`.
- set run parameters. inside `src/index.ts`, `ALGORAND_WETH_AMNT_THRESHOLD = 123...`, `TESTING = true/false`, `TIME_PERIOD = 5`.
- run `npm run bridger`. every `$TIME_PERIOD` minutes, code will run to check the algorand wallet at `$ALGORAND_SEEDPHRASE` and if the amount of WETH exceeds `$ALGORAND_WETH_AMNT_THRESHOLD`, the code will bridge over all (or 10% if `$TESTING` is true) of the WETH to the ethereum wallet at `$ETH_PRIVATE_KEY` as WETH.

Example ropsten / algorand testnet:
- `ALGORAND_SEEDPHRASE="tenant helmet motor sauce appear buddy gloom park average glory course wire buyer ostrich history time refuse room blame oxygen film diamond confirm ability spirit"`
- `ETH_PRIVATE_KEY="0x3f493e59e81db1be4ebbe18b28ba8fdd066ef44139420ead59f37f5dacb80719"`

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
