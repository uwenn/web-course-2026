# Zen-Money Backend

## Установка
npm install

## Запуск
node server.js
Сервер работает на http://localhost:3001
База данных создается автоматически.

## Логи тестирования роутов (curl)

### 1. GET /categories
Запрос: `curl http://localhost:3001/categories`
Ответ: `[{"id":1,"name":"Еда","type":"expense"},{"id":2,"name":"Зарплата","type":"income"},{"id":3,"name":"Развлечения","type":"expense"}]`

### 2. POST /categories
Запрос: `curl -X POST http://localhost:3001/categories -H "Content-Type: application/json" -d '{"name": "Транспорт", "type": "expense"}'`
Ответ: `{"id":4,"name":"Транспорт","type":"expense"}`

### 3. POST /transactions
Запрос: `curl -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d '{"amount": 500, "category_id": 1, "date": "2026-11-20", "comment": "Обед"}'`
Ответ: `{"id":2,"amount":500,"category_id":1,"date":"2026-11-20","comment":"Обед"}`

### 4. GET /transactions (с фильтрацией)
Запрос: `curl "http://localhost:3001/transactions?type=expense&from=2026-01-01"`
Ответ: `[{"id":2,"amount":500,"category_id":1,"date":"2026-11-20","comment":"Обед","category_name":"Еда","category_type":"expense"}]`

### 5. PUT /transactions/2
Запрос: `curl -X PUT http://localhost:3001/transactions/2 -H "Content-Type: application/json" -d '{"amount": 600, "comment": "Бизнес-ланч"}'`
Ответ: `{"message":"Операция обновлена"}`

### 6. DELETE /transactions/2
Запрос: `curl -X DELETE http://localhost:3001/transactions/2`
Ответ: `{"message":"Операция удалена"}`