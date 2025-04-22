
document.addEventListener('DOMContentLoaded', function () {
    const openRequestFormBtn = document.getElementById('open-request-form');
    const formWrapper = document.getElementById('form-wrapper');
    const closeRequestFormBtn = document.getElementById('close-request-form');
    const creditCardRadio = document.getElementById('credit-card');
    const gcashRadio = document.getElementById('gcash');
    const creditCardMethod = document.querySelector('.method.credit-card');
    const gcashMethod = document.querySelector('.method.gcash');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const methodContainer = document.getElementById('method-container');

    const creditCardTemplate = `
                                <div class="method credit-card">
                                    <label for="credit-card-number">Credit Card Number</label>
                                    <input type="text" name="credit-card-number" id="credit-card-number" required>
                                    <label for="credit-card-name">Cardholder Name</label>
                                    <input type="text" name="credit-card-name" id="credit-card-name" required>
                                    <label for="credit-card-expiry">Expiry Date</label>
                                    <input type="month" name="credit-card-expiry" id="credit-card-expiry" required>
                                    <label for="credit-card-cvv">CVV</label>
                                    <input type="text" name="credit-card-cvv" id="credit-card-cvv" required>
                                </div>
    `;

    const gcashTemplate = `
                            <div class="method gcash">
                                <label for="gcash-number">GCash Number</label>
                                <input type="text" name="gcash-number" id="gcash-number" required>
                            </div>
    `;

    

    if (openRequestFormBtn && formWrapper) {
        // Show the form when button is clicked
        openRequestFormBtn.addEventListener('click', function () {
            formWrapper.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }

    if (closeRequestFormBtn && formWrapper) {
        // Hide the form when close button is clicked
        closeRequestFormBtn.addEventListener('click', function () {
            formWrapper.style.display = 'none';
            document.body.style.overflow = 'auto'; // Enable scrolling
        });

        // Close form when clicking outside the form content
        formWrapper.addEventListener('click', function (event) {
            if (event.target === formWrapper) {
                formWrapper.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && formWrapper && formWrapper.style.display === 'block') {
            formWrapper.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    methodContainer.innerHTML = creditCardTemplate;

    if (creditCardRadio) {
        creditCardRadio.addEventListener('click', function () {
            if(this.checked) {
                methodContainer.innerHTML = creditCardTemplate;
                updatePaymentMethodText('Credit Card');
            }
        });
    }

    if (gcashRadio) {
        gcashRadio.addEventListener('click', function () {
            if(this.checked) {
                methodContainer.innerHTML = gcashTemplate;
                updatePaymentMethodText('GCash');
            }
        });
    }

    function updatePaymentMethodText(methodName) {
        const paymentMethodField = document.getElementById('payment-method-selected');
        if (paymentMethodField) paymentMethodField.textContent = methodName;
    }

    if (sidebarToggle && sidebarMenu) {
        sidebarToggle.addEventListener('click', function () {
            if (sidebarMenu.style.display === 'block') {
                sidebarMenu.style.display = 'none';
            } else {
                sidebarMenu.style.display = 'block';
            }
        });
    }
});