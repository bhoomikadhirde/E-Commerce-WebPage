// ==========================
// CART UTILITY FUNCTIONS
// ==========================
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

// ==========================
// ADD TO CART (INDEX PAGE)
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            const product = {
                name: btn.dataset.name,
                price: Number(btn.dataset.price),
                image: btn.dataset.image,
                quantity: 1
            };

            let cart = getCart();
            let existing = cart.find(item => item.name === product.name);

            if (existing) {
                existing.quantity++;
            } else {
                cart.push(product);
            }

            saveCart(cart);
            alert("✅ Your item is added to cart");
        });
    });

    updateCartCount();
});

// ==========================
// CART COUNT BADGE
// ==========================
function updateCartCount() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;

    let cart = getCart();
    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalQty;
}

// ==========================
// LOAD CART PAGE
// ==========================
function loadCartItems() {
    const body = document.getElementById("cart-items");
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");

    if (!body) return;

    let cart = getCart();
    body.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>
              <i class="far fa-times-circle remove-btn" data-index="${index}"></i>
            </td>
            <td><img src="${item.image}"/></td>
            <td>${item.name}</td>
            <td>Rs:${item.price}</td>
            <td>
              <input type="number" min="1" value="${item.quantity}" 
                class="qty" data-index="${index}">
            </td>
            <td>Rs:${item.price * item.quantity}</td>
        `;

        subtotal += item.price * item.quantity;
        body.appendChild(row);
    });

    document.getElementById("original-price").innerText = "Rs:" + subtotal;
    document.getElementById("cart-total").innerText = "Rs:" + subtotal;
    // Reset coupon when cart reloads
    document.getElementById("discount-row").style.display = "none";
    document.getElementById("coupon-msg").innerText = "";


    attachCartEvents();
}

// ==========================
// REMOVE & QUANTITY UPDATE
// ==========================
function attachCartEvents() {

    // Remove item
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            let cart = getCart();
            cart.splice(btn.dataset.index, 1);
            saveCart(cart);
            loadCartItems();
        });
    });

    // Quantity change
    document.querySelectorAll(".qty").forEach(input => {
        input.addEventListener("change", () => {
            let cart = getCart();
            let index = input.dataset.index;
            cart[index].quantity = Number(input.value);
            saveCart(cart);
            loadCartItems();
        });
    });
}


// ==========================
// COUPON LOGIC
// ==========================
document.addEventListener("click", (e) => {
    if (e.target.id === "apply-coupon") {

        const coupon = document.getElementById("coupon-code").value.trim();
        const originalPriceEl = document.getElementById("original-price");
        const discountRow = document.getElementById("discount-row");
        const discountAmountEl = document.getElementById("discount-amount");
        const totalEl = document.getElementById("cart-total");
        const msg = document.getElementById("coupon-msg");

        let subtotal = parseInt(originalPriceEl.innerText.replace("Rs:", ""));

        if (coupon === "SAVE10") {
            let discount = Math.round(subtotal * 0.10);
            let finalTotal = subtotal - discount;

            discountRow.style.display = "table-row";
            discountAmountEl.innerText = discount;
            totalEl.innerText = "Rs:" + finalTotal;

            msg.style.color = "green";
            msg.innerText = "🎉 Coupon applied successfully!";
        } 
        else {
            discountRow.style.display = "none";
            totalEl.innerText = "Rs:" + subtotal;

            msg.style.color = "red";
            msg.innerText = "❌ Invalid coupon code";
        }
    }
});

loadCartItems();

// ==========================
// PROCEED TO CHECKOUT
// ==========================
document.addEventListener("click", (e) => {
    if (e.target.id === "checkout-btn") {

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("❌ Your cart is empty!");
            return;
        }

        // Get final payable amount
        let totalText = document.getElementById("cart-total").innerText;
        let totalAmount = parseInt(totalText.replace("Rs:", ""));

        localStorage.setItem("checkoutTotal", totalAmount);

        window.location.href = "checkout.html";
    }
});

// ==========================
// SAVE ORDER
// ==========================
function saveOrder(paymentMethod) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = localStorage.getItem("checkoutTotal");

    const order = {
        id: "ORD" + Date.now(),
        items: cart,
        total: total,
        payment: paymentMethod,
        date: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.removeItem("cart");
    localStorage.removeItem("checkoutTotal");

    window.location.href = "order-success.html";
}

// MODAL ELEMENTS
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

const loginBtn = document.getElementById("login-link"); // login header button
const loginClose = document.getElementById("loginClose");
const signupClose = document.getElementById("signupClose");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

// OPEN LOGIN MODAL
if(loginBtn){
  loginBtn.onclick = () => { loginModal.style.display = "block"; };
}

// CLOSE MODALS
loginClose.onclick = () => { loginModal.style.display = "none"; }
signupClose.onclick = () => { signupModal.style.display = "none"; }

// SWITCH MODALS
showSignup.onclick = () => {
  loginModal.style.display = "none";
  signupModal.style.display = "block";
}
showLogin.onclick = () => {
  signupModal.style.display = "none";
  loginModal.style.display = "block";
}

// CLOSE WHEN CLICK OUTSIDE
window.onclick = function(event) {
  if (event.target == loginModal) loginModal.style.display = "none";
  if (event.target == signupModal) signupModal.style.display = "none";
}

// =======================
// SIGNUP LOGIC
// =======================
document.getElementById("signupForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = this[0].value;
  const email = this[1].value;
  const password = this[2].value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // check if email already exists
  if(users.some(u => u.email === email)) {
    document.getElementById("signupMsg").innerText = "Email already registered!";
    return;
  }

  users.push({name, email, password});
  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("signupMsg").innerText = "✅ Signup successful!";
  this.reset();

  setTimeout(()=> {
    signupModal.style.display = "none";
    loginModal.style.display = "block";
  }, 1000);
});

// =======================
// LOGIN LOGIC
// =======================
document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();
  const email = this[0].value;
  const password = this[1].value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if(user){
    localStorage.setItem("userLoggedIn", "true");
    localStorage.setItem("userName", user.name);
    loginModal.style.display = "none";
    alert("✅ Login successful! Welcome " + user.name);
    location.reload();
  } else {
    document.getElementById("loginMsg").innerText = "Invalid credentials!";
  }
});

const loginLink = document.getElementById("login-link");
const logoutLink = document.getElementById("logout-link");
const userName = document.getElementById("user-name");

if(localStorage.getItem("userLoggedIn") === "true"){
  loginLink.style.display = "none";
  logoutLink.style.display = "inline";
  userName.style.display = "inline";
  userName.innerText = "Hello, " + localStorage.getItem("userName");
}

logoutLink.onclick = () => {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("userName");
  location.reload();
}

// OPEN LOGIN MODAL
if(loginBtn){
  loginBtn.onclick = () => { 
    loginModal.style.display = "block"; 
    loginModal.classList.add("show");
  };
}

// CLOSE MODALS
loginClose.onclick = () => { 
  loginModal.classList.remove("show");
  setTimeout(() => { loginModal.style.display = "none"; }, 400);
}

signupClose.onclick = () => { 
  signupModal.classList.remove("show");
  setTimeout(() => { signupModal.style.display = "none"; }, 400);
}

// SWITCH MODALS
showSignup.onclick = () => {
  loginModal.classList.remove("show");
  setTimeout(() => { loginModal.style.display = "none"; }, 400);
  signupModal.style.display = "block";
  signupModal.classList.add("show");
}

showLogin.onclick = () => {
  signupModal.classList.remove("show");
  setTimeout(() => { signupModal.style.display = "none"; }, 400);
  loginModal.style.display = "block";
  loginModal.classList.add("show");
}


// ==========================
// PRODUCT QUICK VIEW MODAL
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("productModal");
    const closeBtn = document.getElementById("productClose");

    const modalImage = document.getElementById("modalImage");
    const modalName = document.getElementById("modalName");
    const modalPrice = document.getElementById("modalPrice");
    const modalAddBtn = document.getElementById("modalAddToCart");

    // CLICK PRODUCT CARD → OPEN MODAL
    document.querySelectorAll(".pro").forEach(card => {

        card.addEventListener("click", (e) => {

            // ❌ IMPORTANT → Prevent modal when clicking cart icon
            if (e.target.closest(".add-to-cart")) return;

            const btn = card.querySelector(".add-to-cart");

            modalImage.src = btn.dataset.image;
            modalName.innerText = btn.dataset.name;
            modalPrice.innerText = btn.dataset.price;

            // Attach add-to-cart logic
            modalAddBtn.onclick = () => {

                const product = {
                    name: btn.dataset.name,
                    price: Number(btn.dataset.price),
                    image: btn.dataset.image,
                    quantity: 1
                };

                let cart = getCart();
                let existing = cart.find(item => item.name === product.name);

                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push(product);
                }

                saveCart(cart);
                modal.style.display = "none";

                alert("✅ Item added to cart");
            };

            modal.style.display = "block";
            modal.classList.add("show");
        });
    });

    // CLOSE MODAL
    if(closeBtn){
        closeBtn.onclick = () => {
            modal.classList.remove("show");
            setTimeout(() => modal.style.display = "none", 300);
        };
    }

    // CLOSE WHEN CLICK OUTSIDE
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
            setTimeout(() => modal.style.display = "none", 300);
        }
    });

});

// ==========================
// MODAL ADVANCED FEATURES
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("productModal");
    const modalImage = document.getElementById("modalImage");
    const modalQty = document.getElementById("modalQty");
    const buyNowBtn = document.getElementById("buyNowBtn");

    const thumbs = document.querySelectorAll(".thumb");

    // PRODUCT CLICK
    document.querySelectorAll(".pro").forEach(card => {

        card.addEventListener("click", (e) => {

            if (e.target.closest(".add-to-cart")) return;

            const btn = card.querySelector(".add-to-cart");

            modalImage.src = btn.dataset.image;
            document.getElementById("modalName").innerText = btn.dataset.name;
            document.getElementById("modalPrice").innerText = btn.dataset.price;

            modalQty.value = 1;

            // Fake gallery (same image reused safely)
            thumbs.forEach(t => t.src = btn.dataset.image);

            // Thumbnail switching
            thumbs.forEach(thumb => {
                thumb.onclick = () => {
                    modalImage.src = thumb.src;

                    document.querySelectorAll(".thumb")
                        .forEach(t => t.classList.remove("active-thumb"));

                    thumb.classList.add("active-thumb");
                };
            });

            // Size selector
            document.querySelectorAll(".size").forEach(size => {
                size.onclick = () => {
                    document.querySelectorAll(".size")
                        .forEach(s => s.classList.remove("active-size"));

                    size.classList.add("active-size");
                };
            });

            // ADD TO CART
            document.getElementById("modalAddToCart").onclick = () => {

                const qty = Number(modalQty.value);

                const product = {
                    name: btn.dataset.name,
                    price: Number(btn.dataset.price),
                    image: btn.dataset.image,
                    quantity: qty
                };

                let cart = getCart();
                let existing = cart.find(item => item.name === product.name);

                if (existing) {
                    existing.quantity += qty;
                } else {
                    cart.push(product);
                }

                saveCart(cart);
                closeModal();
                alert("✅ Item added to cart");
            };

            // BUY NOW
            buyNowBtn.onclick = () => {

                const qty = Number(modalQty.value);

                const product = {
                    name: btn.dataset.name,
                    price: Number(btn.dataset.price),
                    image: btn.dataset.image,
                    quantity: qty
                };

                let cart = [product]; // Only this product
                saveCart(cart);

                let total = product.price * qty;
                localStorage.setItem("checkoutTotal", total);

                window.location.href = "checkout.html";
            };

            modal.style.display = "block";
            modal.classList.add("show");
        });
    });

    function closeModal() {
        modal.classList.remove("show");
        setTimeout(() => modal.style.display = "none", 300);
    }

});


