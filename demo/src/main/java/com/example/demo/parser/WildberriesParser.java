
package com.example.demo.parser;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Component
public class WildberriesParser implements ProductParser {
    private final RestClient restClient;

    public WildberriesParser() {
        this.restClient = RestClient.builder().baseUrl("https://card.wb.ru").defaultHeader("User-Agent", "Mozilla/5.0").build();
    }

    @Override
    public BigDecimal getPrice(String url) {
        String productId = url.replaceAll(".*/catalog/(\\d+)/detail\\.aspx.*","$1");

        if (!productId.matches("\\d+")) { throw new IllegalArgumentException("Некорректная ссылка Wildberries"); }

        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/cards/v4/detail")
                        .queryParam("appType", 1)
                        .queryParam("curr", "rub")
                        .queryParam("dest", "-1257786")
                        .queryParam("spp", 30)
                        .queryParam("nm", productId)
                        .build())
                .header("Accept", "application/json")
                .header("Origin", "https://www.wildberries.ru")
                .header("Referer", "https://www.wildberries.ru/")
                .header("Accept-Language", "ru-RU,ru;q=0.9")
                .retrieve()
                .body(JsonNode.class);

        JsonNode products = response.path("products");

        if (!products.isArray() || products.isEmpty()) {
            throw new RuntimeException("Товар не найден на Wildberries");
        }

        JsonNode sizes = products.get(0).path("sizes");

        for (JsonNode size : sizes) {
            JsonNode price = size.path("price").path("product");

            if (!price.isMissingNode() && !price.isNull()) {
                return new BigDecimal(price.asText()).movePointLeft(2);
            }
        }

        throw new RuntimeException("Цена товара не найдена");
    }
}
