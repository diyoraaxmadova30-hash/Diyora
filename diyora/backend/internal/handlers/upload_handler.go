package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"backend/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		middleware.RespondError(c, http.StatusBadRequest, err)
		return
	}
	defer file.Close()

	// Ensure uploads directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}

	ext := filepath.Ext(header.Filename)
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dstPath := filepath.Join(uploadDir, newFileName)

	dst, err := os.Create(dstPath)
	if err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		middleware.RespondError(c, http.StatusInternalServerError, err)
		return
	}

	// For simplicity, returning the relative path
	// In production, this would be an S3 URL or an absolute domain path
	fileUrl := fmt.Sprintf("/uploads/%s", newFileName)
	middleware.RespondSuccess(c, gin.H{"url": fileUrl})
}
