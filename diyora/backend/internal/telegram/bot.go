package telegram

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"backend/internal/models"
	"backend/internal/repositories"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/google/uuid"
)

var translations = map[string]map[string]string{
	"en": {
		"welcome":           "Welcome to the shop, *%s*!\nWhat would you like to do?",
		"browse_cats":       "🛍️ Browse Categories",
		"view_cart":         "🛒 View Cart",
		"choose_cat":        "📂 *Choose a category:*",
		"err_loading":       "⚠️ Error loading. Please try again later.",
		"no_prods":          "📭 No products in this category.",
		"products":          "📦 *Products:*",
		"back_to_cats":      "🔙 Back to Categories",
		"add_to_cart":       "➕ Add to Cart",
		"back_to_cat":       "🔙 Back to Category",
		"added_to_cart":     "✅ Added to cart!",
		"removed_from_cart": "🗑️ Removed from cart!",
		"what_next":         "❓ *What would you like to do next?*",
		"keep_shopping":     "🛍️ Keep Shopping",
		"cart_empty":        "📭 Your cart is empty.",
		"your_cart":         "🛒 *Your Cart*",
		"total":             "Total",
		"checkout":          "💳 Checkout",
		"order_placed":      "✅ *Order Placed!*\n\n🆔 ID: `%s`\n💰 Total: *%.2f sum*\n📊 Status: _%s_\n\n📞 We will contact you shortly!",
		"lang_selected":     "🇺🇸 Language updated to English!",
		"select_lang":       "🌐 Please select your language:",
		"unknown_cmd":       "❓ Unknown command. Try /start",
		"start_browse":      "👋 Send /start to browse the shop!",
		"remove":            "❌ Remove",
		"out_of_stock":      "⚠️ Not enough stock available.",
	},
	"uz": {
		"welcome":           "Do'konga xush kelibsiz, *%s*!\nNima qilmoqchisiz?",
		"browse_cats":       "🛍️ Kategoriyalarni ko'rish",
		"view_cart":         "🛒 Savatchani ko'rish",
		"choose_cat":        "📂 *Kategoriyani tanlang:*",
		"err_loading":       "⚠️ Xatolik yuz berdi. Keyinroq qayta urinib ko'ring.",
		"no_prods":          "📭 Ushbu kategoriyada mahsulotlar yo'q.",
		"products":          "📦 *Mahsulotlar:*",
		"back_to_cats":      "🔙 Kategoriyalarga qaytish",
		"add_to_cart":       "➕ Savatchaga qo'shish",
		"back_to_cat":       "🔙 Kategoriyaga qaytish",
		"added_to_cart":     "✅ Savatchaga qo'shildi!",
		"removed_from_cart": "🗑️ Savatchadan olib tashlandi!",
		"what_next":         "❓ *Keyingi qadam?*",
		"keep_shopping":     "🛍️ Xaridni davom ettirish",
		"cart_empty":        "📭 Savatchangiz bo'sh.",
		"your_cart":         "🛒 *Sizning savatchangiz*",
		"total":             "Jami",
		"checkout":          "💳 Buyurtma berish",
		"order_placed":      "✅ *Buyurtma qabul qilindi!*\n\n🆔 ID: `%s`\n💰 Jami: *%.2f so'm*\n📊 Holat: _%s_\n\n📞 Tez orada siz bilan bog'lanamiz!",
		"lang_selected":     "🇺🇿 Til o'zbek tiliga o'zgartirildi!",
		"select_lang":       "🌐 Iltimos, tilni tanlang:",
		"unknown_cmd":       "❓ Noma'lum buyruq. /start ni bosing",
		"start_browse":      "👋 Xarid qilish uchun /start ni bosing!",
		"remove":            "❌ O'chirish",
		"out_of_stock":      "⚠️ Zaxira yetarli emas.",
	},
	"ru": {
		"welcome":           "Добро пожаловать в магазин, *%s*!\nЧто бы вы хотели сделать?",
		"browse_cats":       "🛍️ Просмотреть категории",
		"view_cart":         "🛒 Просмотреть корзину",
		"choose_cat":        "📂 *Выберите категорию:*",
		"err_loading":       "⚠️ Ошибка загрузки. Пожалуйста, попробуйте позже.",
		"no_prods":          "📭 В этой категории нет товаров.",
		"products":          "📦 *Товары:*",
		"back_to_cats":      "🔙 Назад к категориям",
		"add_to_cart":       "➕ Добавить в корзину",
		"back_to_cat":       "🔙 Назад к категории",
		"added_to_cart":     "✅ Добавлено в корзину!",
		"removed_from_cart": "🗑️ Удалено из корзины!",
		"what_next":         "❓ *Что дальше?*",
		"keep_shopping":     "🛍️ Продолжить покупки",
		"cart_empty":        "📭 Ваша корзина пуста.",
		"your_cart":         "🛒 *Ваша корзина*",
		"total":             "Итого",
		"checkout":          "💳 Оформить заказ",
		"order_placed":      "✅ *Заказ оформлен!*\n\n🆔 ID: `%s`\n💰 Итого: *%.2f сум*\n📊 Статус: _%s_\n\n📞 Мы свяжемся с вами в ближайшее время!",
		"lang_selected":     "🇷🇺 Язык изменен на русский!",
		"select_lang":       "🌐 Пожалуйста, выберите язык:",
		"unknown_cmd":       "❓ Неизвестная команда. Попробуйте /start",
		"start_browse":      "👋 Отправьте /start, чтобы просмотреть магазин!",
		"remove":            "❌ Удалить",
		"out_of_stock":      "⚠️ Недостаточно товара в наличии.",
	},
}

