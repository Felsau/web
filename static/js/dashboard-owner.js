document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH CHECK ---
    const currentUser = JSON.parse(sessionStorage.getItem('theShineLabCurrentUser'));
    if (!currentUser || currentUser.role !== 'owner') {
        window.location.href = 'index.html';
        return;
    }

    // --- CONFIGURATION ---
    const API_URL = 'http://127.0.0.1:5000'; // URL ของ Flask Server

    // --- DOM SELECTIONS ---
    const userNameEl = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutNavBtn');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const allBookingsTbody = document.getElementById('all-bookings-tbody');
    const customersTbody = document.getElementById('customers-tbody');
    const notificationEl = document.getElementById('notification');
    const bookingSearchInput = document.getElementById('booking-search');
    const statusFilterSelect = document.getElementById('status-filter');
    const customerSearchInput = document.getElementById('customer-search');
    
    // --- GLOBAL STATE ---
    let allBookingsData = [];
    let allCustomersData = [];

    // --- UTILITY FUNCTIONS ---
    const showNotification = (message, type = 'success') => {
        notificationEl.textContent = message;
        notificationEl.style.backgroundColor = type === 'error' ? '#dc3545' : '#28a745';
        notificationEl.classList.add('show');
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    };

    // --- RENDER FUNCTIONS ---
    const renderAllBookings = () => {
        const searchQuery = bookingSearchInput.value.toLowerCase();
        const statusFilter = statusFilterSelect.value;
        allBookingsTbody.innerHTML = '';

        const filteredBookings = allBookingsData.filter(booking => {
            const matchesSearch = booking.customerName.toLowerCase().includes(searchQuery);
            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        filteredBookings.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest first

        if (filteredBookings.length === 0) {
            allBookingsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">ไม่พบข้อมูลการจอง</td></tr>`;
            return;
        }

        const bookingStatusOptions = ['กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'];
        filteredBookings.forEach((booking, index) => {
            const statusOptions = bookingStatusOptions.map(s => 
                `<option value="${s}" ${s === booking.status ? 'selected' : ''}>${s}</option>`
            ).join('');

            allBookingsTbody.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${booking.customerName}</td>
                <td>${booking.service}</td>
                <td>${booking.price.toLocaleString()}฿</td>
                <td>${booking.date}</td>
                <td>
                    <select class="status-select" data-user-email="${booking.userEmail}" data-booking-index="${booking.bookingIndex}">
                        ${statusOptions}
                    </select>
                </td>
            </tr>`;
        });
    };

    const renderCustomers = () => {
        const searchQuery = customerSearchInput.value.toLowerCase();
        customersTbody.innerHTML = '';

        const filteredCustomers = allCustomersData.filter(customer => {
            return customer.name.toLowerCase().includes(searchQuery) || customer.email.toLowerCase().includes(searchQuery);
        });

        if (filteredCustomers.length === 0) {
            customersTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">ไม่พบข้อมูลลูกค้า</td></tr>`;
            return;
        }

        filteredCustomers.forEach(customer => {
            customersTbody.innerHTML += `<tr>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.bookingCount}</td>
            </tr>`;
        });
    };

    const calculateAnalytics = () => {
        const totalRevenue = allBookingsData.filter(b => b.status === 'เสร็จสิ้น').reduce((sum, b) => sum + b.price, 0);
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = allBookingsData.filter(b => b.date === today).length;
        
        document.getElementById('total-revenue').textContent = `${totalRevenue.toLocaleString()}฿`;
        document.getElementById('today-bookings').textContent = todayBookings;
        document.getElementById('total-customers').textContent = allCustomersData.length;
    };

    // --- API CALLS & DATA HANDLING ---
    const loadDashboardData = async () => {
        try {
            const [bookingsRes, customersRes] = await Promise.all([
                fetch(`${API_URL}/api/bookings`),
                fetch(`${API_URL}/api/customers`)
            ]);

            if (!bookingsRes.ok || !customersRes.ok) {
                throw new Error('Failed to fetch data from server');
            }

            allBookingsData = await bookingsRes.json();
            allCustomersData = await customersRes.json();
            
            renderAllBookings();
            renderCustomers();
            calculateAnalytics();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            allBookingsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูลจากเซิร์ฟเวอร์</td></tr>`;
            customersTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
        }
    };
    
    // --- EVENT LISTENERS ---
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetTab = document.getElementById(tab.dataset.tab);
            tabContents.forEach(tc => tc.classList.remove('active'));
            targetTab.classList.add('active');
        });
    });

    allBookingsTbody.addEventListener('change', async (e) => {
        if (e.target.classList.contains('status-select')) {
            const newStatus = e.target.value;
            const userEmail = e.target.dataset.userEmail;
            const bookingIndex = parseInt(e.target.dataset.bookingIndex, 10);
            
            try {
                const response = await fetch(`${API_URL}/api/update_booking_status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userEmail, bookingIndex, newStatus })
                });

                const result = await response.json();
                if (result.success) {
                    // Update local data to reflect the change immediately
                    const bookingToUpdate = allBookingsData.find(b => b.userEmail === userEmail && b.bookingIndex === bookingIndex);
                    if (bookingToUpdate) bookingToUpdate.status = newStatus;
                    
                    calculateAnalytics();
                    showNotification('อัปเดตสถานะเรียบร้อย');
                } else {
                    throw new Error(result.message || 'Failed to update status');
                }
            } catch (error) {
                console.error('Failed to update status:', error);
                showNotification('เกิดข้อผิดพลาดในการอัปเดต', 'error');
                // Optional: revert the select box back to its original value
                loadDashboardData(); 
            }
        }
    });

    bookingSearchInput.addEventListener('input', renderAllBookings);
    statusFilterSelect.addEventListener('change', renderAllBookings);
    customerSearchInput.addEventListener('input', renderCustomers);

    // --- INITIALIZATION ---
    userNameEl.textContent = `สวัสดี, ${currentUser.name} (Admin)`;
    loadDashboardData();
});