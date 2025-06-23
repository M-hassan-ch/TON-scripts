export function decode(base64String: string): Buffer {
    return Buffer.from(base64String, 'base64');
}