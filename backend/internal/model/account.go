package model

import "time"

type Account struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null;index"`
	BankID        uint      `json:"bank_id" gorm:"not null;index"`
	AccountNumber string    `json:"account_number" gorm:"size:50"`
	CardNumber    string    `json:"card_number" gorm:"size:20"`
	AccountName   string    `json:"account_name" gorm:"not null;size:100"`
	Currency      string    `json:"currency" gorm:"default:'RUB';size:10"`
	Balance       float64   `json:"balance" gorm:"type:decimal(15,2);default:0"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Bank         Bank          `json:"bank,omitempty" gorm:"foreignKey:BankID"`
	Transactions []Transaction `json:"transactions,omitempty" gorm:"foreignKey:AccountID"`
}
