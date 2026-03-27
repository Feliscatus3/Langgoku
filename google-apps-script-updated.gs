/**
 * LANGGOKU - Google Apps Script untuk Google Sheets Integration
 * Salin kode ini ke Google Apps Script Editor di Google Sheets Anda
 */

// ==============================
// KONFIGURASI GOOGLE SHEETS
// ==============================

const SPREADSHEET_ID = '1P7STjDhVEfCS8y55uWpYNE1nx54o6WEChuBMhR5psOE';
const SHEETS = {
  PRODUCTS: 'Produk',
  BUYERS: 'Pembeli',
  LOGS: 'Logs',
  SETTINGS: 'Pengaturan',
  PROMO_CODES: 'Kode Promo'
};

// ==============================
// MAIN HANDLER FUNCTIONS
// ==============================

function doGet(e) {
  const params = e ? e.parameter : {};
  const action = params.action || null;
  
  try {
    switch (action) {
      case 'getProducts':
        return getProducts();
      case 'getBuyers':
        return getBuyers();
      case 'getProduct':
        return getProduct(params.id || null);
      case 'getBuyer':
        return getBuyer(params.id || null);
      case 'getStats':
        return getStats();
      case 'getSettings':
        return getSettings();
      case 'getPromoCodes':
        return getPromoCodes();
      case 'validatePromoCode':
        return validatePromoCode(params.code || null);
      case 'testConnection':
        return testConnection();
      default:
        return sendResponse({
          success: false,
          message: 'Action tidak dikenali',
          availableActions: ['getProducts', 'getBuyers', 'getProduct', 'getBuyer', 'getStats', 'getSettings', 'getPromoCodes', 'validatePromoCode', 'testConnection']
        });
    }
  } catch (error) {
    logError('doGet', error);
    return sendResponse({ success: false, message: error.toString() });
  }
}

function doPost(e) {
  let params = {};
  
  try {
    if (e && e.parameter && e.parameter.action) {
      params.action = e.parameter.action;
    }
    
    if (e && e.postData && e.postData.contents) {
      try {
        const bodyParams = JSON.parse(e.postData.contents);
        params = { ...params, ...bodyParams };
      } catch (parseError) {
        const contents = e.postData.contents;
        if (contents.includes('=')) {
          const formParams = contents.split('&');
          formParams.forEach(function(item) {
            const pair = item.split('=');
            if (pair[0] && pair[1]) {
              params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
            }
          });
        }
      }
    }
    
    const action = params.action;
    
    if (!action) {
      return sendResponse({
        success: false,
        message: 'Action tidak ditemukan dalam request'
      });
    }
    
    console.log('doPost called with action:', action, 'params:', JSON.stringify(params));
    
    switch (action) {
      case 'addProduct':
        return addProduct(params);
      case 'updateProduct':
        return updateProduct(params);
      case 'deleteProduct':
        return deleteProduct(params.id);
      case 'addBuyer':
        return addBuyer(params);
      case 'updateBuyer':
        return updateBuyer(params);
      case 'deleteBuyer':
        return deleteBuyer(params.id);
      case 'saveSettings':
        return saveSettings(params);
      case 'addPromoCode':
        return addPromoCode(params);
      case 'updatePromoCode':
        return updatePromoCode(params);
      case 'deletePromoCode':
        return deletePromoCode(params.id);
      case 'sendNotification':
        return sendNotification(params);
      default:
        return sendResponse({
          success: false,
          message: 'Action tidak dikenali: ' + action
        });
    }
  } catch (error) {
    logError('doPost', error);
    return sendResponse({ success: false, message: error.toString() });
  }
}

// ==============================
// PRODUCT FUNCTIONS
// ==============================

function getProducts() {
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan. Jalankan initializeSheets() terlebih dahulu.' });
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return sendResponse({ success: true, data: [], count: 0 });
  }
  
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      products.push(objectToData(headers, data[i]));
    }
  }
  
  return sendResponse({ success: true, data: products, count: products.length });
}

function getProduct(id) {
  if (!id) return sendResponse({ success: false, message: 'ID produk diperlukan' });
  
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return sendResponse({ success: true, data: objectToData(headers, data[i]) });
    }
  }
  
  return sendResponse({ success: false, message: 'Produk tidak ditemukan' });
}

