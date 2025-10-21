package app

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"finance-backend/internal/handler"
	"finance-backend/internal/middleware"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
	"finance-backend/internal/service"
)

func Run() {
	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=disable TimeZone=Europe/Moscow"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Автомиграция
	err = db.AutoMigrate(&model.User{}, &model.Category{}, &model.Transaction{})
	if err != nil {
		log.Fatal(err)
	}

	// JWT секрет
	jwtSecret := os.Getenv("JWT_SECRET")

	// Инициализация репозиториев
	userRepo := repository.NewUserRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)

	// Инициализация сервисов
	authService := service.NewAuthService(jwtSecret)
	userService := service.NewUserService(userRepo, authService)
	transactionService := service.NewTransactionService(transactionRepo, categoryRepo)
	categoryService := service.NewCategoryService(categoryRepo)

	// Инициализация хендлеров
	authHandler := handler.NewAuthHandler(userService, authService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	categoryHandler := handler.NewCategoryHandler(categoryService)

	// Настройка Gin
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"}, // порты, где работает фронт
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Публичные маршруты (без аутентификации)
	r.POST("/api/auth/register", authHandler.Register)
	r.POST("/api/auth/login", authHandler.Login)

	// Защищенные маршруты (требуют JWT токен)
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(authService))
	{
		// Профиль пользователя
		api.GET("/auth/profile", authHandler.GetProfile)

		// Транзакции
		api.POST("/transactions", transactionHandler.CreateTransaction)
		api.GET("/transactions", transactionHandler.GetTransactions)
		api.GET("/transactions/summary", transactionHandler.GetSummary)
		api.DELETE("/transactions/:id", transactionHandler.DeleteTransaction)

		// Категории
		api.POST("/categories", categoryHandler.CreateCategory)
		api.GET("/categories", categoryHandler.GetCategories)
		api.DELETE("/categories/:id", categoryHandler.DeleteCategory)
	}

	// Запуск сервера
	log.Println("Server starting on :8080")
	r.Run(":8080")
}
