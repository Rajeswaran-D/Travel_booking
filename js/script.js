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

    var pickupTimeInput = document.getElementById('pickup_time');
    var pickupInput     = document.getElementById('pickup');
    var destInput       = document.getElementById('destination');
    var tripArrival     = document.getElementById('trip-arrival');

    function estimateTravelDetails(pickup, destination, timeStr) {
        if (!pickup || !destination || !timeStr) return null;
        var p = pickup.toLowerCase();
        var d = destination.toLowerCase();
        
        var baseCity = 'aruppukottai';
        var durationHours = 4; // Default fallback
        
        var routes = {
            'chennai': 8, 'madurai': 1, 'coimbatore': 5, 'bangalore': 8,
            'trichy': 3, 'tirunelveli': 2, 'kanyakumari': 4, 'tuticorin': 2, 'rameshwaram': 3
        };

        var target = p.includes(baseCity) ? d : (d.includes(baseCity) ? p : d);
        var found = false;
        for (var key in routes) {
            if (target.includes(key)) {
                durationHours = routes[key];
                found = true;
                break;
            }
        }
        if (!found) {
            // Default 4 hours if not Aruppukottai, else 3-5 roughly
            durationHours = 4;
        }
        
        var parts = timeStr.split(':');
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);
        
        var totalHours = hours + durationHours;
        var newHours = totalHours % 24;
        
        var ampm = newHours >= 12 ? 'PM' : 'AM';
        var displayHours = newHours % 12;
        displayHours = displayHours ? displayHours : 12; // 0 should be 12
        var displayMins = minutes < 10 ? '0' + minutes : minutes;
        
        return {
            duration: durationHours + ' Hours',
            eta: displayHours + ':' + displayMins + ' ' + ampm
        };
    }

    function updateTripSummary() {
        var dep = dateInput ? dateInput.value : '';
        var ret = returnDateInput ? returnDateInput.value : '';
        var pkp = pickupInput ? pickupInput.value : '';
        var dst = destInput ? destInput.value : '';
        var pTime = pickupTimeInput ? pickupTimeInput.value : '';

        if (!dep && !pTime) {
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

        var days = '';
        if (dep && ret) {
             days = daysBetween(dep, ret);
             days = days + (days === 1 ? ' Day' : ' Days');
        } else {
             days = 'N/A';
        }

        var estimation = estimateTravelDetails(pkp, dst, pTime);

        if (tripDepart)   tripDepart.textContent   = dep ? formatDate(dep) : 'N/A';
        if (tripReturn)   tripReturn.textContent   = ret ? formatDate(ret) : 'N/A';
        
        if (tripDuration) tripDuration.textContent = estimation ? estimation.duration : 'N/A';
        if (tripArrival)  tripArrival.textContent  = estimation ? estimation.eta : 'N/A';
        
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
    if (pickupTimeInput) pickupTimeInput.addEventListener('change', updateTripSummary);
    if (pickupInput) pickupInput.addEventListener('input', updateTripSummary);
    if (destInput) destInput.addEventListener('input', updateTripSummary);

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
        var arrivalRow  = document.getElementById('sum-arrival-row');

        if (data.return_date) {
            document.getElementById('sum-return').textContent   = formatDate(data.return_date);
            if (returnRow)   returnRow.style.display   = 'flex';
        } else {
            if (returnRow)   returnRow.style.display   = 'none';
        }

        if (data.estimation) {
            document.getElementById('sum-duration').textContent = data.estimation.duration;
            document.getElementById('sum-arrival').textContent  = data.estimation.eta;
            if (durationRow) durationRow.style.display = 'flex';
            if (arrivalRow)  arrivalRow.style.display  = 'flex';
        } else {
            if (durationRow) durationRow.style.display = 'none';
            if (arrivalRow)  arrivalRow.style.display  = 'none';
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
        msg += '🚖 *VINAYAGA TOURS & TRAVELS*\n';
        msg += '*NEW BOOKING REQUEST*\n\n';
        msg += 'Customer Name: ' + data.name + '\n';
        msg += 'Phone Number: ' + data.phone + '\n';
        msg += 'Pickup: ' + data.pickup + '\n';
        msg += 'Destination: ' + data.destination + '\n';
        msg += 'Travel Date: ' + formatDate(data.date) + '\n';
        msg += 'Return Date: ' + (data.return_date ? formatDate(data.return_date) : 'N/A') + '\n';
        
        var displayTime = data.pickup_time;
        if (displayTime) {
            var parts = displayTime.split(':');
            var h = parseInt(parts[0], 10);
            var m = parseInt(parts[1], 10);
            var ampm = h >= 12 ? 'PM' : 'AM';
            var dh = h % 12;
            dh = dh ? dh : 12;
            displayTime = dh + ':' + (m < 10 ? '0'+m : m) + ' ' + ampm;
        }

        msg += 'Pickup Time: ' + (displayTime || 'Not Specified') + '\n';
        msg += 'Vehicle Type: ' + data.vehicle_type + '\n';
        msg += 'Passengers: ' + (data.vehicle_type.match(/\d+\+\d+/) ? data.vehicle_type.match(/\d+\+\d+/)[0] : 'N/A') + '\n';
        
        if (data.estimation) {
            msg += 'Estimated Arrival Time: ' + data.estimation.eta + '\n';
        } else {
            msg += 'Estimated Arrival Time: N/A\n';
        }
        
        msg += 'Additional Notes: ' + (data.notes || 'None') + '\n';

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
            var pickup_time  = document.getElementById('pickup_time').value;
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
            if (!pickup_time)  return showMessage('error', 'Please select a pickup time.');
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

            var estimation = estimateTravelDetails(pickup, destination, pickup_time);

            bookingData = {
                name: name,
                phone: phone,
                pickup: pickup,
                destination: destination,
                date: date,
                pickup_time: pickup_time,
                return_date: return_date,
                duration: duration,
                estimation: estimation,
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

    // ── Vehicle Image Display ──────────────────────────────────────
    var vehicleTypeSelect = document.getElementById('vehicle_type');
    var vehicleSuggestion = document.getElementById('vehicle-suggestion');

    var vehicleImages = {
        'Swift Dzire (4+1)': 'images/Swift.jpg',
        'Ertiga (7+1)': 'images/ertiga.jpg',
        'Innova (7+1)': 'images/inova.jpg',
        'Xylo (7+1)': 'images/Xylo.jpg',
        'Tempo Traveller (12+1)': 'images/traveller.png',
        'Tempo Traveller (14+1)': 'images/traveller.png',
        'Tempo Traveller (18+1)': 'images/traveller.png',
        'Mahindra Tourist Van (17+1)': 'images/tourist.png',
        'Coach Van (23+1)': 'images/coachvan.png',
        'Coach Van (25+1)': 'images/coachvan.png'
    };

    if (vehicleTypeSelect && vehicleSuggestion) {
        vehicleTypeSelect.addEventListener('change', function() {
            var selectedVehicle = this.value;
            var imageSrc = vehicleImages[selectedVehicle];
            
            if (imageSrc) {
                vehicleSuggestion.innerHTML = '<img src="' + imageSrc + '" alt="' + selectedVehicle + '" class="booking-vehicle-img">';
                vehicleSuggestion.style.display = 'block';
            } else {
                vehicleSuggestion.style.display = 'none';
                vehicleSuggestion.innerHTML = '';
            }
        });
    }

});
