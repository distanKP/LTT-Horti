/**
 * Si-Cabe NTT (Sistem Catatan Bersama Hortikultura NTT) - backend Google Sheets (Apps Script Web App)
 *
 * Cara pakai:
 * 1. Buat Google Sheet baru, lalu buka Extensions > Apps Script.
 * 2. Tempel seluruh kode ini, simpan.
 * 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 4. Salin URL Web App ke konstanta APPS_SCRIPT_URL di index.html.
 *
 * Tab dibuat otomatis: Laporan_Harian, Laporan_Panen, Target_Bulanan, Users.
 * Opsional: jalankan fungsi setup() sekali dari editor agar keempat tab langsung dibuat.
 * Setiap kali kode ini diubah, buat Deploy > Manage deployments > Edit > New version.
 */
function setup() {
  Object.keys(SHEETS).forEach(function (n) { getSheet_(n); });
  var def = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && SpreadsheetApp.getActiveSpreadsheet().getSheets().length > 1) {
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(def);
  }
}

var SHEETS = {
  Laporan_Harian: ['id', 'tanggal', 'kab', 'kec', 'kom', 'ha', 'by', 'ts'],
  Laporan_Panen: ['id', 'tanggal', 'kab', 'kec', 'kom', 'ha', 'by', 'ts'],
  Target_Bulanan: ['id', 'bulan', 'kab', 'kom', 'ha'],
  Users: ['username', 'kab', 'role', 'hash']
};
var TZ = 'Asia/Makassar';

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  var cols = SHEETS[name];
  if (cols.indexOf('tanggal') > -1) {
    // Simpan tanggal sebagai teks agar tidak diubah otomatis menjadi tipe Date.
    sh.getRange(2, cols.indexOf('tanggal') + 1, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('@');
  }
  return sh;
}

function readAll_(name) {
  var sh = getSheet_(name), cols = SHEETS[name];
  var last = sh.getLastRow();
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, cols.length).getValues();
  return vals.map(function (row) {
    var o = {};
    cols.forEach(function (c, i) {
      var v = row[i];
      if (v instanceof Date) v = Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
      o[c] = v;
    });
    return o;
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  if (action === 'all') {
    return json_({
      laporan: readAll_('Laporan_Harian'),
      panen: readAll_('Laporan_Panen'),
      target: readAll_('Target_Bulanan'),
      users: readAll_('Users')
    });
  }
  return json_({ ok: true, app: 'Si-Cabe NTT (Sistem Catatan Bersama Hortikultura NTT)' });
}

function findRow_(sh, key) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(key)) return i + 2;
  return -1;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = JSON.parse(e.postData.contents), sh = getSheet_(p.sheet), cols = SHEETS[p.sheet];
    if (!cols) return json_({ ok: false, error: 'sheet tidak dikenal' });
    if (p.action === 'upsert' || p.action === 'upsertMany') {
      var list = p.action === 'upsert' ? [p.row] : p.rows;
      list.forEach(function (obj) {
        var row = cols.map(function (c) { return obj[c] === undefined ? '' : obj[c]; });
        var at = findRow_(sh, obj[cols[0]]);
        if (at < 0) at = sh.getLastRow() + 1;
        if (cols.indexOf('tanggal') > -1) sh.getRange(at, cols.indexOf('tanggal') + 1).setNumberFormat('@');
        sh.getRange(at, 1, 1, cols.length).setValues([row]);
      });
      return json_({ ok: true });
    }
    if (p.action === 'delete') {
      var r = findRow_(sh, p.id);
      if (r > 0) sh.deleteRow(r);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'aksi tidak dikenal' });
  } finally {
    lock.releaseLock();
  }
}
