from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS

# สร้าง Flask App และระบุโฟลเดอร์
app = Flask(__name__, static_folder='static', template_folder='templates')
# อนุญาตให้ Frontend (จากทุก Origin) เรียก API มาได้
CORS(app)

# --- จำลองฐานข้อมูล ---
# (ส่วนนี้เหมือนเดิม)
db_users = {
    'user@test.com': {
        'name': 'สมชาย ใจดี',
        'password': '123',
        'role': 'user',
        'bookings': [
            { 'id': 'bk1722839481', 'date': '2025-09-15', 'service': 'Deep Clean Interior', 'vehicle': 'Toyota Fortuner', 'addons': ['อบโอโซนฆ่าเชื้อ'], 'price': 1790, 'status': 'เสร็จสิ้น' },
            { 'id': 'bk1721839482', 'date': '2025-08-22', 'service': 'Shine & Protect', 'vehicle': 'Honda Civic', 'addons': [], 'price': 490, 'status': 'เสร็จสิ้น' }
        ]
    },
    'anotheruser@test.com': {
        'name': 'สมหญิง จริงใจ',
        'password': '456',
        'role': 'user',
        'bookings': [
            { 'id': 'bk1732839555', 'date': '2025-01-10', 'service': 'Ultimate Gloss', 'vehicle': 'Mercedes-Benz C-Class', 'addons': ['เคลือบกระจก', 'ขัดโคมไฟหน้า'], 'price': 3280, 'status': 'กำลังดำเนินการ' }
        ],
        'vehicles': [{'id': 1, 'name': 'Mercedes-Benz C-Class', 'plate': 'กท 9999'}],
        'points': 480
    },
    'owner@theshinelab.com': { 'name': 'เจ้าของร้าน', 'password': 'admin', 'role': 'owner' }
}

# --- ROUTES สำหรับแสดงผลหน้าเว็บ (HTML) ---

# เพิ่ม Route นี้เข้าไป
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard-user.html')
def dashboard_user():
    return render_template('dashboard-user.html')

@app.route('/dashboard-owner.html')
def dashboard_owner():
    return render_template('dashboard-owner.html')

# --- API ENDPOINTS ---
# (ส่วน API ทั้งหมดให้คงไว้เหมือนเดิม)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email').lower()
    password = data.get('password')
    user = db_users.get(email)

    if user and user['password'] == password:
        # ไม่ส่งรหัสผ่านกลับไป
        user_data_to_send = user.copy()
        user_data_to_send.pop('password')
        return jsonify({'success': True, 'user': user_data_to_send})
    else:
        return jsonify({'success': False, 'message': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'}), 401
# ... (โค้ด API ที่เหลือ) ...

# API สำหรับดึงข้อมูลการจองทั้งหมด (สำหรับ Owner)
@app.route('/api/bookings', methods=['GET'])
def get_all_bookings():
    all_bookings = []
    for email, user in db_users.items():
        if user.get('role') == 'user' and 'bookings' in user:
            for index, booking in enumerate(user['bookings']):
                # เพิ่มข้อมูลที่จำเป็นสำหรับ Frontend
                booking_with_context = booking.copy()
                booking_with_context['customerName'] = user['name']
                booking_with_context['userEmail'] = email
                booking_with_context['bookingIndex'] = index
                all_bookings.append(booking_with_context)
    return jsonify(all_bookings)

# API สำหรับดึงข้อมูลเฉพาะของ User ที่ล็อกอิน
@app.route('/api/user_data', methods=['GET'])
def get_user_data():
    # ดึง email ของ user ที่ส่งมาจาก frontend ผ่าน query parameter
    user_email = request.args.get('email')
    if not user_email:
        return jsonify({'success': False, 'message': 'ไม่พบอีเมล'}), 400

    # ค้นหา user ใน db_users
    user = db_users.get(user_email.lower())
    
    if user:
        # ส่งข้อมูล user กลับไป (ไม่ควรส่งรหัสผ่านไปด้วย)
        user_data_to_send = user.copy()
        user_data_to_send.pop('password', None) 
        return jsonify({'success': True, 'user': user_data_to_send})
    else:
        return jsonify({'success': False, 'message': 'ไม่พบข้อมูลผู้ใช้'}), 404
    
# API สำหรับสมัครสมาชิกใหม่
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email', '').lower()
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'กรุณากรอกข้อมูลให้ครบถ้วน'}), 400

    if email in db_users:
        return jsonify({'success': False, 'message': 'อีเมลนี้ถูกใช้งานแล้ว'}), 409

    # เพิ่ม user ใหม่เข้าไปใน "ฐานข้อมูล"
    db_users[email] = {
        'name': name,
        'password': password,
        'role': 'user',
        'bookings': [],
        'vehicles': [],
        'points': 0
    }
    
    return jsonify({'success': True, 'message': 'สมัครสมาชิกสำเร็จ'})
# API สำหรับดึงรายชื่อลูกค้าทั้งหมด (สำหรับ Owner)
@app.route('/api/customers', methods=['GET'])
def get_all_customers():
    customers = []
    for email, user in db_users.items():
        if user.get('role') == 'user':
            customers.append({
                'name': user['name'],
                'email': email,
                'bookingCount': len(user.get('bookings', []))
            })
    return jsonify(customers)

# API สำหรับอัปเดตสถานะการจอง (สำหรับ Owner)
@app.route('/api/update_booking_status', methods=['PUT'])
def update_booking_status():
    data = request.get_json()
    user_email = data.get('userEmail')
    booking_index = data.get('bookingIndex')
    new_status = data.get('newStatus')
    
    try:
        # อัปเดตข้อมูลใน "ฐานข้อมูล" ของเรา
        db_users[user_email]['bookings'][booking_index]['status'] = new_status
        return jsonify({'success': True, 'message': 'อัปเดตสถานะเรียบร้อย'})
    except (KeyError, IndexError):
        return jsonify({'success': False, 'message': 'ไม่พบข้อมูลการจอง'}), 404

# --- สั่งให้ Server ทำงาน ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)