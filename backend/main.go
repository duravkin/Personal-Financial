package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Transaction struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Type        string  `json:"type"` // "income" или "expense"
	Date        string  `json:"date"`
}

var db *gorm.DB

func initDB() {
	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=disable TimeZone=UTC"

	var err error
	// Пытаемся подключиться несколько раз с задержкой
	for i := 0; i < 10; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Printf("Failed to connect to database (attempt %d/10): %v", i+1, err)
			time.Sleep(5 * time.Second)
			continue
		}
		break
	}

	if err != nil {
		log.Fatal("Failed to connect to database after 10 attempts:", err)
	}

	// Автомиграция
	err = db.AutoMigrate(&Transaction{})
	if err != nil {
		log.Fatal("Failed to auto-migrate:", err)
	}

	log.Println("Database connected successfully")
}

func main() {
	initDB()

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/transactions", getTransactions)
	r.POST("/transactions", createTransaction)
	r.PUT("/transactions/:id", updateTransaction)
	r.DELETE("/transactions/:id", deleteTransaction)

	log.Println("Server starting on :8080")
	r.Run(":8080")
}

func getTransactions(c *gin.Context) {
	var transactions []Transaction
	db.Find(&transactions)
	c.JSON(http.StatusOK, transactions)
}

func createTransaction(c *gin.Context) {
	var transaction Transaction
	if err := c.BindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Create(&transaction)
	c.JSON(http.StatusCreated, transaction)
}

func updateTransaction(c *gin.Context) {
	id := c.Param("id")
	var transaction Transaction
	if err := db.First(&transaction, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}
	if err := c.BindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Save(&transaction)
	c.JSON(http.StatusOK, transaction)
}

func deleteTransaction(c *gin.Context) {
	id := c.Param("id")
	db.Delete(&Transaction{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted"})
}
