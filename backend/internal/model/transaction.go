package model

import "time"

type TransactionType string

const (
	TransactionTypeIncome  TransactionType = "income"
	TransactionTypeExpense TransactionType = "expense"
)

type Transaction struct {
	ID              uint            `json:"id" gorm:"primaryKey"`
	AccountID       uint            `json:"account_id" gorm:"not null;index"`
	CategoryID      *uint           `json:"category_id,omitempty" gorm:"index"`
	OperationDate   time.Time       `json:"operation_date" gorm:"not null;index"`
	TransactionDate *time.Time      `json:"transaction_date,omitempty" gorm:"index"`
	Amount          float64         `json:"amount" gorm:"type:decimal(15,2);not null"`
	Currency        string          `json:"currency" gorm:"default:'RUB';size:10"`
	Type            TransactionType `json:"type" gorm:"type:transaction_type;not null"`
	Status          string          `json:"status" gorm:"default:'completed';size:20"`
	Description     string          `json:"description" gorm:"type:text"`
	Merchant        string          `json:"merchant" gorm:"size:200"`
	MCCCode         *int            `json:"mcc_code,omitempty"`
	Cashback        float64         `json:"cashback" gorm:"type:decimal(10,2);default:0"`
	Bonuses         float64         `json:"bonuses" gorm:"type:decimal(10,2);default:0"`
	SourceFile      string          `json:"source_file,omitempty" gorm:"size:100"`
	ExternalID      string          `json:"external_id,omitempty" gorm:"size:100"`
	IsManual        bool            `json:"is_manual" gorm:"default:false"`
	Notes           string          `json:"notes,omitempty" gorm:"type:text"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`

	Account  Account   `json:"account,omitempty" gorm:"foreignKey:AccountID"`
	Category *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
}
