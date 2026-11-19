const API = '/api';
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const M = (n) => 'M' + Number(n).toFixed(2);
const SIZES = ['SMALL', 'MEDIUM', 'LARGE'];
const PROVINCES = ['Gauteng','Free State','KwaZulu-Natal','Western Cape','Eastern Cape','Limpopo','Mpumalanga','North West'];
let fruits = [], vendors = [], suppliers = [], stock = [];

async function api(path, method = 'GET', body) {
  try {
    const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (e) {
    throw new Error(e.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running on port 3000?' : e.message);
  }
}
function say(text, bad) { $('#msg').innerHTML = `<div class="${bad ? 'err' : ''}">${esc(text)}</div>`; }
const formData = (f) => Object.fromEntries(new FormData(f));
const table = (heads, rows) => `<div class="table-wrap"><table><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.join('') || `<tr><td colspan="${heads.length}">Nothing here yet.</td></tr>`}</table></div>`;
const opts = (list, id, label) => list.map((x) => `<option value="${x[id]}">${esc(x[label])}</option>`).join('');

const tabs = {
  async stock() {
    const [st, low, bal] = await Promise.all([api('/stock'), api('/stock/low'), api('/vendors/balances')]);
    stock = st;
    $('#view').innerHTML = `
      <section><h2>Low stock</h2>${low.length ? table(['Fruit', 'Size', 'Boxes left', 'Alert at'],
        low.map((l) => `<tr><td>${esc(l.fruit_name)}</td><td>${l.packaging_size}</td><td class="low">${l.available_quantity}</td><td>${l.low_stock_threshold}</td></tr>`)) : '<p>All sizes are above their alert level.</p>'}</section>
      <section><h2>Stock by size</h2>${table(['Fruit', 'Size', 'Boxes', 'Price per box'],
        st.map((s) => `<tr><td>${esc(s.fruit_name)}</td><td>${s.packaging_size}</td><td>${s.available_quantity}</td><td>${M(s.selling_price)}</td></tr>`))}</section>
      <section><h2>Who owes us</h2>${table(['Vendor', 'Billed', 'Paid', 'Balance'],
        bal.map((b) => `<tr><td>${esc(b.vendor_name)}</td><td>${M(b.total_billed)}</td><td>${M(b.total_paid)}</td><td class="${b.outstanding_balance > 0 ? 'low' : ''}">${M(b.outstanding_balance)}</td></tr>`))}</section>`;
  },

  async sell() { await lines('sale'); },
  async buy() { await lines('purchase'); },

  async vendors() {
    vendors = await api('/vendors');
    $('#view').innerHTML = `
      <section><h2>Register vendor</h2><form id="f">
        <label>Name<input name="vendor_name" required></label><label>Phone<input name="phone_number" required></label>
        <label>Location<input name="location" required></label><button class="go">Save vendor</button></form></section>
      <section><h2>Find a vendor</h2><form id="s"><label>Name or phone<input name="q"></label><button class="go">Search</button></form>
        <div id="vlist"></div></section>`;
    const show = (list) => $('#vlist').innerHTML = table(['Name', 'Phone', 'Location', 'Registered'],
      list.map((v) => `<tr><td>${esc(v.vendor_name)}</td><td>${esc(v.phone_number)}</td><td>${esc(v.location)}</td><td>${String(v.registration_date).slice(0, 10)}</td></tr>`));
    show(vendors);
    $('#f').onsubmit = submit(async (e) => { await api('/vendors', 'POST', formData(e.target)); say('Vendor saved.'); tabs.vendors(); });
    $('#s').onsubmit = submit(async (e) => show(await api('/vendors?search=' + encodeURIComponent(formData(e.target).q))));
  },

  async suppliers() {
    suppliers = await api('/suppliers');
    $('#view').innerHTML = `
      <section><h2>Register supplier</h2><form id="f">
        <label>Business<input name="business_name" required></label><label>Contact person<input name="contact_person" required></label>
        <label>Phone<input name="phone" required></label><label>Province<select name="province">${PROVINCES.map((p) => `<option>${p}</option>`).join('')}</select></label>
        <label>Address<input name="address" required></label><button class="go">Save supplier</button></form></section>
      <section><h2>Suppliers</h2>${table(['Business', 'Contact', 'Phone', 'Province', ''],
        suppliers.map((s) => `<tr><td>${esc(s.business_name)}</td><td>${esc(s.contact_person)}</td><td>${esc(s.phone)}</td><td>${esc(s.province)}</td>
          <td><button class="ghost" data-del="${s.supplier_id}">Delete</button></td></tr>`))}</section>`;
    $('#f').onsubmit = submit(async (e) => { await api('/suppliers', 'POST', formData(e.target)); say('Supplier saved.'); tabs.suppliers(); });
    document.querySelectorAll('[data-del]').forEach((b) => b.onclick = submit(async () => {
      if (confirm('Delete this supplier?')) { await api('/suppliers/' + b.dataset.del, 'DELETE'); say('Supplier deleted.'); tabs.suppliers(); }
    }));
  },

  async reports() {
    const [top, tv] = await Promise.all([api('/reports/top-fruits'), api('/reports/top-vendor')]);
    const m = new Date().toISOString().slice(0, 7);
    $('#view').innerHTML = `
      <section><h2>Revenue between two dates</h2><form id="f">
        <label>From<input type="date" name="from" value="${m}-01" required></label><label>To<input type="date" name="to" value="${new Date().toISOString().slice(0, 10)}" required></label>
        <button class="go">Show revenue</button></form><p id="rev" class="total"></p></section>
      <section><h2>Five most sold fruits</h2>${table(['Fruit', 'Boxes sold'], top.map((t) => `<tr><td>${esc(t.fruit_name)}</td><td>${t.boxes_sold}</td></tr>`))}</section>
      <section><h2>Biggest buyer</h2><p>${tv ? `${esc(tv.vendor_name)} with ${tv.boxes_bought} boxes` : 'No sales yet.'}</p></section>`;
    $('#f').onsubmit = submit(async (e) => {
      const { from, to } = formData(e.target); const r = await api(`/reports/revenue?from=${from}&to=${to}`);
      $('#rev').textContent = `${M(r.revenue)} from ${r.sales_count} sale(s)`;
    });
  },
};

// Shared form for sales and purchases: several fruit rows, total worked out live
async function lines(kind) {
  const isSale = kind === 'sale';
  [fruits, stock] = await Promise.all([api('/fruits'), api('/stock')]);
  const parties = isSale ? await api('/vendors') : await api('/suppliers');
  $('#view').innerHTML = `<section><h2>${isSale ? 'Record a sale' : 'Record a purchase'}</h2>
    <label>${isSale ? 'Vendor' : 'Supplier'}<select id="party">${isSale ? opts(parties, 'vendor_id', 'vendor_name') : opts(parties, 'supplier_id', 'business_name')}</select></label><br>
    <div id="rows"></div><button class="ghost" id="add">Add another fruit</button>
    <p class="total" id="tot"></p>
    ${isSale ? `<form id="pay"><label>Paid now (M)<input type="number" min="0" step="0.01" id="paid" value="0"></label>
      <label>Method<select id="method"><option value="CASH">Cash</option><option value="MOBILE_MONEY">Mobile money</option></select></label></form><br>` : ''}
    <button class="go" id="send">${isSale ? 'Save sale' : 'Save purchase'}</button></section>`;
  const rows = $('#rows');
  const price = (r) => isSale ? (stock.find((s) => s.fruit_id == r.querySelector('.fr').value && s.packaging_size === r.querySelector('.sz').value) || {}).selling_price || 0
    : Number(r.querySelector('.uc').value || 0);
  const recalc = () => { let t = 0; rows.querySelectorAll('.row').forEach((r) => t += price(r) * Number(r.querySelector('.q').value || 0)); $('#tot').textContent = 'Total: ' + M(t); };
  const addRow = () => {
    const r = document.createElement('div'); r.className = 'row';
    r.innerHTML = `<label>Fruit<select class="fr">${opts(fruits, 'fruit_id', 'fruit_name')}</select></label>
      <label>Size<select class="sz">${SIZES.map((s) => `<option>${s}</option>`).join('')}</select></label>
      <label>Boxes<input class="q" type="number" min="1" value="1"></label>
      ${isSale ? '<span class="pr"></span>' : '<label>Cost per box<input class="uc" type="number" min="0.01" step="0.01" value="50"></label>'}
      <button class="ghost" type="button">Remove</button>`;
    r.querySelector('button').onclick = () => { r.remove(); recalc(); };
    r.oninput = recalc; rows.appendChild(r); recalc();
  };
  addRow(); $('#add').onclick = addRow;
  $('#send').onclick = submit(async () => {
    const items = [...rows.querySelectorAll('.row')].map((r) => ({
      fruit_id: Number(r.querySelector('.fr').value), packaging_size: r.querySelector('.sz').value, quantity: Number(r.querySelector('.q').value),
      ...(isSale ? {} : { unit_cost: Number(r.querySelector('.uc').value) }) }));
    const body = isSale ? { vendor_id: Number($('#party').value), items, amount_paid: Number($('#paid').value), method: $('#method').value }
      : { supplier_id: Number($('#party').value), items };
    const r = await api(isSale ? '/sales' : '/purchases', 'POST', body);
    say(isSale ? `Sale saved. Total ${M(r.total_amount)}, still owed ${M(r.outstanding_balance)} (${r.payment_status}).` : `Purchase saved. Total ${M(r.total_amount)}. Stock updated.`);
    tabs[isSale ? 'sell' : 'buy']();
  });
}

// Wraps handlers so any error shows as a message instead of breaking the page
function submit(fn) { return async (e) => { e && e.preventDefault && e.preventDefault(); try { await fn(e); } catch (err) { say(err.message, true); } }; }

$('#nav').onclick = (e) => {
  const t = e.target.dataset.tab; if (!t) return;
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('on', b === e.target));
  $('#msg').innerHTML = ''; tabs[t]().catch((err) => say(err.message, true));
};
tabs.stock().catch((err) => say(err.message, true));
