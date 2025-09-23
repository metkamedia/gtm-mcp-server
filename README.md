# Google Tag Manager MCP Server

Локальный сервер Model Context Protocol (MCP) для Google Tag Manager, позволяющий Claude взаимодействовать с вашими GTM аккаунтами, контейнерами, тегами, триггерами и переменными.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Получение Google OAuth2 credentials

1. 🌐 Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. 📁 Создайте новый проект или выберите существующий
3. 🔧 Включите Google Tag Manager API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Tag Manager API" и нажмите "Enable"
4. 🔑 Создайте OAuth 2.0 credentials:
   - Перейдите в "APIs & Services" > "Credentials"
   - Нажмите "Create Credentials" > "OAuth 2.0 Client ID"
   - Выберите "Web application"
   - Добавьте `http://localhost:3000/callback` в "Authorized redirect URIs"
   - Нажмите "Create"
5. 📥 **Скачайте JSON файл** и сохраните его как `credentials.json` в корень проекта

### 3. Авторизация

```bash
# Соберите проект
npm run build

# Запустите авторизацию
npm run auth
```

Это откроет браузер для авторизации Google. После успешной авторизации создастся файл `gtm-config.json` с токенами доступа.

### 4. Настройка Claude Desktop

Добавьте в конфигурацию Claude Desktop:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "google-tag-manager": {
      "command": "node",
      "args": ["/Users/wiefix/WORK/gtm-mcp-server/dist/index.js"],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

### 5. Перезагрузите Claude Desktop

После настройки перезагрузите Claude Desktop для подключения MCP сервера.

## 🛠️ Доступные инструменты

### 📊 gtm_account
Управление GTM аккаунтами
- `get` - получить детали аккаунта
- `list` - список всех аккаунтов  
- `update` - обновить настройки аккаунта

### 📦 gtm_container  
Управление GTM контейнерами
- `get` - получить детали контейнера
- `list` - список контейнеров в аккаунте
- `create` - создать новый контейнер
- `update` - обновить контейнер
- `delete` - удалить контейнер

### 🚀 gtm_workspace
Управление GTM workspace (рабочими пространствами)
- `get` - получить детали workspace
- `list` - список workspace в контейнере
- `create` - создать новый workspace
- `update` - обновить workspace
- `delete` - удалить workspace

### 📁 gtm_folder
Управление папками для организации элементов
- `get` - получить детали папки
- `list` - список папок в workspace
- `create` - создать новую папку
- `update` - обновить папку
- `delete` - удалить папку

### 🏷️ gtm_tag
Управление GTM тегами
- `get` - получить детали тега  
- `list` - список тегов в workspace
- `create` - создать новый тег
- `update` - обновить тег
- `delete` - удалить тег

### ⚡ gtm_trigger
Управление GTM триггерами
- `get` - получить детали триггера
- `list` - список триггеров в workspace  
- `create` - создать новый триггер
- `update` - обновить триггер
- `delete` - удалить триггер

### 🔢 gtm_variable
Управление GTM переменными
- `get` - получить детали переменной
- `list` - список переменных в workspace
- `create` - создать новую переменную
- `update` - обновить переменную  
- `delete` - удалить переменную

### 🔧 gtm_builtin_variable
Управление встроенными переменными GTM
- `list` - список встроенных переменных
- `create` - включить встроенную переменную (pageUrl, pageTitle, etc.)
- `delete` - отключить встроенную переменную

## 💬 Примеры использования

После настройки можете спросить Claude:

**Базовая навигация:**
- "Покажи все мои GTM аккаунты"
- "Список контейнеров в аккаунте 123456"
- "Покажи workspace в контейнере 456789"

**Организация:**
- "Создай папку 'Analytics Tags' для организации тегов"
- "Список всех папок в workspace"

**Работа с тегами:**
- "Создай Google Analytics тег с Measurement ID GA_MEASUREMENT_ID"
- "Покажи все теги в workspace 7"
- "Обнови тег с ID 15 новыми настройками"
- "Удали неиспользуемый тег"

**Триггеры:**
- "Создай триггер для всех просмотров страниц"
- "Создай триггер клика по кнопке с классом 'download-btn'"
- "Список всех триггеров"

**Переменные:**
- "Включи встроенную переменную Page URL"
- "Создай пользовательскую переменную для GA Measurement ID"
- "Покажи все переменные в workspace"

## 🔧 Решение проблем

### Ошибки авторизации
- Убедитесь что `credentials.json` находится в корне проекта
- Проверьте что Google Tag Manager API включен
- Перезапустите `npm run auth`

### Ошибки API
- Убедитесь что ваш Google аккаунт имеет доступ к GTM аккаунтам
- Проверьте права доступа в GTM

### Ошибки подключения
- Перезагрузите Claude Desktop после изменения конфигурации
- Проверьте правильность путей в claude_desktop_config.json

## 📁 Структура файлов

```
gtm-mcp-server/
├── credentials.json          # Ваши Google OAuth credentials (скачанный файл)
├── gtm-config.json          # Токены доступа (создается после авторизации)
├── src/                     # Исходный код
├── dist/                    # Скомпилированный код
└── README.md               # Эта инструкция
```

## ⚠️ Безопасность

- Файлы `credentials.json` и `gtm-config.json` содержат секретные данные
- Они автоматически добавлены в `.gitignore`
- Никогда не публикуйте эти файлы в общедоступных репозиториях

## 🔄 Разработка

```bash
# Режим разработки с автоперезагрузкой
npm run dev

# Сборка проекта
npm run build

# Проверка кода
npm run lint
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте что все шаги выполнены корректно
2. Убедитесь что используете Node.js v20.19.5+
3. Проверьте логи в терминале Claude Desktop