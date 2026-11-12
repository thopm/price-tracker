package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String name,
        String url,
        BigDecimal currentPrice,
        BigDecimal targetPrice,
        LocalDateTime lastCheckedAt,
        String storeName
) {}