package telegram

import (
	"context"
	"fmt"
	"log"
	"strings"

	"backend/internal/models"
	"backend/internal/repositories"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/google/uuid"
)

type BotHandler struct {
	Bot       *tgbotapi.BotAPI
	UserRepo  *repositories.UserRepo
	CatRepo   *repositories.CategoryRepo
	ProdRepo  *repositories.ProductRepo
	CartRepo  *repositories.CartRepo
	OrderRepo *repositories.OrderRepo
}

func NewBotHandler(bot *tgbotapi.BotAPI, uRepo *repositories.UserRepo, cRepo *repositories.CategoryRepo, pRepo *repositories.ProductRepo, cartRepo *repositories.CartRepo, oRepo *repositories.OrderRepo) *BotHandler {
	return &BotHandler{
		Bot:       bot,
		UserRepo:  uRepo,
		CatRepo:   cRepo,
		ProdRepo:  pRepo,
		CartRepo:  cartRepo,
		OrderRepo: oRepo,
	}
}

func (h *BotHandler) StartListening() {
	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	updates := h.Bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message != nil {
			h.handleMessage(update.Message)
		} else if update.CallbackQuery != nil {
			h.handleCallback(update.CallbackQuery)
		}
	}
}

func (h *BotHandler) handleMessage(msg *tgbotapi.Message) {
	ctx := context.Background()

	// Ensure User Exists
	user, err := h.ensureUser(ctx, msg.From)
	if err != nil {
		log.Printf("Error ensuring user: %v", err)
		return
	}

	cmd := msg.Command()
	if cmd != "" {
		switch cmd {
		case "start":
			h.handleStartCmd(msg.Chat.ID, user)
		default:
			h.replyText(msg.Chat.ID, "Unknown command. Try /start")
		}
		return
	}

	// State Machine / Text Input check logic (for shipping address etc.)
	// A simple approach: if user is pending address input (based on some state), handle it.
	// For production we'd want a Redis-backed FSM.
	h.replyText(msg.Chat.ID, "Send /start to browse the shop!")
}

func (h *BotHandler) handleCallback(cb *tgbotapi.CallbackQuery) {
	ctx := context.Background()

	user, err := h.ensureUser(ctx, cb.From)
	if err != nil {
		h.Bot.Request(tgbotapi.NewCallback(cb.ID, "Error loading user"))
		return
	}

	cartID, err := h.CartRepo.EnsureCartExists(ctx, user.ID)
	if err != nil {
		h.Bot.Request(tgbotapi.NewCallback(cb.ID, "Error loading cart"))
		return
	}

	data := cb.Data
	parts := strings.Split(data, ":")
	action := parts[0]

	switch action {
	case "cats": // View Categories
		h.showCategories(cb.Message.Chat.ID, cb.Message.MessageID)

	case "cat": // View Products in Category
		if len(parts) > 1 {
			catID, _ := uuid.Parse(parts[1])
			h.showProducts(cb.Message.Chat.ID, cb.Message.MessageID, catID)
		}

	case "prod": // View single Product detail
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.showProductDetails(cb.Message.Chat.ID, cb.Message.MessageID, prodID)
		}

	case "add": // Add to Cart
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.CartRepo.AddOrUpdateItem(ctx, cartID, prodID, 1)
			h.Bot.Request(tgbotapi.NewCallbackWithAlert(cb.ID, "Added to cart!"))
			h.showCartOptions(cb.Message.Chat.ID)
		}

	case "rm": // Remvoe from Cart
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.CartRepo.RemoveItem(ctx, cartID, prodID)
			h.Bot.Request(tgbotapi.NewCallbackWithAlert(cb.ID, "Removed from cart!"))
			h.showCart(cb.Message.Chat.ID, cb.Message.MessageID, user.ID)
		}

	case "cart": // View Cart
		h.showCart(cb.Message.Chat.ID, cb.Message.MessageID, user.ID)

	case "checkout":
		h.handleCheckout(cb.Message.Chat.ID, user.ID, cartID)
	}

	// Always answer callback to clear loading state
	h.Bot.Request(tgbotapi.NewCallback(cb.ID, ""))
}

func (h *BotHandler) ensureUser(ctx context.Context, tgUser *tgbotapi.User) (*models.User, error) {
	uid := tgUser.ID
	user, err := h.UserRepo.GetByTelegramID(ctx, uid)
	if err != nil {
		return nil, err
	}
	if user != nil {
		return user, nil
	}

	name := tgUser.FirstName
	if tgUser.LastName != "" {
		name += " " + tgUser.LastName
	}

	newUser := &models.User{
		TelegramID: &uid,
		Name:       &name,
		Role:       "user",
	}

	if err := h.UserRepo.Create(ctx, newUser); err != nil {
		return nil, err
	}
	return newUser, nil
}

func (h *BotHandler) replyText(chatID int64, text string) {
	msg := tgbotapi.NewMessage(chatID, text)
	h.Bot.Send(msg)
}

func (h *BotHandler) handleStartCmd(chatID int64, user *models.User) {
	msg := tgbotapi.NewMessage(chatID, fmt.Sprintf("Welcome to the shop, %s!\nWhat would you like to do?", *user.Name))

	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("🛍️ Browse Categories", "cats"),
			tgbotapi.NewInlineKeyboardButtonData("🛒 View Cart", "cart"),
		),
	)
	msg.ReplyMarkup = keyboard
	h.Bot.Send(msg)
}

