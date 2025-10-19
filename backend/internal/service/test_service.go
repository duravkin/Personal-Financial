package service

import (
	"context"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
	"fmt"
)

// ProductService определяет интерфейс для бизнес-логики продуктов.
// Этот интерфейс позволяет использовать мок-реализации для тестирования.
type ProductService interface {
	GetProducts(ctx context.Context) ([]model.Product, error)
	GetProductByID(ctx context.Context, id int) (*model.Product, error)
	CreateProduct(ctx context.Context, product *model.Product) (*model.Product, error)
	UpdateProduct(ctx context.Context, product *model.Product) (*model.Product, error)
	DeleteProduct(ctx context.Context, id int) error
}

// productServiceImpl реализует интерфейс ProductService.
type productServiceImpl struct {
	// Зависимость от интерфейса ProductRepository.
	// Именно здесь проявляется инверсия зависимостей.
	repo repository.ProductRepository
}

// NewProductService создаёт и возвращает новую реализацию сервиса.
func NewProductService(repo repository.ProductRepository) ProductService {
	return &productServiceImpl{repo: repo}
}

// GetProducts получает список всех продуктов.
func (s *productServiceImpl) GetProducts(ctx context.Context) ([]model.Product, error) {
	// Вызов метода репозитория. Здесь нет бизнес-логики, только делегирование.
	return s.repo.FindAll(ctx)
}

// GetProductByID получает один продукт по ID.
func (s *productServiceImpl) GetProductByID(ctx context.Context, id int) (*model.Product, error) {
	// Может содержать бизнес-логику, например, проверку ID или кэширование.
	product, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, fmt.Errorf("product not found")
	}
	return product, nil
}

// CreateProduct создаёт новый продукт с применением бизнес-правил.
func (s *productServiceImpl) CreateProduct(ctx context.Context, product *model.Product) (*model.Product, error) {
	// Пример бизнес-логики:
	if product.Price <= 0 {
		return nil, fmt.Errorf("product price must be positive")
	}
	if product.Name == "" {
		return nil, fmt.Errorf("product name is required")
	}

	// Предположим, что мы хотим проверить уникальность имени продукта.
	// Это пример координации работы нескольких репозиториев, если бы они были.
	// В данном случае, просто проверяем, что продукта с таким именем ещё нет.
	existingProduct, err := s.repo.FindByName(ctx, product.Name)
	if err != nil {
		// Обработка ошибки базы данных
		return nil, err
	}
	if existingProduct != nil {
		return nil, fmt.Errorf("product with name '%s' already exists", product.Name)
	}

	// Вызываем метод репозитория для сохранения продукта.
	if err := s.repo.Create(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

// UpdateProduct обновляет существующий продукт.
func (s *productServiceImpl) UpdateProduct(ctx context.Context, product *model.Product) (*model.Product, error) {
	// Получение продукта для проверки.
	existingProduct, err := s.repo.FindByID(ctx, int(product.ID))
	if err != nil {
		return nil, err
	}
	if existingProduct == nil {
		return nil, fmt.Errorf("product not found")
	}

	// Бизнес-логика: не позволяем снижать цену, если она уже установлена.
	if product.Price > 0 && product.Price < existingProduct.Price {
		return nil, fmt.Errorf("cannot decrease product price")
	}

	// Вызов метода репозитория для обновления.
	if err := s.repo.Update(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

// DeleteProduct удаляет продукт.
func (s *productServiceImpl) DeleteProduct(ctx context.Context, id int) error {
	// Пример бизнес-логики: проверка существования перед удалением.
	existingProduct, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existingProduct == nil {
		return fmt.Errorf("product not found")
	}

	return s.repo.Delete(ctx, id)
}
