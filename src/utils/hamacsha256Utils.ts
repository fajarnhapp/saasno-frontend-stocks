export async function hmacSha256(data: string, key: string): Promise<string> {
    const enc = new TextEncoder()
    const keyData = enc.encode(key)
    const msgData = enc.encode(data)

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
    return Buffer.from(signature).toString('hex')
}
