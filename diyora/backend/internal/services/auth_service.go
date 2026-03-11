package services

import (
	"context"
	"errors"
	"log"

	"backend/internal/models"
	"backend/internal/repositories"
	"backend/internal/utils"
)

type AuthService struct {
	UserRepo *repositories.UserRepo
}

func NewAuthService(userRepo *repositories.UserRepo) *AuthService {
	return &AuthService{UserRepo: userRepo}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, *models.User, error) {
	user, err := s.UserRepo.GetByEmail(ctx, email)
	if err != nil {
		return "", nil, err
	}
	if user == nil || user.PasswordHash == nil {
		return "", nil, errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(password, *user.PasswordHash) {
		log.Printf("Login failed: password mismatch for user %s", email)
		return "", nil, errors.New("invalid credentials")
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}
