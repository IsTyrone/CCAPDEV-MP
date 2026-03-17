# 2nd Silicon Setup Instructions

This project has been upgraded from client-side `localStorage` to a fully functional modern backend using **Node.js**, **Express.js**, and **MongoDB**.

Follow these instructions to set up the runtime environment and launch the application.

## Prerequisites

1. **Node.js**: The Javascript runtime for the backend server. Download and install Node.js (v18 or higher recommended) from [nodejs.org](https://nodejs.org/).
2. **MongoDB**: The database that stores users, session data, listings, and comments.

---

## Step 1: Install and Run MongoDB

You must have MongoDB running before you start the Node.js server. The server expects MongoDB to be available at `mongodb://localhost:27017/pctracker` by default.

### Option A: macOS (via Homebrew)
If you have Homebrew installed, you can easily install and run MongoDB Community Edition:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### Option B: Windows
1. Download the MongoDB Community Server MSI installer from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Run the installer and choose "Complete" setup.
3. Ensure "Install MongoDB as a Service" is checked (this will start MongoDB automatically in the background).
4. Finish the installation.

### Option C: MongoDB Atlas (Free Cloud Database)
If you do not want to run MongoDB locally, you can use a free cloud cluster.
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Free Cluster (M0).
3. Whitelist your IP address and create a database user (e.g., `dbUser`).
4. Get your connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/pctracker`).
5. Open the `.env` file in the project directory and replace the `MONGODB_URI` value with your connection string.

---

## Step 2: Install Node.js Dependencies

Open your terminal or command prompt, navigate to the project directory, and install the required npm packages:

```bash
cd CCAPDEV-MP  # Make sure you are in the project folder
npm install
```

This will read the `package.json` file and install dependencies like `express`, `mongoose`, `bcrypt`, and `express-session` into a `node_modules` folder.

---

## Step 3: Start the Server

Once MongoDB is running and your dependencies are installed, you can start the application backend:

```bash
npm start
```
*Alternatively, you can run `node server.js` directly.*

You should see the following output in your terminal:
```text
Connected to MongoDB
Admin account seeded: admin@pctracker.com / admin123
Server running on http://localhost:3000
```

---

## Step 4: Access the Application

Open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

### Admin Access
The server automatically creates an admin account so you can manage listing approvals.
- **Login URL**: [http://localhost:3000/pages/login.html](http://localhost:3000/pages/login.html)
- **Email**: `admin@pctracker.com`
- **Password**: `admin123`
