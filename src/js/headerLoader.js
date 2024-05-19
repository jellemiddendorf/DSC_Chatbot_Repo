const headerLoader = (function() {
    var headerPlaceholder = document.getElementById('header-placeholder');

    function loadHeader() {
        fetch('html/header.html')
            .then(response => response.text())
            .then(html => {
                headerPlaceholder.innerHTML = html;
                loadCSS('css/header-styles.min.css');
            })
            .catch(error => console.error('Error loading the header:', error));
    }

    function loadCSS(href) {
        const link = document.createElement('link');
        link.href = href;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    function init(){
        loadHeader();
        console.log("Header loader initialized.");
    }

    // Public API
    return {
        // init: function() {
        //     document.addEventListener("DOMContentLoaded", loadHeader);
        // }
        init
    };
})();

// Initialize the module
//headerLoader.init();