func (h *BotHandler) T(user *models.User, key string) string {
	lang := "en"
	if user.Language != nil {
		lang = *user.Language
	}
	if t, ok := translations[lang][key]; ok {
		return t
	}
	return key
}

func (h *BotHandler) Tf(user *models.User, key string, args ...interface{}) string {
	return fmt.Sprintf(h.T(user, key), args...)
}

type BotHandler struct {
	Bot        *tgbotapi.BotAPI
	UserRepo   *repositories.UserRepo
	CatRepo    *repositories.CategoryRepo
	ProdRepo   *repositories.ProductRepo
	CartRepo   *repositories.CartRepo
	OrderRepo  *repositories.OrderRepo
	BackendURL string
	navMsgIDs  map[int64]int
}

func NewBotHandler(bot *tgbotapi.BotAPI, uRepo *repositories.UserRepo, cRepo *repositories.CategoryRepo, pRepo *repositories.ProductRepo, cartRepo *repositories.CartRepo, oRepo *repositories.OrderRepo, backendURL string) *BotHandler {
	return &BotHandler{
		Bot:        bot,
		UserRepo:   uRepo,
		CatRepo:    cRepo,
		ProdRepo:   pRepo,
		CartRepo:   cartRepo,
		OrderRepo:  oRepo,
		BackendURL: backendURL,
		navMsgIDs:  make(map[int64]int),
	}
}

