import { createSignal, For, Show, createEffect } from 'solid-js';
import { transactionStore } from '../stores/transactions';
import { categoryStore } from '../stores/categories';
import { formatDateForBackend } from '../utils/date';

export default function TransactionHistoryList(props) {
    const { transactions, updateTransaction, deleteTransaction, loading, fetchTransactions } = transactionStore;
    const { categories } = categoryStore;

    const [editingId, setEditingId] = createSignal(null);
    const [editForm, setEditForm] = createSignal({});
    const [filters, setFilters] = createSignal({
        from: '',
        to: ''
    });

    // Безопасное получение транзакций
    const transactionList = () => {
        const tx = transactions();
        return Array.isArray(tx) ? tx : [];
    };

    // Безопасное получение категорий
    const categoryList = () => {
        const cats = categories();
        return Array.isArray(cats) ? cats : [];
    };

    const findCategoryByName = (name) => {
        if (!name) return null;
        const cats = categoryList();
        return cats.find(cat => cat.name.toLowerCase() === name.toLowerCase()) || null;
    };

    const startEdit = (transaction) => {
        if (!transaction) return;

        setEditingId(transaction.id);
        setEditForm({
            amount: (transaction.amount || 0).toString(),
            type: transaction.type || 'expense',
            description: transaction.description || '',
            date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
            category_id: findCategoryByName(transaction.category_name).id.toString() || ''
        });
        console.log(editForm())
        console.log(transaction.category_name)
        console.log(findCategoryByName(transaction.category_name))
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleEditSubmit = async (id, e) => {
        e.preventDefault();

        const transactionData = {
            amount: parseFloat(editForm().amount || 0),
            type: editForm().type || 'expense',
            description: editForm().description || '',
            date: formatDateForBackend(editForm().date),
            category_id: editForm().category_id ? parseInt(editForm().category_id) : null
        };

        const result = await updateTransaction(id, transactionData);

        if (result.success) {
            setEditingId(null);
            setEditForm({});
        } else {
            alert(result.error);
        }
    };

    const handleEditInput = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить транзакцию?')) {
            const result = await deleteTransaction(id);
            if (!result.success) {
                alert(result.error);
            }
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        // Вызываем колбэк для применения фильтров
        if (props.onFilterChange) {
            props.onFilterChange(filters());
        } else {
            // Или используем прямую функцию из store
            fetchTransactions(filters());
        }
    };

    const resetFilters = () => {
        setFilters({ from: '', to: '' });
        if (props.onFilterChange) {
            props.onFilterChange({});
        } else {
            fetchTransactions();
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch {
            return 'Неверная дата';
        }
    };

    return (
        <div>
            {/* Фильтры по датам */}
            <div class="filters-section">
                <h3>Фильтр по датам</h3>
                <div class="filter-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">С даты</label>
                            <input
                                type="date"
                                value={filters().from}
                                onInput={(e) => handleFilterChange('from', e.target.value)}
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label">По дату</label>
                            <input
                                type="date"
                                value={filters().to}
                                onInput={(e) => handleFilterChange('to', e.target.value)}
                                class="form-input"
                            />
                        </div>
                    </div>

                    <div class="filter-actions">
                        <button
                            type="button"
                            onClick={applyFilters}
                            class="btn btn-primary"
                        >
                            Применить фильтр
                        </button>

                        <button
                            type="button"
                            onClick={resetFilters}
                            class="btn btn-secondary"
                        >
                            Сбросить фильтр
                        </button>
                    </div>
                </div>
            </div>

            {/* Список транзакций */}
            <div class="transactions-section">
                <Show when={loading()} fallback={
                    <Show when={transactionList().length > 0} fallback={
                        <div class="empty-state">Нет транзакций</div>
                    }>
                        <div class="transaction-history-list">
                            <For each={transactionList()}>
                                {(transaction) => (
                                    <Show when={transaction} key={transaction.id}>
                                        <div class="transaction-history-item">
                                            {editingId() === transaction.id ? (
                                                <form
                                                    class="transaction-edit-form"
                                                    onSubmit={(e) => handleEditSubmit(transaction.id, e)}
                                                >
                                                    <div class="form-grid">
                                                        <div class="form-group">
                                                            <label class="form-label">Тип</label>
                                                            <select
                                                                value={editForm().type}
                                                                onInput={(e) => handleEditInput('type', e.target.value)}
                                                                class="form-select"
                                                            >
                                                                <option value="income">Доход</option>
                                                                <option value="expense">Расход</option>
                                                            </select>
                                                        </div>

                                                        <div class="form-group">
                                                            <label class="form-label">Сумма</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editForm().amount}
                                                                onInput={(e) => handleEditInput('amount', e.target.value)}
                                                                required
                                                                class="form-input"
                                                            />
                                                        </div>

                                                        <div class="form-group">
                                                            <label class="form-label">Категория</label>
                                                            <select
                                                                value={editForm().category_id}
                                                                onInput={(e) => handleEditInput('category_id', e.target.value)}
                                                                class="form-select"
                                                            >
                                                                <option value="">Без категории</option>
                                                                <For each={categoryList().filter(cat => cat.type === editForm().type)}>
                                                                    {(category) => (
                                                                        <Show when={category}>
                                                                            <option value={category.id}>{category.name}</option>
                                                                        </Show>
                                                                    )}
                                                                </For>
                                                            </select>
                                                        </div>

                                                        <div class="form-group">
                                                            <label class="form-label">Дата</label>
                                                            <input
                                                                type="date"
                                                                value={editForm().date}
                                                                onInput={(e) => handleEditInput('date', e.target.value)}
                                                                required
                                                                class="form-input"
                                                            />
                                                        </div>

                                                        <div class="form-group form-full-width">
                                                            <label class="form-label">Описание</label>
                                                            <input
                                                                type="text"
                                                                value={editForm().description}
                                                                onInput={(e) => handleEditInput('description', e.target.value)}
                                                                required
                                                                class="form-input"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div class="edit-actions">
                                                        <button type="submit" class="btn btn-primary">Сохранить</button>
                                                        <button type="button" onClick={cancelEdit} class="btn btn-secondary">Отмена</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div class="transaction-display">
                                                    <div class="transaction-info">
                                                        <div class={`transaction-type ${transaction.type || 'expense'}`}></div>
                                                        <div class="transaction-details">
                                                            <div class="transaction-description">
                                                                {transaction.description || 'Без описания'}
                                                            </div>
                                                            <div class="transaction-meta">
                                                                {transaction.category_name || 'Без категории'} • {formatDate(transaction.date)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="transaction-actions">
                                                        <span class={`transaction-amount ${transaction.type || 'expense'}`}>
                                                            {transaction.type === 'income' ? '+' : '-'}
                                                            {formatCurrency(transaction.amount)}
                                                        </span>

                                                        <div class="action-buttons">
                                                            <button
                                                                onClick={() => startEdit(transaction)}
                                                                class="btn btn-edit"
                                                            >
                                                                Редактировать
                                                            </button>

                                                            <button
                                                                onClick={() => handleDelete(transaction.id)}
                                                                class="btn btn-delete"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Show>
                                )}
                            </For>
                        </div>
                    </Show>
                }>
                    <div class="loading">Загрузка...</div>
                </Show>
            </div>
        </div>
    );
}