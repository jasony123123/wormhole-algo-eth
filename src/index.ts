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
import { getAlgoConnection, getAlgoSigner } from "./wormhole/helpers";

// modify these
const ALGORAND_WETH_AMNT_THRESHOLD = 100; // units of * 0.00000001 WETH
const TESTING = true;
const TIME_PERIOD = 2.5; // in minutes

const ALGORAND_WETH_ID = 90650110; // on ethereum-ropsten, WETH has address 0xc778417E063141139Fce010982780140Aa0cD5Ab

var minutes = TIME_PERIOD, the_interval = minutes * 60 * 1000;
setInterval(function () {
  console.log("------- anotha one -------");
  (async function () {
    let client = getAlgoConnection();
    let acct = getAlgoSigner().getAddress();
    console.log('algorand account', acct);
    let transfer_amt = 0;
    (async () => {
      let acct_info = (await client.accountInformation(acct).do());
      acct_info.assets.forEach((element: any) => {
        if (element['asset-id'] == ALGORAND_WETH_ID) {
          transfer_amt = element['amount'];
          console.log('algorand WETH amt & threshold', transfer_amt, ALGORAND_WETH_AMNT_THRESHOLD);
          if (transfer_amt >= ALGORAND_WETH_AMNT_THRESHOLD) {
            if (TESTING)
              transfer_amt = Math.floor(transfer_amt / 10);
            oneWayTripAssetTransfer(BigInt(ALGORAND_WETH_ID), BigInt(transfer_amt), "algorand", "ethereum", false); // true doesnt work
            return;
          }
        }
      });
    })().catch(e => {
      console.log(e);
    })
  })();
}, the_interval);

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
