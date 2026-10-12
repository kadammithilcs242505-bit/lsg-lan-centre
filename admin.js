// ============================================
// L.S.G LAN CENTRE — Admin Portal Logic (Live Sync)
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'lsg_reservations';

  // State
  let reservations = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let activeModalBooking = null;

  // DOM Elements
  const statPendingCount = document.getElementById('statPendingCount');
  const statVerifiedCount = document.getElementById('statVerifiedCount');
  const statRevenueTotal = document.getElementById('statRevenueTotal');
  const statTotalBookings = document.getElementById('statTotalBookings');
  const tableBody = document.getElementById('reservationsTableBody');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('adminSearchInput');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const addWalkinBtn = document.getElementById('addWalkinBtn');

  // Proof Modal Elements
  const proofModal = document.getElementById('proofModal');
  const closeProofModalBtn = document.getElementById('closeProofModalBtn');
  const fullProofImg = document.getElementById('fullProofImg');
  const modalProofBookingId = document.getElementById('modalProofBookingId');
  const modalProofCustomer = document.getElementById('modalProofCustomer');
  const modalProofAmount = document.getElementById('modalProofAmount');
  const modalProofStation = document.getElementById('modalProofStation');
  const modalProofDate = document.getElementById('modalProofDate');
  const modalProofStatus = document.getElementById('modalProofStatus');
  const modalApproveBtn = document.getElementById('modalApproveBtn');
  const modalRejectBtn = document.getElementById('modalRejectBtn');

  // Walk-in Modal Elements
  const walkinModal = document.getElementById('walkinModal');
  const closeWalkinModalBtn = document.getElementById('closeWalkinModalBtn');
  const cancelWalkinBtn = document.getElementById('cancelWalkinBtn');
  const walkinForm = document.getElementById('walkinForm');

  // Toast
  const adminToast = document.getElementById('adminToast');
  const toastMessage = document.getElementById('toastMessage');

  // Audio Chime (Web Audio API)
  function playAlertChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // Load from Server API and LocalStorage
  async function loadReservations() {
    // 1. Try fetching from live server API
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const serverData = await res.json();
        if (Array.isArray(serverData) && serverData.length > 0) {
          reservations = serverData;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
          updateKPIs();
          renderTable();
          return;
        }
      }
    } catch (err) {
      // Backend not running, fallback to localStorage
    }

    // 2. Fallback to LocalStorage
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        reservations = JSON.parse(data);
      } else {
        // Seed default sample bookings if completely empty
        reservations = [
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
        saveReservations();
      }
    } catch (e) {
      console.error('Error reading reservations:', e);
      reservations = [];
    }

    updateKPIs();
    renderTable();
  }

  function saveReservations() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch (e) {
      console.error('Error saving reservations:', e);
    }
  }

  // Update KPI Stats Cards
  function updateKPIs() {
    const total = reservations.length;
    let pending = 0;
    let verified = 0;
    let revenue = 0;

    reservations.forEach(r => {
      const status = (r.paymentStatus || '').toLowerCase();
      if (status.includes('pending')) {
        pending++;
      } else if (status.includes('approved') || status.includes('verified')) {
        verified++;
        const amtStr = String(r.totalAmount || '0').replace(/[^0-9]/g, '');
        revenue += parseInt(amtStr, 10) || 0;
      }
    });

    if (statPendingCount) statPendingCount.textContent = pending;
    if (statVerifiedCount) statVerifiedCount.textContent = verified;
    if (statRevenueTotal) statRevenueTotal.textContent = `₹${revenue.toLocaleString('en-IN')}`;
    if (statTotalBookings) statTotalBookings.textContent = total;
  }

  // Filter & Search Logic
  function getFilteredReservations() {
    return reservations.filter(r => {
      // Status filter
      const status = (r.paymentStatus || '').toLowerCase();
      const isCash = (r.paymentMethod || '').toLowerCase() === 'cash' || status.includes('cash');

      if (currentFilter === 'cash' && !isCash) return false;
      if (currentFilter === 'pending' && !status.includes('pending') && !isCash) return false;
      if (currentFilter === 'approved' && !status.includes('approved') && !status.includes('verified')) return false;
      if (currentFilter === 'rejected' && !status.includes('rejected')) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const idMatch = (r.bookingId || '').toLowerCase().includes(q);
        const nameMatch = (r.customer && r.customer.name || '').toLowerCase().includes(q);
        const phoneMatch = (r.customer && r.customer.phone || '').toLowerCase().includes(q);
        const emailMatch = (r.customer && r.customer.email || '').toLowerCase().includes(q);
        const stationMatch = (r.stationName || '').toLowerCase().includes(q);
        const methodMatch = (r.paymentMethod || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !phoneMatch && !emailMatch && !stationMatch && !methodMatch) {
          return false;
        }
      }

      return true;
    });
  }

  // Render Table
  function renderTable() {
    const list = getFilteredReservations();

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (list.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    list.forEach(r => {
      const tr = document.createElement('tr');
      tr.id = `row-${r.bookingId}`;

      const isCash = (r.paymentMethod || '').toLowerCase() === 'cash' || (r.paymentStatus || '').toLowerCase().includes('cash');
      const isApproved = (r.paymentStatus || '').toLowerCase().includes('approved') || (r.paymentStatus || '').toLowerCase().includes('verified');
      const isRejected = (r.paymentStatus || '').toLowerCase().includes('rejected');
      const isPending = !isApproved && !isRejected;

      let statusBadgeClass = 'pending';
      let statusText = 'Pending Verification';
      if (isApproved) {
        statusBadgeClass = 'approved';
        statusText = isCash ? 'Paid (Cash Verified)' : 'Verified / Approved';
      } else if (isRejected) {
        statusBadgeClass = 'rejected';
        statusText = 'Rejected';
      } else if (isCash) {
        statusBadgeClass = 'cash';
        statusText = 'Cash on Arrival';
      }

      // Proof / Payment Mode Preview HTML
      let proofHtml = '<span class="no-proof">None</span>';
      if (isCash) {
        proofHtml = `
          <button type="button" class="badge-cash" data-booking-id="${r.bookingId}" title="Cash on arrival — Click to view desk payment details">
            <span class="cash-dot"></span>
            <span>💵 Cash at Desk</span>
          </button>
        `;
      } else if (r.proof) {
        const imgSrc = (r.proof && r.proof.dataUrl) ? r.proof.dataUrl : 'images/payment-scanner.png';
        proofHtml = `
          <button type="button" class="proof-thumbnail-btn" data-booking-id="${r.bookingId}" title="Click to view full screenshot">
            <img src="${imgSrc}" class="proof-thumb" alt="Proof thumbnail">
            <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">View</span>
          </button>
        `;
      }

      tr.innerHTML = `
        <td><span class="booking-code">${r.bookingId || 'N/A'}</span></td>
        <td>
          <div class="customer-cell">
            <span class="customer-name">${escapeHtml(r.customer && r.customer.name || 'Anonymous')}</span>
            <span class="customer-contact">${escapeHtml(r.customer && r.customer.phone || '')}</span>
            <span class="customer-contact">${escapeHtml(r.customer && r.customer.email || '')}</span>
          </div>
        </td>
        <td>
          <div class="station-cell">
            <span>${getStationIcon(r.stationId)}</span>
            <span>${escapeHtml(r.stationName || 'Gaming Rig')}</span>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600;">${r.date || 'Today'}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${r.slot || ''} (${r.duration || '1 Hr'})</span>
          </div>
        </td>
        <td><span class="amount-cell">${r.totalAmount || '₹0'}</span></td>
        <td>${proofHtml}</td>
        <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
        <td>
          <div class="action-buttons">
            <button type="button" class="btn-action-icon approve" data-action="approve" data-id="${r.bookingId}" title="${isCash ? 'Collect Cash & Confirm' : 'Verify & Approve Payment'}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button type="button" class="btn-action-icon reject" data-action="reject" data-id="${r.bookingId}" title="Reject Payment">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button type="button" class="btn-action-icon delete" data-action="delete" data-id="${r.bookingId}" title="Delete Record">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  function getStationIcon(stationId) {
    if (stationId === 'vip-lounge') return '👑';
    if (stationId === 'console-zone') return '🎮';
    if (stationId === 'racing-sim') return '🏎️';
    return '🖥️';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Toast Notification
  function showToast(msg) {
    if (!adminToast || !toastMessage) return;
    toastMessage.textContent = msg;
    adminToast.classList.add('show');
    setTimeout(() => {
      adminToast.classList.remove('show');
    }, 3200);
  }

  // Update Status Action (Approve / Reject)
  async function updateBookingStatus(bookingId, newStatus) {
    const booking = reservations.find(r => r.bookingId === bookingId);
    if (!booking) return;

    booking.paymentStatus = newStatus;
    saveReservations();
    updateKPIs();
    renderTable();

    // Broadcast across tabs
    try {
      const channel = new BroadcastChannel('lsg_live_sync');
      channel.postMessage({ type: 'BOOKING_UPDATED', booking });
    } catch (e) {}

    // Send PUT request to server API
    try {
      await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
    } catch (e) {}

    if (newStatus === 'Approved') {
      showToast(`Booking ${bookingId} verified and approved!`);
    } else if (newStatus === 'Rejected') {
      showToast(`Booking ${bookingId} marked as rejected.`);
    }
  }

  // Delete Action
  async function deleteBooking(bookingId) {
    if (!confirm(`Are you sure you want to delete booking ${bookingId}?`)) return;
    reservations = reservations.filter(r => r.bookingId !== bookingId);
    saveReservations();
    updateKPIs();
    renderTable();

    // Broadcast across tabs
    try {
      const channel = new BroadcastChannel('lsg_live_sync');
      channel.postMessage({ type: 'BOOKING_DELETED', bookingId });
    } catch (e) {}

    // Send DELETE to server API
    try {
      await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        method: 'DELETE'
      });
    } catch (e) {}

    showToast(`Booking ${bookingId} deleted.`);
  }

  // Table Event Delegation (Approve, Reject, Delete, View Proof)
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.btn-action-icon');
      if (actionBtn) {
        const action = actionBtn.getAttribute('data-action');
        const id = actionBtn.getAttribute('data-id');
        if (action === 'approve') {
          updateBookingStatus(id, 'Approved');
        } else if (action === 'reject') {
          updateBookingStatus(id, 'Rejected');
        } else if (action === 'delete') {
          deleteBooking(id);
        }
        return;
      }

      const proofBtn = e.target.closest('.proof-thumbnail-btn, .badge-cash');
      if (proofBtn) {
        const id = proofBtn.getAttribute('data-booking-id');
        openProofModal(id);
      }
    });
  }

  // Open Proof Modal
  function openProofModal(bookingId) {
    const booking = reservations.find(r => r.bookingId === bookingId);
    if (!booking) return;

    activeModalBooking = booking;

    const isCash = (booking.paymentMethod || '').toLowerCase() === 'cash' || (booking.paymentStatus || '').toLowerCase().includes('cash');

    const modalProofTitle = document.getElementById('modalProofTitle');
    const proofImgWrap = document.getElementById('proofImgWrap');
    const modalProofCashNotice = document.getElementById('modalProofCashNotice');
    const modalProofCashAmount = document.getElementById('modalProofCashAmount');
    const modalProofMethod = document.getElementById('modalProofMethod');

    if (modalProofBookingId) modalProofBookingId.textContent = booking.bookingId;
    if (modalProofCustomer) modalProofCustomer.textContent = booking.customer ? booking.customer.name : 'Unknown';
    if (modalProofAmount) modalProofAmount.textContent = booking.totalAmount || '₹0';
    if (modalProofStation) modalProofStation.textContent = booking.stationName || 'Gaming Rig';
    if (modalProofDate) modalProofDate.textContent = `${booking.date || 'Today'} • ${booking.slot || ''}`;
    if (modalProofStatus) modalProofStatus.textContent = booking.paymentStatus || 'Pending Verification';

    if (isCash) {
      if (modalProofTitle) modalProofTitle.textContent = '💵 Cash on Arrival Verification';
      if (proofImgWrap) proofImgWrap.style.display = 'none';
      if (modalProofCashNotice) modalProofCashNotice.style.display = 'flex';
      if (modalProofCashAmount) modalProofCashAmount.textContent = booking.totalAmount || '₹0';
      if (modalProofMethod) {
        modalProofMethod.textContent = '💵 Cash at Reception Desk';
        modalProofMethod.style.color = '#34d399';
      }
      if (modalApproveBtn) {
        modalApproveBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Collect Cash &amp; Approve
        `;
      }
    } else {
      if (modalProofTitle) modalProofTitle.textContent = '📱 UPI Payment Screenshot Verification';
      if (proofImgWrap) proofImgWrap.style.display = 'flex';
      if (modalProofCashNotice) modalProofCashNotice.style.display = 'none';
      if (modalProofMethod) {
        modalProofMethod.textContent = '📱 UPI / QR Scan';
        modalProofMethod.style.color = 'var(--accent-cyan)';
      }
      const imgSrc = (booking.proof && booking.proof.dataUrl) ? booking.proof.dataUrl : 'images/payment-scanner.png';
      if (fullProofImg) fullProofImg.src = imgSrc;
      if (modalApproveBtn) {
        modalApproveBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Verify &amp; Approve
        `;
      }
    }

    if (proofModal) {
      proofModal.classList.add('active');
    }
  }

  function closeProofModal() {
    if (proofModal) {
      proofModal.classList.remove('active');
    }
    activeModalBooking = null;
  }

  if (closeProofModalBtn) closeProofModalBtn.addEventListener('click', closeProofModal);

  if (modalApproveBtn) {
    modalApproveBtn.addEventListener('click', () => {
      if (activeModalBooking) {
        updateBookingStatus(activeModalBooking.bookingId, 'Approved');
        closeProofModal();
      }
    });
  }

  if (modalRejectBtn) {
    modalRejectBtn.addEventListener('click', () => {
      if (activeModalBooking) {
        updateBookingStatus(activeModalBooking.bookingId, 'Rejected');
        closeProofModal();
      }
    });
  }

  // Filter Tabs Event Listeners
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderTable();
    });
  });

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      renderTable();
    });
  }

  // Refresh Button Listener
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadReservations();
      showToast('Dashboard refreshed with latest bookings.');
    });
  }

  // Export CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (reservations.length === 0) {
        showToast('No reservations to export.');
        return;
      }

      const headers = ['Booking ID', 'Customer Name', 'Phone', 'Email', 'Station', 'Date', 'Time Slot', 'Duration', 'Amount', 'Status', 'Created At'];
      const rows = reservations.map(r => [
        r.bookingId,
        `"${(r.customer && r.customer.name || '').replace(/"/g, '""')}"`,
        r.customer && r.customer.phone || '',
        r.customer && r.customer.email || '',
        `"${(r.stationName || '').replace(/"/g, '""')}"`,
        r.date || '',
        `"${(r.slot || '').replace(/"/g, '""')}"`,
        r.duration || '',
        r.totalAmount || '',
        r.paymentStatus || '',
        r.createdAt || ''
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LSG_Reservations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Exported reservations to CSV!');
    });
  }

  // Clear All Data
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', async () => {
      if (!confirm('Warning: This will clear all reservation history from the portal. Continue?')) return;
      reservations = [];
      saveReservations();
      updateKPIs();
      renderTable();

      try {
        await fetch('/api/bookings', { method: 'DELETE' });
      } catch (e) {}

      showToast('All reservation records cleared.');
    });
  }

  // Walk-in Modal Handlers
  if (addWalkinBtn && walkinModal) {
    addWalkinBtn.addEventListener('click', () => {
      walkinModal.classList.add('active');
    });
  }

  function closeWalkinModal() {
    if (walkinModal) walkinModal.classList.remove('active');
    if (walkinForm) walkinForm.reset();
  }

  if (closeWalkinModalBtn) closeWalkinModalBtn.addEventListener('click', closeWalkinModal);
  if (cancelWalkinBtn) cancelWalkinBtn.addEventListener('click', closeWalkinModal);

  if (walkinForm) {
    walkinForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('walkinName').value.trim();
      const phone = document.getElementById('walkinPhone').value.trim();
      const stationSelect = document.getElementById('walkinStation');
      const stationId = stationSelect.value;
      const stationName = stationSelect.options[stationSelect.selectedIndex].text;
      const duration = parseInt(document.getElementById('walkinDuration').value, 10);
      const rate = parseInt(stationSelect.options[stationSelect.selectedIndex].dataset.rate, 10);
      const totalAmount = `₹${rate * duration}`;
      const paymentMethod = document.getElementById('walkinPaymentMethod')?.value || 'Cash';

      const bookingId = `LSG-WALK-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking = {
        bookingId: bookingId,
        stationId: stationId,
        stationName: stationName,
        date: new Date().toISOString().split('T')[0],
        slot: 'Immediate (Walk-in)',
        duration: `${duration} Hour(s)`,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        customer: {
          name: name,
          phone: phone,
          email: 'counter@lsglan.centre',
          discord: 'Walk-in'
        },
        paymentStatus: 'Approved',
        proof: {
          fileName: `Walk-in (${paymentMethod})`,
          fileSize: 0,
          fileType: paymentMethod.toLowerCase(),
          dataUrl: null,
          note: `Walk-in counter booking paid via ${paymentMethod}`,
          uploadedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      reservations.unshift(newBooking);
      saveReservations();
      updateKPIs();
      renderTable();

      try {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBooking)
        });
      } catch (e) {}

      closeWalkinModal();
      showToast(`Walk-in booking created for ${name}!`);
    });
  }

  // ============================================
  // LIVE REAL-TIME SYNCHRONIZATION ENGINE
  // ============================================

  function handleLiveIncomingBooking(newBooking) {
    if (!newBooking || !newBooking.bookingId) return;

    // Check if already in list
    const exists = reservations.some(r => r.bookingId === newBooking.bookingId);
    if (!exists) {
      reservations.unshift(newBooking);
      saveReservations();
      updateKPIs();
      renderTable();

      // Play alert chime
      playAlertChime();

      // Show alert toast
      const customerName = newBooking.customer ? newBooking.customer.name : 'Customer';
      showToast(`🚨 NEW BOOKING: ${customerName} booked ${newBooking.stationName || 'Rig'} (${newBooking.totalAmount || ''})!`);

      // Highlight the new row
      setTimeout(() => {
        const row = document.getElementById(`row-${newBooking.bookingId}`);
        if (row) {
          row.style.background = 'rgba(6, 214, 160, 0.15)';
          row.style.transition = 'background 1.5s ease';
          setTimeout(() => { row.style.background = ''; }, 3000);
        }
      }, 50);
    }
  }

  // 1. Live BroadcastChannel (0 ms cross-tab sync)
  try {
    const syncChannel = new BroadcastChannel('lsg_live_sync');
    syncChannel.onmessage = (event) => {
      if (event.data) {
        if (event.data.type === 'NEW_BOOKING') {
          handleLiveIncomingBooking(event.data.booking);
        } else if (event.data.type === 'BOOKING_UPDATED') {
          const upd = event.data.booking;
          const target = reservations.find(r => r.bookingId === upd.bookingId);
          if (target) {
            Object.assign(target, upd);
            updateKPIs();
            renderTable();
          }
        } else if (event.data.type === 'BOOKING_DELETED') {
          reservations = reservations.filter(r => r.bookingId !== event.data.bookingId);
          updateKPIs();
          renderTable();
        }
      }
    };
  } catch (e) {}

  // 2. Server-Sent Events (SSE) (Live cross-device / network sync)
  try {
    const sse = new EventSource('/api/live-stream');
    sse.addEventListener('booking_created', (e) => {
      try {
        const newBooking = JSON.parse(e.data);
        handleLiveIncomingBooking(newBooking);
      } catch (err) {}
    });

    sse.addEventListener('booking_updated', (e) => {
      try {
        const upd = JSON.parse(e.data);
        const target = reservations.find(r => r.bookingId === upd.bookingId);
        if (target) {
          Object.assign(target, upd);
          updateKPIs();
          renderTable();
        }
      } catch (err) {}
    });

    sse.addEventListener('booking_deleted', (e) => {
      try {
        const del = JSON.parse(e.data);
        reservations = reservations.filter(r => r.bookingId !== del.bookingId);
        updateKPIs();
        renderTable();
      } catch (err) {}
    });
  } catch (e) {}

  // 3. LocalStorage Event (cross-window storage sync)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.length !== reservations.length) {
          if (parsed.length > reservations.length) {
            playAlertChime();
            showToast('🚨 New booking detected from customer website!');
          }
          reservations = parsed;
          updateKPIs();
          renderTable();
        }
      } catch (err) {}
    }
  });

  // 4. Fast 2-second background poll
  setInterval(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.length !== reservations.length) {
          if (parsed.length > reservations.length) {
            playAlertChime();
            showToast('🚨 New booking detected from customer website!');
          }
          reservations = parsed;
          updateKPIs();
          renderTable();
        }
      }
    } catch (e) {}
  }, 2000);

  // Initial Load
  loadReservations();

});
