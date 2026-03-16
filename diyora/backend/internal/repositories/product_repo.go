package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"backend/internal/models"

	"github.com/google/uuid"
)

type ProductRepo struct {
	DB *sql.DB
}

func NewProductRepo(db *sql.DB) *ProductRepo {
	return &ProductRepo{DB: db}
}

func (r *ProductRepo) Create(ctx context.Context, p *models.Product) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	query := `INSERT INTO products (id, name, description, price, stock, image_url, category_id) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING created_at`
	return r.DB.QueryRowContext(ctx, query, p.ID, p.Name, p.Description, p.Price, p.Stock, p.ImageURL, p.CategoryID).Scan(&p.CreatedAt)
}

func (r *ProductRepo) GetByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	query := `SELECT id, name, description, price, stock, image_url, category_id, created_at FROM products WHERE id = $1`
	var p models.Product
	err := r.DB.QueryRowContext(ctx, query, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.ImageURL, &p.CategoryID, &p.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepo) GetAll(ctx context.Context, categoryID *uuid.UUID, searchQuery string, limit, offset int) ([]models.Product, error) {
	baseQuery := `SELECT id, name, description, price, stock, image_url, category_id, created_at FROM products WHERE 1=1`
	var args []interface{}
	argCount := 1

	if categoryID != nil {
		baseQuery += fmt.Sprintf(` AND category_id = $%d`, argCount)
		args = append(args, *categoryID)
		argCount++
	}

	if searchQuery != "" {
		baseQuery += fmt.Sprintf(` AND name ILIKE $%d`, argCount)
		args = append(args, "%"+searchQuery+"%")
		argCount++
	}

	baseQuery += fmt.Sprintf(` ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, argCount, argCount+1)
	args = append(args, limit, offset)

	rows, err := r.DB.QueryContext(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.ImageURL, &p.CategoryID, &p.CreatedAt); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (r *ProductRepo) Update(ctx context.Context, p *models.Product) error {
	query := `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5, category_id = $6 WHERE id = $7`
	_, err := r.DB.ExecContext(ctx, query, p.Name, p.Description, p.Price, p.Stock, p.ImageURL, p.CategoryID, p.ID)
	return err
}

func (r *ProductRepo) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM products WHERE id = $1`
	_, err := r.DB.ExecContext(ctx, query, id)
	return err
}
