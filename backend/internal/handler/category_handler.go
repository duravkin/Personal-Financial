package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"finance-backend/internal/dto"
	"finance-backend/internal/service"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(cs *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: cs}
}

// CreateCategory создает категорию
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category, err := h.categoryService.CreateCategory(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// GetCategories возвращает категории пользователя
func (h *CategoryHandler) GetCategories(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	categories, err := h.categoryService.GetUserCategories(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// DeleteCategory удаляет категорию
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category ID"})
		return
	}

	err = h.categoryService.DeleteCategory(userID, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "category deleted"})
}
