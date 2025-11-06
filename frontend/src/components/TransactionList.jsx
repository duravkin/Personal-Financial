import { For } from 'solid-js';
import { transactionStore } from '../stores/transactions';

export default function TransactionList() {
    const { transactions, deleteTransaction, loading } = transactionStore;

    const handleDelete = async (id) => {
        if (confirm('Удалить транзакцию?')) {
            const result = await deleteTransaction(id);
            if (!result.success) {
                alert(result.error);
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    return (
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">История транзакций</h3>
            </div>
            <div class="card-body">
                {loading() ? (
                    <div class="loading">Загрузка...</div>
                ) : (
                    <div class="transaction-list">
                        <For each={transactions()}>
                            {(transaction) => (
                                <div class="transaction-item">
                                    <div class="transaction-info">
                                        <div class={`transaction-type ${transaction.type}`}></div>
                                        <div class="transaction-details">
                                            <div class="transaction-description">{transaction.description}</div>
                                            <div class="transaction-meta">
                                                {transaction.category?.name || 'Без категории'} • {formatDate(transaction.date)}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="transaction-actions">
                                        <span class={`transaction-amount ${transaction.type}`}>
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </span>

                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            class="delete-btn"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                )}

                {!loading() && transactions().length === 0 && (
                    <div class="empty-state">Нет транзакций</div>
                )}
            </div>
        </div>
    );
}