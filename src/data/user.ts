// src/data/user.ts
export interface User {
    username: string;
    password: string;
    name: string;
    role: string;
}

export const users: User[] = [
    { username: 'pendaftaran', password: 'secret123', name: 'Admin Pendaftaran', role: 'pendaftaran' },
    { username: 'dokter', password: 'secret123', name: 'Admin Dokter', role: 'dokter' },
    { username: 'perawat', password: 'secret123', name: 'Admin Perawat', role: 'perawat' },
    { username: 'apoteker', password: 'secret123', name: 'Admin Apoteker', role: 'apoteker' }
];
