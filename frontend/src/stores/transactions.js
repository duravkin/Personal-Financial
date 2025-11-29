import { createSignal } from 'solid-js';
import { api } from '../utils/api';

export const createTransactionStore = () => {
    const [transactions, setTransactions] = createSignal([]);
    const [summary, setSummary] = createSignal({});
    const [loading, setLoading] = createSignal(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/transactions');
            setTransactions(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await api.get('/transactions/summary');
            setSummary(response || {});
        } catch (error) {
            console.error('Failed to fetch summary:', error);
            setSummary({});
        }
    };

    const addTransaction = async (transactionData) => {
        try {
            console.log('Adding transaction:', transactionData);
            const response = await api.post('/transactions', transactionData);
            // setTransactions(prev => [response, ...(Array.isArray(prev) ? prev : [])]);
            await fetchTransactions();
            await fetchSummary();
            return { success: true };
        } catch (error) {
            console.error('Failed to add transaction:', error);
            return { success: false, error: error.message || 'Failed to add transaction' };
        }
    };

    const updateTransaction = async (id, transactionData) => {
        try {
            const response = await api.put(`/transactions/${id}`, transactionData);
            setTransactions(prev =>
                (Array.isArray(prev) ? prev : []).map(t => t.id === id ? response : t)
            );
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
            console.error('Failed to delete transaction:', error);
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