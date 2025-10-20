package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null;size:255"`
	Password  string         `json:"-" gorm:"not null;size:255"`
	FirstName string         `json:"first_name" gorm:"size:100"`
	LastName  string         `json:"last_name" gorm:"size:100"`
	Phone     string         `json:"phone,omitempty" gorm:"size:20"`
	AvatarURL string         `json:"avatar_url,omitempty" gorm:"size:255"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	LastLogin *time.Time     `json:"last_login,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	Accounts      []Account      `json:"accounts,omitempty" gorm:"foreignKey:UserID"`
	Categories    []Category     `json:"categories,omitempty" gorm:"foreignKey:UserID"`
	ImportedFiles []ImportedFile `json:"imported_files,omitempty" gorm:"foreignKey:UserID"`
}

type UserContext struct {
	UserID uint
	Email  string
}
