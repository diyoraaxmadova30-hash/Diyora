package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2a$10$wN24L4oP1yQJc0T1o6.gL.Q4O1p/S1X7vQ4lqJ0/Y9tP2W8a8P2a"
	password := "admin123"
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err == nil {
		fmt.Println("Password is correct!")
	} else {
		fmt.Printf("Password is incorrect: %v\n", err)
	}
}
