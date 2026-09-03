/**
 * Simple, robust input validation helpers
 */

function validateLoginInput(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Invalid email address format.');
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: errors.join(' ')
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

function validateUserInput(req, res, next) {
  const { name, email, password } = req.body;
  const isCreate = req.method === 'POST';
  const errors = [];

  if (isCreate || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    }
  }

  if (isCreate || email !== undefined) {
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('A valid email address is required.');
    }
  }

  if (isCreate) {
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }
  } else if (password !== undefined && password !== '') {
    if (typeof password !== 'string' || password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: errors.join(' ')
    });
  }

  if (req.body.email) req.body.email = req.body.email.trim().toLowerCase();
  if (req.body.name) req.body.name = req.body.name.trim();

  next();
}

function validateRoleInput(req, res, next) {
  const { name } = req.body;
  const isCreate = req.method === 'POST';

  if (isCreate && (!name || typeof name !== 'string' || name.trim().length < 2)) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Role name must be at least 2 characters long.'
    });
  }

  if (req.body.name) req.body.name = req.body.name.trim();
  next();
}

module.exports = {
  validateLoginInput,
  validateUserInput,
  validateRoleInput
};
