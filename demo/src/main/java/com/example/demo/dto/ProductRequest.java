package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(

        @NotBlank(message = "Название товара обязательно")
        String name,

        @NotBlank(message = "Ссылка на товар обязательна")
        String url,

        @NotNull(message = "Текущая цена обязательна")
        @DecimalMin(value = "0.01", message = "Цена должна быть больше нуля")
        BigDecimal currentPrice,

        @DecimalMin(value = "0.01", message = "Целевая цена должна быть больше нуля")
        BigDecimal targetPrice

) {}