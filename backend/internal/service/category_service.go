package service

import (
	"errors"
	"finance-backend/internal/dto"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
	"time"
)

type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

func NewCategoryService(cr *repository.CategoryRepository) *CategoryService {
	return &CategoryService{categoryRepo: cr}
}

// CreateCategory создает новую категорию
func (s *CategoryService) CreateCategory(userID uint, req dto.CreateCategoryRequest) (*model.Category, error) {
	category := &model.Category{
		UserID: userID,
		Name:   req.Name,
		Type:   req.Type,
		Color:  req.Color,
	}

	err := s.categoryRepo.Create(category)
	return category, err
}

// GetUserCategories возвращает категории пользователя
func (s *CategoryService) GetUserCategories(userID uint) ([]model.Category, error) {
	return s.categoryRepo.GetByUserID(userID)
}

// DeleteCategory удаляет категорию
func (s *CategoryService) DeleteCategory(userID uint, id uint) error {
	return s.categoryRepo.Delete(userID, id)
}

// UpdateCategory обновляет категорию
func (s *CategoryService) UpdateCategory(userID uint, id uint, req dto.UpdateCategoryRequest) (*model.Category, error) {
	updates := make(map[string]interface{})

	// Подготавливаем поля для обновления
	if req.Name != "" {
		updates["name"] = req.Name
	}

	if req.Type != "" {
		updates["type"] = req.Type
	}

	if req.Color != "" {
		updates["color"] = req.Color
	}

	// Если нет полей для обновления
	if len(updates) == 0 {
		return nil, errors.New("no fields to update")
	}

	updates["updated_at"] = time.Now()

	return s.categoryRepo.Update(userID, id, updates)
}

// GetCategoryByID возвращает категорию по ID
func (s *CategoryService) GetCategoryByID(userID uint, id uint) (*model.Category, error) {
	return s.categoryRepo.GetByID(userID, id)
}
