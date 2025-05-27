export type Role = 'pendaftaran' | 'perawat' | 'dokter' | 'apoteker';

export interface User {
    username: string;
    password: string;
    role: Role;
}

export interface Patient {
    id: string;
    name: string;
    birthDate: string;
    gender: 'L' | 'P';
    phone: string;
    weight?: number;
    bloodPressure?: string;
    complaints?: string;
    diagnosis?: string;
    medications?: string[];
}

export interface Product {
    id: string;
    name: string;
}
