document.addEventListener('DOMContentLoaded', () => {
    const checkinButton = document.getElementById('checkin-button');
    const guestsList = document.getElementById('guests-list').querySelector('tbody');
    const archiveList = document.getElementById('archive-list').querySelector('tbody');
    const guestForm = document.getElementById('guest-form');
    const searchName = document.getElementById('search-name');
    const filterApartment = document.getElementById('filter-apartment');
    const filterButton = document.getElementById('filter-button');

    let checkedInGuests = JSON.parse(localStorage.getItem('checkedInGuests')) || [];
    let archive = JSON.parse(localStorage.getItem('archive')) || [];

    const renderGuests = () => {
        guestsList.innerHTML = '';
        checkedInGuests.forEach((guest, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${guest.firstName}</td>
                <td>${guest.lastName}</td>
                <td>${guest.checkinDate} ${guest.checkinTime}</td>
                <td>${guest.checkoutDate} ${guest.checkoutTime || ''}</td>
                <td>${guest.apartment}</td>
                <td><button id="checkout-${index}" class="checkout-button">CHECK-OUT</button></td>
            `;
            guestsList.appendChild(tr);
            
            // Add event listener for CHECK-OUT button
            document.getElementById(`checkout-${index}`).addEventListener('click', () => {
                checkoutGuest(index);
            });
        });
    };

    const renderArchive = () => {
        archiveList.innerHTML = '';
        archive.forEach(guest => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${guest.firstName}</td>
                <td>${guest.lastName}</td>
                <td>${guest.checkinDate} ${guest.checkinTime}</td>
                <td>${guest.checkoutDate} ${guest.checkoutTime}</td>
                <td>${guest.apartment}</td>
            `;
            archiveList.appendChild(tr);
        });
    };

    const checkoutGuest = (index) => {
        const guest = checkedInGuests[index];
        const currentTime = new Date().toLocaleTimeString();
        guest.checkoutTime = currentTime;
        archive.push(guest);
        checkedInGuests.splice(index, 1);
        localStorage.setItem('checkedInGuests', JSON.stringify(checkedInGuests));
        localStorage.setItem('archive', JSON.stringify(archive));
        renderGuests();
        renderArchive();

        // Send email on check-out
        sendEmail({
            email: 'info@bvliving.it',
            subject: `Guest Check-Out: ${guest.firstName} ${guest.lastName}`,
            body: `Guest Details:<br>Name: ${guest.firstName} ${guest.lastName}<br>Check-in: ${guest.checkinDate} ${guest.checkinTime}<br>Checkout: ${guest.checkoutDate} ${guest.checkoutTime}<br>Apartment: ${guest.apartment}`
        });
    };

    checkinButton.addEventListener('click', () => {
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const checkoutDate = document.getElementById('checkout-date').value;
        const apartment = document.getElementById('apartment').value;
        
        const checkinDate = new Date().toLocaleDateString(); // Get current date
        const checkinTime = new Date().toLocaleTimeString(); // Get current time

        if (firstName && lastName && checkoutDate && apartment) {
            const newGuest = { firstName, lastName, checkinDate, checkoutDate, checkinTime, checkoutTime: '', apartment };
            checkedInGuests.push(newGuest);
            localStorage.setItem('checkedInGuests', JSON.stringify(checkedInGuests));
            guestForm.reset();
            renderGuests();

            // Send email on check-in
            sendEmail({
                email: 'info@bvliving.it',
                subject: `New Check-In: ${firstName} ${lastName}`,
                body: `Guest Details:<br>Name: ${firstName} ${lastName}<br>Check-in: ${checkinDate} ${checkinTime}<br>Checkout: ${checkoutDate}<br>Apartment: ${apartment}`
            });
        }
    });

    filterButton.addEventListener('click', filterGuests);

    const filterGuests = () => {
        const nameFilter = searchName.value.toLowerCase();
        const apartmentFilter = filterApartment.value;

        const filteredGuests = checkedInGuests.filter(guest => {
            const matchesName = guest.firstName.toLowerCase().includes(nameFilter) || guest.lastName.toLowerCase().includes(nameFilter);
            const matchesApartment = !apartmentFilter || guest.apartment === apartmentFilter;
            return matchesName && matchesApartment;
        });

        guestsList.innerHTML = '';
        filteredGuests.forEach((guest, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${guest.firstName}</td>
                <td>${guest.lastName}</td>
                <td>${guest.checkinDate} ${guest.checkinTime}</td>
                <td>${guest.checkoutDate} ${guest.checkoutTime || ''}</td>
                <td>${guest.apartment}</td>
                <td><button id="checkout-${index}" class="checkout-button">CHECK-OUT</button></td>
            `;
            guestsList.appendChild(tr);

            // Add event listener for CHECK-OUT button
            document.getElementById(`checkout-${index}`).addEventListener('click', () => {
                checkoutGuest(index);
            });
        });
    };

    const sendEmail = (details) => {
        fetch('https://your-server-endpoint.com/checkin-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: details.email,
                subject: details.subject,
                body: details.body
            }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Email sent successfully');
        })
        .catch(error => console.error('Error sending email:', error));
    };

    // Initial render
    renderGuests();
    renderArchive();
});
