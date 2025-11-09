
import express from 'express';
import { check, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// @route   GET api/banks
// @desc    Get all user's banks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    await db.read();
    const banks = db.data.banks.filter(bank => bank.userId === req.user.id);
    res.json(banks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/banks
// @desc    Add a new bank
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    try {
      const newBank = {
        id: uuidv4(),
        userId: req.user.id,
        name,
      };

      await db.read();
      db.data.banks.push(newBank);
      await db.write();

      res.json(newBank);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/banks/:id
// @desc    Delete a bank
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.read();
    const bankIndex = db.data.banks.findIndex(
      bank => bank.id === req.params.id && bank.userId === req.user.id
    );

    if (bankIndex === -1) {
      return res.status(404).json({ msg: 'Bank not found' });
    }

    db.data.banks.splice(bankIndex, 1);
    await db.write();

    // Optional: Unset bankId for transactions using this bank
    db.data.transactions.forEach(t => {
      if (t.bankId === req.params.id && t.userId === req.user.id) {
        t.bankId = undefined;
      }
    });
    await db.write();


    res.json({ msg: 'Bank removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
