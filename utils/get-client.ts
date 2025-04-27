import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

export async function getClient(network: 'testnet' | 'mainnet') {
    try {
        const endpoint = await getHttpEndpoint({ network });
        const client = new TonClient({
            endpoint
        });
        return client;
    } catch (error) {
        console.error("Error getting TON client: ", error);
        throw error;
    }
}