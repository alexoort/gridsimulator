import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { action, username, email, password } = await request.json();

    if (action === 'register') {
      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users 
        WHERE username = ${username} OR email = ${email}
      `;

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const result = await sql`
        INSERT INTO users (username, email, password_hash)
        VALUES (${username}, ${email}, ${hashedPassword})
        RETURNING id, username, email
      `;

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return NextResponse.json({ user, token });
    }

    if (action === 'login') {
      // Find user
      const result = await sql`
        SELECT id, username, email, password_hash 
        FROM users 
        WHERE username = ${username} OR email = ${username}
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Update last login
      await sql`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = ${user.id}
      `;

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 