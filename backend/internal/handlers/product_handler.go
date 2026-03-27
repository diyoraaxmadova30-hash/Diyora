package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProductHandler struct {
	Repo *repositories.ProductRepo
}

func NewProductHandler(repo *repositories.ProductRepo) *ProductHandler {
	return &ProductHandler{Repo: repo}
}

type ProductRequest struct {
	Name        string     `json:"name" binding:"required"`
	Description *string    `json:"description"`
	Price       float64    `json:"price" binding:"required,gt=0"`
	Stock       int        `json:"stock"`
	ImageURL    *string    `json:"image_url"`
	CategoryID  *uuid.UUID `json:"category_id"`
}

func (h *ProductHandler) GetAll(c *gin.Context) {
	categoryIDStr := c.Query("category_id")
	searchQuery := c.Query("search")
	var categoryID *uuid.UUID

	if categoryIDStr != "" {
		parsedID, err := uuid.Parse(categoryIDStr)
		if err == nil {
			categoryID = &parsedID
		}
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	products, err := h.Repo.GetAll(c.Request.Context(), categoryID, searchQuery, limit, offset)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}

	if products == nil {
		products = []models.Product{}
	}

	middleware.RespondSuccess(c, products)
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	product, err := h.Repo.GetByID(c.Request.Context(), id)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	if product == nil {
		middleware.RespondError(c, http.StatusNotFound, nil)
		return
	}
	middleware.RespondSuccess(c, product)
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	p := models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageURL:    req.ImageURL,
		CategoryID:  req.CategoryID,
	}

	if err := h.Repo.Create(c.Request.Context(), &p); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, p)
}

func (h *ProductHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	p := models.Product{
		ID:          id,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		ImageURL:    req.ImageURL,
		CategoryID:  req.CategoryID,
	}

	if err := h.Repo.Update(c.Request.Context(), &p); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, "Product updated successfully")
}

func (h *ProductHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	if err := h.Repo.Delete(c.Request.Context(), id); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, "Product deleted successfully")
}
