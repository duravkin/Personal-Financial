package model

import "time"

type Bank struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;not null;size:100"`
	LogoURL     string    `json:"logo_url" gorm:"size:255"`
	Website     string    `json:"website,omitempty" gorm:"size:255"`
	Description string    `json:"description,omitempty" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Accounts []Account `json:"accounts,omitempty" gorm:"foreignKey:BankID"`
}
