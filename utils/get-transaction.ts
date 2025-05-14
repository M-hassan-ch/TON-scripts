import { Message } from "@ton/ton";
import { normalizeHash } from "./normalize-hash";
import { TonApiClient } from "@ton-api/client";

export async function getTransactionDetails(ta: TonApiClient, externalMessage: Message) {
    try {
        const manualExtMessageHash = normalizeHash(externalMessage, true);
        console.log('Manual Message Hash:', manualExtMessageHash.toString('hex'));
        const manualTransaction = await ta.blockchain.getBlockchainTransactionByMessageHash(
        manualExtMessageHash.toString('hex')
        );
        console.log('Manual Transaction Details:', manualTransaction.hash, manualTransaction.inMsg?.decodedBody?.seqno);
        return manualTransaction;
    } catch (error) {
        console.error("Error getting transaction details: ", error);
        throw error;
    }
}