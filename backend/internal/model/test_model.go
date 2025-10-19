package model

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name  string  `json:"name" gorm:"not null"`
	Price float64 `json:"price" gorm:"not null"`
}
