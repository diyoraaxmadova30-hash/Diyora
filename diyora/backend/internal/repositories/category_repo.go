package repositories

import (
	"context"
	"database/sql"

	"backend/internal/models"
	"github.com/google/uuid"
)

type CategoryRepo struct {
	DB *sql.DB
}

func NewCategoryRepo(db *sql.DB) *CategoryRepo {
	return &CategoryRepo{DB: db}
}

func (r *CategoryRepo) Create(ctx context.Context, c *models.Category) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	query := `INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING created_at`
	return r.DB.QueryRowContext(ctx, query, c.ID, c.Name).Scan(&c.CreatedAt)
}

func (r *CategoryRepo) GetAll(ctx context.Context) ([]models.Category, error) {
	query := `SELECT id, name, created_at FROM categories ORDER BY name ASC`
	rows, err := r.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.CreatedAt); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	return cats, rows.Err()
}

func (r *CategoryRepo) Update(ctx context.Context, id uuid.UUID, name string) error {
	query := `UPDATE categories SET name = $1 WHERE id = $2`
	_, err := r.DB.ExecContext(ctx, query, name, id)
	return err
}

func (r *CategoryRepo) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM categories WHERE id = $1`
	_, err := r.DB.ExecContext(ctx, query, id)
	return err
}
