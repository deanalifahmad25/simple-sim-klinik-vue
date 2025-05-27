import { User } from '@/types/model';
import { ref } from 'vue';

const currentUser = ref<User | null>(null);

export function useUserStore() {
    function login(username: string, password: string): boolean {
        const users: User[] = [
            { username: 'admin', password: 'secret123', role: 'pendaftaran' },
            { username: 'nurse', password: 'secret123', role: 'perawat' },
            { username: 'doctor', password: 'secret123', role: 'dokter' },
            { username: 'pharmacist', password: 'secret123', role: 'apoteker' }
        ];
        const user = users.find((u) => u.username === username && u.password === password);
        currentUser.value = user || null;
        return !!user;
    }

    function logout() {
        currentUser.value = null;
    }

    return {
        currentUser,
        login,
        logout
    };
}
