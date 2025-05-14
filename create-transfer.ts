import { Address, internal, external, SendMode, WalletContractV5R1 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import fs from 'fs';
import { ta, adapter } from "./utils/tonapi-client";
import { getTransactionDetails } from "./utils/get-transaction";
import { delay } from "./utils/delay";


async function transferNative(receiverAddress: string) {
    const mnemonics = fs.readFileSync('./seeds-1.txt', 'utf8').split('\n');
    const keyPair = await mnemonicToPrivateKey(mnemonics[0].split(' '));
    // const client = await getClient('testnet');
    // const wallet = await getWalletContract(client, keyPair.publicKey);
    const Wallet = WalletContractV5R1.create({ workchain: 0, publicKey: keyPair.publicKey });
    const wallet = adapter.open(Wallet);

    let balance: bigint = await wallet.getBalance();
    let seqno: number = await wallet.getSeqno();

    console.log('Sender Address: ', wallet.address.toString());
    console.log('Receiver Address: ', receiverAddress);
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

    await delay(10000);

    balance = await wallet.getBalance();
    seqno = await wallet.getSeqno();

    console.log('Balance After Transfer: ', { balance: Number(balance) / 10 ** 9, seqno });

    // Getting the transaction my message hash
    const extMessage = external({
        to: wallet.address,
        body: transfer
    });
    await getTransactionDetails(ta, extMessage);
}

transferNative('kQDwWxN4IAYh0wL0hC8pVmQ2JE23xTb5rW7fss7oNPZ74uw6');