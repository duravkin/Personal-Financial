package dto

import "time"

type CreateTransactionRequest struct {
	CategoryID  *uint   `json:"category_id,omitempty"`
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	Description string  `json:"description" binding:"required"`
	Date        string  `json:"date" binding:"required"`
}

type TransactionResponse struct {
	ID           uint      `json:"id"`
	Amount       float64   `json:"amount"`
	Type         string    `json:"type"`
	Description  string    `json:"description"`
	Date         time.Time `json:"date"`
	CategoryName string    `json:"category_name,omitempty"`
}

type CreateCategoryRequest struct {
	Name  string `json:"name" binding:"required"`
	Type  string `json:"type" binding:"required,oneof=income expense"`
	Color string `json:"color,omitempty"`
}

type FinancialSummary struct {
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
	Balance      float64 `json:"balance"`
}
