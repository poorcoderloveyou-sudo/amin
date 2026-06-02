/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhpFile {
  path: string;
  description: string;
  code: string;
}

export const PHP_TEMPLATES: PhpFile[] = [
  {
    path: "database.sql",
    description: "MySQL Schema with foreign keys, indexes, and image status fixes.",
    code: `-- Database Creation Script for AutoCare Platform
CREATE DATABASE IF NOT EXISTS autocare_db;
USE autocare_db;

-- 1. Users Table (Customers, Shop Owners, Administrators)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('customer', 'shop_owner', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Shops Table (Automotive Detailing, Wash, and Repair Hubs)
CREATE TABLE IF NOT EXISTS shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'pending',
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shop_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  vehicle_type ENUM('sedan', 'suv', 'truck', 'motorcycle', 'van') NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  plate_number VARCHAR(15) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Services Table (Offered by specific Shops)
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INT NOT NULL, -- Duration in minutes
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bookings Table (Needs 3 Fixes from review sheet)
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_id VARCHAR(20) NOT NULL UNIQUE, -- ADDED display_id (e.g. #AC-9917)
  customer_id INT NOT NULL,
  shop_id INT NOT NULL,
  service_id INT NOT NULL,
  vehicle_id INT NOT NULL, -- ADDED vehicle_id FK block, dropping redundant brand/type cols
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('pending', 'accepted', 'dispatched', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_booking_status (status),
  INDEX idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'cash_on_delivery', 'credit_card', 'e-wallet'
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  shop_id INT NOT NULL,
  booking_id INT NOT NULL,
  rating TINYINT UNSIGNED CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL, -- NULL indicates global broadcast notifications
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_notif (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERTS DEMO SEED DATA
INSERT INTO users (id, name, email, password, phone, role, status) VALUES
(1, 'Admin Staff', 'poorcoderloveyou@gmail.com', '$2y$10$wE9mHlU.N0b37HiaM.fO.O3c.bK5mP.9SgJzJsnk8bN8h0Rbyq01K', '08123456789', 'admin', 'active'),
(2, 'Michael Knight', 'michael@shopowner.com', '$2y$10$wE9mHlU.N0b37HiaM.fO.O3c.bK5mP.9SgJzJsnk8bN8h0Rbyq01K', '08221144558', 'shop_owner', 'active'),
(3, 'Sarah Jenkins', 'sarah@shopowner.com', '$2y$10$wE9mHlU.N0b37HiaM.fO.O3c.bK5mP.9SgJzJsnk8bN8h0Rbyq01K', '08119933445', 'shop_owner', 'active'),
(4, 'John Doe', 'john.doe@customer.com', '$2y$10$wE9mHlU.N0b37HiaM.fO.O3c.bK5mP.9SgJzJsnk8bN8h0Rbyq01K', '08998877665', 'customer', 'active');
`
  },
  {
    path: "includes/db_connect.php",
    description: "PDO database configuration for secure MySQL connection pool.",
    code: `<?php
// db_connect.php - Core PDO database context
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'secure_password_here');
define('DB_NAME', 'autocare_db');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>`
  },
  {
    path: "includes/admin_auth.php",
    description: "Session security gate guarding pages from unauthorized clients.",
    code: `<?php
// admin_auth.php - Session validation for admin routes
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in and has admin role
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: /admin/login.php?error=unauthorized");
    exit();
}

// Session timeout protection (30 minutes)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
    session_unset();
    session_destroy();
    header("Location: /admin/login.php?error=timeout");
    exit();
}
$_SESSION['last_activity'] = time();
?>`
  },
  {
    path: "includes/admin_header.php",
    description: "Global admin header featuring responsive dashboard navigation & styles.",
    code: `<?php
require_once __DIR__ . '/admin_auth.php';
?>
<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $page_title ?? 'AutoCare Admin Center'; ?></title>
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        slate: {
                            950: '#030712',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="h-full flex text-slate-100 font-sans">
    
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
            <div class="h-16 flex items-center px-6 border-b border-slate-800">
                <span class="text-emerald-400 font-bold tracking-wider text-lg">AUTOCARE ENGINE</span>
            </div>
            <nav class="p-4 space-y-1">
                <a href="/admin/dashboard.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Dashboard Overview
                </a>
                <a href="/admin/users.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Manage Users
                </a>
                <a href="/admin/shops.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Affiliated Shops
                </a>
                <a href="/admin/bookings.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Live Bookings
                </a>
                <a href="/admin/services.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Shop Services
                </a>
                <a href="/admin/payments.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Payment Logs
                </a>
                <a href="/admin/reviews.php" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors hover:bg-slate-800 text-slate-300">
                    Client Reviews
                </a>
            </nav>
        </div>
        <div class="p-4 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-400">User: Admin</span>
            <a href="/admin/logout.php" class="text-xs text-red-400 hover:underline">Logout</a>
        </div>
    </aside>

    <!-- Main Container -->
    <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header class="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
            <div class="flex items-center gap-4">
                <h1 class="text-lg font-semibold tracking-tight"><?php echo $page_title ?? 'Admin Console'; ?></h1>
            </div>
            <div class="flex items-center gap-3">
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="text-xs text-emerald-400 font-mono">SYSTEM ACTIVE</span>
            </div>
        </header>
        <main class="p-6 md:p-8 flex-1">`
  },
  {
    path: "includes/admin_footer.php",
    description: "Global admin footer closing tags, layout, and copyrights.",
    code: `        </main>
        <footer class="h-14 border-t border-slate-800 flex items-center justify-between px-8 bg-slate-900 text-xs text-slate-500">
            <p>&copy; <?php echo date('Y'); ?> AutoCare Systems admin controller.</p>
            <p>Crafted for Admin Control & Operation.</p>
        </footer>
    </div>
</body>
</html>`
  },
  {
    path: "admin/login.php",
    description: "Authentication system verifying login hashes against administrators.",
    code: `<?php
session_start();
require_once '../includes/db_connect.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if (!empty($email) && !empty($password)) {
        // Query database to authenticate
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email AND status = 'active' LIMIT 1");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if ($user['role'] === 'admin') {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['name'] = $user['name'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['last_activity'] = time();
                
                header("Location: /admin/dashboard.php");
                exit();
            } else {
                $error = 'Access restricted: Administrator eyes only.';
            }
        } else {
            $error = 'Incorrect email or password.';
        }
    } else {
        $error = 'Please fill out all credentials.';
    }
}
?>
<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950">
<head>
    <meta charset="UTF-8">
    <title>AutoCare - Admin Control Entry</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="h-full flex items-center justify-center font-sans text-slate-100 p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 class="text-2xl font-bold tracking-tight text-center text-emerald-400 mb-2">AUTOCARE SYSTEMS</h2>
        <p class="text-xs text-center text-slate-400 mb-8 font-mono">ADMINISTRATOR CONTROL GATEWAY</p>

        <?php if ($error): ?>
            <div class="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-xs text-red-300 mb-6">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <form action="login.php" method="POST" class="space-y-4">
            <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Email Coordinates</label>
                <input type="email" name="email" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100">
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Secured Secret Token</label>
                <input type="password" name="password" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100">
            </div>
            <button type="submit" class="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold text-sm py-2.5 rounded-lg mt-6 transition-all shadow-lg active:scale-[0.98]">
                Authenticate Dashboard Access
            </button>
        </form>
    </div>
</body>
</html>`
  },
  {
    path: "admin/dashboard.php",
    description: "Main central executive views showing metrics with tables displaying state.",
    code: `<?php
$page_title = "Executive Overview";
require_once '../includes/db_connect.php';
require_once '../includes/admin_header.php';

// Fetch executive statistics from variables
$stmt_users = $pdo->query("SELECT COUNT(*) FROM users");
$total_users = $stmt_users->fetchColumn();

$stmt_shops = $pdo->query("SELECT COUNT(*) FROM shops");
$total_shops = $stmt_shops->fetchColumn();

$stmt_bookings = $pdo->query("SELECT COUNT(*) FROM bookings");
$total_bookings = $stmt_bookings->fetchColumn();

$stmt_revenue = $pdo->query("SELECT SUM(amount) FROM payments WHERE payment_status = 'paid'");
$total_revenue = $stmt_revenue->fetchColumn() ?? 0.00;

// Fetch Recent Bookings
$stmt_recent = $pdo->query("
    SELECT b.*, u.name AS customer, s.shop_name 
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN shops s ON b.shop_id = s.id
    ORDER BY b.id DESC LIMIT 5
");
$recent_bookings = $stmt_recent->fetchAll();

// Fetch Pending Appr Shop Requests
$stmt_pending_shops = $pdo->query("SELECT * FROM shops WHERE status = 'pending' ORDER BY id DESC LIMIT 4");
$pending_shops = $stmt_pending_shops->fetchAll();
?>

<!-- Statistics Panel -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <span class="text-xs font-mono text-slate-400">STATIONS LOGGED</span>
        <h3 class="text-2xl font-bold tracking-tight text-emerald-400 mt-1"><?php echo $total_shops; ?></h3>
        <p class="text-[10px] text-slate-500 mt-2">Active service shops registered</p>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <span class="text-xs font-mono text-slate-400">CUSTOMERS / OWNERS</span>
        <h3 class="text-2xl font-bold tracking-tight text-emerald-400 mt-1"><?php echo $total_users; ?></h3>
        <p class="text-[10px] text-slate-500 mt-2">Accounts stored inside system</p>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <span class="text-xs font-mono text-slate-400">BOOKING DEMANDS</span>
        <h3 class="text-2xl font-bold tracking-tight text-emerald-400 mt-1"><?php echo $total_bookings; ?></h3>
        <p class="text-[10px] text-slate-500 mt-2">All-time booking transactions</p>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <span class="text-xs font-mono text-slate-400">COLLECTED REVENUE</span>
        <h3 class="text-2xl font-bold tracking-tight text-emerald-400 mt-1">$<?php echo number_format($total_revenue, 2); ?></h3>
        <p class="text-[10px] text-slate-500 mt-2">Total approved cash flow logs</p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Recent Bookings Table -->
    <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-sm font-semibold tracking-tight text-slate-200 mb-4">Latest Operational Bookings</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="text-slate-550 border-b border-slate-800/80">
                        <th class="pb-3 text-slate-400">Order Ref</th>
                        <th class="pb-3 text-slate-400">Customer</th>
                        <th class="pb-3 text-slate-400">Station</th>
                        <th class="pb-3 text-slate-400">Schedule</th>
                        <th class="pb-3 text-slate-400">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80">
                    <?php if (empty($recent_bookings)): ?>
                        <tr><td colspan="5" class="py-4 text-slate-500 text-center">No recent records</td></tr>
                    <?php else: ?>
                        <?php foreach($recent_bookings as $b): ?>
                        <tr class="hover:bg-slate-800/30">
                            <td class="py-3 font-mono font-medium text-slate-300"><?php echo htmlspecialchars($b['display_id']); ?></td>
                            <td class="py-3 text-slate-300"><?php echo htmlspecialchars($b['customer']); ?></td>
                            <td class="py-3 text-slate-400"><?php echo htmlspecialchars($b['shop_name']); ?></td>
                            <td class="py-3 text-slate-400"><?php echo $b['booking_date']; ?></td>
                            <td class="py-3">
                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-500/20">
                                    <?php echo ucfirst($b['status']); ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Approvals Waiting List -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-sm font-semibold tracking-tight text-slate-200 mb-4">Pending Shops Registration</h2>
        <div class="space-y-4">
            <?php if (empty($pending_shops)): ?>
                <p class="text-xs text-slate-500 text-center py-8">All clean. No applications pending.</p>
            <?php else: ?>
                <?php foreach($pending_shops as $p): ?>
                <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
                    <div class="flex justify-between items-start">
                        <p class="text-xs font-semibold text-slate-200"><?php echo htmlspecialchars($p['shop_name']); ?></p>
                        <span class="text-[9px] font-mono bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">Verification Needed</span>
                    </div>
                    <p class="text-[10px] text-slate-400 truncate"><?php echo htmlspecialchars($p['address']); ?></p>
                    <div class="flex gap-2 justify-end mt-1">
                        <a href="/admin/shops.php?action=approve&id=<?php echo $p['id']; ?>" class="px-2 py-1 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded hover:bg-emerald-400">
                            Approve
                        </a>
                        <a href="/admin/shops.php?action=suspend&id=<?php echo $p['id']; ?>" class="px-2 py-1 bg-slate-850 text-slate-300 text-[10px] rounded hover:bg-slate-800 border border-slate-700">
                            Reject
                        </a>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once '../includes/admin_footer.php'; ?>`
  },
  {
    path: "admin/users.php",
    description: "Database manipulation UI facilitating listing and changing user access rights.",
    code: `<?php
$page_title = "Account Administration";
require_once '../includes/db_connect.php';
require_once '../includes/admin_header.php';

// Handle State Changes
if (isset($_GET['action']) && isset($_GET['id'])) {
    $action = $_GET['action'];
    $id = intval($_GET['id']);
    
    if ($action === 'suspend') {
        $stmt = $pdo->prepare("UPDATE users SET status = 'suspended' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    } elseif ($action === 'activate') {
        $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    } elseif ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
    header("Location: users.php");
    exit();
}

// Fetch all registered operators and customers
$users = $pdo->query("SELECT * FROM users ORDER BY id DESC")->fetchAll();
?>

<div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <div class="p-6 border-b border-slate-800/60 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-200">Registered Accounts Master Core</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th class="p-4">ID</th>
                    <th class="p-4">Client Name</th>
                    <th class="p-4">Email Coordinates</th>
                    <th class="p-4">Phone Number</th>
                    <th class="p-4">Permission Role</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Joined At</th>
                    <th class="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
                <?php foreach($users as $u): ?>
                <tr class="hover:bg-slate-800/20 <?php echo $u['status'] === 'suspended' ? 'opacity-65' : ''; ?>">
                    <td class="p-4 font-mono text-slate-400"><?php echo $u['id']; ?></td>
                    <td class="p-4 font-medium text-slate-100"><?php echo htmlspecialchars($u['name']); ?></td>
                    <td class="p-4 text-slate-300"><?php echo htmlspecialchars($u['email']); ?></td>
                    <td class="p-4 text-slate-400"><?php echo htmlspecialchars($u['phone']); ?></td>
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono <?php echo $u['role'] === 'admin' ? 'bg-red-950 text-red-400 border border-red-500/10' : ($u['role'] === 'shop_owner' ? 'bg-amber-950 text-amber-400 border border-amber-500/10' : 'bg-slate-800 text-slate-300'); ?>">
                            <?php echo strtoupper($u['role']); ?>
                        </span>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[10px] <?php echo $u['status'] === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/10' : 'bg-rose-950 text-rose-400 border border-rose-500/10'; ?>">
                            <?php echo strtoupper($u['status']); ?>
                        </span>
                    </td>
                    <td class="p-4 text-slate-500 font-mono"><?php echo $u['created_at']; ?></td>
                    <td class="p-4 text-right space-x-2">
                        <?php if ($u['status'] === 'active'): ?>
                            <a href="users.php?action=suspend&id=<?php echo $u['id']; ?>" class="text-[10px] px-2 py-1 bg-amber-900/30 text-amber-300 border border-amber-500/20 rounded hover:bg-amber-800/40">Suspend</a>
                        <?php else: ?>
                            <a href="users.php?action=activate&id=<?php echo $u['id']; ?>" class="text-[10px] px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-900/40">Activate</a>
                        <?php endif; ?>
                        
                        <?php if ($u['role'] !== 'admin'): ?>
                            <a href="users.php?action=delete&id=<?php echo $u['id']; ?>" onclick="return confirm('Confirm deletion?');" class="text-[10px] px-2 py-1 bg-rose-950/40 text-rose-400 border border-rose-500/10 rounded hover:bg-rose-900/50">Delete</a>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once '../includes/admin_footer.php'; ?>`
  },
  {
    path: "admin/shops.php",
    description: "Approval queue, search layout, and active state switch for registered service garages.",
    code: `<?php
$page_title = "Affiliated Service Hubs";
require_once '../includes/db_connect.php';
require_once '../includes/admin_header.php';

// Handle Action parameters
if (isset($_GET['action']) && isset($_GET['id'])) {
    $action = $_GET['action'];
    $id = intval($_GET['id']);
    
    if ($action === 'approve') {
        $stmt = $pdo->prepare("UPDATE shops SET status = 'active' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    } elseif ($action === 'suspend') {
        $stmt = $pdo->prepare("UPDATE shops SET status = 'suspended' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    } elseif ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM shops WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
    header("Location: shops.php");
    exit();
}

$shops = $pdo->query("
    SELECT s.*, u.name as owner_name 
    FROM shops s
    LEFT JOIN users u ON s.owner_id = u.id 
    ORDER BY s.id DESC
")->fetchAll();
?>

<div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
        <h2 class="text-sm font-semibold text-slate-200 animate-pulse">Affiliated Service Shop Hub</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th class="p-4">Station ID</th>
                    <th class="p-4">Shop Ident</th>
                    <th class="p-4">Owner Ref</th>
                    <th class="p-4">Address Coordinate</th>
                    <th class="p-4">Phone Contacts</th>
                    <th class="p-4">Score Stats</th>
                    <th class="p-4">Verification Status</th>
                    <th class="p-4 text-right">Actions Manager</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
                <?php foreach($shops as $s): ?>
                <tr class="hover:bg-slate-800/20">
                    <td class="p-4 font-mono text-slate-500">ID-<?php echo $s['id']; ?></td>
                    <td class="p-4 font-semibold text-emerald-400"><?php echo htmlspecialchars($s['shop_name']); ?></td>
                    <td class="p-4 text-slate-300 font-medium"><?php echo htmlspecialchars($s['owner_name'] ?? 'N/A'); ?></td>
                    <td class="p-4 text-slate-400 max-w-[200px] truncate"><?php echo htmlspecialchars($s['address']); ?></td>
                    <td class="p-4 text-slate-400 font-mono"><?php echo htmlspecialchars($s['phone']); ?></td>
                    <td class="p-4">
                        <span class="text-amber-400 font-bold">&#9733; <?php echo number_format($s['avg_rating'], 1); ?></span>
                        <span class="text-[9px] text-slate-500">(<?php echo $s['total_reviews']; ?> reviews)</span>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold <?php 
                            echo $s['status'] === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 
                                ($s['status'] === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-500/25 animate-pulse' : 'bg-rose-950 text-rose-300 border border-rose-500/10'); 
                        ?>">
                            <?php echo strtoupper($s['status']); ?>
                        </span>
                    </td>
                    <td class="p-4 text-right space-x-1">
                        <?php if ($s['status'] === 'pending'): ?>
                            <a href="shops.php?action=approve&id=<?php echo $s['id']; ?>" class="text-[10px] px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold">Approve</a>
                        <?php endif; ?>
                        
                        <?php if ($s['status'] !== 'suspended'): ?>
                            <a href="shops.php?action=suspend&id=<?php echo $s['id']; ?>" class="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700/80 rounded hover:bg-slate-750">Suspend</a>
                        <?php else: ?>
                            <a href="shops.php?action=approve&id=<?php echo $s['id']; ?>" class="text-[10px] px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-920">Activate</a>
                        <?php endif; ?>

                        <a href="shops.php?action=delete&id=<?php echo $s['id']; ?>" onclick="return confirm('Wipe out this station coordinates?');" class="text-[10px] px-2 py-1 bg-rose-950/40 text-rose-400 border border-rose-500/10 rounded hover:bg-rose-900/50">Wipe</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once '../includes/admin_footer.php'; ?>`
  },
  {
    path: "admin/bookings.php",
    description: "Comprehensive scheduler grid displaying bookings with state, updating actions, and table metrics.",
    code: `<?php
$page_title = "Operational Bookings Terminal";
require_once '../includes/db_connect.php';
require_once '../includes/admin_header.php';

// Change booking state handler
if (isset($_POST['update_status'])) {
    $booking_id = intval($_POST['booking_id']);
    $new_status = $_POST['status'];
    
    $stmt = $pdo->prepare("UPDATE bookings SET status = :status, status_updated_at = CURRENT_TIMESTAMP WHERE id = :id");
    $stmt->execute(['status' => $new_status, 'id' => $booking_id]);
    
    // Inject notification for customer regarding booking state updates
    $fetch_cust = $pdo->prepare("SELECT customer_id, display_id FROM bookings WHERE id = :id");
    $fetch_cust->execute(['id' => $booking_id]);
    $booking = $fetch_cust->fetch();
    
    if ($booking) {
        $notif_title = "Booking Update: " . strtoupper($new_status);
        $notif_msg = "Your booking order " . $booking['display_id'] . " status was updated to " . strtoupper($new_status) . ".";
        $stmt_notif = $pdo->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
        $stmt_notif->execute([
            'uid' => $booking['customer_id'],
            'title' => $notif_title,
            'msg' => $notif_msg
        ]);
    }
    
    header("Location: bookings.php?success=1");
    exit();
}

$filter_status = $_GET['status'] ?? '';
$where = '';
$params = [];
if (!empty($filter_status)) {
    $where = "WHERE b.status = :status";
    $params['status'] = $filter_status;
}

$bookings = $pdo->prepare("
    SELECT b.*, u.name as customer_name, s.shop_name, sr.service_name, v.plate_number
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN shops s ON b.shop_id = s.id
    JOIN services sr ON b.service_id = sr.id
    LEFT JOIN vehicles v ON b.vehicle_id = v.id
    $where
    ORDER BY b.id DESC
");
$bookings->execute($params);
$bookings_record = $bookings->fetchAll();
?>

<?php if (isset($_GET['success'])): ?>
    <div class="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg mb-6">
        Status changed successfully. Operations notified.
    </div>
<?php endif; ?>

<!-- Filter Matrix -->
<div class="flex flex-wrap gap-2 mb-6">
    <a href="bookings.php" class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 <?php echo empty($filter_status) ? 'border-emerald-500 text-emerald-400' : 'text-slate-400 hover:bg-slate-850'; ?>">ALL ORDERS</a>
    <a href="bookings.php?status=pending" class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 <?php echo $filter_status === 'pending' ? 'border-emerald-500 text-emerald-400' : 'text-slate-400 hover:bg-slate-850'; ?>">PENDING</a>
    <a href="bookings.php?status=dispatched" class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 <?php echo $filter_status === 'dispatched' ? 'border-emerald-500 text-emerald-400' : 'text-slate-400 hover:bg-slate-850'; ?>">DISPATCHED</a>
    <a href="bookings.php?status=in_progress" class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 <?php echo $filter_status === 'in_progress' ? 'border-emerald-500 text-emerald-400' : 'text-slate-400 hover:bg-slate-850'; ?>">IN PROGRESS</a>
    <a href="bookings.php?status=completed" class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 <?php echo $filter_status === 'completed' ? 'border-emerald-500 text-emerald-400' : 'text-slate-400 hover:bg-slate-850'; ?>">COMPLETED</a>
    <a href="bookings.php?status=cancelled" class="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 <?php echo $filter_status === 'cancelled' ? 'border-emerald-500 text-emerald-400' : 'text-slate-400 hover:bg-slate-850'; ?>">CANCELLED</a>
</div>

<div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th class="p-4">Display ID</th>
                    <th class="p-4">Customer</th>
                    <th class="p-4">Station Name</th>
                    <th class="p-4">Service Required</th>
                    <th class="p-4">Vehicle Plate</th>
                    <th class="p-4">Timing Coordinates</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-right">Modify Operations</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
                <?php foreach($bookings_record as $b): ?>
                <tr class="hover:bg-slate-800/20">
                    <td class="p-4 font-mono font-semibold text-emerald-400"><?php echo htmlspecialchars($b['display_id']); ?></td>
                    <td class="p-4 text-slate-200"><?php echo htmlspecialchars($b['customer_name']); ?></td>
                    <td class="p-4 text-slate-300 font-semibold"><?php echo htmlspecialchars($b['shop_name']); ?></td>
                    <td class="p-4 text-slate-300"><?php echo htmlspecialchars($b['service_name']); ?></td>
                    <td class="p-4 font-mono text-slate-400"><?php echo htmlspecialchars($b['plate_number'] ?? 'N/A'); ?></td>
                    <td class="p-4 text-slate-400">
                        <span class="block"><?php echo $b['booking_date']; ?></span>
                        <span class="text-[10px] text-slate-500"><?php echo $b['booking_time']; ?></span>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono <?php 
                            echo $b['status'] === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 
                                ($b['status'] === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-500/25 animate-pulse' : 
                                ($b['status'] === 'cancelled' ? 'bg-rose-950 text-rose-300 border border-rose-500/15' : 'bg-indigo-950 text-indigo-300 border border-indigo-500/20'));
                        ?>">
                            <?php echo strtoupper($b['status']); ?>
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <form action="bookings.php" method="POST" class="inline-flex gap-1 items-center justify-end">
                            <input type="hidden" name="booking_id" value="<?php echo $b['id']; ?>">
                            <select name="status" class="bg-slate-950 text-[11px] border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                <option value="pending" <?php echo $b['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="accepted" <?php echo $b['status'] === 'accepted' ? 'selected' : ''; ?>>Accepted</option>
                                <option value="dispatched" <?php echo $b['status'] === 'dispatched' ? 'selected' : ''; ?>>Dispatched</option>
                                <option value="in_progress" <?php echo $b['status'] === 'in_progress' ? 'selected' : ''; ?>>In Progress</option>
                                <option value="completed" <?php echo $b['status'] === 'completed' ? 'selected' : ''; ?>>Completed</option>
                                <option value="cancelled" <?php echo $b['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                            </select>
                            <button type="submit" name="update_status" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded">Update</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once '../includes/admin_footer.php'; ?>`
  },
  {
    path: "admin/reviews.php",
    description: "Moderation layout facilitating checking ratings, auditing notes, and dropping violations.",
    code: `<?php
$page_title = "Customer Feedback Auditing";
require_once '../includes/db_connect.php';
require_once '../includes/admin_header.php';

// Moderate deletion
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    // Fetch stats coordinates to adjust summary score
    $review_stmt = $pdo->prepare("SELECT shop_id FROM reviews WHERE id = :id");
    $review_stmt->execute(['id' => $id]);
    $rev = $review_stmt->fetch();
    
    if ($rev) {
        $shop_id = $rev['shop_id'];
        
        // Delete the review record
        $stmt_del = $pdo->prepare("DELETE FROM reviews WHERE id = :id");
        $stmt_del->execute(['id' => $id]);
        
        // Re-calculate the average score and summaries for security correctness
        $stmt_recalc = $pdo->prepare("
            SELECT COUNT(*) as total, AVG(rating) as average 
            FROM reviews 
            WHERE shop_id = :sid
        ");
        $stmt_recalc->execute(['sid' => $shop_id]);
        $stats = $stmt_recalc->fetch();
        
        $new_total = $stats['total'];
        $new_avg = $stats['average'] ?? 0.00;
        
        $stmt_upd = $pdo->prepare("UPDATE shops SET avg_rating = :avg, total_reviews = :tot WHERE id = :sid");
        $stmt_upd->execute(['avg' => $new_avg, 'tot' => $new_total, 'sid' => $shop_id]);
    }
    
    header("Location: reviews.php?deleted=1");
    exit();
}

$reviews = $pdo->query("
    SELECT r.*, u.name as customer_name, s.shop_name, b.display_id
    FROM reviews r
    JOIN users u ON r.customer_id = u.id
    JOIN shops s ON r.shop_id = s.id
    JOIN bookings b ON r.booking_id = b.id
    ORDER BY r.id DESC
")->fetchAll();
?>

<?php if (isset($_GET['deleted'])): ?>
    <div class="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs rounded-lg mb-6">
        Review deleted successfully. Shop ratings updated accordingly.
    </div>
<?php endif; ?>

<div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
            <thead>
                <tr class="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th class="p-4">Ref Log</th>
                    <th class="p-4">Customer</th>
                    <th class="p-4">Garage/Shop</th>
                    <th class="p-4">Booking Ref</th>
                    <th class="p-4">Rating Index</th>
                    <th class="p-4">Message / Comments</th>
                    <th class="p-4">Incident Timing</th>
                    <th class="p-4 text-right">Moderations</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
                <?php foreach($reviews as $r): ?>
                <tr class="hover:bg-slate-800/20">
                    <td class="p-4 font-mono text-slate-500">REV-<?php echo $r['id']; ?></td>
                    <td class="p-4 font-semibold text-slate-200"><?php echo htmlspecialchars($r['customer_name']); ?></td>
                    <td class="p-4 text-emerald-400 font-medium"><?php echo htmlspecialchars($r['shop_name']); ?></td>
                    <td class="p-4 font-mono text-slate-400"><?php echo htmlspecialchars($r['display_id']); ?></td>
                    <td class="p-4">
                        <span class="text-amber-400 font-bold">&#9733; <?php echo $r['rating']; ?> / 5</span>
                    </td>
                    <td class="p-4 text-slate-300 max-w-xs whitespace-normal line-clamp-2"><?php echo htmlspecialchars($r['comment']); ?></td>
                    <td class="p-4 text-slate-500 font-mono"><?php echo $r['created_at']; ?></td>
                    <td class="p-4 text-right">
                        <a href="reviews.php?action=delete&id=<?php echo $r['id']; ?>" onclick="return confirm('Wipe out this customer rating review from records?');" class="text-[10px] px-2.5 py-1 bg-rose-950 text-rose-400 border border-rose-500/10 rounded hover:bg-rose-900/60 transition-all font-semibold">Delete Review</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once '../includes/admin_footer.php'; ?>`
  }
];
