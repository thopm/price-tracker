const API_URL = "http://localhost:8080/api";

let allProducts = [];
let activeFilter = "all";

const elements = {
    addButton: document.getElementById("addProduct"),
    result: document.getElementById("result"),
    products: document.getElementById("products"),
    search: document.getElementById("search"),
    totalCount: document.getElementById("totalCount"),
    wbCount: document.getElementById("wbCount"),
    ozonCount: document.getElementById("ozonCount"),
    visibleCount: document.getElementById("visibleCount"),
    connection: document.getElementById("connection"),
    connectionText: document.getElementById("connectionText"),
    letuCount: document.getElementById("letuCount")
};

// -------------------- УВЕДОМЛЕНИЯ --------------------

function showMessage(message, type = "") {
    elements.result.textContent = message;
    elements.result.className = `message visible ${type}`;

    if (type === "success") {
        setTimeout(() => {
            elements.result.classList.remove("visible");
        }, 3500);
    }
}

// -------------------- СОЕДИНЕНИЕ С BACKEND --------------------

function setConnectionStatus(online) {
    elements.connection.classList.toggle("offline", !online);
    elements.connectionText.textContent = online ? "ОНЛАЙН" : "НЕТ СВЯЗИ";
}

async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Ошибка сервера: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// -------------------- МАГАЗИНЫ --------------------

function getStoreType(product) {
    const store = product.store || {};

    const parserType = (store.parserType || "").toUpperCase();
    const storeName = (store.name || product.storeName || "").toLowerCase();

    if (parserType === "WILDBERRIES" ||
        storeName.includes("wildberries")) {
        return "wildberries";
    }

    if (parserType === "OZON" ||
        storeName.includes("ozon")) {
        return "ozon";
    }

    if (parserType === "LETU" ||
        storeName.includes("летуаль") ||
        storeName.includes("л'этуаль") ||
        storeName.includes("letu")) {
        return "letu";
    }

    return "other";
}

function getStoreName(product) {
    const type = getStoreType(product);

    if (type === "wildberries") return "Wildberries";
    if (type === "ozon") return "Ozon";
    if (type === "letu") return "Л'Этуаль";

    return product.store?.name || product.storeName || "Другой магазин";
}

// -------------------- СТАТИСТИКА --------------------

function updateStatistics() {
    const wb = allProducts.filter(p => getStoreType(p) === "wildberries").length;
    const ozon = allProducts.filter(p => getStoreType(p) === "ozon").length;
    const letu = allProducts.filter(p => getStoreType(p) === "letu").length;


    elements.totalCount.textContent = allProducts.length;
    elements.wbCount.textContent = wb;
    elements.ozonCount.textContent = ozon;
    elements.letuCount.textContent = letu;
}

// -------------------- ЗАГРУЗКА ТОВАРОВ --------------------

async function loadProducts() {
    try {
        const products = await apiRequest("/products");

        allProducts = Array.isArray(products) ? products : [];

        setConnectionStatus(true);
        updateStatistics();
        renderProducts();

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);

        setConnectionStatus(false);
        elements.visibleCount.textContent = "Ошибка";
        elements.products.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⚠</span>
                Не удалось подключиться к серверу.<br>
                Убедись, что Price Tracker запущен.
            </div>
        `;
    }
}

// -------------------- ФИЛЬТРАЦИЯ --------------------
function getFilteredProducts() {
    const search = elements.search.value.trim().toLowerCase();

    return allProducts.filter(product => {
        const type = getStoreType(product);

        const reached =
            product.targetPrice != null &&
            Number(product.currentPrice) <= Number(product.targetPrice);

        const matchesSearch =
            !search || product.name.toLowerCase().includes(search);

        let matchesFilter = true;

        if (activeFilter === "wildberries") {
            matchesFilter = type === "wildberries";
        } else if (activeFilter === "ozon") {
            matchesFilter = type === "ozon";
        } else if (activeFilter === "letu") {
            matchesFilter = type === "letu";
        } else if (activeFilter === "reached") {
            matchesFilter = reached;
        }

        return matchesSearch && matchesFilter;
    });
}

// -------------------- ОТОБРАЖЕНИЕ ТОВАРОВ --------------------

function renderProducts() {
    const filtered = getFilteredProducts();

    elements.visibleCount.textContent =
        `${filtered.length} из ${allProducts.length}`;

    if (filtered.length === 0) {
        elements.products.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⌕</span>
                ${allProducts.length === 0
                    ? "Пока нет товаров.<br>Добавь первый товар с открытой страницы."
                    : "Товары не найдены."}
            </div>
        `;
        return;
    }

    const groups = {
        wildberries: [],
        ozon: [],
        letu: [],
        other: []
    };

    filtered.forEach(product => {
        groups[getStoreType(product)].push(product);
    });

    elements.products.innerHTML = "";

    const groupOrder = [
        ["wildberries", "WILDBERRIES"],
        ["ozon", "OZON"],
        ["letu", "Л'ЭТУАЛЬ"],
        ["other", "ДРУГИЕ МАГАЗИНЫ"]
    ];

    groupOrder.forEach(([type, title]) => {
        if (groups[type].length === 0) return;

        const section = document.createElement("section");
        section.className = "store-section";

        const heading = document.createElement("div");
        heading.className = "store-heading";

        const dot = document.createElement("span");
        dot.className = `store-dot ${type === "other" ? "" : type}`;

        const headingText = document.createElement("span");
        headingText.textContent = title;

        heading.append(dot, headingText);
        section.appendChild(heading);

        groups[type].forEach(product => {
            section.appendChild(createProductCard(product));
        });

        elements.products.appendChild(section);
    });
}

