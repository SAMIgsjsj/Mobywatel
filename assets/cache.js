var params = new URLSearchParams(window.location.search);

window.onload = async () => {
    if (window.location.protocol === 'file:') {
        return;
    }

    if (!('caches' in window)) {
        return;
    }

    try {
        const filesRequest = await fetch('/cache/files');
        if (!filesRequest.ok) {
            return;
        }
        const filesResponse = await filesRequest.json();

        const files = ['https://unpkg.com/html5-qrcode'];
        const pages = ['card', 'document', 'documents', 'home', 'id', 'more', 'pesel', 'qr', 'scan', 'services', 'shortcuts', 'show'];

        pages.forEach((page) => {
            const query = params.toString();
            files.push(query ? `/${page}.html?${query}` : `/${page}.html`);
        });

        if (Array.isArray(filesResponse.files)) {
            filesResponse.files.forEach((file) => {
                files.push('/' + file);
            });
        }

        const index = files.indexOf('assets/cache.js');
        if (index !== -1) {
            files.splice(index, 1);
        }

        const cacheName = 'fobywatel';
        const cache = await caches.open(cacheName);
        await cache.addAll(files);

        const cachedRequests = await cache.keys();
        cachedRequests.forEach((request) => {
            checkElement(request, cache);
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('worker.html').catch(() => {});
        }
    } catch (e) {
        // W środowisku lokalnym lub bez endpointu /cache/files pomijamy cache w tle
    }
};

async function checkElement(request, cache) {
    try {
        const cachedResponse = await cache.match(request);
        if (!cachedResponse) return;

        const url = new URL(request.url);
        const modifiedUrl = new URL(url);
        modifiedUrl.searchParams.append('date', Date.now());

        const networkResponse = await fetch(modifiedUrl);
        if (!networkResponse.ok) return;

        const cachedText = await cachedResponse.clone().text();
        const networkText = await networkResponse.clone().text();

        if (cachedText !== networkText) {
            await cache.put(url, networkResponse);
        }
    } catch (e) {
        // Ignoruj błędy odświeżania pojedynczego zasobu w tle
    }
}