func (h *BotHandler) updateNavMessage(chatID int64, newMsgID int) {
	if oldID, ok := h.navMsgIDs[chatID]; ok && oldID != newMsgID {
		h.Bot.Send(tgbotapi.NewDeleteMessage(chatID, oldID))
	}
	h.navMsgIDs[chatID] = newMsgID
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
	log.Printf("Received message from %s (ID: %d): %s", msg.From.UserName, msg.From.ID, msg.Text)
	// Delete user message to keep chat clean
	h.Bot.Send(tgbotapi.NewDeleteMessage(msg.Chat.ID, msg.MessageID))

	// Ensure User Exists
	user, err := h.ensureUser(ctx, msg.From)
	if err != nil {
		log.Printf("Error ensuring user %d: %v", msg.From.ID, err)
		return
	}

	cmd := msg.Command()
	if cmd != "" {
		switch cmd {
		case "start":
			h.handleStartCmd(msg.Chat.ID, user)
		default:
			h.replyText(msg.Chat.ID, h.T(user, "unknown_cmd"))
		}
		return
	}

	h.replyText(msg.Chat.ID, h.T(user, "start_browse"))
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
	case "set_lang":
		if len(parts) > 1 {
			lang := parts[1]
			h.UserRepo.UpdateLanguage(ctx, user.ID, lang)
			user.Language = &lang
			h.Bot.Request(tgbotapi.NewCallback(cb.ID, h.T(user, "lang_selected")))
			h.handleStartCmd(cb.Message.Chat.ID, user)
		}

	case "cats": // View Categories
		h.showCategories(cb.Message.Chat.ID, cb.Message.MessageID, user)

	case "cat": // View Products in Category
		if len(parts) > 1 {
			catID, _ := uuid.Parse(parts[1])
			h.showProducts(cb.Message.Chat.ID, cb.Message.MessageID, catID, user)
		}

	case "prod": // View single Product detail
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.showProductDetails(cb.Message.Chat.ID, cb.Message.MessageID, prodID, user)
		}

	case "p_inc": // Preview Increment Qty
		if len(parts) > 2 {
			prodID, _ := uuid.Parse(parts[1])
			qty, _ := strconv.Atoi(parts[2])
			qty++
			prod, _ := h.ProdRepo.GetByID(ctx, prodID)
			if prod != nil && qty > prod.Stock {
				qty = prod.Stock
			}
			h.updateProductDetails(cb, prodID, user, qty)
		}

	case "p_dec": // Preview Decrement Qty
		if len(parts) > 2 {
			prodID, _ := uuid.Parse(parts[1])
			qty, _ := strconv.Atoi(parts[2])
			if qty > 1 {
				qty--
			}
			h.updateProductDetails(cb, prodID, user, qty)
		}

	case "p_add": // Add to Cart from Preview
		if len(parts) > 2 {
			prodID, _ := uuid.Parse(parts[1])
			qty, _ := strconv.Atoi(parts[2])

			items, _ := h.CartRepo.GetCartItems(ctx, user.ID)
			currentQty := 0
			for _, it := range items {
				if it.ProductID == prodID {
					currentQty = it.Quantity
				}
			}
			prod, _ := h.ProdRepo.GetByID(ctx, prodID)
			if prod != nil && currentQty+qty > prod.Stock {
				h.Bot.Request(tgbotapi.NewCallbackWithAlert(cb.ID, h.T(user, "out_of_stock")))
				return
			}

			h.CartRepo.AddOrUpdateItem(ctx, cartID, prodID, qty)
			h.Bot.Request(tgbotapi.NewCallbackWithAlert(cb.ID, h.T(user, "added_to_cart")))
			h.updateProductDetails(cb, prodID, user, qty) // Just refresh to keep same qty showing
		}

	case "c_inc": // In-cart Increment Qty
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.CartRepo.AddOrUpdateItem(ctx, cartID, prodID, 1)
			h.showCart(cb.Message.Chat.ID, cb.Message.MessageID, user)
		}

	case "c_dec": // In-cart Decrement Qty
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.CartRepo.AddOrUpdateItem(ctx, cartID, prodID, -1)
			h.showCart(cb.Message.Chat.ID, cb.Message.MessageID, user)
		}

	case "rm": // Remove from Cart (Legacy, keep if needed or replace)
		if len(parts) > 1 {
			prodID, _ := uuid.Parse(parts[1])
			h.CartRepo.RemoveItem(ctx, cartID, prodID)
			h.Bot.Request(tgbotapi.NewCallbackWithAlert(cb.ID, h.T(user, "removed_from_cart")))
			h.showCart(cb.Message.Chat.ID, cb.Message.MessageID, user)
		}

	case "cart": // View Cart
		h.showCart(cb.Message.Chat.ID, cb.Message.MessageID, user)

	case "checkout":
		h.handleCheckout(cb.Message.Chat.ID, user, cartID)
	}

	// Always answer callback to clear loading state
	h.Bot.Request(tgbotapi.NewCallback(cb.ID, ""))
}

