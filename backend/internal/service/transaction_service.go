package service

import (
	"errors"
	"time"

	"finance-backend/internal/dto"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
)

type TransactionService struct {
	transactionRepo *repository.TransactionRepository
	categoryRepo    *repository.CategoryRepository
}

func NewTransactionService(tr *repository.TransactionRepository, cr *repository.CategoryRepository) *TransactionService {
	return &TransactionService{
		transactionRepo: tr,
		categoryRepo:    cr,
	}
}

// CreateTransaction создает новую транзакцию
func (s *TransactionService) CreateTransaction(userID uint, req dto.CreateTransactionRequest) (*model.Transaction, error) {
	// Парсим дату
	date, err := time.Parse(time.RFC3339, req.Date)
	if err != nil {
		return nil, errors.New("invalid date format")
	}

	// Проверяем категорию, если указана
	if req.CategoryID != nil {
		_, err := s.categoryRepo.GetByID(userID, *req.CategoryID)
		if err != nil {
			return nil, errors.New("category not found")
		}
	}

	transaction := &model.Transaction{
		UserID:      userID,
		CategoryID:  req.CategoryID,
		Amount:      req.Amount,
		Type:        req.Type,
		Description: req.Description,
		Date:        date,
	}

	err = s.transactionRepo.Create(transaction)
	return transaction, err
}

// GetUserTransactions возвращает транзакции пользователя
func (s *TransactionService) GetUserTransactions(userID uint, from, to *time.Time) ([]dto.TransactionResponse, error) {
	transactions, err := s.transactionRepo.GetByUserID(userID, from, to)
	if err != nil {
		return nil, err
	}

	// Преобразуем в DTO
	var response []dto.TransactionResponse
	for _, t := range transactions {
		categoryName := ""
		if t.Category != nil {
			categoryName = t.Category.Name
		}

		response = append(response, dto.TransactionResponse{
			ID:           t.ID,
			Amount:       t.Amount,
			Type:         t.Type,
			Description:  t.Description,
			Date:         t.Date,
			CategoryName: categoryName,
		})
	}

	return response, nil
}

// GetFinancialSummary возвращает финансовую сводку
func (s *TransactionService) GetFinancialSummary(userID uint, from, to *time.Time) (*dto.FinancialSummary, error) {
	return s.transactionRepo.GetFinancialSummary(userID, from, to)
}

// DeleteTransaction удаляет транзакцию
func (s *TransactionService) DeleteTransaction(userID uint, id uint) error {
	return s.transactionRepo.Delete(userID, id)
}
