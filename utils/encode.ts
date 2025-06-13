export function encodeSecretKeyToBase64(secretKeyBuffer: Buffer): string {
    return secretKeyBuffer.toString('base64');
}