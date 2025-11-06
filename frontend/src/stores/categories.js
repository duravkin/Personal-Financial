import { createSignal } from 'solid-js';
import { api } from '../utils/api';

export const createCategoryStore = () => {
    const [categories, setCategories] = createSignal([]);
    const [loading, setLoading] = createSignal(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (categoryData) => {
        try {
            const response = await api.post('/categories', categoryData);
            setCategories(prev => [...prev, response]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to add category' };
        }
    };

    const deleteCategory = async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete category' };
        }
    };

    return {
        categories,
        loading,
        fetchCategories,
        addCategory,
        deleteCategory
    };
};

export const categoryStore = createCategoryStore();