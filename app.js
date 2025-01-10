const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./backend/js/db.js');
const app = express();
const bodyParser = require('body-parser');
const PORT = 3000;
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

app.use(cors({ origin: '*' }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
    }
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// mengkonfigurasi transport untuk mengirim email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'backend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'index.html'));
});

app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'profil.html'));
});

app.get('/sejarah_singkat', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'sejarah_singkat.html'));
});

app.get('/visi_misi', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'visi_misi.html'));
});

app.get('/contact_us', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'contact_us.html'));
});

app.get('/fasilitas', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'fasilitas.html'));
});

app.get('/detail-pegawai', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'detail-pegawai.html'));
});

app.get('/mading', (req, res) => {
    res.sendFile(path.join(__dirname,'frontend', 'html', 'mading.html'));
});

app.get('/mading-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'mading-detail.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'login.html'));
});

app.get('/lupapassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'html', 'lupapassword.html'));
});

app.post('/api/login', async (req, res) => {
    const { username, password, login_sebagai } = req.body;
    try {
        let query = '';
        let params = [];
        let userRole = '';
        if (login_sebagai === 'Pegawai') {
            query = `SELECT p.nip, p.nama_pegawai, p.password, r.nama_role, p.tempat_lahir, p.tanggal_lahir, p.nik, p.tanggal_mulai_tugas, p.jenjang_pendidikan, p.jurusan, p.golongan, p.nuptk
                     FROM pegawai p
                     JOIN pegawai_roles pr ON p.nip = pr.nip
                     JOIN roles r ON pr.role_id = r.id 
                     WHERE p.nip = ?`;
            params = [username];
        } else if (login_sebagai === 'Siswa') {
            query = 'SELECT * FROM siswa WHERE nisn = ?';
            params = [username];
        } else {
            return res.status(400).json({ message: 'Login sebagai tidak valid' });
        }
        const [user] = await db.query(query, params);
        if (user.length > 0) {
            if (login_sebagai === 'Pegawai' && password === user[0].password) {
                userRole = user[0].nama_role;
                req.session.user = {
                    id: user[0].nip,
                    name: user[0].nama_pegawai,
                    role: userRole,
                    login_sebagai: login_sebagai,
                    tempat_lahir: user[0].tempat_lahir,
                    tanggal_lahir: user[0].tanggal_lahir,
                    nik: user[0].nik,
                    tanggal_mulai_tugas: user[0].tanggal_mulai_tugas,
                    jenjang_pendidikan: user[0].jenjang_pendidikan,
                    jurusan: user[0].jurusan,
                    golongan: user[0].golongan,
                    nuptk: user[0].nuptk
                };
                console.log("Session after login:", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: {
                        id: user[0].nip,
                        name: user[0].nama_pegawai,
                        role: userRole,
                        login_sebagai: login_sebagai,
                        tempat_lahir: user[0].tempat_lahir,
                        tanggal_lahir: user[0].tanggal_lahir,
                        tanggal_mulai_tugas: user[0].tanggal_mulai_tugas,
                        jenjang_pendidikan: user[0].jenjang_pendidikan,
                        jurusan: user[0].jurusan,
                        golongan: user[0].golongan,
                        nuptk: user[0].nuptk
                    }
                });
            } else if (login_sebagai === 'Siswa' && password === user[0].password) {
                req.session.user = {
                    id: user[0].nisn, // Pastikan nama kolom sesuai
                    name: user[0].nama_siswa, // Sesuaikan dengan kolom di tabel siswa
                    role: 'Siswa', // Tambahkan role untuk siswa
                    login_sebagai: login_sebagai,
                    tempat_lahir: user[0].tempat_lahir,
                    tanggal_lahir: user[0].tanggal_lahir,
                    nik: user[0].nik,

                };
                console.log("Session after login (Siswa):", req.session.user);
                res.status(200).json({
                    message: 'Login berhasil',
                    user: {
                        id: user[0].id,
                        name: user[0].nama_siswa,
                        role: 'Siswa', // Tambahkan role untuk siswa
                        login_sebagai: login_sebagai,
                        tempat_lahir: user[0].tempat_lahir,
                        tanggal_lahir: user[0].tanggal_lahir,
                        nik: user[0].nik,

                    }
                });
            
            
            } else {
                res.status(401).json({ message: 'Password salah' });
            }
        } else {
            res.status(404).json({ message: `${login_sebagai} tidak ditemukan` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

app.post('/login', (req, res) => {
    const userRole = req.session.user?.role;
    console.log("User Role from session:", userRole);
    if (userRole === 'Admin') {
        res.redirect('/dashboard-admin');
    } else if (userRole === 'Guru Mata Pelajaran') {
        res.redirect('/dashboard-matpel');
    } else if (userRole === 'Guru Wali Kelas') {
        res.redirect('/dashboard-walikelas');
    } else {
        res.redirect('/dashboard-siswa');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        const { role } = req.session.user;
        if (role === 'Admin') {
            res.redirect('/dashboard-admin');
        } else if (role === 'Guru Mata Pelajaran') {
            res.redirect('/dashboard-matpel');
        } else if (role === 'Guru Wali Kelas') {
            res.redirect('/dashboard-walikelas');
        } else if (role === 'Siswa') {
            res.redirect('/dashboard-siswa');
        } else {
            res.redirect('/login'); 
        }
    } else {
        res.redirect('/login'); 
    }
});

app.get('/dashboard-admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        const profileImage = req.session.user.profile_image || '/images/profile/kepsek.png'; 
        res.sendFile(path.join(__dirname, 'frontend', 'html', 'dashboard-admin.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-walikelas', (req, res) => {
    if (req.session.user && req.session.user.role === 'Guru Wali Kelas') {
        res.sendFile(path.join(__dirname,'frontend', 'html', 'dashboard-walikelas.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard-siswa', (req, res) => {
    if (req.session.user && req.session.user.role === 'Siswa') {
        res.sendFile(path.join(__dirname, 'frontend', 'html', 'dashboard-siswa.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/api/session', (req, res) => {
    if (req.session.user) {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        res.json({
            name: req.session.user.name || 'Tidak tersedia',
            tempat_lahir: req.session.user.tempat_lahir || 'Tidak tersedia',
            tanggal_lahir: req.session.user.tanggal_lahir ? formatDate(req.session.user.tanggal_lahir) : 'Tidak tersedia',
            nip: req.session.user.id || 'Tidak tersedia',
            position: req.session.user.role || 'Tidak tersedia',
            login_sebagai: req.session.user.login_sebagai || 'Tidak tersedia',
            nik: req.session.user.nik || 'Tidak tersedia',
            tanggal_mulai_tugas: req.session.user.tanggal_mulai_tugas ? formatDate(req.session.user.tanggal_mulai_tugas) : 'Tidak tersedia',
            jenjang_pendidikan: req.session.user.jenjang_pendidikan || 'Tidak tersedia',
            jurusan: req.session.user.jurusan || 'Tidak tersedia',
            golongan: req.session.user.golongan || '-',
            nuptk: req.session.user.nuptk || '-'
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

app.get('/api/session-siswa', (req, res) => {
    console.log("Session Data:", req.session.user);  // Debug log untuk memastikan sesi ada

    if (req.session.user) {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID');
        };

        res.json({
            name: req.session.user.name || 'Tidak tersedia',
            tempat_lahir: req.session.user.tempat_lahir || 'Tidak tersedia',
            tanggal_lahir: req.session.user.tanggal_lahir ? formatDate(req.session.user.tanggal_lahir) : 'Tidak tersedia',
            nisn: req.session.user.nisn || 'Tidak tersedia',
            nisn: req.session.user.id || 'Tidak tersedia',
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });  // Pastikan sesi benar-benar ada
    }
});

app.get('/api/pegawai', async(req, res) => {
    try {
        const query = 'SELECT * FROM pegawai'; 
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

app.delete('/api/pegawai/:nip', async(req, res) => {
    const { nip } = req.params;
    try {
        const deleteQuery = 'DELETE FROM pegawai WHERE nip = ?';
        const [result] = await db.query(deleteQuery, [nip]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pegawai berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting pegawai:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/pegawai', (req, res, next) => {
    upload.single('profile_image')(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'Error dalam upload file!' });
        }
        next();
    });
}, async(req, res) => {
    try {
        const {
            nip,
            namaPegawai,
            tanggalLahir,
            tempatLahir,
            jenisKelamin,
            alamat,
            agama,
            email,
            noHp,
            password,
            nik,
            tanggalMulaiTugas,
            jenjangPendidikan,
            jurusan,
            roles
        } = req.body;

        console.log('Data diterima:', req.body);
        console.log('Roles:', roles);
        console.log('Selected roles:', roles);

        // Validasi roleId harus berupa array
        if (!Array.isArray(roles)) {
            return res.status(400).json({ message: 'roleId harus berupa array!' });
        }

        // Insert pegawai ke tabel pegawai
        const query = `
            INSERT INTO pegawai 
            (nip, nama_pegawai, tanggal_lahir, tempat_lahir, jenis_kelamin, alamat, agama, email, no_hp, password, nik, tanggal_mulai_tugas, jenjang_pendidikan, jurusan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(query, [
            nip, namaPegawai, tanggalLahir, tempatLahir,
            jenisKelamin, alamat, agama, email,
            noHp, password, nik, tanggalMulaiTugas,
            jenjangPendidikan, jurusan
        ]);

        // Insert roles ke tabel pegawai_roles
        for (let role of roles) {
            await db.execute('INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)', [nip, role]);
        }

        res.status(201).json({ message: 'Data pegawai dan role berhasil ditambahkan!' });
    } catch (error) {
        console.error('Error menyimpan data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/pegawai/:nip', async(req, res) => {
    const { nip } = req.params;

    try {
        const query = 'SELECT * FROM pegawai WHERE nip = ?';
        const [result] = await db.execute(query, [nip]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.put('/api/pegawai/:nip', async(req, res) => {
    const { nip } = req.params;
    const { namaPegawai, tanggalLahir, tempatLahir, jenisKelamin, alamat, agama, email, noHp, password, nik, tanggalMulaiTugas, jenjangPendidikan, jurusan, roles } = req.body;

    try {
        // Update data pegawai
        const updateQuery = `
            UPDATE pegawai 
            SET nama_pegawai = ?, tanggal_lahir = ?, tempat_lahir = ?, jenis_kelamin = ?, alamat = ?, agama = ?, email = ?, no_hp = ?, password = ?, nik = ?, tanggal_mulai_tugas = ?, jenjang_pendidikan = ?, jurusan = ?
            WHERE nip = ?`;

        const [result] = await db.execute(updateQuery, [
            namaPegawai, tanggalLahir, tempatLahir, jenisKelamin, alamat, agama, email, noHp, password, nik, tanggalMulaiTugas, jenjangPendidikan, jurusan, nip
        ]);

        if (result.affectedRows > 0) {
            // Hapus role lama untuk pegawai
            await db.execute('DELETE FROM pegawai_roles WHERE nip = ?', [nip]);

            // Insert role baru
            for (let role of roles) {
                await db.execute('INSERT INTO pegawai_roles (nip, role_id) VALUES (?, ?)', [nip, role]);
            }

            res.status(200).json({ message: 'Data pegawai berhasil diperbarui!' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengupdate data pegawai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/siswa', async(req, res) => {
    try {
        const query = 'SELECT * FROM siswa'; 
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/siswa', async (req, res) => {
    const {
        nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
        agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas
    } = req.body;

    // Validasi input (pastikan hanya field wajib yang diisi)
    if (!nisn || !nama_siswa || !alamat || !tempat_lahir || !tanggal_lahir || !jenis_kelamin ||
        !agama || !tanggal_masuk || !nama_ayah || !nama_ibu || !no_hp_ortu || !email || !nik || !anak_ke || !status) {
        return res.status(400).json({ message: 'Field wajib harus diisi!' });
    }


    const query = `
INSERT INTO siswa (nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
    agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, id_kelas)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    // Ganti id_kelas dengan null jika tidak ada
    const idKelasValue = id_kelas ? id_kelas : null;

    try {
        await db.query(query, [
            nisn, nama_siswa, alamat, tempat_lahir, tanggal_lahir, jenis_kelamin,
            agama, tanggal_masuk, nama_ayah, nama_ibu, no_hp_ortu, email, nik, anak_ke, status, idKelasValue
        ]);
        res.status(201).json({ message: 'Data siswa berhasil ditambahkan.' });
    } catch (err) {
        console.error('Error inserting siswa:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan data siswa.' });
    }

});

app.delete('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;
    try {
        const deleteQuery = 'DELETE FROM siswa WHERE nisn = ?';
        const [result] = await db.query(deleteQuery, [nisn]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Siswa berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Siswa:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/siswa/:nisn', async (req, res) => {
    const { nisn } = req.params;

    try {
        // Query pertama untuk mengambil data siswa berdasarkan NISN
        const siswaQuery = 'SELECT * FROM siswa WHERE nisn = ?';
        const [siswaResult] = await db.execute(siswaQuery, [nisn]);

        // Mengecek apakah siswa ditemukan
        if (siswaResult.length === 0) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }

        const siswa = siswaResult[0];

        // Query kedua untuk mengambil data nama kelas berdasarkan id_kelas
        const kelasQuery = 'SELECT nama_kelas FROM kelas WHERE id = ?';
        const [kelasResult] = await db.execute(kelasQuery, [siswa.id_kelas]);

        // Jika data kelas ditemukan, tambahkan nama_kelas ke objek siswa
        if (kelasResult.length > 0) {
            siswa.nama_kelas = kelasResult[0].nama_kelas;
        } else {
            siswa.nama_kelas = 'Tidak tersedia'; // Jika tidak ditemukan
        }

        // Mengirimkan data siswa yang sudah dilengkapi dengan nama_kelas
        res.status(200).json(siswa);

    } catch (error) {
        console.error('Error mengambil data Siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.put('/api/siswa/:nisn', (req, res) => {
    console.log("Request Body:", req.body);
    console.log("NISN:", req.params.nisn);

    const nisn = req.params.nisn;
    const { nama_siswa, alamat, tempat_lahir, tanggal_lahir } = req.body;

    const siswa = siswaData.find(s => s.nisn === nisn);
    if (!siswa) {
        console.log("Siswa tidak ditemukan!");
        return res.status(404).send({ message: "Siswa tidak ditemukan." });
    }

    siswa.nama_siswa = nama_siswa;
    siswa.alamat = alamat;
    siswa.tempat_lahir = tempat_lahir;
    siswa.tanggal_lahir = tanggal_lahir;

    console.log("Siswa setelah update:", siswa);
    res.send({ message: "Data siswa berhasil diperbarui.", siswa });
});

app.get('/api/siswa/:nisn', async(req, res) => {
    const { nisn } = req.params;

    try {
        const query = 'SELECT * FROM siswa WHERE nisn = ?';
        const [result] = await db.execute(query, [nisn]);

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data Siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
})

app.get('/api/kelas', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;

        // Query dasar: ambil data kelas dan nama pegawai
        let query = `
            SELECT k.id, k.nama_kelas, k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, k.tingkatan
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
        `;

        const params = [];

        // Tambahkan filter hanya jika tahun ajaran disediakan
        if (filterTahunAjaran) {
            query += ` WHERE k.id_tahun_ajaran = ?`;
            params.push(filterTahunAjaran);
        }

        // Eksekusi query
        const [rows] = await db.query(query, params);

        // Kirimkan hasil ke frontend
        if (rows.length > 0) {
            console.log('Data kelas yang dikirimkan:', rows);
            res.json(rows);
        } else {
            console.log('Tidak ada data kelas yang ditemukan.');
            res.json([]); // Kirim array kosong jika tidak ada data
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.get('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan data kelas beserta pegawai dan siswa yang terdaftar
        const query = `
            SELECT k.id, 
                   k.nama_kelas, 
                   k.nip, 
                   IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai, 
                   k.id_tahun_ajaran, 
                   k.tingkatan, 
                   s.nisn AS siswa_nisn,
                   IFNULL(s.nama_siswa, 'Nama Siswa Tidak Ada') AS nama_siswa
            FROM kelas k
            LEFT JOIN pegawai p ON k.nip = p.nip
            LEFT JOIN siswa s ON k.id = s.id_kelas
            WHERE k.id = ?
        `;

        // Menjalankan query dengan parameter ID kelas
        const [result] = await db.execute(query, [id]);

        // Mengecek apakah data ditemukan
        if (result.length > 0) {
            const kelasData = {
                id: result[0].id,
                nama_kelas: result[0].nama_kelas,
                nip: result[0].nip,
                nama_pegawai: result[0].nama_pegawai,
                id_tahun_ajaran: result[0].id_tahun_ajaran,
                tingkatan: result[0].tingkatan,
                siswa: result.map(row => ({
                    nisn: row.siswa_nisn,  // NISN
                    nama_siswa: row.nama_siswa  // Nama Siswa
                }))
            };

            res.status(200).json(kelasData);
        } else {
            res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/no-class', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM siswa WHERE id_kelas IS NULL');
        console.log('Hasil Query:', result); // Tambahkan log ini
        if (result.length === 0) {
            return res.status(404).json({ message: 'Tidak ada siswa tanpa kelas.' });
        }
        res.json({ siswa: result });
    } catch (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.put('/api/kelas/:id', async (req, res) => {
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    // Validasi jika data tidak ada, ubah menjadi null
    const kelasUpdate = {
        nama_kelas: nama_kelas || null,
        pegawai_id: pegawai_id || null,
        tahun_ajaran_id: tahun_ajaran_id || null,
        tingkatan: tingkatan || null,
    };

    try {
        // Pastikan parameter hanya mengandung data valid
        const result = await db.query(
            `UPDATE kelas 
             SET 
                nama_kelas = ?, 
                nip = ?, 
                id_tahun_ajaran = ?, 
                tingkatan = ?
             WHERE id = ?`,
            [kelasUpdate.nama_kelas, kelasUpdate.pegawai_id, kelasUpdate.tahun_ajaran_id, kelasUpdate.tingkatan, req.params.id]
        );
        res.json({ success: true, message: 'Data kelas berhasil diperbarui.' });
    } catch (error) {
        console.error('Error memperbarui Kelas:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui kelas.' });
    }
});

app.post('/api/kelas', async (req, res) => {
    const { nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan } = req.body;

    console.log('Received data:', req.body);

    // Validasi input
    if (!nama_kelas || !pegawai_id || !tahun_ajaran_id || !tingkatan) {
        return res.status(400).json({ success: false, message: 'Semua kolom harus diisi!' });
    }

    try {
        // Check if pegawai_id exists in the pegawai table
        const checkQuery = `SELECT * FROM pegawai WHERE nip = ?`;
        const [pegawaiResult] = await db.query(checkQuery, [pegawai_id]);

        if (pegawaiResult.length === 0) {
            return res.status(400).json({ success: false, message: 'NIP tidak ditemukan di tabel pegawai!' });
        }

        // If NIP exists, proceed with the insert
        const query = `
            INSERT INTO kelas (nama_kelas, nip, id_tahun_ajaran, tingkatan) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nama_kelas, pegawai_id, tahun_ajaran_id, tingkatan]);

        console.log('Data successfully inserted:', result);
        res.status(201).json({ success: true, message: 'Kelas berhasil ditambahkan' });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});

app.delete('/api/kelas/:id', async (req, res) => {
    const { id } = req.params;  // Mengambil ID dari parameter URL
    console.log('ID yang diterima API:', id);

    // Memastikan ID yang diterima valid
    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid.' });
    }

    try {
        // Query untuk menghapus kelas berdasarkan ID
        const deleteQuery = 'DELETE FROM kelas WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        // Mengecek apakah baris yang terpengaruh lebih dari 0
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Kelas berhasil dihapus.' });
        } else {
            // Jika tidak ada kelas yang ditemukan dengan ID tersebut
            res.status(404).json({ message: 'Kelas tidak ditemukan.' });
        }
    } catch (error) {
        // Menangani kesalahan yang terjadi selama proses penghapusan
        console.error("Error deleting Kelas:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/kelas/detail/:id', (req, res) => {
    const kelasId = req.params.id;
    // Fetch class details from the database using kelasId
    // Then return the data
    res.json({ message: "Class details for " + kelasId });
});


app.put('/api/move/:nisn', async (req, res) => {
    console.log('Rute PUT dipanggil');
    const nisn = req.params.nisn;
    const { id_kelas } = req.body;

    if (!nisn || !id_kelas) {
        return res.status(400).json({ message: 'nisn dan id_kelas wajib ada' });
    }

    const query = 'UPDATE siswa SET id_kelas = ? WHERE nisn = ?';

    try {
        // Menggunakan query() untuk menjalankan query
        const [result] = await db.execute(query, [id_kelas, nisn]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Siswa berhasil dipindahkan ke kelas baru' });
        } else {
            return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }
    } catch (err) {
        console.error('Gagal memperbarui siswa:', err);
        return res.status(500).json({ message: 'Gagal memperbarui siswa' });
    }
});

app.put('/api/siswa/move/:nisn', async (req, res) => {
    const { nisn } = req.params;


    try {
        // Query untuk memindahkan siswa (menghapus dari kelas)
        const moveQuery = `
            UPDATE siswa 
            SET id_kelas = NULL  
            WHERE nisn = ?`;

        const [result] = await db.execute(moveQuery, [nisn]); // Menunggu query selesai

        // Mengecek apakah ada baris yang terpengaruh
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Siswa berhasil dipindahkan atau dihapus dari kelas!' });
        } else {
            res.status(404).json({ message: 'Siswa tidak ditemukan dengan NISN tersebut.' });
        }
    } catch (error) {
        // Menangani kesalahan jika terjadi masalah dengan database
        console.error('Error memindahkan siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/tahun-ajaran', async(req, res) => {
    try {
        const query = 'SELECT * FROM tahun_ajaran'; 
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data siswa ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data siswa:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/tahun-ajaran', async (req, res) => {
    const { nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai } = req.body;

    if (!nama_tahun_ajaran || !semester || !tanggal_mulai || !tanggal_selesai) {
        return res.status(400).json({ message: 'Semua field harus diisi!' });
    }

    const query = `
        INSERT INTO tahun_ajaran (nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai)
        VALUES (?, ?, ?, ?)
    `;

    try {
        await db.query(query, [nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai]);
        res.status(201).json({ message: 'Tahun Ajaran berhasil ditambahkan.' });
    } catch (err) {
        console.error('Error inserting tahun ajaran:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan tahun ajaran.' });
    }
});

app.get('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan Tahun Ajaran berdasarkan ID
        const query = 'SELECT * FROM tahun_ajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        // jika data ditemukan, kirimkan sebagai response
        if (result.length > 0) {
            // memastikan data yang dikirimkan mengandung field tahun_ajaran
            res.status(200).json({
                id: result[0].id,
                tahun_ajaran: result[0].nama_tahun_ajaran || 'Tidak Tersedia',
                semester:result[0].semester || 'Tidak Tersedia',
            });
        } else {
            res.status(404).json({ message: 'Tahun Ajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Tahun Ajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.put('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_tahun_ajaran, tanggal_mulai, tanggal_selesai, semester } = req.body;

    try {
        const [result] = await db.execute(
            `UPDATE tahun_ajaran 
             SET nama_tahun_ajaran = ?, tanggal_mulai = ?, tanggal_selesai = ?, semester = ? 
             WHERE id = ?`,
            [nama_tahun_ajaran, tanggal_mulai, tanggal_selesai, semester, id]
        );
        console.log('Data untuk update:', { nama_tahun_ajaran, semester, tanggal_mulai, tanggal_selesai, id });
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tahun Ajaran berhasil diperbarui' });
        } else {
            res.status(404).json({ message: 'Tahun Ajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error memperbarui Tahun Ajaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.delete('/api/tahun-ajaran/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    try {
        const deleteQuery = 'DELETE FROM tahun_ajaran WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Tahun ajaran berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Tahun ajaran tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Tahun Ajaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/mading', upload.single('image'), async (req, res) => {
    const { judul, konten, tanggal } = req.body;
    const nip = req.session.user?.id;
    const imagePath = req.file ? '/uploads/' + req.file.filename : null; // Menyimpan path gambar jika ada

    console.log('NIP:', nip);
    console.log('Image Path:', imagePath);

    if (!nip) return res.status(401).json({ message: 'Unauthorized' });
    if (!judul || !konten || !tanggal) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await db.query(
            'INSERT INTO mading (judul, konten, tanggal, nip, foto) VALUES (?, ?, ?, ?, ?)',
            [judul, konten, tanggal, nip, imagePath] // Menambahkan path gambar ke query
        );
        res.status(201).json({ message: 'Mading added successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to add mading.' });
    }
});

// Get all mading
app.get('/api/mading', async (req, res) => {
    try {
        const searchQuery = req.query.search || ''; // Ambil query pencarian
        let query = 'SELECT * FROM mading';

        // Tambahkan kondisi WHERE hanya jika ada parameter pencarian
        if (searchQuery) {
            query += ' WHERE judul LIKE ?';
        }

        // Tambahkan ORDER BY untuk mengurutkan berdasarkan tanggal terbaru
        query += ' ORDER BY tanggal DESC';

        // Jalankan query dengan aman menggunakan parameterisasi
        const [rows] = await db.query(query, searchQuery ? [`%${searchQuery}%`] : []);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data mading ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data mading:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/mading/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query untuk mendapatkan Tahun Ajaran berdasarkan ID
        const query = 'SELECT * FROM mading WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        // Jika data ditemukan, kirimkan sebagai response
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Mading tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Mading:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.delete('/api/mading/:id', async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    try {
        // Query untuk menghapus data dari tabel tahun_ajaran
        const deleteQuery = 'DELETE FROM mading WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        // Cek apakah data berhasil dihapus
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pengumuman berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Pengumuman ajaran tidak ditemukan.' });
        }
    } catch (error) {
        // Log error untuk debugging
        console.error("Error deleting Pengumumann:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

// Rute untuk mengambil detail mading berdasarkan ID
app.get('/api/mading-detail', async (req, res) => {
    try {
      const { id } = req.query; 
      if (!id) {
        return res.status(400).json({ message: "ID tidak diberikan" });
      }
  
      const query = 'SELECT * FROM mading WHERE id = ?';
      const [rows] = await db.query(query, [id]);
  
      if (rows.length > 0) {
        res.status(200).json(rows[0]); 
      } else {
        res.status(404).json({ message: 'Data tidak ditemukan.' });
      }
    } catch (error) {
      console.error('Error saat mengambil detail mading:', error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

app.get('/api/mading-home', async (req, res) => {
    try {
        const query = 'SELECT * FROM mading ORDER BY tanggal DESC LIMIT 5';
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ message: 'Tidak ada data mading ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil data mading untuk Home:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/mata-pelajaran', async (req, res) => {
    const { id, nama_pelajaran, nip, id_tahun_ajaran, id_kelas } = req.body;

    console.log('Received data:', req.body);

    // Cek apakah sudah ada mata pelajaran dengan nama_pelajaran di kelas yang sama dan tahun ajaran yang sama
    const checkQuery = `
        SELECT mp.*, p.nama_pegawai FROM mata_pelajaran mp
        JOIN pegawai p ON mp.nip = p.nip
        WHERE mp.nama_mata_pelajaran = ? 
        AND mp.id_kelas = ? 
        AND mp.id_tahun_ajaran = ? 
        AND mp.nip != ? 
    `;

    try {
        // Cek apakah mata pelajaran sudah ada di kelas dan tahun ajaran yang sama
        const [existingMatpel] = await db.query(checkQuery, [nama_pelajaran, id_kelas, id_tahun_ajaran, nip]);

        if (existingMatpel.length > 0) {
            const existingTeacherName = existingMatpel[0].nama_pegawai;  // Nama guru yang sudah ada
            return res.status(400).json({
                success: false,
                message: `Mata pelajaran ini sudah diajarkan oleh guru ${existingTeacherName} di kelas ini.`
            });
        }

        // Jika tidak ada duplikasi, lanjutkan untuk memasukkan data
        const query = `
            INSERT INTO mata_pelajaran (id, nama_mata_pelajaran, nip, id_tahun_ajaran, id_kelas) 
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(query, [id, nama_pelajaran, nip, id_tahun_ajaran, id_kelas]);
        console.log('Data successfully inserted');
        return res.status(201).json({ success: true, message: 'Mata Pelajaran berhasil ditambahkan' });

    } catch (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ success: false, message: 'Error inserting data', error: err.message });
    }
});

app.get('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM  mata_pelajaran WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Matpel tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error mengambil data Matpel:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server!' });
    }
});

app.get('/api/mata-pelajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran || null;
        const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;

        let query = `
        SELECT mp.id, mp.nama_mata_pelajaran, mp.nip, mp.id_kelas, 
            IFNULL(p.nama_pegawai, 'Nama Pegawai Tidak Ada') AS nama_pegawai,
            IFNULL(k.nama_kelas, 'Nama Kelas Tidak Ada') AS nama_kelas
        FROM mata_pelajaran mp
        LEFT JOIN pegawai p ON mp.nip = p.nip
        LEFT JOIN kelas k ON mp.id_kelas = k.id  -- Misalnya id_kelas menghubungkan dengan id di tabel kelas


        `;

        const params = [];
        const conditions = [];

        if (filterTahunAjaran) {
            conditions.push(`mp.id_tahun_ajaran = ?`);
            params.push(filterTahunAjaran);
        }

        if (search) {
            conditions.push(`LOWER(mp.nama_mata_pelajaran) LIKE ? OR LOWER(mp.nip) LIKE ? OR mp.id = ?`);
            params.push(search, search, parseInt(search) || 0);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

app.put('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_pelajaran, id_tahun_ajaran, nip } = req.body; 

    if (!nama_pelajaran || !id_tahun_ajaran || !nip) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE mata_pelajaran 
             SET nama_mata_pelajaran = ?, id_tahun_ajaran = ?, nip = ? 
             WHERE id = ?`,
            [nama_pelajaran, id_tahun_ajaran, nip, id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Mata Pelajaran berhasil diperbarui' });
        } else {
            res.status(404).json({ error: 'Mata Pelajaran tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error saat memperbarui data mata pelajaran:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

app.delete('/api/mata-pelajaran/:id', async (req, res) => {
    const { id } = req.params;
    console.log('ID yang diterima API:', id);

    if (!id) {
        return res.status(400).json({ message: 'ID tidak valid.' });
    }

    try {
        const deleteQuery = 'DELETE FROM mata_pelajaran WHERE id = ?';
        const [result] = await db.query(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Mata Pelajaran berhasil dihapus.' });
        } else {
            res.status(404).json({ message: 'Mata Pelajaran tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting Mata Pelajaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/siswa/kelas/:kelasId', async (req, res) => {
    try {
        const { kelasId } = req.params; // Ambil kelasId dari URL

        if (!kelasId) {
            return res.status(400).json({ message: 'Parameter kelas diperlukan.' });
        }

        // Query untuk mencari siswa berdasarkan kelas
        const query = 'SELECT * FROM siswa WHERE id_kelas = ?';
        const [rows] = await db.query(query, [kelasId]); // Gunakan kelasId yang diambil dari URL

        if (rows.length > 0) {
            res.status(200).json(rows); // Kirim data siswa jika ditemukan
        } else {
            res.status(404).json(`{ message: Tidak ada data siswa ditemukan untuk kelas ${kelasId}. }`);
        }
    } catch (error) {
        console.error('Error mengambil data siswa berdasarkan kelas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

app.get('/api/kelas-by-tahun-ajaran', async (req, res) => {
    try {
        const filterTahunAjaran = req.query.tahun_ajaran_id || null;

        // Mengambil NIP dari session pengguna yang sedang login
        const nipGuru = req.session.user?.id; // Mengambil NIP dari session

        if (!nipGuru) {
            return res.status(403).json({ error: 'Akses ditolak: NIP pengguna tidak ditemukan dalam session' });
        }

        // Menyusun query untuk mengambil kelas berdasarkan nipGuru dan tahun ajaran
        let query = `
            SELECT DISTINCT k.id, k.nama_kelas, k.tingkatan
            FROM kelas k
            JOIN mata_pelajaran mp ON k.id = mp.id_kelas
            WHERE mp.nip = ? 
        `;

        const params = [nipGuru];

        if (filterTahunAjaran) {
            query += ' AND mp.id_tahun_ajaran = ?';  // Only add this part if filterTahunAjaran exists
            params.push(filterTahunAjaran);
        }

        const [rows] = await db.execute(query, params);
        res.json(rows); // Mengirimkan daftar kelas yang sesuai dengan NIP pengguna dan filter lainnya
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses data.' });
    }
});

// Endpoint untuk mengambil data mata pelajaran berdasarkan tahun ajaran
app.get('/api/data-mapel', async (req, res) => {
    const { tahun_ajaran_id } = req.query;

    try {
        let query = 'SELECT * FROM mata_pelajaran';
        const params = [];

        // Jika tahun ajaran dipilih, tambahkan kondisi WHERE
        if (tahun_ajaran_id) {
            query += ' WHERE id_tahun_ajaran = ?';
            params.push(tahun_ajaran_id);
        }

        const [rows] = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan.' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error saat mengambil data mata pelajaran:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


app.get('/api/get-nilai/:nisn', async (req, res) => {
    const { nisn } = req.params;
    const { jenisNilai, tahunAjaran, kelas, mapel } = req.query;


    if (!tahunAjaran || !kelas || !mapel || !jenisNilai) {
        return res.status(400).json({ error: 'Parameter tidak lengkap' });
    }

    const query = `
        SELECT nisn, grade AS nilai
        FROM grades
        WHERE nisn = ? AND id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ?
    `;

    try {
        const [results] = await db.query(query, [nisn, tahunAjaran, kelas, mapel, jenisNilai]);
        res.json(results);
    } catch (error) {
        console.error('Error pada endpoint /api/get-nilai:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});

// Misal menggunakan Express.js
// Misal menggunakan Express.js
app.get('/api/dataMapel/:nip', async (req, res) => {
    const { nip } = req.params;  // Mengambil nip dari path parameter
    const { tahun_ajaran_id } = req.query;  // Mendapatkan tahun ajaran dari query parameter

    if (!tahun_ajaran_id || !nip) {
        return res.status(400).json({ message: 'Tahun ajaran atau NIP tidak valid' });
    }

    try {
        // Query untuk mendapatkan mata pelajaran berdasarkan nip dan tahun ajaran
        const query = `
            SELECT * FROM mapel
            WHERE nip = ? AND id_tahun_ajaran = ?
        `;
        const [rows] = await db.execute(query, [nip, tahun_ajaran_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tidak ada mata pelajaran ditemukan' });
        }

        res.json(rows);  // Mengirimkan data mata pelajaran
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
});

app.get('/api/grades/:kelasId/:matpelId', async (req, res) => {
    const { kelasId, matpelId } = req.params;

    if (!kelasId || !matpelId) {
        return res.status(400).json({ error: 'Kelas ID dan Mata Pelajaran ID harus disertakan.' });
    }

    try {
        // Query data siswa berdasarkan kelas
        const [students] = await db.execute(`
            SELECT nisn, nama_siswa
            FROM siswa
            WHERE id_kelas = ?
        `, [kelasId]);

        if (!students.length) {
            return res.status(404).json({ error: 'Tidak ada siswa ditemukan untuk kelas ini.' });
        }

        // Query nilai siswa berdasarkan kelas dan mata pelajaran
        const [grades] = await db.execute(`
            SELECT g.nisn, g.gradesType, g.grade, g.gradeStatus, g.catatan
            FROM grades g
            WHERE g.id_kelas = ? AND g.id_matpel = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
        `, [kelasId, matpelId]);

        // Gabungkan data nilai ke data siswa
        const gradesMap = grades.reduce((acc, grade) => {
            if (!acc[grade.nisn]) acc[grade.nisn] = { uts: 0, uas: 0, tugas: 0, gradeStatus: '', catatan: '' };

            if (grade.gradesType.toLowerCase() === 'uts') {
                acc[grade.nisn].uts = grade.grade ? Number(grade.grade) : 0;
            } else if (grade.gradesType.toLowerCase() === 'uas') {
                acc[grade.nisn].uas = grade.grade ? Number(grade.grade) : 0;
            } else if (grade.gradesType.toLowerCase() === 'tugas') {
                acc[grade.nisn].tugas = grade.grade ? Number(grade.grade) : 0;
            }

            if (grade.gradeStatus) acc[grade.nisn].gradeStatus = grade.gradeStatus;
            if (grade.catatan) acc[grade.nisn].catatan = grade.catatan;

            return acc;
        }, {});

        // Gabungkan data siswa dengan data nilai
        const results = students.map(student => {
            const nilai = gradesMap[student.nisn] || { uts: 0, uas: 0, tugas: 0, gradeStatus: '', catatan: '' };
            const nilaiAkhir = parseFloat(((nilai.uts * 0.4) + (nilai.uas * 0.4) + (nilai.tugas * 0.2)).toFixed(2));
            return {
                nisn: student.nisn,
                nama_siswa: student.nama_siswa,
                uts: nilai.uts,
                uas: nilai.uas,
                tugas: nilai.tugas,
                nilai_akhir: Number(nilaiAkhir) || 0,
                gradeStatus: nilai.gradeStatus,
                catatan: nilai.catatan,
            };
        });

        res.json(results);
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/nilai-akhir', async (req, res) => {
    const { nisn, jenisNilai, tahunAjaran, kelas, mapel } = req.query;

    if (!nisn || !jenisNilai || !tahunAjaran || !kelas || !mapel) {
        return res.status(400).json({
            error: "Semua parameter (nisn, jenisNilai, tahunAjaran, kelas, mapel) harus disertakan.",
        });
    }

    try {
        // Ambil ID Kelas dan Mata Pelajaran berdasarkan nama
        const getKelasIdQuery = 'SELECT id FROM kelas WHERE nama_kelas = ?';
        const getMapelIdQuery = 'SELECT id FROM mata_pelajaran WHERE nama_mata_pelajaran = ?';
        
        const [kelasResults] = await db.execute(getKelasIdQuery, [kelas]);
        const [mapelResults] = await db.execute(getMapelIdQuery, [mapel]);

        const kelasId = kelasResults[0]?.id;
        const matpelId = mapelResults[0]?.id;

        if (!kelasId || !matpelId) {
            return res.status(400).json({ error: 'Kelas atau Mata Pelajaran tidak valid.' });
        }

        const query = `
            SELECT g.nisn, s.nama_siswa, g.gradesType, g.grade, g.gradeStatus, g.catatan
            FROM grades g
            JOIN siswa s ON g.nisn = s.nisn
            WHERE g.id_kelas = ? AND g.id_matpel = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
        `;
        
        const [results] = await db.execute(query, [kelasId, matpelId]);
        
        // Kelompokkan data berdasarkan NISN
        const nilaiAkhir = results.reduce((acc, row) => {
            const { nisn, nama_siswa, gradesType, grade, gradeStatus, catatan } = row;

            if (!acc[nisn]) {
                acc[nisn] = {
                    nisn,
                    nama_siswa,
                    uts: 0,
                    uas: 0,
                    tugas: 0,
                    nilai_akhir: 0,
                    gradeStatus: gradeStatus || '',
                    catatan: catatan || ''
                };
            }

            if (gradesType.toLowerCase() === 'uts') {
                acc[nisn].uts = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'uas') {
                acc[nisn].uas = grade ? Number(grade) : 0;
            } else if (gradesType.toLowerCase() === 'tugas') {
                acc[nisn].tugas = grade ? Number(grade) : 0;
            }

            if (gradeStatus) acc[nisn].gradeStatus = gradeStatus;
            if (catatan) acc[nisn].catatan = catatan;

            return acc;
        }, {});

        if (Object.keys(nilaiAkhir).length === 0) {
            return res.status(404).json({ error: 'Tidak ada data nilai yang ditemukan.' });
        }

        // Hitung nilai akhir
        const finalResults = Object.values(nilaiAkhir).map(siswa => {
            if (siswa.uts !== 0 && siswa.uas !== 0 && siswa.tugas !== 0) {
                siswa.nilai_akhir = ((siswa.uts * 0.4) + (siswa.uas * 0.4) + (siswa.tugas * 0.2)).toFixed(1);
            } else {
                siswa.nilai_akhir = 0; 
            }
            return siswa;
        });

        res.json(finalResults);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/mapel/:idKelas', async (req, res) => {
    const { idKelas } = req.params;

    // Query SQL untuk mengambil mata pelajaran berdasarkan id_kelas
    const query = 'SELECT nama_mata_pelajaran, id FROM mata_pelajaran WHERE id_kelas = ?';

    try {
        // Menjalankan query dan menunggu hasilnya
        const [results, fields] = await db.execute(query, [idKelas]);

        // Jika data tidak ditemukan
        if (results.length === 0) {
            return res.status(404).json({ message: 'Mata pelajaran tidak ditemukan untuk kelas ini' });
        }

        // Mengirimkan data mata pelajaran
        res.json(results);

    } catch (err) {
        console.error('Error executing query:', err);
        // Menangani kesalahan server
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});
app.post('/api/update-grade-status', async (req, res) => {
    const { nisn, catatan, status, mapel_id } = req.body;

    // Menambahkan console.log untuk memeriksa nilai variabel yang diterima
    console.log({
        nisn: nisn,
        catatan: catatan,
        status: status,
        mapel_id: mapel_id
    });

    // Validasi input
    if (!nisn || !status || !mapel_id) {
        return res.status(400).json({ message: 'Data tidak lengkap. Pastikan nisn, status, dan mapel_id disertakan.' });
    }
    
    try {
        const query = `
            UPDATE grades
            SET gradeStatus = ?, catatan = ?
            WHERE nisn = ? AND id_matpel = ?
        `;

        const [result] = await db.execute(query, [status, catatan || null, nisn, mapel_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data tidak ditemukan atau tidak ada perubahan yang dilakukan.' });
        }

        return res.status(200).json({ message: 'Status berhasil diperbarui.' });
    } catch (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Gagal memperbarui status. Silakan coba lagi.' });
    }
});
app.get('/api/get-grades', async (req, res) => {
    const { nisn, id_matpel } = req.query;

    // Validasi query parameters
    if (!nisn || !id_matpel) {
        return res.status(400).json({ error: 'Parameter nisn dan id_matpel diperlukan dan harus berupa angka.' });
    }

    const query = `
        SELECT g.gradeStatus, g.catatan
        FROM grades g
        WHERE g.nisn = ? AND g.id_matpel = ?;
    `;

    try {
        const [results] = await db.execute(query, [nisn, id_matpel]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Data status dan catatan tidak ditemukan.' });
        }

        // Menghitung status dan catatan
        let status = 'Tidak Diterima'; // Default status jika tidak ada status "Diterima"
        let catatan = '';

        // Cek apakah ada status "Diterima" atau "Lulus"
        for (let row of results) {
            if (row.gradeStatus === 'Diterima' || row.gradeStatus === 'Lulus') {
                status = row.gradeStatus;  // Pilih status pertama yang Diterima atau Lulus
                catatan = row.catatan;     // Ambil catatan yang sesuai
                break;  // Keluar setelah menemukan status Diterima atau Lulus
            }
        }

        // Jika status masih "Tidak Diterima", ambil status yang pertama
        if (status === 'Tidak Diterima' && results.length > 0) {
            status = results[0].gradeStatus;
            catatan = results[0].catatan;
        }

        // Hasil akhir
        res.json({
            nisn: nisn,
            status: status,
            catatan: catatan
        });

    } catch (err) {
        console.error('Error saat mengeksekusi query:', err);
        res.status(500).json({ error: 'Gagal memuat data status dan catatan.' });
    }
});


app.get('/api/grades/:tahunAjaran', async (req, res) => {
    const { tahunAjaran } = req.params;
    const nisn = req.session.user?.id; // Pastikan ini mengambil NISN dari sesi pengguna

    if (!tahunAjaran) {
        return res.status(400).json({ error: 'Tahun ajaran harus disertakan.' });
    }

    if (!nisn) {
        return res.status(401).json({ error: 'Anda belum login.' });
    }

    const query = `
        SELECT g.nisn, s.nama_siswa, g.gradesType, g.grade, g.gradeStatus, g.catatan, m.nama_mata_pelajaran
        FROM grades g
        JOIN siswa s ON g.nisn = s.nisn
        JOIN mata_pelajaran m ON g.id_matpel = m.id
        WHERE g.id_tahun_ajaran = ? AND g.nisn = ? AND g.gradesType IN ('uts', 'uas', 'tugas');
    `;

    try {
        const [results] = await db.execute(query, [tahunAjaran, nisn]);

        // Transformasi hasil
        const nilaiAkhir = results.reduce((acc, row) => {
            const { gradesType, grade, nama_mata_pelajaran, gradeStatus } = row;

            // Inisialisasi data jika belum ada untuk mata pelajaran tersebut
            if (!acc[nama_mata_pelajaran]) {
                acc[nama_mata_pelajaran] = {
                    matpel: nama_mata_pelajaran,
                    uts: null,
                    uas: null,
                    tugas: null,
                    nilai_akhir: null, // Kosongkan jika belum disetujui
                };
            }

            // Mengelompokkan nilai berdasarkan gradeType
            if (gradesType.toLowerCase() === 'uts') {
                acc[nama_mata_pelajaran].uts = grade ? Number(grade) : null;
            } else if (gradesType.toLowerCase() === 'uas') {
                acc[nama_mata_pelajaran].uas = grade ? Number(grade) : null;
            } else if (gradesType.toLowerCase() === 'tugas') {
                acc[nama_mata_pelajaran].tugas = grade ? Number(grade) : null;
            }

            // Hanya hitung nilai akhir jika gradeStatus "setuju"
            if (gradeStatus?.toLowerCase() === 'setuju') {
                const { uts, uas, tugas } = acc[nama_mata_pelajaran];
                // Hitung nilai akhir jika semua nilai ada dan status "setuju"
                if (uts !== null && uas !== null && tugas !== null) {
                    acc[nama_mata_pelajaran].nilai_akhir = ((uts * 0.4) + (uas * 0.4) + (tugas * 0.2)).toFixed(1);
                }
            }

            return acc;
        }, {});

        // Transformasi objek menjadi array untuk respons JSON
        const finalResults = Object.values(nilaiAkhir);

        res.json(finalResults);
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: 'Gagal memuat data nilai' });
    }
});

app.get('/api/grades', async (req, res) => {
    const { tahunAjaran, kelasId, matpelId, jenisNilai } = req.query;

   
    try {
        // Query semua siswa berdasarkan kelas
        const [students] = await db.execute(`
            SELECT nisn, nama_siswa
            FROM siswa
            WHERE id_kelas = ?
        `, [kelasId]);

        if (!students.length) {
            return res.status(404).json({ error: 'Tidak ada siswa ditemukan untuk kelas ini.' });
        }

        // Query nilai siswa berdasarkan parameter
        let gradesQuery = `
            SELECT g.nisn, g.gradesType, g.grade, g.gradeStatus, g.catatan
            FROM grades g
            WHERE g.id_kelas = ? AND g.id_matpel = ?`;
        const queryParams = [kelasId, matpelId];

        // Tambahkan filter untuk tahun ajaran jika ada
        if (tahunAjaran) {
            gradesQuery += ` AND g.id_tahun_ajaran = ?`;
            queryParams.push(tahunAjaran);
        }

        // Tambahkan filter untuk jenis nilai jika ada
        if (jenisNilai) {
            const validGrades = ['uts', 'uas', 'tugas', 'nilai-akhir'];
            if (!validGrades.includes(jenisNilai.toLowerCase())) {
                return res.status(400).json({ error: 'Jenis nilai yang valid: uts, uas, tugas, nilai-akhir' });
            }
            if (jenisNilai.toLowerCase() !== 'nilai-akhir') {
                gradesQuery += ` AND g.gradesType = ?`;
                queryParams.push(jenisNilai.toLowerCase());
            }
        }

        const [grades] = await db.execute(gradesQuery, queryParams);

        // Gabungkan data nilai ke data siswa
        const gradesMap = grades.reduce((acc, grade) => {
            if (!acc[grade.nisn]) acc[grade.nisn] = {};
            acc[grade.nisn][grade.gradesType.toLowerCase()] = grade.grade ? Number(grade.grade) : null;
            acc[grade.nisn].gradeStatus = grade.gradeStatus || '';
            acc[grade.nisn].catatan = grade.catatan || '';
            return acc;
        }, {});

        const results = students.map(student => {
            const siswa = {
                nisn: student.nisn,
                nama_siswa: student.nama_siswa,
                uts: gradesMap[student.nisn]?.uts || null,
                uas: gradesMap[student.nisn]?.uas || null,
                tugas: gradesMap[student.nisn]?.tugas || null,
                nilai_akhir: null,
                gradeStatus: gradesMap[student.nisn]?.gradeStatus || '',
                catatan: gradesMap[student.nisn]?.catatan || '',
            };

            // Hitung nilai akhir jika memungkinkan
            if (siswa.uts !== null && siswa.uas !== null && siswa.tugas !== null) {
                siswa.nilai_akhir = Math.round((siswa.uts + siswa.uas + siswa.tugas) / 3);
            }
            return siswa;
        });

        res.json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.post('/api/simpan-nilai', async (req, res) => {
    const gradesData = req.body;  // Array berisi data nilai yang diterima dari frontend
    const nip = req.session.user?.id; // Ambil ID guru atau pengajar

    if (!nip) {
        return res.status(401).json({ message: 'User tidak terautentikasi.' });
    }

    // Validasi data
    if (!Array.isArray(gradesData) || gradesData.length === 0) {
        return res.status(400).json({ message: 'Tidak ada data nilai yang dikirim.' });
    }

    try {
        // Proses setiap data nilai
        for (const gradeData of gradesData) {
            const { nisn, grade, tahunAjaran, kelasId, matpelId, jenisNilai } = gradeData;

            // Cek apakah nilai sudah ada untuk siswa tersebut
            const checkQuery = `
                SELECT * FROM grades
                WHERE id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ? AND nisn = ?
            `;
            const [existingData] = await db.query(checkQuery, [tahunAjaran, kelasId, matpelId, jenisNilai, nisn]);

            if (existingData.length > 0) {
                // Update nilai jika sudah ada
                const updateQuery = `
                    UPDATE grades
                    SET grade = ?, nip = ?
                    WHERE id_tahun_ajaran = ? AND id_kelas = ? AND id_matpel = ? AND gradesType = ? AND nisn = ?
                `;
                await db.query(updateQuery, [grade, nip, tahunAjaran, kelasId, matpelId, jenisNilai, nisn]);
            } else {
                // Jika nilai belum ada, simpan sebagai data baru
                const insertQuery = `
                    INSERT INTO grades (id_tahun_ajaran, id_kelas, id_matpel, gradesType, grade, nisn, nip)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await db.query(insertQuery, [tahunAjaran, kelasId, matpelId, jenisNilai, grade, nisn, nip]);
            }
        }

        res.status(200).json({ message: 'Nilai berhasil disimpan.' });
    } catch (error) {
        console.error('Gagal menyimpan nilai:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan nilai.' });
    }
});

// Endpoint untuk menyimpan data absensi (tabel attendance)
app.post('/api/save-attendance', async (req, res) => {
    try {
        const { id_kelas, date } = req.body;

        console.log("Data yang diterima:", { id_kelas, date });

        if (!id_kelas || !date) {
            return res.status(400).json({ message: 'Missing required fields: id_kelas or date' });
        }

        await db.query('INSERT INTO attendance (id_kelas, date) VALUES (?, ?)', [id_kelas, date]);

        const [rows] = await db.query('SELECT id FROM attendance WHERE id_kelas = ? AND date = ?', [id_kelas, date]);

        if (rows.length > 0) {
            const newId = rows[0].id;
            console.log("ID baru:", newId);
            return res.json({ insertId: newId });
        } else {
            return res.status(400).json({ message: 'Failed to retrieve new attendance ID' });
        }
    } catch (error) {
        console.error("Error in save-attendance:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// endpoint untuk menyimpan detail absensi (tabel attendanceDetails)
app.post('/api/save-attendance-details', async (req, res) => {
    try {
        const { absensiId, absensiData } = req.body;

        if (!absensiId || !Array.isArray(absensiData)) {
            return res.status(400).json({ message: 'Missing or invalid data' });
        }

        console.log("Absensi ID:", absensiId);
        console.log("Data Absensi:", absensiData);

        const values = absensiData.map(item => [absensiId, item.nisn, item.status]);

        const [result] = await db.query(
            `
            INSERT INTO attendanceDetails (id_attendance, nisn, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                status = VALUES(status)
            `,
            [values]
        );

        if (result.affectedRows === 0) {
            throw new Error("Failed to insert or update attendance details");
        }

        res.json({ message: 'Attendance details saved successfully', result });
    } catch (error) {
        console.error("Error saving attendance details:", error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

// endpoint untuk mengambil data absensi (tabel attendanceDetails) dari data-absensi
app.get('/api/attendance-details', async (req, res) => {
   try {
        const { kelasId, date } = req.query;

        if (!kelasId || !date) {
            return res.status(400).json({ message: 'ID Kelas atau Tanggal tidak valid' });
        }

        console.log("Mengambil data absensi untuk:", { kelasId, date });

        const [results] = await db.query(
            `
            SELECT ad.id_attendance, ad.nisn, ad.status, s.nama_siswa
            FROM attendanceDetails AS ad
            INNER JOIN attendance AS a ON ad.id_attendance = a.id
            LEFT JOIN siswa AS s ON s.nisn = ad.nisn  -- Menggunakan LEFT JOIN
            WHERE a.id_kelas = ? AND a.date = ?;

            `,
            [kelasId, date]
        );

        if (results.length > 0) {
            console.log("Data absensi ditemukan:", results);
            return res.json({ attendanceDetails: results }); 
        } else {
            console.log("Tidak ada data absensi ditemukan.");
            return res.json({ attendanceDetails: [] }); 
        }
    } catch (error) {
        console.error("Error fetching attendance details:", error);
        return res.status(500).json({ message: 'Gagal memuat data absensi', error });
    }
});

app.put('/api/update-attendance-details', async (req, res) => {
    const { absensiId, absensiData } = req.body;

    // fungsi untuk memperbarui status absensi
    const result = await updateStatusAbsensi(absensiId, absensiData);

    if (result.success) {
        return res.json(result);
    } else {
        return res.status(500).json({ message: result.message, error: result.error });
    }
});

//route untuk menampilkan absensi per siswa yg login yang sudah guru wali kelas simpan
// berada di dashboard-siswa.html
app.get('/api/attendance-details-siswa', async (req, res) => {
    try {
        const { nisn, date } = req.query;

        if (!nisn) {
            return res.status(400).json({ message: 'NISN tidak valid' });
        }

        console.log("Mengambil data absensi untuk:", { nisn, date });

        let query = `
            SELECT ad.id_attendance, ad.nisn, ad.status, s.nama_siswa, a.date
            FROM attendanceDetails AS ad
            INNER JOIN attendance AS a ON ad.id_attendance = a.id
            LEFT JOIN siswa AS s ON s.nisn = ad.nisn
            WHERE ad.nisn = ?
        `;

        const params = [nisn];

        if (date) {
            query += ' AND a.date = ?';
            params.push(date);
        }

        query += ' ORDER BY a.date DESC, ad.id DESC';

        const [results] = await db.query(query, params);

        if (results.length > 0) {
            const formattedResults = results.map(record => {
                const rawDate = new Date(record.date);
                const formattedDate = [
                    String(rawDate.getDate()).padStart(2, '0'),
                    String(rawDate.getMonth() + 1).padStart(2, '0'),
                    rawDate.getFullYear()
                ].join('-');

                return {
                    ...record,
                    date: formattedDate,
                };
            });

            console.log("Data absensi ditemukan:", formattedResults);
            return res.json({ attendanceDetails: formattedResults });
        } else {
            console.log("Tidak ada data absensi ditemukan.");
            return res.json({ attendanceDetails: [] });
        }
    } catch (error) {
        console.error("Error fetching attendance details:", error);
        return res.status(500).json({ message: 'Gagal memuat data absensi', error });
    }
});

// endpoint untuk lupa pasword yang membedakannya itu role (pegawai/siswa)
//berada di file lupapassword.html
app.post('/api/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email } = req.body;
  
    if (role !== 'pegawai' && role !== 'siswa') {
      return res.status(400).json({ success: false, message: 'Role tidak valid' });
    }

    if (!email || !role) {
    return res.status(400).json({ success: false, message: 'Email and Role are required' });
  }
  
    const table = role === 'pegawai' ? 'pegawai' : 'siswa';
    const nameColumn = role === 'pegawai' ? 'nama_pegawai' : 'nama_siswa';
  
    try {
      const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: 'Email tidak ditemukan' });
      }
  
      const user = results[0];
  
      const token = crypto.randomBytes(20).toString('hex');

      const resetLink = `http://localhost:3000/reset-password/${role}?email=${email}&token=${token}`;
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        text: `Halo ${user.name}, klik link berikut untuk mereset password Anda: ${resetLink}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.json({
        success: true,
        message: `Link reset password telah dikirim ke email ${email} (${user.name})`,
        name: user.name,
        email: email,
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  });

  // endpoint untuk menampilkan buat kata sandi baru
  // berada di di file sandi.html
  app.get('/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email } = req.query;
    console.log(`Role: ${role}, Email: ${email}`);
  
    if (!email) {
      return res.status(400).send('Email is required');
    }
  
    const table = role === 'pegawai' ? 'pegawai' : 'siswa';
    const nameColumn = role === 'pegawai' ? 'nama_pegawai' : 'nama_siswa';
  
    try {
      const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE email = ?`, [email]);
  
      if (results.length === 0) {
        return res.status(400).send('Email not found');
      }
  
      const user = results[0];
  
      const filePath = path.join(__dirname, 'frontend', 'html', 'sandi.html');
  
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).send('Error loading page');
        }
  
        let htmlContent = data;
        htmlContent = htmlContent
          .replace('<%= role %>', role)
          .replace('<%= email %>', email)
          .replace('<%= name %>', user.name);
  
        res.send(htmlContent); 
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).send('Error occurred while processing the request');
    }
  });  

  // endpoint untuk mengubah/update password setelah button reset password di klik
  // berada di file sandi.html
  app.put('/reset-password/:role', async (req, res) => {
    const { role } = req.params;
    const { email, newPassword, confirmPassword } = req.body;
  
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Email, New Password, and Confirm Password are required' });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Password and confirm password must match' });
    }
  
    try {
      // tergantung dari role masing-masing yang membedakan itu yaitu email
      const table = role === 'pegawai' ? 'pegawai' : 'siswa';
  
      // untuk mengupdate password yg membedakan itu email nya, makanya bisa di update
      const updateResult = await db.execute(
        `UPDATE ${table} SET password = ?, last_password_update = NOW() WHERE email = ?`,
        [newPassword, email]
      );
  
      console.log('updateResult:', updateResult);
  
      if (updateResult.changedRows > 0) {
        return res.json({ success: true, message: 'Password berhasil diubah' });
      } 
      
    } catch (error) {
      console.error('Error during password update:', error);
      return res.status(500).json({ success: false, message: 'An error occurred during the password update' });
    }
  });

  // endpoint untuk reset password setelah login
  app.get('/reset-password-after-login', async (req, res) => {
    const loginSebagai = req.session.user ? req.session.user.login_sebagai : null;
    const userId = req.session.user ? req.session.user.id : null;

    console.log('Login Sebagai:', loginSebagai); 
    console.log('User ID:', userId);

    if (!loginSebagai || !userId) {
        return res.status(400).send('Role and User ID are required');
    }

    try {
        const table = loginSebagai === 'Pegawai' ? 'pegawai' : 'siswa';
        const idColumn = loginSebagai === 'Pegawai' ? 'nip' : 'nisn';
        const nameColumn = loginSebagai === 'Pegawai' ? 'nama_pegawai' : 'nama_siswa';

        const [results] = await db.execute(`SELECT ${nameColumn} AS name FROM ${table} WHERE ${idColumn} = ?`, [userId]);

        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];

        const filePath = path.join(__dirname, 'frontend', 'html', 'sandi-stlh-login.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading HTML file:', err);
                return res.status(500).send('Error loading page');
            }

            let htmlContent = data;
            htmlContent = htmlContent
                .replace('<%= role %>', loginSebagai)
                .replace('<%= name %>', user.name);

            res.send(htmlContent);
        });
    } catch (err) {
        console.error('Error occurred while processing the request:', err);
        return res.status(500).send('Error occurred while processing the request');
    }
});

// endpoint untuk mengubah kata sandi setelah login
app.put('/reset-password-after-login', async (req, res) => {
    console.log('Request body:', req.body);
    const loginSebagai = req.session.user ? req.session.user.login_sebagai : null;
    const userId = req.session.user ? req.session.user.id : null;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'New Password and Confirm Password are required' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Password and confirm password must match' });
    }

    if (!loginSebagai || !userId) {
        return res.status(400).json({ success: false, message: 'Role and User ID are required' });
    }

    try {
        const table = loginSebagai === 'Pegawai' ? 'pegawai' : 'siswa';
        const idColumn = loginSebagai === 'Pegawai' ? 'nip' : 'nisn';

        console.log('Checking user with ID:', userId);

        const [user] = await db.execute(
            `SELECT password FROM ${table} WHERE ${idColumn} = ?`,
            [userId]
        );

        console.log('User fetched from database:', user);

        if (!user || user.length === 0) {
            return res.status(400).json({ success: false, message: 'Pengguna tidak ditemukan' });
        }

        if (user[0].password === newPassword) {
            return res.status(400).json({ success: false, message: 'Password baru sama dengan yang lama' });
        }

        const updateResult = await db.execute(
            `UPDATE ${table} SET password = ?, last_password_update = NOW() WHERE ${idColumn} = ?`,
            [newPassword, userId]
        );

        console.log('Update Result:', updateResult);

        if (updateResult.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
        } 

    } catch (error) {
        console.error('Error during password update:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});