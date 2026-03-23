package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"backend/internal/models"

	"github.com/google/uuid"
)

type OrderRepo struct {
	DB *sql.DB
}

func NewOrderRepo(db *sql.DB) *OrderRepo {
	return &OrderRepo{DB: db}
}

// CreateOrder processes a cart checkout using a transaction
func (r *OrderRepo) CreateOrder(ctx context.Context, userID uuid.UUID, address string, cartItems []models.CartItem, cartID uuid.UUID) (*models.Order, error) {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Calculate total amount
	var total float64
	for _, item := range cartItems {
		total += item.Product.Price * float64(item.Quantity)
	}

	// Create order
	order := &models.Order{
		ID:              uuid.New(),
		UserID:          userID,
		TotalPrice:      total,
		Status:          "pending",
		ShippingAddress: &address,
	}

	orderQuery := `INSERT INTO orders (id, user_id, total_price, status, shipping_address) VALUES ($1, $2, $3, $4, $5) RETURNING created_at`
	if err := tx.QueryRowContext(ctx, orderQuery, order.ID, order.UserID, order.TotalPrice, order.Status, order.ShippingAddress).Scan(&order.CreatedAt); err != nil {
		return nil, err
	}

	// Insert order items
	itemQuery := `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5)`
	stockQuery := `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id`

	for _, item := range cartItems {
		var updatedID uuid.UUID
		err := tx.QueryRowContext(ctx, stockQuery, item.Quantity, item.ProductID).Scan(&updatedID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, fmt.Errorf("insufficient stock for product %s", item.Product.Name)
			}
			return nil, err
		}

		if _, err := tx.ExecContext(ctx, itemQuery, uuid.New(), order.ID, item.ProductID, item.Quantity, item.Product.Price); err != nil {
			return nil, err
		}
	}

	// Clear cart
	clearQuery := `DELETE FROM cart_items WHERE cart_id = $1`
	if _, err := tx.ExecContext(ctx, clearQuery, cartID); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return order, nil
}

func (r *OrderRepo) GetAll(ctx context.Context, limit, offset int) ([]models.Order, error) {
	query := `
		SELECT o.id, o.user_id, u.name, o.total_price, o.status, o.shipping_address, o.created_at 
		FROM orders o
		JOIN users u ON o.user_id = u.id
		ORDER BY o.created_at DESC 
		LIMIT $1 OFFSET $2`
	rows, err := r.DB.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.UserName, &o.TotalPrice, &o.Status, &o.ShippingAddress, &o.CreatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

func (r *OrderRepo) GetUserOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error) {
	query := `
		SELECT o.id, o.user_id, u.name, o.total_price, o.status, o.shipping_address, o.created_at 
		FROM orders o
		JOIN users u ON o.user_id = u.id
		WHERE o.user_id = $1 
		ORDER BY o.created_at DESC`
	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.UserName, &o.TotalPrice, &o.Status, &o.ShippingAddress, &o.CreatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

func (r *OrderRepo) GetOrderItems(ctx context.Context, orderID uuid.UUID) ([]models.OrderItem, error) {
	query := `
		SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name 
		FROM order_items oi
		JOIN products p ON oi.product_id = p.id
		WHERE oi.order_id = $1`

	rows, err := r.DB.QueryContext(ctx, query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var item models.OrderItem
		var p models.Product
		if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Quantity, &item.Price, &p.Name); err != nil {
			return nil, err
		}
		item.Product = &p
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *OrderRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	query := `UPDATE orders SET status = $1 WHERE id = $2`
	_, err := r.DB.ExecContext(ctx, query, status, id)
	return err
}
