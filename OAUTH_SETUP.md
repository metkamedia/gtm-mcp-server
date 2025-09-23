# 📋 Инструкция по настройке Google OAuth для GTM MCP Server

## ⚠️ Важно: Перед использованием нужно настроить Google OAuth!

### 1. Создание проекта в Google Cloud Console

1. 📁 Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. ➕ Создайте новый проект или выберите существующий:
   - Нажмите на селектор проекта вверху страницы
   - Нажмите "New Project" (Новый проект)
   - Укажите название: "GTM MCP Server" 
   - Нажмите "Create" (Создать)

### 2. Включение Google Tag Manager API

1. 🔍 В поиске введите "Tag Manager API"
2. 📋 Найдите "Tag Manager API" в результатах
3. ✅ Нажмите "Enable" (Включить)
4. ⏳ Дождитесь включения API (может занять несколько минут)

### 3. Создание OAuth 2.0 credentials

1. 🔑 Перейдите в "APIs & Services" → "Credentials"
2. ➕ Нажмите "Create Credentials" → "OAuth 2.0 Client ID" 
3. 🔧 Если появится запрос на настройку OAuth consent screen:
   - Выберите "External" (для личного использования)
   - Заполните обязательные поля:
     - App name: "GTM MCP Server"
     - User support email: ваш email
     - Developer contact information: ваш email
   - Нажмите "Save and Continue"
   - На экране "Scopes" просто нажмите "Save and Continue"
   - На экране "Test users" добавьте свой Google аккаунт
   - Нажмите "Save and Continue"

4. 🌐 Теперь создайте OAuth Client ID:
   - Application type: "Web application"
   - Name: "GTM MCP Server"
   - В "Authorized redirect URIs" добавьте: `http://localhost:3000/callback`
   - Нажмите "Create"

5. 💾 Скопируйте Client ID и Client Secret

### 4. Настройка переменных окружения

1. 📝 Создайте файл `.env` в корне проекта
2. 📋 Добавьте ваши credentials:

```
GOOGLE_CLIENT_ID=ваш_client_id_здесь
GOOGLE_CLIENT_SECRET=ваш_client_secret_здесь
NODE_ENV=development
```

### 5. Процесс авторизации

1. 🚀 Запустите команду: `npm run auth`
2. 🌐 Автоматически откроется браузер (или скопируйте ссылку)
3. 🔐 Войдите в свой Google аккаунт
4. ✅ Разрешите доступ к Google Tag Manager
5. 🎉 После успешной авторизации можете закрыть браузер

### 6. Проверка работы

После авторизации в корне проекта появится файл `gtm-config.json` с вашими токенами доступа.

⚠️ **ВАЖНО**: Никогда не добавляйте `gtm-config.json` в git - он содержит секретные токены!

### 🔧 Решение проблем

**Ошибка "redirect_uri_mismatch":**
- Убедитесь что добавили точно `http://localhost:3000/callback` в Authorized redirect URIs

**Ошибка "access_denied":**
- Убедитесь что добавили свой email в Test users в OAuth consent screen

**Ошибка "invalid_client":**
- Проверьте правильность CLIENT_ID и CLIENT_SECRET в файле .env

**API не включен:**
- Убедитесь что Google Tag Manager API включен в вашем проекте

### 📞 Нужна помощь?

Если возникают проблемы:
1. Проверьте что все шаги выполнены точно
2. Убедитесь что используете правильный Google аккаунт
3. Попробуйте пересоздать OAuth credentials