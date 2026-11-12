
package com.example.demo.controller;

import com.example.demo.dto.PriceHistoryResponse;
import com.example.demo.service.PriceHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-history")
public class PriceHistoryController {
    private final PriceHistoryService priceHistoryService;

    public PriceHistoryController(PriceHistoryService priceHistoryService) {
        this.priceHistoryService = priceHistoryService;
    }

    @GetMapping("/{productId}")
    public List<PriceHistoryResponse> getProductHistory(@PathVariable Long productId) {
        return priceHistoryService.getProductHistory(productId);
    }
}
