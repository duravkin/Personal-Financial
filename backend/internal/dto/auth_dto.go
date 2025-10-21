package dto

type RegisterRequest struct {
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,min=6"`
    FirstName string `json:"first_name" binding:"required"`
    LastName  string `json:"last_name" binding:"required"`
}

type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
    Token string `json:"token"`
    User  struct {
        ID        uint   `json:"id"`
        Email     string `json:"email"`
        FirstName string `json:"first_name"`
        LastName  string `json:"last_name"`
    } `json:"user"`
}