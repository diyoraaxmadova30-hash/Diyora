package handlers

import (
	"log"
	"net/http"

	"backend/internal/middleware"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	AuthService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Login request binding failed: %v", err)
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	log.Printf("Attempting login for: %s", req.Email)
	token, user, err := h.AuthService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		log.Printf("Login service failed for %s: %v", req.Email, err)
		middleware.RespondError(c, http.StatusUnauthorized, err)
		return
	}

	// Remove password hash from response
	user.PasswordHash = nil

	middleware.RespondSuccess(c, gin.H{
		"token": token,
		"user":  user,
	})
}
