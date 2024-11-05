window.addEventListener('message', (event) => {

});

// When DOM is ready
document.addEventListener('DOMContentLoaded', () => {

    const apacheLicense = document.getElementById('apacheLicense');

    apacheLicense.addEventListener('click', () => {
        const apacheLicense2Path = "/System/ApacheLicense-2.0.txt"
        window.parent.postMessage({ action: 'openFile', path: apacheLicense2Path }, '*');
    })
    

});
