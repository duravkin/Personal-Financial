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

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

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
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Personal Finance Manager</h1>

      <form onSubmit={createTransaction} style="margin-bottom: 20px; display: grid; gap: 10px; max-width: 400px;">
        <input
          type="number"
          placeholder="Amount"
          value={form().amount}
          onInput={(e) => setForm({ ...form(), amount: e.target.value })}
          required
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <input
          type="text"
          placeholder="Category"
          value={form().category}
          onInput={(e) => setForm({ ...form(), category: e.target.value })}
          required
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <input
          type="text"
          placeholder="Description"
          value={form().description}
          onInput={(e) => setForm({ ...form(), description: e.target.value })}
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <select
          value={form().type}
          onChange={(e) => setForm({ ...form(), type: e.target.value })}
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="date"
          value={form().date}
          onInput={(e) => setForm({ ...form(), date: e.target.value })}
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <button
          type="submit"
          style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Add Transaction
        </button>
      </form>

      <div>
        <h2>Transactions</h2>
        <div style="display: grid; gap: 10px;">
          {transactions().map(transaction => (
            <div
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: transaction.type === 'income' ? '#f0fff0' : '#fff0f0'
              }}
            >
              <span style={{ fontWeight: 'bold', color: transaction.type === 'income' ? 'green' : 'red' }}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
              </span>
              <span>{transaction.category}</span>
              <span>{transaction.description}</span>
              <span>{transaction.date}</span>
              <button
                onClick={() => deleteTransaction(transaction.id)}
                style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;