// ============================================
// L.S.G LAN CENTRE — Live Web & Admin Server
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'bookings.json');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// SSE connected clients
const sseClients = new Set();

function broadcastSSE(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(message);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// Read bookings from disk
function readBookings() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Seed initial sample bookings
      const initial = [
        {
          bookingId: 'LSG-BK-7721',
          stationId: 'racing-sim',
          stationName: 'Racing Simulator Rig',
          date: new Date().toISOString().split('T')[0],
          slot: '08:00 PM – 10:00 PM',
          duration: '2 Hour(s)',
          totalAmount: '₹240',
          paymentMethod: 'Cash',
          customer: {
            name: 'Sameer Khan',
            phone: '+91 97722 11002',
            email: 'sameer.f1@gmail.com',
            discord: 'ApexSameer#4040'
          },
          paymentStatus: 'Cash on Arrival',
          proof: {
            fileName: 'Cash Payment at Counter',
            fileSize: 0,
            fileType: 'cash',
            dataUrl: null,
            note: 'Customer will pay physical cash at the front reception desk upon arrival',
            uploadedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        },
        {
          bookingId: 'LSG-BK-9182',
          stationId: 'battle-arena',
          stationName: 'Gaming PC — Battle Arena',
          date: new Date().toISOString().split('T')[0],
          slot: '06:00 PM – 08:00 PM',
          duration: '2 Hour(s)',
          totalAmount: '₹160',
          paymentMethod: 'UPI',
          customer: {
            name: 'Aman Sharma',
            phone: '+91 98201 54321',
            email: 'aman.gamer@gmail.com',
            discord: 'AmanApex#9921'
          },
          paymentStatus: 'Pending Verification',
          proof: {
            fileName: 'paytm_transaction.png',
            fileSize: 469260,
            fileType: 'image/png',
            dataUrl: 'images/payment-scanner.png',
            uploadedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        },
        {
          bookingId: 'LSG-BK-4029',
          stationId: 'vip-lounge',
          stationName: 'VIP Gaming PC — L.S.G Lounge',
          date: new Date().toISOString().split('T')[0],
          slot: '02:00 PM – 04:00 PM',
          duration: '2 Hour(s)',
          totalAmount: '₹300',
          paymentMethod: 'UPI',
          customer: {
            name: 'Rohan Mehra',
            phone: '+91 98112 34567',
            email: 'rohan.fps@yahoo.com',
            discord: 'RohanViper#1022'
          },
          paymentStatus: 'Approved',
          proof: {
            fileName: 'upi_screenshot_rohan.jpg',
            fileSize: 312000,
            fileType: 'image/jpeg',
            dataUrl: 'images/payment-scanner.png',
            uploadedAt: new Date(Date.now() - 3600000).toISOString()
          },
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading bookings file:', err);
    return [];
  }
}

// Write bookings to disk
function writeBookings(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing bookings file:', err);
    return false;
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ---------- API: Live SSE Stream ----------
  if (pathname === '/api/live-stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('retry: 3000\n\n');
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // ---------- API: Get All Bookings ----------
  if (req.method === 'GET' && (pathname === '/api/bookings' || pathname === '/api/payment-proof')) {
    const list = readBookings();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  // ---------- API: Create New Booking ----------
  if (req.method === 'POST' && (pathname === '/api/bookings' || pathname === '/api/payment-proof')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protect against gigantic payloads (> 20MB)
      if (body.length > 20 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const newBooking = JSON.parse(body);
        if (!newBooking.bookingId) {
          newBooking.bookingId = `LSG-BK-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        if (!newBooking.createdAt) {
          newBooking.createdAt = new Date().toISOString();
        }
        if (!newBooking.paymentStatus) {
          newBooking.paymentStatus = 'Pending Verification';
        }

        const bookings = readBookings();
        // Insert at beginning
        bookings.unshift(newBooking);
        writeBookings(bookings);

        // Notify all live tabs and clients via SSE
        broadcastSSE('booking_created', newBooking);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, booking: newBooking }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // ---------- API: Update Booking Status ----------
  if (req.method === 'PUT' && pathname.startsWith('/api/bookings/')) {
    const bookingId = decodeURIComponent(pathname.replace('/api/bookings/', ''));
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const bookings = readBookings();
        const target = bookings.find(b => b.bookingId === bookingId);

        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Booking not found' }));
          return;
        }

        Object.assign(target, updates);
        writeBookings(bookings);

        // Notify live listeners
        broadcastSSE('booking_updated', target);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, booking: target }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid update payload' }));
      }
    });
    return;
  }

  // ---------- API: Delete Booking ----------
  if (req.method === 'DELETE' && pathname.startsWith('/api/bookings/')) {
    const bookingId = decodeURIComponent(pathname.replace('/api/bookings/', ''));
    const bookings = readBookings();
    const filtered = bookings.filter(b => b.bookingId !== bookingId);

    if (filtered.length === bookings.length) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Booking not found' }));
      return;
    }

    writeBookings(filtered);
    broadcastSSE('booking_deleted', { bookingId });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, bookingId }));
    return;
  }

  // ---------- API: Clear All Bookings ----------
  if (req.method === 'DELETE' && pathname === '/api/bookings') {
    writeBookings([]);
    broadcastSSE('bookings_cleared', {});
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // ---------- Static File Serving ----------
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  // Strip leading slash
  if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1);
  }
  // If request has no extension, check if an html file exists (e.g. /admin -> admin.html)
  if (!path.extname(relativePath)) {
    if (fs.existsSync(path.join(__dirname, relativePath + '.html'))) {
      relativePath += '.html';
    }
  }

  const filePath = path.join(__dirname, relativePath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`L.S.G Server running live at http://localhost:${PORT}`);
  console.log(`Main Webpage:  http://localhost:${PORT}/`);
  console.log(`Admin Portal:  http://localhost:${PORT}/admin.html`);
});
