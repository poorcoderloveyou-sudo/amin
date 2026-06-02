/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FullDbState, DbUser, DbShop, DbService, DbBooking, DbReview, DbNotification, DbVehicle, DbPayment, SqlLog } from './src/types';

// Let's create initial mock database state
const INITIAL_USERS: DbUser[] = [
  { id: 1, name: 'Admin Staff', email: 'poorcoderloveyou@gmail.com', phone: '08123456789', role: 'admin', status: 'active', created_at: '2026-05-15 09:30:00' },
  { id: 2, name: 'Michael Knight', email: 'michael@shopowner.com', phone: '08221144558', role: 'shop_owner', status: 'active', created_at: '2026-05-18 10:15:00' },
  { id: 3, name: 'Sarah Jenkins', email: 'sarah@shopowner.com', phone: '08119933445', role: 'shop_owner', status: 'active', created_at: '2026-05-19 14:24:00' },
  { id: 4, name: 'John Doe', email: 'john.doe@customer.com', phone: '08998877665', role: 'customer', status: 'active', created_at: '2026-05-20 11:05:00' },
  { id: 5, name: 'Alice Cooper', email: 'cooper@gmail.com', phone: '08771122334', role: 'customer', status: 'active', created_at: '2026-05-21 16:40:00' },
  { id: 6, name: 'David Beckham', email: 'david@shopowner.com', phone: '08122334455', role: 'shop_owner', status: 'active', created_at: '2026-05-22 08:12:00' },
  { id: 7, name: 'Robert Downey', email: 'tony@stark.com', phone: '08112223334', role: 'customer', status: 'suspended', created_at: '2026-05-23 12:00:00' },
  { id: 8, name: 'Bill Gates', email: 'gates@microsoft.com', phone: '08119998887', role: 'customer', status: 'active', created_at: '2026-05-24 15:30:00' }
];

const INITIAL_SHOPS: DbShop[] = [
  { id: 10, owner_id: 2, shop_name: 'Elite Auto Spa', address: '422 Speedline Blvd, Suite A', latitude: 37.7749, longitude: -122.4194, phone: '08221144558', status: 'active', avg_rating: 4.8, total_reviews: 3 },
  { id: 11, owner_id: 3, shop_name: 'Apex Car Detailing & Wash', address: '18 Gearshift Ave', latitude: 34.0522, longitude: -118.2437, phone: '08119933445', status: 'active', avg_rating: 4.2, total_reviews: 2 },
  { id: 12, owner_id: 6, shop_name: 'Green Clean Eco-Wash', address: '88 Raindrop Alley', latitude: 40.7128, longitude: -74.0060, phone: '08122334455', status: 'pending', avg_rating: 0, total_reviews: 0 },
  { id: 13, owner_id: 2, shop_name: 'Turbo Charged Garage & Detail', address: '556 Horsepower Lane', latitude: 41.8781, longitude: -87.6298, phone: '08221144559', status: 'suspended', avg_rating: 3.5, total_reviews: 1 }
];

const INITIAL_VEHICLES: DbVehicle[] = [
  { id: 200, customer_id: 4, vehicle_type: 'sedan', brand: 'Toyota', model: 'Camry', year: 2022, plate_number: 'B 1234 ABC' },
  { id: 201, customer_id: 5, vehicle_type: 'suv', brand: 'Honda', model: 'CR-V', year: 2021, plate_number: 'D 9876 ZZZ' },
  { id: 202, customer_id: 7, vehicle_type: 'truck', brand: 'Ford', model: 'Raptor', year: 2023, plate_number: 'F 3000 TON' },
  { id: 203, customer_id: 8, vehicle_type: 'sedan', brand: 'Tesla', model: 'Model 3', year: 2023, plate_number: 'B 1 MSFT' }
];

