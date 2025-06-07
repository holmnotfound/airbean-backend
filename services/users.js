import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.js';
import bcrypt from 'bcrypt'

export async function checkIfUserExists(userId) {
  try {
    const userExists = await User.findOne({ userId });
    return !!userExists;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

export async function checkIfUsernameExists(username) {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export async function registerUser(username, password, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const shortUuid = uuidv4().split('-')[0];
    const userId = `${shortUuid}`;

    const newUser = new User({
      username,
      password: hashedPassword, 
      userId,
      role
    });

    await newUser.save();

    return newUser;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}
