import { Address, SendMode, TonClient, internal, toNano } from "@ton/ton";
import { DEX, pTON } from "@ston-fi/sdk";
import { getClient } from "./utils/get-client";
import fs from 'fs';
import { getWalletContract } from "./utils/get-wallet";
import { mnemonicToPrivateKey } from "@ton/crypto";

async function ton_to_jetton_swap() {
  const client = await getClient('testnet');
  const mnemonics = fs.readFileSync('./seeds-1.txt', 'utf8').split('\n');
  const keyPair = await mnemonicToPrivateKey(mnemonics[0].split(' '));
  const wallet = await getWalletContract(client, keyPair.publicKey);

  const router = client.open(
    DEX.v2_1.Router.CPI.create(
      "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v" // CPI Router v2.1.0
    )
  );

  const proxyTon = pTON.v2_1.create(
    "kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px" // pTON v2.1.0
  );


  // swap 1 TON to TestRED but not less than 1 nano TestRED
  const txParams = await router.getSwapTonToJettonTxParams({
    userWalletAddress: wallet.address.toString(), // ! replace with your address
    proxyTon: proxyTon,
    offerAmount: toNano("0.1"),
    askJettonAddress: "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5", // TestRED
    minAskAmount: "1",
  });
  // and send it manually later
  const tx = await wallet.sendTransfer({
    seqno: await wallet.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal(txParams)],
    sendMode: SendMode.PAY_GAS_SEPARATELY,
  });

  console.log(tx);
}

async function jetton_to_jetton_swap() {
  const client = await getClient('testnet');
  const mnemonics = fs.readFileSync('./seeds-1.txt', 'utf8').split('\n');
  const keyPair = await mnemonicToPrivateKey(mnemonics[0].split(' '));
  const wallet = await getWalletContract(client, keyPair.publicKey);

  const router = client.open(
    DEX.v2_1.Router.CPI.create(
      "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v" // CPI Router v2.1.0
    )
  );

  const txParams = await router.getSwapJettonToJettonTxParams({
    userWalletAddress: wallet.address.toString(), // ! replace with your address
    offerJettonAddress: "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5", // TesREED
    offerAmount: "10",
    askJettonAddress: "kQB_TOJSB7q3-Jm1O8s0jKFtqLElZDPjATs5uJGsujcjznq3", // TestBlue
    minAskAmount: "1",
  });

  const tx = await wallet.sendTransfer({
    seqno: await wallet.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal(txParams)],
    sendMode: SendMode.PAY_GAS_SEPARATELY,
  });

  console.log(tx);
}

async function jetton_to_ton_swap() {
  const client = await getClient('testnet');
  const mnemonics = fs.readFileSync('./seeds-1.txt', 'utf8').split('\n');
  const keyPair = await mnemonicToPrivateKey(mnemonics[0].split(' '));
  const wallet = await getWalletContract(client, keyPair.publicKey);

  const router = client.open(
    DEX.v2_1.Router.CPI.create(
      "kQALh-JBBIKK7gr0o4AVf9JZnEsFndqO0qTCyT-D-yBsWk0v" // CPI Router v2.1.0
    )
  );

  const proxyTon = pTON.v2_1.create(
    "kQACS30DNoUQ7NfApPvzh7eBmSZ9L4ygJ-lkNWtba8TQT-Px" // pTON v2.1.0
  );

  // swap 1 TestRED to TON but not less than 1 nano TON
  const txParams = await router.getSwapJettonToTonTxParams({
    userWalletAddress: wallet.address.toString(), // ! replace with your address
    offerJettonAddress: "kQDLvsZol3juZyOAVG8tWsJntOxeEZWEaWCbbSjYakQpuYN5", // TestRED
    offerAmount: "10",
    minAskAmount: "1",
    proxyTon,
  });

  const tx = await wallet.sendTransfer({
    seqno: await wallet.getSeqno(),
    secretKey: keyPair.secretKey,
    messages: [internal(txParams)],
    sendMode: SendMode.PAY_GAS_SEPARATELY,
  });

  console.log(tx);
}
