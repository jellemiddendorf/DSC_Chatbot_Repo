const headerLoader = (function() {
    var headerPlaceholder = document.getElementById('header-placeholder');

    // Load the HTML content for the header
    function loadHeader() {
        fetch('html/header.html')
            .then(response => response.text())
            .then(html => {
                headerPlaceholder.innerHTML = html;
                loadCSS('css/header-styles.min.css');
            })
            .catch(error => console.error('Error loading the header:', error));
    }

    // Dynamically load CSS for the header
    function loadCSS(href) {
        const link = document.createElement('link');
        link.href = href;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // Initialize the module
    function init(){
        loadHeader();
        console.log("Header loader initialized.");
    }

    return {
        init
    };
})();