// -------------------- КАРТОЧКА ТОВАРА --------------------

function createProductCard(product) {
    const currentPrice = Number(product.currentPrice);
    const targetPrice = product.targetPrice == null
        ? null
        : Number(product.targetPrice);

    const reached =
        targetPrice !== null &&
        currentPrice <= targetPrice;

    const card = document.createElement("article");
    card.className = `product ${reached ? "target-reached" : ""}`;

    const top = document.createElement("div");
    top.className = "product-top";

    const name = document.createElement("a");
    name.className = "product-name";
    name.textContent = product.name;
    name.href = product.url;
    name.target = "_blank";
    name.rel = "noopener noreferrer";
    name.title = "Открыть товар";

    const badge = document.createElement("span");
    badge.className = `product-badge ${reached ? "reached" : ""}`;
    badge.textContent = reached ? "ЦЕЛЬ ДОСТИГНУТА" : getStoreName(product);

    top.append(name, badge);

    const priceRow = document.createElement("div");
    priceRow.className = "price-row";

    const price = document.createElement("div");
    price.className = "current-price";
    price.textContent = formatPrice(currentPrice);

    const targetLabel = document.createElement("div");
    targetLabel.className = "target-label";

    const targetCaption = document.createElement("span");
    targetCaption.textContent = "Целевая цена";

    const targetValue = document.createElement("strong");
    targetValue.className = targetPrice === null ? "unset" : "";
    targetValue.textContent = targetPrice === null
        ? "Не задана"
        : formatPrice(targetPrice);

    targetLabel.append(targetCaption, targetValue);
    priceRow.append(price, targetLabel);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const input = document.createElement("input");
    input.className = "target-input";
    input.type = "number";
    input.min = "0.01";
    input.step = "0.01";
    input.placeholder = "Новая целевая цена";

    const saveButton = document.createElement("button");
    saveButton.className = "small-button";
    saveButton.textContent = "Сохранить";
    saveButton.hidden = true;

    // Кнопка «Сохранить» появляется только когда в поле что-то введено
    input.addEventListener("input", () => {
        saveButton.hidden = input.value.trim() === "";
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !saveButton.hidden) {
            saveButton.click();
        }
    });

    saveButton.addEventListener("click", async () => {
        const value = Number(input.value);

        if (!Number.isFinite(value) || value <= 0) {
            showMessage("Введи корректную целевую цену.", "error");
            return;
        }

        saveButton.disabled = true;

        try {
            await apiRequest(`/products/${product.id}/target-price`, {
                method: "PATCH",
                body: JSON.stringify({ targetPrice: value })
            });

            showMessage("Целевая цена обновлена.", "success");
            await loadProducts();

        } catch (error) {
            console.error(error);
            showMessage("Не удалось изменить целевую цену.", "error");
        } finally {
            saveButton.disabled = false;
        }
    });

    const historyButton = document.createElement("button");
    historyButton.className = "small-button";
    historyButton.textContent = "История";

    historyButton.addEventListener("click", () => {
        toggleHistory(product.id, card);
    });

    const deleteButton = document.createElement("button");
deleteButton.className = "small-button delete-button icon-button";
deleteButton.title = "Удалить товар";
deleteButton.setAttribute("aria-label", "Удалить товар");
deleteButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/>
        <path d="M14 11v6"/>
    </svg>
