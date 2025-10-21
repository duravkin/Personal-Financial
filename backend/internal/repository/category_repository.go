package repository

import (
	"errors"

	"gorm.io/gorm"

	"finance-backend/internal/model"
)

type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create создает новую категорию
func (r *CategoryRepository) Create(category *model.Category) error {
	return r.db.Create(category).Error
}

// GetByUserID возвращает все категории пользователя
func (r *CategoryRepository) GetByUserID(userID uint) ([]model.Category, error) {
	var categories []model.Category
	err := r.db.Where("user_id = ?", userID).Find(&categories).Error
	return categories, err
}

// GetByID возвращает категорию по ID с проверкой пользователя
func (r *CategoryRepository) GetByID(userID uint, id uint) (*model.Category, error) {
	var category model.Category
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&category).Error
	if err != nil {
		return nil, errors.New("category not found")
	}
	return &category, nil
}

// Delete удаляет категорию
func (r *CategoryRepository) Delete(userID uint, id uint) error {
	result := r.db.Where("user_id = ?", userID).Delete(&model.Category{}, id)
	if result.RowsAffected == 0 {
		return errors.New("category not found")
	}
	return result.Error
}
