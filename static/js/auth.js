const API_URL = 'http://127.0.0.1:5000';

const handleLogin = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            sessionStorage.setItem('theShineLabCurrentUser', JSON.stringify(result.user));
            sessionStorage.setItem('theShineLabUserEmail', email.toLowerCase());

            if (result.user.role === 'owner') {
                window.location.href = 'dashboard-owner.html';
            } else {
                window.location.href = 'dashboard-user.html';
            }
        } else {
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
            if (showViewCallback) showViewCallback('loginView'); 
        } else {
            alert(result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    } catch (error) {
        console.error('Registration Error:', error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
};