func (h *BotHandler) ensureUser(ctx context.Context, tgUser *tgbotapi.User) (*models.User, error) {
	uid := tgUser.ID
	user, err := h.UserRepo.GetByTelegramID(ctx, uid)
	if err != nil {
		log.Printf("[DEBUG] DB Error in GetByTelegramID for user %d: %v", uid, err)
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
	sent, err := h.Bot.Send(msg)
	if err == nil {
		h.updateNavMessage(chatID, sent.MessageID)
	}
}

func (h *BotHandler) handleStartCmd(chatID int64, user *models.User) {
	log.Printf("Handling /start for user: %d", user.TelegramID)
	if user.Language == nil {
		h.showLanguageSelection(chatID, user)
		return
	}

	userName := "User"
	if user.Name != nil {
		userName = *user.Name
	}

	msg := tgbotapi.NewMessage(chatID, h.Tf(user, "welcome", userName))

	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData(h.T(user, "browse_cats"), "cats"),
			tgbotapi.NewInlineKeyboardButtonData(h.T(user, "view_cart"), "cart"),
		),
	)
	msg.ReplyMarkup = keyboard
	sent, err := h.Bot.Send(msg)
	if err == nil {
		h.updateNavMessage(chatID, sent.MessageID)
	}
}

func (h *BotHandler) showLanguageSelection(chatID int64, user *models.User) {
	msg := tgbotapi.NewMessage(chatID, "Please select your language / Илтимос, тилни танланг / Пожалуйста, выберите язык:")
	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("🇺🇿 O'zbekcha", "set_lang:uz"),
			tgbotapi.NewInlineKeyboardButtonData("🇷🇺 Русский", "set_lang:ru"),
			tgbotapi.NewInlineKeyboardButtonData("🇺🇸 English", "set_lang:en"),
		),
	)
	msg.ReplyMarkup = keyboard
	sent, err := h.Bot.Send(msg)
	if err == nil {
		h.updateNavMessage(chatID, sent.MessageID)
	}
}

func (h *BotHandler) showCategories(chatID int64, msgID int, user *models.User) {
	cats, err := h.CatRepo.GetAll(context.Background())
	if err != nil {
		log.Printf("Bot error fetching categories: %v", err)
		h.replyText(chatID, h.T(user, "err_loading"))
		return
	}

	var rows [][]tgbotapi.InlineKeyboardButton
	for _, c := range cats {
		rows = append(rows, tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData(c.Name, "cat:"+c.ID.String()),
		))
	}

	msg := tgbotapi.NewMessage(chatID, h.T(user, "choose_cat"))
	msg.ParseMode = "Markdown"
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	sent, err := h.Bot.Send(msg)
	if err == nil {
		h.updateNavMessage(chatID, sent.MessageID)
	}
}

func (h *BotHandler) showProducts(chatID int64, msgID int, catID uuid.UUID, user *models.User) {
	prods, err := h.ProdRepo.GetAll(context.Background(), &catID, "", 50, 0)
	if err != nil {
		log.Printf("Bot error fetching products for cat %s: %v", catID, err)
		h.replyText(chatID, h.T(user, "err_loading"))
		return
	}

	if len(prods) == 0 {
		h.replyText(chatID, h.T(user, "no_prods"))
		return
	}

	var rows [][]tgbotapi.InlineKeyboardButton
	for _, p := range prods {
		btn := tgbotapi.NewInlineKeyboardButtonData(fmt.Sprintf("%s - %.2f so'm", p.Name, p.Price), "prod:"+p.ID.String())
		rows = append(rows, tgbotapi.NewInlineKeyboardRow(btn))
	}

	// Add Back button
	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData(h.T(user, "back_to_cats"), "cats"),
	))

	msg := tgbotapi.NewMessage(chatID, h.T(user, "products"))
	msg.ParseMode = "Markdown"
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)
	sent, err := h.Bot.Send(msg)
	if err == nil {
		h.updateNavMessage(chatID, sent.MessageID)
	}
}

