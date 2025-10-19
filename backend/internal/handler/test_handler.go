package handler

import (
	"net/http"
	"strconv"

	"finance-backend/internal/model"
	"finance-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// ProductHandler содержит зависимости для обработки запросов, связанных с продуктами.
type ProductHandler struct {
	service service.ProductService
}

// NewProductHandler создаёт новый обработчик с инъекцией зависимости.
func NewProductHandler(s service.ProductService) *ProductHandler {
	return &ProductHandler{service: s}
}

// GetProducts обрабатывает GET-запрос на получение списка продуктов.
// @Summary Получить все продукты
// @Tags products
// @Accept json
// @Produce json
// @Success 200 {array} model.Product
// @Failure 500 {object} gin.H
// @Router /products [get]
func (h *ProductHandler) GetProducts(c *gin.Context) {
	products, err := h.service.GetProducts(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

// GetProductByID обрабатывает GET-запрос на получение продукта по ID.
// @Summary Получить продукт по ID
// @Tags products
// @Param id path int true "ID продукта"
// @Accept json
// @Produce json
// @Success 200 {object} model.Product
// @Failure 400 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /products/{id} [get]
func (h *ProductHandler) GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	product, err := h.service.GetProductByID(c.Request.Context(), id)
	if err != nil {
		// В зависимости от типа ошибки, возвращаем соответствующий HTTP-статус
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, product)
}

// CreateProduct обрабатывает POST-запрос на создание нового продукта.
// @Summary Создать новый продукт
// @Tags products
// @Accept json
// @Produce json
// @Param product body model.Product true "Объект продукта для создания"
// @Success 201 {object} model.Product
// @Failure 400 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var newProduct model.Product
	if err := c.BindJSON(&newProduct); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	createdProduct, err := h.service.CreateProduct(c.Request.Context(), &newProduct)
	if err != nil {
		// Обработка ошибок бизнес-логики из сервисного слоя
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdProduct)
}

// UpdateProduct обрабатывает PUT-запрос на обновление продукта.
// @Summary Обновить продукт
// @Tags products
// @Param id path int true "ID продукта"
// @Accept json
// @Produce json
// @Param product body model.Product true "Обновленный объект продукта"
// @Success 200 {object} model.Product
// @Failure 400 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var updatedProduct model.Product
	if err := c.BindJSON(&updatedProduct); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	updatedProduct.ID = uint(id)

	result, err := h.service.UpdateProduct(c.Request.Context(), &updatedProduct)
	if err != nil {
		// Обработка ошибок бизнес-логики
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// DeleteProduct обрабатывает DELETE-запрос на удаление продукта.
// @Summary Удалить продукт
// @Tags products
// @Param id path int true "ID продукта"
// @Success 204 "Успешно удалено"
// @Failure 400 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	err = h.service.DeleteProduct(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}
