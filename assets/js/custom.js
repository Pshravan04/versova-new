$(document).ready(function () {

    $('[data-toggle="tooltip"]').tooltip();

    // Rera Non-Rera 
    //  $("body").attr('id', 'on-rera');


    // Rera Non-Rera Condition
    $("body").attr('id', 'on-rera'); // Or 'non-rera'
    $("body").removeClass('is-loading'); // Remove hiding class AFTER setting the 

    $('#navbarNav a[href^="#"]').on('click', function (e) {
        e.preventDefault(); // Prevent default anchor behavior

        let target = $($(this).attr('href')); // Get the target element
        let offset = 50; // Offset height (e.g., height of fixed header)

        if (target.length) {
            $('html, body').animate(
                {
                    scrollTop: target.offset().top - offset
                },
                500 // Animation duration in ms
            );
        }
    });



    // Location Advantage stop a href 
    // Adjust scroll for anchor links
    $('#exTab1 > a[href^="#"]').on('click', function (e) {
        e.preventDefault(); // Prevent default anchor behavior

        let target = $($(this).attr('href')); // Get the target element
        let offset = 50; // Offset height (e.g., height of fixed header)

        if (target.length) {
            $('html, body').animate(
                {
                    scrollTop: target.offset().top - offset
                },
                500 // Animation duration in ms
            );
        }
    });

    // Form name submission code
    $(".custom-btn, .data-id-btn").click(function () {
        var myBookId = $(this).data('id');
        $(".form_name").val(myBookId);
    });

    // Toggle more and less content
    $(".moredisclaimerBtn").click(function () {
        if ($(this).html() === 'Read more <i class="fa fa-chevron-down"></i>') {
            $(this).html('Read less <i class="fa fa-chevron-up"></i>');
        }
        else {
            $(this).html('Read more <i class="fa fa-chevron-down"></i>');
        }
        $(".moredisclaimerText[data-hit=more" + $(this).data('target') + "]").slideToggle(500);
    });

    $(".moreBtn").click(function () {
        var button = $(this);
        var target = button.data('target');
        var isReadMore = button.html().includes('Read more');
        var newHtml = isReadMore ? 'Read less <i class="fa fa-chevron-up"></i>' : 'Read more <i class="fa fa-chevron-down"></i>';
        button.html(newHtml);
        $(".moreText[data-hit=more" + target + "]").slideToggle(500);
    });

    // Modal content update
    $('#enquire-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var recipient = button.data('bs-whatever');
        var modal = $(this);
        modal.find('.modal-title').text(recipient);
        modal.find('input[name="recipient"]').val(recipient);
    });

});

