# L.S.G LAN CENTRE 🎮

> **Premium Gaming Cafe Station Booking & Real-Time Operations Management System**
>
> 📍 **Location:** Third Floor, T4, Irla Rd, near Alfa Market, Navpada, Vile Parle West, Mumbai, Maharashtra 400056  
> ⏰ **Hours:** Open Daily 10:00 AM – 08:00 PM  
> 💳 **Payment:** UPI QR Code (`paytm.s1h4qe4@pty`) & Cash on Counter  

---

## 🌟 Overview
**L.S.G LAN CENTRE** is a full-stack web application designed for next-generation esports arenas, LAN cafes, and competitive gaming lounges. It features an interactive reservation workflow, live gaming station fleet monitoring, real-time administrative verification via Server-Sent Events (SSE), dual-mode payment checkout (UPI & Cash), and automated financial reporting.

---

## 🚀 Key Features

* **Gaming Station Showcase:**
  * **PC Battle Arena (₹80/hr):** AMD Ryzen 7 7800X3D, RTX 4070, 240Hz IPS Display.
  * **VIP L.S.G Lounge (₹150/hr):** Intel Core i9 14900K, NVIDIA GeForce RTX 4090, Secretlab Titan Ergonomic Chairs.
  * **Console Party Zone (₹100/hr):** Sony PlayStation 5 with 65" 4K 120Hz OLED Display.
  * **Racing Simulator Rig (₹120/hr):** Moza R9 Direct-Drive Wheel, Load-Cell Pedals, Triple Curved Monitors.
* **Smart Booking Engine:**
  * Discrete 2-hour slot reservation constrained to daily operating hours (10:00 AM to 08:00 PM).
  * Fast checkout requiring only player Name & Phone number (zero email clutter).
* **Dual Payment Processing:**
  * **Instant UPI / QR Scan:** Official payment scanner (`paytm.s1h4qe4@pty`) with screenshot proof upload.
  * **Cash on Arrival:** Counter desk token generation for in-person cash settlement.
* **Real-Time Admin Command Center:**
  * Live station rig fleet capacity tracker (44 PC Rigs, 20 VIP Rigs, 8 Consoles, 4 Simulators).
  * Server-Sent Events (SSE) push stream for live booking notifications without page refresh.
  * Full-resolution payment proof inspection modal with one-click **Approve / Reject** actions.
  * Instant counter walk-in player entry drawer.
  * Automated CSV spreadsheet export for accounting reconciliation.

---

## 🛠️ Technology Stack

* **Frontend:** Semantic HTML5, Vanilla JavaScript (ES6+), Modern Cyberpunk & Glassmorphism CSS3, EventSource (SSE).
* **Backend:** Node.js HTTP Server, REST APIs, Server-Sent Events (SSE) EventBus.
* **Persistence:** Persistent JSON File Store (`bookings.json`) with optional Cloud Firestore integration.
* **Payment Gateway:** UPI Unified Payments Interface (GPay, PhonePe, Paytm, BHIM).

---

## 📦 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kadammithilcs242505-bit/lsg-lan-centre.git
   cd lsg-lan-centre
   ```

2. **Start the local server:**
   ```bash
   node server.js
   ```

3. **Open in browser:**
   * **Main Booking Website:** [http://localhost:3000/](http://localhost:3000/)
   * **Admin Control Center:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 📄 Academic Project Report
The complete project documentation and academic report is included:
* [Final_Project_Report.docx](Final_Project_Report.docx) — Editable Microsoft Word Project Report
* [Final_Project_Report.pdf](Final_Project_Report.pdf) — Complete Formatted PDF Report

---

## 👨‍💻 Author & Attribution
* **Student Name:** Mihir Rajesh Kadam (T083)
* **College:** Sheth L.U.J. & M.V. College, Andheri (E), Mumbai - 400069
* **Department:** Department of Computer Science (University of Mumbai)
* **Project Guide:** Prof. Rohit Shahu
