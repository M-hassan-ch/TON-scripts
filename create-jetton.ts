import { AssetsSDK, createApi, createSender, importKey, PinataStorageParams } from '@ton-community/assets-sdk';
import { toNano } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient } from '@ton/ton';
import {  HighloadWalletContractV2 } from "ton-highload-wallet-contract";
import fs from 'fs';

async function deployWallet() {
  const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC' });
  const mnemonic = fs.readFileSync('./seeds-1.txt', 'utf8');
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = HighloadWalletContractV2.create({ workchain: 0, publicKey: keyPair.publicKey });
  const contract = client.open(wallet);
  console.log('Wallet deployed at:', wallet.address);
  // await contract.sendTransfer({
  //   secretKey: keyPair.secretKey,
  //   messages: [internal({
  //     to: 'kQDb3axXrinnvA2TKJrnOMLjvrh28aIoq6YSpIqyOUAMQu0J',
  //     value: '0',
  //     body: 'Deploy',
  //     bounce: false,
  //   })],
  // });
}

async function deployJetton() {
  const NETWORK = 'testnet';
  const api = await createApi(NETWORK);

  const mnemonic = fs.readFileSync('./seeds-1.txt', 'utf8');
  const keyPair = await importKey(mnemonic);
  const sender = await createSender('highload-v2', keyPair, api);

  const storage: PinataStorageParams = {
    pinataApiKey: '7f76b15e31102dcdde82',
    pinataSecretKey: '2b78566a0618fd35346f1bf07892eb70ea3f9e3c995739d36013d2e08733d0b1',
  };

  const sdk = AssetsSDK.create({
    api,
    storage,
    sender,
  });

  console.log('Using wallet', sdk.sender?.address);

  const jetton = await sdk.deployJetton({
    name: 'MyCustomToken',
    decimals: 9,
    description: 'A simple custom token on TON',
    symbol: 'MCT',
  }, {
    adminAddress: sender.address,
    premintAmount: toNano('1000000'),
  });

  console.log(`Jetton deployed at: ${jetton.address}`);
}

deployJetton().catch(console.error);
// deployWallet().catch(console.error);