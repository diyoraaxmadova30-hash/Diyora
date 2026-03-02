package handlers

import (
	"net/http"

	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CategoryHandler struct {
	Repo *repositories.CategoryRepo
}

func NewCategoryHandler(repo *repositories.CategoryRepo) *CategoryHandler {
	return &CategoryHandler{Repo: repo}
}

type CategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

func (h *CategoryHandler) GetAll(c *gin.Context) {
	categories, err := h.Repo.GetAll(c.Request.Context())
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, categories)
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	cat := models.Category{Name: req.Name}
	if err := h.Repo.Create(c.Request.Context(), &cat); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, cat)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	if err := h.Repo.Update(c.Request.Context(), id, req.Name); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	middleware.RespondSuccess(c, "Category updated successfully")
}

func (h *CategoryHandler) Delete(c *gin.Context) {
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
	middleware.RespondSuccess(c, "Category deleted successfully")
}
