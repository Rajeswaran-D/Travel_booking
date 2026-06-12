document.addEventListener('DOMContentLoaded', function() {

    // ── AOS Animation ──────────────────────────────────────────────
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 50 });
    }

    // ── Sticky Header ──────────────────────────────────────────────
    var header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── Mobile Menu ────────────────────────────────────────────────
    var hamburger   = document.getElementById('hamburger');
    var mobileMenu  = document.getElementById('mobileMenu');
    var mobileLinks = document.querySelectorAll('.mobile-link');

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        var icon = hamburger.querySelector('i');
        if (icon) { icon.className = 'fas fa-bars'; }
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            var isOpen = mobileMenu.classList.toggle('active');
            var icon   = hamburger.querySelector('i');
            if (icon) { icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars'; }
        });
        for (var i = 0; i < mobileLinks.length; i++) {
            mobileLinks[i].addEventListener('click', closeMobileMenu);
        }
    }

    // ── Date Helpers ───────────────────────────────────────────────
    function formatDate(dateStr) {
        if (!dateStr) return '';
        var d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function daysBetween(dateStr1, dateStr2) {
        var d1 = new Date(dateStr1 + 'T00:00:00');
        var d2 = new Date(dateStr2 + 'T00:00:00');
        var diff = d2 - d1;
        return Math.round(diff / (1000 * 60 * 60 * 24)) + 1; // inclusive
    }

    // ── Return Date Logic ──────────────────────────────────────────
    var dateInput       = document.getElementById('date');
    var returnDateInput = document.getElementById('return_date');
    var tripSummary     = document.getElementById('trip-summary-wrapper');
    var tripDepart      = document.getElementById('trip-depart');
    var tripReturn      = document.getElementById('trip-return');
    var tripDuration    = document.getElementById('trip-duration');

    function updateTripSummary() {
        var dep = dateInput ? dateInput.value : '';
        var ret = returnDateInput ? returnDateInput.value : '';

        if (!dep || !ret) {
            if (tripSummary) tripSummary.style.display = 'none';
            return;
        }

        // Validate return is not before departure
        if (ret < dep) {
            returnDateInput.value = '';
            showMessage('error', 'Return date must be after the departure date.');
            if (tripSummary) tripSummary.style.display = 'none';
            return;
        }

        var days = daysBetween(dep, ret);
        if (tripDepart)   tripDepart.textContent   = formatDate(dep);
        if (tripReturn)   tripReturn.textContent   = formatDate(ret);
        if (tripDuration) tripDuration.textContent  = days + (days === 1 ? ' Day' : ' Days');
        if (tripSummary)  tripSummary.style.display = 'block';
    }

    // Set min date for return date when departure changes
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            if (returnDateInput) {
                returnDateInput.min = dateInput.value;
                // Clear return if it's now before departure
                if (returnDateInput.value && returnDateInput.value < dateInput.value) {
                    returnDateInput.value = '';
                }
            }
            updateTripSummary();
        });
    }

    if (returnDateInput) {
        returnDateInput.addEventListener('change', updateTripSummary);
    }

    // ── Booking Form ───────────────────────────────────────────────
    var bookingForm  = document.getElementById('bookingForm');
    var formMessages = document.getElementById('form-messages');
    var submitBtn    = document.getElementById('submitBtn');
    var modal        = document.getElementById('bookingModal');
    var modalOverlay = document.getElementById('modalOverlay');
    var modalEdit    = document.getElementById('modalEdit');
    var modalConfirm = document.getElementById('modalConfirm');

    var bookingData = {};

    function showMessage(type, text) {
        formMessages.innerHTML = '<div class="alert alert-' + type + '"><i class="fas fa-' + (type === 'error' ? 'exclamation-circle' : 'check-circle') + '"></i> ' + text + '</div>';
        formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearMessage() {
        formMessages.innerHTML = '';
    }

    function openModal(data) {
        document.getElementById('sum-name').textContent    = data.name;
        document.getElementById('sum-phone').textContent   = data.phone;
        document.getElementById('sum-pickup').textContent  = data.pickup;
        document.getElementById('sum-dest').textContent    = data.destination;
        document.getElementById('sum-date').textContent    = formatDate(data.date);
        document.getElementById('sum-vehicle').textContent = data.vehicle_type;

        // Show/hide return date rows in modal
        var returnRow   = document.getElementById('sum-return-row');
        var durationRow = document.getElementById('sum-duration-row');

        if (data.return_date) {
            document.getElementById('sum-return').textContent   = formatDate(data.return_date);
            document.getElementById('sum-duration').textContent = data.duration;
            if (returnRow)   returnRow.style.display   = 'flex';
            if (durationRow) durationRow.style.display = 'flex';
        } else {
            if (returnRow)   returnRow.style.display   = 'none';
            if (durationRow) durationRow.style.display = 'none';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function sendToWhatsApp(data) {
        var waNumber = '917603813277';
        var msg = '';
        msg += '🚖 *VINAYAGA TOURS & TRAVELS*\n\n';
        msg += '*NEW BOOKING REQUEST*\n\n';
        msg += '👤 *Customer Name:* ' + data.name + '\n';
        msg += '📞 *Mobile Number:* ' + data.phone + '\n\n';
        msg += '📍 *Pickup Location:* ' + data.pickup + '\n';
        msg += '🏁 *Destination:* ' + data.destination + '\n\n';
        msg += '📅 *Departure Date:* ' + formatDate(data.date) + '\n';
        msg += '📅 *Return Date:* ' + (data.return_date ? formatDate(data.return_date) : 'Not Specified') + '\n';
        if (data.duration) {
            msg += '⏱️ *Trip Duration:* ' + data.duration + '\n';
        }
        msg += '\n';
        msg += '🚗 *Travel Type:* ' + data.travel_type + '\n\n';
        msg += '🚘 *Vehicle Type:* ' + data.vehicle_type + '\n\n';
        msg += '📱 *Preferred Contact Method:* ' + data.contact_pref + '\n\n';
        if (data.notes) {
            msg += '📝 *Additional Notes:* ' + data.notes + '\n\n';
        }
        msg += 'Please contact the customer regarding this booking request.';

        var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);
        window.open(waUrl, '_blank');
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearMessage();

            var name         = document.getElementById('name').value.trim();
            var phone        = document.getElementById('phone').value.trim();
            var pickup       = document.getElementById('pickup').value.trim();
            var destination  = document.getElementById('destination').value.trim();
            var date         = document.getElementById('date').value;
            var return_date  = document.getElementById('return_date').value;
            var travel_type  = document.getElementById('travel_type').value;
            var vehicle_type = document.getElementById('vehicle_type').value;
            var contactPrefEl = document.querySelector('input[name="contact_pref"]:checked');
            var contact_pref = contactPrefEl ? contactPrefEl.value : '';
            var notes        = document.getElementById('notes').value.trim();

            // Validation
            if (!name)         return showMessage('error', 'Please enter your full name.');
            if (!/^[0-9]{10}$/.test(phone)) return showMessage('error', 'Please enter a valid 10-digit phone number.');
            if (!pickup)       return showMessage('error', 'Please enter a pickup location.');
            if (!destination)  return showMessage('error', 'Please enter a destination.');
            if (!date)         return showMessage('error', 'Please select a departure date.');
            if (!travel_type)  return showMessage('error', 'Please select a travel type.');
            if (!vehicle_type) return showMessage('error', 'Please select a vehicle type.');
            if (!contact_pref) return showMessage('error', 'Please select your preferred contact method.');

            // Return date validation
            if (return_date && return_date < date) {
                return showMessage('error', 'Return date must be after the departure date.');
            }

            // Calculate duration
            var duration = '';
            if (return_date) {
                var days = daysBetween(date, return_date);
                duration = days + (days === 1 ? ' Day' : ' Days');
            }

            bookingData = {
                name: name,
                phone: phone,
                pickup: pickup,
                destination: destination,
                date: date,
                return_date: return_date,
                duration: duration,
                travel_type: travel_type,
                vehicle_type: vehicle_type,
                contact_pref: contact_pref,
                notes: notes
            };
            openModal(bookingData);
        });
    }

    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (modalEdit) modalEdit.addEventListener('click', closeModal);

    if (modalConfirm) {
        modalConfirm.addEventListener('click', function() {
            closeModal();
            sendToWhatsApp(bookingData);
            showMessage('success', '✅ Redirecting to WhatsApp! Your booking request is ready to send.');
            bookingForm.reset();
            if (tripSummary) tripSummary.style.display = 'none';
        });
    }

    // ── Radio Card visual toggle ───────────────────────────────────
    var radioCards = document.querySelectorAll('.radio-card');
    for (var r = 0; r < radioCards.length; r++) {
        radioCards[r].addEventListener('click', function() {
            for (var j = 0; j < radioCards.length; j++) {
                radioCards[j].classList.remove('selected');
            }
            this.classList.add('selected');
        });
    }

});
