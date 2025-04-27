import { getWalletContract } from "./get-wallet";
import { TonClient } from "@ton/ton";

export async function getBalance(client: TonClient, publicKey: Buffer<ArrayBufferLike>) {
    try {
        const wallet = await getWalletContract(client, publicKey);
        let balance: bigint = await wallet.getBalance();
        let seqno: number = await wallet.getSeqno();
        return { balance: Number(balance), seqno };
    } catch (error) {
        console.error("Error getting balance: ", error);
        throw error;
    }
}
