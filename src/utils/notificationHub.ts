// Daftar koneksi SSE per user, di memori proses ini. Disimpan di globalThis karena route push dan route stream
// dibundel terpisah (dan dimuat ulang oleh HMR di dev), tetapi harus melihat daftar yang sama.
// Satu proses saja: bila frontend dijalankan di beberapa instance, push harus disebar lewat pub/sub (mis. Redis).
type Client = { send: (chunk: string) => void };

declare global {
    var __notificationClients: Map<string, Set<Client>> | undefined;
}

function clients(): Map<string, Set<Client>> {
    if (!globalThis.__notificationClients) {
        globalThis.__notificationClients = new Map();
    }
    return globalThis.__notificationClients;
}

export function addNotificationClient(userId: string, client: Client): () => void {
    const map = clients();
    const set = map.get(userId) ?? new Set<Client>();
    set.add(client);
    map.set(userId, set);
    return () => {
        set.delete(client);
        if (set.size === 0 && map.get(userId) === set) map.delete(userId);
    };
}

// Mengabari hanya koneksi milik user penerima. Mengembalikan jumlah user yang punya koneksi aktif.
export function pushNewNotification(userIds: string[]): number {
    let delivered = 0;
    for (const id of userIds) {
        const set = clients().get(id);
        if (!set) continue;
        delivered++;
        set.forEach((c) => c.send('event: new-notification\ndata: {}\n\n'));
    }
    return delivered;
}