const INITIAL_SERVICES: DbService[] = [
  { id: 50, shop_id: 10, service_name: 'Signature Full Wax & Polish', vehicle_type: 'sedan', price: 85.00, duration: 90 },
  { id: 51, shop_id: 10, service_name: 'Interior Steam Clean & Vacuum', vehicle_type: 'suv', price: 120.00, duration: 120 },
  { id: 52, shop_id: 11, service_name: 'Express Spray Wash & Wipe', vehicle_type: 'sedan', price: 25.05, duration: 25 },
  { id: 53, shop_id: 11, service_name: 'Motorcycle Ultra-Detail Pack', vehicle_type: 'motorcycle', price: 60.00, duration: 60 },
  { id: 54, shop_id: 12, service_name: 'Eco Eco Wash & Shield', vehicle_type: 'sedan', price: 40.00, duration: 45 },
  { id: 55, shop_id: 13, service_name: 'Full Mechanical Oil Flush & Filters', vehicle_type: 'truck', price: 150.00, duration: 80 }
];

const INITIAL_BOOKINGS: DbBooking[] = [
  { id: 100, display_id: 'AC-9917', customer_id: 4, shop_id: 10, service_id: 50, booking_date: '2026-06-01', booking_time: '10:00:00', vehicle_id: 200, status_updated_at: '2026-06-01 10:15:00', status: 'completed' },
  { id: 101, display_id: 'AC-9918', customer_id: 5, shop_id: 10, service_id: 51, booking_date: '2026-06-01', booking_time: '13:00:00', vehicle_id: 201, status_updated_at: '2026-06-01 11:30:00', status: 'completed' },
  { id: 102, display_id: 'AC-9919', customer_id: 8, shop_id: 11, service_id: 52, booking_date: '2026-06-02', booking_time: '09:00:00', vehicle_id: 203, status_updated_at: '2026-06-02 04:14:00', status: 'in_progress' },
  { id: 103, display_id: 'AC-9920', customer_id: 4, shop_id: 11, service_id: 52, booking_date: '2026-06-03', booking_time: '14:30:00', vehicle_id: 200, status_updated_at: '2026-06-02 01:20:00', status: 'accepted' },
  { id: 104, display_id: 'AC-9921', customer_id: 7, shop_id: 13, service_id: 55, booking_date: '2026-05-28', booking_time: '11:00:00', vehicle_id: 202, status_updated_at: '2026-05-28 11:15:00', status: 'cancelled' },
  { id: 105, display_id: 'AC-9922', customer_id: 5, shop_id: 12, service_id: 54, booking_date: '2026-06-04', booking_time: '15:00:00', vehicle_id: 201, status_updated_at: '2026-06-02 03:00:00', status: 'pending' }
];

const INITIAL_REVIEWS: DbReview[] = [
  { id: 400, customer_id: 4, shop_id: 10, booking_id: 100, rating: 5, comment: 'Phenomenal attention to detail. The paint shines like mirrors!', created_at: '2026-06-01 11:45:00' },
  { id: 401, customer_id: 5, shop_id: 10, booking_id: 101, rating: 4, comment: 'Great job with steam cleaning, minor delays at intake but clean results.', created_at: '2026-06-01 15:30:00' },
  { id: 402, customer_id: 8, shop_id: 11, booking_id: 102, rating: 4, comment: 'Incredibly speedy service and nice staff.', created_at: '2026-06-02 10:15:00' }
];

const INITIAL_PAYMENTS: DbPayment[] = [
  { id: 500, booking_id: 100, amount: 85.00, payment_method: 'credit_card', payment_status: 'paid', paid_at: '2026-06-01 10:05:00' },
  { id: 501, booking_id: 101, amount: 120.00, payment_method: 'e-wallet', payment_status: 'paid', paid_at: '2026-06-01 13:02:00' },
  { id: 502, booking_id: 102, amount: 25.05, payment_method: 'cash_on_delivery', payment_status: 'pending', paid_at: null },
  { id: 503, booking_id: 103, amount: 25.05, payment_method: 'credit_card', payment_status: 'paid', paid_at: '2026-06-02 01:20:00' },
  { id: 504, booking_id: 104, amount: 150.00, payment_method: 'credit_card', payment_status: 'refunded', paid_at: '2026-05-28 11:15:00' },
  { id: 505, booking_id: 105, amount: 40.00, payment_method: 'e-wallet', payment_status: 'pending', paid_at: null }
];

