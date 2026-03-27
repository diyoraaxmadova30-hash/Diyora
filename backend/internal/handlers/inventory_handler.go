package handlers

import (
	"net/http"

	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	Repo *repositories.ProductRepo
}

func NewInventoryHandler(repo *repositories.ProductRepo) *InventoryHandler {
	return &InventoryHandler{Repo: repo}
}

func (h *InventoryHandler) GetStats(c *gin.Context) {
	total, lowStock, err := h.Repo.GetInventoryStats(c.Request.Context())
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}

	middleware.RespondSuccess(c, gin.H{
		"total_products":  total,
		"low_stock_count": lowStock,
	})
}

func (h *InventoryHandler) GetLowStock(c *gin.Context) {
	products, err := h.Repo.GetLowStockProducts(c.Request.Context())
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}

	if products == nil {
		products = []models.Product{}
	}

	middleware.RespondSuccess(c, products)
}