function addProduct(product) {
  console.log('addProduct called with:', JSON.stringify(product));
  
  if (!product) {
    return sendResponse({ success: false, message: 'Data produk tidak valid' });
  }
  
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan. Jalankan initializeSheets() terlebih dahulu.' });
  
  const newId = 'ID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const rowData = [
    newId,
    product.name || '',
    parseNumber(product.price),
    product.duration || '',
    parseNumber(product.stock),
    product.description || '',
    new Date().toLocaleString('id-ID'),
    product.image || ''
  ];
  
  sheet.appendRow(rowData);
  
  console.log('Product added with ID:', newId);
  
  return sendResponse({
    success: true,
    message: 'Produk berhasil ditambahkan',
    data: { id: newId }
  });
}

function updateProduct(product) {
  console.log('updateProduct called with:', JSON.stringify(product));
  
  if (!product || !product.id) {
    return sendResponse({ success: false, message: 'ID produk diperlukan' });
  }
  
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === product.id) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(product.name || '');
      sheet.getRange(row, 3).setValue(parseNumber(product.price));
      sheet.getRange(row, 4).setValue(product.duration || '');
      sheet.getRange(row, 5).setValue(parseNumber(product.stock));
      sheet.getRange(row, 6).setValue(product.description || '');
      
      return sendResponse({ success: true, message: 'Produk berhasil diperbarui' });
    }
  }
  
  return sendResponse({ success: false, message: 'Produk tidak ditemukan' });
}

function deleteProduct(id) {
  if (!id) return sendResponse({ success: false, message: 'ID produk diperlukan' });
  
  const sheet = getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Produk tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return sendResponse({ success: true, message: 'Produk berhasil dihapus' });
    }
  }
  
  return sendResponse({ success: false, message: 'Produk tidak ditemukan' });
}

// ==============================
// BUYER FUNCTIONS
// ==============================

function getBuyers() {
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return sendResponse({ success: true, data: [], count: 0 });
  }
  
  const headers = data[0];
  const buyers = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      buyers.push(objectToData(headers, data[i]));
    }
  }
  
  return sendResponse({ success: true, data: buyers, count: buyers.length });
}

function getBuyer(id) {
  if (!id) return sendResponse({ success: false, message: 'ID pembeli diperlukan' });
  
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return sendResponse({ success: true, data: objectToData(headers, data[i]) });
    }
  }
  
  return sendResponse({ success: false, message: 'Pembeli tidak ditemukan' });
}

function addBuyer(buyer) {
  console.log('addBuyer called with:', JSON.stringify(buyer));
  
  if (!buyer) {
    return sendResponse({ success: false, message: 'Data pembeli tidak valid' });
  }
  
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan. Jalankan initializeSheets() terlebih dahulu.' });
  
  const newId = 'BY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const rowData = [
    newId,
    buyer.name || '',
    buyer.phone || '',
    buyer.product || '',
    buyer.duration || '',
    buyer.startDate || new Date().toISOString().split('T')[0],
    buyer.endDate || '',
    'active',
    0,
    false,
    '',
    buyer.googleSheetId || '',
    buyer.paymentMethod || 'QRIS',
    buyer.adminPhone || '',
    new Date().toLocaleString('id-ID')
  ];
  
  sheet.appendRow(rowData);
  
  return sendResponse({
    success: true,
    message: 'Data pembeli berhasil ditambahkan',
    data: { id: newId }
  });
}

function updateBuyer(buyer) {
  if (!buyer || !buyer.id) {
    return sendResponse({ success: false, message: 'ID pembeli diperlukan' });
  }
  
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === buyer.id) {
      const row = i + 1;
      sheet.getRange(row, 2).setValue(buyer.name || '');
      sheet.getRange(row, 3).setValue(buyer.phone || '');
      sheet.getRange(row, 4).setValue(buyer.product || '');
      sheet.getRange(row, 5).setValue(buyer.duration || '');
      sheet.getRange(row, 6).setValue(buyer.startDate || '');
      sheet.getRange(row, 7).setValue(buyer.endDate || '');
      sheet.getRange(row, 12).setValue(buyer.googleSheetId || '');
      sheet.getRange(row, 13).setValue(buyer.paymentMethod || 'QRIS');
      sheet.getRange(row, 14).setValue(buyer.adminPhone || '');
      
      return sendResponse({ success: true, message: 'Data pembeli berhasil diperbarui' });
    }
  }
  
  return sendResponse({ success: false, message: 'Pembeli tidak ditemukan' });
}

function deleteBuyer(id) {
  if (!id) return sendResponse({ success: false, message: 'ID pembeli diperlukan' });
  
  const sheet = getSheetByName(SHEETS.BUYERS);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Pembeli tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return sendResponse({ success: true, message: 'Data pembeli berhasil dihapus' });
    }
  }
  
  return sendResponse({ success: false, message: 'Pembeli tidak ditemukan' });
}

