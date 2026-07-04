export async function sendTelegramNotification(household, taskTitle) {
  const token = household?.telegramBotToken
  const chatId = household?.telegramChatId
  if (!token || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ Task completed: "${taskTitle}"`,
        parse_mode: 'HTML',
      }),
    })
  } catch {
    // Notification failure should not break the app
  }
}
