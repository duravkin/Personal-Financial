package middleware

import "github.com/gin-gonic/gin"

// SimpleAuthMiddleware - упрощенное middleware для тестирования
// В реальном приложении заменить на JWT аутентификацию
func SimpleAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Для тестирования устанавливаем userID = 1
		c.Set("userID", uint(1))
		c.Next()
	}
}
