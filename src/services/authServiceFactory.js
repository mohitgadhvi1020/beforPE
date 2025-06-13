import AuthServiceFirebase from './authServiceFirebase.js';

// Mock auth service for fallback
class AuthServiceMock {
  constructor() {
    this.users = new Map();
  }

  async generateToken(userId) {
    const jwt = await import('jsonwebtoken');
    return jwt.default.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  async hashPassword(password) {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.default.hash(password, 12);
  }

  async comparePassword(password, hashedPassword) {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.default.compare(password, hashedPassword);
  }

  async register(userData) {
    const { v4: uuidv4 } = await import('uuid');
    const { email, password, first_name, last_name, phone, is_agent, send_bird_id } = userData;

    // Check if user already exists
    for (const [id, user] of this.users) {
      if (user.email === email) {
        throw new Error('User with this email already exists');
      }
    }

    const hashedPassword = await this.hashPassword(password);
    const userId = uuidv4();
    const role = is_agent ? 'agent' : 'customer';

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      role,
      first_name,
      last_name,
      phone: phone || null,
      send_bird_id: send_bird_id || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null
    };

    this.users.set(userId, user);
    const token = await this.generateToken(userId);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(email, password) {
    let foundUser = null;
    for (const [id, user] of this.users) {
      if (user.email === email && user.is_active) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.comparePassword(password, foundUser.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    foundUser.last_login = new Date().toISOString();
    this.users.set(foundUser.id, foundUser);

    const token = await this.generateToken(foundUser.id);
    const { password: _, ...userWithoutPassword } = foundUser;

    return { user: userWithoutPassword, token };
  }

  async getProfile(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId, updateData) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Profile update failed');
    }

    const { first_name, last_name, phone, send_bird_id } = updateData;
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;
    if (send_bird_id !== undefined) user.send_bird_id = send_bird_id;
    user.updated_at = new Date().toISOString();

    this.users.set(userId, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await this.comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.updated_at = new Date().toISOString();
    this.users.set(userId, user);

    return { message: 'Password updated successfully' };
  }
}

// Factory function to get the appropriate auth service
function createAuthService() {
  const dbType = process.env.DB_TYPE || 'postgres';
  
  if (dbType === 'firebase') {
    try {
      return new AuthServiceFirebase();
    } catch (error) {
      console.warn('Firebase not available, using mock service:', error.message);
      return new AuthServiceMock();
    }
  } else {
    // For postgres or any other type, use mock as fallback
    return new AuthServiceMock();
  }
}

export { createAuthService }; 