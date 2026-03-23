package repositories

import (
	"context"
	"database/sql"
	"errors"

	"backend/internal/models"
	"github.com/google/uuid"
)

type CartRepo struct {
	DB *sql.DB
}

func NewCartRepo(db *sql.DB) *CartRepo {
	return &CartRepo{DB: db}
}

// EnsureCartExists creates a cart for the user if it doesn't exist
func (r *CartRepo) EnsureCartExists(ctx context.Context, userID uuid.UUID) (uuid.UUID, error) {
	var cartID uuid.UUID
	query := `SELECT id FROM carts WHERE user_id = $1`
	err := r.DB.QueryRowContext(ctx, query, userID).Scan(&cartID)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			cartID = uuid.New()
			insertQuery := `INSERT INTO carts (id, user_id) VALUES ($1, $2)`
			if _, err := r.DB.ExecContext(ctx, insertQuery, cartID, userID); err != nil {
				return uuid.Nil, err
			}
			return cartID, nil
		}
		return uuid.Nil, err
	}
	return cartID, nil
}

func (r *CartRepo) GetCartItems(ctx context.Context, userID uuid.UUID) ([]models.CartItem, error) {
	query := `
		SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, p.name, p.price, p.image_url
		FROM cart_items ci
		JOIN carts c ON ci.cart_id = c.id
		JOIN products p ON ci.product_id = p.id
		WHERE c.user_id = $1
		ORDER BY ci.id ASC`

	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var item models.CartItem
		var p models.Product
		if err := rows.Scan(
			&item.ID, &item.CartID, &item.ProductID, &item.Quantity,
			&p.Name, &p.Price, &p.ImageURL,
		); err != nil {
			return nil, err
		}
		item.Product = &p
		item.Product.ID = item.ProductID
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *CartRepo) AddOrUpdateItem(ctx context.Context, cartID, productID uuid.UUID, quantityDelta int) error {
	// Upsert query for cart items
	query := `
		INSERT INTO cart_items (id, cart_id, product_id, quantity)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (cart_id, product_id) 
		DO UPDATE SET quantity = cart_items.quantity + $4
		RETURNING quantity`

	var newQuantity int
	err := r.DB.QueryRowContext(ctx, query, uuid.New(), cartID, productID, quantityDelta).Scan(&newQuantity)
	if err != nil {
		return err
	}

	// Remove item if quantity goes to 0 or below
	if newQuantity <= 0 {
		delQuery := `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`
		_, err = r.DB.ExecContext(ctx, delQuery, cartID, productID)
	}
	return err
}

func (r *CartRepo) RemoveItem(ctx context.Context, cartID, productID uuid.UUID) error {
	query := `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`
	_, err := r.DB.ExecContext(ctx, query, cartID, productID)
	return err
}

func (r *CartRepo) ClearCart(ctx context.Context, cartID uuid.UUID) error {
	query := `DELETE FROM cart_items WHERE cart_id = $1`
	_, err := r.DB.ExecContext(ctx, query, cartID)
	return err
}
