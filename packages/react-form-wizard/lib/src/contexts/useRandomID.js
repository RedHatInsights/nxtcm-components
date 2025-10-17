import { useMemo } from 'react';
export function useRandomID() {
    return useMemo(() => randomString(8), []);
}
const randomCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export function randomString(length, base = randomCharacters.length) {
    if (base > randomCharacters.length || base <= 0)
        base = randomCharacters.length;
    let text = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * base) % base;
        text += randomCharacters.charAt(index);
    }
    return text;
}
//# sourceMappingURL=useRandomID.js.map