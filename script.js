(function (global) {
  "use strict";

  const STORAGE_KEY = "hisaabProStateV1";
  const COMPANY_BOOKS_KEY = "hisaabProCompanyBooksV1";
  const LEDGER_TYPES = ["Customer", "Supplier", "Sales", "Sales Return", "Purchase", "Purchase Return", "Cash", "Bank", "GST"];
  const OPENING_LEDGER_ID = "__opening_balance_equity__";
  const OPENING_LEDGER = {
    id: OPENING_LEDGER_ID,
    name: "Opening Balance Equity",
    type: "Capital",
    gstin: "",
    phone: "",
    openingBalance: 0,
    openingSide: "Cr",
    isVirtual: true
  };
  const CORE_LEDGER_TEMPLATES = [
    { name: "Cash in Hand", type: "Cash", openingSide: "Dr" },
    { name: "Bank Account", type: "Bank", openingSide: "Dr" },
    { name: "Sales Account", type: "Sales", openingSide: "Cr" },
    { name: "Sales Return Account", type: "Sales Return", openingSide: "Dr" },
    { name: "Purchase Account", type: "Purchase", openingSide: "Dr" },
    { name: "Purchase Return Account", type: "Purchase Return", openingSide: "Cr" },
    { name: "GST Payable", type: "GST", openingSide: "Cr" },
    { name: "Walk-in Customer", type: "Customer", openingSide: "Dr" },
    { name: "General Supplier", type: "Supplier", openingSide: "Cr" }
  ];
  const QUICK_LEDGER_GROUPS = [
    { name: "Bank Accounts", type: "Bank", hint: "Current account and savings bank ledgers" },
    { name: "Bank OCC A/c", type: "Bank", hint: "Open cash credit bank account" },
    { name: "Bank OD A/c", type: "Bank", hint: "Bank overdraft account" },
    { name: "Branch / Divisions", type: "Customer", hint: "Branch and division ledgers" },
    { name: "Capital Account", type: "Supplier", hint: "Owner capital or proprietor ledger" },
    { name: "Cash-in-Hand", type: "Cash", hint: "Cash sales, cash payments, petty cash" },
    { name: "Current Assets", type: "Customer", hint: "Short term asset ledgers" },
    { name: "Current Liabilities", type: "Supplier", hint: "Short term payable ledgers" },
    { name: "Deposits (Asset)", type: "Customer", hint: "Security deposits and refundable deposits" },
    { name: "Direct Expenses", type: "Purchase", hint: "Direct cost and expense ledgers" },
    { name: "Direct Incomes", type: "Sales", hint: "Direct income ledgers" },
    { name: "Duties & Taxes", type: "GST", hint: "GST and tax ledgers" },
    { name: "Expenses (Direct)", type: "Purchase", hint: "Direct expense ledgers" },
    { name: "Expenses (Indirect)", type: "Purchase", hint: "Office and admin expense ledgers" },
    { name: "Fixed Assets", type: "Customer", hint: "Plant, furniture, equipment assets" },
    { name: "Income (Direct)", type: "Sales", hint: "Direct income ledgers" },
    { name: "Income (Indirect)", type: "Sales", hint: "Indirect income ledgers" },
    { name: "Indirect Expenses", type: "Purchase", hint: "Office and admin expenses" },
    { name: "Indirect Incomes", type: "Sales", hint: "Other income ledgers" },
    { name: "Investments", type: "Customer", hint: "Investment ledgers" },
    { name: "Loans & Advances (Asset)", type: "Customer", hint: "Advances given and deposits" },
    { name: "Loans (Liability)", type: "Supplier", hint: "Borrowings and loans payable" },
    { name: "Misc. Expenses (ASSET)", type: "Customer", hint: "Deferred or miscellaneous asset ledgers" },
    { name: "Provisions", type: "Supplier", hint: "Provision ledgers" },
    { name: "Purchase Accounts", type: "Purchase", hint: "Purchase and cost ledgers" },
    { name: "Purchase Return", type: "Purchase Return", hint: "Purchase return and debit note ledgers" },
    { name: "Reserves & Surplus", type: "Supplier", hint: "Reserve and retained surplus ledgers" },
    { name: "Retained Earnings", type: "Supplier", hint: "Retained profit and earnings ledgers" },
    { name: "Sales Accounts", type: "Sales", hint: "Sales revenue ledgers" },
    { name: "Sales Return", type: "Sales Return", hint: "Sales return and credit note ledgers" },
    { name: "Secured Loans", type: "Supplier", hint: "Secured borrowings" },
    { name: "Stock-in-Hand", type: "Purchase", hint: "Inventory and stock ledgers" },
    { name: "Sundry Creditors", type: "Supplier", hint: "Supplier parties and payables" },
    { name: "Sundry Debtors", type: "Customer", hint: "Customer parties and receivables" },
    { name: "Suspense A/c", type: "Customer", hint: "Temporary adjustment ledgers" },
    { name: "Unsecured Loans", type: "Supplier", hint: "Unsecured borrowings" }
  ];
  const DEFAULT_VOUCHER_PREFIXES = {
    sales: "INV",
    "credit-note": "CN",
    "sales-order": "SO",
    "delivery-challan": "DC",
    purchase: "PUR",
    "debit-note": "DN",
    "purchase-order": "PO",
    payment: "PAY",
    contra: "CON",
    receipt: "REC",
    journal: "JRN"
  };
  const PREFIX_INPUTS = {
    sales: "prefixSales",
    purchase: "prefixPurchase",
    receipt: "prefixReceipt",
    payment: "prefixPayment",
    "credit-note": "prefixCreditNote",
    "debit-note": "prefixDebitNote",
    contra: "prefixContra",
    journal: "prefixJournal",
    "sales-order": "prefixSalesOrder",
    "purchase-order": "prefixPurchaseOrder",
    "delivery-challan": "prefixDeliveryChallan"
  };
  const INDIA_STATES = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];
  const SECTION_TITLES = {
    dashboard: "Dashboard",
    "today-entry": "Today Entry",
    "all-entries": "All Entries",
    company: "Company",
    ledgers: "Ledgers",
    "stock-items": "Stock Items",
    "item-profit": "Item Profit",
    vouchers: "Vouchers",
    sales: "Sales Invoice",
    "credit-note": "Credit Note",
    "sales-order": "Sales Order",
    "delivery-challan": "Delivery Challan",
    purchase: "Purchase Voucher",
    "debit-note": "Debit Note",
    "purchase-order": "Purchase Order",
    payment: "Payment Voucher",
    contra: "Contra Voucher",
    receipt: "Receipt Voucher",
    journal: "Journal Voucher",
    "ledger-report": "Ledger Report",
    outstanding: "Outstanding",
    "invoice-outstanding": "Invoice Outstanding",
    "day-book": "Day Book",
    "cash-bank-book": "Cash/Bank Book",
    "stock-ledger": "Stock Ledger",
    ageing: "Ageing",
    "audit-check": "Audit Check",
    invoice: "Invoice",
    "gst-reports": "GST Reports",
    "trial-balance": "Trial Balance",
    "profit-loss": "Profit & Loss",
    "balance-sheet": "Balance Sheet",
    customize: "Customize"
  };
  const CUSTOM_SCREEN_LABELS = {
    company: "Company",
    ledgers: "Ledgers",
    "stock-items": "Stock Items",
    sales: "Sales Invoice",
    "credit-note": "Credit Note",
    "sales-order": "Sales Order",
    "delivery-challan": "Delivery Challan",
    purchase: "Purchase Voucher",
    "debit-note": "Debit Note",
    "purchase-order": "Purchase Order",
    payment: "Payment Voucher",
    contra: "Contra Voucher",
    receipt: "Receipt Voucher",
    journal: "Journal Voucher"
  };
  const CUSTOM_BUTTON_TARGETS = {
    dashboard: "Dashboard",
    "today-entry": "Today Entry",
    "all-entries": "All Entries",
    company: "Company",
    ledgers: "Ledgers",
    "stock-items": "Stock Items",
    "item-profit": "Item Profit",
    vouchers: "Vouchers",
    sales: "Sales Invoice",
    "credit-note": "Credit Note",
    "sales-order": "Sales Order",
    "delivery-challan": "Delivery Challan",
    purchase: "Purchase Voucher",
    "debit-note": "Debit Note",
    "purchase-order": "Purchase Order",
    payment: "Payment Voucher",
    contra: "Contra Voucher",
    receipt: "Receipt Voucher",
    journal: "Journal Voucher",
    "ledger-report": "Ledger Report",
    outstanding: "Outstanding",
    "invoice-outstanding": "Invoice Outstanding",
    "day-book": "Day Book",
    "cash-bank-book": "Cash/Bank Book",
    "stock-ledger": "Stock Ledger",
    ageing: "Ageing",
    "audit-check": "Audit Check",
    invoice: "Invoice",
    "gst-reports": "GST Reports",
    "trial-balance": "Trial Balance",
    "profit-loss": "Profit & Loss",
    "balance-sheet": "Balance Sheet",
    customize: "Customize"
  };
  const VOUCHER_SECTIONS = [
    "payment",
    "contra",
    "receipt",
    "journal",
    "sales",
    "purchase",
    "sales-order",
    "purchase-order",
    "delivery-challan",
    "debit-note",
    "credit-note"
  ];
  const ITEM_VOUCHER_TYPES = ["sales", "purchase", "credit-note", "debit-note", "sales-order", "purchase-order", "delivery-challan"];

  const moneyFormat = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function round2(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function money(value) {
    return "Rs. " + moneyFormat.format(round2(value));
  }

  function numberToWordsUnderThousand(value) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    let number = Math.floor(Number(value) || 0);
    const words = [];
    if (number >= 100) {
      words.push(ones[Math.floor(number / 100)] + " Hundred");
      number %= 100;
    }
    if (number >= 20) {
      words.push(tens[Math.floor(number / 10)]);
      number %= 10;
    }
    if (number > 0) words.push(ones[number]);
    return words.join(" ");
  }

  function amountInWords(value) {
    let number = Math.floor(round2(value || 0));
    if (!number) return "Zero Rupees Only";
    const parts = [];
    const groups = [
      { label: "Crore", value: 10000000 },
      { label: "Lakh", value: 100000 },
      { label: "Thousand", value: 1000 },
      { label: "", value: 1 }
    ];
    groups.forEach((group) => {
      const count = Math.floor(number / group.value);
      if (!count) return;
      parts.push(numberToWordsUnderThousand(count) + (group.label ? " " + group.label : ""));
      number %= group.value;
    });
    return parts.join(" ") + " Rupees Only";
  }

  function parseAmount(value) {
    return round2(String(value || "").replace(/,/g, ""));
  }

  function today() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function calculateGst(taxable, cgstRate, sgstRate, isInterstate = false) {
    const base = round2(taxable);
    const rate = round2(parseAmount(cgstRate) + parseAmount(sgstRate));
    const gst = round2(base * rate / 100);
    const igst = isInterstate ? gst : 0;
    const cgst = isInterstate ? 0 : round2(gst / 2);
    const sgst = isInterstate ? 0 : round2(gst - cgst);
    return {
      taxable: base,
      cgst,
      sgst,
      igst,
      gstTotal: round2(cgst + sgst + igst),
      total: round2(base + cgst + sgst + igst),
      taxMode: isInterstate ? "IGST" : "CGST_SGST"
    };
  }

  function cleanItem(item) {
    return {
      stockItemId: String(item.stockItemId || "").trim(),
      name: String(item.name || item.itemName || "").trim(),
      hsn: String(item.hsn || item.hsnSac || "").trim(),
      quantity: parseAmount(item.quantity ?? item.qty),
      unit: String(item.unit || "Nos").trim() || "Nos",
      rate: parseAmount(item.rate),
      gstRate: parseAmount(item.gstRate ?? item.gst)
    };
  }

  function cleanStockItem(item) {
    return {
      id: String(item.id || "").trim(),
      name: String(item.name || "").trim(),
      hsn: String(item.hsn || item.hsnSac || "").trim(),
      unit: String(item.unit || "Nos").trim() || "Nos",
      gstRate: parseAmount(item.gstRate ?? item.gst),
      openingQty: parseAmount(item.openingQty),
      openingRate: parseAmount(item.openingRate),
      purchaseRate: parseAmount(item.purchaseRate),
      saleRate: parseAmount(item.saleRate),
      minStockLevel: parseAmount(item.minStockLevel ?? item.minimumStock ?? item.minStock)
    };
  }

  function calculateItem(item, isInterstate = false) {
    const clean = cleanItem(item);
    const taxable = round2(clean.quantity * clean.rate);
    const gst = round2(taxable * clean.gstRate / 100);
    const igst = isInterstate ? gst : 0;
    const cgst = isInterstate ? 0 : round2(gst / 2);
    const sgst = isInterstate ? 0 : round2(gst - cgst);
    return {
      ...clean,
      taxable,
      gst,
      cgst,
      sgst,
      igst,
      total: round2(taxable + gst)
    };
  }

  function calculateItems(items, isInterstate = false) {
    const rows = (Array.isArray(items) ? items : []).map((item) => calculateItem(item, isInterstate));
    const totals = rows.reduce((sum, row) => {
      sum.taxable = round2(sum.taxable + row.taxable);
      sum.gstTotal = round2(sum.gstTotal + row.gst);
      sum.cgst = round2(sum.cgst + row.cgst);
      sum.sgst = round2(sum.sgst + row.sgst);
      sum.igst = round2(sum.igst + row.igst);
      sum.total = round2(sum.total + row.total);
      return sum;
    }, { taxable: 0, gstTotal: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
    return { rows, ...totals, taxMode: isInterstate ? "IGST" : "CGST_SGST" };
  }

  function itemsFromTransaction(tx) {
    if (Array.isArray(tx.items) && tx.items.length) {
      return tx.items.map(cleanItem);
    }
    if (isInventoryTransaction(tx.type)) {
      const gstRate = parseAmount(tx.cgstRate) + parseAmount(tx.sgstRate);
      return [{
        name: tx.description || "Item",
        hsn: "",
        quantity: 1,
        unit: "Nos",
        rate: parseAmount(tx.taxable),
        gstRate
      }];
    }
    return [];
  }

  function transactionPartyState(tx, appState) {
    if (tx && INDIA_STATES.includes(tx.partyState)) return tx.partyState;
    const ledger = appState && tx && Array.isArray(appState.ledgers)
      ? appState.ledgers.find((item) => item.id === tx.partyLedgerId)
      : null;
    return ledger && INDIA_STATES.includes(ledger.state) ? ledger.state : "";
  }

  function transactionCompanyState(tx, appState) {
    if (tx && INDIA_STATES.includes(tx.companyState)) return tx.companyState;
    const company = appState && appState.company ? appState.company : null;
    return company && INDIA_STATES.includes(company.state) ? company.state : "";
  }

  function isInterstateTransaction(tx, appState) {
    const companyState = transactionCompanyState(tx, appState);
    const partyState = transactionPartyState(tx, appState);
    return Boolean(companyState && partyState && companyState !== partyState);
  }

  function productKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function sortByDateAsc(a, b) {
    const dateSort = String(a.date).localeCompare(String(b.date));
    if (dateSort !== 0) return dateSort;
    return String(a.voucherNo).localeCompare(String(b.voucherNo));
  }

  function purchaseProductCatalog(appState) {
    const source = appState && Array.isArray(appState.transactions) ? appState : { transactions: [] };
    const catalog = new Map();
    const purchases = source.transactions
      .filter((tx) => tx.type === "purchase")
      .sort(sortByDateAsc);

    purchases.forEach((tx) => {
      itemsFromTransaction(tx).forEach((item) => {
        const clean = cleanItem(item);
        const key = productKey(clean.name);
        if (!key) return;
        const existing = catalog.get(key) || {
          key,
          name: clean.name,
          hsn: "",
          unit: "Nos",
          gstRate: 0,
          lastPurchaseRate: 0,
          lastPurchaseDate: "",
          lastPurchaseVoucher: "",
          purchaseQty: 0,
          soldQty: 0
        };

        existing.name = clean.name || existing.name;
        existing.hsn = clean.hsn || existing.hsn;
        existing.unit = clean.unit || existing.unit;
        existing.gstRate = clean.gstRate;
        existing.lastPurchaseRate = clean.rate;
        existing.purchaseRate = clean.rate;
        existing.lastPurchaseDate = tx.date || existing.lastPurchaseDate;
        existing.lastPurchaseVoucher = tx.voucherNo || existing.lastPurchaseVoucher;
        existing.purchaseQty = round2(existing.purchaseQty + clean.quantity);
        catalog.set(key, existing);
      });
    });

    source.transactions
      .filter((tx) => tx.type === "sales")
      .forEach((tx) => {
        itemsFromTransaction(tx).forEach((item) => {
          const clean = cleanItem(item);
          const key = productKey(clean.name);
          const existing = catalog.get(key);
          if (!existing) return;
          existing.soldQty = round2(existing.soldQty + clean.quantity);
        });
      });

    return Array.from(catalog.values())
      .map((item) => ({
        ...item,
        stock: round2(item.purchaseQty - item.soldQty)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function findPurchasedProductByName(name, appState) {
    const key = productKey(name);
    if (!key) return null;
    return inventoryProductCatalog(appState).find((product) => product.key === key) || null;
  }

  function stockItemById(appState, id) {
    return appState && Array.isArray(appState.stockItems)
      ? appState.stockItems.find((item) => item.id === id) || null
      : null;
  }

  function inventoryProductCatalog(appState) {
    const source = appState && Array.isArray(appState.transactions) ? appState : { transactions: [], stockItems: [] };
    const catalog = new Map();

    (Array.isArray(source.stockItems) ? source.stockItems : []).forEach((item) => {
      const clean = cleanStockItem(item);
      const key = productKey(clean.name);
      if (!clean.id || !key) return;
      catalog.set(key, {
        key,
        stockItemId: clean.id,
        name: clean.name,
        hsn: clean.hsn,
        unit: clean.unit,
        gstRate: clean.gstRate,
        openingQty: clean.openingQty,
        openingRate: clean.openingRate,
        purchaseRate: clean.purchaseRate || clean.openingRate,
        saleRate: clean.saleRate,
        minStockLevel: clean.minStockLevel,
        lastPurchaseRate: clean.purchaseRate || clean.openingRate,
        lastPurchaseDate: "",
        lastPurchaseVoucher: "",
        purchaseQty: clean.openingQty,
        soldQty: 0
      });
    });

    source.transactions
      .filter((tx) => ["purchase", "sales", "credit-note", "debit-note"].includes(tx.type))
      .sort(sortByDateAsc)
      .forEach((tx) => {
        itemsFromTransaction(tx).forEach((item) => {
          const clean = cleanItem(item);
          const master = clean.stockItemId ? stockItemById(source, clean.stockItemId) : null;
          const name = master ? master.name : clean.name;
          const key = productKey(name);
          if (!key) return;

          const current = catalog.get(key);
          if (!current && tx.type !== "purchase" && !master) return;

          const existing = current || {
            key,
            stockItemId: clean.stockItemId || "",
            name,
            hsn: "",
            unit: "Nos",
            gstRate: 0,
            openingQty: 0,
            openingRate: 0,
            purchaseRate: 0,
            saleRate: 0,
            minStockLevel: master ? master.minStockLevel || 0 : 0,
            lastPurchaseRate: 0,
            lastPurchaseDate: "",
            lastPurchaseVoucher: "",
            purchaseQty: 0,
            soldQty: 0
          };

          existing.stockItemId = existing.stockItemId || clean.stockItemId || (master ? master.id : "");
          existing.name = name || existing.name;
          existing.hsn = clean.hsn || (master ? master.hsn : "") || existing.hsn;
          existing.unit = clean.unit || (master ? master.unit : "") || existing.unit;
          existing.gstRate = clean.gstRate || (master ? master.gstRate : existing.gstRate);
          existing.minStockLevel = master ? master.minStockLevel || 0 : existing.minStockLevel || 0;

          if (tx.type === "purchase") {
            existing.purchaseQty = round2(existing.purchaseQty + clean.quantity);
            existing.purchaseRate = clean.rate;
            existing.lastPurchaseRate = clean.rate;
            existing.lastPurchaseDate = tx.date || existing.lastPurchaseDate;
            existing.lastPurchaseVoucher = tx.voucherNo || existing.lastPurchaseVoucher;
          }
          if (tx.type === "sales") existing.soldQty = round2(existing.soldQty + clean.quantity);
          if (tx.type === "credit-note") existing.soldQty = round2(existing.soldQty - clean.quantity);
          if (tx.type === "debit-note") existing.purchaseQty = round2(existing.purchaseQty - clean.quantity);
          catalog.set(key, existing);
        });
      });

    return Array.from(catalog.values())
      .map((item) => ({
        ...item,
        stock: round2(item.purchaseQty - item.soldQty)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function costRateMap(appState) {
    const source = appState && Array.isArray(appState.transactions) ? appState : { transactions: [], stockItems: [] };
    const rates = new Map();
    const setRate = (keys, qty, value, fallbackRate) => {
      keys.filter(Boolean).forEach((key) => {
        const existing = rates.get(key) || { qty: 0, value: 0, fallbackRate: 0 };
        existing.qty = round2(existing.qty + qty);
        existing.value = round2(existing.value + value);
        if (fallbackRate) existing.fallbackRate = fallbackRate;
        rates.set(key, existing);
      });
    };

    (Array.isArray(source.stockItems) ? source.stockItems : []).forEach((item) => {
      const clean = cleanStockItem(item);
      const key = productKey(clean.name);
      const fallback = clean.purchaseRate || clean.openingRate || clean.saleRate || 0;
      setRate([clean.id, key], clean.openingQty, round2(clean.openingQty * (clean.openingRate || fallback)), fallback);
    });

    (Array.isArray(source.transactions) ? source.transactions : [])
      .filter((tx) => tx.type === "purchase" || tx.type === "debit-note")
      .sort(sortByDateAsc)
      .forEach((tx) => {
        const sign = tx.type === "debit-note" ? -1 : 1;
        itemsFromTransaction(tx).forEach((item) => {
          const clean = cleanItem(item);
          const master = clean.stockItemId ? stockItemById(source, clean.stockItemId) : null;
          const name = master ? master.name : clean.name;
          setRate(
            [clean.stockItemId, productKey(name)],
            sign * clean.quantity,
            sign * round2(clean.quantity * clean.rate),
            clean.rate
          );
        });
      });

    const output = new Map();
    rates.forEach((row, key) => {
      output.set(key, row.qty > 0 ? round2(row.value / row.qty) : row.fallbackRate);
    });
    return output;
  }

  function itemProfitRows(appState, fromDate = "", toDate = "") {
    const source = appState && Array.isArray(appState.transactions) ? appState : { transactions: [], stockItems: [] };
    const costs = costRateMap(source);
    const rows = new Map();
    source.transactions
      .filter((tx) => ["sales", "credit-note"].includes(tx.type))
      .filter((tx) => (!fromDate || tx.date >= fromDate) && (!toDate || tx.date <= toDate))
      .forEach((tx) => {
        const sign = tx.type === "credit-note" ? -1 : 1;
        const isInterstate = isInterstateTransaction(tx, source);
        calculateItems(itemsFromTransaction(tx), isInterstate).rows.forEach((item) => {
          const master = item.stockItemId ? stockItemById(source, item.stockItemId) : null;
          const name = master ? master.name : item.name;
          const key = item.stockItemId || productKey(name);
          if (!key) return;
          const row = rows.get(key) || {
            key,
            name,
            hsn: item.hsn || (master ? master.hsn : ""),
            unit: item.unit || (master ? master.unit : "Nos"),
            quantity: 0,
            salesValue: 0,
            costRate: costs.get(item.stockItemId) || costs.get(productKey(name)) || (master ? master.purchaseRate || master.openingRate : 0) || 0,
            costValue: 0,
            profit: 0,
            margin: 0
          };
          const qty = sign * item.quantity;
          const salesValue = sign * item.taxable;
          row.quantity = round2(row.quantity + qty);
          row.salesValue = round2(row.salesValue + salesValue);
          row.costValue = round2(row.costValue + qty * row.costRate);
          row.profit = round2(row.salesValue - row.costValue);
          row.margin = row.salesValue ? round2(row.profit / row.salesValue * 100) : 0;
          rows.set(key, row);
        });
      });
    return Array.from(rows.values())
      .filter((row) => row.quantity || row.salesValue || row.costValue || row.profit)
      .sort((a, b) => b.profit - a.profit);
  }

  function transactionTotals(tx) {
    const appState = typeof document === "undefined" ? null : state;
    const isInterstate = isInterstateTransaction(tx, appState);
    if (Array.isArray(tx.items) && tx.items.length) {
      return calculateItems(tx.items, isInterstate);
    }
    return calculateGst(tx.taxable, tx.cgstRate, tx.sgstRate, isInterstate);
  }

  function blankState() {
    return {
      version: 1,
      company: null,
      ledgers: [],
      stockItems: [],
      transactions: [],
      customFields: [],
      customButtons: [],
      nextIds: {
        ledger: 1,
        stockItem: 1,
        transaction: 1,
        customField: 1,
        customButton: 1
      }
    };
  }

  function makeSampleState() {
    const state = blankState();
    state.company = {
      id: "C1",
      name: "Speed Accounting Demo Company",
      gstin: "27AAACH0000A1Z5",
      address: "2nd Floor, Market Road, Pune, Maharashtra 411001",
      state: "Maharashtra",
      phone: "+91 98765 43210",
      bankDetails: "HDFC Bank, Current A/c 501000000001, IFSC HDFC0001234",
      upiId: "speedaccounting@upi",
      paymentName: "Speed Accounting Demo Company",
      logoDataUrl: "",
      signatureDataUrl: "",
      upiQrDataUrl: "",
      voucherPrefixes: { ...DEFAULT_VOUCHER_PREFIXES },
      terms: "Payment due within 15 days. Goods once sold will be governed by agreed return terms.",
      declaration: "We declare that this invoice shows the actual price of the goods described."
    };

    state.ledgers = [
      { id: "L1", name: "Anand Traders", type: "Customer", groupName: "Sundry Debtors", gstin: "27AANCA1111A1Z7", phone: "9820011111", address: "Shop 14, Laxmi Market, Pune", state: "Maharashtra", openingBalance: 0, openingSide: "Dr" },
      { id: "L2", name: "Mehta Supplies", type: "Supplier", groupName: "Sundry Creditors", gstin: "27MEHTA2222A1Z9", phone: "9820022222", address: "Plot 8, Industrial Area, Mumbai", state: "Maharashtra", openingBalance: 0, openingSide: "Cr" },
      { id: "L3", name: "Sales Account", type: "Sales", groupName: "Sales Accounts", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Cr" },
      { id: "L4", name: "Purchase Account", type: "Purchase", groupName: "Purchase Accounts", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Dr" },
      { id: "L5", name: "Cash in Hand", type: "Cash", groupName: "Cash-in-Hand", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Dr" },
      { id: "L6", name: "HDFC Bank", type: "Bank", groupName: "Bank Accounts", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Dr" },
      { id: "L7", name: "GST Payable", type: "GST", groupName: "Duties & Taxes", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Cr" },
      { id: "L8", name: "Sales Return Account", type: "Sales Return", groupName: "Sales Return", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Dr" },
      { id: "L9", name: "Purchase Return Account", type: "Purchase Return", groupName: "Purchase Return", gstin: "", phone: "", address: "", state: "Maharashtra", openingBalance: 0, openingSide: "Cr" }
    ];

    state.stockItems = [
      { id: "S1", name: "Office laptop", hsn: "847130", unit: "Nos", gstRate: 18, openingQty: 0, openingRate: 0, purchaseRate: 18000, saleRate: 25000, minStockLevel: 2 },
      { id: "S2", name: "Accessories", hsn: "847330", unit: "Nos", gstRate: 18, openingQty: 0, openingRate: 0, purchaseRate: 2000, saleRate: 3000, minStockLevel: 5 }
    ];

    state.transactions = [
      {
        id: "T1",
        type: "sales",
        date: "2026-05-02",
        voucherNo: "INV-001",
        partyLedgerId: "L1",
        salesLedgerId: "L3",
        gstLedgerId: "L7",
        description: "Accounting software subscription and setup",
        items: [
          { name: "Software subscription", hsn: "998313", quantity: 1, unit: "Year", rate: 30000, gstRate: 18 },
          { name: "Setup and training", hsn: "998314", quantity: 1, unit: "Job", rate: 20000, gstRate: 18 }
        ]
      },
      {
        id: "T2",
        type: "receipt",
        date: "2026-05-08",
        voucherNo: "REC-001",
        accountLedgerId: "L5",
        partyLedgerId: "L1",
        amount: 40000,
        narration: "Part receipt against INV-001"
      },
      {
        id: "T3",
        type: "purchase",
        date: "2026-05-12",
        voucherNo: "PUR-001",
        partyLedgerId: "L2",
        purchaseLedgerId: "L4",
        gstLedgerId: "L7",
        description: "Office laptops and accessories",
        items: [
          { stockItemId: "S1", name: "Office laptop", hsn: "847130", quantity: 1, unit: "Nos", rate: 18000, gstRate: 18 },
          { stockItemId: "S2", name: "Accessories", hsn: "847330", quantity: 2, unit: "Nos", rate: 2000, gstRate: 18 }
        ]
      },
      {
        id: "T4",
        type: "payment",
        date: "2026-05-17",
        voucherNo: "PAY-001",
        accountLedgerId: "L5",
        partyLedgerId: "L2",
        amount: 10000,
        narration: "Part payment against PUR-001"
      }
    ];

    state.nextIds = {
      ledger: 8,
      stockItem: 3,
      transaction: 5
    };
    return state;
  }

  function nextId(state, key, prefix) {
    const value = state.nextIds[key] || 1;
    state.nextIds[key] = value + 1;
    return prefix + value;
  }

  function numericSuffix(id, prefix) {
    const value = String(id || "");
    if (!value.startsWith(prefix)) return 0;
    return Number(value.slice(prefix.length)) || 0;
  }

  function ledgerGroupByName(name) {
    return QUICK_LEDGER_GROUPS.find((group) => group.name === name) || null;
  }

  function defaultLedgerGroupName(type) {
    return {
      Customer: "Sundry Debtors",
      Supplier: "Sundry Creditors",
      Sales: "Sales Accounts",
      "Sales Return": "Sales Return",
      Purchase: "Purchase Accounts",
      "Purchase Return": "Purchase Return",
      Cash: "Cash-in-Hand",
      Bank: "Bank Accounts",
      GST: "Duties & Taxes"
    }[type] || "Sundry Debtors";
  }

  function ledgerGroupName(ledger) {
    if (!ledger) return "Sundry Debtors";
    if (ledgerGroupByName(ledger.groupName)) return ledger.groupName;
    return defaultLedgerGroupName(ledger.type);
  }

  function normalizeLedger(ledger) {
    const group = ledgerGroupByName(ledger.groupName);
    const type = LEDGER_TYPES.includes(ledger.type)
      ? ledger.type
      : (group ? group.type : "Customer");
    return {
      id: ledger.id,
      name: String(ledger.name || "").trim(),
      type,
      gstin: String(ledger.gstin || "").trim().toUpperCase(),
      phone: String(ledger.phone || "").trim(),
      address: String(ledger.address || "").trim(),
      state: INDIA_STATES.includes(ledger.state) ? ledger.state : "",
      groupName: group ? group.name : defaultLedgerGroupName(type),
      openingBalance: parseAmount(ledger.openingBalance),
      openingSide: ledger.openingSide === "Cr" ? "Cr" : "Dr",
      customFields: cleanCustomValueMap(ledger.customFields)
    };
  }

  function slugify(value) {
    const base = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || "custom";
  }

  function normalizeCustomField(field) {
    const type = ["text", "number", "date", "select", "textarea", "checkbox"].includes(field.type) ? field.type : "text";
    const screen = CUSTOM_SCREEN_LABELS[field.screen] ? field.screen : "sales";
    const label = String(field.label || "Custom Field").trim();
    return {
      id: field.id,
      screen,
      key: field.key || slugify(label + "-" + field.id),
      label,
      type,
      options: String(field.options || "").trim(),
      defaultValue: String(field.defaultValue || "").trim(),
      required: Boolean(field.required),
      print: field.print !== false
    };
  }

  function normalizeCustomButton(button) {
    const screen = CUSTOM_SCREEN_LABELS[button.screen] ? button.screen : "sales";
    const action = ["save", "print", "clear", "goto", "message"].includes(button.action) ? button.action : "message";
    const target = CUSTOM_BUTTON_TARGETS[button.target] ? button.target : "dashboard";
    return {
      id: button.id,
      screen,
      label: String(button.label || "Custom Button").trim(),
      action,
      target,
      message: String(button.message || "").trim()
    };
  }

  function cleanCustomValueMap(values) {
    if (!values || typeof values !== "object" || Array.isArray(values)) return {};
    return Object.fromEntries(Object.entries(values).map(([key, value]) => {
      if (typeof value === "boolean") return [key, value];
      return [key, String(value ?? "").trim()];
    }));
  }

  function ensureCoreLedgers(workingState) {
    CORE_LEDGER_TEMPLATES.forEach((template) => {
      const hasType = workingState.ledgers.some((ledger) => ledger.type === template.type);
      if (!hasType) {
        workingState.ledgers.push({
          id: nextId(workingState, "ledger", "L"),
          name: template.name,
          type: template.type,
          gstin: "",
          phone: "",
          address: "",
          state: "",
          openingBalance: 0,
          openingSide: template.openingSide
        });
      }
    });
  }

  function cleanVoucherPrefix(value, fallback) {
    const prefix = String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    return prefix || fallback;
  }

  function cleanVoucherPrefixes(prefixes) {
    return Object.fromEntries(Object.entries(DEFAULT_VOUCHER_PREFIXES).map(([type, fallback]) => [
      type,
      cleanVoucherPrefix(prefixes && prefixes[type], fallback)
    ]));
  }

  function normalizeState(workingState) {
    const normalized = workingState && typeof workingState === "object" ? workingState : blankState();
    normalized.company = normalized.company || null;
    if (normalized.company) {
      if (normalized.company.name === "Hisaab Pro Demo Company") normalized.company.name = "Speed Accounting Demo Company";
      if (normalized.company.paymentName === "Hisaab Pro Demo Company") normalized.company.paymentName = "Speed Accounting Demo Company";
      if (normalized.company.upiId === "hisaabpro@upi") normalized.company.upiId = "speedaccounting@upi";
      normalized.company.id = String(normalized.company.id || "").trim();
      normalized.company.state = INDIA_STATES.includes(normalized.company.state) ? normalized.company.state : "";
      normalized.company.upiId = String(normalized.company.upiId || "").trim();
      normalized.company.paymentName = String(normalized.company.paymentName || "").trim();
      normalized.company.logoDataUrl = String(normalized.company.logoDataUrl || "");
      normalized.company.signatureDataUrl = String(normalized.company.signatureDataUrl || "");
      normalized.company.upiQrDataUrl = String(normalized.company.upiQrDataUrl || "");
      normalized.company.voucherPrefixes = cleanVoucherPrefixes(normalized.company.voucherPrefixes);
      normalized.company.customFields = cleanCustomValueMap(normalized.company.customFields);
    }
    normalized.ledgers = Array.isArray(normalized.ledgers)
      ? normalized.ledgers.filter((ledger) => ledger && ledger.id && ledger.name).map(normalizeLedger)
      : [];
    normalized.stockItems = Array.isArray(normalized.stockItems)
      ? normalized.stockItems.filter((item) => item && item.id && item.name).map(cleanStockItem)
      : [];
    normalized.transactions = Array.isArray(normalized.transactions)
      ? normalized.transactions.map((tx) => {
        const nextTx = Array.isArray(tx.items) ? { ...tx, items: tx.items.map(cleanItem) } : { ...tx };
        nextTx.companyState = INDIA_STATES.includes(nextTx.companyState) ? nextTx.companyState : "";
        nextTx.partyState = INDIA_STATES.includes(nextTx.partyState) ? nextTx.partyState : "";
        nextTx.adjustmentVoucherId = String(nextTx.adjustmentVoucherId || "").trim();
        nextTx.customFields = cleanCustomValueMap(nextTx.customFields);
        return nextTx;
      })
      : [];
    if (!normalized.stockItems.length) {
      const derived = new Map();
      normalized.transactions
        .filter((tx) => tx.type === "purchase")
        .forEach((tx) => {
          itemsFromTransaction(tx).forEach((item) => {
            const clean = cleanItem(item);
            const key = productKey(clean.name);
            if (!key || derived.has(key)) return;
            derived.set(key, cleanStockItem({
              id: "S" + (derived.size + 1),
              name: clean.name,
              hsn: clean.hsn,
              unit: clean.unit,
              gstRate: clean.gstRate,
              openingQty: 0,
              openingRate: 0,
              purchaseRate: clean.rate,
              saleRate: 0
            }));
          });
        });
      normalized.stockItems = Array.from(derived.values());
    }
    normalized.customFields = Array.isArray(normalized.customFields)
      ? normalized.customFields.filter((field) => field && field.id).map(normalizeCustomField)
      : [];
    normalized.customButtons = Array.isArray(normalized.customButtons)
      ? normalized.customButtons.filter((button) => button && button.id).map(normalizeCustomButton)
      : [];
    normalized.nextIds = normalized.nextIds || {};
    normalized.nextIds.ledger = Math.max(
      Number(normalized.nextIds.ledger) || 1,
      1 + normalized.ledgers.reduce((max, ledger) => Math.max(max, numericSuffix(ledger.id, "L")), 0)
    );
    normalized.nextIds.stockItem = Math.max(
      Number(normalized.nextIds.stockItem) || 1,
      1 + normalized.stockItems.reduce((max, item) => Math.max(max, numericSuffix(item.id, "S")), 0)
    );
    normalized.nextIds.transaction = Math.max(
      Number(normalized.nextIds.transaction) || 1,
      1 + normalized.transactions.reduce((max, tx) => Math.max(max, numericSuffix(tx.id, "T")), 0)
    );
    normalized.nextIds.customField = Math.max(
      Number(normalized.nextIds.customField) || 1,
      1 + normalized.customFields.reduce((max, field) => Math.max(max, numericSuffix(field.id, "CF")), 0)
    );
    normalized.nextIds.customButton = Math.max(
      Number(normalized.nextIds.customButton) || 1,
      1 + normalized.customButtons.reduce((max, button) => Math.max(max, numericSuffix(button.id, "CB")), 0)
    );
    ensureCoreLedgers(normalized);
    return normalized;
  }

  function ledgerById(state, id) {
    if (id === OPENING_LEDGER_ID) return OPENING_LEDGER;
    return state.ledgers.find((ledger) => ledger.id === id) || null;
  }

  function ledgersByType(state, types) {
    const wanted = Array.isArray(types) ? types : [types];
    return state.ledgers.filter((ledger) => wanted.includes(ledger.type));
  }

  function transactionLabel(type) {
    return {
      opening: "Opening",
      sales: "Sales",
      "credit-note": "Credit Note",
      "sales-order": "Sales Order",
      "delivery-challan": "Delivery Challan",
      purchase: "Purchase",
      "debit-note": "Debit Note",
      "purchase-order": "Purchase Order",
      payment: "Payment",
      contra: "Contra",
      receipt: "Receipt",
      journal: "Journal"
    }[type] || type;
  }

  function isInventoryTransaction(type) {
    return ["sales", "purchase", "credit-note", "debit-note"].includes(type);
  }

  function isItemVoucher(type) {
    return ITEM_VOUCHER_TYPES.includes(type);
  }

  function makeEntry(tx, ledgerId, debit, credit, narration) {
    return {
      transactionId: tx.id,
      type: tx.type,
      date: tx.date,
      voucherNo: tx.voucherNo,
      ledgerId,
      debit: round2(debit),
      credit: round2(credit),
      narration: narration || tx.narration || tx.description || ""
    };
  }

  function entriesForTransaction(tx) {
    if (!tx) return [];
    if (tx.type === "sales") {
      const tax = transactionTotals(tx);
      return [
        makeEntry(tx, tx.partyLedgerId, tax.total, 0, tx.description),
        makeEntry(tx, tx.salesLedgerId, 0, tax.taxable, tx.description),
        makeEntry(tx, tx.gstLedgerId, 0, tax.gstTotal, "GST on " + tx.voucherNo)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "purchase") {
      const tax = transactionTotals(tx);
      return [
        makeEntry(tx, tx.purchaseLedgerId, tax.taxable, 0, tx.description),
        makeEntry(tx, tx.gstLedgerId, tax.gstTotal, 0, "Input GST on " + tx.voucherNo),
        makeEntry(tx, tx.partyLedgerId, 0, tax.total, tx.description)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "credit-note") {
      const tax = transactionTotals(tx);
      return [
        makeEntry(tx, tx.salesLedgerId, tax.taxable, 0, tx.description),
        makeEntry(tx, tx.gstLedgerId, tax.gstTotal, 0, "GST reversed on " + tx.voucherNo),
        makeEntry(tx, tx.partyLedgerId, 0, tax.total, tx.description)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "debit-note") {
      const tax = transactionTotals(tx);
      return [
        makeEntry(tx, tx.partyLedgerId, tax.total, 0, tx.description),
        makeEntry(tx, tx.purchaseLedgerId, 0, tax.taxable, tx.description),
        makeEntry(tx, tx.gstLedgerId, 0, tax.gstTotal, "Input GST reversed on " + tx.voucherNo)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "payment") {
      return [
        makeEntry(tx, tx.partyLedgerId, tx.amount, 0, tx.narration),
        makeEntry(tx, tx.accountLedgerId, 0, tx.amount, tx.narration)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "receipt") {
      return [
        makeEntry(tx, tx.accountLedgerId, tx.amount, 0, tx.narration),
        makeEntry(tx, tx.partyLedgerId, 0, tx.amount, tx.narration)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "contra") {
      return [
        makeEntry(tx, tx.toLedgerId, tx.amount, 0, tx.narration),
        makeEntry(tx, tx.fromLedgerId, 0, tx.amount, tx.narration)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    if (tx.type === "journal") {
      return [
        makeEntry(tx, tx.debitLedgerId, tx.amount, 0, tx.narration),
        makeEntry(tx, tx.creditLedgerId, 0, tx.amount, tx.narration)
      ].filter((entry) => entry.ledgerId && (entry.debit || entry.credit));
    }

    return [];
  }

  function openingEntries(state) {
    const entries = [];
    state.ledgers.forEach((ledger) => {
      const amount = parseAmount(ledger.openingBalance);
      if (amount <= 0) return;
      const debit = ledger.openingSide === "Cr" ? 0 : amount;
      const credit = ledger.openingSide === "Cr" ? amount : 0;
      entries.push({
        transactionId: "OPEN-" + ledger.id,
        type: "opening",
        date: "0000-00-00",
        voucherNo: "Opening",
        ledgerId: ledger.id,
        debit,
        credit,
        narration: "Opening balance"
      });
      entries.push({
        transactionId: "OPEN-CONTRA-" + ledger.id,
        type: "opening",
        date: "0000-00-00",
        voucherNo: "Opening",
        ledgerId: OPENING_LEDGER_ID,
        debit: credit,
        credit: debit,
        narration: "Opening balance contra"
      });
    });
    return entries;
  }

  function allEntries(state) {
    return openingEntries(state).concat(state.transactions.flatMap(entriesForTransaction)).sort((a, b) => {
      const dateSort = String(a.date).localeCompare(String(b.date));
      if (dateSort !== 0) return dateSort;
      return String(a.voucherNo).localeCompare(String(b.voucherNo));
    });
  }

  function ledgerSummaries(state) {
    const summaries = new Map();
    state.ledgers.forEach((ledger) => {
      summaries.set(ledger.id, {
        ledger,
        debit: 0,
        credit: 0,
        balance: 0,
        side: "Dr"
      });
    });

    const hasOpeningContra = allEntries(state).some((entry) => entry.ledgerId === OPENING_LEDGER_ID);
    if (hasOpeningContra) {
      summaries.set(OPENING_LEDGER_ID, {
        ledger: OPENING_LEDGER,
        debit: 0,
        credit: 0,
        balance: 0,
        side: "Dr"
      });
    }

    allEntries(state).forEach((entry) => {
      if (!summaries.has(entry.ledgerId)) return;
      const row = summaries.get(entry.ledgerId);
      row.debit = round2(row.debit + entry.debit);
      row.credit = round2(row.credit + entry.credit);
    });

    summaries.forEach((row) => {
      row.balance = round2(row.debit - row.credit);
      row.side = row.balance >= 0 ? "Dr" : "Cr";
    });

    return Array.from(summaries.values());
  }

  function ledgerBalance(state, ledgerId) {
    const summary = ledgerSummaries(state).find((row) => row.ledger.id === ledgerId);
    return summary ? summary.balance : 0;
  }

  function ledgerBalanceExcludingTransaction(appState, ledgerId, excludeTransactionId) {
    return allEntries(appState)
      .filter((entry) => entry.ledgerId === ledgerId && entry.transactionId !== excludeTransactionId)
      .reduce((balance, entry) => round2(balance + entry.debit - entry.credit), 0);
  }

  function stateAsOn(appState, asOnDate) {
    if (!asOnDate) return appState;
    return {
      ...appState,
      transactions: appState.transactions.filter((tx) => !tx.date || tx.date <= asOnDate)
    };
  }

  function partyOutstandingRows(appState, asOnDate) {
    const scopedState = stateAsOn(appState, asOnDate);
    return ledgerSummaries(scopedState)
      .filter((row) => ["Customer", "Supplier"].includes(row.ledger.type))
      .map((row) => {
        const balance = round2(row.balance);
        return {
          ledger: row.ledger,
          balance,
          receivable: balance > 0 ? balance : 0,
          payable: balance < 0 ? Math.abs(balance) : 0
        };
      })
      .filter((row) => row.receivable || row.payable)
      .sort((a, b) => {
        const typeSort = a.ledger.type.localeCompare(b.ledger.type);
        if (typeSort !== 0) return typeSort;
        return Math.abs(b.balance) - Math.abs(a.balance);
      });
  }

  function transactionSearchText(tx) {
    const items = itemsFromTransaction(tx);
    return [
      tx.voucherNo,
      tx.referenceNo,
      tx.date,
      transactionLabel(tx.type),
      tx.description,
      tx.narration,
      ledgerName(tx.partyLedgerId),
      ledgerName(tx.accountLedgerId),
      ledgerName(tx.salesLedgerId),
      ledgerName(tx.purchaseLedgerId),
      tx.partyState,
      tx.partyAddress,
      money(transactionTotals(tx).total),
      ...items.flatMap((item) => [item.name, item.hsn, item.unit, item.gstRate, item.rate])
    ].join(" ").toLowerCase();
  }

  function registerFilteredRows(type) {
    const prefix = type === "sales" ? "sales" : "purchase";
    const mode = prefix === "sales" ? salesVoucherMode : purchaseVoucherMode;
    const query = ($("#" + prefix + "RegisterSearch") ? $("#" + prefix + "RegisterSearch").value : "").trim().toLowerCase();
    const partyId = $("#" + prefix + "RegisterParty") ? $("#" + prefix + "RegisterParty").value : "";
    const itemQuery = ($("#" + prefix + "RegisterItem") ? $("#" + prefix + "RegisterItem").value : "").trim().toLowerCase();
    const from = $("#" + prefix + "RegisterFrom") ? $("#" + prefix + "RegisterFrom").value : "";
    const to = $("#" + prefix + "RegisterTo") ? $("#" + prefix + "RegisterTo").value : "";
    return state.transactions
      .filter((tx) => tx.type === mode)
      .filter((tx) => !partyId || tx.partyLedgerId === partyId)
      .filter((tx) => !from || tx.date >= from)
      .filter((tx) => !to || tx.date <= to)
      .filter((tx) => !query || transactionSearchText(tx).includes(query))
      .filter((tx) => {
        if (!itemQuery) return true;
        return itemsFromTransaction(tx).some((item) => [
          item.name,
          item.hsn,
          item.unit
        ].join(" ").toLowerCase().includes(itemQuery));
      })
      .sort(sortByDateDesc);
  }

  function registerTotals(rows) {
    return rows.reduce((totals, tx) => {
      const tax = transactionTotals(tx);
      totals.qty = round2(totals.qty + itemsFromTransaction(tx).reduce((sum, item) => sum + parseAmount(item.quantity), 0));
      totals.taxable = round2(totals.taxable + tax.taxable);
      totals.gst = round2(totals.gst + tax.gstTotal);
      totals.total = round2(totals.total + tax.total);
      return totals;
    }, { qty: 0, taxable: 0, gst: 0, total: 0 });
  }

  function renderRegisterSummary(prefix, totals) {
    const summary = $("#" + prefix + "RegisterSummary");
    if (!summary) return;
    const strong = summary.querySelectorAll("strong");
    if (strong[0]) strong[0].textContent = moneyFormat.format(totals.qty);
    if (strong[1]) strong[1].textContent = money(totals.taxable);
    if (strong[2]) strong[2].textContent = money(totals.gst);
    if (strong[3]) strong[3].textContent = money(totals.total);
  }

  function populateRegisterPartyFilter(prefix, rows) {
    const select = $("#" + prefix + "RegisterParty");
    if (!select) return;
    const current = select.value;
    const parties = Array.from(new Set(state.transactions
      .filter((tx) => tx.type === (prefix === "sales" ? salesVoucherMode : purchaseVoucherMode))
      .map((tx) => tx.partyLedgerId)
      .filter(Boolean)))
      .map((id) => ledgerById(state, id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
    select.innerHTML = `<option value="">All ${prefix === "sales" ? "Customers" : "Suppliers"}</option>` + parties.map((ledger) => {
      return `<option value="${escapeHtml(ledger.id)}">${escapeHtml(ledger.name)}</option>`;
    }).join("");
    if (current && parties.some((ledger) => ledger.id === current)) select.value = current;
  }

  function partyOpenVoucherRows(appState, ledgerId, settlementType, excludeTransactionId) {
    if (!ledgerId) return [];
    const isReceipt = settlementType === "receipt";
    const baseType = isReceipt ? "sales" : "purchase";
    const returnType = isReceipt ? "credit-note" : "debit-note";
    const settlementTxType = isReceipt ? "receipt" : "payment";
    const baseRows = appState.transactions
      .filter((tx) => tx.type === baseType && tx.partyLedgerId === ledgerId && tx.id !== excludeTransactionId)
      .sort(sortByDateAsc)
      .map((tx) => ({
        id: tx.id,
        voucherNo: tx.voucherNo,
        date: tx.date,
        partyLedgerId: tx.partyLedgerId,
        description: tx.description || "",
        total: transactionTotals(tx).total,
        adjusted: 0,
        pending: transactionTotals(tx).total
      }));
    const baseMap = new Map(baseRows.map((row) => [row.id, row]));
    const unlinkedAdjustments = [];

    appState.transactions
      .filter((tx) => tx.partyLedgerId === ledgerId && tx.id !== excludeTransactionId && (tx.type === settlementTxType || tx.type === returnType))
      .sort(sortByDateAsc)
      .forEach((tx) => {
        const amount = tx.type === settlementTxType ? parseAmount(tx.amount) : transactionTotals(tx).total;
        if (!amount) return;
        if (tx.adjustmentVoucherId && baseMap.has(tx.adjustmentVoucherId)) {
          const row = baseMap.get(tx.adjustmentVoucherId);
          const apply = Math.min(row.pending, amount);
          row.adjusted = round2(row.adjusted + apply);
          row.pending = round2(row.pending - apply);
          const balance = round2(amount - apply);
          if (balance) unlinkedAdjustments.push(balance);
          return;
        }
        unlinkedAdjustments.push(amount);
      });

    unlinkedAdjustments.forEach((amount) => {
      let remaining = amount;
      baseRows.forEach((row) => {
        if (remaining <= 0 || row.pending <= 0) return;
        const apply = Math.min(row.pending, remaining);
        row.adjusted = round2(row.adjusted + apply);
        row.pending = round2(row.pending - apply);
        remaining = round2(remaining - apply);
      });
    });

    return baseRows.filter((row) => row.pending > 0.009);
  }

  function invoiceOutstandingRows(appState, asOnDate, dueDays = 30) {
    const scopedState = stateAsOn(appState, asOnDate);
    const asOn = asOnDate ? new Date(asOnDate + "T00:00:00") : new Date();
    const due = Math.max(0, parseAmount(dueDays));
    const partyLedgers = scopedState.ledgers.filter((ledger) => ["Customer", "Supplier"].includes(ledger.type));
    return partyLedgers.flatMap((ledger) => {
      const type = ledger.type === "Customer" ? "receipt" : "payment";
      return partyOpenVoucherRows(scopedState, ledger.id, type, "").map((row) => {
        const txDate = row.date ? new Date(row.date + "T00:00:00") : asOn;
        const age = Math.max(0, Math.floor((asOn - txDate) / 86400000));
        const pending = round2(row.pending);
        const paid = round2(row.total - pending);
        return {
          ...row,
          party: ledger,
          type: ledger.type === "Customer" ? "receivable" : "payable",
          paid,
          age,
          overdue: age > due,
          overdueAmount: age > due ? pending : 0
        };
      });
    }).sort((a, b) => b.pending - a.pending);
  }

  function daysOld(date, asOnDate) {
    if (!date) return 0;
    const asOn = asOnDate ? new Date(asOnDate + "T00:00:00") : new Date();
    const txDate = new Date(date + "T00:00:00");
    return Math.max(0, Math.floor((asOn - txDate) / 86400000));
  }

  function partyAgingBuckets(appState, ledgerId, settlementType, asOnDate) {
    const scopedState = stateAsOn(appState, asOnDate);
    return partyOpenVoucherRows(scopedState, ledgerId, settlementType, "")
      .reduce((buckets, row) => {
        const age = daysOld(row.date, asOnDate);
        if (age <= 30) buckets.current = round2(buckets.current + row.pending);
        else if (age <= 60) buckets.month = round2(buckets.month + row.pending);
        else buckets.old = round2(buckets.old + row.pending);
        buckets.total = round2(buckets.total + row.pending);
        buckets.count += 1;
        return buckets;
      }, { current: 0, month: 0, old: 0, total: 0, count: 0 });
  }

  function stockMovementSign(type) {
    if (type === "purchase" || type === "credit-note") return 1;
    if (type === "sales" || type === "debit-note") return -1;
    return 0;
  }

  function stockItemMatchesRow(item, row) {
    const clean = cleanItem(row);
    if (clean.stockItemId && item.id) return clean.stockItemId === item.id;
    return productKey(clean.name) === productKey(item.name);
  }

  function stockLedgerRows(appState, stockItemId, fromDate = "", toDate = "") {
    const item = stockItemById(appState, stockItemId) || (Array.isArray(appState.stockItems) ? appState.stockItems[0] : null);
    if (!item) {
      return { item: null, openingQty: 0, inwardQty: 0, outwardQty: 0, closingQty: 0, value: 0, rows: [] };
    }
    const costRate = parseAmount(item.purchaseRate) || parseAmount(item.openingRate);
    let openingQty = parseAmount(item.openingQty);
    const movements = [];

    appState.transactions
      .filter((tx) => isInventoryTransaction(tx.type))
      .sort(sortByDateAsc)
      .forEach((tx) => {
        itemsFromTransaction(tx).forEach((row) => {
          if (!stockItemMatchesRow(item, row)) return;
          const clean = cleanItem(row);
          const sign = stockMovementSign(tx.type);
          if (!sign) return;
          const quantity = parseAmount(clean.quantity);
          const signedQty = round2(sign * quantity);
          const movement = {
            tx,
            date: tx.date,
            type: tx.type,
            voucherNo: tx.voucherNo,
            partyLedgerId: tx.partyLedgerId,
            description: tx.description || clean.name,
            inward: sign > 0 ? quantity : 0,
            outward: sign < 0 ? quantity : 0,
            rate: parseAmount(clean.rate),
            signedQty
          };
          if (fromDate && tx.date < fromDate) {
            openingQty = round2(openingQty + signedQty);
            return;
          }
          if (toDate && tx.date > toDate) return;
          movements.push(movement);
        });
      });

    let balanceQty = openingQty;
    let inwardQty = 0;
    let outwardQty = 0;
    const rows = movements.map((movement) => {
      balanceQty = round2(balanceQty + movement.signedQty);
      inwardQty = round2(inwardQty + movement.inward);
      outwardQty = round2(outwardQty + movement.outward);
      return {
        ...movement,
        balanceQty,
        value: round2(balanceQty * (movement.rate || costRate))
      };
    });

    return {
      item,
      openingQty: round2(openingQty),
      inwardQty,
      outwardQty,
      closingQty: round2(balanceQty),
      value: round2(balanceQty * costRate),
      rows
    };
  }

  function profitLoss(state) {
    const summaries = ledgerSummaries(state);
    const incomeRows = [];
    const expenseRows = [];

    summaries.forEach((row) => {
      if (row.ledger.type === "Sales") {
        const amount = round2(row.credit - row.debit);
        if (amount !== 0) incomeRows.push({ name: row.ledger.name, amount });
      }
      if (row.ledger.type === "Sales Return") {
        const amount = round2(row.credit - row.debit);
        if (amount !== 0) incomeRows.push({ name: row.ledger.name, amount });
      }
      if (row.ledger.type === "Purchase") {
        const amount = round2(row.debit - row.credit);
        if (amount !== 0) expenseRows.push({ name: row.ledger.name, amount });
      }
      if (row.ledger.type === "Purchase Return") {
        const amount = round2(row.debit - row.credit);
        if (amount !== 0) expenseRows.push({ name: row.ledger.name, amount });
      }
    });

    const incomeTotal = round2(incomeRows.reduce((sum, row) => sum + row.amount, 0));
    const expenseTotal = round2(expenseRows.reduce((sum, row) => sum + row.amount, 0));
    return {
      incomeRows,
      expenseRows,
      incomeTotal,
      expenseTotal,
      netProfit: round2(incomeTotal - expenseTotal)
    };
  }

  function balanceSheet(state) {
    const assets = [];
    const liabilities = [];
    const summaries = ledgerSummaries(state);

    summaries.forEach((row) => {
      const balance = round2(row.debit - row.credit);
      if (balance === 0) return;
      if (["Sales", "Sales Return", "Purchase", "Purchase Return"].includes(row.ledger.type)) return;

      const amount = Math.abs(balance);
      if (row.ledger.type === "Cash" || row.ledger.type === "Bank") {
        if (balance >= 0) assets.push({ name: row.ledger.name, amount });
        else liabilities.push({ name: row.ledger.name + " Overdraft", amount });
        return;
      }

      if (row.ledger.type === "Customer") {
        if (balance >= 0) assets.push({ name: row.ledger.name + " Receivable", amount });
        else liabilities.push({ name: row.ledger.name + " Advance", amount });
        return;
      }

      if (row.ledger.type === "Supplier") {
        if (balance <= 0) liabilities.push({ name: row.ledger.name + " Payable", amount });
        else assets.push({ name: row.ledger.name + " Advance", amount });
        return;
      }

      if (row.ledger.type === "GST") {
        if (balance <= 0) liabilities.push({ name: row.ledger.name, amount });
        else assets.push({ name: row.ledger.name + " Credit", amount });
        return;
      }

      if (balance >= 0) assets.push({ name: row.ledger.name, amount });
      else liabilities.push({ name: row.ledger.name, amount });
    });

    const pnl = profitLoss(state);
    if (pnl.netProfit > 0) {
      liabilities.push({ name: "Profit and Loss Surplus", amount: pnl.netProfit });
    } else if (pnl.netProfit < 0) {
      assets.push({ name: "Profit and Loss Deficit", amount: Math.abs(pnl.netProfit) });
    }

    const assetTotal = round2(assets.reduce((sum, row) => sum + row.amount, 0));
    const liabilityTotal = round2(liabilities.reduce((sum, row) => sum + row.amount, 0));
    return { assets, liabilities, assetTotal, liabilityTotal };
  }

  function dashboardTotals(state) {
    const pnl = profitLoss(state);
    const gstBalance = ledgerSummaries(state)
      .filter((row) => row.ledger.type === "GST")
      .reduce((sum, row) => sum + (row.credit - row.debit), 0);
    const cashBalance = ledgerSummaries(state)
      .filter((row) => row.ledger.type === "Cash")
      .reduce((sum, row) => sum + (row.debit - row.credit), 0);

    return {
      sales: pnl.incomeTotal,
      purchase: pnl.expenseTotal,
      gstPayable: round2(gstBalance),
      cashBalance: round2(cashBalance)
    };
  }

  const Accounting = {
    LEDGER_TYPES,
    round2,
    money,
    calculateGst,
    calculateItems,
    transactionTotals,
    purchaseProductCatalog,
    inventoryProductCatalog,
    findPurchasedProductByName,
    itemProfitRows,
    auditIssues,
    makeSampleState,
    normalizeState,
    entriesForTransaction,
    allEntries,
    ledgerSummaries,
    ledgerBalance,
    ledgerBalanceExcludingTransaction,
    partyOutstandingRows,
    partyOpenVoucherRows,
    invoiceOutstandingRows,
    stockLedgerRows,
    profitLoss,
    balanceSheet,
    dashboardTotals
  };

  global.HisaabProAccounting = Accounting;

  if (typeof document === "undefined") {
    return;
  }

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  let companyBooks = loadCompanyBooks();
  let state = loadState();
  let toastTimer = null;
  let quickLedgerContext = "sales";
  let selectedQuickGroupIndex = 0;
  let visibleQuickGroups = [];
  let selectedAllEntryId = null;
  let selectedInvoiceId = null;
  let companyLogoDraft = "";
  let companySignatureDraft = "";
  let companyUpiQrDraft = "";
  let activeSalesProductInput = null;
  let activeSalesProductMatches = [];
  let activeSalesProductIndex = 0;
  let activeProductPickerType = "sales";
  let salesVoucherMode = "sales";
  let purchaseVoucherMode = "purchase";
  let reportDateFrom = "";
  let reportDateTo = "";
  const BACKEND_ENABLED = typeof location !== "undefined" && /^https?:$/.test(location.protocol);
  let backendSaveTimer = null;
  let backendHydrated = false;

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadCompanyBooks() {
    try {
      const raw = localStorage.getItem(COMPANY_BOOKS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const books = Array.isArray(parsed.books) ? parsed.books : [];
      return {
        activeCompanyId: String(parsed.activeCompanyId || ""),
        books: books
          .filter((book) => book && book.id && book.data)
          .map((book) => {
            const data = normalizeState(book.data);
            const company = data.company || {};
            if (!company.id) company.id = String(book.id);
            data.company = company;
            return {
              id: String(book.id),
              name: String(book.name || company.name || "Unnamed Company"),
              gstin: String(book.gstin || company.gstin || ""),
              state: String(book.state || company.state || ""),
              phone: String(book.phone || company.phone || ""),
              updatedOn: String(book.updatedOn || ""),
              data
            };
          })
      };
    } catch (error) {
      console.warn("Company books reset:", error);
      return { activeCompanyId: "", books: [] };
    }
  }

  function saveCompanyBooks() {
    localStorage.setItem(COMPANY_BOOKS_KEY, JSON.stringify(companyBooks));
  }

  function nextCompanyId() {
    const max = companyBooks.books.reduce((value, book) => Math.max(value, numericSuffix(book.id, "C")), 0);
    return "C" + (max + 1);
  }

  function ensureCompanyId() {
    if (!state.company) return "";
    if (!state.company.id) state.company.id = nextCompanyId();
    return state.company.id;
  }

  function saveActiveCompanyBook() {
    if (!state || !state.company || !String(state.company.name || "").trim()) return;
    const id = ensureCompanyId();
    const snapshot = normalizeState(deepClone(state));
    snapshot.company.id = id;
    const book = {
      id,
      name: snapshot.company.name,
      gstin: snapshot.company.gstin || "",
      state: snapshot.company.state || "",
      phone: snapshot.company.phone || "",
      updatedOn: new Date().toISOString(),
      data: snapshot
    };
    const index = companyBooks.books.findIndex((item) => item.id === id);
    if (index >= 0) companyBooks.books[index] = book;
    else companyBooks.books.push(book);
    companyBooks.activeCompanyId = id;
    saveCompanyBooks();
  }

  function loadState() {
    try {
      if (companyBooks.activeCompanyId) {
        const activeBook = companyBooks.books.find((book) => book.id === companyBooks.activeCompanyId);
        if (activeBook && activeBook.data) {
          const loaded = normalizeState(deepClone(activeBook.data));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
          return loaded;
        }
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = normalizeState(makeSampleState());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.ledgers) || !Array.isArray(parsed.transactions)) {
        throw new Error("Invalid saved data");
      }
      const normalized = normalizeState(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      console.warn("Speed Accounting storage reset:", error);
      const seeded = normalizeState(makeSampleState());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveActiveCompanyBook();
    scheduleBackendSave();
  }

  function setBackendStatus(text, statusClass) {
    const pill = $("#backendStatus");
    if (!pill) return;
    pill.textContent = text;
    pill.classList.remove("local", "online", "offline", "syncing");
    if (statusClass) pill.classList.add(statusClass);
  }

  async function backendRequest(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    const data = await response.json();
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || "Backend request failed.");
    }
    return data;
  }

  function scheduleBackendSave() {
    if (!BACKEND_ENABLED || !backendHydrated) return;
    clearTimeout(backendSaveTimer);
    backendSaveTimer = setTimeout(() => saveStateToBackend(), 450);
  }

  async function saveStateToBackend() {
    if (!BACKEND_ENABLED) return;
    try {
      setBackendStatus("Saving", "syncing");
      await backendRequest("/api/state", {
        method: "PUT",
        body: JSON.stringify({ state, companyBooks })
      });
      setBackendStatus("Backend Online", "online");
    } catch (error) {
      console.warn("Backend save failed:", error);
      setBackendStatus("Backend Offline", "offline");
    }
  }

  async function hydrateFromBackend() {
    if (!BACKEND_ENABLED) {
      backendHydrated = true;
      setBackendStatus("Local Mode", "local");
      return;
    }
    try {
      setBackendStatus("Syncing", "syncing");
      const data = await backendRequest("/api/state");
      if (data.state && Array.isArray(data.state.ledgers) && Array.isArray(data.state.transactions)) {
        state = normalizeState(data.state);
        if (data.companyBooks && Array.isArray(data.companyBooks.books)) {
          companyBooks = data.companyBooks;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(COMPANY_BOOKS_KEY, JSON.stringify(companyBooks));
        fillCompanyForm();
        clearLedgerForm();
        clearStockItemForm();
        clearSalesForm();
        clearPurchaseForm();
        clearPaymentForm();
        clearContraForm();
        clearReceiptForm();
        clearJournalForm();
        renderAll();
      } else {
        await backendRequest("/api/state", {
          method: "PUT",
          body: JSON.stringify({ state, companyBooks })
        });
      }
      backendHydrated = true;
      setBackendStatus("Backend Online", "online");
    } catch (error) {
      console.warn("Backend sync failed:", error);
      backendHydrated = true;
      setBackendStatus("Backend Offline", "offline");
    }
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function alertMessage(message) {
    window.alert(message);
  }

  function navigateTo(sectionId) {
    if (!SECTION_TITLES[sectionId]) return;
    const requestedSection = sectionId;
    hideSalesProductPicker();
    if (sectionId === "vouchers") {
      sectionId = salesVoucherMode === "credit-note" ? "sales" : "sales";
      setSalesVoucherMode("sales");
    } else if (sectionId === "credit-note") {
      setSalesVoucherMode("credit-note");
      sectionId = "sales";
    } else if (sectionId === "sales-order") {
      setSalesVoucherMode("sales-order");
      sectionId = "sales";
    } else if (sectionId === "delivery-challan") {
      setSalesVoucherMode("delivery-challan");
      sectionId = "sales";
    } else if (sectionId === "debit-note") {
      setPurchaseVoucherMode("debit-note");
      sectionId = "purchase";
    } else if (sectionId === "purchase-order") {
      setPurchaseVoucherMode("purchase-order");
      sectionId = "purchase";
    } else if (sectionId === "sales") {
      setSalesVoucherMode("sales");
    } else if (sectionId === "purchase") {
      setPurchaseVoucherMode("purchase");
    }
    $$(".view").forEach((view) => view.classList.toggle("active", view.id === sectionId));
    const activeNav = VOUCHER_SECTIONS.includes(requestedSection) || VOUCHER_SECTIONS.includes(sectionId) ? "vouchers" : requestedSection;
    $$(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.section === activeNav));
    updateVoucherTabs(requestedSection, sectionId);
    $("#sectionTitle").textContent = SECTION_TITLES[requestedSection];
    $(".content").scrollTop = 0;
    renderReports();
  }

  function updateVoucherTabs(requestedSection, visibleSection) {
    let active = requestedSection;
    if (visibleSection === "sales" && ["sales", "credit-note", "sales-order", "delivery-challan"].includes(salesVoucherMode)) active = salesVoucherMode;
    if (visibleSection === "purchase" && purchaseVoucherMode === "debit-note") active = "debit-note";
    if (visibleSection === "purchase" && purchaseVoucherMode === "purchase-order") active = "purchase-order";
    if (visibleSection === "purchase" && purchaseVoucherMode === "purchase") active = "purchase";
    $$(".voucher-tabs button").forEach((button) => {
      button.classList.toggle("active", button.dataset.goSection === active);
    });
  }

  function setSelectOptions(select, ledgers, placeholder, preferredValue) {
    const current = preferredValue || select.value;
    select.innerHTML = "";
    if (!ledgers.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = placeholder || "No ledgers available";
      select.appendChild(option);
      return;
    }

    ledgers.forEach((ledger) => {
      const option = document.createElement("option");
      option.value = ledger.id;
      option.textContent = ledger.name + " (" + ledger.type + ")";
      select.appendChild(option);
    });

    if (current && ledgers.some((ledger) => ledger.id === current)) {
      select.value = current;
    }
  }

  function setStateOptions(select, preferredValue) {
    const current = preferredValue ?? select.value;
    select.innerHTML = `<option value="">Select State</option>` + INDIA_STATES.map((stateName) => {
      return `<option value="${escapeHtml(stateName)}">${escapeHtml(stateName)}</option>`;
    }).join("");
    if (current && INDIA_STATES.includes(current)) {
      select.value = current;
    }
  }

  function companyVoucherPrefixes() {
    return cleanVoucherPrefixes(state.company && state.company.voucherPrefixes);
  }

  function readVoucherPrefixInputs() {
    return Object.fromEntries(Object.entries(PREFIX_INPUTS).map(([type, id]) => {
      const input = $("#" + id);
      return [type, cleanVoucherPrefix(input ? input.value : "", DEFAULT_VOUCHER_PREFIXES[type])];
    }));
  }

  function fillVoucherPrefixInputs(prefixes) {
    const clean = cleanVoucherPrefixes(prefixes);
    Object.entries(PREFIX_INPUTS).forEach(([type, id]) => {
      const input = $("#" + id);
      if (input) input.value = clean[type];
    });
  }

  function updateImagePreview(previewId, dataUrl, emptyText) {
    const preview = $("#" + previewId);
    if (!preview) return;
    preview.innerHTML = dataUrl
      ? `<img src="${escapeHtml(dataUrl)}" alt="${escapeHtml(emptyText)}">`
      : escapeHtml(emptyText);
  }

  function syncCompanyImagePreviews() {
    updateImagePreview("companyLogoPreview", companyLogoDraft, "No logo");
    updateImagePreview("companySignaturePreview", companySignatureDraft, "No signature");
    updateImagePreview("companyUpiQrPreview", companyUpiQrDraft, "No QR");
  }

  function upiPaymentUri(upiId, payeeName, amount, note) {
    const pa = String(upiId || "").trim();
    if (!pa) throw new Error("UPI ID is required to generate QR.");
    const params = [
      ["pa", pa],
      ["pn", String(payeeName || state.company?.name || "Speed Accounting").trim() || "Speed Accounting"],
      ["cu", "INR"]
    ];
    const amountValue = parseAmount(amount);
    if (amountValue > 0) params.push(["am", round2(amountValue).toFixed(2)]);
    if (note) params.push(["tn", String(note).trim()]);
    return "upi://pay?" + params
      .filter(([, value]) => value !== "")
      .map(([key, value]) => key + "=" + encodeURIComponent(value))
      .join("&");
  }

  function createQrDataUrl(text, cellSize = 7, margin = 2) {
    if (typeof global.qrcode !== "function") {
      throw new Error("QR generator file missing. qrcode.min.js ko same folder me rakho.");
    }
    const qr = global.qrcode(0, "M");
    qr.addData(String(text || ""));
    qr.make();
    return qr.createDataURL(cellSize, margin);
  }

  function createUpiQrDataUrl(upiId, payeeName, amount, note) {
    return createQrDataUrl(upiPaymentUri(upiId, payeeName, amount, note));
  }

  function generateCompanyUpiQr() {
    try {
      const upiId = $("#companyUpiId").value.trim();
      const payeeName = $("#companyPaymentName").value.trim() || $("#companyName").value.trim() || "Speed Accounting";
      companyUpiQrDraft = createUpiQrDataUrl(upiId, payeeName);
      syncCompanyImagePreviews();
      showToast("UPI QR generated. Press Save Company to store it.");
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function readCompanyImageFile(inputId, assignDraft) {
    const input = $("#" + inputId);
    const file = input && input.files && input.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      alertMessage("Please select an image file.");
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      assignDraft(String(reader.result || ""));
      syncCompanyImagePreviews();
      showToast("Image ready. Press Save Company to store it.");
      input.value = "";
    };
    reader.onerror = () => {
      alertMessage("Image could not be loaded.");
      input.value = "";
    };
    reader.readAsDataURL(file);
  }

  function savedCompanyState() {
    return state.company && INDIA_STATES.includes(state.company.state) ? state.company.state : "";
  }

  function currentCompanyState() {
    const companyStateField = $("#companyState");
    if (companyStateField && INDIA_STATES.includes(companyStateField.value)) {
      return companyStateField.value;
    }
    return savedCompanyState();
  }

  function populateSelects() {
    const typeSelect = $("#ledgerType");
    const selectedGroup = typeSelect.value || defaultLedgerGroupName("Customer");
    typeSelect.innerHTML = QUICK_LEDGER_GROUPS.map((group) => {
      return `<option value="${escapeHtml(group.name)}">${escapeHtml(group.name)} (${escapeHtml(group.type)})</option>`;
    }).join("");
    if (ledgerGroupByName(selectedGroup)) {
      typeSelect.value = selectedGroup;
    } else if (LEDGER_TYPES.includes(selectedGroup)) {
      typeSelect.value = defaultLedgerGroupName(selectedGroup);
    } else {
      typeSelect.value = defaultLedgerGroupName("Customer");
    }
    setStateOptions($("#ledgerState"));
    setStateOptions($("#quickLedgerState"));
    setStateOptions($("#companyState"));
    setStateOptions($("#salesPartyState"));
    setStateOptions($("#purchasePartyState"));

    const partyLedgers = state.ledgers.filter((ledger) => !["Sales", "Sales Return", "Purchase", "Purchase Return"].includes(ledger.type));
    const salesLedgerTypes = salesVoucherMode === "credit-note" ? ["Sales Return", "Sales"] : "Sales";
    const purchaseLedgerTypes = purchaseVoucherMode === "debit-note" ? ["Purchase Return", "Purchase"] : "Purchase";
    const salesLedgers = ledgersByType(state, salesLedgerTypes).sort((a, b) => salesLedgerTypes.indexOf(a.type) - salesLedgerTypes.indexOf(b.type));
    const purchaseLedgers = ledgersByType(state, purchaseLedgerTypes).sort((a, b) => purchaseLedgerTypes.indexOf(a.type) - purchaseLedgerTypes.indexOf(b.type));
    const currentSalesLedger = ledgerById(state, $("#salesLedger").value);
    const currentPurchaseLedger = ledgerById(state, $("#purchaseLedger").value);
    const preferredSalesLedger = salesVoucherMode === "credit-note"
      ? (currentSalesLedger && currentSalesLedger.type === "Sales Return" ? currentSalesLedger.id : (salesLedgers.find((ledger) => ledger.type === "Sales Return") || salesLedgers[0] || {}).id)
      : (currentSalesLedger && currentSalesLedger.type === "Sales" ? currentSalesLedger.id : (salesLedgers.find((ledger) => ledger.type === "Sales") || salesLedgers[0] || {}).id);
    const preferredPurchaseLedger = purchaseVoucherMode === "debit-note"
      ? (currentPurchaseLedger && currentPurchaseLedger.type === "Purchase Return" ? currentPurchaseLedger.id : (purchaseLedgers.find((ledger) => ledger.type === "Purchase Return") || purchaseLedgers[0] || {}).id)
      : (currentPurchaseLedger && currentPurchaseLedger.type === "Purchase" ? currentPurchaseLedger.id : (purchaseLedgers.find((ledger) => ledger.type === "Purchase") || purchaseLedgers[0] || {}).id);
    const salesLedgerPlaceholder = salesVoucherMode === "credit-note" ? "Create a sales return ledger first" : "Create a sales ledger first";
    const purchaseLedgerPlaceholder = purchaseVoucherMode === "debit-note" ? "Create a purchase return ledger first" : "Create a purchase ledger first";
    setSelectOptions($("#salesCustomer"), partyLedgers, "Create a party ledger first");
    setSelectOptions($("#salesLedger"), salesLedgers, salesLedgerPlaceholder, preferredSalesLedger);
    setSelectOptions($("#salesGstLedger"), ledgersByType(state, "GST"), "Create a GST ledger first");

    setSelectOptions($("#purchaseSupplier"), partyLedgers, "Create a party ledger first");
    setSelectOptions($("#purchaseLedger"), purchaseLedgers, purchaseLedgerPlaceholder, preferredPurchaseLedger);
    setSelectOptions($("#purchaseGstLedger"), ledgersByType(state, "GST"), "Create a GST ledger first");

    setSelectOptions($("#paymentAccount"), ledgersByType(state, ["Cash", "Bank"]), "Create a cash or bank ledger first");
    setSelectOptions($("#contraFromLedger"), ledgersByType(state, ["Cash", "Bank"]), "Create a cash or bank ledger first");
    setSelectOptions($("#contraToLedger"), ledgersByType(state, ["Cash", "Bank"]), "Create a cash or bank ledger first");
    setSelectOptions($("#receiptAccount"), ledgersByType(state, ["Cash", "Bank"]), "Create a cash or bank ledger first");
    setSelectOptions($("#cashBankLedger"), ledgersByType(state, ["Cash", "Bank"]), "Create a cash or bank ledger first");

    const settlementLedgers = state.ledgers.filter((ledger) => !["Cash", "Bank", "Sales", "Sales Return", "Purchase", "Purchase Return"].includes(ledger.type));
    setSelectOptions($("#paymentParty"), settlementLedgers, "Create a customer, supplier, or GST ledger first");
    setSelectOptions($("#receiptParty"), settlementLedgers, "Create a customer, supplier, or GST ledger first");
    setSelectOptions($("#journalDebitLedger"), state.ledgers, "Create a ledger first");
    setSelectOptions($("#journalCreditLedger"), state.ledgers, "Create a ledger first");

    setSelectOptions($("#ledgerReportSelect"), state.ledgers, "Create a ledger first");
    updatePartyDetails("sales");
    updatePartyDetails("purchase");
  }

  function fillCompanyForm() {
    const company = state.company || {};
    $("#companyName").value = company.name || "";
    $("#companyGstin").value = company.gstin || "";
    $("#companyPhone").value = company.phone || "";
    $("#companyState").value = INDIA_STATES.includes(company.state) ? company.state : "";
    $("#companyAddress").value = company.address || "";
    $("#companyBankDetails").value = company.bankDetails || "";
    $("#companyUpiId").value = company.upiId || "";
    $("#companyPaymentName").value = company.paymentName || "";
    $("#companyTerms").value = company.terms || "";
    $("#companyDeclaration").value = company.declaration || "";
    companyLogoDraft = company.logoDataUrl || "";
    companySignatureDraft = company.signatureDataUrl || "";
    companyUpiQrDraft = company.upiQrDataUrl || "";
    fillVoucherPrefixInputs(company.voucherPrefixes);
    syncCompanyImagePreviews();
    fillCustomFields("company", company.customFields || {});
  }

  function clearCompanyForm() {
    state = normalizeState(blankState());
    ensureCoreLedgers(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    fillCompanyForm();
    clearLedgerForm();
    clearStockItemForm();
    clearSalesForm();
    clearPurchaseForm();
    clearPaymentForm();
    clearContraForm();
    clearReceiptForm();
    clearJournalForm();
    renderAll();
    showToast("New company form ready.");
  }

  function renderCompanyBooks() {
    if (!$("#companyBookTable")) return;
    companyBooks = loadCompanyBooks();
    $("#companyBookCount").textContent = companyBooks.books.length + (companyBooks.books.length === 1 ? " company" : " companies");
    $("#companyBookTable").innerHTML = companyBooks.books.length ? companyBooks.books.map((book) => `
      <tr>
        <td>${escapeHtml(book.name)}</td>
        <td>${escapeHtml(book.gstin || "-")}</td>
        <td>${escapeHtml(book.state || "-")}</td>
        <td>${book.updatedOn ? escapeHtml(new Date(book.updatedOn).toLocaleString("en-IN")) : "-"}</td>
        <td>
          <div class="actions">
            <button class="table-btn" type="button" data-action="open-company-book" data-id="${book.id}">Open</button>
            <button class="table-btn delete" type="button" data-action="delete-company-book" data-id="${book.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("") : emptyRow(5, "No saved companies yet. Save current company first.");
  }

  function renderStartupGateway() {
    const list = $("#startupCompanyList");
    if (!list) return;
    companyBooks = loadCompanyBooks();
    const books = companyBooks.books.slice().sort((a, b) => String(b.updatedOn).localeCompare(String(a.updatedOn)));
    list.innerHTML = books.length ? books.map((book) => `
      <button class="startup-company-card" type="button" data-action="open-company-book" data-id="${escapeHtml(book.id)}">
        <strong>${escapeHtml(book.name)}</strong>
        <span>GSTIN: ${escapeHtml(book.gstin || "-")}</span>
        <span>State: ${escapeHtml(book.state || "-")} | Phone: ${escapeHtml(book.phone || "-")}</span>
        <small>${companyBooks.activeCompanyId === book.id ? "Active company" : "Open company"}${book.updatedOn ? " | " + escapeHtml(new Date(book.updatedOn).toLocaleString("en-IN")) : ""}</small>
      </button>
    `).join("") : `
      <div class="startup-company-card">
        <strong>No saved company yet</strong>
        <span>Create a company or restore backup to start working.</span>
        <small>Current browser data is still available behind this gateway.</small>
      </div>
    `;
  }

  function showStartupGateway() {
    const gateway = $("#startupGateway");
    if (!gateway) return;
    renderStartupGateway();
    gateway.classList.add("active");
    setTimeout(() => {
      const firstCompany = $("#startupCompanyList .startup-company-card");
      focusAndSelect(firstCompany || $("#startupCreateCompanyBtn"));
    }, 30);
  }

  function hideStartupGateway() {
    const gateway = $("#startupGateway");
    if (!gateway) return;
    gateway.classList.remove("active");
  }

  function openCompanyBook(id, preserveCurrent = true) {
    if (preserveCurrent) saveActiveCompanyBook();
    companyBooks = loadCompanyBooks();
    const book = companyBooks.books.find((item) => item.id === id);
    if (!book) {
      alertMessage("Company book not found.");
      return;
    }
    state = normalizeState(deepClone(book.data));
    if (state.company) state.company.id = book.id;
    companyBooks.activeCompanyId = book.id;
    saveCompanyBooks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    fillCompanyForm();
    clearLedgerForm();
    clearStockItemForm();
    clearSalesForm();
    clearPurchaseForm();
    clearPaymentForm();
    clearContraForm();
    clearReceiptForm();
    clearJournalForm();
    renderAll();
    hideStartupGateway();
    navigateTo("dashboard");
    showToast("Company opened: " + book.name);
  }

  function deleteCompanyBook(id) {
    companyBooks = loadCompanyBooks();
    const book = companyBooks.books.find((item) => item.id === id);
    if (!book) return;
    if (!window.confirm("Delete company '" + book.name + "'? Is company ka saved data remove ho jayega.")) return;
    companyBooks.books = companyBooks.books.filter((item) => item.id !== id);
    if (companyBooks.activeCompanyId === id) companyBooks.activeCompanyId = companyBooks.books[0] ? companyBooks.books[0].id : "";
    saveCompanyBooks();
    if (companyBooks.activeCompanyId) openCompanyBook(companyBooks.activeCompanyId, false);
    else {
      state = normalizeState(makeSampleState());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderAll();
    }
    renderCompanyBooks();
  }

  function customFieldsFor(screen) {
    return state.customFields.filter((field) => field.screen === screen);
  }

  function customButtonsFor(screen) {
    return state.customButtons.filter((button) => button.screen === screen);
  }

  function customFieldOptions(field) {
    return String(field.options || "")
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);
  }

  function customFieldDefault(field) {
    if (field.type === "checkbox") {
      return ["1", "yes", "true", "on", "checked"].includes(String(field.defaultValue || "").toLowerCase());
    }
    return field.defaultValue || "";
  }

  function customFieldValue(field, values) {
    if (values && Object.prototype.hasOwnProperty.call(values, field.key)) {
      return values[field.key];
    }
    return customFieldDefault(field);
  }

  function customValuesForCurrentForm(screen) {
    if (screen === "company") return state.company && state.company.customFields ? state.company.customFields : {};
    if (screen === "ledgers") {
      const editId = $("#ledgerEditId") ? $("#ledgerEditId").value : "";
      const ledger = editId ? ledgerById(state, editId) : null;
      return ledger && ledger.customFields ? ledger.customFields : {};
    }
    const editIdField = $("#" + screen + "EditId");
    const editId = editIdField ? editIdField.value : "";
    const tx = editId ? state.transactions.find((item) => item.id === editId) : null;
    return tx && tx.customFields ? tx.customFields : {};
  }

  function customFieldControlHtml(field, value) {
    const dataAttrs = `data-custom-screen="${field.screen}" data-custom-field-id="${field.id}" data-custom-field-key="${escapeHtml(field.key)}"`;
    const label = escapeHtml(field.label + (field.required && field.type !== "checkbox" ? " *" : ""));
    const required = field.required && field.type !== "checkbox" ? " required" : "";

    if (field.type === "textarea") {
      return `
        <label class="span-2">
          <span>${label}</span>
          <textarea rows="2" ${dataAttrs}${required}>${escapeHtml(value)}</textarea>
        </label>
      `;
    }

    if (field.type === "select") {
      const options = customFieldOptions(field);
      const current = String(value || "");
      const htmlOptions = [`<option value="">Select ${escapeHtml(field.label)}</option>`]
        .concat(options.map((option) => `<option value="${escapeHtml(option)}"${option === current ? " selected" : ""}>${escapeHtml(option)}</option>`));
      if (current && !options.includes(current)) {
        htmlOptions.push(`<option value="${escapeHtml(current)}" selected>${escapeHtml(current)}</option>`);
      }
      return `
        <label>
          <span>${label}</span>
          <select ${dataAttrs}${required}>${htmlOptions.join("")}</select>
        </label>
      `;
    }

    if (field.type === "checkbox") {
      return `
        <label class="check-row">
          <input type="checkbox" ${dataAttrs}${value ? " checked" : ""}>
          <span>${escapeHtml(field.label)}</span>
        </label>
      `;
    }

    const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : "text";
    const step = field.type === "number" ? ` step="0.01"` : "";
    return `
      <label>
        <span>${label}</span>
        <input type="${inputType}"${step} value="${escapeHtml(value)}" ${dataAttrs}${required}>
      </label>
    `;
  }

  function readCustomFields(screen, validate = true) {
    const values = {};
    customFieldsFor(screen).forEach((field) => {
      const control = document.querySelector(`[data-custom-screen="${screen}"][data-custom-field-id="${field.id}"]`);
      if (!control) {
        if (validate) values[field.key] = customFieldDefault(field);
        return;
      }
      const value = field.type === "checkbox" ? control.checked : String(control.value || "").trim();
      if (validate && field.required) {
        const missing = field.type === "checkbox" ? !value : String(value).trim() === "";
        if (missing) throw new Error(field.label + " custom field is required.");
      }
      values[field.key] = value;
    });
    return values;
  }

  function fillCustomFields(screen, values = {}) {
    customFieldsFor(screen).forEach((field) => {
      const control = document.querySelector(`[data-custom-screen="${screen}"][data-custom-field-id="${field.id}"]`);
      if (!control) return;
      const value = customFieldValue(field, values);
      if (field.type === "checkbox") {
        control.checked = Boolean(value);
      } else {
        control.value = value || "";
      }
    });
  }

  function renderCustomFieldContainers() {
    Object.keys(CUSTOM_SCREEN_LABELS).forEach((screen) => {
      const container = $("#customFields-" + screen);
      if (!container) return;
      const fields = customFieldsFor(screen);
      if (!fields.length) {
        container.classList.remove("active");
        container.innerHTML = "";
        return;
      }

      const savedValues = customValuesForCurrentForm(screen);
      const liveValues = readCustomFields(screen, false);
      const values = { ...savedValues, ...liveValues };
      container.classList.add("active");
      container.innerHTML = `
        <h4>Custom Fields</h4>
        <div class="form-grid">
          ${fields.map((field) => customFieldControlHtml(field, customFieldValue(field, values))).join("")}
        </div>
      `;
    });
  }

  function customValueDisplay(field, values) {
    const value = customFieldValue(field, values || {});
    if (field.type === "checkbox") return value ? "Yes" : "No";
    return String(value || "").trim();
  }

  function customPrintRows(screen, values) {
    return customFieldsFor(screen)
      .filter((field) => field.print)
      .map((field) => {
        const value = customValueDisplay(field, values);
        if (!value) return "";
        return `
          <tr>
            <th>${escapeHtml(field.label)}</th>
            <td>${escapeHtml(value)}</td>
          </tr>
        `;
      })
      .join("");
  }

  function customSummaryRows(screen, values) {
    return customFieldsFor(screen).map((field) => {
      const value = customValueDisplay(field, values);
      return [field.label, value || "Not set"];
    });
  }

  function setOptionsFromObject(select, options, preferredValue) {
    if (!select) return;
    const current = preferredValue ?? select.value;
    select.innerHTML = Object.entries(options)
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("");
    if (current && Object.prototype.hasOwnProperty.call(options, current)) {
      select.value = current;
    }
  }

  function renderCustomButtons() {
    Object.keys(CUSTOM_SCREEN_LABELS).forEach((screen) => {
      const container = $("#customButtons-" + screen);
      if (!container) return;
      const buttons = customButtonsFor(screen);
      if (!buttons.length) {
        container.classList.remove("active");
        container.innerHTML = "";
        return;
      }
      container.classList.add("active");
      container.innerHTML = buttons.map((button) => `
        <button class="ghost-btn compact" type="button" data-action="custom-button" data-id="${button.id}">
          ${escapeHtml(button.label)}
        </button>
      `).join("");
    });
  }

  function customActionLabel(action) {
    return {
      save: "Save",
      print: "Print",
      clear: "Clear",
      goto: "Open Screen",
      message: "Message"
    }[action] || action;
  }

  function renderCustomizePanel() {
    setOptionsFromObject($("#customFieldScreen"), CUSTOM_SCREEN_LABELS);
    setOptionsFromObject($("#customButtonScreen"), CUSTOM_SCREEN_LABELS);
    setOptionsFromObject($("#customButtonTarget"), CUSTOM_BUTTON_TARGETS);
    $("#customFieldCount").textContent = state.customFields.length + (state.customFields.length === 1 ? " field" : " fields");
    $("#customButtonCount").textContent = state.customButtons.length + (state.customButtons.length === 1 ? " button" : " buttons");

    $("#customFieldsTable").innerHTML = state.customFields.length ? state.customFields.map((field) => `
      <tr>
        <td>${escapeHtml(CUSTOM_SCREEN_LABELS[field.screen])}</td>
        <td>${escapeHtml(field.label)}</td>
        <td>${escapeHtml(field.type)}</td>
        <td>${field.print ? "Yes" : "No"}</td>
        <td>
          <div class="actions">
            <button class="table-btn" type="button" data-action="edit-custom-field" data-id="${field.id}">Edit</button>
            <button class="table-btn delete" type="button" data-action="delete-custom-field" data-id="${field.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("") : emptyRow(5, "No custom fields yet.");

    $("#customButtonsTable").innerHTML = state.customButtons.length ? state.customButtons.map((button) => `
      <tr>
        <td>${escapeHtml(CUSTOM_SCREEN_LABELS[button.screen])}</td>
        <td>${escapeHtml(button.label)}</td>
        <td>${escapeHtml(customActionLabel(button.action))}</td>
        <td>${button.action === "goto" ? escapeHtml(CUSTOM_BUTTON_TARGETS[button.target]) : "-"}</td>
        <td>
          <div class="actions">
            <button class="table-btn" type="button" data-action="edit-custom-button" data-id="${button.id}">Edit</button>
            <button class="table-btn delete" type="button" data-action="delete-custom-button" data-id="${button.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("") : emptyRow(5, "No custom buttons yet.");
  }

  function updatePartyDetails(type) {
    const ledgerId = type === "sales" ? $("#salesCustomer").value : $("#purchaseSupplier").value;
    const ledger = ledgerById(state, ledgerId);
    const addressField = type === "sales" ? $("#salesPartyAddress") : $("#purchasePartyAddress");
    const stateField = type === "sales" ? $("#salesPartyState") : $("#purchasePartyState");
    addressField.value = ledger ? ledger.address || "" : "";
    stateField.value = ledger && INDIA_STATES.includes(ledger.state) ? ledger.state : "";
    updateItemTotals(type);
  }

  function updateLedgerPartyDetails(ledgerId, address, stateName) {
    const ledger = ledgerById(state, ledgerId);
    if (!ledger || ledger.isVirtual) return;
    ledger.address = String(address || "").trim();
    ledger.state = INDIA_STATES.includes(stateName) ? stateName : "";
  }

  function groupDefaultsForContext(context) {
    const first = context === "purchase" ? "Sundry Creditors" : "Sundry Debtors";
    const second = context === "purchase" ? "Cash-in-Hand" : "Cash-in-Hand";
    const sorted = [...QUICK_LEDGER_GROUPS].sort((a, b) => {
      if (a.name === first) return -1;
      if (b.name === first) return 1;
      if (a.name === second) return -1;
      if (b.name === second) return 1;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }

  function renderQuickGroupList() {
    const query = $("#groupSearchInput").value.trim().toLowerCase();
    visibleQuickGroups = groupDefaultsForContext(quickLedgerContext).filter((group) => {
      return !query || group.name.toLowerCase().includes(query) || group.hint.toLowerCase().includes(query) || group.type.toLowerCase().includes(query);
    });

    if (!visibleQuickGroups.length) {
      $("#quickGroupList").innerHTML = `<div class="group-empty">No matching group found.</div>`;
      return;
    }

    selectedQuickGroupIndex = Math.max(0, Math.min(selectedQuickGroupIndex, visibleQuickGroups.length - 1));
    $("#quickGroupList").innerHTML = visibleQuickGroups.map((group, index) => `
      <button class="group-option ${index === selectedQuickGroupIndex ? "active" : ""}" type="button" data-group-index="${index}" role="option" aria-selected="${index === selectedQuickGroupIndex}">
        <strong>${escapeHtml(group.name)}</strong>
        <em>${escapeHtml(group.type)}</em>
        <small>${escapeHtml(group.hint)}</small>
      </button>
    `).join("");
    updateSelectedQuickGroup();
  }

  function updateSelectedQuickGroup() {
    const group = visibleQuickGroups[selectedQuickGroupIndex] || groupDefaultsForContext(quickLedgerContext)[0];
    if (!group) return;
    $("#selectedQuickGroup").textContent = group.name;
    $("#selectedQuickGroupHint").textContent = group.hint + " - stored as " + group.type;
  }

  function focusActiveQuickGroupOption() {
    const option = $("#quickGroupList .group-option.active");
    if (!option) return;
    focusAndSelect(option);
    option.scrollIntoView({ block: "nearest" });
  }

  function setSelectedQuickGroup(index, focusOption) {
    selectedQuickGroupIndex = Math.max(0, Math.min(index, visibleQuickGroups.length - 1));
    renderQuickGroupList();
    if (focusOption) {
      setTimeout(focusActiveQuickGroupOption, 0);
    }
  }

  function quickLedgerFields() {
    return [
      $("#quickLedgerName"),
      $("#quickLedgerGstin"),
      $("#quickLedgerPhone"),
      $("#quickLedgerState"),
      $("#quickLedgerAddress"),
      $("#saveQuickLedgerBtn"),
      $("#cancelQuickLedgerBtn")
    ];
  }

  function focusQuickLedgerField(index) {
    const fields = quickLedgerFields();
    focusAndSelect(fields[Math.max(0, Math.min(index, fields.length - 1))]);
  }

  function handleQuickLedgerFormKeyboard(event) {
    if (!event.target.closest(".group-form")) return;
    const fields = quickLedgerFields();
    const index = fields.indexOf(event.target);
    if (index === -1) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAndSelect($("#groupSearchInput"));
      return;
    }

    if (event.key === "Enter" && event.target === $("#saveQuickLedgerBtn")) {
      event.preventDefault();
      saveQuickLedger();
      return;
    }

    if (event.key === "Enter" && event.target === $("#cancelQuickLedgerBtn")) {
      event.preventDefault();
      closeQuickLedgerModal();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter") {
      event.preventDefault();
      focusQuickLedgerField(index + 1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft" || (event.key === "Backspace" && shouldBackspaceNavigate(event.target))) {
      event.preventDefault();
      focusQuickLedgerField(index - 1);
    }
  }

  function handleQuickGroupKeyboard(event) {
    const inGroups = event.target.closest("#quickGroupList") || event.target === $("#groupSearchInput");
    if (!inGroups) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedQuickGroup(selectedQuickGroupIndex + 1, true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedQuickGroup(selectedQuickGroupIndex - 1, true);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSelectedQuickGroup(0, true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setSelectedQuickGroup(visibleQuickGroups.length - 1, true);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusQuickLedgerField(0);
      return;
    }

    if (event.key === "Enter" && event.target.closest(".group-option")) {
      event.preventDefault();
      const option = event.target.closest(".group-option");
      setSelectedQuickGroup(Number(option.dataset.groupIndex), false);
      $("#saveQuickLedgerBtn").focus();
    }
  }

  function openQuickLedgerModal(context) {
    quickLedgerContext = context;
    selectedQuickGroupIndex = 0;
    $("#ledgerGroupTitle").textContent = context === "purchase" ? "Create Supplier / Party Ledger" : "Create Customer / Party Ledger";
    $("#quickLedgerName").value = "";
    $("#quickLedgerGstin").value = "";
    $("#quickLedgerPhone").value = "";
    $("#quickLedgerAddress").value = "";
    setStateOptions($("#quickLedgerState"), state.company && INDIA_STATES.includes(state.company.state) ? state.company.state : "");
    $("#groupSearchInput").value = "";
    renderQuickGroupList();
    $("#ledgerGroupModal").classList.add("open");
    $("#ledgerGroupModal").setAttribute("aria-hidden", "false");
    setTimeout(() => $("#quickLedgerName").focus(), 30);
  }

  function closeQuickLedgerModal() {
    $("#ledgerGroupModal").classList.remove("open");
    $("#ledgerGroupModal").setAttribute("aria-hidden", "true");
  }

  function saveQuickLedger() {
    const name = $("#quickLedgerName").value.trim();
    if (!name) {
      alertMessage("Party / ledger name is required.");
      $("#quickLedgerName").focus();
      return;
    }

    const duplicate = state.ledgers.find((ledger) => ledger.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      alertMessage("A ledger with this name already exists.");
      return;
    }

    const group = visibleQuickGroups[selectedQuickGroupIndex] || groupDefaultsForContext(quickLedgerContext)[0];
    const ledger = {
      id: nextId(state, "ledger", "L"),
      name,
      type: group.type,
      groupName: group.name,
      gstin: $("#quickLedgerGstin").value.trim().toUpperCase(),
      phone: $("#quickLedgerPhone").value.trim(),
      address: $("#quickLedgerAddress").value.trim(),
      state: $("#quickLedgerState").value,
      openingBalance: 0,
      openingSide: group.type === "Supplier" || group.type === "Sales" || group.type === "GST" ? "Cr" : "Dr"
    };

    state.ledgers.push(ledger);
    saveState();
    populateSelects();
    if (quickLedgerContext === "purchase") {
      $("#purchaseSupplier").value = ledger.id;
      navigateTo("purchase");
    } else {
      $("#salesCustomer").value = ledger.id;
      navigateTo(salesVoucherMode === "credit-note" ? "credit-note" : "sales");
    }
    closeQuickLedgerModal();
    renderAll();
    updatePartyDetails(quickLedgerContext === "purchase" ? "purchase" : "sales");
    const nextField = quickLedgerContext === "purchase" ? $("#purchaseLedger") : $("#salesLedger");
    focusAndSelect(nextField);
    showToast("Ledger created under " + group.name + ".");
  }

  function clearLedgerForm() {
    $("#ledgerEditId").value = "";
    $("#ledgerName").value = "";
    $("#ledgerType").value = defaultLedgerGroupName("Customer");
    $("#ledgerGstin").value = "";
    $("#ledgerPhone").value = "";
    $("#ledgerState").value = "";
    $("#ledgerAddress").value = "";
    $("#ledgerOpeningBalance").value = "0";
    $("#ledgerOpeningSide").value = "Dr";
    $("#ledgerSubmitBtn").textContent = "Add Ledger";
    fillCustomFields("ledgers", {});
  }

  function clearStockItemForm() {
    $("#stockItemEditId").value = "";
    $("#stockItemName").value = "";
    $("#stockItemHsn").value = "";
    $("#stockItemUnit").value = "Nos";
    $("#stockItemGst").value = "18";
    $("#stockItemOpeningQty").value = "0";
    $("#stockItemOpeningRate").value = "0";
    $("#stockItemPurchaseRate").value = "0";
    $("#stockItemSaleRate").value = "0";
    $("#stockItemMinStock").value = "0";
    $("#stockItemSubmitBtn").textContent = "Add Stock Item";
  }

  function stockItemBalance(item) {
    let quantity = parseAmount(item.openingQty);
    state.transactions.filter((tx) => isInventoryTransaction(tx.type)).forEach((tx) => {
      itemsFromTransaction(tx).forEach((row) => {
        const clean = cleanItem(row);
        const sameItem = clean.stockItemId
          ? clean.stockItemId === item.id
          : productKey(clean.name) === productKey(item.name);
        if (!sameItem) return;
        if (tx.type === "purchase" || tx.type === "credit-note") quantity = round2(quantity + clean.quantity);
        if (tx.type === "sales" || tx.type === "debit-note") quantity = round2(quantity - clean.quantity);
      });
    });
    return quantity;
  }

  function stockItemValue(item) {
    const rate = parseAmount(item.purchaseRate) || parseAmount(item.openingRate);
    return round2(stockItemBalance(item) * rate);
  }

  function saveStockItemFromForm() {
    const name = $("#stockItemName").value.trim();
    if (!name) throw new Error("Stock item name is required.");
    const editId = $("#stockItemEditId").value;
    const duplicate = state.stockItems.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editId);
    if (duplicate) throw new Error("Stock item with this name already exists.");

    const item = cleanStockItem({
      id: editId || nextId(state, "stockItem", "S"),
      name,
      hsn: $("#stockItemHsn").value.trim(),
      unit: $("#stockItemUnit").value.trim() || "Nos",
      gstRate: $("#stockItemGst").value,
      openingQty: $("#stockItemOpeningQty").value,
      openingRate: $("#stockItemOpeningRate").value,
      purchaseRate: $("#stockItemPurchaseRate").value,
      saleRate: $("#stockItemSaleRate").value,
      minStockLevel: $("#stockItemMinStock").value
    });

    if (editId) {
      const index = state.stockItems.findIndex((row) => row.id === editId);
      if (index === -1) throw new Error("Stock item not found.");
      state.stockItems[index] = item;
      showToast("Stock item updated.");
    } else {
      state.stockItems.push(item);
      showToast("Stock item added.");
    }
    saveState();
    clearStockItemForm();
    renderAll();
  }

  function editStockItem(id) {
    const item = state.stockItems.find((row) => row.id === id);
    if (!item) return;
    $("#stockItemEditId").value = item.id;
    $("#stockItemName").value = item.name;
    $("#stockItemHsn").value = item.hsn || "";
    $("#stockItemUnit").value = item.unit || "Nos";
    $("#stockItemGst").value = item.gstRate || 0;
    $("#stockItemOpeningQty").value = item.openingQty || 0;
    $("#stockItemOpeningRate").value = item.openingRate || 0;
    $("#stockItemPurchaseRate").value = item.purchaseRate || 0;
    $("#stockItemSaleRate").value = item.saleRate || 0;
    $("#stockItemMinStock").value = item.minStockLevel || 0;
    $("#stockItemSubmitBtn").textContent = "Update Stock Item";
    navigateTo("stock-items");
  }

  function stockItemIsUsed(id) {
    return state.transactions.some((tx) => {
      return itemsFromTransaction(tx).some((item) => cleanItem(item).stockItemId === id);
    });
  }

  function deleteStockItem(id) {
    const item = state.stockItems.find((row) => row.id === id);
    if (!item) return;
    if (stockItemIsUsed(id)) {
      alertMessage("This stock item is used in vouchers. Delete or edit those vouchers first.");
      return;
    }
    if (!window.confirm("Delete stock item '" + item.name + "'?")) return;
    state.stockItems = state.stockItems.filter((row) => row.id !== id);
    saveState();
    renderAll();
    showToast("Stock item deleted.");
  }

  function generateVoucherNo(type) {
    const prefix = companyVoucherPrefixes()[type] || "VCH";
    const count = state.transactions.filter((tx) => tx.type === type).length + 1;
    return prefix + "-" + String(count).padStart(3, "0");
  }

  function itemBody(type) {
    return type === "sales" ? $("#salesItemsBody") : $("#purchaseItemsBody");
  }

  const ITEM_NAV_SELECTOR = ".item-name, .item-hsn, .item-qty, .item-unit, .item-rate, .item-gst";

  function itemRows(type) {
    return Array.from(itemBody(type).querySelectorAll("tr"));
  }

  function itemCells(row) {
    return Array.from(row.querySelectorAll(ITEM_NAV_SELECTOR));
  }

  function focusAndSelect(element) {
    if (!element) return;
    element.focus();
    if (typeof element.select === "function" && !element.classList.contains("remove-item-row")) {
      element.select();
    }
  }

  function shouldBackspaceNavigate(target) {
    if (!target.matches("input, textarea")) return true;
    if (target.readOnly || target.disabled) return true;
    const value = String(target.value || "");
    let start = 0;
    let end = 0;
    try {
      start = target.selectionStart ?? 0;
      end = target.selectionEnd ?? start;
    } catch (error) {
      start = 0;
      end = 0;
    }
    if (!value) return true;
    if (start === 0) return true;
    return start === 0 && end === value.length;
  }

  function focusItemCell(type, rowIndex, colIndex) {
    const rows = itemRows(type);
    const row = rows[Math.max(0, Math.min(rowIndex, rows.length - 1))];
    if (!row) return;
    const cells = itemCells(row);
    focusAndSelect(cells[Math.max(0, Math.min(colIndex, cells.length - 1))]);
  }

  function focusAroundItemTable(type, direction) {
    const form = type === "sales" ? $("#salesForm") : $("#purchaseForm");
    const body = itemBody(type);
    const focusables = visibleNavigationTargets(form).filter((element) => !element.classList.contains("remove-item-row"));
    const itemTargets = Array.from(body.querySelectorAll(ITEM_NAV_SELECTOR));
    if (!itemTargets.length) return false;
    const boundary = direction < 0 ? itemTargets[0] : itemTargets[itemTargets.length - 1];
    const index = focusables.indexOf(boundary);
    if (index === -1) return false;
    const nextIndex = Math.max(0, Math.min(index + direction, focusables.length - 1));
    focusAndSelect(focusables[nextIndex]);
    return true;
  }

  function focusBeforeItemTable(type) {
    return focusAroundItemTable(type, -1);
  }

  function focusAfterItemTable(type) {
    return focusAroundItemTable(type, 1);
  }

  function removeItemRow(type, row) {
    if (type === "sales" || type === "purchase") hideSalesProductPicker();
    const rows = itemRows(type);
    const rowIndex = rows.indexOf(row);
    const colIndex = itemCells(row).findIndex((cell) => cell === document.activeElement);

    if (rows.length === 1) {
      setItemRows(type, [defaultItem()]);
      focusItemCell(type, 0, Math.max(0, colIndex));
      return;
    }

    row.remove();
    updateItemTotals(type);
    const nextRowIndex = Math.min(Math.max(rowIndex, 0), itemRows(type).length - 1);
    focusItemCell(type, nextRowIndex, Math.max(0, colIndex));
  }

  function locateItemCell(type, target) {
    const row = target.closest("tr");
    const rows = itemRows(type);
    const rowIndex = rows.indexOf(row);
    const colIndex = itemCells(row).indexOf(target);
    return { rows, rowIndex, colIndex };
  }

  function handleItemKeyboard(type, event) {
    const target = event.target.closest(ITEM_NAV_SELECTOR);
    if (!target) return;

    const { rows, rowIndex, colIndex } = locateItemCell(type, target);
    const colCount = itemCells(rows[rowIndex]).length;
    const key = event.key;

    if ((type === "sales" || type === "purchase") && handleSalesProductPickerKey(type, event)) return;

    if (event.ctrlKey && key.toLowerCase() === "r") {
      event.preventDefault();
      removeItemRow(type, rows[rowIndex]);
      return;
    }

    if (key === "ArrowRight") {
      event.preventDefault();
      if (colIndex === colCount - 1) {
        if (rowIndex === rows.length - 1) focusAfterItemTable(type);
        else focusItemCell(type, rowIndex + 1, 0);
        return;
      }
      focusItemCell(type, rowIndex, colIndex + 1);
      return;
    }

    if (key === "ArrowLeft") {
      event.preventDefault();
      if (colIndex === 0) {
        if (rowIndex === 0) focusBeforeItemTable(type);
        else focusItemCell(type, rowIndex - 1, colCount - 1);
        return;
      }
      focusItemCell(type, rowIndex, colIndex - 1);
      return;
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      if (rowIndex === rows.length - 1) {
        addItemRow(type);
      }
      focusItemCell(type, rowIndex + 1, colIndex);
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      if (rowIndex === 0) {
        focusBeforeItemTable(type);
        return;
      }
      focusItemCell(type, rowIndex - 1, colIndex);
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) {
        focusItemCell(type, rowIndex, colIndex - 1);
        return;
      }
      if (colIndex === colCount - 1) {
        if (rowIndex === rows.length - 1) {
          focusAfterItemTable(type);
        } else {
          focusItemCell(type, rowIndex + 1, 0);
        }
        return;
      }
      focusItemCell(type, rowIndex, colIndex + 1);
      return;
    }

    if (key === "Backspace" && shouldBackspaceNavigate(target)) {
      event.preventDefault();
      if (colIndex === 0 && rowIndex === 0) {
        focusBeforeItemTable(type);
        return;
      }
      if (colIndex === 0 && rowIndex > 0) {
        focusItemCell(type, rowIndex - 1, colCount - 1);
        return;
      }
      focusItemCell(type, rowIndex, colIndex - 1);
    }
  }

  function defaultItem() {
    return { name: "", hsn: "", quantity: 1, unit: "Nos", rate: 0, gstRate: 18 };
  }

  function isInterstateForm(type) {
    const companyState = currentCompanyState();
    const partyStateField = type === "sales" ? $("#salesPartyState") : $("#purchasePartyState");
    const partyState = partyStateField && INDIA_STATES.includes(partyStateField.value) ? partyStateField.value : "";
    return Boolean(companyState && partyState && companyState !== partyState);
  }

  function productStockText(product) {
    if (!product) return "";
    return "Stock " + moneyFormat.format(product.stock) + " " + (product.unit || "Nos");
  }

  function productMetaText(product) {
    if (!product) return "";
    const unit = product.unit || "Nos";
    return [
      "Purchase " + money(product.lastPurchaseRate),
      "Sale " + money(product.saleRate || 0),
      "Unit " + unit,
      product.hsn ? "HSN " + product.hsn : "",
      "GST " + moneyFormat.format(product.gstRate) + "%",
      productStockText(product)
    ].filter(Boolean).join(" | ");
  }

  function salesProductMatches(query) {
    const text = String(query || "").trim().toLowerCase();
    return inventoryProductCatalog(state)
      .filter((product) => {
        if (!text) return true;
        return product.name.toLowerCase().includes(text)
          || String(product.hsn || "").toLowerCase().includes(text);
      })
      .slice(0, 12);
  }

  function renderSalesProductPicker() {
    const picker = $("#salesProductPicker");
    if (!picker) return;
    if (!activeSalesProductInput || !activeSalesProductMatches.length) {
      picker.hidden = true;
      picker.innerHTML = "";
      return;
    }

    const rect = activeSalesProductInput.getBoundingClientRect();
    const width = Math.min(Math.max(360, rect.width + 180), window.innerWidth - 16);
    picker.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + "px";
    picker.style.top = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 260)) + "px";
    picker.style.width = width + "px";
    picker.hidden = false;
    picker.innerHTML = activeSalesProductMatches.map((product, index) => `
      <button class="product-option ${index === activeSalesProductIndex ? "active" : ""}" type="button" data-index="${index}">
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(productMetaText(product))}</span>
      </button>
    `).join("");
  }

  function showSalesProductPicker(input) {
    activeSalesProductInput = input;
    activeSalesProductMatches = salesProductMatches(input.value);
    activeSalesProductIndex = 0;
    const currentKey = productKey(input.value);
    const exactIndex = activeSalesProductMatches.findIndex((product) => product.key === currentKey);
    if (exactIndex >= 0) activeSalesProductIndex = exactIndex;
    renderSalesProductPicker();
  }

  function hideSalesProductPicker() {
    const picker = $("#salesProductPicker");
    if (picker) {
      picker.hidden = true;
      picker.innerHTML = "";
    }
    activeSalesProductInput = null;
    activeSalesProductMatches = [];
    activeSalesProductIndex = 0;
  }

  function updateSalesProductHint(row, product) {
    const hint = row && row.querySelector(".item-cost-hint");
    if (!hint) return;
    hint.textContent = product ? productMetaText(product) : "";
  }

  function applyPurchasedProductToSalesRow(row, force, type = activeProductPickerType) {
    if (!row) return false;
    const nameInput = row.querySelector(".item-name");
    const product = findPurchasedProductByName(nameInput.value, state);
    if (!product) {
      delete row.dataset.purchaseProductKey;
      row.dataset.stockItemId = "";
      updateSalesProductHint(row, null);
      return false;
    }

    updateSalesProductHint(row, product);
    if (!force && row.dataset.purchaseProductKey === product.key) return true;

    row.dataset.purchaseProductKey = product.key;
    row.dataset.stockItemId = product.stockItemId || "";
    nameInput.value = product.name;
    row.querySelector(".item-hsn").value = product.hsn || "";
    row.querySelector(".item-unit").value = product.unit || "Nos";
    row.querySelector(".item-gst").value = product.gstRate || 0;
    row.querySelector(".item-rate").value = type === "purchase"
      ? (product.purchaseRate || product.lastPurchaseRate || product.openingRate || "")
      : (product.saleRate || product.lastPurchaseRate || product.purchaseRate || "");
    return true;
  }

  function selectSalesProduct(product) {
    const input = activeSalesProductInput;
    if (!input || !product) return;
    const row = input.closest("tr");
    input.value = product.name;
    applyPurchasedProductToSalesRow(row, true, activeProductPickerType);
    updateItemTotals(activeProductPickerType);
    hideSalesProductPicker();
    focusAndSelect(row.querySelector(".item-rate"));
    showToast(product.name + " selected. Rate apne hisaab se edit kar sakte ho.");
  }

  function handleSalesProductPickerKey(type, event) {
    const target = event.target.closest(".item-name");
    if (!target) return false;
    const hasProducts = inventoryProductCatalog(state).length > 0;
    if (!hasProducts) return false;
    const isOpen = activeSalesProductInput === target && activeSalesProductMatches.length > 0;

    if ((event.key === " " || event.key === "Spacebar") && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      activeProductPickerType = type;
      showSalesProductPicker(target);
      return true;
    }

    if (event.key === "ArrowDown" && isOpen) {
      event.preventDefault();
      activeSalesProductIndex = Math.min(activeSalesProductIndex + 1, activeSalesProductMatches.length - 1);
      renderSalesProductPicker();
      return true;
    }

    if (event.key === "ArrowUp" && isOpen) {
      event.preventDefault();
      activeSalesProductIndex = Math.max(activeSalesProductIndex - 1, 0);
      renderSalesProductPicker();
      return true;
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      selectSalesProduct(activeSalesProductMatches[activeSalesProductIndex]);
      return true;
    }

    if (event.key === "Escape" && activeSalesProductInput === target) {
      event.preventDefault();
      hideSalesProductPicker();
      return true;
    }

    return false;
  }

  function handleInventoryItemsInput(type, event) {
    const nameInput = event.target.closest(".item-name");
    if (nameInput) {
      const row = nameInput.closest("tr");
      delete row.dataset.purchaseProductKey;
      row.dataset.stockItemId = "";
      updateSalesProductHint(row, null);
      if (activeSalesProductInput === nameInput) hideSalesProductPicker();
    }
    updateItemTotals(type);
  }

  function handleSalesItemsFocus(event) {
    if (!event.target.closest(".item-name")) hideSalesProductPicker();
  }

  function itemRowTemplate(type, item) {
    const row = calculateItem(item || defaultItem(), isInterstateForm(type));
    const itemNamePlaceholder = "Press Space for stock item";
    const itemNameCellClass = type === "sales" || type === "purchase" ? " class=\"item-name-cell\"" : "";
    return `
      <tr data-stock-item-id="${escapeHtml(row.stockItemId || "")}">
        <td${itemNameCellClass}>
          <input class="item-name" type="text" value="${escapeHtml(row.name)}" placeholder="${itemNamePlaceholder}" autocomplete="off">
          <small class="item-cost-hint"></small>
        </td>
        <td><input class="item-hsn" type="text" value="${escapeHtml(row.hsn)}" placeholder="HSN/SAC"></td>
        <td><input class="item-qty" type="number" min="0" step="0.01" value="${row.quantity || ""}"></td>
        <td><input class="item-unit" type="text" value="${escapeHtml(row.unit || "Nos")}"></td>
        <td><input class="item-rate" type="number" min="0" step="0.01" value="${row.rate || ""}"></td>
        <td><input class="item-gst" type="number" min="0" step="0.01" value="${row.gstRate || 18}"></td>
        <td><input class="item-computed item-taxable" type="text" value="${money(row.taxable)}" readonly></td>
        <td><input class="item-computed item-cgst" type="text" value="${money(row.cgst)}" readonly></td>
        <td><input class="item-computed item-sgst" type="text" value="${money(row.sgst)}" readonly></td>
        <td><input class="item-computed item-igst" type="text" value="${money(row.igst)}" readonly></td>
        <td><input class="item-computed item-total" type="text" value="${money(row.total)}" readonly></td>
        <td><button class="table-btn delete remove-item-row" type="button">Remove</button></td>
      </tr>
    `;
  }

  function setItemRows(type, items) {
    if (type === "sales" || type === "purchase") hideSalesProductPicker();
    const rows = Array.isArray(items) && items.length ? items : [defaultItem()];
    itemBody(type).innerHTML = rows.map((item) => itemRowTemplate(type, item)).join("");
    updateItemTotals(type);
  }

  function addItemRow(type, item) {
    itemBody(type).insertAdjacentHTML("beforeend", itemRowTemplate(type, item || defaultItem()));
    updateItemTotals(type);
  }

  function readItemRows(type, strict) {
    const rows = Array.from(itemBody(type).querySelectorAll("tr"));
    const items = rows.map((row) => ({
      stockItemId: row.dataset.stockItemId || "",
      name: row.querySelector(".item-name").value.trim(),
      hsn: row.querySelector(".item-hsn").value.trim(),
      quantity: parseAmount(row.querySelector(".item-qty").value),
      unit: row.querySelector(".item-unit").value.trim() || "Nos",
      rate: parseAmount(row.querySelector(".item-rate").value),
      gstRate: parseAmount(row.querySelector(".item-gst").value)
    })).filter((item) => item.name || item.quantity || item.rate);

    if (strict) {
      if (!items.length) throw new Error("At least one item row is required.");
      items.forEach((item, index) => {
        const line = "Item row " + (index + 1) + ": ";
        if (!item.name) throw new Error(line + "item name is required.");
        if (item.quantity <= 0) throw new Error(line + "quantity must be greater than zero.");
        if (item.rate < 0) throw new Error(line + "rate cannot be negative.");
        if (item.gstRate < 0) throw new Error(line + "GST % cannot be negative.");
      });
    }
    return items;
  }

  function updateItemTotals(type) {
    const body = itemBody(type);
    const isInterstate = isInterstateForm(type);
    Array.from(body.querySelectorAll("tr")).forEach((row) => {
      const item = {
        stockItemId: row.dataset.stockItemId || "",
        name: row.querySelector(".item-name").value,
        hsn: row.querySelector(".item-hsn").value,
        quantity: row.querySelector(".item-qty").value,
        unit: row.querySelector(".item-unit").value,
        rate: row.querySelector(".item-rate").value,
        gstRate: row.querySelector(".item-gst").value
      };
      const total = calculateItem(item, isInterstate);
      row.querySelector(".item-taxable").value = money(total.taxable);
      row.querySelector(".item-cgst").value = money(total.cgst);
      row.querySelector(".item-sgst").value = money(total.sgst);
      row.querySelector(".item-igst").value = money(total.igst);
      row.querySelector(".item-total").value = money(total.total);
    });

    const totals = calculateItems(readItemRows(type, false), isInterstate);
    const modeText = isInterstate ? "IGST - Interstate" : "CGST + SGST";
    if (type === "sales") {
      $("#salesGstMode").textContent = modeText;
      $("#salesCgstAmount").textContent = money(totals.cgst);
      $("#salesSgstAmount").textContent = money(totals.sgst);
      $("#salesIgstAmount").textContent = money(totals.igst);
      $("#salesGrandTotal").textContent = money(totals.total);
    } else {
      $("#purchaseGstMode").textContent = modeText;
      $("#purchaseCgstAmount").textContent = money(totals.cgst);
      $("#purchaseSgstAmount").textContent = money(totals.sgst);
      $("#purchaseIgstAmount").textContent = money(totals.igst);
      $("#purchaseGrandTotal").textContent = money(totals.total);
    }
  }

  function clearSalesForm() {
    $("#salesEditId").value = "";
    $("#salesDate").value = today();
    $("#salesNo").value = generateVoucherNo(salesVoucherMode);
    $("#salesReference").value = "";
    $("#salesDescription").value = "";
    $("#salesSubmitBtn").textContent = salesModeConfig(salesVoucherMode).submitText;
    populateSelects();
    setItemRows("sales", [defaultItem()]);
    fillCustomFields(salesVoucherMode, {});
  }

  function clearPurchaseForm() {
    $("#purchaseEditId").value = "";
    $("#purchaseDate").value = today();
    $("#purchaseNo").value = generateVoucherNo(purchaseVoucherMode);
    $("#purchaseReference").value = "";
    $("#purchaseDescription").value = "";
    $("#purchaseSubmitBtn").textContent = purchaseModeConfig(purchaseVoucherMode).submitText;
    populateSelects();
    setItemRows("purchase", [defaultItem()]);
    fillCustomFields(purchaseVoucherMode, {});
  }

  function clearPaymentForm() {
    $("#paymentEditId").value = "";
    $("#paymentDate").value = today();
    $("#paymentNo").value = generateVoucherNo("payment");
    $("#paymentReference").value = "";
    $("#paymentAmount").value = "";
    if ($("#paymentAdjustVoucher")) $("#paymentAdjustVoucher").value = "";
    $("#paymentNarration").value = "";
    $("#paymentSubmitBtn").textContent = "Save Payment";
    populateSelects();
    fillCustomFields("payment", {});
    updateSettlementOutstanding("payment");
  }

  function clearContraForm() {
    $("#contraEditId").value = "";
    $("#contraDate").value = today();
    $("#contraNo").value = generateVoucherNo("contra");
    $("#contraReference").value = "";
    $("#contraAmount").value = "";
    $("#contraNarration").value = "";
    $("#contraSubmitBtn").textContent = "Save Contra";
    populateSelects();
  }

  function clearReceiptForm() {
    $("#receiptEditId").value = "";
    $("#receiptDate").value = today();
    $("#receiptNo").value = generateVoucherNo("receipt");
    $("#receiptReference").value = "";
    $("#receiptAmount").value = "";
    if ($("#receiptAdjustVoucher")) $("#receiptAdjustVoucher").value = "";
    $("#receiptNarration").value = "";
    $("#receiptSubmitBtn").textContent = "Save Receipt";
    populateSelects();
    fillCustomFields("receipt", {});
    updateSettlementOutstanding("receipt");
  }

  function clearJournalForm() {
    $("#journalEditId").value = "";
    $("#journalDate").value = today();
    $("#journalNo").value = generateVoucherNo("journal");
    $("#journalReference").value = "";
    $("#journalAmount").value = "";
    $("#journalNarration").value = "";
    $("#journalSubmitBtn").textContent = "Save Journal";
    populateSelects();
    updateJournalTransferHint();
  }

  function preferredLedgerForTransfer(type, nameText) {
    const normalizedName = String(nameText || "").toLowerCase();
    return state.ledgers.find((ledger) => ledger.type === type && String(ledger.name || "").toLowerCase() === normalizedName)
      || state.ledgers.find((ledger) => ledger.type === type && String(ledger.name || "").toLowerCase().includes(normalizedName.split(" ")[0]))
      || state.ledgers.find((ledger) => ledger.type === type)
      || null;
  }

  function salesPurchaseTransferLedgers() {
    return {
      sales: preferredLedgerForTransfer("Sales", "Sales Account"),
      purchase: preferredLedgerForTransfer("Purchase", "Purchase Account")
    };
  }

  function updateJournalTransferHint() {
    const hint = $("#journalTransferHint");
    if (!hint) return;
    const ledgers = salesPurchaseTransferLedgers();
    if (!ledgers.sales || !ledgers.purchase) {
      hint.textContent = "Sales Account aur Purchase Account ledger pehle create hone chahiye.";
      return;
    }
    hint.textContent = `${ledgers.sales.name}: ${balanceText(ledgerBalance(state, ledgers.sales.id))} | ${ledgers.purchase.name}: ${balanceText(ledgerBalance(state, ledgers.purchase.id))}`;
  }

  function fillJournalTransfer() {
    const ledgers = salesPurchaseTransferLedgers();
    if (!ledgers.sales || !ledgers.purchase) {
      throw new Error("Sales Account aur Purchase Account ledger pehle create karo.");
    }
    const direction = $("#journalTransferDirection").value;
    const amount = requirePositive($("#journalTransferAmount").value, "Transfer amount");
    const fromLedger = direction === "sales-to-purchase" ? ledgers.sales : ledgers.purchase;
    const toLedger = direction === "sales-to-purchase" ? ledgers.purchase : ledgers.sales;

    $("#journalEditId").value = "";
    $("#journalDate").value = today();
    $("#journalNo").value = generateVoucherNo("journal");
    $("#journalReference").value = "SP-TRANSFER";
    $("#journalDebitLedger").value = toLedger.id;
    $("#journalCreditLedger").value = fromLedger.id;
    $("#journalAmount").value = amount;
    $("#journalNarration").value = `Transfer from ${fromLedger.name} to ${toLedger.name}`;
    $("#journalSubmitBtn").textContent = "Save Journal";
  }

  function saveJournalTransfer() {
    fillJournalTransfer();
    upsertTransaction(collectJournalForm());
    clearJournalForm();
    $("#journalTransferAmount").value = "";
    updateJournalTransferHint();
    showToast("Sales/Purchase transfer saved.");
  }

  function salesModeConfig(mode) {
    return {
      sales: {
        title: "Sales Invoice",
        description: "Create GST invoices with CGST, SGST, grand total, and print output.",
        submitText: "Save Invoice",
        updateText: "Update Invoice",
        register: "Sales Register",
        countSingular: "invoice",
        countPlural: "invoices",
        emptyText: "No sales invoices available."
      },
      "credit-note": {
        title: "Credit Note",
        description: "Record sales returns, customer credit notes, and output GST reversal.",
        submitText: "Save Credit Note",
        updateText: "Update Credit Note",
        register: "Credit Note Register",
        countSingular: "note",
        countPlural: "notes",
        emptyText: "No credit notes available."
      },
      "sales-order": {
        title: "Sales Order",
        description: "Create customer sales orders without posting accounting or GST ledgers.",
        submitText: "Save Sales Order",
        updateText: "Update Sales Order",
        register: "Sales Order Register",
        countSingular: "order",
        countPlural: "orders",
        emptyText: "No sales orders available."
      },
      "delivery-challan": {
        title: "Delivery Challan",
        description: "Create delivery challans with item details and print output.",
        submitText: "Save Challan",
        updateText: "Update Challan",
        register: "Delivery Challan Register",
        countSingular: "challan",
        countPlural: "challans",
        emptyText: "No delivery challans available."
      }
    }[mode] || null;
  }

  function purchaseModeConfig(mode) {
    return {
      purchase: {
        title: "Purchase Voucher",
        description: "Record supplier purchases and input GST credit.",
        submitText: "Save Purchase",
        updateText: "Update Purchase",
        register: "Purchase Register",
        countSingular: "voucher",
        countPlural: "vouchers",
        emptyText: "No purchase vouchers available."
      },
      "debit-note": {
        title: "Debit Note",
        description: "Record purchase returns, supplier debit notes, and input GST reversal.",
        submitText: "Save Debit Note",
        updateText: "Update Debit Note",
        register: "Debit Note Register",
        countSingular: "note",
        countPlural: "notes",
        emptyText: "No debit notes available."
      },
      "purchase-order": {
        title: "Purchase Order",
        description: "Create supplier purchase orders without posting accounting or GST ledgers.",
        submitText: "Save Purchase Order",
        updateText: "Update Purchase Order",
        register: "Purchase Order Register",
        countSingular: "order",
        countPlural: "orders",
        emptyText: "No purchase orders available."
      }
    }[mode] || null;
  }

  function setSalesVoucherMode(mode) {
    salesVoucherMode = salesModeConfig(mode) ? mode : "sales";
    const config = salesModeConfig(salesVoucherMode);
    const heading = $("#sales .section-heading h3");
    const description = $("#sales .section-heading p");
    const registerTitle = $("#sales .panel-header h4");
    if (heading) heading.textContent = config.title;
    if (description) description.textContent = config.description;
    if (registerTitle) registerTitle.textContent = config.register;
    if (!$("#salesEditId").value) {
      populateSelects();
      $("#salesNo").value = generateVoucherNo(salesVoucherMode);
      $("#salesSubmitBtn").textContent = config.submitText;
    }
    renderSales();
  }

  function setPurchaseVoucherMode(mode) {
    purchaseVoucherMode = purchaseModeConfig(mode) ? mode : "purchase";
    const config = purchaseModeConfig(purchaseVoucherMode);
    const heading = $("#purchase .section-heading h3");
    const description = $("#purchase .section-heading p");
    const registerTitle = $("#purchase .panel-header h4");
    if (heading) heading.textContent = config.title;
    if (description) description.textContent = config.description;
    if (registerTitle) registerTitle.textContent = config.register;
    if (!$("#purchaseEditId").value) {
      populateSelects();
      $("#purchaseNo").value = generateVoucherNo(purchaseVoucherMode);
      $("#purchaseSubmitBtn").textContent = config.submitText;
    }
    renderPurchase();
  }

  function requireSelectValue(id, label) {
    const value = $(id).value;
    if (!value) {
      throw new Error(label + " is required. Create the required ledger first.");
    }
    return value;
  }

  function requirePositive(value, label) {
    const amount = parseAmount(value);
    if (amount <= 0) throw new Error(label + " must be greater than zero.");
    return amount;
  }

  function collectSalesForm() {
    const items = readItemRows("sales", true);
    const description = $("#salesDescription").value.trim() || items.map((item) => item.name).join(", ");
    return {
      id: $("#salesEditId").value || null,
      type: salesVoucherMode,
      date: $("#salesDate").value,
      voucherNo: $("#salesNo").value.trim(),
      referenceNo: $("#salesReference").value.trim(),
      companyState: currentCompanyState(),
      partyLedgerId: requireSelectValue("#salesCustomer", "Customer"),
      salesLedgerId: requireSelectValue("#salesLedger", "Sales ledger"),
      gstLedgerId: requireSelectValue("#salesGstLedger", "GST ledger"),
      partyAddress: $("#salesPartyAddress").value.trim(),
      partyState: $("#salesPartyState").value,
      description,
      items,
      customFields: readCustomFields(salesVoucherMode)
    };
  }

  function collectPurchaseForm() {
    const items = readItemRows("purchase", true);
    const description = $("#purchaseDescription").value.trim() || items.map((item) => item.name).join(", ");
    return {
      id: $("#purchaseEditId").value || null,
      type: purchaseVoucherMode,
      date: $("#purchaseDate").value,
      voucherNo: $("#purchaseNo").value.trim(),
      referenceNo: $("#purchaseReference").value.trim(),
      companyState: currentCompanyState(),
      partyLedgerId: requireSelectValue("#purchaseSupplier", "Supplier"),
      purchaseLedgerId: requireSelectValue("#purchaseLedger", "Purchase ledger"),
      gstLedgerId: requireSelectValue("#purchaseGstLedger", "GST ledger"),
      partyAddress: $("#purchasePartyAddress").value.trim(),
      partyState: $("#purchasePartyState").value,
      description,
      items,
      customFields: readCustomFields(purchaseVoucherMode)
    };
  }

  function collectPaymentForm() {
    return {
      id: $("#paymentEditId").value || null,
      type: "payment",
      date: $("#paymentDate").value,
      voucherNo: $("#paymentNo").value.trim(),
      referenceNo: $("#paymentReference").value.trim(),
      accountLedgerId: requireSelectValue("#paymentAccount", "Paid from ledger"),
      partyLedgerId: requireSelectValue("#paymentParty", "Payee ledger"),
      amount: requirePositive($("#paymentAmount").value, "Amount"),
      adjustmentVoucherId: $("#paymentAdjustVoucher") ? $("#paymentAdjustVoucher").value : "",
      narration: $("#paymentNarration").value.trim(),
      customFields: readCustomFields("payment")
    };
  }

  function collectContraForm() {
    const fromLedgerId = requireSelectValue("#contraFromLedger", "Transfer from ledger");
    const toLedgerId = requireSelectValue("#contraToLedger", "Transfer to ledger");
    if (fromLedgerId === toLedgerId) {
      throw new Error("Transfer from aur transfer to ledger alag hone chahiye.");
    }
    return {
      id: $("#contraEditId").value || null,
      type: "contra",
      date: $("#contraDate").value,
      voucherNo: $("#contraNo").value.trim(),
      referenceNo: $("#contraReference").value.trim(),
      fromLedgerId,
      toLedgerId,
      amount: requirePositive($("#contraAmount").value, "Amount"),
      narration: $("#contraNarration").value.trim()
    };
  }

  function collectReceiptForm() {
    return {
      id: $("#receiptEditId").value || null,
      type: "receipt",
      date: $("#receiptDate").value,
      voucherNo: $("#receiptNo").value.trim(),
      referenceNo: $("#receiptReference").value.trim(),
      accountLedgerId: requireSelectValue("#receiptAccount", "Received in ledger"),
      partyLedgerId: requireSelectValue("#receiptParty", "From ledger"),
      amount: requirePositive($("#receiptAmount").value, "Amount"),
      adjustmentVoucherId: $("#receiptAdjustVoucher") ? $("#receiptAdjustVoucher").value : "",
      narration: $("#receiptNarration").value.trim(),
      customFields: readCustomFields("receipt")
    };
  }

  function collectJournalForm() {
    const debitLedgerId = requireSelectValue("#journalDebitLedger", "Debit ledger");
    const creditLedgerId = requireSelectValue("#journalCreditLedger", "Credit ledger");
    if (debitLedgerId === creditLedgerId) {
      throw new Error("Debit and credit ledger alag hone chahiye.");
    }
    return {
      id: $("#journalEditId").value || null,
      type: "journal",
      date: $("#journalDate").value,
      voucherNo: $("#journalNo").value.trim(),
      referenceNo: $("#journalReference").value.trim(),
      debitLedgerId,
      creditLedgerId,
      amount: requirePositive($("#journalAmount").value, "Amount"),
      narration: $("#journalNarration").value.trim()
    };
  }

  function validateVoucher(tx) {
    if (!tx.date) throw new Error("Date is required.");
    if (!tx.voucherNo) throw new Error("Voucher number is required.");
    if ((tx.description ?? tx.narration ?? "").trim() === "") throw new Error("Description or narration is required.");
  }

  function upsertTransaction(tx) {
    validateVoucher(tx);
    if (isItemVoucher(tx.type)) {
      updateLedgerPartyDetails(tx.partyLedgerId, tx.partyAddress, tx.partyState);
    }
    if (tx.id) {
      const index = state.transactions.findIndex((item) => item.id === tx.id);
      if (index === -1) throw new Error("Transaction not found.");
      tx.createdOn = state.transactions[index].createdOn || state.transactions[index].date || today();
      tx.updatedOn = today();
      state.transactions[index] = tx;
    } else {
      tx.id = nextId(state, "transaction", "T");
      tx.createdOn = today();
      tx.updatedOn = today();
      state.transactions.push(tx);
    }
    saveState();
    renderAll();
  }

  function updateSalesTaxStrip() {
    updateItemTotals("sales");
  }

  function updatePurchaseTaxStrip() {
    updateItemTotals("purchase");
  }

  function ledgerName(id) {
    const ledger = ledgerById(state, id);
    return ledger ? ledger.name : "Missing ledger";
  }

  function renderDashboard() {
    const totals = dashboardTotals(state);
    $("#metricSales").textContent = money(totals.sales);
    $("#metricPurchase").textContent = money(totals.purchase);
    $("#metricGst").textContent = money(totals.gstPayable);
    $("#metricCash").textContent = money(totals.cashBalance);

    const company = state.company || {};
    $("#activeCompanyName").textContent = company.name || "No company";
    $("#companySummary").innerHTML = [
      ["Name", company.name || "Not set"],
      ["GSTIN", company.gstin || "Not set"],
      ["Phone", company.phone || "Not set"],
      ["State", company.state || "Not set"],
      ["Address", company.address || "Not set"]
    ].concat(customSummaryRows("company", company.customFields || {})).map(([label, value]) => `
      <div class="summary-row">
        <span>${label}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join("");

    const recent = [...state.transactions]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 8);
    $("#recentTransactions").innerHTML = recent.length ? recent.map((tx) => {
      const amount = transactionAmount(tx);
      return `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${transactionLabel(tx.type)}</td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(ledgerName(tx.partyLedgerId))}</td>
          <td class="num">${money(amount)}</td>
        </tr>
      `;
    }).join("") : emptyRow(5, "No transactions yet.");
  }

  function renderTodayEntries() {
    const currentDate = today();
    const rows = state.transactions
      .filter((tx) => tx.date === currentDate || tx.createdOn === currentDate)
      .sort(sortByDateDesc);

    let salesTotal = 0;
    let purchaseTotal = 0;
    let receiptTotal = 0;
    let paymentTotal = 0;

    rows.forEach((tx) => {
      if (tx.type === "sales") salesTotal = round2(salesTotal + transactionTotals(tx).taxable);
      if (tx.type === "credit-note") salesTotal = round2(salesTotal - transactionTotals(tx).taxable);
      if (tx.type === "purchase") purchaseTotal = round2(purchaseTotal + transactionTotals(tx).taxable);
      if (tx.type === "debit-note") purchaseTotal = round2(purchaseTotal - transactionTotals(tx).taxable);
      if (tx.type === "receipt") receiptTotal = round2(receiptTotal + parseAmount(tx.amount));
      if (tx.type === "payment") paymentTotal = round2(paymentTotal + parseAmount(tx.amount));
    });

    $("#todaySalesTotal").textContent = money(salesTotal);
    $("#todayPurchaseTotal").textContent = money(purchaseTotal);
    $("#todayReceiptTotal").textContent = money(receiptTotal);
    $("#todayPaymentTotal").textContent = money(paymentTotal);
    $("#todayEntryTitle").textContent = "Today Entry Register - " + formatDate(currentDate);
    $("#todayEntryCount").textContent = rows.length + (rows.length === 1 ? " entry" : " entries");

    $("#todayEntryTable").innerHTML = rows.length ? rows.map((tx) => {
      const isItemBasedVoucher = isItemVoucher(tx.type);
      const totals = isItemBasedVoucher ? transactionTotals(tx) : { taxable: 0, gstTotal: 0, total: parseAmount(tx.amount) };
      const party = transactionPartyName(tx);
      const description = tx.description || tx.narration || "-";

      return `
        <tr>
          <td>${transactionLabel(tx.type)}</td>
          <td>${formatDate(tx.date)}</td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(party)}</td>
          <td>${escapeHtml(description)}</td>
          <td class="num">${totals.taxable ? money(totals.taxable) : "-"}</td>
          <td class="num">${totals.gstTotal ? money(totals.gstTotal) : "-"}</td>
          <td class="num">${money(totals.total)}</td>
          <td>${actionButtons("tx", tx.id, true)}</td>
        </tr>
      `;
    }).join("") : emptyRow(9, "Aaj ki koi entry saved nahi hai.");
  }

  function transactionPartyName(tx) {
    if (!tx) return "-";
    if (tx.type === "contra") return ledgerName(tx.fromLedgerId) + " to " + ledgerName(tx.toLedgerId);
    if (tx.type === "journal") return ledgerName(tx.debitLedgerId) + " / " + ledgerName(tx.creditLedgerId);
    if (tx.partyLedgerId) return ledgerName(tx.partyLedgerId);
    if (tx.accountLedgerId) return ledgerName(tx.accountLedgerId);
    return "-";
  }

  function transactionDescription(tx) {
    return tx.description || tx.narration || "-";
  }

  function transactionSearchText(tx) {
    const itemText = itemsFromTransaction(tx)
      .map((item) => [item.name, item.hsn, item.unit, item.quantity, item.rate, item.gstRate].join(" "))
      .join(" ");
    return [
      tx.date,
      formatDate(tx.date),
      transactionLabel(tx.type),
      tx.voucherNo,
      tx.referenceNo,
      transactionPartyName(tx),
      ledgerName(tx.accountLedgerId),
      ledgerName(tx.salesLedgerId),
      ledgerName(tx.purchaseLedgerId),
      ledgerName(tx.gstLedgerId),
      ledgerName(tx.fromLedgerId),
      ledgerName(tx.toLedgerId),
      ledgerName(tx.debitLedgerId),
      ledgerName(tx.creditLedgerId),
      transactionDescription(tx),
      money(transactionAmount(tx)),
      String(transactionAmount(tx)),
      itemText
    ].join(" ").toLowerCase();
  }

  function allEntryRows() {
    const query = ($("#allEntrySearch") ? $("#allEntrySearch").value : "").trim().toLowerCase();
    return [...state.transactions]
      .filter((tx) => !query || transactionSearchText(tx).includes(query))
      .sort(sortByDateDesc);
  }

  function allEntryActionButtons(id) {
    return `
      <div class="actions">
        <button class="table-btn" type="button" data-action="preview-tx" data-id="${id}">View</button>
        <button class="table-btn" type="button" data-action="print-tx" data-id="${id}">Print</button>
        <button class="table-btn" type="button" data-action="edit-tx" data-id="${id}">Edit</button>
      </div>
    `;
  }

  function previewField(label, value) {
    return `
      <div class="entry-preview-item">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value || "-")}</strong>
      </div>
    `;
  }

  function customEntryPreviewRows(screen, values) {
    return customFieldsFor(screen)
      .map((field) => {
        const value = customValueDisplay(field, values || {});
        if (!value) return "";
        return `<tr><th>${escapeHtml(field.label)}</th><td>${escapeHtml(value)}</td></tr>`;
      })
      .join("");
  }

  function entryPreviewHtml(tx) {
    const amount = transactionAmount(tx);
    const common = `
      <div class="entry-preview-grid">
        ${previewField("Date", formatDate(tx.date))}
        ${previewField("Type", transactionLabel(tx.type))}
        ${previewField("Voucher", tx.voucherNo)}
        ${previewField("Reference", tx.referenceNo || "-")}
        ${previewField("Party / Ledger", transactionPartyName(tx))}
        ${previewField("Amount", money(amount))}
        ${previewField("Description", transactionDescription(tx))}
      </div>
    `;

    const customRows = customEntryPreviewRows(tx.type, tx.customFields || {});
    const customTable = customRows ? `
      <h5>Custom Details</h5>
      <div class="table-wrap compact-table">
        <table>
          <tbody>${customRows}</tbody>
        </table>
      </div>
    ` : "";

    if (isItemVoucher(tx.type)) {
      const isInterstate = isInterstateTransaction(tx, state);
      const totals = transactionTotals(tx);
      const rows = calculateItems(itemsFromTransaction(tx), isInterstate).rows;
      return `
        ${common}
        <h5>Item Details</h5>
        <div class="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>HSN/SAC</th>
                <th class="num">Qty</th>
                <th>Unit</th>
                <th class="num">Rate</th>
                <th class="num">GST %</th>
                <th class="num">Taxable</th>
                <th class="num">CGST</th>
                <th class="num">SGST</th>
                <th class="num">IGST</th>
                <th class="num">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((item) => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td>${escapeHtml(item.hsn || "-")}</td>
                  <td class="num">${moneyFormat.format(item.quantity)}</td>
                  <td>${escapeHtml(item.unit)}</td>
                  <td class="num">${money(item.rate)}</td>
                  <td class="num">${moneyFormat.format(item.gstRate)}%</td>
                  <td class="num">${money(item.taxable)}</td>
                  <td class="num">${money(item.cgst)}</td>
                  <td class="num">${money(item.sgst)}</td>
                  <td class="num">${money(item.igst)}</td>
                  <td class="num">${money(item.total)}</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr>
                <th colspan="6">Total</th>
                <th class="num">${money(totals.taxable)}</th>
                <th class="num">${money(totals.cgst)}</th>
                <th class="num">${money(totals.sgst)}</th>
                <th class="num">${money(totals.igst)}</th>
                <th class="num">${money(totals.total)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
        ${customTable}
      `;
    }

    if (tx.type === "journal") {
      return `
        ${common}
        <h5>Journal Details</h5>
        <div class="table-wrap compact-table">
          <table>
            <tbody>
              <tr><th>Debit Ledger</th><td>${escapeHtml(ledgerName(tx.debitLedgerId))}</td><td class="num">${money(tx.amount)}</td></tr>
              <tr><th>Credit Ledger</th><td>${escapeHtml(ledgerName(tx.creditLedgerId))}</td><td class="num">${money(tx.amount)}</td></tr>
              <tr><th>Narration</th><td colspan="2">${escapeHtml(tx.narration || "-")}</td></tr>
            </tbody>
          </table>
        </div>
        ${customTable}
      `;
    }

    if (tx.type === "contra") {
      return `
        ${common}
        <h5>Contra Details</h5>
        <div class="table-wrap compact-table">
          <table>
            <tbody>
              <tr><th>Transfer From</th><td>${escapeHtml(ledgerName(tx.fromLedgerId))}</td><td class="num">Cr ${money(tx.amount)}</td></tr>
              <tr><th>Transfer To</th><td>${escapeHtml(ledgerName(tx.toLedgerId))}</td><td class="num">Dr ${money(tx.amount)}</td></tr>
              <tr><th>Narration</th><td colspan="2">${escapeHtml(tx.narration || "-")}</td></tr>
            </tbody>
          </table>
        </div>
        ${customTable}
      `;
    }

    const accountLabel = tx.type === "payment" ? "Paid From" : "Received In";
    const partyLabel = tx.type === "payment" ? "Payee Ledger" : "From Ledger";
    return `
      ${common}
      <h5>Voucher Details</h5>
      <div class="table-wrap compact-table">
        <table>
          <tbody>
            <tr><th>${accountLabel}</th><td>${escapeHtml(ledgerName(tx.accountLedgerId))}</td></tr>
            <tr><th>${partyLabel}</th><td>${escapeHtml(ledgerName(tx.partyLedgerId))}</td></tr>
            <tr><th>Narration</th><td>${escapeHtml(tx.narration || "-")}</td></tr>
            <tr><th>Amount</th><td class="num"><strong>${money(tx.amount)}</strong></td></tr>
          </tbody>
        </table>
      </div>
      ${customTable}
    `;
  }

  function renderAllEntryPreview(tx) {
    const printButton = $("#allEntryPrintBtn");
    const editButton = $("#allEntryEditBtn");
    if (!tx) {
      $("#allEntryPreviewTitle").textContent = "Entry Preview";
      $("#allEntryPreview").innerHTML = `<p class="muted">Select an entry from the register to preview it.</p>`;
      printButton.disabled = true;
      editButton.disabled = true;
      printButton.dataset.id = "";
      editButton.dataset.id = "";
      return;
    }

    selectedAllEntryId = tx.id;
    $("#allEntryPreviewTitle").textContent = transactionLabel(tx.type) + " - " + tx.voucherNo;
    $("#allEntryPreview").innerHTML = entryPreviewHtml(tx);
    printButton.disabled = false;
    editButton.disabled = false;
    printButton.dataset.id = tx.id;
    editButton.dataset.id = tx.id;
  }

  function previewAllEntry(id) {
    const tx = state.transactions.find((item) => item.id === id);
    renderAllEntryPreview(tx || null);
    renderAllEntries();
  }

  function focusAllEntryRow(id) {
    const row = $(`#allEntryTable .entry-row[data-id="${id}"]`);
    focusAndSelect(row);
  }

  function renderAllEntries() {
    if (!$("#allEntryTable")) return;
    const rows = allEntryRows();
    if (!selectedAllEntryId || !rows.some((tx) => tx.id === selectedAllEntryId)) {
      selectedAllEntryId = rows[0] ? rows[0].id : null;
    }

    $("#allEntryCount").textContent = rows.length + (rows.length === 1 ? " entry" : " entries");
    $("#allEntryTable").innerHTML = rows.length ? rows.map((tx) => {
      const amount = transactionAmount(tx);
      const active = tx.id === selectedAllEntryId ? " active" : "";
      return `
        <tr class="entry-row${active}" tabindex="0" data-action="preview-tx" data-id="${tx.id}">
          <td>${formatDate(tx.date)}</td>
          <td>${transactionLabel(tx.type)}</td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(transactionPartyName(tx))}</td>
          <td>${escapeHtml(transactionDescription(tx))}</td>
          <td class="num">${money(amount)}</td>
          <td>${allEntryActionButtons(tx.id)}</td>
        </tr>
      `;
    }).join("") : emptyRow(7, "No entries found.");

    const selected = selectedAllEntryId ? state.transactions.find((tx) => tx.id === selectedAllEntryId) : null;
    renderAllEntryPreview(selected || null);
  }

  function invoiceRows() {
    const query = ($("#invoiceSearch") ? $("#invoiceSearch").value : "").trim().toLowerCase();
    return [...state.transactions]
      .filter((tx) => tx.type === "sales" || tx.type === "credit-note")
      .filter((tx) => !query || transactionSearchText(tx).includes(query))
      .sort(sortByDateDesc);
  }

  function invoicePreviewHtml(tx) {
    const company = state.company || {};
    const party = ledgerById(state, tx.partyLedgerId) || {};
    const isInterstate = isInterstateTransaction(tx, state);
    const totals = transactionTotals(tx);
    const rows = calculateItems(itemsFromTransaction(tx), isInterstate).rows;
    const partyState = tx.partyState || party.state || "-";
    const title = tx.type === "credit-note" ? "Credit Note" : "Tax Invoice";

    return `
      <div class="invoice-paper-head">
        <div>
          <h3>${escapeHtml(company.name || "Speed Accounting")}</h3>
          <p>${escapeHtml(company.address || "")}</p>
          <p>State: ${escapeHtml(company.state || "-")} | GSTIN: ${escapeHtml(company.gstin || "-")}</p>
        </div>
        <div class="invoice-paper-meta">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(tx.voucherNo)}</span>
          <span>${formatDate(tx.date)}</span>
        </div>
      </div>

      <div class="invoice-paper-title">${escapeHtml(title).toUpperCase()}</div>

      <div class="invoice-paper-parties">
        <div>
          <strong>Customer Details</strong>
          <span>${escapeHtml(party.name || "Customer")}</span>
          <span>${escapeHtml(tx.partyAddress || party.address || "")}</span>
          <span>State: ${escapeHtml(partyState)} | GSTIN: ${escapeHtml(party.gstin || "-")}</span>
        </div>
        <div>
          <strong>Invoice Details</strong>
          <span>Invoice No: ${escapeHtml(tx.voucherNo)}</span>
          <span>Date: ${formatDate(tx.date)}</span>
          <span>GST Mode: ${isInterstate ? "IGST" : "CGST + SGST"}</span>
        </div>
      </div>

      <div class="invoice-paper-table-wrap">
        <table class="invoice-paper-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>HSN</th>
              <th class="num">Qty</th>
              <th>Unit</th>
              <th class="num">Rate</th>
              <th class="num">GST%</th>
              <th class="num">Taxable</th>
              <th class="num">CGST</th>
              <th class="num">SGST</th>
              <th class="num">IGST</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((item) => `
              <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.hsn || "-")}</td>
                <td class="num">${moneyFormat.format(item.quantity)}</td>
                <td>${escapeHtml(item.unit || "Nos")}</td>
                <td class="num">${money(item.rate)}</td>
                <td class="num">${moneyFormat.format(item.gstRate)}%</td>
                <td class="num">${money(item.taxable)}</td>
                <td class="num">${money(item.cgst)}</td>
                <td class="num">${money(item.sgst)}</td>
                <td class="num">${money(item.igst)}</td>
                <td class="num">${money(item.total)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="invoice-paper-bottom">
        <div>
          <strong>Amount in words:</strong>
          <p>${escapeHtml(amountInWords(totals.total))}</p>
        </div>
        <div class="invoice-paper-totals">
          <div><span>Taxable</span><strong>${money(totals.taxable)}</strong></div>
          <div><span>CGST</span><strong>${money(totals.cgst)}</strong></div>
          <div><span>SGST</span><strong>${money(totals.sgst)}</strong></div>
          <div><span>IGST</span><strong>${money(totals.igst)}</strong></div>
          <div><span>Grand Total</span><strong>${money(totals.total)}</strong></div>
        </div>
      </div>

      <div class="invoice-paper-sign">
        <span>Customer Signature</span>
        <span>Authorised Signatory</span>
      </div>
    `;
  }

  function renderInvoicePreview(tx) {
    const printButton = $("#invoicePrintBtn");
    const previewPrintButton = $("#invoicePreviewPrintBtn");
    const editButton = $("#invoiceEditBtn");
    if (!tx) {
      $("#invoicePreviewTitle").textContent = "Invoice Preview";
      $("#invoicePreview").innerHTML = `<p class="muted">Select an invoice from the register to preview it.</p>`;
      [printButton, previewPrintButton, editButton].forEach((button) => {
        button.disabled = true;
        button.dataset.id = "";
      });
      return;
    }

    selectedInvoiceId = tx.id;
    $("#invoicePreviewTitle").textContent = tx.voucherNo + " - " + transactionPartyName(tx);
    $("#invoicePreview").innerHTML = invoicePreviewHtml(tx);
    [printButton, previewPrintButton, editButton].forEach((button) => {
      button.disabled = false;
      button.dataset.id = tx.id;
    });
  }

  function previewInvoice(id) {
    const tx = state.transactions.find((item) => item.id === id);
    renderInvoicePreview(tx || null);
    renderInvoices();
  }

  function focusInvoiceRow(id) {
    const row = $(`#invoiceTable .invoice-row[data-id="${id}"]`);
    focusAndSelect(row);
  }

  function renderInvoices() {
    if (!$("#invoiceTable")) return;
    const rows = invoiceRows();
    if (!selectedInvoiceId || !rows.some((tx) => tx.id === selectedInvoiceId)) {
      selectedInvoiceId = rows[0] ? rows[0].id : null;
    }

    $("#invoiceCount").textContent = rows.length + (rows.length === 1 ? " invoice" : " invoices");
    $("#invoiceTable").innerHTML = rows.length ? rows.map((tx) => {
      const active = tx.id === selectedInvoiceId ? " active" : "";
      const totals = transactionTotals(tx);
      return `
        <tr class="invoice-row${active}" tabindex="0" data-action="preview-invoice" data-id="${tx.id}">
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${formatDate(tx.date)}</td>
          <td>${escapeHtml(transactionPartyName(tx))}</td>
          <td class="num">${money(totals.total)}</td>
        </tr>
      `;
    }).join("") : emptyRow(4, "No saved sales invoices found.");

    const selected = selectedInvoiceId ? state.transactions.find((tx) => tx.id === selectedInvoiceId) : null;
    renderInvoicePreview(selected || null);
  }

  function transactionAmount(tx) {
    if (isItemVoucher(tx.type)) {
      return transactionTotals(tx).total;
    }
    return parseAmount(tx.amount);
  }

  function balanceText(balance) {
    if (round2(balance) === 0) return money(0);
    return money(Math.abs(balance)) + " " + (balance >= 0 ? "Dr" : "Cr");
  }

  function outstandingSplit(balance) {
    const rounded = round2(balance);
    return {
      receivable: rounded > 0 ? rounded : 0,
      payable: rounded < 0 ? Math.abs(rounded) : 0
    };
  }

  function setOutstandingValue(id, value, balanceClass) {
    const element = $(id);
    if (!element) return;
    element.textContent = value;
    const tile = element.closest("span");
    if (!tile) return;
    tile.classList.remove("is-receivable", "is-payable");
    if (balanceClass) tile.classList.add(balanceClass);
  }

  function setPartyBalanceHint(prefix, balance, afterBalance) {
    const hint = $("#" + prefix + "PartyHint");
    if (!hint) return;
    hint.classList.remove("is-receivable", "is-payable");
    if (!$("#" + prefix + "Party").value) {
      hint.textContent = "";
      return;
    }
    if (balance > 0) {
      hint.textContent = "Lena hai: " + money(balance) + " | Entry ke baad: " + balanceText(afterBalance);
      hint.classList.add("is-receivable");
      return;
    }
    if (balance < 0) {
      hint.textContent = "Dena hai: " + money(Math.abs(balance)) + " | Entry ke baad: " + balanceText(afterBalance);
      hint.classList.add("is-payable");
      return;
    }
    hint.textContent = "No balance | Entry ke baad: " + balanceText(afterBalance);
  }

  function adjustmentLabel(type) {
    return type === "receipt" ? "invoice" : "purchase";
  }

  function populateAdjustmentSelect(type, rows, currentValue) {
    const prefix = type === "receipt" ? "receipt" : "payment";
    const select = $("#" + prefix + "AdjustVoucher");
    if (!select) return;
    const current = currentValue ?? select.value;
    select.innerHTML = `<option value="">Auto / No specific ${adjustmentLabel(type)}</option>` + rows.map((row) => {
      return `<option value="${escapeHtml(row.id)}">${escapeHtml(row.voucherNo)} | ${formatDate(row.date)} | Pending ${money(row.pending)}</option>`;
    }).join("");
    if (current && rows.some((row) => row.id === current)) select.value = current;
  }

  function renderPartyOpenList(type, rows) {
    const prefix = type === "receipt" ? "receipt" : "payment";
    const list = $("#" + prefix + "OpenList");
    if (!list) return;
    const label = type === "receipt" ? "receivable invoice" : "payable purchase";
    const pendingTotal = rows.reduce((sum, row) => round2(sum + row.pending), 0);
    list.innerHTML = rows.length ? rows.slice(0, 8).map((row) => `
      <button class="party-open-card" type="button" data-action="select-open-voucher" data-type="${prefix}" data-id="${escapeHtml(row.id)}" data-amount="${row.pending}">
        <strong>${escapeHtml(row.voucherNo)} - ${money(row.pending)}</strong>
        <small>${formatDate(row.date)} | Age ${moneyFormat.format(daysOld(row.date, today()))} days</small>
        <span>${escapeHtml(row.description || "-")}</span>
        <em>Enter dabao: ${label} adjust hoga</em>
      </button>
    `).join("") + `
      <div class="party-open-total">
        <strong>Total pending: ${money(pendingTotal)}</strong>
        <small>${rows.length} open ${rows.length === 1 ? "voucher" : "vouchers"} party ke against</small>
      </div>
    ` : "";
  }

  function applyOpenVoucherToSettlement(type, voucherId, amount) {
    const prefix = type === "receipt" ? "receipt" : "payment";
    const tx = state.transactions.find((item) => item.id === voucherId);
    if (!tx) return;
    const amountValue = parseAmount(amount) || transactionTotals(tx).total;
    $("#" + prefix + "AdjustVoucher").value = voucherId;
    $("#" + prefix + "Amount").value = amountValue;
    $("#" + prefix + "Narration").value = (type === "receipt" ? "Receipt against " : "Payment against ") + tx.voucherNo;
    updateSettlementOutstanding(type);
    focusAndSelect($("#" + prefix + "Amount"));
  }

  function handleAdjustmentSelectChange(type) {
    const prefix = type === "receipt" ? "receipt" : "payment";
    const voucherId = $("#" + prefix + "AdjustVoucher").value;
    if (!voucherId) {
      updateSettlementOutstanding(type);
      return;
    }
    const row = partyOpenVoucherRows(state, $("#" + prefix + "Party").value, prefix, $("#" + prefix + "EditId").value)
      .find((item) => item.id === voucherId);
    applyOpenVoucherToSettlement(type, voucherId, row ? row.pending : 0);
  }

  function updateSettlementOutstanding(type) {
    const prefix = type === "receipt" ? "receipt" : "payment";
    const partySelect = $("#" + prefix + "Party");
    if (!partySelect) return;
    const ledgerId = partySelect.value;
    const editId = $("#" + prefix + "EditId").value;
    const amount = parseAmount($("#" + prefix + "Amount").value);
    const balance = ledgerId ? ledgerBalanceExcludingTransaction(state, ledgerId, editId) : 0;
    const split = outstandingSplit(balance);
    const afterBalance = round2(balance + (prefix === "payment" ? amount : -amount));
    const afterClass = afterBalance > 0 ? "is-receivable" : afterBalance < 0 ? "is-payable" : "";

    setOutstandingValue("#" + prefix + "LedgerBalance", balanceText(balance), balance > 0 ? "is-receivable" : balance < 0 ? "is-payable" : "");
    setOutstandingValue("#" + prefix + "Receivable", money(split.receivable), split.receivable ? "is-receivable" : "");
    setOutstandingValue("#" + prefix + "Payable", money(split.payable), split.payable ? "is-payable" : "");
    setOutstandingValue("#" + prefix + "AfterBalance", balanceText(afterBalance), afterClass);
    setPartyBalanceHint(prefix, balance, afterBalance);
    const openRows = partyOpenVoucherRows(state, ledgerId, prefix, editId);
    populateAdjustmentSelect(prefix, openRows);
    renderPartyOpenList(prefix, openRows);
  }

  function updateSettlementOutstandingAll() {
    updateSettlementOutstanding("payment");
    updateSettlementOutstanding("receipt");
  }

  function outstandingSearchText(row) {
    const ledger = row.ledger;
    return [
      ledger.name,
      ledger.type,
      ledger.groupName,
      ledger.phone,
      ledger.gstin,
      ledger.state,
      ledger.address,
      money(row.receivable),
      money(row.payable),
      balanceText(row.balance)
    ].join(" ").toLowerCase();
  }

  function outstandingRowsForUi() {
    const asOnInput = $("#outstandingAsOn");
    if (asOnInput && !asOnInput.value) asOnInput.value = today();
    const asOn = asOnInput ? asOnInput.value : "";
    const type = $("#outstandingType") ? $("#outstandingType").value : "all";
    const query = ($("#outstandingSearch") ? $("#outstandingSearch").value : "").trim().toLowerCase();
    return partyOutstandingRows(state, asOn)
      .filter((row) => {
        if (type === "receivable" && !row.receivable) return false;
        if (type === "payable" && !row.payable) return false;
        return !query || outstandingSearchText(row).includes(query);
      });
  }

  function outstandingActionButtons(row) {
    return `
      <div class="actions">
        <button class="table-btn" type="button" data-action="outstanding-ledger" data-id="${row.ledger.id}">Ledger</button>
        ${row.receivable ? `<button class="table-btn" type="button" data-action="outstanding-receipt" data-id="${row.ledger.id}" data-amount="${row.receivable}">Receipt</button>` : ""}
        ${row.payable ? `<button class="table-btn" type="button" data-action="outstanding-payment" data-id="${row.ledger.id}" data-amount="${row.payable}">Payment</button>` : ""}
      </div>
    `;
  }

  function outstandingAgingText(row, asOnDate) {
    const settlementType = row.receivable ? "receipt" : "payment";
    const buckets = partyAgingBuckets(state, row.ledger.id, settlementType, asOnDate);
    if (!buckets.count) return "-";
    return `
      <div class="aging-summary">
        <span>0-30: ${money(buckets.current)}</span>
        <span>31-60: ${money(buckets.month)}</span>
        <span>60+: ${money(buckets.old)}</span>
      </div>
    `;
  }

  function renderOutstandingReport() {
    if (!$("#outstandingTable")) return;
    const rows = outstandingRowsForUi();
    const asOn = $("#outstandingAsOn") ? $("#outstandingAsOn").value : "";
    const totals = rows.reduce((sum, row) => {
      sum.receivable = round2(sum.receivable + row.receivable);
      sum.payable = round2(sum.payable + row.payable);
      return sum;
    }, { receivable: 0, payable: 0 });
    const net = round2(totals.receivable - totals.payable);

    $("#outstandingReceivableTotal").textContent = money(totals.receivable);
    $("#outstandingPayableTotal").textContent = money(totals.payable);
    $("#outstandingNetTotal").textContent = balanceText(net);
    $("#outstandingPartyCount").textContent = String(rows.length);
    $("#outstandingCount").textContent = rows.length + (rows.length === 1 ? " party" : " parties");
    $("#outstandingTable").innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.ledger.name)}<small class="cell-note">${escapeHtml(row.ledger.gstin || "GSTIN: -")}</small></td>
        <td>${escapeHtml(ledgerGroupName(row.ledger))}<small class="cell-note">${escapeHtml(row.ledger.type)}</small></td>
        <td>${escapeHtml(row.ledger.phone || "-")}</td>
        <td>${escapeHtml(row.ledger.state || "-")}</td>
        <td class="num">${row.receivable ? money(row.receivable) : "-"}</td>
        <td class="num">${row.payable ? money(row.payable) : "-"}</td>
        <td class="num">${balanceText(row.balance)}</td>
        <td>${outstandingAgingText(row, asOn)}</td>
        <td>${outstandingActionButtons(row)}</td>
      </tr>
    `).join("") : emptyRow(9, "No outstanding balances found.");
  }

  function openSettlementFromOutstanding(type, ledgerId, amount) {
    const ledger = ledgerById(state, ledgerId);
    if (!ledger) return;
    if (type === "receipt") {
      navigateTo("receipt");
      $("#receiptParty").value = ledgerId;
      $("#receiptAmount").value = parseAmount(amount) || "";
      $("#receiptNarration").value = "Receipt against outstanding from " + ledger.name;
      updateSettlementOutstanding("receipt");
      focusAndSelect($("#receiptAmount"));
      return;
    }
    navigateTo("payment");
    $("#paymentParty").value = ledgerId;
    $("#paymentAmount").value = parseAmount(amount) || "";
    $("#paymentNarration").value = "Payment against outstanding to " + ledger.name;
    updateSettlementOutstanding("payment");
    focusAndSelect($("#paymentAmount"));
  }

  function invoiceOutstandingSearchText(row) {
    return [
      row.voucherNo,
      row.date,
      row.description,
      row.party.name,
      row.party.phone,
      row.party.gstin,
      row.party.state,
      row.type,
      money(row.total),
      money(row.paid),
      money(row.pending)
    ].join(" ").toLowerCase();
  }

  function invoiceOutstandingRowsForUi() {
    const asOnInput = $("#invoiceOutstandingAsOn");
    if (asOnInput && !asOnInput.value) asOnInput.value = today();
    const asOn = asOnInput ? asOnInput.value : "";
    const dueDays = parseAmount($("#invoiceOutstandingDueDays") ? $("#invoiceOutstandingDueDays").value : 30);
    const type = $("#invoiceOutstandingType") ? $("#invoiceOutstandingType").value : "all";
    const query = ($("#invoiceOutstandingSearch") ? $("#invoiceOutstandingSearch").value : "").trim().toLowerCase();
    return invoiceOutstandingRows(state, asOn, dueDays)
      .filter((row) => type === "all" || row.type === type)
      .filter((row) => !query || invoiceOutstandingSearchText(row).includes(query));
  }

  function invoiceOutstandingActions(row) {
    const action = row.type === "receivable" ? "invoice-outstanding-receipt" : "invoice-outstanding-payment";
    const label = row.type === "receivable" ? "Receipt" : "Payment";
    return `
      <div class="actions">
        <button class="table-btn" type="button" data-action="${action}" data-id="${escapeHtml(row.id)}" data-party-id="${escapeHtml(row.party.id)}" data-amount="${row.pending}">${label}</button>
        <button class="table-btn" type="button" data-action="edit-tx" data-id="${escapeHtml(row.id)}">Open</button>
      </div>
    `;
  }

  function openSettlementFromInvoiceOutstanding(settlementType, voucherId, partyId, amount) {
    const tx = state.transactions.find((item) => item.id === voucherId);
    if (!tx) return;
    if (settlementType === "receipt") {
      navigateTo("receipt");
      $("#receiptParty").value = partyId || tx.partyLedgerId;
      updateSettlementOutstanding("receipt");
      applyOpenVoucherToSettlement("receipt", voucherId, amount);
      return;
    }
    navigateTo("payment");
    $("#paymentParty").value = partyId || tx.partyLedgerId;
    updateSettlementOutstanding("payment");
    applyOpenVoucherToSettlement("payment", voucherId, amount);
  }

  function renderInvoiceOutstandingReport() {
    if (!$("#invoiceOutstandingTable")) return;
    const rows = invoiceOutstandingRowsForUi();
    const totals = rows.reduce((sum, row) => {
      sum.pending = round2(sum.pending + row.pending);
      sum.paid = round2(sum.paid + row.paid);
      sum.overdue = round2(sum.overdue + row.overdueAmount);
      return sum;
    }, { pending: 0, paid: 0, overdue: 0 });

    $("#invoiceOutstandingPending").textContent = money(totals.pending);
    $("#invoiceOutstandingPaid").textContent = money(totals.paid);
    $("#invoiceOutstandingOverdue").textContent = money(totals.overdue);
    $("#invoiceOutstandingOpenCount").textContent = String(rows.length);
    $("#invoiceOutstandingCount").textContent = rows.length + (rows.length === 1 ? " row" : " rows");
    $("#invoiceOutstandingTable").innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${formatDate(row.date)}</td>
        <td>${row.type === "receivable" ? "Receivable" : "Payable"}</td>
        <td>${escapeHtml(row.voucherNo)}</td>
        <td>${escapeHtml(row.party.name)}<small class="cell-note">${escapeHtml(row.party.phone || row.party.gstin || "-")}</small></td>
        <td>${escapeHtml(row.description || "-")}</td>
        <td class="num">${money(row.total)}</td>
        <td class="num">${money(row.paid)}</td>
        <td class="num">${money(row.pending)}</td>
        <td class="num">${moneyFormat.format(row.age)} days</td>
        <td>${row.overdue ? `<span class="status-pill danger">Overdue</span>` : `<span class="status-pill success">Open</span>`}</td>
        <td>${invoiceOutstandingActions(row)}</td>
      </tr>
    `).join("") : emptyRow(11, "No invoice-wise outstanding found.");
  }

  function dayBookRowsForUi() {
    const type = $("#dayBookType") ? $("#dayBookType").value : "all";
    const query = ($("#dayBookSearch") ? $("#dayBookSearch").value : "").trim().toLowerCase();
    return state.transactions
      .filter((tx) => dateInReportRange(tx.date))
      .filter((tx) => type === "all" || tx.type === type)
      .filter((tx) => !query || transactionSearchText(tx).includes(query))
      .sort(sortByDateDesc)
      .map((tx) => {
        const entries = entriesForTransaction(tx);
        const debit = entries.reduce((sum, entry) => round2(sum + entry.debit), 0);
        const credit = entries.reduce((sum, entry) => round2(sum + entry.credit), 0);
        return {
          tx,
          debit,
          credit,
          value: transactionAmount(tx)
        };
      });
  }

  function renderDayBook() {
    if (!$("#dayBookTable")) return;
    const rows = dayBookRowsForUi();
    const totals = rows.reduce((sum, row) => {
      sum.debit = round2(sum.debit + row.debit);
      sum.credit = round2(sum.credit + row.credit);
      sum.value = round2(sum.value + row.value);
      return sum;
    }, { debit: 0, credit: 0, value: 0 });
    $("#dayBookVoucherCount").textContent = String(rows.length);
    $("#dayBookDebitTotal").textContent = money(totals.debit);
    $("#dayBookCreditTotal").textContent = money(totals.credit);
    $("#dayBookValueTotal").textContent = money(totals.value);
    $("#dayBookCount").textContent = rows.length + (rows.length === 1 ? " voucher" : " vouchers");
    $("#dayBookTable").innerHTML = rows.length ? rows.map((row) => {
      const tx = row.tx;
      return `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${transactionLabel(tx.type)}</td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(transactionPartyName(tx))}</td>
          <td>${escapeHtml(transactionDescription(tx))}</td>
          <td class="num">${row.debit ? money(row.debit) : "-"}</td>
          <td class="num">${row.credit ? money(row.credit) : "-"}</td>
          <td class="num">${money(row.value)}</td>
          <td>${actionButtons("tx", tx.id, true)}</td>
        </tr>
      `;
    }).join("") : emptyRow(9, "No vouchers found in selected period.");
  }

  function cashBankSelectedLedgerId() {
    const select = $("#cashBankLedger");
    if (!select) return "";
    const current = select.value || (ledgersByType(state, ["Cash", "Bank"])[0] || {}).id || "";
    if (current && select.value !== current) select.value = current;
    return current;
  }

  function renderCashBankBook() {
    if (!$("#cashBankTable")) return;
    const ledgerId = cashBankSelectedLedgerId();
    const ledger = ledgerById(state, ledgerId);
    if (!ledger) {
      $("#cashBankTitle").textContent = "Cash/Bank Book";
      $("#cashBankCount").textContent = "0 entries";
      $("#cashBankOpening").textContent = money(0);
      $("#cashBankReceipts").textContent = money(0);
      $("#cashBankPayments").textContent = money(0);
      $("#cashBankClosing").textContent = money(0);
      $("#cashBankTable").innerHTML = emptyRow(8, "No cash or bank ledger selected.");
      return;
    }

    const entries = allEntries(state).filter((entry) => entry.ledgerId === ledgerId).sort(sortByDateAsc);
    const opening = entries
      .filter((entry) => reportDateFrom && entry.date < reportDateFrom)
      .reduce((sum, entry) => round2(sum + entry.debit - entry.credit), 0);
    let running = opening;
    let receipts = 0;
    let payments = 0;
    const rows = entries.filter((entry) => dateInReportRange(entry.date));
    $("#cashBankTitle").textContent = ledger.name + " Book";
    $("#cashBankCount").textContent = rows.length + (rows.length === 1 ? " entry" : " entries");
    $("#cashBankTable").innerHTML = rows.length ? rows.map((entry) => {
      running = round2(running + entry.debit - entry.credit);
      receipts = round2(receipts + entry.debit);
      payments = round2(payments + entry.credit);
      const tx = state.transactions.find((item) => item.id === entry.transactionId);
      return `
        <tr>
          <td>${formatDate(entry.date)}</td>
          <td>${transactionLabel(entry.type)}</td>
          <td>${escapeHtml(entry.voucherNo)}</td>
          <td>${escapeHtml(entry.narration)}</td>
          <td class="num">${entry.debit ? money(entry.debit) : "-"}</td>
          <td class="num">${entry.credit ? money(entry.credit) : "-"}</td>
          <td class="num">${balanceText(running)}</td>
          <td>${tx ? allEntryActionButtons(tx.id) : "-"}</td>
        </tr>
      `;
    }).join("") : emptyRow(8, "No cash or bank entries in selected period.");
    $("#cashBankOpening").textContent = balanceText(opening);
    $("#cashBankReceipts").textContent = money(receipts);
    $("#cashBankPayments").textContent = money(payments);
    $("#cashBankClosing").textContent = balanceText(running);
  }

  function daysBetweenDates(fromDate, toDate) {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate + "T00:00:00");
    const to = new Date(toDate + "T00:00:00");
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
    return Math.max(0, Math.floor((to - from) / 86400000));
  }

  function lastEntryDateForLedger(ledgerId, asOn) {
    const rows = allEntries(stateAsOn(state, asOn))
      .filter((entry) => entry.ledgerId === ledgerId && entry.date !== "0000-00-00")
      .sort(sortByDateAsc);
    return rows.length ? rows[rows.length - 1].date : asOn;
  }

  function ageingRowsForUi() {
    const asOnInput = $("#ageingAsOn");
    if (asOnInput && !asOnInput.value) asOnInput.value = today();
    const asOn = asOnInput ? asOnInput.value : today();
    const type = $("#ageingType") ? $("#ageingType").value : "all";
    return partyOutstandingRows(state, asOn)
      .filter((row) => {
        if (type === "receivable" && !row.receivable) return false;
        if (type === "payable" && !row.payable) return false;
        return true;
      })
      .map((row) => {
        const amount = row.receivable || row.payable;
        const lastDate = lastEntryDateForLedger(row.ledger.id, asOn);
        const days = daysBetweenDates(lastDate, asOn);
        return {
          ...row,
          amount,
          lastDate,
          days,
          bucket30: days <= 30 ? amount : 0,
          bucket60: days > 30 && days <= 60 ? amount : 0,
          bucket90: days > 60 && days <= 90 ? amount : 0,
          bucketOlder: days > 90 ? amount : 0
        };
      });
  }

  function renderAgeingReport() {
    if (!$("#ageingTable")) return;
    const rows = ageingRowsForUi();
    const totals = rows.reduce((sum, row) => {
      sum.bucket30 = round2(sum.bucket30 + row.bucket30);
      sum.bucket60 = round2(sum.bucket60 + row.bucket60);
      sum.bucket90 = round2(sum.bucket90 + row.bucket90);
      sum.bucketOlder = round2(sum.bucketOlder + row.bucketOlder);
      return sum;
    }, { bucket30: 0, bucket60: 0, bucket90: 0, bucketOlder: 0 });
    $("#ageingBucket30").textContent = money(totals.bucket30);
    $("#ageingBucket60").textContent = money(totals.bucket60);
    $("#ageingBucket90").textContent = money(totals.bucket90);
    $("#ageingBucketOlder").textContent = money(totals.bucketOlder);
    $("#ageingCount").textContent = rows.length + (rows.length === 1 ? " party" : " parties");
    $("#ageingTable").innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.ledger.name)}<small class="cell-note">${escapeHtml(row.ledger.phone || "Phone: -")}</small></td>
        <td>${row.receivable ? "Lena Hai" : "Dena Hai"}</td>
        <td>${formatDate(row.lastDate)}</td>
        <td class="num">${row.days}</td>
        <td class="num">${row.bucket30 ? money(row.bucket30) : "-"}</td>
        <td class="num">${row.bucket60 ? money(row.bucket60) : "-"}</td>
        <td class="num">${row.bucket90 ? money(row.bucket90) : "-"}</td>
        <td class="num">${row.bucketOlder ? money(row.bucketOlder) : "-"}</td>
        <td class="num">${balanceText(row.balance)}</td>
        <td>${outstandingActionButtons(row)}</td>
      </tr>
    `).join("") : emptyRow(10, "No ageing balances found.");
  }

  function auditIssue(severity, type, reference, details, action) {
    return {
      severity,
      type,
      reference,
      details,
      action: action || {}
    };
  }

  function transactionReference(tx) {
    return `${transactionLabel(tx.type)} ${tx.voucherNo || tx.id || ""}`.trim();
  }

  function auditIssues(appState) {
    const issues = [];
    const ledgerIds = new Set(appState.ledgers.map((ledger) => ledger.id));
    const stockIds = new Set((appState.stockItems || []).map((item) => item.id));
    const transactionIds = new Set((appState.transactions || []).map((tx) => tx.id));

    const entries = allEntries(appState);
    const totals = entries.reduce((sum, entry) => {
      sum.debit = round2(sum.debit + entry.debit);
      sum.credit = round2(sum.credit + entry.credit);
      return sum;
    }, { debit: 0, credit: 0 });
    const difference = round2(totals.debit - totals.credit);
    if (difference !== 0) {
      issues.push(auditIssue(
        "Critical",
        "Debit/Credit",
        "All Entries",
        `Total debit ${money(totals.debit)} and credit ${money(totals.credit)} mismatch by ${money(Math.abs(difference))}.`
      ));
    }

    (appState.transactions || []).forEach((tx) => {
      const txEntries = entriesForTransaction(tx);
      const debit = txEntries.reduce((sum, entry) => round2(sum + entry.debit), 0);
      const credit = txEntries.reduce((sum, entry) => round2(sum + entry.credit), 0);
      if (txEntries.length && round2(debit - credit) !== 0) {
        issues.push(auditIssue(
          "Critical",
          "Debit/Credit",
          transactionReference(tx),
          `Voucher debit ${money(debit)} and credit ${money(credit)} mismatch.`,
          { transactionId: tx.id }
        ));
      }

      const ledgerFields = [
        ["partyLedgerId", "Party Ledger"],
        ["salesLedgerId", "Sales Ledger"],
        ["purchaseLedgerId", "Purchase Ledger"],
        ["gstLedgerId", "GST Ledger"],
        ["accountLedgerId", "Cash/Bank Ledger"],
        ["fromLedgerId", "From Ledger"],
        ["toLedgerId", "To Ledger"],
        ["debitLedgerId", "Debit Ledger"],
        ["creditLedgerId", "Credit Ledger"]
      ];
      ledgerFields.forEach(([field, label]) => {
        if (tx[field] && !ledgerIds.has(tx[field])) {
          issues.push(auditIssue(
            "Critical",
            "Missing Ledger",
            transactionReference(tx),
            `${label} link is missing: ${tx[field]}.`,
            { transactionId: tx.id }
          ));
        }
      });

      itemsFromTransaction(tx).forEach((item, index) => {
        if (item.stockItemId && !stockIds.has(item.stockItemId)) {
          issues.push(auditIssue(
            "Warning",
            "Missing Stock Item",
            transactionReference(tx),
            `Item row ${index + 1} has missing stock item link: ${item.stockItemId}.`,
            { transactionId: tx.id }
          ));
        }
        if (item.quantity <= 0 && isItemVoucher(tx.type)) {
          issues.push(auditIssue(
            "Warning",
            "GST Mismatch",
            transactionReference(tx),
            `Item row ${index + 1} has invalid quantity ${item.quantity}.`,
            { transactionId: tx.id }
          ));
        }
        if (item.rate < 0 || item.gstRate < 0) {
          issues.push(auditIssue(
            "Warning",
            "GST Mismatch",
            transactionReference(tx),
            `Item row ${index + 1} has negative rate or GST percentage.`,
            { transactionId: tx.id }
          ));
        }
        const computed = calculateItem(item, isInterstateTransaction(tx, appState));
        if (item.taxable !== undefined && round2(item.taxable - computed.taxable) !== 0) {
          issues.push(auditIssue(
            "Warning",
            "GST Mismatch",
            transactionReference(tx),
            `Item row ${index + 1} taxable value does not match quantity x rate.`,
            { transactionId: tx.id }
          ));
        }
      });

      if (isInventoryTransaction(tx.type)) {
        const tax = transactionTotals(tx);
        const gstEntry = txEntries.find((entry) => entry.ledgerId === tx.gstLedgerId);
        const postedGst = gstEntry ? round2(gstEntry.debit + gstEntry.credit) : 0;
        if (tx.gstLedgerId && round2(postedGst - tax.gstTotal) !== 0) {
          issues.push(auditIssue(
            "Warning",
            "GST Mismatch",
            transactionReference(tx),
            `GST posting ${money(postedGst)} does not match calculated GST ${money(tax.gstTotal)}.`,
            { transactionId: tx.id }
          ));
        }
      }
    });

    const voucherMap = new Map();
    (appState.transactions || []).forEach((tx) => {
      const key = `${tx.type}|${String(tx.voucherNo || "").trim().toLowerCase()}`;
      if (!tx.voucherNo) return;
      const bucket = voucherMap.get(key) || [];
      bucket.push(tx);
      voucherMap.set(key, bucket);
    });
    voucherMap.forEach((items) => {
      if (items.length <= 1) return;
      issues.push(auditIssue(
        "Warning",
        "Duplicate Voucher",
        `${transactionLabel(items[0].type)} ${items[0].voucherNo}`,
        `${items.length} vouchers use the same voucher number.`,
        { transactionId: items[0].id }
      ));
    });

    inventoryProductCatalog(appState).forEach((item) => {
      if (round2(item.stock) < 0) {
        issues.push(auditIssue(
          "Critical",
          "Negative Stock",
          item.name,
          `Closing stock is negative: ${moneyFormat.format(item.stock)} ${item.unit || "Nos"}.`,
          { stockItemId: item.stockItemId || "", itemName: item.name }
        ));
      }
    });

    entries.forEach((entry) => {
      if (entry.transactionId && !String(entry.transactionId).startsWith("OPEN") && !transactionIds.has(entry.transactionId)) {
        issues.push(auditIssue(
          "Warning",
          "Debit/Credit",
          entry.voucherNo,
          `Entry points to missing transaction ${entry.transactionId}.`
        ));
      }
      if (entry.ledgerId && !ledgerIds.has(entry.ledgerId) && entry.ledgerId !== OPENING_LEDGER_ID) {
        issues.push(auditIssue(
          "Critical",
          "Missing Ledger",
          entry.voucherNo,
          `Accounting entry points to missing ledger ${entry.ledgerId}.`
        ));
      }
    });

    return issues;
  }

  function auditSearchText(issue) {
    return [issue.severity, issue.type, issue.reference, issue.details].join(" ").toLowerCase();
  }

  function auditRowsForUi() {
    const query = ($("#auditSearch") ? $("#auditSearch").value : "").trim().toLowerCase();
    const type = $("#auditType") ? $("#auditType").value : "all";
    const severity = $("#auditSeverity") ? $("#auditSeverity").value : "all";
    return auditIssues(state).filter((issue) => {
      if (type !== "all" && issue.type !== type) return false;
      if (severity !== "all" && issue.severity !== severity) return false;
      return !query || auditSearchText(issue).includes(query);
    });
  }

  function auditActionButton(issue) {
    if (issue.action && issue.action.transactionId) {
      return `<button class="table-btn" type="button" data-action="audit-open-tx" data-id="${issue.action.transactionId}">Open Voucher</button>`;
    }
    if (issue.action && (issue.action.stockItemId || issue.action.itemName)) {
      return `<button class="table-btn" type="button" data-action="audit-open-stock">Open Stock</button>`;
    }
    return "-";
  }

  function renderAuditCheck() {
    if (!$("#auditTable")) return;
    const allIssues = auditIssues(state);
    const rows = auditRowsForUi();
    const critical = allIssues.filter((issue) => issue.severity === "Critical").length;
    const warning = allIssues.filter((issue) => issue.severity === "Warning").length;
    const actionable = allIssues.filter((issue) => issue.severity !== "Info").length;
    $("#auditIssueTotal").textContent = String(actionable);
    $("#auditCriticalTotal").textContent = String(critical);
    $("#auditWarningTotal").textContent = String(warning);
    $("#auditStatusText").textContent = actionable ? (critical ? "Critical" : "Review") : "OK";
    $("#auditCount").textContent = rows.length + (rows.length === 1 ? " issue" : " issues");
    $("#auditTable").innerHTML = rows.length ? rows.map((issue) => `
      <tr>
        <td><span class="status-pill ${issue.severity === "Critical" ? "danger" : ""}">${escapeHtml(issue.severity)}</span></td>
        <td>${escapeHtml(issue.type)}</td>
        <td>${escapeHtml(issue.reference)}</td>
        <td>${escapeHtml(issue.details)}</td>
        <td>${auditActionButton(issue)}</td>
      </tr>
    `).join("") : emptyRow(5, "No audit issues found.");
  }

  function safeRepairAuditData() {
    if (!window.confirm("Safe repair will normalize saved data, rebuild core ledgers, and refresh IDs. Continue?")) return;
    state = normalizeState(state);
    ensureCoreLedgers(state);
    saveState();
    renderAll();
    navigateTo("audit-check");
    showToast("Safe repair completed. Audit refreshed.");
  }

  function emptyRow(colspan, text) {
    return `<tr class="empty-row"><td colspan="${colspan}">${escapeHtml(text)}</td></tr>`;
  }

  function actionButtons(type, id, canPrint) {
    return `
      <div class="actions">
        <button class="table-btn" type="button" data-action="edit-${type}" data-id="${id}">Edit</button>
        ${type === "ledger" ? `<button class="table-btn" type="button" data-action="report-ledger" data-id="${id}">Report</button>` : ""}
        <button class="table-btn delete" type="button" data-action="delete-${type}" data-id="${id}">Delete</button>
        ${canPrint ? `<button class="table-btn" type="button" data-action="print-tx" data-id="${id}">Print</button>` : ""}
      </div>
    `;
  }

  function renderLedgers() {
    const summaries = ledgerSummaries(state).filter((row) => !row.ledger.isVirtual);
    $("#ledgerCount").textContent = state.ledgers.length + (state.ledgers.length === 1 ? " ledger" : " ledgers");
    $("#ledgerTable").innerHTML = summaries.length ? summaries.map((row) => `
      <tr>
        <td>${escapeHtml(row.ledger.name)}</td>
        <td>${escapeHtml(ledgerGroupName(row.ledger))}<small class="cell-note">${escapeHtml(row.ledger.type)}</small></td>
        <td>${escapeHtml(row.ledger.gstin || "-")}</td>
        <td>${escapeHtml(row.ledger.phone || "-")}</td>
        <td>${escapeHtml(row.ledger.state || "-")}</td>
        <td class="num">${row.ledger.openingBalance ? money(row.ledger.openingBalance) + " " + row.ledger.openingSide : "-"}</td>
        <td class="num">${balanceText(row.balance)}</td>
        <td>${actionButtons("ledger", row.ledger.id, false)}</td>
      </tr>
    `).join("") : emptyRow(8, "No ledgers available.");
  }

  function renderStockItems() {
    if (!$("#stockItemTable")) return;
    $("#stockItemCount").textContent = state.stockItems.length + (state.stockItems.length === 1 ? " item" : " items");
    $("#stockItemTable").innerHTML = state.stockItems.length ? state.stockItems.map((item) => {
      const balance = stockItemBalance(item);
      const minStock = parseAmount(item.minStockLevel);
      const isLow = minStock > 0 && balance < minStock;
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.hsn || "-")}</td>
          <td>${escapeHtml(item.unit || "Nos")}</td>
          <td class="num">${moneyFormat.format(item.gstRate)}%</td>
          <td class="num">${moneyFormat.format(balance)}</td>
          <td class="num">${money(item.purchaseRate || item.openingRate)}</td>
          <td class="num">${money(item.saleRate || 0)}</td>
          <td class="num">${minStock ? moneyFormat.format(minStock) : "-"}</td>
          <td>${isLow ? `<span class="status-pill danger">Low Stock</span>` : `<span class="status-pill">OK</span>`}</td>
          <td class="num">${money(stockItemValue(item))}</td>
          <td>
            <div class="actions">
              <button class="table-btn" type="button" data-action="edit-stock-item" data-id="${item.id}">Edit</button>
              <button class="table-btn delete" type="button" data-action="delete-stock-item" data-id="${item.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join("") : emptyRow(11, "Stock item create karo. Purchase/Sales me wahi item Space se select hoga.");
    renderStockSummary();
    renderLowStockAlerts();
  }

  function stockSummaryRows() {
    const rows = inventoryProductCatalog(state);
    return rows.map((item) => {
      const inward = round2(item.purchaseQty - item.openingQty);
      const outward = round2(item.soldQty);
      const closing = round2(item.purchaseQty - item.soldQty);
      const rate = parseAmount(item.purchaseRate) || parseAmount(item.openingRate) || parseAmount(item.lastPurchaseRate);
      return {
        item,
        inward,
        outward,
        closing,
        minStock: parseAmount(item.minStockLevel),
        rate,
        value: round2(closing * rate)
      };
    });
  }

  function renderStockSummary() {
    if (!$("#stockSummaryTable")) return;
    const rows = stockSummaryRows();
    $("#stockSummaryCount").textContent = rows.length + (rows.length === 1 ? " item" : " items");
    $("#stockSummaryTable").innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.item.name)}</td>
        <td>${escapeHtml(row.item.hsn || "-")}</td>
        <td>${escapeHtml(row.item.unit || "Nos")}</td>
        <td class="num">${moneyFormat.format(row.item.openingQty || 0)}</td>
        <td class="num">${moneyFormat.format(row.inward)}</td>
        <td class="num">${moneyFormat.format(row.outward)}</td>
        <td class="num">${moneyFormat.format(row.closing)}</td>
        <td class="num">${money(row.rate)}</td>
        <td class="num">${row.minStock ? moneyFormat.format(row.minStock) : "-"}</td>
        <td>${row.minStock && row.closing < row.minStock ? `<span class="status-pill danger">Low Stock</span>` : `<span class="status-pill">OK</span>`}</td>
        <td class="num">${money(row.value)}</td>
      </tr>
    `).join("") : emptyRow(11, "No stock summary available.");
  }

  function populateStockLedgerSelect() {
    const select = $("#stockLedgerItem");
    if (!select) return "";
    const current = select.value || (state.stockItems[0] && state.stockItems[0].id) || "";
    select.innerHTML = state.stockItems.length
      ? state.stockItems.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${escapeHtml(item.unit || "Nos")})</option>`).join("")
      : `<option value="">Create stock item first</option>`;
    if (current && state.stockItems.some((item) => item.id === current)) select.value = current;
    return select.value;
  }

  function renderStockLedger() {
    if (!$("#stockLedgerTable")) return;
    const stockItemId = populateStockLedgerSelect();
    const from = $("#stockLedgerFrom") ? $("#stockLedgerFrom").value : reportDateFrom;
    const to = $("#stockLedgerTo") ? $("#stockLedgerTo").value : reportDateTo;
    const report = stockLedgerRows(state, stockItemId, from, to);
    const item = report.item;
    $("#stockLedgerTitle").textContent = item ? item.name + " Stock Ledger" : "Stock Ledger";
    $("#stockLedgerOpening").textContent = moneyFormat.format(report.openingQty);
    $("#stockLedgerInward").textContent = moneyFormat.format(report.inwardQty);
    $("#stockLedgerOutward").textContent = moneyFormat.format(report.outwardQty);
    $("#stockLedgerValue").textContent = money(report.value);
    $("#stockLedgerCount").textContent = report.rows.length + (report.rows.length === 1 ? " entry" : " entries");
    $("#stockLedgerTable").innerHTML = report.rows.length ? report.rows.map((row) => `
      <tr>
        <td>${formatDate(row.date)}</td>
        <td>${escapeHtml(transactionLabel(row.type))}</td>
        <td>${escapeHtml(row.voucherNo)}</td>
        <td>${escapeHtml(ledgerName(row.partyLedgerId))}</td>
        <td>${escapeHtml(row.description || "-")}</td>
        <td class="num">${row.inward ? moneyFormat.format(row.inward) : "-"}</td>
        <td class="num">${row.outward ? moneyFormat.format(row.outward) : "-"}</td>
        <td class="num">${money(row.rate)}</td>
        <td class="num">${moneyFormat.format(row.balanceQty)}</td>
        <td class="num">${money(row.value)}</td>
        <td>${actionButtons("tx", row.tx.id, true)}</td>
      </tr>
    `).join("") : emptyRow(11, item ? "No stock movement for selected period." : "Create stock item first.");
  }

  function lowStockRows() {
    return stockSummaryRows()
      .filter((row) => row.minStock > 0 && row.closing < row.minStock)
      .map((row) => ({
        ...row,
        shortage: round2(row.minStock - row.closing)
      }));
  }

  function renderLowStockAlerts() {
    if (!$("#lowStockTable")) return;
    const rows = lowStockRows();
    $("#lowStockCount").textContent = rows.length + (rows.length === 1 ? " alert" : " alerts");
    $("#lowStockTable").innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.item.name)}<small class="cell-note">${escapeHtml(row.item.hsn || "HSN: -")}</small></td>
        <td>${escapeHtml(row.item.unit || "Nos")}</td>
        <td class="num">${moneyFormat.format(row.closing)}</td>
        <td class="num">${moneyFormat.format(row.minStock)}</td>
        <td class="num">${moneyFormat.format(row.shortage)}</td>
      </tr>
    `).join("") : emptyRow(5, "No low stock alerts.");
  }

  function renderItemProfitReport() {
    if (!$("#itemProfitTable")) return;
    const rows = itemProfitRows(state, reportDateFrom, reportDateTo);
    const totals = rows.reduce((sum, row) => {
      sum.sales = round2(sum.sales + row.salesValue);
      sum.cost = round2(sum.cost + row.costValue);
      sum.profit = round2(sum.profit + row.profit);
      return sum;
    }, { sales: 0, cost: 0, profit: 0 });
    const margin = totals.sales ? round2(totals.profit / totals.sales * 100) : 0;
    $("#itemProfitSalesTotal").textContent = money(totals.sales);
    $("#itemProfitCostTotal").textContent = money(totals.cost);
    $("#itemProfitTotal").textContent = money(totals.profit);
    $("#itemProfitMargin").textContent = moneyFormat.format(margin) + "%";
    $("#itemProfitCount").textContent = rows.length + (rows.length === 1 ? " item" : " items");
    $("#itemProfitTable").innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.hsn || "-")}</td>
        <td>${escapeHtml(row.unit || "Nos")}</td>
        <td class="num">${moneyFormat.format(row.quantity)}</td>
        <td class="num">${money(row.salesValue)}</td>
        <td class="num">${money(row.costRate)}</td>
        <td class="num">${money(row.costValue)}</td>
        <td class="num">${money(row.profit)}</td>
        <td class="num">${moneyFormat.format(row.margin)}%</td>
      </tr>
    `).join("") : emptyRow(9, "No item profit data in selected period.");
  }

  function renderSales() {
    const config = salesModeConfig(salesVoucherMode) || salesModeConfig("sales");
    populateRegisterPartyFilter("sales");
    const rows = registerFilteredRows("sales");
    const totals = registerTotals(rows);
    const registerTitle = $("#sales .panel-header h4");
    if (registerTitle) registerTitle.textContent = config.register;
    $("#salesCount").textContent = rows.length + " " + (rows.length === 1 ? config.countSingular : config.countPlural);
    renderRegisterSummary("sales", totals);
    $("#salesTable").innerHTML = rows.length ? rows.map((tx) => {
      const tax = transactionTotals(tx);
      return `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(ledgerName(tx.partyLedgerId))}</td>
          <td>${escapeHtml(tx.description)}</td>
          <td class="num">${money(tax.taxable)}</td>
          <td class="num">${money(tax.gstTotal)}</td>
          <td class="num">${money(tax.total)}</td>
          <td>${actionButtons("tx", tx.id, true)}</td>
        </tr>
      `;
    }).join("") : emptyRow(8, config.emptyText);
  }

  function renderPurchase() {
    const config = purchaseModeConfig(purchaseVoucherMode) || purchaseModeConfig("purchase");
    populateRegisterPartyFilter("purchase");
    const rows = registerFilteredRows("purchase");
    const totals = registerTotals(rows);
    const registerTitle = $("#purchase .panel-header h4");
    if (registerTitle) registerTitle.textContent = config.register;
    $("#purchaseCount").textContent = rows.length + " " + (rows.length === 1 ? config.countSingular : config.countPlural);
    renderRegisterSummary("purchase", totals);
    $("#purchaseTable").innerHTML = rows.length ? rows.map((tx) => {
      const tax = transactionTotals(tx);
      return `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(ledgerName(tx.partyLedgerId))}</td>
          <td>${escapeHtml(tx.description)}</td>
          <td class="num">${money(tax.taxable)}</td>
          <td class="num">${money(tax.gstTotal)}</td>
          <td class="num">${money(tax.total)}</td>
          <td>${actionButtons("tx", tx.id, true)}</td>
        </tr>
      `;
    }).join("") : emptyRow(8, config.emptyText);
  }

  function renderPayment() {
    const rows = state.transactions.filter((tx) => tx.type === "payment").sort(sortByDateDesc);
    $("#paymentCount").textContent = rows.length + (rows.length === 1 ? " voucher" : " vouchers");
    $("#paymentTable").innerHTML = rows.length ? rows.map((tx) => `
      <tr>
        <td>${formatDate(tx.date)}</td>
        <td>${escapeHtml(tx.voucherNo)}</td>
        <td>${escapeHtml(ledgerName(tx.accountLedgerId))}</td>
        <td>${escapeHtml(ledgerName(tx.partyLedgerId))}</td>
        <td>${escapeHtml(tx.narration)}</td>
        <td class="num">${money(tx.amount)}</td>
        <td>${actionButtons("tx", tx.id, true)}</td>
      </tr>
    `).join("") : emptyRow(7, "No payment vouchers available.");
  }

  function renderContra() {
    const rows = state.transactions.filter((tx) => tx.type === "contra").sort(sortByDateDesc);
    $("#contraCount").textContent = rows.length + (rows.length === 1 ? " voucher" : " vouchers");
    $("#contraTable").innerHTML = rows.length ? rows.map((tx) => `
      <tr>
        <td>${formatDate(tx.date)}</td>
        <td>${escapeHtml(tx.voucherNo)}</td>
        <td>${escapeHtml(ledgerName(tx.fromLedgerId))}</td>
        <td>${escapeHtml(ledgerName(tx.toLedgerId))}</td>
        <td>${escapeHtml(tx.narration)}</td>
        <td class="num">${money(tx.amount)}</td>
        <td>${actionButtons("tx", tx.id, true)}</td>
      </tr>
    `).join("") : emptyRow(7, "No contra vouchers available.");
  }

  function renderReceipt() {
    const rows = state.transactions.filter((tx) => tx.type === "receipt").sort(sortByDateDesc);
    $("#receiptCount").textContent = rows.length + (rows.length === 1 ? " voucher" : " vouchers");
    $("#receiptTable").innerHTML = rows.length ? rows.map((tx) => `
      <tr>
        <td>${formatDate(tx.date)}</td>
        <td>${escapeHtml(tx.voucherNo)}</td>
        <td>${escapeHtml(ledgerName(tx.accountLedgerId))}</td>
        <td>${escapeHtml(ledgerName(tx.partyLedgerId))}</td>
        <td>${escapeHtml(tx.narration)}</td>
        <td class="num">${money(tx.amount)}</td>
        <td>${actionButtons("tx", tx.id, true)}</td>
      </tr>
    `).join("") : emptyRow(7, "No receipt vouchers available.");
  }

  function renderJournal() {
    const rows = state.transactions.filter((tx) => tx.type === "journal").sort(sortByDateDesc);
    $("#journalCount").textContent = rows.length + (rows.length === 1 ? " voucher" : " vouchers");
    $("#journalTable").innerHTML = rows.length ? rows.map((tx) => `
      <tr>
        <td>${formatDate(tx.date)}</td>
        <td>${escapeHtml(tx.voucherNo)}</td>
        <td>${escapeHtml(ledgerName(tx.debitLedgerId))}</td>
        <td>${escapeHtml(ledgerName(tx.creditLedgerId))}</td>
        <td>${escapeHtml(tx.narration)}</td>
        <td class="num">${money(tx.amount)}</td>
        <td>${actionButtons("tx", tx.id, true)}</td>
      </tr>
    `).join("") : emptyRow(7, "No journal vouchers available.");
  }

  function sortByDateDesc(a, b) {
    const dateSort = String(b.date).localeCompare(String(a.date));
    if (dateSort !== 0) return dateSort;
    return String(b.voucherNo).localeCompare(String(a.voucherNo));
  }

  function dateInReportRange(date) {
    if (!date || date === "0000-00-00") return !reportDateFrom;
    if (reportDateFrom && date < reportDateFrom) return false;
    if (reportDateTo && date > reportDateTo) return false;
    return true;
  }

  function reportTransactions(types) {
    const wanted = types ? (Array.isArray(types) ? types : [types]) : null;
    return state.transactions
      .filter((tx) => (!wanted || wanted.includes(tx.type)) && dateInReportRange(tx.date));
  }

  function reportState() {
    return {
      ...state,
      transactions: reportTransactions()
    };
  }

  function syncReportDateControls() {
    $$(".report-date-from").forEach((input) => {
      input.value = reportDateFrom;
    });
    $$(".report-date-to").forEach((input) => {
      input.value = reportDateTo;
    });
  }

  function updateReportPeriod(from, to) {
    reportDateFrom = from || "";
    reportDateTo = to || "";
    if (reportDateFrom && reportDateTo && reportDateFrom > reportDateTo) {
      const swap = reportDateFrom;
      reportDateFrom = reportDateTo;
      reportDateTo = swap;
    }
    syncReportDateControls();
    renderReports();
  }

  function renderLedgerReport() {
    const select = $("#ledgerReportSelect");
    const ledgerId = select.value || (state.ledgers[0] && state.ledgers[0].id);
    if (ledgerId && select.value !== ledgerId) select.value = ledgerId;
    const ledger = ledgerById(state, ledgerId);
    if (!ledger) {
      $("#ledgerReportTitle").textContent = "Ledger Report";
      $("#ledgerReportBalance").textContent = money(0);
      $("#ledgerReportTable").innerHTML = emptyRow(7, "No ledger selected.");
      return;
    }

    let running = 0;
    const entries = allEntries(reportState()).filter((entry) => entry.ledgerId === ledgerId && dateInReportRange(entry.date));
    $("#ledgerReportTitle").textContent = ledger.name + " Ledger";
    $("#ledgerReportTable").innerHTML = entries.length ? entries.map((entry) => {
      running = round2(running + entry.debit - entry.credit);
      return `
        <tr>
          <td>${formatDate(entry.date)}</td>
          <td>${transactionLabel(entry.type)}</td>
          <td>${escapeHtml(entry.voucherNo)}</td>
          <td>${escapeHtml(entry.narration)}</td>
          <td class="num">${entry.debit ? money(entry.debit) : "-"}</td>
          <td class="num">${entry.credit ? money(entry.credit) : "-"}</td>
          <td class="num">${balanceText(running)}</td>
        </tr>
      `;
    }).join("") : emptyRow(7, "This ledger has no entries.");

    $("#ledgerReportBalance").textContent = "Closing: " + balanceText(running);
  }

  function renderTrialBalance() {
    const rows = ledgerSummaries(reportState()).filter((row) => row.debit || row.credit || row.balance);
    let debitTotal = 0;
    let creditTotal = 0;
    $("#trialTable").innerHTML = rows.length ? rows.map((row) => {
      const debit = row.balance > 0 ? row.balance : 0;
      const credit = row.balance < 0 ? Math.abs(row.balance) : 0;
      debitTotal = round2(debitTotal + debit);
      creditTotal = round2(creditTotal + credit);
      return `
        <tr>
          <td>${escapeHtml(row.ledger.name)}</td>
          <td>${escapeHtml(row.ledger.type)}</td>
          <td class="num">${debit ? money(debit) : "-"}</td>
          <td class="num">${credit ? money(credit) : "-"}</td>
        </tr>
      `;
    }).join("") : emptyRow(4, "No balances available.");
    $("#trialDebitTotal").textContent = money(debitTotal);
    $("#trialCreditTotal").textContent = money(creditTotal);
  }

  function renderProfitLoss() {
    const pnl = profitLoss(reportState());
    $("#pnlIncomeTable").innerHTML = pnl.incomeRows.length ? pnl.incomeRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${money(row.amount)}</td>
      </tr>
    `).join("") + `
      <tr>
        <th>Total Income</th>
        <th class="num">${money(pnl.incomeTotal)}</th>
      </tr>
    ` : emptyRow(2, "No income entries.");

    $("#pnlExpenseTable").innerHTML = pnl.expenseRows.length ? pnl.expenseRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${money(row.amount)}</td>
      </tr>
    `).join("") + `
      <tr>
        <th>Total Expenses</th>
        <th class="num">${money(pnl.expenseTotal)}</th>
      </tr>
    ` : emptyRow(2, "No expense entries.");

    $("#pnlResult").textContent = (pnl.netProfit >= 0 ? "Net Profit: " : "Net Loss: ") + money(Math.abs(pnl.netProfit));
  }

  function renderBalanceSheet() {
    const sheet = balanceSheet(reportState());
    $("#assetsTable").innerHTML = sheet.assets.length ? sheet.assets.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${money(row.amount)}</td>
      </tr>
    `).join("") : emptyRow(2, "No asset balances.");
    $("#liabilitiesTable").innerHTML = sheet.liabilities.length ? sheet.liabilities.map((row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${money(row.amount)}</td>
      </tr>
    `).join("") : emptyRow(2, "No liability balances.");
    $("#assetsTotal").textContent = money(sheet.assetTotal);
    $("#liabilitiesTotal").textContent = money(sheet.liabilityTotal);
  }

  function signedInventoryTotal(tx) {
    const tax = transactionTotals(tx);
    const sign = (tx.type === "credit-note" || tx.type === "debit-note") ? -1 : 1;
    return {
      taxable: round2(sign * tax.taxable),
      cgst: round2(sign * tax.cgst),
      sgst: round2(sign * tax.sgst),
      igst: round2(sign * tax.igst),
      gstTotal: round2(sign * tax.gstTotal),
      total: round2(sign * tax.total)
    };
  }

  function addGstTotals(target, source) {
    target.taxable = round2(target.taxable + source.taxable);
    target.cgst = round2(target.cgst + source.cgst);
    target.sgst = round2(target.sgst + source.sgst);
    target.igst = round2(target.igst + source.igst);
    target.gstTotal = round2(target.gstTotal + source.gstTotal);
    target.total = round2(target.total + source.total);
  }

  function blankGstTotals() {
    return { taxable: 0, cgst: 0, sgst: 0, igst: 0, gstTotal: 0, total: 0 };
  }

  function gstSearchText(tx, party, tax) {
    return [
      tx.voucherNo,
      tx.referenceNo,
      tx.date,
      transactionLabel(tx.type),
      tx.description,
      party.name,
      party.gstin,
      party.state,
      tx.partyState,
      money(tax.taxable),
      money(tax.total),
      ...itemsFromTransaction(tx).flatMap((item) => [item.name, item.hsn, item.unit])
    ].join(" ").toLowerCase();
  }

  function gstRowsForUi() {
    const supplyType = $("#gstSupplyType") ? $("#gstSupplyType").value : "all";
    const query = ($("#gstSearch") ? $("#gstSearch").value : "").trim().toLowerCase();
    return reportTransactions(["sales", "credit-note", "purchase", "debit-note"])
      .map((tx) => {
        const party = ledgerById(state, tx.partyLedgerId) || {};
        const tax = signedInventoryTotal(tx);
        const isOutward = tx.type === "sales" || tx.type === "credit-note";
        const isInterstate = isInterstateTransaction(tx, state);
        const hasGstin = Boolean(String(party.gstin || "").trim());
        return { tx, party, tax, isOutward, isInterstate, hasGstin };
      })
      .filter((row) => {
        if (supplyType === "outward" && !row.isOutward) return false;
        if (supplyType === "inward" && row.isOutward) return false;
        if (supplyType === "b2b" && !row.hasGstin) return false;
        if (supplyType === "b2c" && row.hasGstin) return false;
        if (supplyType === "interstate" && !row.isInterstate) return false;
        if (supplyType === "intrastate" && row.isInterstate) return false;
        return !query || gstSearchText(row.tx, row.party, row.tax).includes(query);
      })
      .sort((a, b) => sortByDateDesc(a.tx, b.tx));
  }

  function gstTotalsFromRows(rows, outwardOnly = null) {
    const totals = blankGstTotals();
    rows
      .filter((row) => outwardOnly === null || row.isOutward === outwardOnly)
      .forEach((row) => addGstTotals(totals, row.tax));
    return totals;
  }

  function renderGstReports() {
    if (!$("#gstr1Table")) return;
    const rows = gstRowsForUi();
    const outwardRows = rows.filter((row) => row.isOutward);
    const inwardRows = rows.filter((row) => !row.isOutward);
    const outwardTotals = gstTotalsFromRows(rows, true);
    const inwardTotals = gstTotalsFromRows(rows, false);
    const b2bTaxable = rows.filter((row) => row.isOutward && row.hasGstin).reduce((sum, row) => round2(sum + row.tax.taxable), 0);
    const b2cTaxable = rows.filter((row) => row.isOutward && !row.hasGstin).reduce((sum, row) => round2(sum + row.tax.taxable), 0);
    const interstateIgst = rows.filter((row) => row.isInterstate).reduce((sum, row) => round2(sum + row.tax.igst), 0);

    $("#gstr1Count").textContent = outwardRows.length + (outwardRows.length === 1 ? " voucher" : " vouchers");
    $("#gstr1Table").innerHTML = outwardRows.length ? outwardRows.map(({ tx, party, tax, isInterstate, hasGstin }) => {
      return `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>${escapeHtml(transactionLabel(tx.type))}<small class="cell-note">${hasGstin ? "B2B" : "B2C"}</small></td>
          <td>${escapeHtml(tx.voucherNo)}</td>
          <td>${escapeHtml(party.name || "-")}</td>
          <td>${escapeHtml(party.gstin || "-")}</td>
          <td>${escapeHtml(tx.partyState || party.state || "-")}</td>
          <td>${isInterstate ? "Interstate" : "Same State"}</td>
          <td class="num">${money(tax.taxable)}</td>
          <td class="num">${money(tax.cgst)}</td>
          <td class="num">${money(tax.sgst)}</td>
          <td class="num">${money(tax.igst)}</td>
          <td class="num">${money(tax.total)}</td>
        </tr>
      `;
    }).join("") : emptyRow(12, "No outward GST entries in selected filters.");

    const netGst = blankGstTotals();
    addGstTotals(netGst, outwardTotals);
    addGstTotals(netGst, {
      taxable: -inwardTotals.taxable,
      cgst: -inwardTotals.cgst,
      sgst: -inwardTotals.sgst,
      igst: -inwardTotals.igst,
      gstTotal: -inwardTotals.gstTotal,
      total: -inwardTotals.total
    });

    $("#gstOutwardTaxable").textContent = money(outwardTotals.taxable);
    $("#gstInputTaxable").textContent = money(inwardTotals.taxable);
    $("#gstNetPayable").textContent = money(netGst.gstTotal);
    $("#gstNetTotal").textContent = money(netGst.cgst + netGst.sgst + netGst.igst);
    $("#gstB2bTaxable").textContent = money(b2bTaxable);
    $("#gstB2cTaxable").textContent = money(b2cTaxable);
    $("#gstInterstateIgst").textContent = money(interstateIgst);
    $("#gstInputCredit").textContent = money(inwardTotals.gstTotal);

    const summaryRows = [
      ["Outward taxable supplies", outwardTotals],
      ["Input tax credit", inwardTotals],
      ["Net payable / credit", netGst]
    ];
    $("#gstr3bTable").innerHTML = summaryRows.map(([label, tax]) => `
      <tr>
        <td>${label}</td>
        <td class="num">${money(tax.taxable)}</td>
        <td class="num">${money(tax.cgst)}</td>
        <td class="num">${money(tax.sgst)}</td>
        <td class="num">${money(tax.igst)}</td>
        <td class="num">${money(tax.gstTotal)}</td>
      </tr>
    `).join("");

    const hsnMap = new Map();
    rows.forEach(({ tx, isInterstate }) => {
      const sign = (tx.type === "credit-note" || tx.type === "debit-note") ? -1 : 1;
      calculateItems(itemsFromTransaction(tx), isInterstate).rows.forEach((item) => {
        const key = (item.hsn || "NA") + "|" + item.name;
        const row = hsnMap.get(key) || { hsn: item.hsn || "NA", name: item.name, quantity: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, gst: 0, total: 0 };
        row.quantity = round2(row.quantity + sign * item.quantity);
        row.taxable = round2(row.taxable + sign * item.taxable);
        row.cgst = round2(row.cgst + sign * item.cgst);
        row.sgst = round2(row.sgst + sign * item.sgst);
        row.igst = round2(row.igst + sign * item.igst);
        row.gst = round2(row.gst + sign * (item.cgst + item.sgst + item.igst));
        row.total = round2(row.total + sign * item.total);
        hsnMap.set(key, row);
      });
    });
    const hsnRows = Array.from(hsnMap.values()).filter((row) => row.quantity || row.taxable || row.gst || row.total);
    $("#hsnSummaryCount").textContent = hsnRows.length + (hsnRows.length === 1 ? " row" : " rows");
    $("#hsnSummaryTable").innerHTML = hsnRows.length ? hsnRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.hsn)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td class="num">${moneyFormat.format(row.quantity)}</td>
        <td class="num">${money(row.taxable)}</td>
        <td class="num">${money(row.cgst)}</td>
        <td class="num">${money(row.sgst)}</td>
        <td class="num">${money(row.igst)}</td>
        <td class="num">${money(row.gst)}</td>
        <td class="num">${money(row.total)}</td>
      </tr>
    `).join("") : emptyRow(9, "No HSN/SAC data in selected filters.");
  }

  function renderReports() {
    renderLedgerReport();
    renderAuditCheck();
    renderItemProfitReport();
    renderDayBook();
    renderCashBankBook();
    renderAgeingReport();
    renderTrialBalance();
    renderProfitLoss();
    renderBalanceSheet();
    renderGstReports();
    renderStockLedger();
  }

  function renderAll() {
    populateSelects();
    renderCustomFieldContainers();
    renderCustomButtons();
    renderCustomizePanel();
    renderCompanyBooks();
    renderStartupGateway();
    renderDashboard();
    renderTodayEntries();
    renderAllEntries();
    renderLedgers();
    renderStockItems();
    renderOutstandingReport();
    renderInvoiceOutstandingReport();
    renderSales();
    renderPurchase();
    renderPayment();
    renderContra();
    renderReceipt();
    renderJournal();
    updateSettlementOutstandingAll();
    renderInvoices();
    renderStockLedger();
    syncReportDateControls();
    renderReports();
    updateSalesTaxStrip();
    updatePurchaseTaxStrip();
  }

  function ledgerIsUsed(ledgerId) {
    return state.transactions.some((tx) => {
      return [
        tx.partyLedgerId,
        tx.salesLedgerId,
        tx.purchaseLedgerId,
        tx.gstLedgerId,
        tx.accountLedgerId,
        tx.fromLedgerId,
        tx.toLedgerId,
        tx.debitLedgerId,
        tx.creditLedgerId
      ].includes(ledgerId);
    });
  }

  function editLedger(id) {
    const ledger = ledgerById(state, id);
    if (!ledger) return;
    $("#ledgerEditId").value = ledger.id;
    $("#ledgerName").value = ledger.name;
    $("#ledgerType").value = ledgerGroupName(ledger);
    $("#ledgerGstin").value = ledger.gstin || "";
    $("#ledgerPhone").value = ledger.phone || "";
    $("#ledgerState").value = INDIA_STATES.includes(ledger.state) ? ledger.state : "";
    $("#ledgerAddress").value = ledger.address || "";
    $("#ledgerOpeningBalance").value = ledger.openingBalance || 0;
    $("#ledgerOpeningSide").value = ledger.openingSide || "Dr";
    fillCustomFields("ledgers", ledger.customFields || {});
    $("#ledgerSubmitBtn").textContent = "Update Ledger";
    navigateTo("ledgers");
  }

  function deleteLedger(id) {
    const ledger = ledgerById(state, id);
    if (!ledger) return;
    if (ledgerIsUsed(id)) {
      alertMessage("This ledger has transactions. Delete or edit those vouchers before deleting the ledger.");
      return;
    }
    if (!window.confirm("Delete ledger '" + ledger.name + "'?")) return;
    state.ledgers = state.ledgers.filter((item) => item.id !== id);
    saveState();
    renderAll();
    showToast("Ledger deleted.");
  }

  function editTransaction(id) {
    const tx = state.transactions.find((item) => item.id === id);
    if (!tx) return;
    if (["sales", "credit-note", "sales-order", "delivery-challan"].includes(tx.type)) {
      setSalesVoucherMode(tx.type);
      $("#salesEditId").value = tx.id;
      $("#salesDate").value = tx.date;
      $("#salesNo").value = tx.voucherNo;
      $("#salesReference").value = tx.referenceNo || "";
      $("#salesCustomer").value = tx.partyLedgerId;
      $("#salesLedger").value = tx.salesLedgerId;
      $("#salesGstLedger").value = tx.gstLedgerId;
      updatePartyDetails("sales");
      $("#salesPartyAddress").value = tx.partyAddress || $("#salesPartyAddress").value;
      $("#salesPartyState").value = INDIA_STATES.includes(tx.partyState) ? tx.partyState : $("#salesPartyState").value;
      $("#salesDescription").value = tx.description;
      setItemRows("sales", itemsFromTransaction(tx));
      fillCustomFields(tx.type, tx.customFields || {});
      $("#salesSubmitBtn").textContent = salesModeConfig(tx.type).updateText;
      updateSalesTaxStrip();
      navigateTo(tx.type);
      return;
    }

    if (["purchase", "debit-note", "purchase-order"].includes(tx.type)) {
      setPurchaseVoucherMode(tx.type);
      $("#purchaseEditId").value = tx.id;
      $("#purchaseDate").value = tx.date;
      $("#purchaseNo").value = tx.voucherNo;
      $("#purchaseReference").value = tx.referenceNo || "";
      $("#purchaseSupplier").value = tx.partyLedgerId;
      $("#purchaseLedger").value = tx.purchaseLedgerId;
      $("#purchaseGstLedger").value = tx.gstLedgerId;
      updatePartyDetails("purchase");
      $("#purchasePartyAddress").value = tx.partyAddress || $("#purchasePartyAddress").value;
      $("#purchasePartyState").value = INDIA_STATES.includes(tx.partyState) ? tx.partyState : $("#purchasePartyState").value;
      $("#purchaseDescription").value = tx.description;
      setItemRows("purchase", itemsFromTransaction(tx));
      fillCustomFields(tx.type, tx.customFields || {});
      $("#purchaseSubmitBtn").textContent = purchaseModeConfig(tx.type).updateText;
      updatePurchaseTaxStrip();
      navigateTo(tx.type);
      return;
    }

    if (tx.type === "payment") {
      $("#paymentEditId").value = tx.id;
      $("#paymentDate").value = tx.date;
      $("#paymentNo").value = tx.voucherNo;
      $("#paymentReference").value = tx.referenceNo || "";
      $("#paymentAccount").value = tx.accountLedgerId;
      $("#paymentParty").value = tx.partyLedgerId;
      $("#paymentAmount").value = tx.amount;
      $("#paymentNarration").value = tx.narration;
      fillCustomFields("payment", tx.customFields || {});
      $("#paymentSubmitBtn").textContent = "Update Payment";
      updateSettlementOutstanding("payment");
      if ($("#paymentAdjustVoucher")) $("#paymentAdjustVoucher").value = tx.adjustmentVoucherId || "";
      navigateTo("payment");
      return;
    }

    if (tx.type === "receipt") {
      $("#receiptEditId").value = tx.id;
      $("#receiptDate").value = tx.date;
      $("#receiptNo").value = tx.voucherNo;
      $("#receiptReference").value = tx.referenceNo || "";
      $("#receiptAccount").value = tx.accountLedgerId;
      $("#receiptParty").value = tx.partyLedgerId;
      $("#receiptAmount").value = tx.amount;
      $("#receiptNarration").value = tx.narration;
      fillCustomFields("receipt", tx.customFields || {});
      $("#receiptSubmitBtn").textContent = "Update Receipt";
      updateSettlementOutstanding("receipt");
      if ($("#receiptAdjustVoucher")) $("#receiptAdjustVoucher").value = tx.adjustmentVoucherId || "";
      navigateTo("receipt");
      return;
    }

    if (tx.type === "contra") {
      $("#contraEditId").value = tx.id;
      $("#contraDate").value = tx.date;
      $("#contraNo").value = tx.voucherNo;
      $("#contraReference").value = tx.referenceNo || "";
      $("#contraFromLedger").value = tx.fromLedgerId;
      $("#contraToLedger").value = tx.toLedgerId;
      $("#contraAmount").value = tx.amount;
      $("#contraNarration").value = tx.narration;
      $("#contraSubmitBtn").textContent = "Update Contra";
      navigateTo("contra");
      return;
    }

    if (tx.type === "journal") {
      $("#journalEditId").value = tx.id;
      $("#journalDate").value = tx.date;
      $("#journalNo").value = tx.voucherNo;
      $("#journalReference").value = tx.referenceNo || "";
      $("#journalDebitLedger").value = tx.debitLedgerId;
      $("#journalCreditLedger").value = tx.creditLedgerId;
      $("#journalAmount").value = tx.amount;
      $("#journalNarration").value = tx.narration;
      $("#journalSubmitBtn").textContent = "Update Journal";
      navigateTo("journal");
    }
  }

  function deleteTransaction(id) {
    const tx = state.transactions.find((item) => item.id === id);
    if (!tx) return;
    if (!window.confirm("Delete " + transactionLabel(tx.type).toLowerCase() + " voucher '" + tx.voucherNo + "'?")) return;
    state.transactions = state.transactions.filter((item) => item.id !== id);
    saveState();
    renderAll();
    showToast("Voucher deleted.");
  }

  function printVoucherShell(company, title, tx, bodyHtml) {
    const itemCount = itemsFromTransaction(tx).length;
    const compactClass = itemCount > 35 ? " ultra-compact-print" : (itemCount > 18 ? " compact-print" : "");
    const paymentName = company.paymentName || company.name || "Speed Accounting";
    let printQrDataUrl = company.upiQrDataUrl || "";
    if (company.upiId) {
      try {
        printQrDataUrl = createUpiQrDataUrl(company.upiId, paymentName, transactionAmount(tx), tx.voucherNo);
      } catch (error) {
        printQrDataUrl = company.upiQrDataUrl || "";
      }
    }
    const paymentBox = company.bankDetails || company.upiId || company.upiQrDataUrl
      ? `
        <div class="tally-payment-box">
          ${printQrDataUrl ? `<img class="tally-upi-qr" src="${escapeHtml(printQrDataUrl)}" alt="UPI QR">` : ""}
          <div>
            <strong>Payment Details</strong>
            ${company.bankDetails ? `<span>Bank: ${escapeHtml(company.bankDetails)}</span>` : ""}
            ${company.upiId ? `<span>UPI ID: ${escapeHtml(company.upiId)}</span>` : ""}
            ${company.upiId ? `<span>Payee: ${escapeHtml(paymentName)}</span>` : ""}
            ${company.upiId ? `<span>QR Amount: ${escapeHtml(money(transactionAmount(tx)))}</span>` : ""}
          </div>
        </div>
      `
      : "";
    const printNotes = [
      paymentBox,
      company.terms ? `<div><strong>Terms:</strong> ${escapeHtml(company.terms)}</div>` : "",
      company.declaration ? `<div><strong>Declaration:</strong> ${escapeHtml(company.declaration)}</div>` : ""
    ].filter(Boolean).join("");
    const logoHtml = company.logoDataUrl ? `<img class="tally-company-logo" src="${escapeHtml(company.logoDataUrl)}" alt="Company logo">` : "";
    const signatureHtml = company.signatureDataUrl ? `<img class="tally-signature-image" src="${escapeHtml(company.signatureDataUrl)}" alt="Authorised signature">` : "";
    return `
      <div class="print-invoice tally-print${compactClass}">
        <div class="print-topline">
          <span>${new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
          <span>Speed Accounting</span>
        </div>
        <div class="tally-print-header">
          <div class="tally-company-heading">
            ${logoHtml}
            <div class="tally-company-block">
              <h1>${escapeHtml(company.name || "Speed Accounting")}</h1>
              <p>${escapeHtml(company.address || "")}</p>
              <p>GSTIN: ${escapeHtml(company.gstin || "-")} <span>State: ${escapeHtml(company.state || "-")}</span> <span>Phone: ${escapeHtml(company.phone || "-")}</span></p>
            </div>
          </div>
          <div class="tally-voucher-badge">${escapeHtml(title)}</div>
        </div>
        ${bodyHtml}
        ${printNotes ? `<div class="tally-print-notes">${printNotes}</div>` : ""}
        <div class="tally-signatures">
          <span>Prepared By</span>
          <span>Checked By</span>
          <span>${signatureHtml}<b>Authorised Signatory</b></span>
        </div>
      </div>
    `;
  }

  function printSalesInvoice(tx) {
    const company = state.company || {};
    const party = ledgerById(state, tx.partyLedgerId) || {};
    const isInterstate = isInterstateTransaction(tx, state);
    const tax = transactionTotals(tx);
    const itemRows = calculateItems(itemsFromTransaction(tx), isInterstate).rows;
    const isPurchase = tx.type === "purchase" || tx.type === "debit-note" || tx.type === "purchase-order";
    const title = {
      sales: "Tax Invoice",
      purchase: "Purchase Voucher",
      "credit-note": "Credit Note",
      "debit-note": "Debit Note",
      "sales-order": "Sales Order",
      "purchase-order": "Purchase Order",
      "delivery-challan": "Delivery Challan"
    }[tx.type] || "Voucher";
    const partyTitle = isPurchase ? "Supplier" : "Customer";
    const partyAddress = tx.partyAddress || party.address || "";
    const partyState = tx.partyState || party.state || "";
    const gstMode = isInterstate ? "IGST - Interstate" : "CGST + SGST - Same State";
    const printAmount = (amount) => moneyFormat.format(round2(amount || 0));
    const ledgerNameValue = isPurchase ? ledgerName(tx.purchaseLedgerId) : ledgerName(tx.salesLedgerId);

    const bodyHtml = `
        <table class="tally-voucher-meta">
          <tbody>
            <tr>
              <th>Voucher No.</th>
              <th>Date</th>
              <th>Reference</th>
              <th>${partyTitle}</th>
              <th>Ledger</th>
            </tr>
            <tr>
              <td>${escapeHtml(tx.voucherNo)}</td>
              <td>${formatDate(tx.date)}</td>
              <td>${escapeHtml(tx.referenceNo || "-")}</td>
              <td>${escapeHtml(party.name || "-")}</td>
              <td>${escapeHtml(ledgerNameValue || "-")}</td>
            </tr>
          </tbody>
        </table>

        <div class="tally-party-line">
          <span>${escapeHtml(partyAddress || "")}</span>
          <span>State: ${escapeHtml(partyState || "-")}</span>
          <span>GSTIN: ${escapeHtml(party.gstin || "-")}</span>
        </div>

        <table class="tally-print-table tally-item-print-table">
          <colgroup>
            <col class="col-item">
            <col class="col-hsn">
            <col class="col-qty">
            <col class="col-unit">
            <col class="col-rate">
            <col class="col-gst">
            <col class="col-taxable">
            <col class="col-tax">
            <col class="col-tax">
            <col class="col-tax">
            <col class="col-total">
          </colgroup>
          <thead>
            <tr>
              <th>Item</th>
              <th>HSN</th>
              <th class="num">Qty</th>
              <th>Unit</th>
              <th class="num">Rate</th>
              <th class="num">GST %</th>
              <th class="num">Taxable</th>
              <th class="num">CGST</th>
              <th class="num">SGST</th>
              <th class="num">IGST</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows.map((item) => `
              <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.hsn || "-")}</td>
                <td class="num">${moneyFormat.format(item.quantity)}</td>
                <td>${escapeHtml(item.unit || "Nos")}</td>
                <td class="num">${printAmount(item.rate)}</td>
                <td class="num">${moneyFormat.format(item.gstRate)}%</td>
                <td class="num">${printAmount(item.taxable)}</td>
                <td class="num">${printAmount(item.cgst)}</td>
                <td class="num">${printAmount(item.sgst)}</td>
                <td class="num">${printAmount(item.igst)}</td>
                <td class="num">${printAmount(item.total)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="tally-narration-total">
          <div class="tally-narration">
            <strong>Narration:</strong>
            <span>${escapeHtml(tx.description || "-")}</span>
            <span>${escapeHtml(gstMode)}</span>
          </div>
          <div class="tally-total-box">
            <div><span>Taxable:</span><strong>${money(tax.taxable)}</strong></div>
            <div><span>CGST:</span><strong>${money(tax.cgst)}</strong></div>
            <div><span>SGST:</span><strong>${money(tax.sgst)}</strong></div>
            <div><span>IGST:</span><strong>${money(tax.igst)}</strong></div>
            <div><span>Grand Total:</span><strong>${money(tax.total)}</strong></div>
          </div>
        </div>

        <div class="tally-amount-words">${escapeHtml(amountInWords(tax.total))}</div>
    `;

    $("#print-area").innerHTML = printVoucherShell(company, title, tx, bodyHtml);

    document.body.classList.add("is-printing");
    setTimeout(() => window.print(), 80);
  }

  function printSimpleVoucher(tx) {
    const company = state.company || {};
    const isPayment = tx.type === "payment";
    const isJournal = tx.type === "journal";
    const isContra = tx.type === "contra";
    const title = isJournal ? "Journal Voucher" : (isContra ? "Contra Voucher" : (isPayment ? "Payment Voucher" : "Receipt Voucher"));
    const accountLabel = isPayment ? "Paid From" : "Received In";
    const partyLabel = isPayment ? "Payee Ledger" : "From Ledger";
    const account = ledgerById(state, tx.accountLedgerId) || {};
    const party = ledgerById(state, tx.partyLedgerId) || {};
    const debitLedger = ledgerById(state, tx.debitLedgerId) || {};
    const creditLedger = ledgerById(state, tx.creditLedgerId) || {};
    const fromLedger = ledgerById(state, tx.fromLedgerId) || {};
    const toLedger = ledgerById(state, tx.toLedgerId) || {};
    const adjustedTx = tx.adjustmentVoucherId ? state.transactions.find((item) => item.id === tx.adjustmentVoucherId) : null;
    const fromLabel = isJournal ? "Debit Ledger" : (isContra ? "Transfer From" : accountLabel);
    const toLabel = isJournal ? "Credit Ledger" : (isContra ? "Transfer To" : partyLabel);
    const fromName = isJournal ? debitLedger.name : (isContra ? fromLedger.name : account.name);
    const toName = isJournal ? creditLedger.name : (isContra ? toLedger.name : party.name);
    const bodyHtml = `
        <table class="tally-voucher-meta">
          <tbody>
            <tr>
              <th>Voucher No.</th>
              <th>Date</th>
              <th>Reference</th>
              <th>${fromLabel}</th>
              <th>${toLabel}</th>
              <th>Adjusted Against</th>
            </tr>
            <tr>
              <td>${escapeHtml(tx.voucherNo)}</td>
              <td>${formatDate(tx.date)}</td>
              <td>${escapeHtml(tx.referenceNo || "-")}</td>
              <td>${escapeHtml(fromName || "-")}</td>
              <td>${escapeHtml(toName || "-")}</td>
              <td>${escapeHtml(adjustedTx ? adjustedTx.voucherNo : "-")}</td>
            </tr>
          </tbody>
        </table>

        <table class="tally-print-table tally-ledger-table">
          <thead>
            <tr>
              <th>Particulars</th>
              <th class="num">Debit</th>
              <th class="num">Credit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(isJournal ? debitLedger.name : (isContra ? toLedger.name : (isPayment ? party.name : account.name)) || "-")}</td>
              <td class="num">${money(tx.amount)}</td>
              <td class="num"></td>
            </tr>
            <tr>
              <td>${escapeHtml(isJournal ? creditLedger.name : (isContra ? fromLedger.name : (isPayment ? account.name : party.name)) || "-")}</td>
              <td class="num"></td>
              <td class="num">${money(tx.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="tally-narration-total">
          <div class="tally-narration">
            <strong>Narration:</strong>
            <span>${escapeHtml(tx.narration || "-")}</span>
          </div>
          <div class="tally-total-box">
            <div><span>Total Debit:</span><strong>${money(tx.amount)}</strong></div>
            <div><span>Total Credit:</span><strong>${money(tx.amount)}</strong></div>
            <div><span>Voucher Total:</span><strong>${money(tx.amount)}</strong></div>
          </div>
        </div>

        <div class="tally-amount-words">${escapeHtml(amountInWords(tx.amount))}</div>
    `;

    $("#print-area").innerHTML = printVoucherShell(company, title, tx, bodyHtml);

    document.body.classList.add("is-printing");
    setTimeout(() => window.print(), 80);
  }

  function printTransaction(tx) {
    if (!tx) return;
    if (isItemVoucher(tx.type)) {
      printSalesInvoice(tx);
      return;
    }
    if (tx.type === "payment" || tx.type === "receipt" || tx.type === "journal" || tx.type === "contra") {
      printSimpleVoucher(tx);
    }
  }

  function handlePrintCurrentSales() {
    try {
      const tx = collectSalesForm();
      validateVoucher(tx);
      tx.id = tx.id || "preview";
      printTransaction(tx);
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function handlePrintCurrentPurchase() {
    try {
      const tx = collectPurchaseForm();
      validateVoucher(tx);
      tx.id = tx.id || "preview";
      printTransaction(tx);
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function handlePrintCurrentPayment() {
    try {
      const tx = collectPaymentForm();
      validateVoucher(tx);
      tx.id = tx.id || "preview";
      printTransaction(tx);
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function handlePrintCurrentContra() {
    try {
      const tx = collectContraForm();
      validateVoucher(tx);
      tx.id = tx.id || "preview";
      printTransaction(tx);
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function handlePrintCurrentReceipt() {
    try {
      const tx = collectReceiptForm();
      validateVoucher(tx);
      tx.id = tx.id || "preview";
      printTransaction(tx);
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function handlePrintCurrentJournal() {
    try {
      const tx = collectJournalForm();
      validateVoucher(tx);
      tx.id = tx.id || "preview";
      printTransaction(tx);
    } catch (error) {
      alertMessage(error.message);
    }
  }

  function defaultCustomScreen() {
    const current = activeSectionId();
    return CUSTOM_SCREEN_LABELS[current] ? current : "sales";
  }

  function uniqueCustomKey(screen, label, id, existingKey) {
    if (existingKey) return existingKey;
    const base = slugify(label);
    let key = base;
    let suffix = 2;
    while (state.customFields.some((field) => field.screen === screen && field.key === key && field.id !== id)) {
      key = base + "-" + suffix;
      suffix += 1;
    }
    return key;
  }

  function clearCustomFieldForm() {
    setOptionsFromObject($("#customFieldScreen"), CUSTOM_SCREEN_LABELS, defaultCustomScreen());
    $("#customFieldEditId").value = "";
    $("#customFieldLabel").value = "";
    $("#customFieldType").value = "text";
    $("#customFieldOptions").value = "";
    $("#customFieldDefault").value = "";
    $("#customFieldRequired").checked = false;
    $("#customFieldPrint").checked = true;
    $("#customFieldSubmitBtn").textContent = "Add Field";
  }

  function clearCustomButtonForm() {
    setOptionsFromObject($("#customButtonScreen"), CUSTOM_SCREEN_LABELS, defaultCustomScreen());
    setOptionsFromObject($("#customButtonTarget"), CUSTOM_BUTTON_TARGETS, "dashboard");
    $("#customButtonEditId").value = "";
    $("#customButtonLabel").value = "";
    $("#customButtonAction").value = "save";
    $("#customButtonMessage").value = "";
    $("#customButtonSubmitBtn").textContent = "Add Button";
  }

  function upsertCustomFieldFromForm() {
    const editId = $("#customFieldEditId").value;
    const existing = editId ? state.customFields.find((field) => field.id === editId) : null;
    const label = $("#customFieldLabel").value.trim();
    if (!label) throw new Error("Custom field label is required.");

    const id = editId || nextId(state, "customField", "CF");
    const screen = $("#customFieldScreen").value;
    const field = normalizeCustomField({
      id,
      screen,
      key: uniqueCustomKey(screen, label, id, existing && existing.key),
      label,
      type: $("#customFieldType").value,
      options: $("#customFieldOptions").value,
      defaultValue: $("#customFieldDefault").value,
      required: $("#customFieldRequired").checked,
      print: $("#customFieldPrint").checked
    });

    if (existing) {
      const index = state.customFields.findIndex((item) => item.id === editId);
      state.customFields[index] = field;
      showToast("Custom field updated.");
    } else {
      state.customFields.push(field);
      showToast("Custom field added.");
    }

    saveState();
    renderAll();
    clearCustomFieldForm();
  }

  function editCustomField(id) {
    const field = state.customFields.find((item) => item.id === id);
    if (!field) return;
    navigateTo("customize");
    setOptionsFromObject($("#customFieldScreen"), CUSTOM_SCREEN_LABELS, field.screen);
    $("#customFieldEditId").value = field.id;
    $("#customFieldLabel").value = field.label;
    $("#customFieldType").value = field.type;
    $("#customFieldOptions").value = field.options || "";
    $("#customFieldDefault").value = field.defaultValue || "";
    $("#customFieldRequired").checked = Boolean(field.required);
    $("#customFieldPrint").checked = field.print !== false;
    $("#customFieldSubmitBtn").textContent = "Update Field";
    $("#customFieldLabel").focus();
  }

  function removeCustomFieldValues(field) {
    const removeValue = (record) => {
      if (record && record.customFields) delete record.customFields[field.key];
    };
    if (field.screen === "company") {
      removeValue(state.company);
      return;
    }
    if (field.screen === "ledgers") {
      state.ledgers.forEach(removeValue);
      return;
    }
    state.transactions.filter((tx) => tx.type === field.screen).forEach(removeValue);
  }

  function deleteCustomField(id) {
    const field = state.customFields.find((item) => item.id === id);
    if (!field) return;
    if (!window.confirm("Delete custom field '" + field.label + "'? Saved values for this field will also be removed.")) return;
    removeCustomFieldValues(field);
    state.customFields = state.customFields.filter((item) => item.id !== id);
    saveState();
    renderAll();
    clearCustomFieldForm();
    showToast("Custom field deleted.");
  }

  function upsertCustomButtonFromForm() {
    const editId = $("#customButtonEditId").value;
    const label = $("#customButtonLabel").value.trim();
    if (!label) throw new Error("Custom button text is required.");

    const button = normalizeCustomButton({
      id: editId || nextId(state, "customButton", "CB"),
      screen: $("#customButtonScreen").value,
      label,
      action: $("#customButtonAction").value,
      target: $("#customButtonTarget").value,
      message: $("#customButtonMessage").value
    });

    if (editId) {
      const index = state.customButtons.findIndex((item) => item.id === editId);
      state.customButtons[index] = button;
      showToast("Custom button updated.");
    } else {
      state.customButtons.push(button);
      showToast("Custom button added.");
    }

    saveState();
    renderAll();
    clearCustomButtonForm();
  }

  function editCustomButton(id) {
    const button = state.customButtons.find((item) => item.id === id);
    if (!button) return;
    navigateTo("customize");
    setOptionsFromObject($("#customButtonScreen"), CUSTOM_SCREEN_LABELS, button.screen);
    setOptionsFromObject($("#customButtonTarget"), CUSTOM_BUTTON_TARGETS, button.target);
    $("#customButtonEditId").value = button.id;
    $("#customButtonLabel").value = button.label;
    $("#customButtonAction").value = button.action;
    $("#customButtonMessage").value = button.message || "";
    $("#customButtonSubmitBtn").textContent = "Update Button";
    $("#customButtonLabel").focus();
  }

  function deleteCustomButton(id) {
    const button = state.customButtons.find((item) => item.id === id);
    if (!button) return;
    if (!window.confirm("Delete custom button '" + button.label + "'?")) return;
    state.customButtons = state.customButtons.filter((item) => item.id !== id);
    saveState();
    renderAll();
    clearCustomButtonForm();
    showToast("Custom button deleted.");
  }

  function submitFormByScreen(screen) {
    const formSelector = {
      company: "#companyForm",
      ledgers: "#ledgerForm",
      "stock-items": "#stockItemForm",
      sales: "#salesForm",
      "credit-note": "#salesForm",
      "sales-order": "#salesForm",
      "delivery-challan": "#salesForm",
      purchase: "#purchaseForm",
      "debit-note": "#purchaseForm",
      "purchase-order": "#purchaseForm",
      payment: "#paymentForm",
      contra: "#contraForm",
      receipt: "#receiptForm",
      journal: "#journalForm"
    }[screen];
    if (!formSelector) {
      alertMessage("This screen has no save form.");
      return;
    }
    $(formSelector).requestSubmit();
  }

  function printCurrentByScreen(screen) {
    const printer = {
      sales: handlePrintCurrentSales,
      "credit-note": handlePrintCurrentSales,
      "sales-order": handlePrintCurrentSales,
      "delivery-challan": handlePrintCurrentSales,
      purchase: handlePrintCurrentPurchase,
      "debit-note": handlePrintCurrentPurchase,
      "purchase-order": handlePrintCurrentPurchase,
      payment: handlePrintCurrentPayment,
      contra: handlePrintCurrentContra,
      receipt: handlePrintCurrentReceipt,
      journal: handlePrintCurrentJournal
    }[screen];
    if (!printer) {
      alertMessage("Print action voucher screens par kaam karta hai: Sales, Sales Order, Delivery Challan, Credit Note, Purchase, Purchase Order, Debit Note, Payment, Receipt, Contra, Journal.");
      return;
    }
    printer();
  }

  function clearFormByScreen(screen) {
    const clearer = {
      company: fillCompanyForm,
      ledgers: clearLedgerForm,
      "stock-items": clearStockItemForm,
      sales: clearSalesForm,
      "credit-note": clearSalesForm,
      "sales-order": clearSalesForm,
      "delivery-challan": clearSalesForm,
      purchase: clearPurchaseForm,
      "debit-note": clearPurchaseForm,
      "purchase-order": clearPurchaseForm,
      payment: clearPaymentForm,
      contra: clearContraForm,
      receipt: clearReceiptForm,
      journal: clearJournalForm
    }[screen];
    if (!clearer) {
      alertMessage("This screen has no clear form.");
      return;
    }
    clearer();
    showToast("Form cleared.");
  }

  function executeCustomButton(id) {
    const button = state.customButtons.find((item) => item.id === id);
    if (!button) return;
    if (button.action === "save") {
      submitFormByScreen(button.screen);
      return;
    }
    if (button.action === "print") {
      printCurrentByScreen(button.screen);
      return;
    }
    if (button.action === "clear") {
      clearFormByScreen(button.screen);
      return;
    }
    if (button.action === "goto") {
      navigateTo(button.target);
      return;
    }
    alertMessage(button.message || "Custom message");
  }

  function openLedgerReport(id) {
    if (!ledgerById(state, id)) return;
    $("#ledgerReportSelect").value = id;
    navigateTo("ledger-report");
    renderLedgerReport();
  }

  function resetDemoData() {
    if (!window.confirm("Reset Speed Accounting demo data? This will replace data saved in this browser.")) return;
    state = normalizeState(makeSampleState());
    companyBooks = { activeCompanyId: "", books: [] };
    saveCompanyBooks();
    saveState();
    fillCompanyForm();
    clearLedgerForm();
    clearStockItemForm();
    clearSalesForm();
    clearPurchaseForm();
    clearPaymentForm();
    clearReceiptForm();
    clearJournalForm();
    clearCustomFieldForm();
    clearCustomButtonForm();
    renderAll();
    navigateTo("dashboard");
    showToast("Demo data reset. Sab controls fresh ho gaye.");
  }

  function downloadBackup() {
    const payload = {
      app: "Speed Accounting",
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
      companyBooks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    const companyName = (state.company && state.company.name ? state.company.name : "speed-accounting").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
    link.href = URL.createObjectURL(blob);
    link.download = `${companyName}-backup-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    showToast("Backup downloaded.");
  }

  function restoreBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const nextState = parsed.state || parsed;
        if (!nextState || !Array.isArray(nextState.ledgers) || !Array.isArray(nextState.transactions)) {
          throw new Error("Invalid backup file.");
        }
        if (!window.confirm("Restore backup? Current browser data replace ho jayega.")) return;
        state = normalizeState(nextState);
        if (parsed.companyBooks && Array.isArray(parsed.companyBooks.books)) {
          companyBooks = parsed.companyBooks;
        } else {
          companyBooks = { activeCompanyId: state.company && state.company.id ? state.company.id : "", books: [] };
        }
        saveCompanyBooks();
        saveState();
        fillCompanyForm();
        clearLedgerForm();
        clearStockItemForm();
        clearSalesForm();
        clearPurchaseForm();
        clearPaymentForm();
        clearContraForm();
        clearReceiptForm();
        clearJournalForm();
        renderAll();
        showToast("Backup restored.");
      } catch (error) {
        alertMessage("Restore failed: " + error.message);
      } finally {
        $("#restoreFileInput").value = "";
      }
    };
    reader.readAsText(file);
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadTextFile(filename, text, type) {
    const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    const href = link.href;
    link.remove();
    URL.revokeObjectURL(href);
  }

  function companySlug() {
    return (state.company && state.company.name ? state.company.name : "speed-accounting")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "speed-accounting";
  }

  function downloadCsv(filename, headers, rows) {
    const csv = [headers.map(csvEscape).join(",")]
      .concat(rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")))
      .join("\r\n");
    downloadTextFile(filename, csv, "text/csv;charset=utf-8");
    showToast("CSV exported: " + filename);
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    const source = String(text || "").replace(/^\uFEFF/, "");
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const next = source[index + 1];
      if (quoted) {
        if (char === '"' && next === '"') {
          field += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
        continue;
      }
      if (char === '"') {
        quoted = true;
        continue;
      }
      if (char === ",") {
        row.push(field);
        field = "";
        continue;
      }
      if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        continue;
      }
      if (char !== "\r") field += char;
    }
    row.push(field);
    if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map((header) => normalizeHeader(header));
    return rows
      .filter((cells) => cells.some((cell) => String(cell).trim() !== ""))
      .map((cells) => {
        const record = {};
        headers.forEach((header, index) => {
          if (header) record[header] = String(cells[index] || "").trim();
        });
        return record;
      });
  }

  function normalizeHeader(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function csvValue(record, aliases) {
    const wanted = aliases.map(normalizeHeader);
    for (const key of wanted) {
      if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
    }
    return "";
  }

  function exportLedgersCsv() {
    const headers = ["Name", "Group", "Type", "GSTIN", "Phone", "State", "Address", "Opening Balance", "Opening Side", "Current Balance"];
    const rows = ledgerSummaries(state).filter((row) => !row.ledger.isVirtual).map((row) => ({
      "Name": row.ledger.name,
      "Group": ledgerGroupName(row.ledger),
      "Type": row.ledger.type,
      "GSTIN": row.ledger.gstin || "",
      "Phone": row.ledger.phone || "",
      "State": row.ledger.state || "",
      "Address": row.ledger.address || "",
      "Opening Balance": row.ledger.openingBalance || 0,
      "Opening Side": row.ledger.openingSide || "Dr",
      "Current Balance": balanceText(row.balance)
    }));
    downloadCsv(`${companySlug()}-ledgers-${today()}.csv`, headers, rows);
  }

  function exportStockItemsCsv() {
    const headers = ["Name", "HSN/SAC", "Unit", "GST %", "Opening Qty", "Opening Rate", "Purchase Rate", "Sale Rate", "Minimum Stock", "Current Stock", "Stock Value"];
    const rows = state.stockItems.map((item) => ({
      "Name": item.name,
      "HSN/SAC": item.hsn || "",
      "Unit": item.unit || "Nos",
      "GST %": item.gstRate || 0,
      "Opening Qty": item.openingQty || 0,
      "Opening Rate": item.openingRate || 0,
      "Purchase Rate": item.purchaseRate || 0,
      "Sale Rate": item.saleRate || 0,
      "Minimum Stock": item.minStockLevel || 0,
      "Current Stock": stockItemBalance(item),
      "Stock Value": stockItemValue(item)
    }));
    downloadCsv(`${companySlug()}-stock-items-${today()}.csv`, headers, rows);
  }

  function exportLedgerReportCsv() {
    const ledgerId = $("#ledgerReportSelect").value || (state.ledgers[0] && state.ledgers[0].id);
    const ledger = ledgerById(state, ledgerId);
    const headers = ["Date", "Type", "Voucher", "Narration", "Debit", "Credit", "Balance"];
    let running = 0;
    const rows = ledger ? allEntries(reportState()).filter((entry) => entry.ledgerId === ledgerId && dateInReportRange(entry.date)).map((entry) => {
      running = round2(running + entry.debit - entry.credit);
      return {
        "Date": formatDate(entry.date),
        "Type": transactionLabel(entry.type),
        "Voucher": entry.voucherNo,
        "Narration": entry.narration,
        "Debit": entry.debit || "",
        "Credit": entry.credit || "",
        "Balance": balanceText(running)
      };
    }) : [];
    downloadCsv(`${companySlug()}-${ledger ? slugify(ledger.name) : "ledger-report"}-${today()}.csv`, headers, rows);
  }

  function exportDayBookCsv() {
    const headers = ["Date", "Type", "Voucher", "Party / Ledger", "Narration", "Debit", "Credit", "Value"];
    const rows = dayBookRowsForUi().map((row) => ({
      "Date": formatDate(row.tx.date),
      "Type": transactionLabel(row.tx.type),
      "Voucher": row.tx.voucherNo,
      "Party / Ledger": transactionPartyName(row.tx),
      "Narration": transactionDescription(row.tx),
      "Debit": row.debit || "",
      "Credit": row.credit || "",
      "Value": row.value
    }));
    downloadCsv(`${companySlug()}-day-book-${today()}.csv`, headers, rows);
  }

  function exportItemProfitCsv() {
    const headers = ["Item", "HSN/SAC", "Unit", "Qty Sold", "Sales Value", "Cost Rate", "Estimated Cost", "Gross Profit", "Margin %"];
    const rows = itemProfitRows(state, reportDateFrom, reportDateTo).map((row) => ({
      "Item": row.name,
      "HSN/SAC": row.hsn || "",
      "Unit": row.unit || "Nos",
      "Qty Sold": row.quantity,
      "Sales Value": row.salesValue,
      "Cost Rate": row.costRate,
      "Estimated Cost": row.costValue,
      "Gross Profit": row.profit,
      "Margin %": row.margin
    }));
    downloadCsv(`${companySlug()}-item-profit-${today()}.csv`, headers, rows);
  }

  function exportAuditCsv() {
    const headers = ["Severity", "Issue Type", "Reference", "Details"];
    const rows = auditRowsForUi().map((issue) => ({
      "Severity": issue.severity,
      "Issue Type": issue.type,
      "Reference": issue.reference,
      "Details": issue.details
    }));
    downloadCsv(`${companySlug()}-audit-check-${today()}.csv`, headers, rows);
  }

  function exportOutstandingCsv() {
    const headers = ["Party", "Group", "Type", "Phone", "GSTIN", "State", "Lena Hai", "Dena Hai", "Balance", "0-30 Days", "31-60 Days", "60+ Days"];
    const asOn = $("#outstandingAsOn") ? $("#outstandingAsOn").value : today();
    const rows = outstandingRowsForUi().map((row) => ({
      ...(() => {
        const buckets = partyAgingBuckets(state, row.ledger.id, row.receivable ? "receipt" : "payment", asOn);
        return {
          "Party": row.ledger.name,
          "Group": ledgerGroupName(row.ledger),
          "Type": row.ledger.type,
          "Phone": row.ledger.phone || "",
          "GSTIN": row.ledger.gstin || "",
          "State": row.ledger.state || "",
          "Lena Hai": row.receivable || "",
          "Dena Hai": row.payable || "",
          "Balance": balanceText(row.balance),
          "0-30 Days": buckets.current || "",
          "31-60 Days": buckets.month || "",
          "60+ Days": buckets.old || ""
        };
      })()
    }));
    downloadCsv(`${companySlug()}-outstanding-${today()}.csv`, headers, rows);
  }

  function exportStockSummaryCsv() {
    const headers = ["Item", "HSN/SAC", "Unit", "Opening", "Inward", "Outward", "Closing", "Rate", "Minimum Stock", "Status", "Value"];
    const rows = stockSummaryRows().map((row) => ({
      "Item": row.item.name,
      "HSN/SAC": row.item.hsn || "",
      "Unit": row.item.unit || "Nos",
      "Opening": row.item.openingQty || 0,
      "Inward": row.inward,
      "Outward": row.outward,
      "Closing": row.closing,
      "Rate": row.rate,
      "Minimum Stock": row.minStock || 0,
      "Status": row.minStock && row.closing < row.minStock ? "Low Stock" : "OK",
      "Value": row.value
    }));
    downloadCsv(`${companySlug()}-stock-summary-${today()}.csv`, headers, rows);
  }

  function exportGstCsv() {
    const headers = ["Section", "Date", "Voucher", "Party / Item", "GSTIN / HSN", "State / Qty", "GST Mode", "B2B/B2C", "Taxable", "CGST", "SGST", "IGST", "GST", "Total"];
    const rows = [];
    gstRowsForUi().forEach(({ tx, party, tax, isInterstate, hasGstin }) => {
      rows.push({
        "Section": transactionLabel(tx.type),
        "Date": formatDate(tx.date),
        "Voucher": tx.voucherNo,
        "Party / Item": party.name || "-",
        "GSTIN / HSN": party.gstin || "-",
        "State / Qty": tx.partyState || party.state || "-",
        "GST Mode": isInterstate ? "Interstate" : "Same State",
        "B2B/B2C": hasGstin ? "B2B" : "B2C",
        "Taxable": tax.taxable,
        "CGST": tax.cgst,
        "SGST": tax.sgst,
        "IGST": tax.igst,
        "GST": tax.gstTotal,
        "Total": tax.total
      });
      calculateItems(itemsFromTransaction(tx), isInterstate).rows.forEach((item) => {
        rows.push({
          "Section": "HSN/SAC",
          "Date": formatDate(tx.date),
          "Voucher": tx.voucherNo,
          "Party / Item": item.name,
          "GSTIN / HSN": item.hsn || "NA",
          "State / Qty": item.quantity + " " + item.unit,
          "GST Mode": isInterstate ? "Interstate" : "Same State",
          "B2B/B2C": hasGstin ? "B2B" : "B2C",
          "Taxable": item.taxable,
          "CGST": item.cgst,
          "SGST": item.sgst,
          "IGST": item.igst,
          "GST": item.cgst + item.sgst + item.igst,
          "Total": item.total
        });
      });
    });
    downloadCsv(`${companySlug()}-gst-report-${today()}.csv`, headers, rows);
  }

  function importLedgersCsv(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(reader.result);
        let added = 0;
        let updated = 0;
        let skipped = 0;
        rows.forEach((record) => {
          const name = csvValue(record, ["Name", "Ledger Name", "Party"]).trim();
          if (!name) {
            skipped += 1;
            return;
          }
          const groupText = csvValue(record, ["Group", "Ledger Group", "Group Name"]);
          const typeText = csvValue(record, ["Type", "Ledger Type"]);
          let group = ledgerGroupByName(groupText);
          let type = group ? group.type : "";
          if (!group && LEDGER_TYPES.includes(typeText)) {
            type = typeText;
            group = ledgerGroupByName(defaultLedgerGroupName(type));
          }
          if (!group || !LEDGER_TYPES.includes(type)) {
            skipped += 1;
            return;
          }
          const existing = state.ledgers.find((ledger) => ledger.name.toLowerCase() === name.toLowerCase());
          const ledger = {
            id: existing ? existing.id : nextId(state, "ledger", "L"),
            name,
            type,
            groupName: group.name,
            gstin: csvValue(record, ["GSTIN", "GST No", "GST Number"]).toUpperCase(),
            phone: csvValue(record, ["Phone", "Mobile", "Contact"]),
            state: csvValue(record, ["State", "Place Of Supply"]),
            address: csvValue(record, ["Address", "Billing Address"]),
            openingBalance: parseAmount(csvValue(record, ["Opening Balance", "Opening", "Op Balance"])),
            openingSide: String(csvValue(record, ["Opening Side", "Side", "Dr/Cr"]) || "Dr").toLowerCase().startsWith("c") ? "Cr" : "Dr",
            customFields: existing ? existing.customFields || {} : {}
          };
          if (existing) {
            state.ledgers[state.ledgers.findIndex((item) => item.id === existing.id)] = ledger;
            updated += 1;
          } else {
            state.ledgers.push(ledger);
            added += 1;
          }
        });
        state = normalizeState(state);
        saveState();
        renderAll();
        showToast(`Ledgers import: ${added} added, ${updated} updated, ${skipped} skipped.`);
      } catch (error) {
        alertMessage("Ledger import failed: " + error.message);
      } finally {
        $("#importLedgersFile").value = "";
      }
    };
    reader.readAsText(file);
  }

  function importStockItemsCsv(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(reader.result);
        let added = 0;
        let updated = 0;
        let skipped = 0;
        rows.forEach((record) => {
          const name = csvValue(record, ["Name", "Item", "Item Name", "Stock Item"]).trim();
          if (!name) {
            skipped += 1;
            return;
          }
          const existing = state.stockItems.find((item) => item.name.toLowerCase() === name.toLowerCase());
          const item = cleanStockItem({
            id: existing ? existing.id : nextId(state, "stockItem", "S"),
            name,
            hsn: csvValue(record, ["HSN/SAC", "HSN", "SAC"]),
            unit: csvValue(record, ["Unit", "UOM"]) || "Nos",
            gstRate: csvValue(record, ["GST %", "GST", "GST Rate"]) || 0,
            openingQty: csvValue(record, ["Opening Qty", "Opening Quantity", "Opening Stock"]) || 0,
            openingRate: csvValue(record, ["Opening Rate", "Op Rate"]) || 0,
            purchaseRate: csvValue(record, ["Purchase Rate", "Cost Rate"]) || 0,
            saleRate: csvValue(record, ["Sale Rate", "Sales Rate", "Selling Rate"]) || 0,
            minStockLevel: csvValue(record, ["Minimum Stock", "Min Stock", "Min Stock Level", "Reorder Level"]) || 0
          });
          if (existing) {
            state.stockItems[state.stockItems.findIndex((row) => row.id === existing.id)] = item;
            updated += 1;
          } else {
            state.stockItems.push(item);
            added += 1;
          }
        });
        state = normalizeState(state);
        saveState();
        renderAll();
        showToast(`Stock import: ${added} added, ${updated} updated, ${skipped} skipped.`);
      } catch (error) {
        alertMessage("Stock item import failed: " + error.message);
      } finally {
        $("#importStockItemsFile").value = "";
      }
    };
    reader.readAsText(file);
  }

  function activeSectionId() {
    const active = $(".view.active");
    return active ? active.id : "dashboard";
  }

  function activeNavButton() {
    const active = activeSectionId();
    const section = VOUCHER_SECTIONS.includes(active) ? "vouchers" : active;
    return $(`.nav-link[data-section="${section}"]`) || $(".nav-link");
  }

  function visibleFocusable(container) {
    return Array.from(container.querySelectorAll(
      "button:not([disabled]), input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.offsetParent !== null;
    });
  }

  function formNavigationContainer(target) {
    const active = $(".view.active");
    if (!active || !active.contains(target)) return null;
    return target.closest("form") || active;
  }

  function visibleNavigationTargets(container) {
    return visibleFocusable(container).filter((element) => {
      return !element.classList.contains("nav-link")
        && element.type !== "hidden"
        && element.id !== "addSalesItemBtn"
        && element.id !== "addPurchaseItemBtn"
        && !element.classList.contains("remove-item-row");
    });
  }

  function cursorPosition(target) {
    try {
      return {
        start: target.selectionStart ?? 0,
        end: target.selectionEnd ?? target.selectionStart ?? 0,
        length: String(target.value || "").length
      };
    } catch (error) {
      return { start: 0, end: 0, length: String(target.value || "").length };
    }
  }

  function canMoveLeftFrom(target) {
    if (!target.matches("input, textarea")) return true;
    const pos = cursorPosition(target);
    return pos.start === 0 && pos.end === 0;
  }

  function canMoveRightFrom(target) {
    if (!target.matches("input, textarea")) return true;
    const pos = cursorPosition(target);
    return pos.start === pos.length && pos.end === pos.length;
  }

  function focusRelativeTarget(target, direction) {
    const container = formNavigationContainer(target);
    if (!container) return false;
    const focusables = visibleNavigationTargets(container);
    const index = focusables.indexOf(target);
    if (index === -1) return false;
    if (direction < 0 && index === 0) {
      focusActiveSidebarItem();
      return true;
    }
    const nextIndex = Math.max(0, Math.min(index + direction, focusables.length - 1));
    focusAndSelect(focusables[nextIndex]);
    return true;
  }

  function submitButtonForTarget(target) {
    const form = target && target.closest("form");
    if (!form) return null;
    return form.querySelector("button[type='submit']");
  }

  function shouldEnterGoToSave(target) {
    return [
      "paymentNarration",
      "receiptNarration",
      "contraNarration",
      "journalNarration"
    ].includes(target.id);
  }

  function focusFirstInActiveView() {
    const active = $(".view.active");
    if (!active) return;
    const first = visibleNavigationTargets(active)[0];
    focusAndSelect(first);
  }

  function focusFirstFormFieldInActiveView() {
    const active = $(".view.active");
    if (!active) return;
    const form = active.querySelector("form");
    const first = form ? visibleNavigationTargets(form)[0] : null;
    focusAndSelect(first || visibleNavigationTargets(active)[0]);
  }

  function focusActiveSidebarItem() {
    focusAndSelect(activeNavButton());
  }

  function handleSidebarKeyboard(event) {
    const target = event.target.closest(".nav-link");
    if (!target) return;

    const buttons = $$(".nav-link");
    const index = buttons.indexOf(target);
    let nextIndex = index;

    if (event.key === "ArrowDown") nextIndex = Math.min(index + 1, buttons.length - 1);
    else if (event.key === "ArrowUp" || event.key === "Backspace" || event.key === "ArrowLeft") nextIndex = Math.max(index - 1, 0);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = buttons.length - 1;
    else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusFirstInActiveView();
      return;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      target.click();
      return;
    } else {
      return;
    }

    event.preventDefault();
    buttons[nextIndex].focus();
    buttons[nextIndex].click();
  }

  function handleFormKeyboard(event) {
    if (event.defaultPrevented) return;
    if ($("#ledgerGroupModal").classList.contains("open")) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.target.closest(".item-entry-table")) return;
    const key = event.key;
    const target = event.target;
    if (!target.matches("button, input, select, textarea")) return;
    const container = formNavigationContainer(target);
    if (!container) return;

    if (key === "Enter") {
      if (event.shiftKey && target.tagName === "TEXTAREA") return;
      if (target.matches("button, [type='submit'], [type='button']")) {
        event.preventDefault();
        if (target.type === "submit" && target.form) {
          target.form.requestSubmit(target);
        } else {
          target.click();
        }
        return;
      }
      if (shouldEnterGoToSave(target)) {
        const submitButton = submitButtonForTarget(target);
        if (submitButton) {
          event.preventDefault();
          focusAndSelect(submitButton);
          return;
        }
      }
      event.preventDefault();
      focusRelativeTarget(target, 1);
      return;
    }

    if (event.shiftKey) return;

    if (key === "ArrowDown") {
      event.preventDefault();
      focusRelativeTarget(target, 1);
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      focusRelativeTarget(target, -1);
      return;
    }

    if (key === "ArrowRight") {
      event.preventDefault();
      focusRelativeTarget(target, 1);
      return;
    }

    if (key === "ArrowLeft") {
      event.preventDefault();
      focusRelativeTarget(target, -1);
      return;
    }

    if (key === "Backspace" && shouldBackspaceNavigate(target)) {
      event.preventDefault();
      focusRelativeTarget(target, -1);
    }
  }

  function submitActiveForm() {
    const section = activeSectionId();
    const form = {
      company: "#companyForm",
      ledgers: "#ledgerForm",
      sales: "#salesForm",
      purchase: "#purchaseForm",
      payment: "#paymentForm",
      contra: "#contraForm",
      receipt: "#receiptForm",
      journal: "#journalForm"
    }[section];
    if (form) $(form).requestSubmit();
  }

  function handleKeyboardShortcut(event) {
    if ($("#ledgerGroupModal").classList.contains("open")) return;
    const key = event.key;
    const sectionByKey = {
      F1: "dashboard",
      F2: "company",
      F3: "ledgers",
      F4: "all-entries",
      F5: "payment",
      F6: "receipt",
      F7: "contra",
      F8: "sales",
      F9: "purchase",
      F10: "trial-balance"
    };

    if (sectionByKey[key]) {
      event.preventDefault();
      navigateTo(sectionByKey[key]);
      return;
    }

    if (event.ctrlKey && (key === "Enter" || key.toLowerCase() === "s" || key.toLowerCase() === "a")) {
      event.preventDefault();
      submitActiveForm();
      return;
    }

    if (event.ctrlKey && key.toLowerCase() === "p" && activeSectionId() === "sales") {
      event.preventDefault();
      handlePrintCurrentSales();
      return;
    }

    if (event.ctrlKey && key.toLowerCase() === "p" && activeSectionId() === "purchase") {
      event.preventDefault();
      handlePrintCurrentPurchase();
      return;
    }

    if (event.ctrlKey && key.toLowerCase() === "p" && activeSectionId() === "payment") {
      event.preventDefault();
      handlePrintCurrentPayment();
      return;
    }

    if (event.ctrlKey && key.toLowerCase() === "p" && activeSectionId() === "contra") {
      event.preventDefault();
      handlePrintCurrentContra();
      return;
    }

    if (event.ctrlKey && key.toLowerCase() === "p" && activeSectionId() === "receipt") {
      event.preventDefault();
      handlePrintCurrentReceipt();
      return;
    }

    if (event.ctrlKey && key.toLowerCase() === "p" && activeSectionId() === "journal") {
      event.preventDefault();
      handlePrintCurrentJournal();
      return;
    }

    if (event.altKey && key.toLowerCase() === "m") {
      event.preventDefault();
      focusActiveSidebarItem();
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      focusActiveSidebarItem();
      return;
    }
  }

  function handleAllEntryTableKeyboard(event) {
    const row = event.target.closest(".entry-row");
    if (!row) return;
    const rows = Array.from($("#allEntryTable").querySelectorAll(".entry-row"));
    const index = rows.indexOf(row);
    if (index === -1) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = rows[Math.min(index + 1, rows.length - 1)];
      previewAllEntry(next.dataset.id);
      setTimeout(() => focusAllEntryRow(next.dataset.id), 0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const previous = rows[Math.max(index - 1, 0)];
      previewAllEntry(previous.dataset.id);
      setTimeout(() => focusAllEntryRow(previous.dataset.id), 0);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      previewAllEntry(row.dataset.id);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "p") {
      event.preventDefault();
      const tx = state.transactions.find((item) => item.id === row.dataset.id);
      printTransaction(tx);
    }
  }

  function handleInvoiceTableKeyboard(event) {
    const row = event.target.closest(".invoice-row");
    if (!row) return;
    const rows = Array.from($("#invoiceTable").querySelectorAll(".invoice-row"));
    const index = rows.indexOf(row);
    if (index === -1) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = rows[Math.min(index + 1, rows.length - 1)];
      previewInvoice(next.dataset.id);
      setTimeout(() => focusInvoiceRow(next.dataset.id), 0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const previous = rows[Math.max(index - 1, 0)];
      previewInvoice(previous.dataset.id);
      setTimeout(() => focusInvoiceRow(previous.dataset.id), 0);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      previewInvoice(row.dataset.id);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "p") {
      event.preventDefault();
      const tx = state.transactions.find((item) => item.id === row.dataset.id);
      printTransaction(tx);
    }
  }

  function handleVoucherTabKeyboard(event) {
    const button = event.target.closest(".voucher-tabs button");
    if (!button) return;
    const tabs = Array.from(button.closest(".voucher-tabs").querySelectorAll("button"));
    const index = tabs.indexOf(button);
    if (index === -1) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      button.click();
      setTimeout(focusFirstFormFieldInActiveView, 0);
      return;
    }
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = Math.min(index + 1, tabs.length - 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "Backspace") {
      nextIndex = Math.max(index - 1, 0);
    } else {
      return;
    }
    event.preventDefault();
    tabs[nextIndex].focus();
  }

  function shouldAutoCapitalizeField(field) {
    if (!field || field.readOnly || field.disabled) return false;
    const tag = field.tagName ? field.tagName.toLowerCase() : "";
    if (tag !== "input" && tag !== "textarea") return false;
    const type = (field.type || "text").toLowerCase();
    if (["email", "password", "number", "date", "time", "hidden", "file", "tel", "url"].includes(type)) return false;
    const id = String(field.id || "").toLowerCase();
    const name = String(field.name || "").toLowerCase();
    const skipWords = ["gst", "gstin", "hsn", "upi", "email", "phone", "password", "voucher", "prefix", "search", "reference", "ref", "ifsc", "pan"];
    return !skipWords.some((word) => id.includes(word) || name.includes(word));
  }

  function titleCaseWords(value) {
    return String(value || "").replace(/(^|\s)([a-z])/g, (match, space, letter) => space + letter.toUpperCase());
  }

  function applyAutoCapitalization(event) {
    const field = event.target;
    if (!shouldAutoCapitalizeField(field)) return;
    const nextValue = titleCaseWords(field.value);
    if (nextValue === field.value) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    field.value = nextValue;
    if (typeof start === "number" && typeof end === "number") {
      field.setSelectionRange(start, end);
    }
  }

  function bindEvents() {
    document.addEventListener("input", applyAutoCapitalization);

    $$(".nav-link").forEach((button) => {
      button.addEventListener("click", () => navigateTo(button.dataset.section));
      button.addEventListener("keydown", handleSidebarKeyboard);
    });

    document.addEventListener("click", (event) => {
      const goButton = event.target.closest("[data-go-section]");
      if (goButton) {
        navigateTo(goButton.dataset.goSection);
        setTimeout(focusFirstFormFieldInActiveView, 0);
        return;
      }

      const button = event.target.closest("[data-action]");
      if (!button) return;
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (action === "edit-ledger") editLedger(id);
      if (action === "delete-ledger") deleteLedger(id);
      if (action === "report-ledger") openLedgerReport(id);
      if (action === "edit-stock-item") editStockItem(id);
      if (action === "delete-stock-item") deleteStockItem(id);
      if (action === "open-company-book") openCompanyBook(id);
      if (action === "delete-company-book") deleteCompanyBook(id);
      if (action === "preview-tx") previewAllEntry(id);
      if (action === "preview-invoice") previewInvoice(id);
      if (action === "edit-tx") editTransaction(id);
      if (action === "delete-tx") deleteTransaction(id);
      if (action === "outstanding-ledger") openLedgerReport(id);
      if (action === "outstanding-receipt") openSettlementFromOutstanding("receipt", id, button.dataset.amount);
      if (action === "outstanding-payment") openSettlementFromOutstanding("payment", id, button.dataset.amount);
      if (action === "invoice-outstanding-receipt") openSettlementFromInvoiceOutstanding("receipt", id, button.dataset.partyId, button.dataset.amount);
      if (action === "invoice-outstanding-payment") openSettlementFromInvoiceOutstanding("payment", id, button.dataset.partyId, button.dataset.amount);
      if (action === "audit-open-tx") editTransaction(id);
      if (action === "audit-open-stock") navigateTo("stock-items");
      if (action === "select-open-voucher") applyOpenVoucherToSettlement(button.dataset.type, id, button.dataset.amount);
      if (action === "edit-custom-field") editCustomField(id);
      if (action === "delete-custom-field") deleteCustomField(id);
      if (action === "edit-custom-button") editCustomButton(id);
      if (action === "delete-custom-button") deleteCustomButton(id);
      if (action === "custom-button") executeCustomButton(id);
      if (action === "print-tx") {
        const tx = state.transactions.find((item) => item.id === id);
        printTransaction(tx);
      }
    });

    $("#companyForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        const name = $("#companyName").value.trim();
        if (!name) {
          alertMessage("Company name is required.");
          return;
        }
        const companyId = state.company && state.company.id ? state.company.id : nextCompanyId();
        const upiId = $("#companyUpiId").value.trim();
        const paymentName = $("#companyPaymentName").value.trim();
        const upiQrDataUrl = companyUpiQrDraft || (upiId ? createUpiQrDataUrl(upiId, paymentName || name) : "");
        state.company = {
          id: companyId,
          name,
          gstin: $("#companyGstin").value.trim().toUpperCase(),
          phone: $("#companyPhone").value.trim(),
          state: $("#companyState").value,
          address: $("#companyAddress").value.trim(),
          bankDetails: $("#companyBankDetails").value.trim(),
          upiId,
          paymentName,
          logoDataUrl: companyLogoDraft,
          signatureDataUrl: companySignatureDraft,
          upiQrDataUrl,
          voucherPrefixes: readVoucherPrefixInputs(),
          terms: $("#companyTerms").value.trim(),
          declaration: $("#companyDeclaration").value.trim(),
          customFields: readCustomFields("company")
        };
        saveState();
        renderAll();
        showToast("Company saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#uploadLogoBtn").addEventListener("click", () => $("#companyLogoFile").click());
    $("#uploadSignatureBtn").addEventListener("click", () => $("#companySignatureFile").click());
    $("#generateUpiQrBtn").addEventListener("click", generateCompanyUpiQr);
    $("#uploadUpiQrBtn").addEventListener("click", () => $("#companyUpiQrFile").click());
    $("#clearLogoBtn").addEventListener("click", () => {
      companyLogoDraft = "";
      syncCompanyImagePreviews();
      showToast("Logo cleared. Press Save Company to store this change.");
    });
    $("#clearSignatureBtn").addEventListener("click", () => {
      companySignatureDraft = "";
      syncCompanyImagePreviews();
      showToast("Signature cleared. Press Save Company to store this change.");
    });
    $("#clearUpiQrBtn").addEventListener("click", () => {
      companyUpiQrDraft = "";
      syncCompanyImagePreviews();
      showToast("UPI QR cleared. Press Save Company to store this change.");
    });
    $("#companyLogoFile").addEventListener("change", () => readCompanyImageFile("companyLogoFile", (value) => { companyLogoDraft = value; }));
    $("#companySignatureFile").addEventListener("change", () => readCompanyImageFile("companySignatureFile", (value) => { companySignatureDraft = value; }));
    $("#companyUpiQrFile").addEventListener("change", () => readCompanyImageFile("companyUpiQrFile", (value) => { companyUpiQrDraft = value; }));

    $("#reloadCompanyBtn").addEventListener("click", () => {
      const panel = $("#companyLoadPanel");
      panel.hidden = !panel.hidden;
      renderCompanyBooks();
      showToast(panel.hidden ? "Company list closed." : "Saved companies loaded.");
    });
    $("#newCompanyBtn").addEventListener("click", clearCompanyForm);
    $("#closeStartupGatewayBtn").addEventListener("click", hideStartupGateway);
    $("#startupContinueBtn").addEventListener("click", hideStartupGateway);
    $("#startupCreateCompanyBtn").addEventListener("click", () => {
      hideStartupGateway();
      clearCompanyForm();
      navigateTo("company");
      focusAndSelect($("#companyName"));
    });
    $("#startupRestoreBtn").addEventListener("click", () => $("#restoreFileInput").click());

    $("#stockItemForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        saveStockItemFromForm();
      } catch (error) {
        alertMessage(error.message);
      }
    });
    $("#clearStockItemBtn").addEventListener("click", clearStockItemForm);

    $("#resetDemoBtn").addEventListener("click", resetDemoData);
    $("#createSalesPartyBtn").addEventListener("click", () => openQuickLedgerModal("sales"));
    $("#createPurchasePartyBtn").addEventListener("click", () => openQuickLedgerModal("purchase"));
    $("#salesCustomer").addEventListener("change", () => updatePartyDetails("sales"));
    $("#purchaseSupplier").addEventListener("change", () => updatePartyDetails("purchase"));
    $("#salesPartyState").addEventListener("change", () => updateItemTotals("sales"));
    $("#purchasePartyState").addEventListener("change", () => updateItemTotals("purchase"));
    $("#companyState").addEventListener("change", () => {
      updateItemTotals("sales");
      updateItemTotals("purchase");
    });
    $("#closeGroupModalBtn").addEventListener("click", closeQuickLedgerModal);
    $("#cancelQuickLedgerBtn").addEventListener("click", closeQuickLedgerModal);
    $("#saveQuickLedgerBtn").addEventListener("click", saveQuickLedger);
    $("#groupSearchInput").addEventListener("input", () => {
      selectedQuickGroupIndex = 0;
      renderQuickGroupList();
    });
    $("#quickGroupList").addEventListener("click", (event) => {
      const option = event.target.closest(".group-option");
      if (!option) return;
      setSelectedQuickGroup(Number(option.dataset.groupIndex));
    });
    $("#quickGroupList").addEventListener("dblclick", (event) => {
      const option = event.target.closest(".group-option");
      if (!option) return;
      setSelectedQuickGroup(Number(option.dataset.groupIndex));
      saveQuickLedger();
    });
    $("#ledgerGroupModal").addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeQuickLedgerModal();
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveQuickLedger();
        return;
      }
      handleQuickLedgerFormKeyboard(event);
      if (!event.defaultPrevented) handleQuickGroupKeyboard(event);
    });

    $("#ledgerForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        const name = $("#ledgerName").value.trim();
        const group = ledgerGroupByName($("#ledgerType").value);
        const type = group ? group.type : "";
        if (!name) {
          alertMessage("Ledger name is required.");
          return;
        }
        if (!group || !LEDGER_TYPES.includes(type)) {
          alertMessage("Select a valid ledger group.");
          return;
        }

        const editId = $("#ledgerEditId").value;
        const duplicate = state.ledgers.find((ledger) => ledger.name.toLowerCase() === name.toLowerCase() && ledger.id !== editId);
        if (duplicate) {
          alertMessage("A ledger with this name already exists.");
          return;
        }

        const ledger = {
          id: editId || nextId(state, "ledger", "L"),
          name,
          type,
          groupName: group.name,
          gstin: $("#ledgerGstin").value.trim().toUpperCase(),
          phone: $("#ledgerPhone").value.trim(),
          address: $("#ledgerAddress").value.trim(),
          state: $("#ledgerState").value,
          openingBalance: parseAmount($("#ledgerOpeningBalance").value),
          openingSide: $("#ledgerOpeningSide").value === "Cr" ? "Cr" : "Dr",
          customFields: readCustomFields("ledgers")
        };

        if (editId) {
          const index = state.ledgers.findIndex((item) => item.id === editId);
          state.ledgers[index] = ledger;
          showToast("Ledger updated.");
        } else {
          state.ledgers.push(ledger);
          showToast("Ledger added.");
        }

        saveState();
        clearLedgerForm();
        renderAll();
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#clearLedgerBtn").addEventListener("click", clearLedgerForm);

    $("#customFieldForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertCustomFieldFromForm();
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#customButtonForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertCustomButtonFromForm();
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#clearCustomFieldBtn").addEventListener("click", clearCustomFieldForm);
    $("#clearCustomButtonBtn").addEventListener("click", clearCustomButtonForm);

    $("#salesForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertTransaction(collectSalesForm());
        clearSalesForm();
        showToast(transactionLabel(salesVoucherMode) + " saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#purchaseForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertTransaction(collectPurchaseForm());
        clearPurchaseForm();
        showToast(transactionLabel(purchaseVoucherMode) + " saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#paymentForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertTransaction(collectPaymentForm());
        clearPaymentForm();
        showToast("Payment voucher saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#contraForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertTransaction(collectContraForm());
        clearContraForm();
        showToast("Contra voucher saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#receiptForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertTransaction(collectReceiptForm());
        clearReceiptForm();
        showToast("Receipt voucher saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#journalForm").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        upsertTransaction(collectJournalForm());
        clearJournalForm();
        showToast("Journal voucher saved.");
      } catch (error) {
        alertMessage(error.message);
      }
    });
    $("#journalTransferDirection").addEventListener("change", updateJournalTransferHint);
    $("#fillJournalTransferBtn").addEventListener("click", () => {
      try {
        fillJournalTransfer();
        showToast("Journal transfer filled.");
      } catch (error) {
        alertMessage(error.message);
      }
    });
    $("#saveJournalTransferBtn").addEventListener("click", () => {
      try {
        saveJournalTransfer();
      } catch (error) {
        alertMessage(error.message);
      }
    });

    $("#clearSalesBtn").addEventListener("click", clearSalesForm);
    $("#clearPurchaseBtn").addEventListener("click", clearPurchaseForm);
    $("#clearPaymentBtn").addEventListener("click", clearPaymentForm);
    $("#clearContraBtn").addEventListener("click", clearContraForm);
    $("#clearReceiptBtn").addEventListener("click", clearReceiptForm);
    $("#clearJournalBtn").addEventListener("click", clearJournalForm);
    $("#printSalesBtn").addEventListener("click", handlePrintCurrentSales);
    $("#printPurchaseBtn").addEventListener("click", handlePrintCurrentPurchase);
    $("#printPaymentBtn").addEventListener("click", handlePrintCurrentPayment);
    $("#printContraBtn").addEventListener("click", handlePrintCurrentContra);
    $("#printReceiptBtn").addEventListener("click", handlePrintCurrentReceipt);
    $("#printJournalBtn").addEventListener("click", handlePrintCurrentJournal);
    $("#paymentParty").addEventListener("change", () => updateSettlementOutstanding("payment"));
    $("#paymentAmount").addEventListener("input", () => updateSettlementOutstanding("payment"));
    $("#paymentAdjustVoucher").addEventListener("change", () => handleAdjustmentSelectChange("payment"));
    $("#receiptParty").addEventListener("change", () => updateSettlementOutstanding("receipt"));
    $("#receiptAmount").addEventListener("input", () => updateSettlementOutstanding("receipt"));
    $("#receiptAdjustVoucher").addEventListener("change", () => handleAdjustmentSelectChange("receipt"));

    ["sales", "purchase"].forEach((prefix) => {
      ["Search", "Party", "Item", "From", "To"].forEach((suffix) => {
        const input = $("#" + prefix + "Register" + suffix);
        if (!input) return;
        input.addEventListener(suffix === "Party" ? "change" : "input", prefix === "sales" ? renderSales : renderPurchase);
      });
    });
    $("#clearSalesRegisterFilter").addEventListener("click", () => {
      ["Search", "Party", "Item", "From", "To"].forEach((suffix) => { $("#salesRegister" + suffix).value = ""; });
      renderSales();
      focusAndSelect($("#salesRegisterSearch"));
    });
    $("#clearPurchaseRegisterFilter").addEventListener("click", () => {
      ["Search", "Party", "Item", "From", "To"].forEach((suffix) => { $("#purchaseRegister" + suffix).value = ""; });
      renderPurchase();
      focusAndSelect($("#purchaseRegisterSearch"));
    });

    $("#addSalesItemBtn").addEventListener("click", () => addItemRow("sales"));
    $("#addPurchaseItemBtn").addEventListener("click", () => addItemRow("purchase"));
    $("#salesItemsBody").addEventListener("input", (event) => handleInventoryItemsInput("sales", event));
    $("#salesItemsBody").addEventListener("focusin", handleSalesItemsFocus);
    $("#purchaseItemsBody").addEventListener("input", (event) => handleInventoryItemsInput("purchase", event));
    $("#purchaseItemsBody").addEventListener("focusin", handleSalesItemsFocus);
    $("#salesItemsBody").addEventListener("keydown", (event) => handleItemKeyboard("sales", event));
    $("#purchaseItemsBody").addEventListener("keydown", (event) => handleItemKeyboard("purchase", event));
    $("#salesItemsBody").addEventListener("click", (event) => {
      const button = event.target.closest(".remove-item-row");
      if (!button) return;
      removeItemRow("sales", button.closest("tr"));
    });
    $("#purchaseItemsBody").addEventListener("click", (event) => {
      const button = event.target.closest(".remove-item-row");
      if (!button) return;
      removeItemRow("purchase", button.closest("tr"));
    });
    $("#salesProductPicker").addEventListener("mousedown", (event) => event.preventDefault());
    $("#salesProductPicker").addEventListener("click", (event) => {
      const option = event.target.closest(".product-option");
      if (!option) return;
      const product = activeSalesProductMatches[Number(option.dataset.index)];
      selectSalesProduct(product);
    });

    $("#ledgerReportSelect").addEventListener("change", renderLedgerReport);
    $("#refreshTodayBtn").addEventListener("click", renderTodayEntries);
    $("#allEntrySearch").addEventListener("input", renderAllEntries);
    $("#clearAllEntrySearchBtn").addEventListener("click", () => {
      $("#allEntrySearch").value = "";
      renderAllEntries();
      focusAndSelect($("#allEntrySearch"));
    });
    $("#allEntryPrintBtn").addEventListener("click", () => {
      const tx = state.transactions.find((item) => item.id === $("#allEntryPrintBtn").dataset.id);
      printTransaction(tx);
    });
    $("#allEntryEditBtn").addEventListener("click", () => {
      const id = $("#allEntryEditBtn").dataset.id;
      if (id) editTransaction(id);
    });
    $("#allEntryTable").addEventListener("keydown", handleAllEntryTableKeyboard);
    $("#outstandingSearch").addEventListener("input", renderOutstandingReport);
    $("#outstandingType").addEventListener("change", renderOutstandingReport);
    $("#outstandingAsOn").addEventListener("change", renderOutstandingReport);
    $("#clearOutstandingSearchBtn").addEventListener("click", () => {
      $("#outstandingSearch").value = "";
      $("#outstandingType").value = "all";
      renderOutstandingReport();
      focusAndSelect($("#outstandingSearch"));
    });
    $("#invoiceOutstandingSearch").addEventListener("input", renderInvoiceOutstandingReport);
    $("#invoiceOutstandingType").addEventListener("change", renderInvoiceOutstandingReport);
    $("#invoiceOutstandingDueDays").addEventListener("input", renderInvoiceOutstandingReport);
    $("#invoiceOutstandingAsOn").addEventListener("change", renderInvoiceOutstandingReport);
    $("#clearInvoiceOutstandingBtn").addEventListener("click", () => {
      $("#invoiceOutstandingSearch").value = "";
      $("#invoiceOutstandingType").value = "all";
      $("#invoiceOutstandingDueDays").value = "30";
      $("#invoiceOutstandingAsOn").value = today();
      renderInvoiceOutstandingReport();
      focusAndSelect($("#invoiceOutstandingSearch"));
    });
    $("#dayBookSearch").addEventListener("input", renderDayBook);
    $("#dayBookType").addEventListener("change", renderDayBook);
    $("#clearDayBookSearchBtn").addEventListener("click", () => {
      $("#dayBookSearch").value = "";
      $("#dayBookType").value = "all";
      renderDayBook();
      focusAndSelect($("#dayBookSearch"));
    });
    $("#cashBankLedger").addEventListener("change", renderCashBankBook);
    $("#stockLedgerItem").addEventListener("change", renderStockLedger);
    $("#stockLedgerFrom").addEventListener("change", renderStockLedger);
    $("#stockLedgerTo").addEventListener("change", renderStockLedger);
    $("#clearStockLedgerBtn").addEventListener("click", () => {
      $("#stockLedgerFrom").value = "";
      $("#stockLedgerTo").value = "";
      renderStockLedger();
      focusAndSelect($("#stockLedgerItem"));
    });
    $("#ageingType").addEventListener("change", renderAgeingReport);
    $("#ageingAsOn").addEventListener("change", renderAgeingReport);
    $("#clearAgeingFilterBtn").addEventListener("click", () => {
      $("#ageingType").value = "all";
      $("#ageingAsOn").value = today();
      renderAgeingReport();
    });
    $("#auditSearch").addEventListener("input", renderAuditCheck);
    $("#auditType").addEventListener("change", renderAuditCheck);
    $("#auditSeverity").addEventListener("change", renderAuditCheck);
    $("#clearAuditFilterBtn").addEventListener("click", () => {
      $("#auditSearch").value = "";
      $("#auditType").value = "all";
      $("#auditSeverity").value = "all";
      renderAuditCheck();
      focusAndSelect($("#auditSearch"));
    });
    $("#invoiceSearch").addEventListener("input", renderInvoices);
    $("#clearInvoiceSearchBtn").addEventListener("click", () => {
      $("#invoiceSearch").value = "";
      renderInvoices();
      focusAndSelect($("#invoiceSearch"));
    });
    $("#invoicePrintBtn").addEventListener("click", () => {
      const tx = state.transactions.find((item) => item.id === $("#invoicePrintBtn").dataset.id);
      printTransaction(tx);
    });
    $("#invoicePreviewPrintBtn").addEventListener("click", () => {
      const tx = state.transactions.find((item) => item.id === $("#invoicePreviewPrintBtn").dataset.id);
      printTransaction(tx);
    });
    $("#invoiceEditBtn").addEventListener("click", () => {
      const id = $("#invoiceEditBtn").dataset.id;
      if (id) editTransaction(id);
    });
    $("#invoiceTable").addEventListener("keydown", handleInvoiceTableKeyboard);
    $("#gstSearch").addEventListener("input", renderGstReports);
    $("#gstSupplyType").addEventListener("change", renderGstReports);
    $("#clearGstFilterBtn").addEventListener("click", () => {
      $("#gstSearch").value = "";
      $("#gstSupplyType").value = "all";
      renderGstReports();
      focusAndSelect($("#gstSearch"));
    });
    $$(".voucher-tabs").forEach((tabs) => tabs.addEventListener("keydown", handleVoucherTabKeyboard));
    $$(".report-date-from").forEach((input) => input.addEventListener("change", () => updateReportPeriod(input.value, reportDateTo)));
    $$(".report-date-to").forEach((input) => input.addEventListener("change", () => updateReportPeriod(reportDateFrom, input.value)));
    $$("[data-report-refresh]").forEach((button) => button.addEventListener("click", () => {
      const panel = button.closest(".report-filter") || document;
      const from = panel.querySelector(".report-date-from");
      const to = panel.querySelector(".report-date-to");
      updateReportPeriod(from ? from.value : reportDateFrom, to ? to.value : reportDateTo);
    }));
    $("#backupDataBtn").addEventListener("click", downloadBackup);
    $("#restoreDataBtn").addEventListener("click", () => $("#restoreFileInput").click());
    $("#restoreFileInput").addEventListener("change", (event) => restoreBackupFile(event.target.files[0]));
    $("#exportLedgersBtn").addEventListener("click", exportLedgersCsv);
    $("#exportStockItemsBtn").addEventListener("click", exportStockItemsCsv);
    $("#exportLedgerReportBtn").addEventListener("click", exportLedgerReportCsv);
    $("#exportDayBookBtn").addEventListener("click", exportDayBookCsv);
    $("#exportItemProfitBtn").addEventListener("click", exportItemProfitCsv);
    $("#exportOutstandingBtn").addEventListener("click", exportOutstandingCsv);
    $("#exportStockSummaryBtn").addEventListener("click", exportStockSummaryCsv);
    $("#exportGstBtn").addEventListener("click", exportGstCsv);
    $("#importLedgersBtn").addEventListener("click", () => $("#importLedgersFile").click());
    $("#importStockItemsBtn").addEventListener("click", () => $("#importStockItemsFile").click());
    $("#importLedgersFile").addEventListener("change", (event) => importLedgersCsv(event.target.files[0]));
    $("#importStockItemsFile").addEventListener("change", (event) => importStockItemsCsv(event.target.files[0]));
    $("#refreshAuditBtn").addEventListener("click", renderAuditCheck);
    $("#exportAuditBtn").addEventListener("click", exportAuditCsv);
    $("#repairAuditBtn").addEventListener("click", safeRepairAuditData);
    $("#refreshLedgerReportBtn").addEventListener("click", renderLedgerReport);
    $("#refreshItemProfitBtn").addEventListener("click", renderItemProfitReport);
    $("#refreshDayBookBtn").addEventListener("click", renderDayBook);
    $("#refreshCashBankBtn").addEventListener("click", renderCashBankBook);
    $("#refreshInvoiceOutstandingBtn").addEventListener("click", renderInvoiceOutstandingReport);
    $("#refreshStockLedgerBtn").addEventListener("click", renderStockLedger);
    $("#refreshAgeingBtn").addEventListener("click", renderAgeingReport);
    $("#refreshTrialBtn").addEventListener("click", renderTrialBalance);
    $("#refreshPnlBtn").addEventListener("click", renderProfitLoss);
    $("#refreshBalanceBtn").addEventListener("click", renderBalanceSheet);
    $("#refreshGstBtn").addEventListener("click", renderGstReports);

    $("#fullscreenBtn").addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((error) => alertMessage("Fullscreen failed: " + error.message));
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      $("#fullscreenBtn").textContent = document.fullscreenElement ? "Exit Full Screen" : "Full Screen";
    });

    document.addEventListener("keydown", handleKeyboardShortcut);
    document.addEventListener("keydown", handleFormKeyboard);
    document.addEventListener("click", (event) => {
      if (
        event.target.closest("#salesProductPicker")
        || event.target.closest("#salesItemsBody .item-name")
        || event.target.closest("#purchaseItemsBody .item-name")
      ) return;
      hideSalesProductPicker();
    });
    window.addEventListener("resize", renderSalesProductPicker);
    $(".content").addEventListener("scroll", renderSalesProductPicker);

    window.addEventListener("afterprint", () => {
      document.body.classList.remove("is-printing");
    });
  }

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    try {
      bindEvents();
      saveActiveCompanyBook();
      populateSelects();
      fillCompanyForm();
      clearLedgerForm();
      clearStockItemForm();
      clearSalesForm();
      clearPurchaseForm();
      clearPaymentForm();
      clearContraForm();
      clearReceiptForm();
      clearJournalForm();
      clearCustomFieldForm();
      clearCustomButtonForm();
      renderAll();
      showStartupGateway();
      hydrateFromBackend();
    } catch (error) {
      console.error(error);
      alertMessage("Speed Accounting start nahi ho paya: " + error.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);


// Simple login gate
document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("loginGateway");
  const btn = document.getElementById("loginBtn");
  if (!gate || !btn) return;

  if (localStorage.getItem("speedLogin") === "yes") {
    gate.classList.remove("active");
  }

  btn.onclick = () => {
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value.trim();

    if (u && p) {
      localStorage.setItem("speedLogin","yes");
      gate.classList.remove("active");
    } else {
      alert("Username and password required");
    }
  };
});
