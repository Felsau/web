// ===== AUTHENTICATION LOGIC (UPDATED FOR FLASK API) =====

const API_URL = 'http://127.0.0.1:5000'; // URL ของ Flask Server

const handleLogin = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // บันทึกข้อมูล user ที่ได้จาก API ลง sessionStorage
            sessionStorage.setItem('theShineLabCurrentUser', JSON.stringify(result.user));
            sessionStorage.setItem('theShineLabUserEmail', email.toLowerCase());

            // ส่งต่อไปยังหน้า Dashboard
            if (result.user.role === 'owner') {
                window.location.href = 'dashboard-owner.html';
            } else {
                window.location.href = 'dashboard-user.html';
            }
        } else {
            // แสดงข้อความ error ที่ได้จาก Server
            alert(result.message || 'เกิดข้อผิดพลาดในการล็อกอิน');
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
};

const handleRegister = async (name, email, password, showViewCallback) => {
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
            alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
            // สลับไปหน้า Login ให้ผู้ใช้กรอกข้อมูลอีกครั้ง
            showViewCallback('loginView'); 
        } else {
            alert(result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    } catch (error) {
        console.error('Register Error:', error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
};