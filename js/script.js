document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize AOS Animation Library
    if(typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 50
        });
    }

    // Sticky Header
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if(hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // WhatsApp Booking Form Logic
    const bookingForm = document.getElementById('bookingForm');
    const formMessages = document.getElementById('form-messages');
    const submitBtn = document.getElementById('submitBtn');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous messages
            formMessages.innerHTML = '';
            
            // Get values
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const pickup = document.getElementById('pickup').value.trim();
            const destination = document.getElementById('destination').value.trim();
            const date = document.getElementById('date').value;
            const travel_type = document.getElementById('travel_type').value;
            const passengers = document.getElementById('passengers').value.trim();
            const trip_mode = document.getElementById('trip_mode').value;
            const contact_pref = document.getElementById('contact_pref').value;
            const notes = document.getElementById('notes').value.trim();

            // Phone Validation (basic 10 digits)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                showMessage('error', 'Please enter a valid 10-digit phone number.');
                return;
            }

            // Disable button to prevent double clicks
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            try {
                // Generate WhatsApp Link
                const waNumber = '917603813277';
                let waMessage = `🚖 *New Booking Request*%0A%0A`;
                waMessage += `👤 *Name:* ${name}%0A`;
                waMessage += `📞 *Phone:* ${phone}%0A`;
                waMessage += `📍 *Pickup:* ${pickup}%0A`;
                waMessage += `🏁 *Destination:* ${destination}%0A`;
                waMessage += `📅 *Travel Date:* ${date}%0A`;
                waMessage += `🚗 *Travel Type:* ${travel_type}%0A`;
                waMessage += `👥 *Passengers:* ${passengers}%0A`;
                waMessage += `🔄 *Trip Mode:* ${trip_mode}%0A`;
                waMessage += `📱 *Contact Pref:* ${contact_pref}%0A`;
                if(notes) {
                    waMessage += `📝 *Notes:* ${notes}%0A`;
                }
                
                const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;
                
                // Open WhatsApp in new tab
                window.open(waUrl, '_blank');

                // Show Success Message
                showMessage('success', 'Your booking details are ready. Please send the WhatsApp message to complete your booking request. Our team will contact you shortly.');
                
                // Reset form
                bookingForm.reset();

            } catch (error) {
                console.error("Booking Error:", error);
                showMessage('error', 'Oops! Something went wrong. Please try contacting us directly via phone or WhatsApp.');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Request Booking via WhatsApp';
            }
        });
    }

    function showMessage(type, text) {
        formMessages.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
        formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

});
