// ===== DATA (DATABASE SIMULATION) =====

const services = [
  { id: 'shine_protect', title: 'Shine & Protect', description: 'แพ็คเกจล้างสีดูดฝุ่นพื้นฐานสำหรับรถคุณ', features: ['ล้างสีด้วยแชมพูสูตรพรีเมียม', 'ดูดฝุ่นภายในห้องโดยสาร', 'เช็ดทำความสะอาดคอนโซล', 'เคลือบเงายาง'], img: 'https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?q=80&w=1200&auto=format&fit=crop', prices: { sedan: 490, suv: 590, pickup: 690, van: 790 } },
  { id: 'deep_clean', title: 'Deep Clean Interior', description: 'ทำความสะอาดภายในเต็มรูปแบบ คืนความใหม่', features: ['ฟอกเบาะผ้า/ทำความสะอาดเบาะหนัง', 'ซักพรมและอบโอโซนฆ่าเชื้อ', 'ทำความสะอาดแผงประตูและเพดาน', 'เคลือบคอนโซลด้วยน้ำยาพรีเมียม'], img: 'https://images.unsplash.com/photo-1596279093318-132b405ed841?q=80&w=1200&auto=format&fit=crop', prices: { sedan: 1290, suv: 1490, pickup: 1590, van: 1890 } },
  { id: 'ultimate_gloss', title: 'Ultimate Gloss', description: 'ขัดเคลือบสีระดับพรีเมียมเพื่อความเงางามสูงสุด', features: ['ล้างสีและลงดินน้ำมัน', 'ขัดลบริ้วรอยด้วยเครื่องขัดสี', 'เคลือบสีด้วย Premium Wax', 'เคลือบกระจกและพลาสติกภายนอก'], img: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1200&auto=format&fit=crop', prices: { sedan: 2500, suv: 3000, pickup: 3200, van: 3500 } }
];
const vehicleTypes = [ { id: 'sedan', name: 'รถเก๋ง (Sedan)' }, { id: 'suv', name: 'รถ SUV / Crossover' }, { id: 'pickup', name: 'รถกระเบะ (Pickup Truck)' }, { id: 'van', name: 'รถตู้ (Van / MPV)' } ];
const addons = [ { id: 'ozone', name: 'อบโอโซนฆ่าเชื้อ', price: 300 }, { id: 'tar', name: 'ขจัดคราบยางมะตอย', price: 400 }, { id: 'headlight', name: 'ขัดโคมไฟหน้า', price: 800 } ];
const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// --- Mock Database for Users and Bookings ---
// ข้อมูลเริ่มต้นสำหรับ users (จะถูกใช้ถ้าไม่มีข้อมูลใน localStorage)
const users = {
    'user@test.com': {
        name: 'สมชาย ใจดี',
        password: '123',
        role: 'user',
        points: 150,
        vehicles: [
            { id: 1, name: 'Honda Civic', plate: 'กท 1234' },
            { id: 2, name: 'Toyota Fortuner', plate: 'ชล 5678' }
        ],
        bookings: [
            { id: 'bk1722839481', date: '2025-09-15', service: 'Deep Clean Interior', vehicle: 'Toyota Fortuner', addons: ['อบโอโซนฆ่าเชื้อ'], price: 1790, status: 'เสร็จสิ้น', review: null },
            { id: 'bk1721839482', date: '2025-08-22', service: 'Shine & Protect', vehicle: 'Honda Civic', addons: [], price: 490, status: 'เสร็จสิ้น', review: { rating: 5, comment: 'บริการดีมากครับ' } }
        ]
    },
    'owner@theshinelab.com': { name: 'เจ้าของร้าน', password: 'admin', role: 'owner' }
};

// --- Reviews ---
// ในตัวอย่างนี้ review จะถูกเก็บใน booking object ของ user แต่ในระบบจริงอาจจะแยกตาราง
const reviews = [
    { bookingId: 'bk1721839482', userName: 'สมชาย ใจดี', rating: 5, comment: 'บริการดีมากครับ สะอาดเหมือนได้รถใหม่เลย' }
];

// --- Initialize Database ---
// ฟังก์ชันสำหรับตรวจสอบว่ามีข้อมูล users ใน localStorage หรือยัง
// ถ้ายังไม่มี ให้ใช้ข้อมูลเริ่มต้นจากตัวแปร users ด้านบน
const initDatabase = () => {
    if (!localStorage.getItem('theShineLabUsers')) {
        localStorage.setItem('theShineLabUsers', JSON.stringify(users));
    }
};

// เรียกใช้ฟังก์ชันนี้เพื่อให้แน่ใจว่ามีข้อมูลเสมอ
initDatabase();