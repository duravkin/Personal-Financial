package repository

import (
	"context"
	"finance-backend/internal/model"

	"gorm.io/gorm"
)

// ProductRepository определяет интерфейс для работы с продуктами.
// Он не изменился, что демонстрирует, как инверсия зависимостей
// позволяет легко менять реализацию.
type ProductRepository interface {
	FindAll(ctx context.Context) ([]model.Product, error)
	FindByID(ctx context.Context, id int) (*model.Product, error)
	FindByName(ctx context.Context, name string) (*model.Product, error)
	Create(ctx context.Context, product *model.Product) error
	Update(ctx context.Context, product *model.Product) error
	Delete(ctx context.Context, id int) error
}

// productRepositoryImpl реализует ProductRepository, используя GORM.
type productRepositoryImpl struct {
	db *gorm.DB
}

// NewProductRepository создаёт и возвращает новую реализацию репозитория.
func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepositoryImpl{db: db}
}

// FindAll получает все продукты из БД.
func (r *productRepositoryImpl) FindAll(ctx context.Context) ([]model.Product, error) {
	var products []model.Product
	// GORM автоматически преобразует вызов `Find` в SQL-запрос.
	result := r.db.WithContext(ctx).Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}
	return products, nil
}

// FindByID находит продукт по ID.
func (r *productRepositoryImpl) FindByID(ctx context.Context, id int) (*model.Product, error) {
	var product model.Product
	result := r.db.WithContext(ctx).First(&product, id)
	if result.Error != nil {
		// GORM возвращает gorm.ErrRecordNotFound, если запись не найдена.
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &product, nil
}

// FindByName выполняет запрос к БД и возвращает один продукт по имени.
func (r *productRepositoryImpl) FindByName(ctx context.Context, name string) (*model.Product, error) {
	var product model.Product
	// Использование GORM для выполнения запроса с условием по имени
	result := r.db.WithContext(ctx).Where("Name = ?", name).First(&product)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil // Продукт не найден, возвращаем nil без ошибки
		}
		return nil, result.Error
	}
	return &product, nil
}

// Create создаёт новую запись продукта.
func (r *productRepositoryImpl) Create(ctx context.Context, product *model.Product) error {
	result := r.db.WithContext(ctx).Create(product)
	return result.Error
}

// Update обновляет существующий продукт.
func (r *productRepositoryImpl) Update(ctx context.Context, product *model.Product) error {
	result := r.db.WithContext(ctx).Save(product)
	return result.Error
}

// Delete удаляет продукт по ID (мягкое удаление, если gorm.Model используется).
func (r *productRepositoryImpl) Delete(ctx context.Context, id int) error {
	result := r.db.WithContext(ctx).Delete(&model.Product{}, id)
	return result.Error
}
