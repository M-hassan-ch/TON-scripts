import { internal, TonClient, WalletContractV4 } from "@ton/ton";
import { KeyPair, keyPairFromSeed, mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import fs from 'fs';
import { mnemonicToSeed } from "bip39";
import { HDKey } from "@scure/bip32";
import { getHttpEndpoint } from "@orbs-network/ton-access";

const endpoint = await getHttpEndpoint({ network: 'testnet' });
const TON_COIN_TYPE = 607;
const DERIVATION_PATH_BASE = `m/44'/${TON_COIN_TYPE}'/0'/0`;

async function createNativeTransfer(index: number) {
    const client = new TonClient({
        endpoint
    });
    const mnemonics = fs.readFileSync('./seeds-12.txt', 'utf8').split('\n');
    const seed = await mnemonicToSeed(mnemonics[0]);
    const masterKey = HDKey.fromMasterSeed(seed);
    const derivationPath = `${DERIVATION_PATH_BASE}/${index}`;
    const derivedKey = masterKey.derive(derivationPath);
    const keyPair: KeyPair = keyPairFromSeed(Buffer.from(derivedKey.privateKey as any));
    let wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    let contract = client.open(wallet);
    const rawAddress = wallet.address;
    const userFriendlyAddress = rawAddress.toString({
        bounceable: false,
        testOnly: true,
        urlSafe: true
    });

    console.log({
        rawAddress: rawAddress.toString(),
        userFriendlyAddress: userFriendlyAddress
    });

    let balance: bigint = await contract.getBalance();
    let seqno: number = await contract.getSeqno();

    console.log('Balance Before Transfer: ', { balance: Number(balance) / 10 ** 9, seqno });

    let transfer = await contract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [internal({
            value: '0.1',
            to: 'kQBJlcXb3w1tt89KcXhosvruyrfbBOxJFOenNcr4UCCdKYZ0',
            body: 'Hello world',
        })]
    })

    await contract.send(transfer);

    balance = await contract.getBalance();
    seqno = await contract.getSeqno();

    console.log('Balance After Transfer: ', { balance: Number(balance) / 10 ** 9, seqno });

    return { balance, seqno };
}

createNativeTransfer(2);