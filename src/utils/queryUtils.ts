// Query string dari objek filter. Nilai undefined/null/kosong dibuang: URLSearchParams mengubah undefined menjadi teks
// "undefined", yang di backend menjadi filter ILIKE '%undefined%' dan membuat hasil pencarian selalu kosong.
export function toQuery(filter: object): URLSearchParams {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
        }
    }
    return params;
}
