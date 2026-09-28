// Deploy as a Web App: Execute as me, Who has access: Anyone.
// Set the SHARED_SECRET Script Property before deploying.
// The script uses Landing signups, Landing survey, and Landing events tabs.
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    if (!payload.secret || payload.secret !== props.getProperty('SHARED_SECRET')) {
      return ContentService.createTextOutput(JSON.stringify({ok:false,error:'unauthorized'}));
    }
    if (!['Signups','Survey','Events'].includes(payload.kind)) {
      return ContentService.createTextOutput(JSON.stringify({ok:false,error:'unknown_kind'}));
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const book = SpreadsheetApp.openById('11wq2GAgAA2YAX1QnMNdTusN9KI60vdKefr-RwoTWxmM');
      const tabName = {'Signups':'Landing signups','Survey':'Landing survey','Events':'Landing events'}[payload.kind];
      const sheet = book.getSheetByName(tabName) || book.insertSheet(tabName);
      const flat = flatten(payload.row || {});
      flat.received_at = new Date().toISOString();
      const last = sheet.getLastColumn();
      const current = last ? sheet.getRange(1,1,1,last).getValues()[0].filter(Boolean) : [];
      const headers = [...current];
      Object.keys(flat).forEach(key => { if (!headers.includes(key)) headers.push(key); });
      if (headers.length > current.length) {
        sheet.getRange(1,1,1,headers.length).setValues([headers]);
        sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#24302e').setFontColor('#f5eee2');
        sheet.setFrozenRows(1);
      }
      sheet.appendRow(headers.map(key => flat[key] === undefined ? '' : flat[key]));
    } finally { lock.releaseLock(); }
    return ContentService.createTextOutput(JSON.stringify({ok:true}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(error)}));
  }
}

function flatten(value, prefix = '', out = {}) {
  Object.keys(value).forEach(key => {
    const name = prefix ? prefix + '_' + key : key;
    const item = value[key];
    if (item && typeof item === 'object' && !Array.isArray(item)) flatten(item, name, out);
    else out[name] = Array.isArray(item) ? item.join('; ') : (item ?? '');
  });
  return out;
}