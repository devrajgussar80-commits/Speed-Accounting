(function (global) {
  "use strict";

  const USER_KEY = "hisaabProRentalUser";
  const PLANS = {
    monthly: { label: "Monthly", amount: 399 },
    quarterly: { label: "Quarterly", amount: 1099 },
    semi_annual: { label: "6 Months", amount: 2050 },
    annual: { label: "Annual", amount: 4199 },
    lifetime: { label: "Lifetime", amount: 30000 }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const backendEnabled = typeof location !== "undefined" && /^https?:$/.test(location.protocol);
  let user = loadUser();
  let subscription = null;
  let selectedPlan = "monthly";

  function loadUser() {
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      return parsed && parsed.token ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function saveUser(nextUser) {
    user = nextUser && nextUser.token ? nextUser : null;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    renderStatus();
  }

  async function request(path, options) {
    const headers = { "Content-Type": "application/json", ...((options && options.headers) || {}) };
    if (user && user.token) headers.Authorization = "Bearer " + user.token;
    const response = await fetch(path, { ...options, headers });
    const data = await response.json();
    if (!response.ok || data.ok === false) throw new Error(data.error || "Request failed.");
    return data;
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
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function toast(message) {
    const node = $("#toast");
    if (!node) {
      alert(message);
      return;
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2400);
  }

  function renderStatus() {
    const pill = $("#rentalStatus");
    const box = $("#subscriptionBox");
    const logout = $("#logoutRentalBtn");
    if (!pill || !box) return;
    pill.classList.remove("local", "online", "offline", "syncing", "paid");
    if (!user) {
      pill.textContent = "Rental: Not signed in";
      pill.classList.add("local");
      box.innerHTML = "<strong>Not signed in</strong><span>Login or create account to activate paid rental.</span>";
      if (logout) logout.hidden = true;
      return;
    }
    if (subscription && subscription.status === "active") {
      const label = (PLANS[subscription.plan] || {}).label || subscription.plan;
      pill.textContent = "Rental: " + label;
      pill.classList.add("paid");
      box.innerHTML = `<strong>${escapeHtml(user.name || user.email)}</strong><span>Active ${escapeHtml(label)} plan till ${escapeHtml(formatDate(subscription.expiresAt))}.</span>`;
    } else {
      pill.textContent = "Rental: Payment due";
      pill.classList.add("offline");
      box.innerHTML = `<strong>${escapeHtml(user.name || user.email)}</strong><span>No active subscription. Choose a plan and pay with Razorpay.</span>`;
    }
    if (logout) logout.hidden = false;
  }

  function setTab(tab) {
    const login = tab !== "register";
    $$("[data-rental-tab]").forEach((button) => button.classList.toggle("active", button.dataset.rentalTab === tab || (login && button.dataset.rentalTab === "login")));
    $("#rentalLoginForm").classList.toggle("active", login);
    $("#rentalRegisterForm").classList.toggle("active", !login);
  }

  function openModal() {
    const modal = $("#rentalModal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    renderStatus();
  }

  function closeModal() {
    const modal = $("#rentalModal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function openDashboardAfterActivation() {
    const dashboardNav = document.querySelector('[data-section="dashboard"]');
    if (dashboardNav) dashboardNav.click();
    const gateway = $("#startupGateway");
    if (gateway) gateway.classList.remove("active");
  }

  async function refreshSubscription() {
    if (!backendEnabled || !user) {
      subscription = null;
      renderStatus();
      return;
    }
    try {
      subscription = await request("/api/subscription/status", {
        method: "POST",
        body: JSON.stringify({})
      });
    } catch (error) {
      console.warn("Subscription check failed:", error);
      subscription = null;
    }
    renderStatus();
  }

  async function auth(mode) {
    if (!backendEnabled) throw new Error("Backend se app open karo: http://127.0.0.1:8765/");
    const register = mode === "register";
    const payload = register ? {
      name: $("#registerName").value.trim(),
      email: $("#registerEmail").value.trim(),
      phone: $("#registerPhone").value.trim(),
      password: $("#registerPassword").value
    } : {
      email: $("#loginEmail").value.trim(),
      password: $("#loginPassword").value
    };
    const data = await request(register ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    saveUser(data.user);
    await refreshSubscription();
    toast(register ? "Account created." : "Login successful.");
  }

  function selectPlan(plan) {
    if (!PLANS[plan]) return;
    selectedPlan = plan;
    $$("#rentalPlanGrid .plan-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.plan === plan);
    });
  }

  async function pay() {
    if (!backendEnabled) throw new Error("Backend start karke http://127.0.0.1:8765/ se app open karo.");
    if (!user) {
      setTab("login");
      openModal();
      throw new Error("Payment se pehle login ya register karo.");
    }
    if (typeof global.Razorpay !== "function") {
      throw new Error("Razorpay checkout load nahi hua. Internet connection check karo.");
    }
    const order = await request("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: selectedPlan })
    });
    const checkout = new global.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.name || "Hisaab Pro",
      description: order.description || "Subscription",
      order_id: order.orderId,
      prefill: {
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || ""
      },
      theme: { color: "#28d3b6" },
      handler: async (response) => {
        await request("/api/payment/verify", {
          method: "POST",
          body: JSON.stringify({
            plan: selectedPlan,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })
        });
        await refreshSubscription();
        closeModal();
        openDashboardAfterActivation();
        toast("Your licence succesfully activate");
      },
      modal: {
        ondismiss: () => toast("Payment window closed.")
      }
    });
    checkout.open();
  }

  function bind() {
    if (!$("#rentalBtn")) return;
    $("#rentalBtn").addEventListener("click", openModal);
    $("#closeRentalBtn").addEventListener("click", closeModal);
    $("#rentalModal").addEventListener("click", (event) => {
      if (event.target.id === "rentalModal") closeModal();
    });
    $("#rentalModal").addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
    $$("[data-rental-tab]").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.rentalTab)));
    $("#rentalLoginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await auth("login");
      } catch (error) {
        alert(error.message);
      }
    });
    $("#rentalRegisterForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await auth("register");
      } catch (error) {
        alert(error.message);
      }
    });
    $("#rentalPlanGrid").addEventListener("click", (event) => {
      const card = event.target.closest("[data-plan]");
      if (card) selectPlan(card.dataset.plan);
    });
    $("#payRentalBtn").addEventListener("click", async () => {
      try {
        await pay();
      } catch (error) {
        alert(error.message);
      }
    });
    $("#logoutRentalBtn").addEventListener("click", () => {
      subscription = null;
      saveUser(null);
      toast("Logged out.");
    });
    renderStatus();
    refreshSubscription();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})(window);
