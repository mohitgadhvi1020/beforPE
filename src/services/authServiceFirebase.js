import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../config/firebase.js';

class AuthServiceFirebase {
  constructor() {
    this.collection = 'users';
  }

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
    try {
      const db = getDb();
      const { email, password, first_name, last_name, phone, is_agent, send_bird_id, send_bird_accessId } = userData;

      // Check if user already exists
      const existingUserQuery = await db.collection(this.collection)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!existingUserQuery.empty) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);
      const userId = uuidv4();
      const role = is_agent ? 'agent' : 'customer';

      // Create user document
      const user = {
        id: userId,
        email,
        password: hashedPassword,
        role,
        first_name,
        last_name,
        phone: phone || null,
        send_bird_id: send_bird_id || null,
        send_bird_accessId: send_bird_accessId || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: null
      };

      await db.collection(this.collection).doc(userId).set(user);

      // Generate token
      const token = this.generateToken(userId);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async login(email, password) {
    try {
      const db = getDb();
      
      // Get user by email
      const userQuery = await db.collection(this.collection)
        .where('email', '==', email)
        .where('is_active', '==', true)
        .limit(1)
        .get();

      if (userQuery.empty) {
        throw new Error('Invalid credentials');
      }

      const userDoc = userQuery.docs[0];
      const user = userDoc.data();

      // Check password
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await db.collection(this.collection).doc(user.id).update({
        last_login: new Date()
      });

      // Generate token
      const token = this.generateToken(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const db = getDb();
      const doc = await db.collection(this.collection).doc(userId).get();
      
      if (!doc.exists) {
        throw new Error('User not found');
      }

      const user = doc.data();
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const db = getDb();
      const { first_name, last_name, phone, send_bird_id, send_bird_accessId } = updateData;
      
      const updateFields = {
        updated_at: new Date()
      };

      if (first_name !== undefined) updateFields.first_name = first_name;
      if (last_name !== undefined) updateFields.last_name = last_name;
      if (phone !== undefined) updateFields.phone = phone;
      if (send_bird_id !== undefined) updateFields.send_bird_id = send_bird_id;
      if (send_bird_accessId !== undefined) updateFields.send_bird_accessId = send_bird_accessId;

      await db.collection(this.collection).doc(userId).update(updateFields);

      // Get updated user
      const updatedDoc = await db.collection(this.collection).doc(userId).get();
      const updatedUser = updatedDoc.data();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const db = getDb();
      
      // Get user with password
      const doc = await db.collection(this.collection).doc(userId).get();
      
      if (!doc.exists) {
        throw new Error('User not found');
      }

      const user = doc.data();

      // Verify current password
      const isValidPassword = await this.comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await db.collection(this.collection).doc(userId).update({
        password: hashedNewPassword,
        updated_at: new Date()
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
}

export default AuthServiceFirebase; 