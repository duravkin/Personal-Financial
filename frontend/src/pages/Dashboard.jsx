import { onMount } from 'solid-js';
import { transactionStore } from '../stores/transactions';
import { categoryStore } from '../stores/categories';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import SummaryCard from '../components/SummaryCard';

export default function Dashboard() {
    const { fetchTransactions, fetchSummary } = transactionStore;
    const { fetchCategories } = categoryStore;

    onMount(() => {
        fetchTransactions();
        fetchSummary();
        fetchCategories();
    });

    return (
        <div class="dashboard">
            <div class="container">
                <h1 class="page-title">Финансовый менеджер</h1>

                <SummaryCard />

                <div class="dashboard-grid">
                    <div>
                        <TransactionForm />
                    </div>

                    <div>
                        <TransactionList />
                    </div>
                </div>
            </div>
        </div>
    );
}