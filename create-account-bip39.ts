import * as bip39 from 'bip39';
import { mnemonicToSeed } from 'bip39';
import { HDKey } from '@scure/bip32';
import { KeyPair, keyPairFromSeed, mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient, WalletContractV4 } from '@ton/ton';

// Configuration for TON derivation
const TON_COIN_TYPE = 607; // TON's BIP-44 coin type
const DERIVATION_PATH_BASE = `m/44'/${TON_COIN_TYPE}'/0'/0`;

const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});

interface WalletDetails {
    index: number;
    publicKey: Buffer;
    privateKey: Buffer;
    walletAddress: string;
    userFriendlyAddress: string;
    derivationPath: string;
}

async function createTonWallets(
    mnemonic: string,
    numberOfWallets: number,
    network: 'mainnet' | 'testnet'
): Promise<WalletDetails[]> {
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
    }

    const seed = await mnemonicToSeed(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const wallets: WalletDetails[] = [];

    for (let index = 0; index < numberOfWallets; index++) {
        const derivationPath = `${DERIVATION_PATH_BASE}/${index}`;
        const derivedKey = masterKey.derive(derivationPath);

        if (!derivedKey.privateKey) {
            throw new Error(`Failed to derive private key at path: ${derivationPath}`);
        }

        const keyPair: KeyPair = keyPairFromSeed(Buffer.from(derivedKey.privateKey));

        const wallet = WalletContractV4.create({
            publicKey: keyPair.publicKey,
            workchain: 0, 
        });
        let contract = client.open(wallet);

        const userFriendlyAddress = contract.address.toString({
            bounceable: false,
            testOnly: true,
            urlSafe: true
        });

        const walletAddress = wallet.address.toString({
            testOnly: network === 'testnet',
        });

        wallets.push({
            index,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.secretKey,
            walletAddress,
            userFriendlyAddress,
            derivationPath,
        });
    }

    return wallets;
}

// Example usage
async function main() {
    const numberOfWallets = 2;
    // const mnemonic = await mnemonicNew(256);
    const mnemonic = 'olympic comfort diamond cute pool cactus cement stay exchange few flight series medal vibrant arrange advice interest help camp welcome brass garage theory gas'.split(' ');
    console.log({ mnemonic: mnemonic.join(' ') });

    try {
        const wallets = await createTonWallets(mnemonic.join(' '), numberOfWallets, 'testnet');

        wallets.forEach((wallet) => {
            console.log(`\nWallet ${wallet.index}:`);
            console.log(`Derivation Path: ${wallet.derivationPath}`);
            console.log(`Public Key: ${wallet.publicKey.toString('hex')}`);
            console.log(`Private Key: ${wallet.privateKey.toString('hex')}`);
            console.log(`Wallet Address: ${wallet.walletAddress}`);
            console.log(`User Friendly Address: ${wallet.userFriendlyAddress}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

main();