func (h *BotHandler) showCategories(chatID int64, msgID int) {
	cats, err := h.CatRepo.GetAll(context.Background())
	if err != nil {
		log.Printf("Bot error fetching categories: %v", err)
		h.replyText(chatID, "Error loading categories. Please try again later.")
		return
	}

	var rows [][]tgbotapi.InlineKeyboardButton
	for _, c := range cats {
		rows = append(rows, tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData(c.Name, "cat:"+c.ID.String()),
		))
	}

	msg := tgbotapi.NewMessage(chatID, "Choose a category:")
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	h.Bot.Send(msg)
}

func (h *BotHandler) showProducts(chatID int64, msgID int, catID uuid.UUID) {
	prods, err := h.ProdRepo.GetAll(context.Background(), &catID, "", 50, 0)
	if err != nil {
		log.Printf("Bot error fetching products for cat %s: %v", catID, err)
		h.replyText(chatID, "Error loading products. Please try again later.")
		return
	}

	if len(prods) == 0 {
		h.replyText(chatID, "No products in this category.")
		return
	}

	var rows [][]tgbotapi.InlineKeyboardButton
	for _, p := range prods {
		btn := tgbotapi.NewInlineKeyboardButtonData(fmt.Sprintf("%s - $%.2f", p.Name, p.Price), "prod:"+p.ID.String())
		rows = append(rows, tgbotapi.NewInlineKeyboardRow(btn))
	}

	// Add Back button
	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData("🔙 Back to Categories", "cats"),
	))

	msg := tgbotapi.NewMessage(chatID, "Products:")
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	h.Bot.Send(msg)
}

func (h *BotHandler) showProductDetails(chatID int64, msgID int, prodID uuid.UUID) {
	prod, err := h.ProdRepo.GetByID(context.Background(), prodID)
	if err != nil || prod == nil {
		h.replyText(chatID, "Product not found")
		return
	}

	desc := ""
	if prod.Description != nil {
		desc = *prod.Description
	}

	text := fmt.Sprintf("📦 *%s*\n💰 $%.2f\n\n%s", prod.Name, prod.Price, desc)
	msg := tgbotapi.NewMessage(chatID, text)
	msg.ParseMode = "Markdown"

	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("➕ Add to Cart", "add:"+prod.ID.String()),
		),
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("🔙 Back to Category", "cat:"+prod.CategoryID.String()),
		),
	)
	msg.ReplyMarkup = keyboard

	// If there's an image, send Photo instead
	if prod.ImageURL != nil && *prod.ImageURL != "" {
		photo := tgbotapi.NewPhoto(chatID, tgbotapi.FileURL(*prod.ImageURL))
		photo.Caption = text
		photo.ParseMode = "Markdown"
		photo.ReplyMarkup = keyboard
		h.Bot.Send(photo)
	} else {
		h.Bot.Send(msg)
	}
}

func (h *BotHandler) showCartOptions(chatID int64) {
	msg := tgbotapi.NewMessage(chatID, "What next?")
	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("🛒 View Cart", "cart"),
			tgbotapi.NewInlineKeyboardButtonData("🛍️ Keep Shopping", "cats"),
		),
	)
	msg.ReplyMarkup = keyboard
	h.Bot.Send(msg)
}

func (h *BotHandler) showCart(chatID int64, msgID int, userID uuid.UUID) {
	items, err := h.CartRepo.GetCartItems(context.Background(), userID)
	if err != nil || len(items) == 0 {
		h.replyText(chatID, "Your cart is empty.")
		return
	}

	var total float64
	text := "🛒 *Your Cart*\n\n"

	var rows [][]tgbotapi.InlineKeyboardButton
	for _, item := range items {
		sub := item.Product.Price * float64(item.Quantity)
		total += sub
		text += fmt.Sprintf("▪️ %s (x%d) - $%.2f\n", item.Product.Name, item.Quantity, sub)

		rows = append(rows, tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("❌ Remove "+item.Product.Name[:min(len(item.Product.Name), 10)], "rm:"+item.Product.ID.String()),
		))
	}

	text += fmt.Sprintf("\n*Total: $%.2f*", total)

	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData("💳 Checkout", "checkout"),
		tgbotapi.NewInlineKeyboardButtonData("🛍️ Keep Shopping", "cats"),
	))

	msg := tgbotapi.NewMessage(chatID, text)
	msg.ParseMode = "Markdown"
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	h.Bot.Send(msg)
}

func (h *BotHandler) handleCheckout(chatID int64, userID uuid.UUID, cartID uuid.UUID) {
	items, err := h.CartRepo.GetCartItems(context.Background(), userID)
	if err != nil || len(items) == 0 {
		h.replyText(chatID, "Cart is empty!")
		return
	}

	// Fast-track checkout with a dummy address for demo.
	// In reality you'd prompt user for address input via FSM.
	dummyAddress := "123 Main St"

	order, err := h.OrderRepo.CreateOrder(context.Background(), userID, dummyAddress, items, cartID)
	if err != nil {
		h.replyText(chatID, "Error processing order: "+err.Error())
		return
	}

	h.replyText(chatID, fmt.Sprintf("✅ *Order Placed!*\nOrder ID: `%s`\nTotal: $%.2f\nStatus: %s\n\nWe will contact you shortly!", order.ID, order.TotalPrice, order.Status))
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
