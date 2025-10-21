package model

import "time"

type Transaction struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null;index"`
	CategoryID  *uint     `json:"category_id,omitempty" gorm:"index"`
	Amount      float64   `json:"amount" gorm:"not null"`
	Type        string    `json:"type" gorm:"type:varchar(10);not null;check:type IN ('income', 'expense')"`
	Description string    `json:"description" gorm:"not null"`
	Date        time.Time `json:"date" gorm:"not null;index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	User     User      `json:"user,omitempty"`
	Category *Category `json:"category,omitempty"`
}
