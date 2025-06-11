import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Lazy import function for database
async function getDb() {
  const { default: sql } = await import('../config/database.js');
  return sql;
}

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  // Hash password
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  async register(userData) {
    const sql = await getDb();
    const { email, password, first_name, last_name, phone, is_agent } = userData;

    // Check if user already exists
    const existingUser = await sql`
      SELECT email FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);
    const userId = uuidv4();
    const role = is_agent ? 'agent' : 'customer';

    // Create user
    const users = await sql`
      INSERT INTO users (id, email, password, role, first_name, last_name, phone, is_active, created_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${role}, ${first_name}, ${last_name}, ${phone || null}, true, NOW())
      RETURNING id, email, role, first_name, last_name, phone, is_active, created_at
    `;

    if (users.length === 0) {
      throw new Error('Registration failed');
    }

    const user = users[0];

    // Generate token
    const token = this.generateToken(userId);

    return {
      user,
      token
    };
  }

  // Login user
  async login(email, password) {
    const sql = await getDb();
    
    // Get user
    const users = await sql`
      SELECT * FROM users WHERE email = ${email} AND is_active = true
    `;

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Check password
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await sql`
      UPDATE users SET last_login = NOW() WHERE id = ${user.id}
    `;

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  // Get user profile
  async getProfile(userId) {
    const sql = await getDb();
    
    const users = await sql`
      SELECT id, email, role, first_name, last_name, phone, is_active, created_at, last_login
      FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const sql = await getDb();
    const { first_name, last_name, phone } = updateData;
    
    const users = await sql`
      UPDATE users SET 
        first_name = ${first_name || sql`first_name`},
        last_name = ${last_name || sql`last_name`},
        phone = ${phone || sql`phone`},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, role, first_name, last_name, phone, is_active, created_at, updated_at
    `;

    if (users.length === 0) {
      throw new Error('Profile update failed');
    }

    return users[0];
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const sql = await getDb();
    
    // Get user with password
    const users = await sql`
      SELECT password FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await this.comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    await sql`
      UPDATE users SET password = ${hashedNewPassword}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    return { message: 'Password updated successfully' };
  }
}

export default new AuthService(); 