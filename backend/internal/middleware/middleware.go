package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"

	"backend/internal/utils"
	"github.com/gin-gonic/gin"
)

func JSONHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		// standard JSON format happens in handlers to maintain control
	}
}

func RespondSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"error":   nil,
	})
}

func RespondError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{
		"success": false,
		"data":    nil,
		"error":   err.Error(),
	})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			RespondError(c, http.StatusUnauthorized, http.ErrNoCookie)
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			RespondError(c, http.StatusUnauthorized, err)
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			RespondError(c, http.StatusForbidden, http.ErrNoCookie) // using arbitrary error
			c.Abort()
			return
		}
		c.Next()
	}
}

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		log.Printf("[%d] %s %s %v", status, c.Request.Method, path, latency)
	}
}
