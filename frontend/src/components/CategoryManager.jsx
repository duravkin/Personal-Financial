import { createSignal } from 'solid-js';
import { categoryStore } from '../stores/categories';

export default function CategoryManager() {
    const [form, setForm] = createSignal({
        name: '',
        type: 'expense',
        color: '#6B7280'
    });

    const { categories, addCategory, deleteCategory } = categoryStore;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await addCategory(form());
        if (result.success) {
            setForm({ name: '', type: 'expense', color: '#6B7280' });
        } else {
            alert(result.error);
        }
    };

    const handleInput = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить категорию?')) {
            const result = await deleteCategory(id);
            if (!result.success) {
                alert(result.error);
            }
        }
    };

    return (
        <div class="categories-grid">
            <div class="category-form">
                <h3>Добавить категорию</h3>
                <form onSubmit={handleSubmit}>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Название</label>
                            <input
                                type="text"
                                value={form().name}
                                onInput={(e) => handleInput('name', e.target.value)}
                                required
                                class="form-input"
                            />
                        </div>

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
                            <label class="form-label">Цвет</label>
                            <input
                                type="color"
                                value={form().color}
                                onInput={(e) => handleInput('color', e.target.value)}
                                class="form-input"
                            />
                        </div>
                    </div>

                    <button type="submit" class="submit-btn">
                        Добавить категорию
                    </button>
                </form>
            </div>

            <div>
                <h3>Мои категории</h3>
                {categories().length === 0 ? (
                    <div class="empty-state">Нет категорий</div>
                ) : (
                    <div class="category-list">
                        {categories().map(category => (
                            <div class="category-item">
                                <div class="category-info">
                                    <div
                                        class="category-color"
                                        style={{ 'background-color': category.color }}
                                    ></div>
                                    <div class="category-details">
                                        <span class="category-name">{category.name}</span>
                                        <span class={`category-type ${category.type}`}>
                                            {category.type === 'income' ? 'Доход' : 'Расход'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(category.id)}
                                    class="delete-btn"
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}