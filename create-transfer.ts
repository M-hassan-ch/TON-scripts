import { internal, SendMode } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import fs from 'fs';
import { getClient } from "./utils/get-client";
import { getWalletContract } from "./utils/get-wallet";


async function transferNative(receiverAddress: string) {
    const mnemonics = fs.readFileSync('./seeds-1.txt', 'utf8').split('\n');
    const keyPair = await mnemonicToPrivateKey(mnemonics[0].split(' '));
    const client = await getClient('testnet');
    const wallet = await getWalletContract(client, keyPair.publicKey);

    let balance: bigint = await wallet.getBalance();
    let seqno: number = await wallet.getSeqno();

    console.log('Balance Before Transfer: ', { balance: Number(balance) / 10 ** 9, seqno });

    let transfer = await wallet.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [internal({
            value: '0.01',
            to: receiverAddress,
            body: 'Hello world',
        })],
        sendMode: SendMode.PAY_GAS_SEPARATELY
    })

    await wallet.send(transfer);

    balance = await wallet.getBalance();
    seqno = await wallet.getSeqno();

    console.log('Balance After Transfer: ', { balance: Number(balance) / 10 ** 9, seqno });
}

transferNative('');