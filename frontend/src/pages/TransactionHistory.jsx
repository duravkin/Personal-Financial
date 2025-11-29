import { onMount } from 'solid-js';
import { transactionStore } from '../stores/transactions';
import { categoryStore } from '../stores/categories';
import TransactionHistoryList from '../components/TransactionHistoryList';

export default function TransactionHistory() {
    const { fetchTransactions } = transactionStore;
    const { fetchCategories } = categoryStore;

    onMount(() => {
        try {
            fetchTransactions();
            fetchCategories();
        } catch (error) {
            console.error('Error in TransactionHistory onMount:', error);
        }
    });

    return (
        <div class="transaction-history-page">
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h1 class="card-title">История транзакций</h1>
                        <p>Просмотр, редактирование и удаление всех транзакций</p>
                    </div>
                    <div class="card-body">
                        <TransactionHistoryList />
                    </div>
                </div>
            </div>
        </div>
    );
}