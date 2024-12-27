import express from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

const app = express();
const port = 3000;
const SECRET_KEY = 'your_secret_key';

// Configure middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Configure swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food API',
      version: '1.0.0',
      description: 'API untuk mengelola user dan food uploads',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./**/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize SQLite database
let db: Database;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      photo TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
})();

// Helper function to authenticate users
const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.locals.userId = (decoded as any).id;
    return next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Zod schemas for validation
const registerSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const foodSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
});

const updateFoodSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').optional(),
  description: z.string().trim().min(1, 'Description is required').optional(),
});

const foodQuerySchema = z.object({
  page: z
    .string()
    .trim()
    .optional()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Page must be a positive number',
    })
    .transform((val) => Number(val)),
  limit: z
    .string()
    .trim()
    .optional()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Limit must be a positive number',
    })
    .transform((val) => Number(val)),
  search: z.string().trim().optional(),
});

// Routes
/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new account
 *               password:
 *                 type: string
 *                 description: Password for the new account
 *                 minLength: 6
 *           example:
 *             username: "johndoe"
 *             password: "securepass123"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             example:
 *               message: "User registered successfully"
 *       400:
 *         description: Invalid input or username already exists
 *         content:
 *           application/json:
 *             examples:
 *               validation_error:
 *                 summary: Validation Error
 *                 value:
 *                   errors: [
 *                     {
 *                       code: "too_small",
 *                       message: "Password must be at least 6 characters",
 *                       path: ["password"]
 *                     }
 *                   ]
 *               duplicate_username:
 *                 summary: Username Taken
 *                 value:
 *                   message: "Username already exists"
 */
