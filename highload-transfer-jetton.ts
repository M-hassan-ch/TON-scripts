import { AssetsSDK, createApi, createSender, importKey } from '@ton-community/assets-sdk';
import { Address, internal, toNano } from '@ton/core';
import fs from 'fs';

async function transferJetton() {
    const NETWORK = 'testnet';
    const api = await createApi(NETWORK);

    const mnemonic = fs.readFileSync('./seeds-1.txt', 'utf8');
    const keyPair = await importKey(mnemonic);
    const sender = await createSender('highload-v2', keyPair, api);

    const sdk = AssetsSDK.create({
        api,
        sender,
    });

    const jettonAddress = 'EQCS26P5WyHZ4gzuYnb4yDOvFOSFG1A1VZMi79w51uEBB823'; // Replace with your Jetton address
    const recipientAddress = 'EQDwWxN4IAYh0wL0hC8pVmQ2JE23xTb5rW7fss7oNPZ74lew'; // Replace with recipient's address

    const jetton = await sdk.openJetton(Address.parse(jettonAddress));
    const jettonWallet = await jetton.getWallet(sdk.sender?.address!);

    const receicerJettonWallet = await jetton.getWalletAddress(Address.parse(recipientAddress));

    console.log({
        jettonAddress,
        senderAddress: sdk.sender?.address,
        recipientAddress,
        receicerJettonWallet,
    });

    await jettonWallet.send(
        sender,
        Address.parse(recipientAddress),
        toNano('10000'),
    );

    console.log('Transfer successful!');
}

transferJetton().catch(console.error);