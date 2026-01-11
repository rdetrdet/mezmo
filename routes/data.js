import express from 'express';
import authenticateToken from '../middleware/auth.js';
import { query } from '../config/database.js';

const router = express.Router();

// Get all data items for user (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, content, created_at, updated_at FROM data WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

// Get single data item (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, content, created_at, updated_at FROM data WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Get data item error:', error);
    res.status(500).json({ error: 'Failed to get data item' });
  }
});

// Create new data item (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await query(
      'INSERT INTO data (user_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, title, content, created_at, updated_at',
      [req.user.userId, title, content || null]
    );

    res.status(201).json({
      message: 'Data created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create data error:', error);
    res.status(500).json({ error: 'Failed to create data' });
  }
});

// Update data item (protected route)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const result = await query(
      'UPDATE data SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id, title, content, created_at, updated_at',
      [title, content, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({
      message: 'Data updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update data error:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Delete data item (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM data WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Delete data error:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

export default router;
