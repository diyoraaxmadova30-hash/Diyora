package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/middleware"
	"backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	Repo *repositories.UserRepo
}

func NewUserHandler(repo *repositories.UserRepo) *UserHandler {
	return &UserHandler{Repo: repo}
}

func (h *UserHandler) GetAll(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	users, err := h.Repo.GetAll(c.Request.Context(), limit, offset)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	
	if users == nil {
		middleware.RespondSuccess(c, []interface{}{})
		return
	}
	
	middleware.RespondSuccess(c, users)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}

	user, err := h.Repo.GetByID(c.Request.Context(), id)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	if user == nil {
		middleware.RespondError(c, http.StatusNotFound, nil)
		return
	}
	
	user.PasswordHash = nil
	middleware.RespondSuccess(c, user)
}
