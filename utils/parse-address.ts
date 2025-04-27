import { Address } from "@ton/core";

export function parseAddress(address: string, bounceable: boolean = false, testOnly: boolean = false, urlSafe: boolean = true) {
    return Address.parse(address).toString({
        bounceable,
        testOnly,
        urlSafe,
    });
}

