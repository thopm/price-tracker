
package com.example.demo.service;

import com.example.demo.dto.PriceHistoryResponse;
import com.example.demo.repository.PriceHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceHistoryService {
    private final PriceHistoryRepository priceHistoryRepository;

    public PriceHistoryService(PriceHistoryRepository priceHistoryRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
    }

    public List<PriceHistoryResponse> getProductHistory(Long productId) {
        return priceHistoryRepository.findAllByProductIdOrderByRecordedAtDesc(productId).stream().map(history -> new PriceHistoryResponse(
                        history.getId(),
                        history.getPrice(),
                        history.getRecordedAt()
                )).toList();
    }
}
