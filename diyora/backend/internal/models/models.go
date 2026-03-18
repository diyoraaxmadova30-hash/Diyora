package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	TelegramID   *int64    `json:"telegram_id,omitempty"`
	Email        *string   `json:"email,omitempty"`
	PasswordHash *string   `json:"-"`
	Role         string    `json:"role"`
	Name         *string   `json:"name,omitempty"`
	Phone        *string   `json:"phone,omitempty"`
	Address      *string   `json:"address,omitempty"`
	Language     *string   `json:"language,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type Category struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type Product struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	ImageURL    *string   `json:"image_url,omitempty"`
	CategoryID  uuid.UUID `json:"category_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type Cart struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"user_id"`
}

type CartItem struct {
	ID        uuid.UUID `json:"id"`
	CartID    uuid.UUID `json:"cart_id"`
	ProductID uuid.UUID `json:"product_id"`
	Quantity  int       `json:"quantity"`
	Product   *Product  `json:"product,omitempty"` // For joining queries
}

type Order struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"user_id"`
	UserName        string    `json:"user_name,omitempty"` // For joining queries
	TotalPrice      float64   `json:"total_price"`
	Status          string    `json:"status"`
	ShippingAddress *string   `json:"shipping_address,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type OrderItem struct {
	ID        uuid.UUID `json:"id"`
	OrderID   uuid.UUID `json:"order_id"`
	ProductID uuid.UUID `json:"product_id"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
	Product   *Product  `json:"product,omitempty"` // For joining queries
}
