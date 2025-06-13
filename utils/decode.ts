export function decodeBase64ToSecretKey(base64String: string): Buffer {
    return Buffer.from(base64String, 'base64');
}