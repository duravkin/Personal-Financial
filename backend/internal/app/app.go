package app

import (
	"finance-backend/internal/handler"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
	"finance-backend/internal/service"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
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
		log.Fatal("Failes connect to database:", err)
	}

	err = db.AutoMigrate(&model.Product{})
	if err != nil {
		log.Fatal("Failed to auto-migrate:", err)
	}
	log.Println("Database connected successfully")

	productRepo := repository.NewProductRepository(db)

	productService := service.NewProductService(productRepo)

	productHandler := handler.NewProductHandler(productService)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"}, // порты, где работает фронт
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	api_product := router.Group("api/products")
	{
		api_product.GET("", productHandler.GetProducts)
		api_product.POST("", productHandler.CreateProduct)
		api_product.PUT("/:id", productHandler.UpdateProduct)
		api_product.DELETE("/:id", productHandler.DeleteProduct)
	}

	router.Run(":8080")
}
