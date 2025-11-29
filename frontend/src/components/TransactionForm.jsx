import { createSignal } from 'solid-js';
import { transactionStore } from '../stores/transactions';
import { categoryStore } from '../stores/categories';
import { formatDateForBackend } from '../utils/date';

export default function TransactionForm() {
    const [form, setForm] = createSignal({
        amount: '',
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category_id: ''
    });

    const { addTransaction } = transactionStore;
    const { categories } = categoryStore;
    const categoryList = () => {
        const cats = categories();
        return Array.isArray(cats) ? cats : [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const transactionData = {
            amount: parseFloat(form().amount),
            type: form().type,
            description: form().description || (form().type === "income" ? "Доход" : "Расход"),
            date: formatDateForBackend(form().date),
            category_id: form().category_id ? parseInt(form().category_id) : null
        };

        const result = await addTransaction(transactionData);

        if (result.success) {
            setForm({
                amount: '',
                type: 'expense',
                description: '',
                date: new Date().toISOString().split('T')[0],
                category_id: ''
            });
        } else {
            alert(result.error);
        }
    };

    const handleInput = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Добавить транзакцию</h3>
            </div>
            <div class="card-body">
                <form onSubmit={handleSubmit}>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Тип</label>
                            <select
                                value={form().type}
                                onInput={(e) => handleInput('type', e.target.value)}
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
                                value={form().amount}
                                onInput={(e) => handleInput('amount', e.target.value)}
                                required
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Категория</label>
                            <select
                                value={form().category_id}
                                onInput={(e) => handleInput('category_id', e.target.value)}
                                class="form-select"
                            >
                                <option value="">Без категории</option>
                                <For each={categoryList().filter(cat => cat.type === form().type)}>
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
                                value={form().date}
                                onInput={(e) => handleInput('date', e.target.value)}
                                required
                                class="form-input"
                            />
                        </div>

                        <div class="form-group form-full-width">
                            <label class="form-label">Описание</label>
                            <input
                                type="text"
                                value={form().description}
                                onInput={(e) => handleInput('description', e.target.value)}
                                // required
                                class="form-input"
                            />
                        </div>
                    </div>

                    <button type="submit" class="submit-btn">
                        Добавить
                    </button>
                </form>
            </div>
        </div>
    );
}