// ==============================
// SETTINGS FUNCTIONS
// ==============================

function getSettings() {
  const sheet = getSheetByName(SHEETS.SETTINGS);
  if (!sheet) {
    return createSettingsSheet();
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return sendResponse({ success: true, data: null, message: 'Belum ada pengaturan' });
  }
  
  // Get the last row (most recent settings)
  const lastRow = data.length - 1;
  const settingsData = {
    googleSheetId: data[lastRow][1] || '',
    adminPhone: data[lastRow][2] || '',
    storeEmail: data[lastRow][3] || '',
    storeName: data[lastRow][4] || 'Langgoku',
    storeDescription: data[lastRow][5] || '',
    notificationEnabled: data[lastRow][6] !== false
  };
  
  return sendResponse({ success: true, data: settingsData });
}

function saveSettings(settings) {
  console.log('saveSettings called with:', JSON.stringify(settings));
  
  if (!settings) {
    return sendResponse({ success: false, message: 'Data pengaturan tidak valid' });
  }
  
  const sheet = getSheetByName(SHEETS.SETTINGS);
  if (!sheet) {
    createSettingsSheet();
    return saveSettings(settings);
  }
  
  const rowData = [
    'SET_' + Date.now(),
    settings.googleSheetId || '',
    settings.adminPhone || '',
    settings.storeEmail || '',
    settings.storeName || 'Langgoku',
    settings.storeDescription || '',
    settings.notificationEnabled !== false,
    new Date().toLocaleString('id-ID')
  ];
  
  sheet.appendRow(rowData);
  
  console.log('Settings saved successfully');
  
  return sendResponse({
    success: true,
    message: 'Pengaturan berhasil disimpan',
    data: settings
  });
}

function createSettingsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  if (!ss.getSheetByName(SHEETS.SETTINGS)) {
    const settingsSheet = ss.insertSheet(SHEETS.SETTINGS);
    settingsSheet.appendRow([
      'ID', 
      'Google Sheet ID', 
      'No WhatsApp Admin', 
      'Email Toko', 
      'Nama Toko', 
      'Deskripsi Toko',
      'Notifikasi Aktif',
      'Tanggal Update'
    ]);
  }
  
  return getSheetByName(SHEETS.SETTINGS);
}

// ==============================
// PROMO CODE FUNCTIONS
// ==============================

function getPromoCodes() {
  const sheet = getSheetByName(SHEETS.PROMO_CODES);
  if (!sheet) {
    createPromoCodesSheet();
    return sendResponse({ success: true, data: [], count: 0 });
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return sendResponse({ success: true, data: [], count: 0 });
  }
  
  const headers = data[0];
  const promoCodes = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      promoCodes.push(objectToData(headers, data[i]));
    }
  }
  
  return sendResponse({ success: true, data: promoCodes, count: promoCodes.length });
}

function validatePromoCode(code) {
  if (!code) return sendResponse({ success: false, message: 'Kode promo diperlukan' });
  
  const sheet = getSheetByName(SHEETS.PROMO_CODES);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Kode Promo tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][1].toUpperCase() === code.toUpperCase()) {
      const promoData = objectToData(headers, data[i]);
      
      // Check if promo is active and not expired
      const now = new Date();
      const expiryDate = promoData['Tanggal Kadaluarsa'] ? new Date(promoData['Tanggal Kadaluarsa']) : null;
      
      if (promoData['Status'] !== 'Aktif') {
        return sendResponse({ success: false, message: 'Kode promo tidak aktif' });
      }
      
      if (expiryDate && expiryDate < now) {
        return sendResponse({ success: false, message: 'Kode promo sudah expired' });
      }
      
      // Check usage limit
      const usageLimit = parseNumber(promoData['Batas Penggunaan']);
      const currentUsage = parseNumber(promoData[' Penggunaan Saat Ini'] || 0);
      
      if (usageLimit > 0 && currentUsage >= usageLimit) {
        return sendResponse({ success: false, message: 'Kode promo sudah mencapai batas penggunaan' });
      }
      
      return sendResponse({
        success: true,
        data: promoData,
        message: 'Kode promo valid'
      });
    }
  }
  
  return sendResponse({ success: false, message: 'Kode promo tidak ditemukan' });
}