app.post('/register', async (req, res) => {
  try {
    const { username, password } = await registerSchema.parseAsync({
      username: req.body.username,
      password: req.body.password,
    });
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword,
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      res
        .status(400)
        .json({ message: err.errors.map((e) => e.message).join(', ') });
      return;
    }

    res.status(400).json({ message: 'Username already exists' });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to get access token and user details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: "johndoe"
 *             password: "securepass123"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user: {
 *                 id: 1,
 *                 username: "johndoe"
 *               }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid credentials"
 */
app.post('/login', async (req, res) => {
  try {
    const { username, password } = await loginSchema.parseAsync(req.body);
    const user = await db.get(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    res.status(500).json({ message: 'An error occurred' });
  }
});

/**
 * @swagger
 * /me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               username: "johndoe"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 */
app.get('/me', authenticate, async (req, res) => {
  try {
    const userId = res.locals.userId;

    const user = await db.get('SELECT id, username FROM users WHERE id = ?', [
      userId,
    ]);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

/**
 * @swagger
 * /users/{id}/foods:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get foods by user ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for food title or description
 *     responses:
 *       200:
 *         description: List of foods
 *         content:
 *           application/json:
 *             example:
 *               page: 1
 *               limit: 10
 *               total: 2
 *               foods: [
 *                 {
 *                   id: 1,
 *                   user_id: 1,
 *                   title: "Homemade Pizza",
 *                   description: "Delicious pizza with fresh toppings",
 *                   photo: "pizza-123.jpg",
 *                   username: "johndoe"
 *                 },
 *                 {
 *                   id: 2,
 *                   user_id: 1,
 *                   title: "Chocolate Cake",
 *                   description: "Rich chocolate layer cake",
 *                   photo: "cake-456.jpg",
 *                   username: "johndoe"
 *                 }
 *               ]
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found"
 */
app.get('/users/:id/foods', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const {
      page = 1,
      limit = 10,
      search = '',
    } = await foodQuerySchema.parseAsync(req.query);

    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const offset = (pageNum - 1) * limitNum;

    const foods = await db.all(
      `
        SELECT f.*, u.username 
        FROM foods f
        JOIN users u ON f.user_id = u.id
        WHERE f.user_id = ?
          AND (f.title LIKE ? OR f.description LIKE ?)
        LIMIT ? OFFSET ?
      `,
      [userId, `%${search}%`, `%${search}%`, limitNum, offset]
    );

    const total = await db.get(
      `
        SELECT COUNT(*) as count FROM foods
        WHERE user_id = ?
          AND (title LIKE ? OR description LIKE ?)
      `,
      [userId, `%${search}%`, `%${search}%`]
    );

    res.json({
      page: pageNum,
      limit: limitNum,
      total: total.count,
      foods,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    res.status(500).json({ message: 'An error occurred' });
  }
});

/**
 * @swagger
 * /foods:
 *   post:
 *     tags:
 *       - Foods
 *     summary: Create a new food entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - photo
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *           example:
 *             title: "Homemade Pizza"
 *             description: "Delicious pizza with fresh toppings"
 *             photo: "<binary>"
 *     responses:
 *       201:
 *         description: Food created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Food uploaded successfully"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             examples:
 *               validation_error:
 *                 summary: Validation Error
 *                 value:
 *                   errors: [
 *                     {
 *                       code: "invalid_type",
 *                       message: "Title is required",
 *                       path: ["title"]
 *                     }
 *                   ]
 *               missing_photo:
 *                 summary: Missing Photo
 *                 value:
 *                   message: "Photo is required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 */
app.post('/foods', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { title, description } = await foodSchema.parseAsync(req.body);
    const userId = res.locals.userId;
    const photo = req.file?.filename;

    if (!photo) {
      res.status(400).json({ message: 'Photo is required' });
      return;
    }

    await db.run(
      'INSERT INTO foods (user_id, title, description, photo) VALUES (?, ?, ?, ?)',
      [userId, title, description, photo]
    );

    res.status(201).json({ message: 'Food uploaded successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    res.status(500).json({ message: 'An error occurred' });
  }
});

/**
 * @swagger
 * /foods/{id}:
 *   put:
 *     tags:
 *       - Foods
 *     summary: Update a food entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *           example:
 *             title: "Updated Pizza"
 *             description: "Even better pizza with extra toppings"
 *     responses:
 *       200:
 *         description: Food updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Food updated successfully"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             example:
 *               errors: [
 *                 {
 *                   code: "invalid_string",
 *                   message: "Title must be a string",
 *                   path: ["title"]
 *                 }
 *               ]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: Food not found or unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Food not found or unauthorized"
 */
app.put(
  '/foods/:id',
  authenticate,
  upload.single('photo'),
  async (req, res) => {
    try {
      const userId = res.locals.userId;
      const { id } = req.params;
      const updateData = await updateFoodSchema.parseAsync(req.body);
      const photo = req.file?.filename;

      // Check if food exists and belongs to user
      const food = await db.get(
        'SELECT * FROM foods WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!food) {
        res.status(404).json({ message: 'Food not found or unauthorized' });
        return;
      }

      // Build update query dynamically based on provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (updateData.title) {
        updates.push('title = ?');
        values.push(updateData.title);
      }

      if (updateData.description) {
        updates.push('description = ?');
        values.push(updateData.description);
      }

      if (photo) {
        updates.push('photo = ?');
        values.push(photo);
      }

      if (updates.length > 0) {
        values.push(id, userId);
        await db.run(
          `UPDATE foods SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
          values
        );
      }

      res.json({ message: 'Food updated successfully' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ errors: err.errors });
        return;
      }
      res.status(500).json({ message: 'An error occurred' });
    }
  }
);

/**
 * @swagger
 * /foods/{id}:
 *   delete:
 *     tags:
 *       - Foods
 *     summary: Delete a food entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Food deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Food deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: Food not found or unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Food not found or unauthorized"
 */
app.delete('/foods/:id', authenticate, async (req, res) => {
  try {
    const userId = res.locals.userId;
    const { id } = req.params;

    // Check if food exists and belongs to user
    const food = await db.get(
      'SELECT * FROM foods WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!food) {
      res.status(404).json({ message: 'Food not found or unauthorized' });
      return;
    }

    await db.run('DELETE FROM foods WHERE id = ? AND user_id = ?', [
      id,
      userId,
    ]);

    res.json({ message: 'Food deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API Docs running on http://localhost:${port}/api-docs`);
});
