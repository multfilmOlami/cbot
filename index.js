import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";

// ENV ni yoqamiz
dotenv.config();

// TOKEN va API KEY ni env dan olamiz
const BOT_TOKEN = process.env.BOT_TOKEN;
const CUTY_API_KEY = process.env.CUTY_API_KEY;

// Botni ishga tushiramiz
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// /start komandasi
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Salom!\n\n🔗 Link yuboring, men uni qisqartirib beraman."
  );
});

// Oddiy xabarlar
bot.on("message", async (msg) => {
  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  const url = msg.text.trim();

  if (!url.startsWith("http")) {
    return bot.sendMessage(msg.chat.id, "❌ To‘g‘ri link yuboring.");
  }

  try {
    const res = await fetch(
      `https://cuty.io/api?api=${CUTY_API_KEY}&url=${encodeURIComponent(url)}`
    );
    const data = await res.json();

    if (data.status === "success") {
      bot.sendMessage(
        msg.chat.id,
        `✅ Qisqartirilgan link:\n${data.shortenedUrl}`
      );
    } else {
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik yuz berdi.");
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "🚫 Server xatosi.");
  }
});