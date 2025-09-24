document.addEventListener('DOMContentLoaded', () => {
    // DOM Selections
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const servicesContainer = document.getElementById('services-container');
    const faqContainer = document.querySelector('.faq-accordion');

    // --- UI Functions ---
    const showView = (viewId) => {
        document.getElementById('main-content').style.display = 'none';
        document.querySelectorAll('.page-view').forEach(v => v.style.display = 'none');
        document.getElementById(viewId).style.display = 'block';
    };

    const showMainContent = () => {
        document.querySelectorAll('.page-view').forEach(v => v.style.display = 'none');
        document.getElementById('main-content').style.display = 'block';
    };

    const updateNavUI = () => {
        const currentUser = JSON.parse(sessionStorage.getItem('theShineLabCurrentUser'));
        if (currentUser) {
            document.getElementById('loggedOutNav').style.display = 'none';
            document.getElementById('loggedInNav').style.display = 'flex';
            document.getElementById('userName').textContent = currentUser.name;
        } else {
            document.getElementById('loggedOutNav').style.display = 'flex';
            document.getElementById('loggedInNav').style.display = 'none';
        }
    };

    // --- EVENT LISTENERS (Updated for Flask API) ---

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { // <-- เพิ่ม async
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            // เรียกใช้ handleLogin จาก auth.js ซึ่งตอนนี้เป็น async function
            await handleLogin(email, password); // <-- เพิ่ม await
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => { // <-- เพิ่ม async
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            // เรียกใช้ handleRegister จาก auth.js ซึ่งตอนนี้เป็น async function
            await handleRegister(name, email, password, showView); // <-- เพิ่ม await
        });
    }

    // Navigation and other UI clicks (เหมือนเดิม)
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('#loginNavBtn')) showView('loginView');
        if (e.target.matches('#registerNavBtn')) showView('registerView');
        if (e.target.matches('#goToRegister')) showView('registerView');
        if (e.target.matches('#goToLogin')) showView('loginView');
        if (e.target.matches('.open-booking-redirect')) {
            // ตรวจสอบว่า login หรือยัง ถ้ายังให้ไปหน้า login
            if (sessionStorage.getItem('theShineLabCurrentUser')) {
                 window.location.href = 'dashboard-user.html#booking';
            } else {
                showView('loginView');
            }
        }
        if (e.target.matches('.logo') || e.target.closest('.logo')) {
            e.preventDefault();
            showMainContent();
        }
        if (e.target.matches('#logoutNavBtn')) {
            sessionStorage.clear();
            updateNavUI();
            showMainContent();
        }
        if (e.target.matches('#dashboardNavBtn')) {
            const user = JSON.parse(sessionStorage.getItem('theShineLabCurrentUser'));
            if (user.role === 'owner') window.location.href = 'dashboard-owner.html';
            else window.location.href = 'dashboard-user.html';
        }
    });


    // --- STATIC CONTENT RENDERING (เหมือนเดิม) ---
    // ข้อมูลส่วนนี้ยังคงไว้เพื่อแสดงผลในหน้าแรก ไม่ต้องลบ
    const services = [
        { id: 'shine_protect', title: 'Shine & Protect', description: 'แพ็คเกจล้างสีดูดฝุ่นพื้นฐานสำหรับรถคุณ', features: ['ล้างสีด้วยแชมพูสูตรพรีเมียม', 'ดูดฝุ่นภายในห้องโดยสาร', 'เช็ดทำความสะอาดคอนโซล', 'เคลือบเงายาง'], img: 'https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?q=80&w=1200&auto=format&fit=crop', prices: { sedan: 490, suv: 590, pickup: 690, van: 790 } },
        { id: 'deep_clean', title: 'Deep Clean Interior', description: 'ทำความสะอาดภายในเต็มรูปแบบ คืนความใหม่', features: ['ฟอกเบาะผ้า/ทำความสะอาดเบาะหนัง', 'ซักพรมและอบโอโซนฆ่าเชื้อ', 'ทำความสะอาดแผงประตูและเพดาน', 'เคลือบคอนโซลด้วยน้ำยาพรีเมียม'], img: 'https://images.unsplash.com/photo-1596279093318-132b405ed841?q=80&w=1200&auto=format&fit=crop', prices: { sedan: 1290, suv: 1490, pickup: 1590, van: 1890 } },
        { id: 'ultimate_gloss', title: 'Ultimate Gloss', description: 'ขัดเคลือบสี ลบรอย เพิ่มความเงางามฉ่ำวาว', features: ['ขัดลบรอยขนแมวด้วยระบบ DA', 'เคลือบสีด้วย Premium Wax', 'ฟื้นฟูสภาพพลาสติกภายนอก', 'รวมแพ็คเกจ Shine & Protect'], img: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1200&auto=format&fit=crop', prices: { sedan: 2500, suv: 3000, pickup: 3200, van: 3500 } }
    ];

    if (servicesContainer) {
        services.forEach(service => {
            servicesContainer.innerHTML += `
            <div class="service-card">
                <img src="${service.img}" alt="${service.title}" class="service-img">
                <div class="service-content">
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    <ul>${service.features.map(f => `<li>${f}</li>`).join('')}</ul>
                    <div class="service-footer">
                        <span class="price">เริ่มต้น ${service.prices.sedan.toLocaleString()}฿</span>
                        <button class="btn btn-secondary open-booking-redirect">จองเลย</button>
                    </div>
                </div>
            </div>`;
        });
    }

    const faqs = [
        { q: 'ใช้เวลาล้างรถนานแค่ไหน?', a: 'โดยปกติ แพ็คเกจ Shine & Protect จะใช้เวลาประมาณ 45-60 นาที ส่วนแพ็คเกจที่ใหญ่ขึ้นอย่าง Deep Clean หรือ Ultimate Gloss จะใช้เวลา 3-6 ชั่วโมง ขึ้นอยู่กับขนาดและสภาพรถครับ' },
        { q: 'ต้องจองคิวล่วงหน้าหรือไม่?', a: 'เราขอแนะนำให้ลูกค้าทำการจองคิวล่วงหน้าผ่านเว็บไซต์ เพื่อความสะดวกและเป็นการยืนยันว่าท่านจะได้รับบริการในเวลาที่ต้องการแน่นอนครับ' },
        { q: 'ใช้น้ำยาอะไรในการล้าง?', a: 'เราเลือกใช้ผลิตภัณฑ์ดูแลรถยนต์คุณภาพสูงที่นำเข้าจากต่างประเทศ เป็นมิตรต่อสีรถและสิ่งแวดล้อม เพื่อให้รถของคุณได้รับการดูแลที่ดีที่สุดครับ' }
    ];

    if (faqContainer) {
        faqs.forEach(faq => {
            faqContainer.innerHTML += `
            <div class="faq-item">
                <button class="faq-question">${faq.q}<span class="faq-icon">+</span></button>
                <div class="faq-answer"><p>${faq.a}</p></div>
            </div>`;
        });
        faqContainer.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.nextElementSibling;
                const icon = button.querySelector('.faq-icon');
                answer.style.maxHeight ? answer.style.maxHeight = null : answer.style.maxHeight = answer.scrollHeight + "px";
                icon.textContent = icon.textContent === '+' ? '-' : '+';
            });
        });
    }
    
    // --- INITIALIZATION ---
    updateNavUI(); // ตรวจสอบสถานะการล็อกอินเมื่อหน้าเว็บโหลด
});
