import express from "express";
import bodyParser from "body-parser";
import pg from "pg"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Setup PostgreSQL Client - supporting environment variables (for deployment) with local fallback
const connectionString = process.env.DATABASE_URL;
const db = new pg.Client(
  connectionString
    ? {
        connectionString,
        ssl: {
          rejectUnauthorized: false // Required for platforms like Render/Railway/Heroku
        }
      }
    : {
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "akashjain042006",
        host: process.env.PGHOST || "localhost",
        database: process.env.PGDATABASE || "world",
        port: parseInt(process.env.PGPORT || "5432")
      }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let connected = false;

async function ensureConnection() {
  if (!connected) {
    try {
      await db.connect();
      connected = true;
    } catch (err) {
      console.error("Database connection error:", err);
    }
  }
}

let currentUserId = 1;
let users = [];

async function checkVisited() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1;",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code.trim());
  });
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  
  // If there are no users, create a default user
  if (users.length === 0) {
    const defaultUser = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      ["Traveler", "teal"]
    );
    users = [defaultUser.rows[0]];
    currentUserId = defaultUser.rows[0].id;
    return defaultUser.rows[0];
  }
  
  // If active user is not found, fallback to first user
  let activeUser = users.find((user) => user.id == currentUserId);
  if (!activeUser) {
    currentUserId = users[0].id;
    activeUser = users[0];
  }
  return activeUser;
}

// Get list of all users and active user info
app.get("/api/users", async (req, res) => {
  try {
    const currentUser = await getCurrentUser();
    res.json({
      users: users,
      currentUserId: currentUserId,
      currentUser: currentUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Get list of all available countries in the database
app.get("/api/countries", async (req, res) => {
  try {
    const result = await db.query("SELECT country_name FROM countries ORDER BY country_name ASC;");
    res.json(result.rows.map(r => r.country_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch countries list." });
  }
});

// Get visited countries data for current active user
app.get("/api/visited", async (req, res) => {
  try {
    const countries = await checkVisited();
    const currentUser = await getCurrentUser();
    res.json({
      countries: countries,
      total: countries.length,
      currentUser: currentUser,
      color: currentUser.color
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch visited countries list." });
  }
});

// Add a country to visited list
app.post("/api/visited", async (req, res) => {
  const input = req.body.country ? req.body.country.trim() : "";
  const currentUser = await getCurrentUser();

  if (!input) {
    return res.status(400).json({ error: "Please enter a country name." });
  }

  try {
    // Perform case-insensitive matching on country name
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) = LOWER($1)",
      [input]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "PLEASE enter a valid name of the country" });
    }

    const countryCode = result.rows[0].country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );

      const countries = await checkVisited();
      res.json({
        countries: countries,
        total: countries.length
      });
    } catch (err) {
      if (err.code === "23505") { // Unique constraint violation
        res.status(400).json({ error: `You have already visited ${input}!` });
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add country." });
  }
});

// New user
app.post("/api/users", async (req, res) => {
  const input = req.body.name.trim();
  const color = req.body.color.trim();

  if (!input) {
    return res.status(400).json({ error: "User name cannot be empty." });
  }
  if (input.length > 15) {
    return res.status(400).json({ error: "User name too long." });
  }

  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      [input, color]
    );
    const newUser = result.rows[0];
    users.push(newUser);
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user." });
  }
});

// Update current user
app.post("/api/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  currentUserId = userId;
  const currentUser = await getCurrentUser();
  res.json({
    currentUserId: currentUserId,
    currentUser: currentUser
  });
});

export default async (req, res) => {
  await ensureConnection();
  app(req, res);
};
