const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
  }
});

router.post('/categories', (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Нужны name и type (income/expense)' });
    }
    const info = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type);
    res.status(201).json({ id: info.lastInsertRowid, name, type });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при создании категории' });
  }
});

router.get('/transactions', (req, res) => {
  try {
    const { category_id, type, from, to } = req.query;
    let query = `
      SELECT t.*, c.name as category_name, c.type as category_type 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }
    if (from) {
      query += ' AND t.date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND t.date <= ?';
      params.push(to);
    }

    query += ' ORDER BY t.date DESC, t.id DESC';
    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при получении операций' });
  }
});

router.post('/transactions', (req, res) => {
  try {
    const { amount, category_id, date, comment } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть числом больше 0' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).json({ error: 'Указанная категория не существует' });
    }

    if (!date) {
      return res.status(400).json({ error: 'Дата обязательна' });
    }

    const info = db.prepare('INSERT INTO transactions (amount, category_id, date, comment) VALUES (?, ?, ?, ?)').run(amount, category_id, date, comment || null);
    res.status(201).json({ id: info.lastInsertRowid, amount, category_id, date, comment });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при создании операции' });
  }
});

router.put('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category_id, date, comment } = req.body;

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Операция не найдена' });
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return res.status(400).json({ error: 'Сумма должна быть числом больше 0' });
    }
    if (category_id !== undefined) {
      const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
      if (!category) return res.status(400).json({ error: 'Категория не существует' });
    }

    db.prepare(`
      UPDATE transactions 
      SET amount = COALESCE(?, amount), 
          category_id = COALESCE(?, category_id), 
          date = COALESCE(?, date), 
          comment = COALESCE(?, comment)
      WHERE id = ?
    `).run(amount, category_id, date, comment, id);

    res.json({ message: 'Операция обновлена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при обновлении' });
  }
});

router.delete('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Операция не найдена' });
    }

    res.json({ message: 'Операция удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при удалении' });
  }
});

module.exports = router;