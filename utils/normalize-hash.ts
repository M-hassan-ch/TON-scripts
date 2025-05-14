import { Message } from "@ton/ton";
import { beginCell } from "@ton/core";


export function normalizeHash(message: Message, normalizeExternal: boolean): Buffer {
    try {
        if (!normalizeExternal || message.info.type !== 'external-in') {
            return message.body.hash();
        }

        // Create a new cell for the normalized message
        let cell = beginCell()
            .storeUint(2, 2) // Message type: external-in
            .storeUint(0, 2) // No sender address for external messages
            .storeAddress(message.info.dest) // Store recipient address
            .storeUint(0, 4) // Import fee is always zero for external messages
            .storeBit(false) // No StateInit in this message
            .storeBit(true) // Store the body as a reference
            .storeRef(message.body) // Store the message body
            .endCell();

        return cell.hash();
    } catch (error) {
        console.error("Error normalizing hash: ", error);
        throw error;
    }
}