`;

deleteButton.addEventListener("click", async () => {
    const confirmed = confirm(
        `Удалить товар "${product.name}" и всю историю его цен?`
    );

    if (!confirmed) return;

    deleteButton.disabled = true;

        try {
            await apiRequest(`/products/${product.id}`, {
                method: "DELETE"
            });

            showMessage("Товар успешно удалён.", "success");
            await loadProducts();

        } catch (error) {
            console.error(error);
            showMessage("Не удалось удалить товар.", "error");
            deleteButton.disabled = false;
        }
    });

    actions.append(input, saveButton, historyButton, deleteButton);

    card.append(top, priceRow, actions);

    return card;
}

// -------------------- ФОРМАТИРОВАНИЕ ЦЕНЫ --------------------

function formatPrice(price) {
    if (price == null || !Number.isFinite(Number(price))) {
        return "—";
    }

    return `${Number(price).toLocaleString("ru-RU", {
        maximumFractionDigits: 2
    })} ₽`;
}

// -------------------- ИСТОРИЯ ЦЕН --------------------

async function toggleHistory(productId, card) {
    const existing = card.querySelector(".price-history");

    if (existing) {
        existing.remove();
        return;
    }

    const container = document.createElement("div");
    container.className = "price-history";
    container.textContent = "Загрузка истории...";

    card.appendChild(container);

    try {
        const history = await apiRequest(`/price-history/${productId}`);

        if (!Array.isArray(history) || history.length === 0) {
            container.textContent = "История цен пока пуста.";
            return;
        }

        renderHistory(history, container);

    } catch (error) {
        console.error(error);
        container.textContent = "Не удалось загрузить историю.";
    }
}

function renderHistory(history, container) {
    const sorted = [...history].sort((a, b) =>
        new Date(a.recordedAt) - new Date(b.recordedAt)
    );

    container.innerHTML = "";

    const chartTitle = document.createElement("div");
    chartTitle.className = "section-title";
    chartTitle.textContent = "Изменение цены";

    const chartWrap = document.createElement("div");
    chartWrap.className = "chart-wrap";
    chartWrap.innerHTML = createPriceChart(sorted);

    const labels = document.createElement("div");
    labels.className = "chart-labels";

    labels.innerHTML = `
        <span>${formatDate(sorted[0].recordedAt)}</span>
        <span>${formatDate(sorted[sorted.length - 1].recordedAt)}</span>
    `;

    const entries = document.createElement("div");

    sorted.slice().reverse().forEach(item => {
        const entry = document.createElement("div");
        entry.className = "history-entry";

        const date = document.createElement("span");
        date.textContent = formatDate(item.recordedAt);

        const price = document.createElement("strong");
        price.textContent = formatPrice(item.price);

        entry.append(date, price);
        entries.appendChild(entry);
    });

    container.append(chartTitle, chartWrap, labels, entries);
}

// -------------------- ГРАФИК --------------------

function createPriceChart(history) {
    const width = 350;
    const height = 130;
    const padding = 12;

    const prices = history.map(item => Number(item.price));

    if (prices.length === 0) return "";

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map((price, index) => {
        const x = padding +
            (index / Math.max(prices.length - 1, 1)) *
            (width - padding * 2);

        const y = height - padding -
            ((price - min) / range) *
            (height - padding * 2);

        return `${x},${y}`;
    });

    const polyline = points.join(" ");

    const circles = points.map(point => {
        const [x, y] = point.split(",");
        return `<circle cx="${x}" cy="${y}" r="3" fill="#39e6c1"/>`;
    }).join("");

    return `
        <svg viewBox="0 0 ${width} ${height}"
             width="100%"
             xmlns="http://www.w3.org/2000/svg">

            <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#39e6c1" stop-opacity=".25"/>
                    <stop offset="100%" stop-color="#39e6c1" stop-opacity="0"/>
                </linearGradient>
            </defs>

            <polyline
                points="${polyline}"
                fill="none"
                stroke="#39e6c1"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            ${circles}
        </svg>
    `;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// -------------------- ДОБАВЛЕНИЕ ТОВАРА --------------------

async function addProduct() {
    elements.addButton.disabled = true;
    showMessage("Получаем данные товара...");

    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab?.id || !tab.url) {
            throw new Error("Не удалось определить открытую страницу.");
        }

        const hostname = new URL(tab.url).hostname;

        let storeType;

        if (hostname === "www.wildberries.ru") {
            storeType = "WILDBERRIES";
        } else if (hostname === "www.ozon.ru") {
            storeType = "OZON";
        } else if (hostname === "www.letu.ru" || hostname === "letu.ru") {
            storeType = "LETU";
        } else {
            throw new Error("Открой страницу товара Wildberries, Ozon или Л'Этуаль.");
        }

        const stores = await apiRequest("/stores");

        const store = stores.find(s =>
            s.parserType === storeType
        );

        if (!store) {
            throw new Error(`Магазин ${storeType} не найден в базе.`);
        }

        const response = await chrome.tabs.sendMessage(tab.id, {
            action: "GET_PRODUCT"
        });

        if (!response || response.error) {
            throw new Error(response?.error || "Не удалось получить данные товара.");
        }

        const existingProduct = allProducts.find(product =>
            product.url === response.url
        );

        if (existingProduct) {
            await apiRequest("/products/price-by-url", {
                method: "PATCH",
                body: JSON.stringify({
                    url: response.url,
                    price: response.price
                })
            });

            showMessage("Цена существующего товара обновлена.", "success");

        } else {
            await apiRequest(`/products?storeId=${store.id}`, {
                method: "POST",
                body: JSON.stringify({
                    name: response.title,
                    url: response.url,
                    currentPrice: response.price
                })
            });

            showMessage("Товар успешно добавлен!", "success");
        }

        await loadProducts();

    } catch (error) {
        console.error("Ошибка добавления товара:", error);
        showMessage(error.message || "Не удалось добавить товар.", "error");

    } finally {
        elements.addButton.disabled = false;
    }
}

// -------------------- СОБЫТИЯ --------------------

elements.addButton.addEventListener("click", addProduct);

elements.search.addEventListener("input", renderProducts);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderProducts();
    });
});

// -------------------- ЗАПУСК --------------------

loadProducts();