package app

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"finance-backend/internal/handler"
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

	// Создаем тестового пользователя если его нет
	var user model.User
	if err := db.First(&user, 1).Error; err != nil {
		// Хешируем пароль
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

		user = model.User{
			ID:        1,
			Email:     "test@example.com",
			Password:  string(hashedPassword),
			FirstName: "Test",
			LastName:  "User",
		}
		if err := db.Create(&user).Error; err != nil {
			log.Fatal("Failed to create test user:", err)
		}
		log.Println("Created test user with ID: 1")
	}

	// Инициализация репозиториев
	transactionRepo := repository.NewTransactionRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)

	// Инициализация сервисов
	transactionService := service.NewTransactionService(transactionRepo, categoryRepo)
	categoryService := service.NewCategoryService(categoryRepo)

	// Инициализация хендлеров
	transactionHandler := handler.NewTransactionHandler(transactionService)
	categoryHandler := handler.NewCategoryHandler(categoryService)

	// Настройка Gin
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"}, // порты, где работает фронт
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// Простое middleware для тестирования (в реальном приложении заменить на JWT)
	r.Use(func(c *gin.Context) {
		// Для тестирования устанавливаем userID = 1
		c.Set("userID", uint(1))
		c.Next()
	})

	// Маршруты
	api := r.Group("/api")
	{
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
