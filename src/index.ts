process.env["REACT_APP_CLUSTER"] = "testnet";

import {
  Wormhole,
  WormholeAsset,
  WormholeActionType,
  WormholeAssetTransfer,
  WormholeChain,
  WormholeContractTransfer,
} from "./wormhole/wormhole";
import { WORMHOLE_RPC_HOSTS } from "./wormhole/consts";
import { initChain, ChainConfigs } from "./wormhole/helpers";
import { getAlgoConnection, getAlgoSigner } from "./wormhole/helpers"
import { getEthConnection, getEthSigner } from "./wormhole/helpers"
import { ethers } from "ethers";

(async function () {
  let client = getAlgoConnection();
  let acct = getAlgoSigner().getAddress();
  let transfer_amt = 0;
  (async () => {
    let acct_info = (await client.accountInformation(acct).do());
    acct_info.assets.forEach((element: any) => {
      if (element['asset-id'] == 90650110) {
        transfer_amt = element['amount'];
        if (transfer_amt > 1000) {
          console.log(transfer_amt);
          transfer_amt /= 10;
          // send Algorand(WETH, id 90650110) to Ethereum(WETH, id 0xc778417E063141139Fce010982780140Aa0cD5Ab)
          // 0.00000001 WETH
          // oneWayTripAssetTransfer(BigInt(90650110), BigInt(transfer_amt), "algorand", "ethereum", false); // ! true doesnt work
          // unwrap eth
          const abi = JSON.stringify([{
            "constant": false,
            "inputs": [
              {
                "name": "wad",
                "type": "uint256"
              }
            ],
            "name": "withdraw",
            "outputs": [
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          }]);
          const address = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
          const signer = getEthSigner(getEthConnection());
          const erc20_rw = new ethers.Contract(address, abi, signer);
          erc20_rw.withdraw(100)
          return;
        }
      }
    });
  })().catch(e => {
    console.log(e);
  })
})();

async function oneWayTripAssetTransfer(
  asset: string | bigint,
  amount: bigint,
  origin: string,
  destination: string,
  reverse_it: boolean
) {
  console.log('asset', asset, 'amount', amount, 'origin', origin, 'destination', destination);

  const [originChain, originSigner] = initChain(ChainConfigs[origin]);
  const [destChain, destSigner] = initChain(ChainConfigs[destination]);
  console.log('signers complete');

  // Main wh interface, allows for {mirror, transfer, and attest, receive, getVaa}
  const wh = new Wormhole(WORMHOLE_RPC_HOSTS);
  console.log('wormhole complete');

  // Get the destination asset
  const originAsset: WormholeAsset = { chain: originChain, contract: asset };
  const destAsset = await wh.getMirrored(originAsset, destChain);
  console.log('asset creation complete');
  console.log('origin asset', originAsset, 'dest asset', destAsset);


  // Prepare the transfer
  const xfer: WormholeAssetTransfer = {
    origin: originAsset,
    sender: originSigner,
    destination: destAsset,
    receiver: destSigner,
    amount: amount,
  };


  if (!reverse_it) {
    // Send it
    console.log(`Sending transfer from ${origin} to ${destination}`);
    console.time("xfer");
    await wh.perform({
      action: WormholeActionType.AssetTransfer,
      assetTransfer: xfer,
    });
    console.timeEnd("xfer");

  } else {
    // Prepare the opposite transfer
    const xferBack: WormholeAssetTransfer = {
      origin: xfer.destination,
      sender: xfer.receiver,
      destination: xfer.origin,
      receiver: xfer.sender,
      amount: amount,
    };

    // Send it
    console.log(`Sending transfer from ${destination} to ${origin}`);
    console.time("xferBack");
    await wh.perform({
      action: WormholeActionType.AssetTransfer,
      assetTransfer: xferBack,
    });
    console.timeEnd("xferBack");
  }
}

async function roundTripAsset(
  asset: string | bigint,
  amount: bigint,
  origin: string,
  destination: string
) {
  const [originChain, originSigner] = initChain(ChainConfigs[origin]);
  const [destChain, destSigner] = initChain(ChainConfigs[destination]);

  // Main wh interface, allows for {mirror, transfer, and attest, receive, getVaa}
  const wh = new Wormhole(WORMHOLE_RPC_HOSTS);

  // Get the destination asset
  const originAsset: WormholeAsset = { chain: originChain, contract: asset };
  const destAsset = await wh.getMirrored(originAsset, destChain);

  // Prepare the transfer
  const xfer: WormholeAssetTransfer = {
    origin: originAsset,
    sender: originSigner,
    destination: destAsset,
    receiver: destSigner,
    amount: amount,
  };

  // Send it
  console.log(`Sending transfer from ${origin} to ${destination}`);
  console.time("xfer");
  await wh.perform({
    action: WormholeActionType.AssetTransfer,
    assetTransfer: xfer,
  });
  console.timeEnd("xfer");

  // Prepare the opposite transfer
  const xferBack: WormholeAssetTransfer = {
    origin: xfer.destination,
    sender: xfer.receiver,
    destination: xfer.origin,
    receiver: xfer.sender,
    amount: amount,
  };

  // Send it
  console.log(`Sending transfer from ${destination} to ${origin}`);
  console.time("xferBack");
  await wh.perform({
    action: WormholeActionType.AssetTransfer,
    assetTransfer: xferBack,
  });
  console.timeEnd("xferBack");
}

async function contractTransfer(
  asset: bigint | string,
  amount: bigint,
  contract: bigint | string,
  origin: string,
  destination: string,
  payload: Uint8Array
) {
  const [originChain, originSigner] = initChain(ChainConfigs[origin]);
  const [destChain, destSigner] = initChain(ChainConfigs[destination]);

  const wh = new Wormhole(WORMHOLE_RPC_HOSTS);

  // The destination contract address
  const destinationContract = destChain.getAssetAsString(contract);

  const originAsset: WormholeAsset = { chain: originChain, contract: asset };
  const destAsset = await wh.getMirrored(originAsset, destChain)

  const cxfer: WormholeContractTransfer = {
    transfer: {
      origin: originAsset,
      sender: originSigner,
      destination: destAsset,
      receiver: destSigner,
      amount: amount,
    },
    contract: destinationContract,
    payload: payload,
  };

  console.log(`Sending contract transfer from ${origin} to ${destination}`);
  const seq = await originChain.contractTransfer(cxfer);
  //const seq = "99"

  console.log(`Getting VAA for Sequence number: ${seq}`)
  const receipt = await wh.getVAA(seq, originChain, destChain)

  console.log(`Redeeming contract transfer on ${destination}`);
  await destChain.contractRedeem(destSigner, receipt, destAsset)
}
