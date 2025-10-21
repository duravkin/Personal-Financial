package service

import (
	"errors"

	"finance-backend/internal/dto"
	"finance-backend/internal/model"
	"finance-backend/internal/repository"
)

type UserService struct {
	userRepo    *repository.UserRepository
	authService *AuthService
}

func NewUserService(userRepo *repository.UserRepository, authService *AuthService) *UserService {
	return &UserService{
		userRepo:    userRepo,
		authService: authService,
	}
}

// Register регистрирует нового пользователя
func (s *UserService) Register(req dto.RegisterRequest) (*model.User, error) {
	// Проверяем, нет ли уже пользователя с таким email
	if s.userRepo.EmailExists(req.Email) {
		return nil, errors.New("user with this email already exists")
	}

	// Хешируем пароль
	hashedPassword, err := s.authService.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &model.User{
		Email:     req.Email,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return nil, errors.New("failed to create user")
	}

	return user, nil
}

// Login аутентифицирует пользователя
func (s *UserService) Login(req dto.LoginRequest) (*model.User, error) {
	// Находим пользователя по email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Проверяем пароль
	if !s.authService.CheckPassword(req.Password, user.Password) {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}

// GetUserByID возвращает пользователя по ID
func (s *UserService) GetUserByID(userID uint) (*model.User, error) {
	return s.userRepo.GetByID(userID)
}
