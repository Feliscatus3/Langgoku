/**
 * LANGGOKU - Google Apps Script untuk Google Sheets Integration
 * Salin kode ini ke Google Apps Script Editor di Google Sheets Anda
 * 
 * Langkah-langkah setup:
 * 1. Buka https://docs.google.com/spreadsheets
 * 2. Buat spreadsheet baru atau buka yang sudah ada
 * 3. Klik Extensions > Apps Script
 * 4. Hapus kode default dan salin seluruh kode dari file ini
 * 5. Simpan dengan nama project (contoh: "Langgoku API")
 * 6. Jalankan fungsi doGet atau doPost untuk deploy
 * 7. Klik Deploy > New deployment > Web app
 * 8. Pilih Execute as: Your Account
 * 9. Pilih Who has access: Anyone
 * 10. Copy URL deployment dan gunakan di aplikasi Anda
 */

// ==============================
// KONFIGURASI GOOGLE SHEETS
// ==============================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Ganti dengan ID spreadsheet Anda
const SHEETS = {
  PRODUCTS: 'Produk',
  BUYERS: 'Pembeli',
  LOGS: 'Logs'
};

// ==============================
// MAIN HANDLER FUNCTIONS
// ==============================

/**
 * Handle GET requests untuk membaca data
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getProducts':
        return getProducts();
      case 'getBuyers':
        return getBuyers();
      case 'getProduct':
        return getProduct(e.parameter.id);
      case 'getBuyer':
        return getBuyer(e.parameter.id);
      case 'getStats':
        return getStats();
      default:
        return sendResponse({
          success: false,
          message: 'Action tidak dikenali',
          availableActions: ['getProducts', 'getBuyers', 'getProduct', 'getBuyer', 'getStats']
        }, 400);
    }
  } catch (error) {
    logError(action, error);
    return sendResponse({ success: false, message: error.toString() }, 500);
  }
}

/**
 * Handle POST requests untuk menambah/mengubah data
 */
function doPost(e) {
  const action = e.parameter.action;
  const payload = JSON.parse(e.postData.contents);
  
  try {
    switch (action) {
      case 'addProduct':
        return addProduct(payload);
      case 'updateProduct':
        return updateProduct(payload);
      case 'deleteProduct':
        return deleteProduct(payload.id);
      case 'addBuyer':
        return addBuyer(payload);
      case 'updateBuyer':
        return updateBuyer(payload);
      case 'deleteBuyer':
        return deleteBuyer(payload.id);
      case 'sendNotification':
        return sendNotification(payload);
      default:
        return sendResponse({
          success: false,
          message: 'Action tidak dikenali',
          availableActions: ['addProduct', 'updateProduct', 'deleteProduct', 'addBuyer', 'updateBuyer', 'deleteBuyer', 'sendNotification']
        }, 400);
    }
  } catch (error) {
    logError(action, error);
    return sendResponse({ success: false, message: error.toString() }, 500);
  }
}

// ==============================
// PRODUCT FUNCTIONS
// ==============================

function getProducts() {
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' }, 404);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Check if row is not empty
      products.push(objectToData(headers, data[i]));
    }
  }
  
  return sendResponse({
    success: true,
    data: products,
    count: products.length
  });
}

function getProduct(id) {
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' }, 404);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return sendResponse({
        success: true,
        data: objectToData(headers, data[i])
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Produk tidak ditemukan' }, 404);
}

function addProduct(product) {
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' }, 404);
  
  const data = [
    generateId(),
    product.name || '',
    product.price || 0,
    product.duration || '',
    product.stock || 0,
    product.description || '',
    new Date().toLocaleString('id-ID'),
    product.image || ''
  ];
  
  sheet.appendRow(data);
  
  return sendResponse({
    success: true,
    message: 'Produk berhasil ditambahkan',
    data: { id: data[0] }
  });
}

function updateProduct(product) {
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' }, 404);
  
  const range = sheet.getDataRange();
  const data = range.getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === product.id) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(product.name);
      sheet.getRange(row, 3).setValue(product.price);
      sheet.getRange(row, 4).setValue(product.duration);
      sheet.getRange(row, 5).setValue(product.stock);
      sheet.getRange(row, 6).setValue(product.description);
      
      return sendResponse({
        success: true,
        message: 'Produk berhasil diperbarui'
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Produk tidak ditemukan' }, 404);
}

function deleteProduct(id) {
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' }, 404);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return sendResponse({
        success: true,
        message: 'Produk berhasil dihapus'
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Produk tidak ditemukan' }, 404);
}

// ==============================
// BUYER FUNCTIONS
// ==============================

function getBuyers() {
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' }, 404);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const buyers = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      buyers.push(objectToData(headers, data[i]));
    }
  }
  
  return sendResponse({
    success: true,
    data: buyers,
    count: buyers.length
  });
}

function getBuyer(id) {
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' }, 404);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return sendResponse({
        success: true,
        data: objectToData(headers, data[i])
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Pembeli tidak ditemukan' }, 404);
}

