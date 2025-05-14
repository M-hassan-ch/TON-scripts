import { TonApiClient } from "@ton-api/client";
import { ContractAdapter } from "@ton-api/ton-adapter";


export const ta = new TonApiClient({
    baseUrl: 'https://testnet.tonapi.io' // 'https://tonapi.io'
    // apiKey: 'YOUR_API_KEY', // Optional, improves request limits and access
});

export const adapter = new ContractAdapter(ta);