func (h *BotHandler) getProductMessageData(ctx context.Context, prodID uuid.UUID, user *models.User, displayQty int) (*models.Product, string, tgbotapi.InlineKeyboardMarkup, error) {
	prod, err := h.ProdRepo.GetByID(ctx, prodID)
	if err != nil || prod == nil {
		return nil, "", tgbotapi.InlineKeyboardMarkup{}, err
	}

	if displayQty > prod.Stock {
		displayQty = prod.Stock
	}
	if displayQty < 1 {
		displayQty = 1
	}

	totalPrice := prod.Price * float64(displayQty)

	text := fmt.Sprintf("📦 *%s*\n\nЦена: %.0f UZS\nКоличество: %d\nВ наличии: %d\nИтого: %.0f UZS", prod.Name, prod.Price, displayQty, prod.Stock, totalPrice)
	if prod.Description != nil && *prod.Description != "" {
		text += fmt.Sprintf("\n\n%s", *prod.Description)
	}

	var keyboard tgbotapi.InlineKeyboardMarkup
	if prod.Stock <= 0 {
		text += "\n\n" + h.T(user, "out_of_stock")
		keyboard = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(
				tgbotapi.NewInlineKeyboardButtonData("⬅️ "+h.T(user, "back_to_cat"), "cat:"+prod.CategoryID.String()),
				tgbotapi.NewInlineKeyboardButtonData("🛒 "+h.T(user, "view_cart"), "cart"),
			),
		)
	} else {
		keyboard = tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(
				tgbotapi.NewInlineKeyboardButtonData("-", fmt.Sprintf("p_dec:%s:%d", prod.ID.String(), displayQty)),
				tgbotapi.NewInlineKeyboardButtonData(fmt.Sprintf("%d", displayQty), "none"),
				tgbotapi.NewInlineKeyboardButtonData("+", fmt.Sprintf("p_inc:%s:%d", prod.ID.String(), displayQty)),
			),
			tgbotapi.NewInlineKeyboardRow(
				tgbotapi.NewInlineKeyboardButtonData(h.T(user, "add_to_cart"), fmt.Sprintf("p_add:%s:%d", prod.ID.String(), displayQty)),
			),
			tgbotapi.NewInlineKeyboardRow(
				tgbotapi.NewInlineKeyboardButtonData("⬅️ "+h.T(user, "back_to_cat"), "cat:"+prod.CategoryID.String()),
				tgbotapi.NewInlineKeyboardButtonData("🛒 "+h.T(user, "view_cart"), "cart"),
			),
		)
	}

	return prod, text, keyboard, nil
}

func (h *BotHandler) showProductDetails(chatID int64, msgID int, prodID uuid.UUID, user *models.User) {
	ctx := context.Background()
	prod, text, keyboard, err := h.getProductMessageData(ctx, prodID, user, 1)
	if err != nil {
		h.replyText(chatID, h.T(user, "err_loading"))
		return
	}

	// If there's an image, send Photo instead
	if prod.ImageURL != nil && *prod.ImageURL != "" {
		origURL := *prod.ImageURL
		var photo tgbotapi.PhotoConfig

		localPath := "." + origURL
		if strings.HasPrefix(origURL, "/uploads/") && fileExists(localPath) {
			photo = tgbotapi.NewPhoto(chatID, tgbotapi.FilePath(localPath))
		} else {
			photo = tgbotapi.NewPhoto(chatID, tgbotapi.FileURL(h.BackendURL+origURL))
		}

		photo.Caption = text
		photo.ParseMode = "Markdown"
		photo.ReplyMarkup = keyboard

		_, err := h.Bot.Send(photo)
		if err != nil {
			log.Printf("Error sending photo: %v", err)
			msg := tgbotapi.NewMessage(chatID, text)
			msg.ParseMode = "Markdown"
			msg.ReplyMarkup = keyboard
			h.Bot.Send(msg)
		}
	} else {
		msg := tgbotapi.NewMessage(chatID, text)
		msg.ParseMode = "Markdown"
		msg.ReplyMarkup = keyboard
		h.Bot.Send(msg)
	}
}

