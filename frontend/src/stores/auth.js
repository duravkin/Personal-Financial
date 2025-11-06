import { createSignal } from 'solid-js';
import { api } from '../utils/api';

export const createAuthStore = () => {
    const [user, setUser] = createSignal(null);
    const [loading, setLoading] = createSignal(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            setUser(response.user);
            localStorage.setItem('token', response.token);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register', userData);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/auth/profile');
                setUser(response);
            } catch (error) {
                console.error('Auth check failed:', error);
                logout();
            }
        }
    };

    return {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
    };
};

export const authStore = createAuthStore();