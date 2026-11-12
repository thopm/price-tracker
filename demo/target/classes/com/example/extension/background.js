
console.log("Price Tracker background.js запущен");
chrome.alarms.clear("priceCheck");

const API_URL = "http://localhost:8080/api";
const CHECK_INTERVAL_MINUTES = 60;

// const NATIVE_HOST = "com.pricetracker.host";

// function connectToHost() {
//     const port = chrome.runtime.connectNative(NATIVE_HOST);

//     port.onMessage.addListener((message) => {
//         console.log("Ответ Native Host:", message);

//         if (message.status === "READY") {
//             checkAllProducts();
//         }

//         if (message.status === "ERROR") {
//             console.error(message.message);
//         }
//     });

//     port.onDisconnect.addListener(() => {
//         console.log(
//             "Native Host отключён:",
//             chrome.runtime.lastError?.message
//         );
//     });

//     port.postMessage({ action: "PING" });
// }

let isChecking = false;

// Настройка периодической проверки
async function setupAlarm() {
    const alarm = await chrome.alarms.get("priceCheck");

    if (!alarm) {
        chrome.alarms.create("priceCheck", {
            periodInMinutes: CHECK_INTERVAL_MINUTES
        });
    }
}

// // Установка расширения или обновление
// chrome.runtime.onInstalled.addListener(() => {
//     setupAlarm();
// });

// Запуск браузера
// chrome.runtime.onStartup.addListener(async () => {
//     console.log("Chrome запущен.");

//     connectToHost();

//     await setupAlarm();
// });

// Проверка по таймеру
// chrome.alarms.onAlarm.addListener((alarm) => {
//     if (alarm.name === "priceCheck") {
//         console.log("Сработал таймер проверки цен");
//         checkAllProducts();
//     }
// });

// Ожидание загрузки страницы
async function waitForTabLoad(tabId) {
    const tab = await chrome.tabs.get(tabId);

    if (tab.status === "complete") {
        return;
    }

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            reject(new Error("Превышено время загрузки"));
        }, 60000);

        function listener(updatedTabId, changeInfo) {
            if (updatedTabId === tabId && changeInfo.status === "complete") {
                clearTimeout(timeout);
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        }

        chrome.tabs.onUpdated.addListener(listener);
    });
}

// Проверка всех товаров
async function checkAllProducts() {
    if (isChecking) {
        console.log("Проверка уже выполняется");
        return;
    }

    isChecking = true;

    try {
        console.log("Начинаю проверку товаров...");

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Не удалось получить список товаров");
        }

        const products = await response.json();

        const supportedProducts = products.filter(product =>
            product.url &&
            (
                product.url.includes("wildberries.ru") ||
                product.url.includes("ozon.ru") ||
                product.url.includes("letu.ru")
            )
        );

        console.log("Всего товаров для проверки:", supportedProducts.length);

        for (const product of supportedProducts) {
            let tab;

            try {
                console.log("Проверяю:", product.name);

                tab = await chrome.tabs.create({
                    url: product.url,
                    active: false
                });

                await waitForTabLoad(tab.id);

                // Ждём появления данных товара
                await new Promise(resolve => setTimeout(resolve, 5000));

                const data = await chrome.tabs.sendMessage(tab.id, {
                    action: "GET_PRODUCT"
                });

                if (!data || data.error) {
                    throw new Error(data?.error || "Не удалось получить цену");
                }

                const updateResponse = await fetch(
                    `${API_URL}/products/price-by-url`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            url: product.url,
                            price: data.price
                        })
                    }
                );

                if (!updateResponse.ok) {
                    throw new Error("Не удалось сохранить цену");
                }

                console.log(
                    `Успешно: ${product.name} — ${data.price} ₽`
                );

            } catch (error) {
                console.error(`Ошибка: ${product.name}`, error);

            } finally {
                if (tab?.id) {
                    await chrome.tabs.remove(tab.id).catch(() => {});
                }
            }
        }

        console.log("Проверка всех товаров завершена!");

    } catch (error) {
        console.error("Ошибка проверки товаров:", error);

    } finally {
        isChecking = false;
    }
}
