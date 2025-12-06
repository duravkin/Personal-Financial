import { createSignal } from 'solid-js';
import { api } from '../utils/api';

export const createTransactionStore = () => {
    const [transactions, setTransactions] = createSignal([]);
    const [summary, setSummary] = createSignal({});
    const [loading, setLoading] = createSignal(false);

    const fetchTransactions = async (filters = {}) => {
        setLoading(true);
        try {
            let url = '/transactions';

            const params = new URLSearchParams();
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const response = await api.get(url);
            setTransactions(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async (filters = {}) => {
        try {
            let url = '/transactions/summary';

            const params = new URLSearchParams();
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const response = await api.get(url);
            setSummary(response || {});
        } catch (error) {
            console.error('Failed to fetch summary:', error);
            setSummary({});
        }
    };

    const addTransaction = async (transactionData) => {
        try {
            const response = await api.post('/transactions', transactionData);
            // setTransactions(prev => [response, ...(Array.isArray(prev) ? prev : [])]);
            await fetchTransactions();
            await fetchSummary();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to add transaction' };
        }
    };

    const updateTransaction = async (id, transactionData) => {
        try {
            const response = await api.put(`/transactions/${id}`, transactionData);
            // setTransactions(prev => (Array.isArray(prev) ? prev : []).map(t => t.id === id ? response : t));
            await fetchTransactions();
            await fetchSummary();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to update transaction' };
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            setTransactions(prev =>
                (Array.isArray(prev) ? prev : []).filter(t => t.id !== id)
            );
            await fetchSummary();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to delete transaction' };
        }
    };

    return {
        transactions,
        summary,
        loading,
        fetchTransactions,
        fetchSummary,
        addTransaction,
        updateTransaction,
        deleteTransaction
    };
};

export const transactionStore = createTransactionStore();