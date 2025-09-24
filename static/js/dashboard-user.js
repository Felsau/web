document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH CHECK ---
    const currentUserEmail = sessionStorage.getItem('theShineLabUserEmail');
    const currentUser = JSON.parse(sessionStorage.getItem('theShineLabCurrentUser'));
    if (!currentUserEmail || !currentUser) {
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
    const bookingsTbody = document.getElementById('user-bookings-tbody');
    const bookingForm = document.getElementById('bookingForm');
    const profileForm = document.getElementById('profileForm');
    const vehicleForm = document.getElementById('vehicleForm');
    const vehiclesTbody = document.getElementById('vehicles-tbody');
    const loyaltyPointsEl = document.getElementById('loyaltyPoints');
    const toastEl = document.getElementById('toast');
    const bookingDetailModal = document.getElementById('bookingDetailModal');
    const reviewModal = document.getElementById('reviewModal');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    const reviewForm = document.getElementById('reviewForm');
    const ratingStars = [...document.querySelectorAll('.rating .fa-star')];

    // --- GLOBAL STATE ---
    // ตัวแปรสำหรับเก็บข้อมูลผู้ใช้ที่ได้จาก API
    let userData = { bookings: [], vehicles: [] }; 

    // --- REMOVED ---
    // โค้ดที่เกี่ยวข้องกับ localStorage ทั้งหมดถูกลบออกไป
    // let allUsers = JSON.parse(localStorage.getItem('theShineLabUsers'));
    // const saveData = () => { ... }

    // --- UTILITY FUNCTIONS (Toast, Modals) ---
    const showToast = (message, type = 'success') => {
        toastEl.textContent = message;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => { toastEl.className = toastEl.className.replace('show', ''); }, 3000);
    };

    const openModal = (modalId) => document.getElementById(modalId).style.display = 'block';
    const closeModal = (modalId) => document.getElementById(modalId).style.display = 'none';

    // --- RENDER FUNCTIONS ---
    // ฟังก์ชัน Render จะใช้ข้อมูลจากตัวแปร userData แทน
    const renderBookings = () => {
        bookingsTbody.innerHTML = '';
        if (!userData.bookings || userData.bookings.length === 0) {
            bookingsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">คุณยังไม่มีรายการจอง</td></tr>`;
            return;
        }
        const sortedBookings = [...userData.bookings].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedBookings.forEach(booking => {
            let actions = `<button class="btn btn-sm" onclick="viewBookingDetail('${booking.id}')">ดูรายละเอียด</button>`;
            if (booking.status === 'เสร็จสิ้น' && !booking.review) {
                actions += ` <button class="btn btn-sm btn-secondary" onclick="openReviewModal('${booking.id}')">ให้คะแนน</button>`;
            } else if (booking.status === 'กำลังดำเนินการ') {
                actions += ` <button class="btn btn-sm btn-danger" onclick="cancelBooking('${booking.id}')">ยกเลิก</button>`;
            }

            bookingsTbody.innerHTML += `
                <tr>
                    <td>${booking.service}</td>
                    <td>${booking.date}</td>
                    <td>${booking.vehicle}</td>
                    <td><span class="status-badge status-${booking.status.replace(/\s+/g, '-').toLowerCase()}">${booking.status}</span></td>
                    <td>${actions}</td>
                </tr>`;
        });
    };

    const renderVehicles = () => {
        vehiclesTbody.innerHTML = '';
        if (!userData.vehicles || userData.vehicles.length === 0) {
            vehiclesTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">คุณยังไม่ได้เพิ่มรถยนต์</td></tr>`;
            return;
        }
        userData.vehicles.forEach(vehicle => {
            vehiclesTbody.innerHTML += `
                <tr>
                    <td>${vehicle.name}</td>
                    <td>${vehicle.plate}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle.id}')">ลบ</button></td>
                </tr>`;
        });
    };

    const populateProfileForm = () => {
        if(userData) {
            profileForm.profileName.value = userData.name || '';
            profileForm.profileEmail.value = currentUserEmail;
        }
    };
    
    // --- API CALL & DATA HANDLING ---
    // ฟังก์ชันหลักสำหรับโหลดข้อมูลทั้งหมดของผู้ใช้จากเซิร์ฟเวอร์
    // --- DATA FETCHING FUNCTIONS ---
    const loadUserData = async () => {
        try {
            // เรียก API ไปยัง Backend ที่เราสร้างขึ้นใหม่
            const response = await fetch(`${API_URL}/api/user_data?email=${currentUserEmail}`);
            const result = await response.json();

            if (response.ok && result.success) {
                // เมื่อได้รับข้อมูลแล้ว ให้อัปเดตตัวแปร userData
                userData = result.user;
                // เรียกฟังก์ชัน render เพื่อแสดงผลข้อมูลลงบนตาราง
                renderBookings();
                renderVehicles();
                // อัปเดตข้อมูลอื่นๆ เช่น แต้มสะสม
                loyaltyPointsEl.textContent = userData.points || 0;
            } else {
                throw new Error(result.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
            }
        } catch (error) {
            console.error('Load user data error:', error);
            showToast(error.message, 'error');
            // แสดงผลว่าไม่มีข้อมูลหากโหลดไม่สำเร็จ
            bookingsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
            vehiclesTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
        }
    };

    // --- EVENT LISTENERS (Updated to call APIs) ---

    // Booking Form Submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);
        const bookingData = Object.fromEntries(formData.entries());
        bookingData.addons = formData.getAll('addons'); // รับค่า addon ที่เป็น array
        bookingData.price = parseFloat(document.getElementById('estimated-price').textContent);
        
        try {
            const response = await fetch(`${API_URL}/api/bookings/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, bookingDetails: bookingData })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Server error');
            
            showToast('ทำการจองสำเร็จแล้ว!');
            bookingForm.reset();
            loadUserData(); // โหลดข้อมูลใหม่ทั้งหมดเพื่อให้ UI อัปเดต
            
        } catch (error) {
            console.error('Booking submission error:', error);
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    });

    // Profile Form Submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = profileForm.profileName.value;
        const newPassword = profileForm.profilePassword.value;

        try {
            const response = await fetch(`${API_URL}/api/profile/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, name: newName, password: newPassword })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            // อัปเดตข้อมูลใน sessionStorage ด้วยเพื่อให้ชื่อที่ header ถูกต้อง
            const updatedUser = JSON.parse(sessionStorage.getItem('theShineLabCurrentUser'));
            updatedUser.name = newName;
            sessionStorage.setItem('theShineLabCurrentUser', JSON.stringify(updatedUser));
            userNameEl.textContent = `สวัสดี, ${newName}`;
            
            showToast('อัปเดตข้อมูลส่วนตัวสำเร็จ');
            profileForm.profilePassword.value = '';
            profileForm.profilePasswordConfirm.value = '';

        } catch (error) {
             console.error('Profile update error:', error);
             showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    });

    // Vehicle Form Submission
    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicleName = vehicleForm.vehicleName.value;
        const vehiclePlate = vehicleForm.vehiclePlate.value;

        try {
            const response = await fetch(`${API_URL}/api/vehicles/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, name: vehicleName, plate: vehiclePlate })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            showToast('เพิ่มรถยนต์สำเร็จ');
            vehicleForm.reset();
            loadUserData(); // โหลดข้อมูลใหม่เพื่ออัปเดตตารางและ dropdown

        } catch (error) {
            console.error('Add vehicle error:', error);
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    });

    // --- Window-scoped functions for onclick events ---
    window.deleteVehicle = async (vehicleId) => {
        if (!confirm('คุณต้องการลบรถคันนี้ใช่หรือไม่?')) return;
        try {
            const response = await fetch(`${API_URL}/api/vehicles/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail, vehicleId: vehicleId })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            showToast('ลบรถยนต์เรียบร้อยแล้ว');
            loadUserData();

        } catch (error) {
            console.error('Delete vehicle error:', error);
            showToast(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
        }
    };

    window.cancelBooking = async (bookingId) => {
        // Implement cancellation logic by calling an API endpoint
        showToast('ฟังก์ชันยกเลิกยังไม่ได้เชื่อมต่อ API', 'error');
    };

    window.viewBookingDetail = (bookingId) => {
        // Implement view detail logic
        showToast('ฟังก์ชันดูรายละเอียดยังไม่ได้เชื่อมต่อ API', 'error');
    };
    
    window.openReviewModal = (bookingId) => {
        reviewForm.reviewBookingId.value = bookingId;
        openModal('reviewModal');
    };
    
    // Other event listeners (logout, modals, tabs)
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.modal));
    });

    // --- INITIALIZATION ---
    userNameEl.textContent = `สวัสดี, ${currentUser.name}`;
    loadUserData(); // <<<< เรียกฟังก์ชันนี้เพื่อเริ่มโหลดข้อมูลจากเซิร์ฟเวอร์
});