function addBuyer(buyer) {
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' }, 404);
  
  const data = [
    generateId(),
    buyer.name || '',
    buyer.phone || '',
    buyer.product || '',
    buyer.duration || '',
    buyer.startDate || new Date().toISOString().split('T')[0],
    buyer.endDate || '',
    'active',
    0, // remainingDays
    false, // notified
    '', // notificationSentAt
    buyer.googleSheetId || '',
    buyer.paymentMethod || 'QRIS',
    buyer.adminPhone || '',
    new Date().toLocaleString('id-ID')
  ];
  
  sheet.appendRow(data);
  
  return sendResponse({
    success: true,
    message: 'Data pembeli berhasil ditambahkan',
    data: { id: data[0] }
  });
}

function updateBuyer(buyer) {
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' }, 404);
  
  const range = sheet.getDataRange();
  const data = range.getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === buyer.id) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(buyer.name);
      sheet.getRange(row, 3).setValue(buyer.phone);
      sheet.getRange(row, 4).setValue(buyer.product);
      sheet.getRange(row, 5).setValue(buyer.duration);
      sheet.getRange(row, 6).setValue(buyer.startDate);
      sheet.getRange(row, 7).setValue(buyer.endDate);
      sheet.getRange(row, 12).setValue(buyer.googleSheetId);
      sheet.getRange(row, 13).setValue(buyer.paymentMethod);
      sheet.getRange(row, 14).setValue(buyer.adminPhone);
      
      return sendResponse({
        success: true,
        message: 'Data pembeli berhasil diperbarui'
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Pembeli tidak ditemukan' }, 404);
}

function deleteBuyer(id) {
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' }, 404);
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return sendResponse({
        success: true,
        message: 'Data pembeli berhasil dihapus'
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Pembeli tidak ditemukan' }, 404);
}

// ==============================
// UTILITY FUNCTIONS
// ==============================

function getSheetByName(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name);
}

function objectToData(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

function generateId() {
  return 'ID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function sendResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStats() {
  const productsSheet = getSheetByName(SHEETS.PRODUCTS);
  const buyersSheet = getSheetByName(SHEETS.BUYERS);
  
  return sendResponse({
    success: true,
    stats: {
      totalProducts: productsSheet ? productsSheet.getLastRow() - 1 : 0,
      totalBuyers: buyersSheet ? buyersSheet.getLastRow() - 1 : 0,
      lastUpdated: new Date().toLocaleString('id-ID')
    }
  });
}

function logError(action, error) {
  try {
    const sheet = getSheetByName(SHEETS.LOGS);
    if (sheet) {
      sheet.appendRow([
        new Date().toLocaleString('id-ID'),
        action,
        error.toString(),
        Session.getEffectiveUser().getEmail()
      ]);
    }
  } catch (e) {
    Logger.log('Error logging: ' + e);
  }
}

// ==============================
// INIT FUNCTION (Jalankan sekali untuk setup)
// ==============================

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create Products sheet if not exists
  if (!ss.getSheetByName(SHEETS.PRODUCTS)) {
    const productsSheet = ss.insertSheet(SHEETS.PRODUCTS);
    productsSheet.appendRow(['ID', 'Nama Produk', 'Harga', 'Durasi', 'Stok', 'Deskripsi', 'Tanggal Dibuat', 'Gambar URL']);
  }
  
  // Create Buyers sheet if not exists
  if (!ss.getSheetByName(SHEETS.BUYERS)) {
    const buyersSheet = ss.insertSheet(SHEETS.BUYERS);
    buyersSheet.appendRow([
      'ID',
      'Nama',
      'No WhatsApp',
      'Produk',
      'Durasi',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Status',
      'Sisa Hari',
      'Notified',
      'Notified At',
      'Google Sheet ID',
      'Metode Pembayaran',
      'No Admin WhatsApp',
      'Tanggal Input'
    ]);
  }
  
  // Create Logs sheet if not exists
  if (!ss.getSheetByName(SHEETS.LOGS)) {
    const logsSheet = ss.insertSheet(SHEETS.LOGS);
    logsSheet.appendRow(['Waktu', 'Action', 'Error', 'User']);
  }
  
  Logger.log('Sheets initialized successfully!');
}

/**
 * TEST FUNCTIONS - Uncomment untuk testing
 */

// Uncomment untuk test addProduct
/*
function testAddProduct() {
  const result = addProduct({
    name: 'Netflix Premium',
    price: 50000,
    duration: '1 bulan',
    stock: 100,
    description: 'Akun Netflix Premium dengan fitur lengkap'
  });
  Logger.log(JSON.stringify(result));
}
*/

// Uncomment untuk test getProducts
/*
function testGetProducts() {
  const result = getProducts();
  Logger.log(JSON.stringify(result));
}
*/

// Uncomment untuk test addBuyer
/*
function testAddBuyer() {
  const result = addBuyer({
    name: 'John Doe',
    phone: '+628126543210',
    product: 'Netflix Premium',
    duration: '1 bulan',
    startDate: '2026-03-24',
    endDate: '2026-04-24',
    googleSheetId: 'abc123',
    paymentMethod: 'QRIS',
    adminPhone: '+628129876543'
  });
  Logger.log(JSON.stringify(result));
}
*/
