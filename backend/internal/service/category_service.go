package service

import (
	"finance-backend/internal/dto"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
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
