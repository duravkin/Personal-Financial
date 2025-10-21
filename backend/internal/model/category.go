package model

import "time"

type Category struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	Name      string    `json:"name" gorm:"not null"`
	Type      string    `json:"type" gorm:"type:varchar(10);not null;check:type IN ('income', 'expense')"`
	Color     string    `json:"color" gorm:"default:'#6B7280'"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Transactions []Transaction `json:"transactions,omitempty"`
}
