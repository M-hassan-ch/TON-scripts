import { decode } from "./utils/decode";
import { WalletContractV5R1 } from "@ton/ton";

async function generateAddressFromPublicKey(encodedPublicKey: string, workchain: number, testOnly: boolean, bounceable: boolean) : Promise<string> {
    const decodedPublicKey = decode(encodedPublicKey);
    let wallet = WalletContractV5R1.create({
        publicKey: decodedPublicKey,
        workchain,
    });
    const walletAddress = wallet.address.toString({
        testOnly,
        bounceable
    });
    console.log(walletAddress);
    return walletAddress;
}

generateAddressFromPublicKey('asagkHHx2WUiOWL0DDzHVB/Ur/gYf4v2b1w+CuOwxhM=', 0, true, false);