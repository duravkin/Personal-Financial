import { createSignal, createEffect } from 'solid-js';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
    const [transactions, setTransactions] = createSignal([]);
    const [form, setForm] = createSignal({
        amount: '',
        category: '',
        description: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    // Загрузка транзакций
    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/transactions`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    // Создание транзакции
    const createTransaction = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/transactions`, {
                ...form(),
                amount: parseFloat(form().amount)
            });
            setForm({
                amount: '',
                category: '',
                description: '',
                type: 'expense',
                date: new Date().toISOString().split('T')[0]
            });
            fetchTransactions();
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    // Удаление транзакции
    const deleteTransaction = async (id) => {
        try {
            await axios.delete(`${API_URL}/transactions/${id}`);
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    createEffect(() => {
        fetchTransactions();
    });

    return (
        <div class="container">
            <h1>Personal Finance Manager</h1>

            {/* Форма добавления транзакции */}
            <form onSubmit={createTransaction} class="transaction-form">
                <input
                    type="number"
                    placeholder="Amount"
                    value={form().amount}
                    onInput={(e) => setForm({ ...form(), amount: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={form().category}
                    onInput={(e) => setForm({ ...form(), category: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={form().description}
                    onInput={(e) => setForm({ ...form(), description: e.target.value })}
                />
                <select
                    value={form().type}
                    onChange={(e) => setForm({ ...form(), type: e.target.value })}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <input
                    type="date"
                    value={form().date}
                    onInput={(e) => setForm({ ...form(), date: e.target.value })}
                />
                <button type="submit">Add Transaction</button>
            </form>

            {/* Список транзакций */}
            <div class="transactions-list">
                <h2>Transactions</h2>
                <For each={transactions()}>
                    {(transaction) => (
                        <div class={`transaction ${transaction.type}`}>
                            <span class="amount">
                                {transaction.type === 'expense' ? '-' : '+'}
                                ${transaction.amount}
                            </span>
                            <span class="category">{transaction.category}</span>
                            <span class="description">{transaction.description}</span>
                            <span class="date">{transaction.date}</span>
                            <button onClick={() => deleteTransaction(transaction.id)}>
                                Delete
                            </button>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
}

export default App;