// Google Apps Script untuk Langgoku E-Commerce
// Deploy sebagai Web App untuk handle backend operations

const SHEET_ID = 'YOUR_SPREADSHEET_ID';

/**
 * Do GET request handler
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script running for Langgoku E-Commerce'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Do POST request handler
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'addBuyer':
        return addBuyer(data);
      case 'updateStock':
        return updateStock(data);
      case 'getBuyers':
        return getBuyers();
      default:
        return errorResponse('Unknown action');
    }
  } catch (error) {
    return errorResponse(error.toString());
  }
}

/**
 * Add buyer to the sheet
 */
function addBuyer(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('Buyers');
    
    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet('Buyers');
      sheet.appendRow(['ID', 'Name', 'Phone', 'Product', 'Duration', 'Start Date', 'End Date', 'Timestamp']);
    }

    const timestamp = new Date();
    const id = `buyer_${timestamp.getTime()}`;
    const row = [
      id,
      data.buyerName,
      data.buyerPhone,
      data.productName,
      data.duration,
      data.startDate,
      data.endDate,
      timestamp
    ];

    sheet.appendRow(row);

    return {
      status: 'success',
      message: 'Buyer added successfully',
      data: { id, ...data, timestamp }
    };
  } catch (error) {
    return errorResponse(error.toString());
  }
}

/**
 * Update product stock
 */
function updateStock(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Products');
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Find product by ID
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.productId) {
        sheet.getRange(i + 1, 5).setValue(data.newStock);
        return {
          status: 'success',
          message: 'Stock updated successfully',
          data: { productId: data.productId, newStock: data.newStock }
        };
      }
    }

    return errorResponse('Product not found');
  } catch (error) {
    return errorResponse(error.toString());
  }
}

/**
 * Get all buyers
 */
function getBuyers() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Buyers');
    
    if (!sheet) {
      return { status: 'success', data: [] };
    }

    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const buyers = values.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      phone: row[2],
      product: row[3],
      duration: row[4],
      startDate: row[5],
      endDate: row[6],
      timestamp: row[7]
    }));

    return { status: 'success', data: buyers };
  } catch (error) {
    return errorResponse(error.toString());
  }
}

/**
 * Helper: Error response
 */
function errorResponse(message) {
  return {
    status: 'error',
    message: message
  };
}

/**
 * Safe publish this as Web App:
 * 1. Project > New Deployment > Web App
 * 2. Execute as: "Your email"
 * 3. Who has access: "Anyone"
 * 4. Deploy
 * 5. Copy the URL dan save di .env.local sebagai GOOGLE_APPS_SCRIPT_URL
 */
