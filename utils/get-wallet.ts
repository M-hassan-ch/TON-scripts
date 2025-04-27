import { TonClient, WalletContractV5R1 } from "@ton/ton";

export async function getWalletContract(client: TonClient, publicKey: Buffer<ArrayBufferLike>, workchain: number = 0) {
    try {
        let wallet = WalletContractV5R1.create({
            publicKey,
            workchain,
        });
        let contract = client.open(wallet);
        return contract;
    } catch (error) {
        console.error("Error getting wallet contract: ", error);
        throw error;
    }
}