const INITIAL_NOTIFICATIONS: DbNotification[] = [
  { id: 800, user_id: 4, title: 'Booking confirmed', message: 'Your booking #AC-9917 has been successfully registered.', is_read: true, created_at: '2026-05-30 08:00:00' },
  { id: 801, user_id: null, title: 'Server Upgrade Maintenance', message: 'System core files will undergo security maintenance tonight at UTC 23:00.', is_read: false, created_at: '2026-06-01 12:00:00' },
  { id: 802, user_id: 5, title: 'Ready to dispatch', message: 'Your booking #AC-9922 has been received by Green Clean Eco-Wash.', is_read: false, created_at: '2026-06-02 03:00:00' }
];

// Memory state definitions
let DB_STATE: FullDbState = {
  users: [...INITIAL_USERS],
  shops: [...INITIAL_SHOPS],
  services: [...INITIAL_SERVICES],
  bookings: [...INITIAL_BOOKINGS],
  reviews: [...INITIAL_REVIEWS],
  notifications: [...INITIAL_NOTIFICATIONS],
  vehicles: [...INITIAL_VEHICLES],
  payments: [...INITIAL_PAYMENTS],
  sqlLogs: [
    {
      id: 'init-001',
      timestamp: new Date().toISOString(),
      sql: 'CREATE DATABASE autocare_db;\nUSE autocare_db;\n-- (Schema loaded based on user screenshots)',
      description: 'System initial DB boot up. 8 tables online.'
    }
  ]
};

const DB_FILE_PATH = path.join(process.cwd(), 'autocare_db.json');

function saveDbState() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DB_STATE, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database state to file:', error);
  }
}

function loadDbState() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const loaded = JSON.parse(data);
      if (loaded && Array.isArray(loaded.users) && Array.isArray(loaded.shops)) {
        DB_STATE = loaded;
        console.log('Database loaded successfully from persistent storage.');
        return;
      }
    }
  } catch (error) {
    console.error('Failed to load database state, using defaults:', error);
  }
  saveDbState();
}

// Initialise DB state from file if exists
loadDbState();

