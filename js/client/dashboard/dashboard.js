/**
 * User Dashboard UI Handler
 * 
 * This script manages the UI interactions in the user dashboard,
 * including the request form, payment method selection, and other UI elements.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Form visibility controls
    const openRequestFormBtn = document.getElementById('open-request-form');
    const formWrapper = document.getElementById('form-wrapper');
    const closeRequestFormBtn = document.getElementById('close-request-form');
    
    // Payment method elements
    const creditCardRadio = document.getElementById('credit-card');
    const gcashRadio = document.getElementById('gcash');
    const methodContainer = document.getElementById('method-container');
    const creditCardBtn = document.getElementById('credit-card-payment-method');
    const gcashBtn = document.getElementById('gcash-payment-method');
    
    // Credit card payment form template
    const creditCardTemplate = `
        <div class="method credit-card">
            <label for="credit-card-number">Credit Card Number</label>
            <input type="text" name="credit-card-number" id="credit-card-number" required>
            <label for="credit-card-name">Cardholder Name</label>
            <input type="text" name="credit-card-name" id="credit-card-name" required>
            <div class="expiry-cvv-container">
                <div class="expiry-container">
                    <label for="expiry-date">Expiry Date</label>
                    <input type="text" name="expiry-date" id="expiry-date" placeholder="MM/YY" required>
                </div>
                <div class="cvv-container">
                    <label for="cvv">CVV</label>
                    <input type="text" name="cvv" id="cvv" required>
                </div>
            </div>
        </div>
    `;
    
    // GCash payment form template
    const gcashTemplate = `
        <div class="method gcash">
            <label for="gcash-number">GCash Number</label>
            <input type="text" name="gcash-number" id="gcash-number" required>
            <label for="gcash-name">Account Name</label>
            <input type="text" name="gcash-name" id="gcash-name" required>
        </div>
    `;
    
    // Initialize form visibility
    if (openRequestFormBtn) {
        openRequestFormBtn.addEventListener('click', function() {
            formWrapper.style.display = 'block';
        });
    }
    
    if (closeRequestFormBtn) {
        closeRequestFormBtn.addEventListener('click', function() {
            formWrapper.style.display = 'none';
        });
    }
    
    // Payment method selection
    if (creditCardBtn) {
        creditCardBtn.addEventListener('click', function () {
            creditCardRadio.checked = true;
            methodContainer.innerHTML = creditCardTemplate;
            updatePaymentMethodText('Credit Card');
        });
    }
    
    if (gcashBtn) {
        gcashBtn.addEventListener('click', function () {
            gcashRadio.checked = true;
            methodContainer.innerHTML = gcashTemplate;
            updatePaymentMethodText('GCash');
        });
    }
    
    /**
     * Update the payment method text in the order summary
     * @param {string} methodName - Payment method name
     */
    function updatePaymentMethodText(methodName) {
        const paymentMethodText = document.getElementById('payment-method-text');
        if (paymentMethodText) {
            paymentMethodText.textContent = methodName;
        }
    }
});
