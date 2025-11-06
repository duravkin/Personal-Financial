import { onMount } from 'solid-js';
import { categoryStore } from '../stores/categories';
import CategoryManager from '../components/CategoryManager';

export default function Categories() {
    const { fetchCategories } = categoryStore;

    onMount(() => {
        fetchCategories();
    });

    return (
        <div class="categories-page">
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h1 class="card-title">Управление категориями</h1>
                        <p>Создавайте и управляйте категориями для ваших транзакций</p>
                    </div>
                    <div class="card-body">
                        <CategoryManager />
                    </div>
                </div>
            </div>
        </div>
    );
}