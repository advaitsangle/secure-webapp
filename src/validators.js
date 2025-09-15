// contains  input validation rules for registration and login

import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 }).withMessage('Min 8 chars')
    .matches(/[A-Z]/).withMessage('Include an uppercase letter')
    .matches(/[a-z]/).withMessage('Include a lowercase letter')
    .matches(/[0-9]/).withMessage('Include a digit')
    .matches(/[^A-Za-z0-9]/).withMessage('Include a symbol')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().notEmpty()
];
