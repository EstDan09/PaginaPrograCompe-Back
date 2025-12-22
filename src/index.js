const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const User = require("./models/User");

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminUser = User.create({
        username: 'admin',
        password_hash: process.env.ADMIN_PASSWORD,
        email: 'MoyaBabushkaKuritTrubku',
        role: 'admin'
      });
      console.log('Default admin user created');
    } else {
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

/**
 * Rate Limiter
 * Limits each IP to 100 requests per 15 minutes and returns a message on too many requests.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CORS Configuration
 * Allows origins specified in CORS_ORIGIN env, with GET, POST, PUT, DELETE, OPTIONS methods,
 * specific headers, and credentials support.
 */
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

/**
 * Body Parsers
 * - JSON parser with 10MB limit
 * - URL-encoded parser with extended syntax and 10MB limit
 */
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Cookie Parser
 * Parses cookies using the provided secret key.
 */
app.use(cookieParser("cookieParser"));

/**
 * Session Middleware
 * Manages user sessions with secure, httpOnly cookies and environment-based settings.
 */
app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo habilitar secure en producción
      sameSite: 'Strict',
    },
  })
);

/**
 * Database Connection and App Initialization
 * Connects to MongoDB, enables compression, sets cache headers, and serves static files.
 */

connectDB().then(async () => {
  // Seed initial data if needed
  await seedDatabase();

  /**
   * Compression Middleware
   * Applies gzip compression to all responses to improve performance.
   */
  app.use(compression());

  /**
   * Cache-Control Header
   * Sets `public, no-store` to prevent storing dynamic responses in caches.
   */
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "public, no-store");
    next();
  });

  /**
   * Static File Serving
   * Serves files from /public with a 1-day cache and disables ETag.
   */
  app.use(
    express.static(path.join(__dirname, "/public"), {
      maxAge: "1d", // Cache por 1 día
      etag: false,
    })
  );

  /**
   * Trust Proxy
   * Enables Express to trust the first proxy in front of it.
   */
  app.set('trust proxy', 1);

  /**
   * View Engine Setup
   * Configures EJS as the template engine for rendering views.
   */
  app.set("view engine", "ejs");

  /**
   * Custom Response Wrapper
   * Overrides res.send to standardize JSON responses into `{ data, message, status }` format.
   */
  app.use((req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      if (
        typeof body === "object" &&
        !body.data &&
        !body.message &&
        !body.status
      ) {
        body = {
          data: body || null,
          message: res.message || "Success",
          status: res.statusCode || 200,
        };
      }
      originalSend.call(this, body);
    };

    next();
  });

  /**
   * Route Registration
   * Mounts route modules for users, electorals, departments, votes, uservotes, results, and S3 operations.
   */
  //require("./routes/reportsTemaplate")(app);

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  require("./routes/auth.js")(app);
  require("./routes/user.js")(app);
  require("./routes/group.js")(app);


  /**
   * Error-Handling Middleware
   * Catches validation errors and general errors, returning structured JSON error responses.
   */
  app.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
      return res.status(400).send({
        data: null,
        message: "Invalid request data",
        status: 400,
      });
    }

    // Error general del servidor
    console.error(err.stack);
    res.status(err.status || 500).send({
      data: null,
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    });
  });

  /**
   * Server Startup
   * Begins listening on the configured port and logs the listening URL.
   */
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1); // Salir del proceso si la conexión a la base de datos falla
});

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  console.log(`From IP: ${ip}`);

  next();
});


/**
 * Listening Event Handler
 * Logs server address and port when the `listening` event is emitted.
 */
app.on("listening", function () {
  console.log(
    "Express server started on port %s at %s",
    app.address().port,
    app.address().address
  );
});
