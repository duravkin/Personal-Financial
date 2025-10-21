import { createSignal, createEffect } from 'solid-js';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [transactions, setTransactions] = createSignal([]);
  const [categories, setCategories] = createSignal([]);
  const [summary, setSummary] = createSignal({});
  const [activeTab, setActiveTab] = createSignal('transactions');

  // Форма для транзакций
  const [transactionForm, setTransactionForm] = createSignal({
    amount: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: ''
  });

  // Форма для категорий
  const [categoryForm, setCategoryForm] = createSignal({
    name: '',
    type: 'expense',
    color: '#6B7280'
  });

  // Загрузка данных
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions`);
      console.log('Transactions:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      console.log('Categories:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/summary`);
      console.log('Summary:', response.data);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // CRUD для транзакций
  const createTransaction = async (e) => {
    e.preventDefault();
    try {
      const dateFromForm = transactionForm().date;
      const dateISO = new Date(dateFromForm + 'T00:00:00Z').toISOString();

      const formData = {
        amount: parseFloat(transactionForm().amount),
        type: transactionForm().type,
        description: transactionForm().description,
        date: dateISO,
        user_id: 1,
        category_id: transactionForm().category_id ?
          parseInt(transactionForm().category_id) :
          null
      };

      console.log('Sending transaction data:', formData);

      await axios.post(`${API_URL}/api/transactions`, formData);

      setTransactionForm({
        amount: '',
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category_id: ''
      });

      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error creating transaction:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}`);
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // CRUD для категорий
  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/categories`, {
        ...categoryForm(),
        user_id: 1
      });
      setCategoryForm({
        name: '',
        type: 'expense',
        color: '#6B7280'
      });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Загрузка всех данных при монтировании
  createEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchSummary();
  });

  // Функция для получения названия категории по ID
  const getCategoryName = (transaction) => {


    return transaction.category_name;
  };

  // Функция для получения цвета категории по ID
  const getCategoryColor = (transaction) => {
    // Если категория вложена в объект транзакции
    if (transaction.Category) {
      return transaction.Category.Color || transaction.Category.color || '#6B7280';
    }

    // Иначе ищем по ID в списке категорий
    const categoryId = transaction.CategoryID || transaction.category_id;
    if (!categoryId) return '#6B7280';

    const category = categories().find(cat => {
      const catId = cat.ID || cat.id;
      return catId === categoryId;
    });

    return category ? (category.Color || category.color) : '#6B7280';
  };

  // Функция для правильного отображения суммы в сводке
  const formatSummaryValue = (value) => {
    if (value === undefined || value === null) return '0.00';
    return typeof value === 'number' ? value.toFixed(2) : parseFloat(value || 0).toFixed(2);
  };

  return (
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
      <h1>Personal Finance Manager</h1>

      {/* Сводка */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          background: '#e8f5e8',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Доходы</h3>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
            ${formatSummaryValue(summary().total_income)}
          </p>
        </div>
        <div style={{
          padding: '20px',
          background: '#ffebee',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c62828' }}>Расходы</h3>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#c62828' }}>
            ${formatSummaryValue(summary().total_expense)}
          </p>
        </div>
        <div style={{
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Баланс</h3>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>
            ${formatSummaryValue(
              (parseFloat(summary().balance) || 0)
            )}
          </p>
        </div>
      </div>

      {/* Навигация */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            background: activeTab() === 'transactions' ? '#007bff' : '#f8f9fa',
            color: activeTab() === 'transactions' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Транзакции
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '10px 20px',
            background: activeTab() === 'categories' ? '#007bff' : '#f8f9fa',
            color: activeTab() === 'categories' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Категории
        </button>
      </div>

      {/* Содержимое вкладок */}
      {activeTab() === 'transactions' && (
        <div>
          {/* Форма добавления транзакции */}
          <form onSubmit={createTransaction} style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <h3>Добавить транзакцию</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Сумма *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transactionForm().amount}
                  onInput={(e) => setTransactionForm({ ...transactionForm(), amount: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Тип *
                </label>
                <select
                  value={transactionForm().type}
                  onChange={(e) => setTransactionForm({ ...transactionForm(), type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="expense">Расход</option>
                  <option value="income">Доход</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Категория
                </label>
                <select
                  value={transactionForm().category_id}
                  onChange={(e) => setTransactionForm({ ...transactionForm(), category_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Без категории</option>
                  {categories().map(category => {
                    const categoryId = category.ID || category.id;
                    const categoryName = category.Name || category.name;
                    return (
                      <option value={categoryId}>
                        {categoryName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Дата *
                </label>
                <input
                  type="date"
                  value={transactionForm().date}
                  onInput={(e) => setTransactionForm({ ...transactionForm(), date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Описание *
                </label>
                <input
                  type="text"
                  placeholder="Описание транзакции"
                  value={transactionForm().description}
                  onInput={(e) => setTransactionForm({ ...transactionForm(), description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Добавить транзакцию
                </button>
              </div>
            </div>
          </form>

          {/* Список транзакций */}
          <div>
            <h2>История транзакций</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {transactions().map(transaction => {
                const transactionId = transaction.ID || transaction.id;
                const amount = transaction.Amount || transaction.amount;
                const type = transaction.Type || transaction.type;
                const description = transaction.Description || transaction.description;
                const date = new Date(transaction.Date || transaction.date).toLocaleDateString();

                return (
                  <div
                    style={{
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: type === 'income' ? '#f0fff0' : '#fff0f0'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getCategoryColor(transaction)
                      }}></div>
                      <span style={{
                        fontWeight: 'bold',
                        color: type === 'income' ? 'green' : 'red',
                        minWidth: '100px'
                      }}>
                        {type === 'income' ? '+' : '-'}${typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2)}
                      </span>
                      <span style={{ minWidth: '200px' }}>{description}</span>
                      <span style={{
                        color: '#666',
                        fontSize: '0.9em',
                        minWidth: '150px'
                      }}>
                        {getCategoryName(transaction)}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>{date}</span>
                    </div>
                    <button
                      onClick={() => deleteTransaction(transactionId)}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab() === 'categories' && (
        <div>
          {/* Форма добавления категории */}
          <form onSubmit={createCategory} style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <h3>Добавить категорию</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Название *
                </label>
                <input
                  type="text"
                  placeholder="Название категории"
                  value={categoryForm().name}
                  onInput={(e) => setCategoryForm({ ...categoryForm(), name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Тип *
                </label>
                <select
                  value={categoryForm().type}
                  onChange={(e) => setCategoryForm({ ...categoryForm(), type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="expense">Расход</option>
                  <option value="income">Доход</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Цвет
                </label>
                <input
                  type="color"
                  value={categoryForm().color}
                  onInput={(e) => setCategoryForm({ ...categoryForm(), color: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '3px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    height: '38px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Добавить категорию
                </button>
              </div>
            </div>
          </form>

          {/* Список категорий */}
          <div>
            <h2>Категории</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {categories().map(category => {
                const categoryId = category.ID || category.id;
                const name = category.Name || category.name;
                const type = category.Type || category.type;
                const color = category.Color || category.color;

                return (
                  <div
                    style={{
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: type === 'income' ? '#f0fff0' : '#fff0f0'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: color
                      }}></div>
                      <span style={{ fontWeight: 'bold', minWidth: '200px' }}>{name}</span>
                      <span style={{
                        padding: '4px 8px',
                        background: type === 'income' ? '#e8f5e8' : '#ffebee',
                        color: type === 'income' ? '#2e7d32' : '#c62828',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontWeight: 'bold'
                      }}>
                        {type === 'income' ? 'Доход' : 'Расход'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCategory(categoryId)}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;