function addPromoCode(promo) {
  console.log('addPromoCode called with:', JSON.stringify(promo));
  
  if (!promo || !promo.code) {
    return sendResponse({ success: false, message: 'Data kode promo tidak valid' });
  }
  
  const sheet = getSheetByName(SHEETS.PROMO_CODES);
  if (!sheet) {
    createPromoCodesSheet();
    return addPromoCode(promo);
  }
  
  const newId = 'PROMO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const rowData = [
    newId,
    promo.code.toUpperCase(),
    promo.discount || 0,
    promo.discountType || 'percentage',
    promo.description || '',
    promo.usageLimit || 0,
    0,
    promo.minPurchase || 0,
    promo.maxDiscount || 0,
    promo.expiryDate || '',
    'Aktif',
    new Date().toLocaleString('id-ID')
  ];
  
  sheet.appendRow(rowData);
  
  console.log('Promo code added with ID:', newId);
  
  return sendResponse({
    success: true,
    message: 'Kode promo berhasil ditambahkan',
    data: { id: newId }
  });
}

function updatePromoCode(promo) {
  if (!promo || !promo.id) {
    return sendResponse({ success: false, message: 'ID kode promo diperlukan' });
  }
  
  const sheet = getSheetByName(SHEETS.PROMO_CODES);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Kode Promo tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === promo.id) {
      const row = i + 1;
      if (promo.code) sheet.getRange(row, 2).setValue(promo.code.toUpperCase());
      if (promo.discount !== undefined) sheet.getRange(row, 3).setValue(promo.discount);
      if (promo.discountType) sheet.getRange(row, 4).setValue(promo.discountType);
      if (promo.description !== undefined) sheet.getRange(row, 5).setValue(promo.description);
      if (promo.usageLimit !== undefined) sheet.getRange(row, 6).setValue(promo.usageLimit);
      if (promo.minPurchase !== undefined) sheet.getRange(row, 8).setValue(promo.minPurchase);
      if (promo.maxDiscount !== undefined) sheet.getRange(row, 9).setValue(promo.maxDiscount);
      if (promo.expiryDate !== undefined) sheet.getRange(row, 10).setValue(promo.expiryDate);
      if (promo.status) sheet.getRange(row, 11).setValue(promo.status);
      
      return sendResponse({ success: true, message: 'Kode promo berhasil diperbarui' });
    }
  }
  
  return sendResponse({ success: false, message: 'Kode promo tidak ditemukan' });
}

function deletePromoCode(id) {
  if (!id) return sendResponse({ success: false, message: 'ID kode promo diperlukan' });
  
  const sheet = getSheetByName(SHEETS.PROMO_CODES);
  if (!sheet) return sendResponse({ success: false, message: 'Sheet Kode Promo tidak ditemukan' });
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return sendResponse({ success: true, message: 'Kode promo berhasil dihapus' });
    }
  }
  
  return sendResponse({ success: false, message: 'Kode promo tidak ditemukan' });
}

function createPromoCodesSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  if (!ss.getSheetByName(SHEETS.PROMO_CODES)) {
    const promoSheet = ss.insertSheet(SHEETS.PROMO_CODES);
    promoSheet.appendRow([
      'ID',
      'Kode Promo',
      'Diskon',
      'Tipe Diskon',
      'Deskripsi',
      'Batas Penggunaan',
      'Penggunaan Saat Ini',
      'Minimal Pembelian',
      'Maksimal Diskon',
      'Tanggal Kadaluarsa',
      'Status',
      'Tanggal Dibuat'
    ]);
  }
  
  return getSheetByName(SHEETS.PROMO_CODES);
}

// ==============================
// UTILITY FUNCTIONS
// ==============================

function getSheetByName(name) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    return ss.getSheetByName(name);
  } catch (error) {
    Logger.log('Error getting sheet: ' + error.toString());
    return null;
  }
}

function objectToData(headers, row) {
  const obj = {};
  if (!headers || !row) return obj;
  
  for (let i = 0; i < headers.length; i++) {
    const headerName = headers[i];
    const value = row[i];
    if (headerName) {
      obj[headerName] = value !== undefined ? value : '';
    }
  }
  return obj;
}

