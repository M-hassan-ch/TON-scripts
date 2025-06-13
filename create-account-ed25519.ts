import { mnemonicNew, mnemonicToSeed, getED25519MasterKeyFromSeed, deriveED25519HardenedKey, keyPairFromSeed, mnemonicToPrivateKey, keyPairFromSecretKey } from '@ton/crypto';
import { Address, WalletContractV5R1 } from '@ton/ton';
import { getClient } from './utils/get-client';
import { getWalletContract } from './utils/get-wallet';
import { encodeSecretKeyToBase64 } from './utils/encode';
import { decodeBase64ToSecretKey } from './utils/decode';

interface WalletDetails {
    derivationPath: string;
    publicKey: string;
    privateKey: string;
    testnetAddress: string;
    mainnetAddress: string;
}

const client = await getClient('mainnet');

async function generateKeyPairFromSeed(seeds: string[]) {
    let keyPair = await mnemonicToPrivateKey(seeds);
    let wallet = await getWalletContract(client, keyPair.publicKey);

    const testnetAddress = wallet.address?.toString({
        testOnly: true,
        bounceable: false
    });

    const mainnetAddress = wallet.address.toString({
        testOnly: false,
        bounceable: false
    });

    console.log("Master wallet: ", {
        rawAddress: wallet.address.toRawString(),
        // publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        // privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
        testnetAddress,
        mainnetAddress
    }, '\n');
    return keyPair;
}

async function generateKeyPairFromSecretKey(base64SecretKey: string) {
    const rawSecretKey = decodeBase64ToSecretKey(base64SecretKey);
    let keyPair = keyPairFromSecretKey(rawSecretKey);
    let wallet = await getWalletContract(client, keyPair.publicKey);

    const testnetAddress = wallet.address?.toString({
        testOnly: true,
        bounceable: false
    });

    const mainnetAddress = wallet.address.toString({
        testOnly: false,
        bounceable: false
    });

    console.log("Master wallet: ", {
        rawAddress: wallet.address.toRawString(),
        // publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        // privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
        testnetAddress,
        mainnetAddress
    }, '\n');
    return keyPair;
}

async function createTonkeeperWallets(count: number = 3): Promise<{ mnemonic: string; wallets: WalletDetails[] }> {
    try {
        // const mnemonic = await mnemonicNew(24);
        const mnemonic = 'upset until follow capital breeze hope wink suit spell joy desert slender round diagram sun fiscal adapt decade finger century wrap example riot usual'.split(' ');
        const secretKey = 'ZsmkEXGXvBY9ttPI15rhpRlqkS6tbHxhDxRR6+SrWxxqxqCQcfHZZSI5YvQMPMdUH9Sv+Bh/i/ZvXD4K47DGEw==';
        const mnemonicString = mnemonic.join(' ');
        const seed = await mnemonicToSeed(mnemonic, "mnemonic");
        const masterKey = await getED25519MasterKeyFromSeed(seed);
        const wallets: WalletDetails[] = [];

        await generateKeyPairFromSeed(mnemonic);
        await generateKeyPairFromSecretKey(secretKey);

        for (let index = 0; index < count; index++) {
            const derivedKey = await deriveED25519HardenedKey(masterKey, index);
            const keyPair = keyPairFromSeed(derivedKey.key);

            // Create wallet contract
            let wallet = WalletContractV5R1.create({
                publicKey: keyPair.publicKey,
                workchain: 0,
            });
            let contract = client.open(wallet);

            const testnetAddress = wallet.address?.toString({
                testOnly: true,
                bounceable: false
            });

            const mainnetAddress = contract.address.toString({
                testOnly: false,
                bounceable: false
            });

            wallets.push({
                derivationPath: `m/44'/607'/0'/0/${index}`,
                publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
                privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
                testnetAddress,
                mainnetAddress
            });
        }

        return {
            mnemonic: mnemonicString,
            wallets
        };
    } catch (error) {
        console.error('Error generating wallets:', error);
        throw error;
    }
}

async function main() {
    try {
        const { mnemonic, wallets } = await createTonkeeperWallets(1);

        console.log('Generated Mnemonic:', mnemonic);
        console.log('Generated Wallets:');
        wallets.forEach((wallet, index) => {
            console.log(`\nWallet ${index + 1} (Path: ${wallet.derivationPath}):`);
            console.log(`  Public Key: ${wallet.publicKey}`);
            console.log(`  Private Key: ${wallet.privateKey}`);
            console.log(`  Testnet Address: ${wallet.testnetAddress}`);
            console.log(`  Mainnet Address: ${wallet.mainnetAddress}`);
        });
    } catch (error) {
        console.error('Main execution error:', error);
    }
}

main();