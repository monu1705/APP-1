
import express from 'express';
import { check, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// @route   GET api/transactions
// @desc    Get all user's transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    await db.read();
    const transactions = db.data.transactions.filter(t => t.userId === req.user.id);
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/transactions
// @desc    Add a new transaction
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('label', 'Label is required').not().isEmpty(),
      check('amount', 'Amount is required and must be a number').isNumeric(),
      check('type', 'Type is required').isIn(['INCOME', 'EXPENSE']),
      check('mode', 'Mode is required').not().isEmpty(),
      check('date', 'Date is required').isISO8601().toDate(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { label, amount, type, mode, date, bankId } = req.body;

    try {
      const newTransaction = {
        id: uuidv4(),
        userId: req.user.id,
        label,
        amount: parseFloat(amount),
        type,
        mode,
        date,
        bankId,
      };

      await db.read();
      db.data.transactions.push(newTransaction);
      await db.write();

      res.json(newTransaction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { label, amount, type, mode, date, bankId } = req.body;

  // Build transaction object
  const transactionFields = {};
  if (label) transactionFields.label = label;
  if (amount) transactionFields.amount = parseFloat(amount);
  if (type) transactionFields.type = type;
  if (mode) transactionFields.mode = mode;
  if (date) transactionFields.date = date;
  if (bankId !== undefined) transactionFields.bankId = bankId;


  try {
    await db.read();
    let transaction = db.data.transactions.find(
      (t) => t.id === req.params.id
    );

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    // Make sure user owns transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const updatedTransaction = { ...transaction, ...transactionFields };

    db.data.transactions = db.data.transactions.map(t =>
        t.id === req.params.id ? updatedTransaction : t
    );

    await db.write();
    res.json(updatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
      await db.read();
      let transaction = db.data.transactions.find(t => t.id === req.params.id);
  
      if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
  
      // Make sure user owns transaction
      if (transaction.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
  
      db.data.transactions = db.data.transactions.filter(
        (t) => t.id !== req.params.id
      );
      await db.write();

      res.json({ msg: 'Transaction removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

export default router;
