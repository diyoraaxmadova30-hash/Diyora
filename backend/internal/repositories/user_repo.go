package repositories

import (
	"context"
	"database/sql"
	"errors"

	"backend/internal/models"

	"github.com/google/uuid"
)

type UserRepo struct {
	DB *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (r *UserRepo) Create(ctx context.Context, u *models.User) error {
	query := `
		INSERT INTO users (id, telegram_id, email, password_hash, role, name, phone, address, language)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING created_at`

	// If ID is not set, generate one
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}

	err := r.DB.QueryRowContext(ctx, query,
		u.ID, u.TelegramID, u.Email, u.PasswordHash, u.Role, u.Name, u.Phone, u.Address, u.Language,
	).Scan(&u.CreatedAt)

	return err
}

func (r *UserRepo) GetByTelegramID(ctx context.Context, telegramID int64) (*models.User, error) {
	query := `SELECT id, telegram_id, email, password_hash, role, name, phone, address, language, created_at FROM users WHERE telegram_id = $1`

	var u models.User
	err := r.DB.QueryRowContext(ctx, query, telegramID).Scan(
		&u.ID, &u.TelegramID, &u.Email, &u.PasswordHash, &u.Role, &u.Name, &u.Phone, &u.Address, &u.Language, &u.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `SELECT id, telegram_id, email, password_hash, role, name, phone, address, language, created_at FROM users WHERE email = $1`

	var u models.User
	err := r.DB.QueryRowContext(ctx, query, email).Scan(
		&u.ID, &u.TelegramID, &u.Email, &u.PasswordHash, &u.Role, &u.Name, &u.Phone, &u.Address, &u.Language, &u.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	query := `SELECT id, telegram_id, email, password_hash, role, name, phone, address, language, created_at FROM users WHERE id = $1`

	var u models.User
	err := r.DB.QueryRowContext(ctx, query, id).Scan(
		&u.ID, &u.TelegramID, &u.Email, &u.PasswordHash, &u.Role, &u.Name, &u.Phone, &u.Address, &u.Language, &u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetAll(ctx context.Context, limit, offset int) ([]models.User, error) {
	query := `SELECT id, telegram_id, email, role, name, phone, address, language, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	rows, err := r.DB.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.TelegramID, &u.Email, &u.Role, &u.Name, &u.Phone, &u.Address, &u.Language, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (r *UserRepo) UpdateAddress(ctx context.Context, id uuid.UUID, address string) error {
	query := `UPDATE users SET address = $1 WHERE id = $2`
	_, err := r.DB.ExecContext(ctx, query, address, id)
	return err
}

func (r *UserRepo) UpdateLanguage(ctx context.Context, id uuid.UUID, lang string) error {
	query := `UPDATE users SET language = $1 WHERE id = $2`
	_, err := r.DB.ExecContext(ctx, query, lang, id)
	return err
}