func (h *BotHandler) updateProductDetails(cb *tgbotapi.CallbackQuery, prodID uuid.UUID, user *models.User, displayQty int) {
	ctx := context.Background()
	chatID := cb.Message.Chat.ID
	msgID := cb.Message.MessageID

	_, text, keyboard, err := h.getProductMessageData(ctx, prodID, user, displayQty)
	if err != nil {
		h.replyText(chatID, h.T(user, "err_loading"))
		return
	}

	if cb.Message.Photo != nil && len(cb.Message.Photo) > 0 {
		edit := tgbotapi.NewEditMessageCaption(chatID, msgID, text)
		edit.ParseMode = "Markdown"
		edit.ReplyMarkup = &keyboard
		if _, err := h.Bot.Send(edit); err != nil {
			log.Printf("Error editing product caption: %v", err)
		}
	} else {
		edit := tgbotapi.NewEditMessageText(chatID, msgID, text)
		edit.ParseMode = "Markdown"
		edit.ReplyMarkup = &keyboard
		if _, err := h.Bot.Send(edit); err != nil {
			log.Printf("Error editing product text: %v", err)
		}
	}
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func (h *BotHandler) showCartOptions(chatID int64, user *models.User) {
	msg := tgbotapi.NewMessage(chatID, h.T(user, "what_next"))
	keyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData(h.T(user, "view_cart"), "cart"),
			tgbotapi.NewInlineKeyboardButtonData(h.T(user, "keep_shopping"), "cats"),
		),
	)
	msg.ReplyMarkup = keyboard
	h.Bot.Send(msg)
}

func (h *BotHandler) showCart(chatID int64, msgID int, user *models.User) {
	items, err := h.CartRepo.GetCartItems(context.Background(), user.ID)
	if err != nil || len(items) == 0 {
		h.replyText(chatID, h.T(user, "cart_empty"))
		return
	}

	var total float64
	text := h.T(user, "your_cart") + "\n\n"

	var rows [][]tgbotapi.InlineKeyboardButton
	for _, item := range items {
		sub := item.Product.Price * float64(item.Quantity)
		total += sub
		text += fmt.Sprintf("▪️ %s (x%d) - $%.2f\n", item.Product.Name, item.Quantity, sub)

		rows = append(rows, tgbotapi.NewInlineKeyboardRow(
			tgbotapi.NewInlineKeyboardButtonData("-", "c_dec:"+item.Product.ID.String()),
			tgbotapi.NewInlineKeyboardButtonData(item.Product.Name[:min(len(item.Product.Name), 12)]+fmt.Sprintf(" (%d)", item.Quantity), "none"),
			tgbotapi.NewInlineKeyboardButtonData("+", "c_inc:"+item.Product.ID.String()),
		))
	}

	text += fmt.Sprintf("\n*%s: $%.2f*", h.T(user, "total"), total)

	rows = append(rows, tgbotapi.NewInlineKeyboardRow(
		tgbotapi.NewInlineKeyboardButtonData(h.T(user, "checkout"), "checkout"),
		tgbotapi.NewInlineKeyboardButtonData(h.T(user, "keep_shopping"), "cats"),
	))

	msg := tgbotapi.NewMessage(chatID, text)
	msg.ParseMode = "Markdown"
	keyboard := tgbotapi.NewInlineKeyboardMarkup(rows...)
	msg.ReplyMarkup = keyboard

	if msgID > 0 {
		edit := tgbotapi.NewEditMessageText(chatID, msgID, text)
		edit.ParseMode = "Markdown"
		edit.ReplyMarkup = &keyboard
		_, err := h.Bot.Send(edit)
		if err == nil {
			h.updateNavMessage(chatID, msgID)
			return
		}
	}

	sent, err := h.Bot.Send(msg)
	if err == nil {
		h.updateNavMessage(chatID, sent.MessageID)
	}
}

func (h *BotHandler) handleCheckout(chatID int64, user *models.User, cartID uuid.UUID) {
	items, err := h.CartRepo.GetCartItems(context.Background(), user.ID)
	if err != nil || len(items) == 0 {
		h.replyText(chatID, h.T(user, "cart_empty"))
		return
	}

	// Fast track checkout...
	dummyAddress := "123 Main St"

	order, err := h.OrderRepo.CreateOrder(context.Background(), user.ID, dummyAddress, items, cartID)
	if err != nil {
		h.replyText(chatID, h.T(user, "err_loading")+" "+err.Error())
		return
	}

	// Send persistent order confirmation
	shortID := "#" + strings.ToUpper(order.ID.String()[:8])
	msg := tgbotapi.NewMessage(chatID, h.Tf(user, "order_placed", shortID, order.TotalPrice, order.Status))
	msg.ParseMode = "Markdown"
	h.Bot.Send(msg)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
