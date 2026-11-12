package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PriceUpdateByUrlRequest(
        @NotBlank String url,
        @NotNull @DecimalMin("0.01") BigDecimal price
) {}