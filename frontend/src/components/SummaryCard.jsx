import { transactionStore } from '../stores/transactions';

export default function SummaryCard() {
    const { summary } = transactionStore;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(amount || 0);
    };

    return (
        <div class="summary-grid">
            <div class="summary-card summary-income">
                <div class="summary-title">Общий доход</div>
                <div class="summary-amount">{formatCurrency(summary()?.total_income)}</div>
            </div>

            <div class="summary-card summary-expense">
                <div class="summary-title">Общий расход</div>
                <div class="summary-amount">{formatCurrency(summary()?.total_expense)}</div>
            </div>

            <div class={`summary-card summary-balance ${(summary()?.balance || 0) < 0 ? 'negative' : ''}`}>
                <div class="summary-title">Баланс</div>
                <div class="summary-amount">{formatCurrency(summary()?.balance)}</div>
            </div>
        </div>
    );
}