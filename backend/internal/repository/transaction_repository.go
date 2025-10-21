package repository

import (
	"errors"
	"finance-backend/internal/dto"
	"finance-backend/internal/model"
	"time"

	"gorm.io/gorm"
)

type TransactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// Create создает новую транзакцию
func (r *TransactionRepository) Create(transaction *model.Transaction) error {
	return r.db.Create(transaction).Error
}

// GetByID возвращает транзакцию по ID с проверкой пользователя
func (r *TransactionRepository) GetByID(userID uint, id uint) (*model.Transaction, error) {
	var transaction model.Transaction
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error
	if err != nil {
		return nil, errors.New("transaction not found")
	}
	return &transaction, nil
}

// GetByUserID возвращает все транзакции пользователя
func (r *TransactionRepository) GetByUserID(userID uint, from, to *time.Time) ([]model.Transaction, error) {
	var transactions []model.Transaction

	query := r.db.Where("user_id = ?", userID)

	if from != nil {
		query = query.Where("date >= ?", from)
	}
	if to != nil {
		query = query.Where("date <= ?", to)
	}

	err := query.Preload("Category").Order("date DESC").Find(&transactions).Error
	return transactions, err
}

// GetFinancialSummary возвращает финансовую сводку
func (r *TransactionRepository) GetFinancialSummary(userID uint, from, to *time.Time) (*dto.FinancialSummary, error) {
	var summary dto.FinancialSummary

	// Доходы
	incomeQuery := r.db.Model(&model.Transaction{}).Where("user_id = ? AND type = ?", userID, "income")
	if from != nil {
		incomeQuery = incomeQuery.Where("date >= ?", from)
	}
	if to != nil {
		incomeQuery = incomeQuery.Where("date <= ?", to)
	}

	err := incomeQuery.Select("COALESCE(SUM(amount), 0)").Scan(&summary.TotalIncome).Error
	if err != nil {
		return nil, err
	}

	// Расходы
	expenseQuery := r.db.Model(&model.Transaction{}).Where("user_id = ? AND type = ?", userID, "expense")
	if from != nil {
		expenseQuery = expenseQuery.Where("date >= ?", from)
	}
	if to != nil {
		expenseQuery = expenseQuery.Where("date <= ?", to)
	}

	err = expenseQuery.Select("COALESCE(SUM(amount), 0)").Scan(&summary.TotalExpense).Error
	if err != nil {
		return nil, err
	}

	summary.Balance = summary.TotalIncome - summary.TotalExpense
	return &summary, nil
}

// Update обновляет транзакцию
func (r *TransactionRepository) Update(transaction *model.Transaction) error {
	return r.db.Save(transaction).Error
}

// Delete удаляет транзакцию
func (r *TransactionRepository) Delete(userID uint, id uint) error {
	result := r.db.Where("user_id = ?", userID).Delete(&model.Transaction{}, id)
	if result.RowsAffected == 0 {
		return errors.New("transaction not found")
	}
	return result.Error
}
