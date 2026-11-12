
console.log("Price Tracker: content.js загружен");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "GET_PRODUCT") {
        let titleElement;
        let priceElement;
        let priceText;

        const hostname = window.location.hostname;

        // Wildberries
        if (hostname === "www.wildberries.ru") {
            titleElement = document.querySelector("h2.productTitle--ktP8Z");
            priceElement = document.querySelector('[data-testid="product-price-final"]');
            priceText = priceElement?.textContent;
        }

        // Ozon
        if (hostname === "www.ozon.ru") {
            titleElement = document.querySelector("h1.pdp_bj8");
            priceElement = document.querySelector("span.pdp_j2b");
            priceText = priceElement?.textContent;
        }

        // Л'Этуаль
        if (hostname === "www.letu.ru" || hostname === "letu.ru") {
            titleElement = document.querySelector("h1");
            priceElement = document.querySelector('meta[itemprop="price"]');
            priceText = priceElement?.content;
        }

        if (!titleElement || !priceElement) {
            sendResponse({
                error: "Не удалось найти название или цену товара"
            });
            return;
        }

        const title = titleElement.textContent.trim();

        const normalizedPrice = priceText
            ?.replace(/\s/g, "")
            .replace(/[^\d,\.]/g, "")
            .replace(",", ".");

        const price = Number(normalizedPrice);

        if (!title || !Number.isFinite(price) || price <= 0) {
            sendResponse({
                error: "Некорректные данные товара"
            });
            return;
        }

        sendResponse({
            url: window.location.href,
            title,
            price
        });
    }

    return true;
});
