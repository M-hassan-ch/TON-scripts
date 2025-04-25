import { mnemonicNew, mnemonicToSeed, getED25519MasterKeyFromSeed, deriveED25519HardenedKey, keyPairFromSeed } from '@ton/crypto';
import { TonClient, WalletContractV4 } from '@ton/ton';

// Interface for wallet details
interface WalletDetails {
    derivationPath: string;
    publicKey: string;
    privateKey: string;
    testnetAddress: string;
    mainnetAddress: string;
}

const client = new TonClient({
    endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});


async function createTonkeeperWallets(count: number = 3): Promise<{ mnemonic: string; wallets: WalletDetails[] }> {
    try {
        // const mnemonic = await mnemonicNew(24);
        const mnemonic = 'upset until follow capital breeze hope wink suit spell joy desert slender round diagram sun fiscal adapt decade finger century wrap example riot usual'.split(' ');
        const mnemonicString = mnemonic.join(' ');
        const seed = await mnemonicToSeed(mnemonic, "mnemonic");
        const masterKey = await getED25519MasterKeyFromSeed(seed);

        const wallets: WalletDetails[] = [];
        for (let index = 0; index < count; index++) {
            const derivedKey = await deriveED25519HardenedKey(masterKey, index);
            const keyPair = keyPairFromSeed(derivedKey.key);

            const wallet = WalletContractV4.create({
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
                privateKey: Buffer.from(keyPair.secretKey).slice(0, 32).toString('hex'),
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
        const { mnemonic, wallets } = await createTonkeeperWallets(3);

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