function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function sendResponse(data) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    Logger.log('Error sending response: ' + e.toString());
    return ContentService
      .createTextOutput('{"success": false, "message": "Error creating response"}')
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getStats() {
  const productsSheet = getSheetByName(SHEETS.PRODUCTS);
  const buyersSheet = getSheetByName(SHEETS.BUYERS);
  const settingsSheet = getSheetByName(SHEETS.SETTINGS);
  const promoSheet = getSheetByName(SHEETS.PROMO_CODES);
  
  return sendResponse({
    success: true,
    stats: {
      totalProducts: productsSheet ? Math.max(0, productsSheet.getLastRow() - 1) : 0,
      totalBuyers: buyersSheet ? Math.max(0, buyersSheet.getLastRow() - 1) : 0,
      totalPromoCodes: promoSheet ? Math.max(0, promoSheet.getLastRow() - 1) : 0,
      settingsExist: settingsSheet ? true : false,
      lastUpdated: new Date().toLocaleString('id-ID')
    }
  });
}

function logError(action, error) {
  try {
    const sheet = getSheetByName(SHEETS.LOGS);
    if (sheet) {
      const errorMsg = error ? error.toString() : 'Unknown error';
      sheet.appendRow([
        new Date().toLocaleString('id-ID'),
        action || 'unknown',
        errorMsg.substring(0, 500),
        'system'
      ]);
    }
  } catch (e) {
    Logger.log('Error logging: ' + e.toString());
  }
}

// ==============================
// INIT FUNCTION
// ==============================

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  if (!ss.getSheetByName(SHEETS.PRODUCTS)) {
    const productsSheet = ss.insertSheet(SHEETS.PRODUCTS);
    productsSheet.appendRow(['ID', 'Nama Produk', 'Harga', 'Durasi', 'Stok', 'Deskripsi', 'Tanggal Dibuat', 'Gambar URL']);
  }
  
  if (!ss.getSheetByName(SHEETS.BUYERS)) {
    const buyersSheet = ss.insertSheet(SHEETS.BUYERS);
    buyersSheet.appendRow([
      'ID', 'Nama', 'No WhatsApp', 'Produk', 'Durasi', 
      'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Sisa Hari', 
      'Notified', 'Notified At', 'Google Sheet ID', 
      'Metode Pembayaran', 'No Admin WhatsApp', 'Tanggal Input'
    ]);
  }
  
  if (!ss.getSheetByName(SHEETS.LOGS)) {
    const logsSheet = ss.insertSheet(SHEETS.LOGS);
    logsSheet.appendRow(['Waktu', 'Action', 'Error', 'User']);
  }
  
  if (!ss.getSheetByName(SHEETS.SETTINGS)) {
    const settingsSheet = ss.insertSheet(SHEETS.SETTINGS);
    settingsSheet.appendRow([
      'ID', 'Google Sheet ID', 'No WhatsApp Admin', 'Email Toko', 
      'Nama Toko', 'Deskripsi Toko', 'Notifikasi Aktif', 'Tanggal Update'
    ]);
  }
  
  if (!ss.getSheetByName(SHEETS.PROMO_CODES)) {
    const promoSheet = ss.insertSheet(SHEETS.PROMO_CODES);
    promoSheet.appendRow([
      'ID', 'Kode Promo', 'Diskon', 'Tipe Diskon', 'Deskripsi',
      'Batas Penggunaan', 'Penggunaan Saat Ini', 'Minimal Pembelian',
      'Maksimal Diskon', 'Tanggal Kadaluarsa', 'Status', 'Tanggal Dibuat'
    ]);
  }
  
  return 'Sheets initialized: Produk, Pembeli, Logs, Pengaturan, Kode Promo';
}

function testConnection() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const productsSheet = ss.getSheetByName(SHEETS.PRODUCTS);
    const buyersSheet = ss.getSheetByName(SHEETS.BUYERS);
    const logsSheet = ss.getSheetByName(SHEETS.LOGS);
    const settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);
    const promoSheet = ss.getSheetByName(SHEETS.PROMO_CODES);
    
    return sendResponse({
      success: true,
      message: 'Koneksi berhasil! Spreadsheet: ' + ss.getName(),
      spreadsheetId: SPREADSHEET_ID,
      sheets: {
        Produk: productsSheet ? 'ready' : 'not found',
        Pembeli: buyersSheet ? 'ready' : 'not found',
        Logs: logsSheet ? 'ready' : 'not found',
        Pengaturan: settingsSheet ? 'ready' : 'not found',
        'Kode Promo': promoSheet ? 'ready' : 'not found'
      },
      productsCount: productsSheet ? productsSheet.getLastRow() - 1 : 0,
      buyersCount: buyersSheet ? buyersSheet.getLastRow() - 1 : 0,
      promoCodesCount: promoSheet ? promoSheet.getLastRow() - 1 : 0
    });
  } catch (error) {
    return sendResponse({
      success: false,
      message: 'Koneksi gagal: ' + error.toString()
    });
  }
}