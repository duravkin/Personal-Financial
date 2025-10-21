package repository

import (
	"errors"

	"gorm.io/gorm"

	"finance-backend/internal/model"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create создает нового пользователя
func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

// GetByEmail возвращает пользователя по email
func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

// GetByID возвращает пользователя по ID
func (r *UserRepository) GetByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

// EmailExists проверяет существование email
func (r *UserRepository) EmailExists(email string) bool {
	var count int64
	r.db.Model(&model.User{}).Where("email = ?", email).Count(&count)
	return count > 0
}
