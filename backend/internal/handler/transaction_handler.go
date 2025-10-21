package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"finance-backend/internal/dto"
	"finance-backend/internal/service"
)

type TransactionHandler struct {
	transactionService *service.TransactionService
}

func NewTransactionHandler(ts *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactionService: ts}
}

// CreateTransaction создает транзакцию
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req dto.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction, err := h.transactionService.CreateTransaction(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

// GetTransactions возвращает транзакции пользователя
func (h *TransactionHandler) GetTransactions(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Парсим параметры дат
	var from, to *time.Time
	if fromStr := c.Query("from"); fromStr != "" {
		if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			from = &t
		}
	}
	if toStr := c.Query("to"); toStr != "" {
		if t, err := time.Parse("2006-01-02", toStr); err == nil {
			to = &t
		}
	}

	transactions, err := h.transactionService.GetUserTransactions(userID, from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

// GetSummary возвращает финансовую сводку
func (h *TransactionHandler) GetSummary(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var from, to *time.Time
	if fromStr := c.Query("from"); fromStr != "" {
		if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			from = &t
		}
	}
	if toStr := c.Query("to"); toStr != "" {
		if t, err := time.Parse("2006-01-02", toStr); err == nil {
			to = &t
		}
	}

	summary, err := h.transactionService.GetFinancialSummary(userID, from, to)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}

// DeleteTransaction удаляет транзакцию
func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction ID"})
		return
	}

	err = h.transactionService.DeleteTransaction(userID, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "transaction deleted"})
}
