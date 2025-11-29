import { createSignal, onMount, Show } from 'solid-js';
import { authStore } from './stores/auth';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import TransactionHistory from './pages/TransactionHistory';

function App() {
  const { user, checkAuth } = authStore;
  const [currentPage, setCurrentPage] = createSignal('dashboard');

  onMount(() => {
    checkAuth();
  });

  const handleLogout = () => {
    authStore.logout();
  };

  return (
    <Show when={user()} fallback={<Auth />}>
      <div class="app">
        <nav class="nav">
          <div class="container">
            <div class="nav-content">
              <div class="nav-title">Финансы</div>

              <div class="nav-links">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  class={`nav-link ${currentPage() === 'dashboard' ? 'active' : ''}`}
                >
                  Дашборд
                </button>
                <button
                  onClick={() => setCurrentPage('history')}
                  class={`nav-link ${currentPage() === 'history' ? 'active' : ''}`}
                >
                  История операций
                </button>
                <button
                  onClick={() => setCurrentPage('categories')}
                  class={`nav-link ${currentPage() === 'categories' ? 'active' : ''}`}
                >
                  Категории
                </button>
              </div>

              <div class="user-info">
                <span class="user-name">
                  {user()?.first_name} {user()?.last_name}
                </span>
                <button
                  onClick={handleLogout}
                  class="logout-btn"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </nav>

        <Show when={currentPage() === 'dashboard'}>
          <Dashboard />
        </Show>

        <Show when={currentPage() === 'history'}>
          <TransactionHistory />
        </Show>

        <Show when={currentPage() === 'categories'}>
          <Categories />
        </Show>
      </div>
    </Show>
  );
}

export default App;