//form submit//
function submitForm(event, formName) {
    // alert("hii");
    event.preventDefault(); // Prevent default form submission
    console.log("--- submitForm called for:", formName, "---"); // DEBUG

    // --- Get Form and Price ---
    const formElement = document.forms[formName];
    if (!formElement) {
        console.error("CRITICAL: Form element not found for name:", formName); // DEBUG
        return; // Exit if form doesn't exist
    }
    var price = $(".price-sub-text").text().trim();


    // --- URL Handling ---
    var currentUrl = window.location.href;

    // Fix URL if it contains more than one '?'
    var questionMarkIndex = currentUrl.indexOf('?');
    var secondQuestionMarkIndex = currentUrl.indexOf('?', questionMarkIndex + 1);

    if (secondQuestionMarkIndex !== -1) {
        currentUrl = currentUrl.substring(0, secondQuestionMarkIndex) + '&' + currentUrl.substring(secondQuestionMarkIndex + 1);
    }

    // Handle URL fragment (everything after #)
    var hashIndex = currentUrl.indexOf('#');
    if (hashIndex !== -1) {
        var fragment = currentUrl.substring(hashIndex + 1);
        currentUrl = currentUrl.substring(0, hashIndex) + '&' + fragment;
    }



    // --- Clear Previous Errors & Styles ---
    const errorMessages = formElement.querySelectorAll('.error');
    errorMessages.forEach(function (error) {
        error.style.display = 'none';
    });
    const inputs = formElement.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });


    // --- Validation Logic ---
    let isValid = true; // Start assuming valid
    const formData = new FormData(formElement);

    const nameInput = formElement.querySelector('[name="name"]');
    const mobileInput = formElement.querySelector('[name="mobile"]');
    const consentCheckbox = formElement.querySelector('.form-check-input[type="checkbox"]');

    // Validate Name
    if (nameInput) { // Check if the input exists first
        console.log("Name input found. Is required?", nameInput.required); // DEBUG
        if (nameInput.required) { // Only validate if it's required
            const nameValue = nameInput.value.trim(); // Trim whitespace!
            const nameErrorSpan = nameInput.closest('.forms-input-fields')?.querySelector('.error') || nameInput.parentNode.querySelector('.error'); // Try parentNode as fallback
            console.log(`Name value (raw): "${nameInput.value}" | (trimmed): "${nameValue}"`); // DEBUG

            if (nameValue === '') {
                console.log("Validation Failed: Name is empty or spaces."); // DEBUG
                isValid = false;
                if (nameErrorSpan) {
                    nameErrorSpan.textContent = 'Name field is required.';
                    nameErrorSpan.style.display = 'inline';
                } else { console.warn("Name error span not found!"); } // DEBUG
                nameInput.classList.add('is-invalid');
            } else {
                nameInput.classList.add('is-valid');
            }
        }
    } else { console.log("Name input not found in form:", formName); } // DEBUG

    // Validate Mobile
    if (mobileInput) { // Check if the input exists
        console.log("Mobile input found. Is required?", mobileInput.required); // DEBUG
        if (mobileInput.required) { // Only validate if it's required
            const mobileValue = mobileInput.value.trim(); // Trim whitespace!
            const mobileErrorSpan = mobileInput.closest('.forms-input-fields')?.querySelector('.error') || mobileInput.parentNode.querySelector('.error'); // Try parentNode as fallback
            console.log(`Mobile value (raw): "${mobileInput.value}" | (trimmed): "${mobileValue}"`); // DEBUG

            if (mobileValue === '') {
                console.log("Validation Failed: Mobile is empty or spaces."); // DEBUG
                isValid = false;
                if (mobileErrorSpan) {
                    mobileErrorSpan.textContent = 'Mobile field is required.';
                    mobileErrorSpan.style.display = 'inline';
                } else { console.warn("Mobile error span not found!"); } // DEBUG
                mobileInput.classList.add('is-invalid');
            }
            else {
                mobileInput.classList.add('is-valid');
            }
        }
    } else { console.log("Mobile input not found in form:", formName); } // DEBUG

    // --- Stop Submission If Invalid ---
    console.log("Final validation check. Is form valid?", isValid); // DEBUG
    if (!isValid) {
        const firstInvalid = formElement.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
        console.log("STOPPING SUBMISSION due to validation errors."); // DEBUG
        return; // Exit the function
    }

    // --- Prepare Data for Submission (If Valid) ---
    console.log("Validation passed. Preparing data for AJAX..."); // DEBUG
    var formnameValue = formData.get('form_name');
    var form_data = {
        name: formData.get('name') ? formData.get('name').trim() : '',
        email: formData.get('email') ? formData.get('email').trim() : '',
        mobile: formData.get('mobile') ? formData.get('mobile').trim() : '',
        form_name: formnameValue,
        website_url: formData.get('website_url') ? formData.get('website_url') : window.location.origin,
        price: price,
        currentUrl: currentUrl
    };

    // --- Disable Submit Button ---
    const submitButton = formElement.querySelector('button[type="submit"], button.preRegisterBtn, button.data-id-btn[onclick*="submitForm"]');
    let originalButtonText = '';
    if (submitButton) {
        const span = submitButton.querySelector('span');
        if (span) {
            originalButtonText = span.textContent;
            span.textContent = 'Submitting...';
        } else {
            originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
        }
        submitButton.disabled = true;
    } else {
        console.warn("Submit button not found for disabling!");
    }


    // --- AJAX Request ---
    console.log("Sending AJAX request to send_email.php with data:", form_data); // DEBUG
    $.ajax({
        type: 'POST',
        url: 'send_email.php',
        data: form_data,
        success: function (response) {
            console.log("AJAX Success Response:", response); // DEBUG
            formElement.reset();
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
            errorMessages.forEach(error => error.style.display = 'none');

            if (formName === 'modal-form' || formName === 'main-popup') {
                const modalElement = document.getElementById('enquire-modal');
                if (modalElement) {
                    try { // Add try-catch for modal instance
                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        if (modalInstance) { modalInstance.hide(); }
                        else { $(modalElement).modal('hide'); }
                    } catch (e) {
                        console.error("Error hiding modal:", e);
                        $(modalElement).modal('hide'); // Fallback jQuery hide
                    }
                }
            }

            if (formnameValue === 'Brochure') {
                window.location.href = 'thank-you55d255d2.html?formName=Brochure';
                //  window.location.href = 'thank-you.html';
            } else if (formnameValue === 'Sample-Flat') {
                window.location.href = 'thank-you16da16da.html?formName=Sample-Flat';
            } else {
                window.location.href = 'thank-you.html';
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', status, error, xhr.responseText); // DEBUG
            alert('An error occurred while submitting the form. Please try again later.');
        },
        complete: function () {
            console.log("AJAX request complete."); // DEBUG
            if (submitButton) {
                submitButton.disabled = false;
                const span = submitButton.querySelector('span');
                if (span) {
                    span.textContent = originalButtonText;
                } else {
                    submitButton.textContent = originalButtonText;
                }
            }
        }

    });
}


//#sitelink code (to prepend #sectionID)
(function () {
    let utmParams = "";

    const currentUrl = new URL(window.location.html);

    if (currentUrl.search.length) {
        utmParams = currentUrl.search;
    }

    if (!utmParams && currentUrl.hash.includes("?")) {
        utmParams = "?" + currentUrl.hash.split("?")[1];
    }

    document.querySelectorAll('#navbarNav a.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const anchor = this.getAttribute("href").split("?")[0];
            const newUrl = `${currentUrl.origin}${currentUrl.pathname}${anchor}${utmParams}`;

            history.pushState(null, '', newUrl); // Update URL without reload
            const target = document.querySelector(anchor);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });
})();


