package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/middleware"
	"backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderHandler struct {
	Repo *repositories.OrderRepo
}

func NewOrderHandler(repo *repositories.OrderRepo) *OrderHandler {
	return &OrderHandler{Repo: repo}
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func (h *OrderHandler) GetAll(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	orders, err := h.Repo.GetAll(c.Request.Context(), limit, offset)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	
	if orders == nil {
		middleware.RespondSuccess(c, []interface{}{})
		return
	}
	
	middleware.RespondSuccess(c, orders)
}

func (h *OrderHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	items, err := h.Repo.GetOrderItems(c.Request.Context(), id)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	
	if items == nil {
		middleware.RespondSuccess(c, []interface{}{})
		return
	}
	
	middleware.RespondSuccess(c, items)
}

func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	if err := h.Repo.UpdateStatus(c.Request.Context(), id, req.Status); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, "Order status updated successfully")
}
