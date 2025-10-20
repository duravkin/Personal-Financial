package model

import "time"

type ImportedFile struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"not null;index"`
	Filename     string    `json:"filename" gorm:"not null;size:255"`
	FileType     string    `json:"file_type" gorm:"size:10"` // CSV, JSON, XLSX
	BankName     string    `json:"bank_name" gorm:"size:100"`
	ImportDate   time.Time `json:"import_date" gorm:"default:CURRENT_TIMESTAMP"`
	RecordsCount int       `json:"records_count" gorm:"default:0"`
	Checksum     string    `json:"checksum" gorm:"uniqueIndex;size:64"`
	Status       string    `json:"status" gorm:"size:20;default:'completed'"`
	ErrorMessage string    `json:"error_message,omitempty" gorm:"type:text"`

	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}
