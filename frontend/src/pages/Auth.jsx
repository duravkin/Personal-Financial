import { createSignal, Show } from 'solid-js';
import { authStore } from '../stores/auth';

export default function Auth() {
    const [isLogin, setIsLogin] = createSignal(true);
    const [form, setForm] = createSignal({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [error, setError] = createSignal('');

    const { login, register, loading } = authStore;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin()) {
            result = await login(form().email, form().password);
        } else {
            result = await register(form());
        }

        if (!result.success) {
            setError(result.error);
        }
    };

    const handleInput = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    return (
        <div class="auth-container">
            <div class="auth-card">
                <h2 class="auth-title">
                    {isLogin() ? 'Вход в аккаунт' : 'Регистрация'}
                </h2>

                <Show when={error()}>
                    <div class="error-message">
                        <p>{error()}</p>
                    </div>
                </Show>

                <form class="auth-form" onSubmit={handleSubmit}>
                    <Show when={!isLogin()}>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="first_name" class="form-label">Имя</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required={!isLogin()}
                                    value={form().first_name}
                                    onInput={(e) => handleInput('first_name', e.target.value)}
                                    class="form-input"
                                />
                            </div>

                            <div class="form-group">
                                <label for="last_name" class="form-label">Фамилия</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required={!isLogin()}
                                    value={form().last_name}
                                    onInput={(e) => handleInput('last_name', e.target.value)}
                                    class="form-input"
                                />
                            </div>
                        </div>
                    </Show>

                    <div class="form-group">
                        <label for="email" class="form-label">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={form().email}
                            onInput={(e) => handleInput('email', e.target.value)}
                            class="form-input"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Пароль</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={form().password}
                            onInput={(e) => handleInput('password', e.target.value)}
                            class="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading()}
                        class="submit-btn"
                    >
                        {loading() ? 'Загрузка...' : (isLogin() ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>

                <div class="auth-switch">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin());
                            setError('');
                        }}
                        class="auth-switch-btn"
                    >
                        {isLogin() ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
}