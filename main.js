// main.js - JavaScript untuk Website Toko Arrahma

// Function untuk menampilkan section yang dipilih
function showSection(sectionId, event) {
    // Sembunyikan semua section
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Hapus kelas active dari semua tombol navigasi
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tampilkan section yang dipilih
    document.getElementById(sectionId).classList.add('active');
    
    // Tambahkan kelas active ke tombol yang diklik
    if(event) event.target.classList.add('active');
}

// Function untuk smooth scrolling
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Function untuk menampilkan loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.innerHTML = '<div class="spinner"></div><p>Memuat...</p>';
    document.body.appendChild(loader);
    
    setTimeout(() => {
        document.body.removeChild(loader);
    }, 1000);
}

// Function untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Styling notifikasi
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Function untuk validasi form
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#27ae60';
        }
    });
    
    return isValid;
}

// Function untuk format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
}

// Function untuk generate ID transaksi
function generateTransactionId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `TRX${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Function untuk mencetak struk
function printReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Pembayaran</title>
            <style>
                body { font-family: monospace; font-size: 12px; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 5px; text-align: left; }
                hr { border: 1px solid #000; }
                .center { text-align: center; }
                .right { text-align: right; }
            </style>
        </head>
        <body>
            ${receiptContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Function untuk export data ke CSV
function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(row => row.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function untuk backup data
function backupData() {
    const data = {
        inventory: JSON.parse(localStorage.getItem('inventory') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `backup_toko_arrahma_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function untuk restore data
function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('inventory', JSON.stringify(data.inventory));
            localStorage.setItem('transactions', JSON.stringify(data.transactions));
            showNotification('Data berhasil direstore!', 'success');
            // location.reload(); // jika ingin reload setelah restore
        } catch (err) {
            showNotification('Gagal restore data!', 'error');
        }
    };
    reader.readAsText(file);
}

// Inisialisasi Firestore
const db = firebase.firestore();

// Modal Login Kasir
const openKasirLogin = document.getElementById('openKasirLogin');
const kasirLoginModal = document.getElementById('kasirLoginModal');
const closeKasirLogin = document.getElementById('closeKasirLogin');
const kasirLoginForm = document.getElementById('kasirLoginForm');
const kasirLoginError = document.getElementById('kasirLoginError');

if (openKasirLogin && kasirLoginModal && closeKasirLogin && kasirLoginForm) {
    openKasirLogin.addEventListener('click', function(e) {
        e.preventDefault();
        kasirLoginModal.style.display = 'flex';
        kasirLoginError.style.display = 'none';
        kasirLoginForm.reset();
    });
    closeKasirLogin.addEventListener('click', function() {
        kasirLoginModal.style.display = 'none';
    });
    window.addEventListener('click', function(e) {
        if (e.target === kasirLoginModal) kasirLoginModal.style.display = 'none';
    });
    kasirLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        kasirLoginError.style.display = 'none';
        const email = document.getElementById('kasirEmail').value;
        const password = document.getElementById('kasirPassword').value;
        db.collection("users")
          .where("email", "==", email)
          .where("password", "==", password)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              sessionStorage.setItem('kasir_email', email); // Tambahkan baris ini
              window.location.href = "kasir.html";
            } else {
              kasirLoginError.textContent = "Email atau password salah!";
              kasirLoginError.style.display = 'block';
            }
          })
          .catch((error) => {
            kasirLoginError.textContent = error.message;
            kasirLoginError.style.display = 'block';
          });
    });
}

// Modal Register Kasir
const openRegisterModal = document.getElementById('openRegisterModal');
const registerModal = document.getElementById('registerModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const registerForm = document.getElementById('registerForm');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

if (openRegisterModal && registerModal && closeRegisterModal && registerForm) {
    openRegisterModal.addEventListener('click', function(e) {
        e.preventDefault();
        kasirLoginModal.style.display = 'none';
        registerModal.style.display = 'flex';
        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';
        registerForm.reset();
        console.log('Register modal opened');
    });
    closeRegisterModal.addEventListener('click', function() {
        registerModal.style.display = 'none';
        console.log('Register modal closed');
    });
    window.addEventListener('click', function(e) {
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
            console.log('Register modal closed by window click');
        }
    });
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';
        const nama = document.getElementById('registerNama').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        console.log('Register submit:', { nama, email, password });
        // Cek email sudah terdaftar
        db.collection('users').where('email', '==', email).get().then((snap) => {
            if (!snap.empty) {
                registerError.textContent = 'Email sudah terdaftar!';
                registerError.style.display = 'block';
                console.log('Email sudah terdaftar');
            } else {
                db.collection('users').add({
                    nama: nama,
                    email: email,
                    password: password
                }).then(() => {
                    registerSuccess.textContent = 'Registrasi berhasil! Silakan login.';
                    registerSuccess.style.display = 'block';
                    console.log('Registrasi berhasil');
                    setTimeout(() => {
                        registerModal.style.display = 'none';
                        kasirLoginModal.style.display = 'flex';
                    }, 1500);
                }).catch((err) => {
                    registerError.textContent = err.message;
                    registerError.style.display = 'block';
                    console.error('Gagal simpan ke Firestore:', err);
                });
            }
        }).catch((err) => {
            registerError.textContent = err.message;
            registerError.style.display = 'block';
            console.error('Gagal cek email di Firestore:', err);
        });
    });
}