// SQL helper logger
function pushSql(sql: string, description: string) {
  const cleanSql = sql.trim().replace(/\n\s*\n/g, '\n');
  const log: SqlLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleString(),
    sql: cleanSql,
    description: description
  };
  DB_STATE.sqlLogs.unshift(log);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. GET FULL DATABASE STATE
  app.get('/api/data', (req, res) => {
    res.json(DB_STATE);
  });

  // 2. RESET DATABASE ACTION
  app.post('/api/action/reset', (req, res) => {
    DB_STATE = {
      users: [...INITIAL_USERS],
      shops: [...INITIAL_SHOPS],
      services: [...INITIAL_SERVICES],
      bookings: [...INITIAL_BOOKINGS],
      reviews: [...INITIAL_REVIEWS],
      notifications: [...INITIAL_NOTIFICATIONS],
      vehicles: [...INITIAL_VEHICLES],
      payments: [...INITIAL_PAYMENTS],
      sqlLogs: [
        {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toLocaleString(),
          sql: '-- SYSTEM DATABASE STATE RECONSTRUCTED\nTRUNCATE TABLE users, shops, services, bookings, reviews, notifications, vehicles, payments;\n-- Reloading seed scripts...',
          description: 'Database completely normalized and seed data loaded.'
        }
      ]
    };
    saveDbState();
    res.json({ success: true, db: DB_STATE });
  });

  // 3. SHOP STATUS UPDATE (Approve, Suspend)
  app.post('/api/action/shop-status', (req, res) => {
    const { id, status } = req.body;
    const shop = DB_STATE.shops.find(s => s.id === id);
    if (shop) {
      shop.status = status;
      const sql = `UPDATE shops \nSET status = '${status}' \nWHERE id = ${id};`;
      pushSql(sql, `Updated status of shop "${shop.shop_name}" to "${status}"`);
      saveDbState();
      res.json({ success: true, db: DB_STATE });
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  });

  // 4. USER STATUS UPDATE (Activate, Suspend)
  app.post('/api/action/user-status', (req, res) => {
    const { id, status } = req.body;
    const user = DB_STATE.users.find(u => u.id === id);
    if (user) {
      user.status = status;
      const sql = `UPDATE users \nSET status = '${status}' \nWHERE id = ${id};`;
      pushSql(sql, `Altered status of User "${user.name}" to "${status}"`);
      saveDbState();
      res.json({ success: true, db: DB_STATE });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // 5. DELETE USER
  app.post('/api/action/user-delete', (req, res) => {
    const { id } = req.body;
    const idx = DB_STATE.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const u = DB_STATE.users[idx];
      DB_STATE.users.splice(idx, 1);
      
      // Cascade delete shops of owner
      const preShopLength = DB_STATE.shops.length;
      DB_STATE.shops = DB_STATE.shops.filter(s => s.owner_id !== id);
      const postShopLength = DB_STATE.shops.length;
      const cascadeDesc = postShopLength < preShopLength ? ' (Cascaded CASCADE FK triggers deleting linked shops)' : '';

      const sql = `DELETE FROM users \nWHERE id = ${id};`;
      pushSql(sql, `Wiped user "${u.name}" coordinates${cascadeDesc}`);
      saveDbState();
      res.json({ success: true, db: DB_STATE });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // 6. BOOKING STATUS UPDATE (and cascading notification/payment updates!)
  app.post('/api/action/booking-status', (req, res) => {
    const { id, status } = req.body;
    const booking = DB_STATE.bookings.find(b => b.id === id);
    if (booking) {
      const prevStatus = booking.status;
      booking.status = status;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      booking.status_updated_at = now;

      let sql = `UPDATE bookings \nSET status = '${status}', status_updated_at = NOW() \nWHERE id = ${id};\n`;

      // Update payment status if marked completed
      if (status === 'completed') {
        const pay = DB_STATE.payments.find(p => p.booking_id === id);
        if (pay && pay.payment_status !== 'paid') {
          pay.payment_status = 'paid';
          pay.paid_at = now;
          sql += `UPDATE payments \nSET payment_status = 'paid', paid_at = NOW() \nWHERE booking_id = ${id};\n`;
        }
      } else if (status === 'cancelled') {
        const pay = DB_STATE.payments.find(p => p.booking_id === id);
        if (pay && pay.payment_status === 'paid') {
          pay.payment_status = 'refunded';
          sql += `UPDATE payments \nSET payment_status = 'refunded' \nWHERE booking_id = ${id};\n`;
        }
      }

      // Add a notification entry for customer
      const notifId = Math.max(0, ...DB_STATE.notifications.map(n => n.id)) + 1;
      const title = `Booking Update: ${status.toUpperCase()}`;
      const message = `Booking ${booking.display_id} status has been updated from ${prevStatus} to ${status}.`;
      DB_STATE.notifications.push({
        id: notifId,
        user_id: booking.customer_id,
        title: title,
        message: message,
        is_read: false,
        created_at: now
      });
      sql += `INSERT INTO notifications (user_id, title, message) \nVALUES (${booking.customer_id}, '${title}', '${message}');`;

      pushSql(sql, `Updated Booking ${booking.display_id} status to ${status} (Added customer alert)`);
      saveDbState();
      res.json({ success: true, db: DB_STATE });
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  });

  // 7. DELETE REVIEW (and recalculate shop stats rating)
  app.post('/api/action/delete-review', (req, res) => {
    const { id } = req.body;
    const revIdx = DB_STATE.reviews.findIndex(r => r.id === id);
    if (revIdx !== -1) {
      const review = DB_STATE.reviews[revIdx];
      const shopId = review.shop_id;
      DB_STATE.reviews.splice(revIdx, 1);

      // Recalculate
      const siblingReviews = DB_STATE.reviews.filter(r => r.shop_id === shopId);
      const totalReviews = siblingReviews.length;
      const sum = siblingReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(2)) : 0.00;

      const shop = DB_STATE.shops.find(s => s.id === shopId);
      if (shop) {
        shop.total_reviews = totalReviews;
        shop.avg_rating = avgRating;
      }

      const sql = `DELETE FROM reviews \nWHERE id = ${id};\nUPDATE shops \nSET avg_rating = ${avgRating}, total_reviews = ${totalReviews} \nWHERE id = ${shopId};`;
      pushSql(sql, `Deleted review REV-${id} from DB & normalized rating statistics for shop ID ${shopId}`);
      saveDbState();
      res.json({ success: true, db: DB_STATE });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  });

  // 8. ADD NEW USER
  app.post('/api/action/add-user', (req, res) => {
    const { name, email, phone, role } = req.body;
    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: 'Missing active specifications' });
    }

    const nextId = Math.max(0, ...DB_STATE.users.map(u => u.id)) + 1;
    const newUser: DbUser = {
      id: nextId,
      name,
      email,
      phone,
      role,
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    DB_STATE.users.push(newUser);
    const sql = `INSERT INTO users (id, name, email, password, phone, role, status, created_at) \nVALUES (${nextId}, '${name}', '${email}', 'md5_hash_sample', '${phone}', '${role}', 'active', NOW());`;
    pushSql(sql, `Created active account coordinate ID ${nextId} (${name})`);
    saveDbState();
    res.json({ success: true, db: DB_STATE });
  });

  // 9. ADD NEW NOTIFICATION / BROADCAST ALERT
  app.post('/api/action/add-notification', (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const nextId = Math.max(0, ...DB_STATE.notifications.map(n => n.id)) + 1;
    const newNotif: DbNotification = {
      id: nextId,
      user_id: null, // Broadcast to all
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    DB_STATE.notifications.push(newNotif);
    const sql = `INSERT INTO notifications (id, user_id, title, message, is_read, created_at) \nVALUES (${nextId}, NULL, '${title}', '${message}', FALSE, NOW());`;
    pushSql(sql, `Broadcast administrative global notification: "${title}"`);
    saveDbState();
    res.json({ success: true, db: DB_STATE });
  });

  // 10. RUN RAW INTUATIVE SQL QUERIES (FULL RDBMS ENGINE SIMULATOR)
  app.post('/api/action/run-sql', (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'No raw query payload provided' });
    }

    const trimmedQuery = query.trim();
    
    try {
      pushSql(trimmedQuery, 'Executed manual SQL Query runner client');

      // (A) Match: SELECT * FROM table [WHERE col = val]
      const selectMatch = trimmedQuery.match(/^\s*SELECT\s+\*\s+FROM\s+(\w+)(?:\s+WHERE\s+(\w+)\s*=\s*(['"]?.*?['"]?))?\s*;?\s*$/i);
      if (selectMatch) {
        const table = selectMatch[1];
        const whereCol = selectMatch[2];
        const whereVal = selectMatch[3] ? selectMatch[3].replace(/^['"]|['"]$/g, '') : null;
        
        const tableKey = table.toLowerCase() as keyof FullDbState;
        const rawRows = DB_STATE[tableKey] as any[];
        
        if (!rawRows) {
          return res.json({ 
            success: false, 
            error: `Table "${table}" does not exist in autocare_db schema. Valid tables: users, shops, vehicles, services, bookings, reviews, payments, notifications.` 
          });
        }
        
        let filteredRows = [...rawRows];
        if (whereCol) {
          const colLower = whereCol.toLowerCase();
          filteredRows = filteredRows.filter(row => String(row[colLower] ?? '').toLowerCase() === String(whereVal).toLowerCase());
        }
        
        const columns = rawRows.length > 0 ? Object.keys(rawRows[0]) : ['id'];
        return res.json({
          success: true,
          columns,
          rows: filteredRows
        });
      }

      // (B) Match: INSERT INTO table (col1, col2) VALUES (val1, val2)
      const insertMatch = trimmedQuery.match(/^\s*INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*;?\s*$/i);
      if (insertMatch) {
         const table = insertMatch[1];
         const colsStr = insertMatch[2];
         const valsStr = insertMatch[3];
         
         const tableKey = table.toLowerCase() as keyof FullDbState;
         const rawRows = DB_STATE[tableKey] as any[];
         
         if (!rawRows) {
           return res.json({ success: false, error: `Table "${table}" does not exist in autocare_db schema.` });
         }
         
         const cols = colsStr.split(',').map(s => s.trim().toLowerCase());
         
         // Custom comma-sensitive CSV parser for values avoiding quote commas splitting
         const vals: string[] = [];
         let current = '';
         let inQuotes = false;
         let quoteChar = '';
         for (let i = 0; i < valsStr.length; i++) {
           const char = valsStr[i];
           if ((char === "'" || char === '"') && (i === 0 || valsStr[i-1] !== '\\')) {
             if (!inQuotes) {
               inQuotes = true;
               quoteChar = char;
             } else if (char === quoteChar) {
               inQuotes = false;
             } else {
               current += char;
             }
           } else if (char === ',' && !inQuotes) {
             vals.push(current.trim());
             current = '';
           } else {
             current += char;
           }
         }
         vals.push(current.trim());
         
         if (cols.length !== vals.length) {
           return res.json({ success: false, error: `Column count (${cols.length}) does not match value count (${vals.length}).` });
         }
         
         const nextId = Math.max(0, ...rawRows.map(r => Number(r.id || 0))) + 1;
         const newRow: any = { id: nextId };
         
         cols.forEach((col, idx) => {
           let valStr = vals[idx].replace(/^['"]|['"]$/g, '');
           let val: any = valStr;
           if (valStr.toLowerCase() === 'null') {
             val = null;
           } else if (!isNaN(Number(valStr)) && valStr !== '' && !valStr.startsWith('0') && !valStr.startsWith('+')) {
             val = Number(valStr);
           } else if (valStr.toLowerCase() === 'true' || valStr.toLowerCase() === 'false') {
             val = valStr.toLowerCase() === 'true';
           }
           newRow[col] = val;
         });
         
         // Set default constraints
         const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
         if (tableKey === 'users') {
           if (!newRow.status) newRow.status = 'active';
           if (!newRow.created_at) newRow.created_at = nowStr;
         } else if (tableKey === 'notifications') {
           if (newRow.is_read === undefined) newRow.is_read = false;
           if (!newRow.created_at) newRow.created_at = nowStr;
         } else if (tableKey === 'reviews') {
           if (!newRow.created_at) newRow.created_at = nowStr;
         } else if (tableKey === 'bookings') {
           if (!newRow.display_id) newRow.display_id = `AC-${Math.floor(1000 + Math.random() * 9000)}`;
           if (!newRow.status) newRow.status = 'pending';
           if (!newRow.status_updated_at) newRow.status_updated_at = nowStr;
         }
         
         rawRows.push(newRow);
         saveDbState();
         
         return res.json({
           success: true,
           message: `Query OK. 1 record inserted into "${table}" with ID: ${nextId}. Affected rows: 1.`
         });
      }

      // (C) Match: UPDATE table SET col1=val1, col2=val2 WHERE whereCol=whereVal
      const updateMatch = trimmedQuery.match(/^\s*UPDATE\s+(\w+)\s+SET\s+(.*?)\s+WHERE\s+(\w+)\s*=\s*(.*?)\s*;?\s*$/i);
      if (updateMatch) {
         const table = updateMatch[1];
         const setClause = updateMatch[2];
         const whereCol = updateMatch[3];
         const whereVal = updateMatch[4].trim().replace(/^['"]|['"]$/g, '');
         
         const tableKey = table.toLowerCase() as keyof FullDbState;
         const rawRows = DB_STATE[tableKey] as any[];
         
         if (!rawRows) {
           return res.json({ success: false, error: `Table "${table}" does not exist in autocare_db schema.` });
         }
         
         const pairs: { [key: string]: any } = {};
         const setRegex = /(\w+)\s*=\s*((?:'[^']*'|"[^"]*"|[^,]*))(?:,|$)/g;
         let m;
         while ((m = setRegex.exec(setClause)) !== null) {
           const colName = m[1].trim().toLowerCase();
           const valString = m[2].trim().replace(/^['"]|['"]$/g, '');
           let val: any = valString;
           if (valString.toLowerCase() === 'null') {
             val = null;
           } else if (!isNaN(Number(valString)) && valString !== '' && !valString.startsWith('0')) {
             val = Number(valString);
           } else if (valString.toLowerCase() === 'true' || valString.toLowerCase() === 'false') {
             val = valString.toLowerCase() === 'true';
           }
           pairs[colName] = val;
         }
         
         const searchCol = whereCol.toLowerCase();
         let affectedRows = 0;
         
         rawRows.forEach((row: any) => {
           if (String(row[searchCol] ?? '').toLowerCase() === whereVal.toLowerCase()) {
             Object.keys(pairs).forEach(col => {
               row[col] = pairs[col];
             });
             affectedRows++;
           }
         });
         
         if (affectedRows > 0) {
           saveDbState();
         }
         
         return res.json({
           success: true,
           message: `Query OK. ${affectedRows} row(s) updated successfully. Affected rows: ${affectedRows}.`
         });
      }

      // (D) Match: DELETE FROM table WHERE col = val
      const deleteMatch = trimmedQuery.match(/^\s*DELETE\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*(.*?)\s*;?\s*$/i);
      if (deleteMatch) {
         const table = deleteMatch[1];
         const whereCol = deleteMatch[2];
         const whereVal = deleteMatch[3].trim().replace(/^['"]|['"]$/g, '');
         
         const tableKey = table.toLowerCase() as keyof FullDbState;
         const rawRows = DB_STATE[tableKey] as any[];
         
         if (!rawRows) {
           return res.json({ success: false, error: `Table "${table}" does not exist in autocare_db schema.` });
         }
         
         const searchCol = whereCol.toLowerCase();
         const prevLen = rawRows.length;
         
         DB_STATE[tableKey] = rawRows.filter(row => String(row[searchCol] ?? '').toLowerCase() !== whereVal.toLowerCase()) as any;
         const deletedCount = prevLen - DB_STATE[tableKey].length;
         
         if (deletedCount > 0) {
           saveDbState();
         }
         
         return res.json({
           success: true,
           message: `Query OK. ${deletedCount} record(s) purged from "${table}". Affected rows: ${deletedCount}.`
         });
      }

      // Fallback query matching error helper
      return res.json({ 
        success: false, 
        error: "RDBMS query parser error. Try: 'SELECT * FROM users', 'INSERT INTO notifications (title, message) VALUES ('Refitting', 'Upgrades')', 'UPDATE users SET status = 'suspended' WHERE id = 4', or 'DELETE FROM reviews WHERE id = 711'." 
      });

    } catch (e: any) {
      res.json({ success: false, error: e.message || 'Syntax error executing query simulation' });
    }
  });

  // Vite static/middleware entry
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoCare Admin Panel Core running on http://localhost:${PORT}`);
  });
}

startServer();
