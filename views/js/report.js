document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const reports = document.querySelectorAll('.report');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            reports.forEach(r => r.classList.remove('active'));

            tab.classList.add('active');
            if (tab.dataset.tab === 'home') {
                // Hide the reports if Home tab is active
                reports.forEach(r => r.classList.remove('active'));
            } else {
                // Show the relevant report
                document.getElementById(`${tab.dataset.tab}-report`).classList.add('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const reports = document.querySelectorAll('.report');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            reports.forEach(r => r.classList.remove('active'));

            tab.classList.add('active');
            if (tab.dataset.tab === 'home') {
                // Hide the reports if Home tab is active
                reports.forEach(r => r.classList.remove('active'));
                document.getElementById('home-report').classList.add('active');
            } else {
                // Show the relevant report (Instructor or Student)
                document.getElementById(`${tab.dataset.tab}-report`).classList.add('active');
            }
        });
    });
});