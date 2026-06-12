document.addEventListener('DOMContentLoaded', () => {

    // ── AOS Animation ──────────────────────────────────────────────
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 50 });
    }

    // ── Sticky Header ──────────────────────────────────────────────
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── Mobile Menu ────────────────────────────────────────────────
    const hamburger   = document.getElementById('hamburger');
    const mobileMenu  = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        const icon = hamburger.querySelector('i');
        if (icon) { icon.className = 'fas fa-bars'; }
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('active');
            const icon   = hamburger.querySelector('i');
            if (icon) { icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars'; }
        });
        mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    }

    // ── Booking Form ───────────────────────────────────────────────
    const bookingForm  = document.getElementById('bookingForm');
    const formMessages = document.getElementById('form-messages');
    const submitBtn    = document.getElementById('submitBtn');
    const modal        = document.getElementById('bookingModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalEdit    = document.getElementById('modalEdit');
    const modalConfirm = document.getElementById('modalConfirm');

    // Store form data for WhatsApp message
    let bookingData = {};

    function showMessage(type, text) {
        formMessages.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${text}</div>`;
        formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearMessage() {
        formMessages.innerHTML = '';
    }

    function openModal(data) {
        document.getElementById('sum-name').textContent       = data.name;
        document.getElementById('sum-phone').textContent      = data.phone;
        document.getElementById('sum-pickup').textContent     = data.pickup;
        document.getElementById('sum-dest').textContent       = data.destination;
        document.getElementById('sum-date').textContent       = formatDate(data.date);
        document.getElementById('sum-vehicle').textContent    = data.vehicle_type;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function formatDate(dateStr) {
        if (!dateStr) return dateStr;
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function sendToWhatsApp(data) {
        const waNumber = '917603813277';
        let msg = '';
        msg += '🚖 *VINAYAGA TOURS & TRAVELS*\n\n';
        msg += '*NEW BOOKING REQUEST*\n\n';
        msg += `👤 *Customer Name:* ${data.name}\n`;
        msg += `📞 *Mobile Number:* ${data.phone}\n\n`;
        msg += `📍 *Pickup Location:* ${data.pickup}\n`;
        msg += `🏁 *Destination:* ${data.destination}\n\n`;
        msg += `📅 *Travel Date:* ${formatDate(data.date)}\n`;
        msg += `🚗 *Travel Type:* ${data.travel_type}\n`;
        msg += `🚘 *Vehicle Type:* ${data.vehicle_type}\n\n`;
        msg += `📱 *Preferred Contact Method:* ${data.contact_pref}\n\n`;
        if (data.notes) {
            msg += `📝 *Additional Notes:* ${data.notes}\n\n`;
        }
        msg += 'Please contact the customer regarding this booking request.';

        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearMessage();

            // Collect values
            const name         = document.getElementById('name').value.trim();
            const phone        = document.getElementById('phone').value.trim();
            const pickup       = document.getElementById('pickup').value.trim();
            const destination  = document.getElementById('destination').value.trim();
            const date         = document.getElementById('date').value;
            const travel_type  = document.getElementById('travel_type').value;
            const vehicle_type = document.getElementById('vehicle_type').value;
            const contact_pref = document.querySelector('input[name="contact_pref"]:checked')?.value || '';
            const notes        = document.getElementById('notes').value.trim();

            // Validation
            if (!name)         return showMessage('error', 'Please enter your full name.');
            if (!/^[0-9]{10}$/.test(phone)) return showMessage('error', 'Please enter a valid 10-digit phone number.');
            if (!pickup)       return showMessage('error', 'Please enter a pickup location.');
            if (!destination)  return showMessage('error', 'Please enter a destination.');
            if (!date)         return showMessage('error', 'Please select a travel date.');
            if (!travel_type)  return showMessage('error', 'Please select a travel type.');
            if (!vehicle_type) return showMessage('error', 'Please select a vehicle type.');
            if (!contact_pref) return showMessage('error', 'Please select your preferred contact method.');

            // Store and open summary modal
            bookingData = { name, phone, pickup, destination, date, travel_type, vehicle_type, contact_pref, notes };
            openModal(bookingData);
        });
    }

    // Modal close on overlay click
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Modal – Edit
    if (modalEdit) modalEdit.addEventListener('click', closeModal);

    // Modal – Confirm → open WhatsApp
    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            closeModal();
            sendToWhatsApp(bookingData);
            showMessage('success', '✅ Redirecting to WhatsApp! Your booking request is ready to send.');
            bookingForm.reset();
        });
    }

    // ── Radio Card visual toggle ───────────────────────────────────
    document.querySelectorAll('.radio-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

});
