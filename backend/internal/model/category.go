package model

type Category struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	UserID   *uint  `json:"user_id" gorm:"index"` // nil для системных категорий
	Name     string `json:"name" gorm:"not null;size:50"`
	MCCCode  *int   `json:"mcc_code,omitempty"`
	Color    string `json:"color" gorm:"size:7;default:'#6B7280'"`
	Icon     string `json:"icon" gorm:"size:50"`
	IsSystem bool   `json:"is_system" gorm:"default:false"`

	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Transactions []Transaction `json:"transactions,omitempty" gorm:"foreignKey:CategoryID"`
}
