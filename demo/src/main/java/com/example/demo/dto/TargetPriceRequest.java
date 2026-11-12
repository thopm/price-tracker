package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TargetPriceRequest(

        @NotNull(message = "Целевая цена обязательна")
        @DecimalMin(value = "0.01", message = "Целевая цена должна быть больше нуля")
        BigDecimal targetPrice

) {}