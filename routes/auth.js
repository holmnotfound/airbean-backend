import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validateAuthBody from '../middlewares/validateAuthBody.js';
import { checkIfUsernameExists, registerUser } from '../services/users.js';

const router = Router();

// LOGIN
router.post('/login', validateAuthBody, async (req, res, next) => {
  const { username, password } = req.body;
  const user = await checkIfUsernameExists(username);

  if (!user) {
    return next({
      status: 401,
      message: 'Wrong username or password',
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return next({
      status: 401,
      message: 'Wrong username or password',
    });
  }

  const token = jwt.sign(
    {
      userId: user.userId,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    success: true,
    message: 'Login Successful!',
    token,
    user: {
      userId: user.userId,
      username: user.username,
      role: user.role,
    },
  });
});

// REGISTER
router.post('/register', validateAuthBody, async (req, res, next) => {
  const { username, password, role } = req.body;
  const isUsernameTaken = await checkIfUsernameExists(username);

  if (isUsernameTaken) {
    return next({
      status: 409,
      message: 'Username already taken',
    });
  }

  const newUser = await registerUser(username, password, role);

  if (newUser) {
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        username: newUser.username,
        userId: newUser.userId,
        role: newUser.role
      },
    });
  } else {
    next({
      status: 500,
      message: 'Could not register new user',
    });
  }
});


// LOGOUT
router.get('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove token on client side.'
  });
});

export default router;
