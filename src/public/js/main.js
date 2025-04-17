const welcomeMessage = document.getElementById('welcome-message');
if(welcomeMessage){
    setTimeout(() => {
        welcomeMessage.style.opacity = '0';
        setTimeout(() => {
            welcomeMessage.style.display = 'none';
        }, 500);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Año actual
    const yearElements = document.querySelectorAll('[data-current-year]');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

    const buttons = document.querySelectorAll('.btn-gold, .btn-red, .nav-link-gold');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 8px rgba(255, 215, 0, 0.2)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
    });
});