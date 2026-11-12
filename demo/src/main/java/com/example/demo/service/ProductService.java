
package com.example.demo.service;

import com.example.demo.dto.ProductRequest;
import com.example.demo.dto.ProductResponse;
import com.example.demo.entity.PriceHistory;
import com.example.demo.entity.Product;
import com.example.demo.entity.Store;
import com.example.demo.repository.PriceHistoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public ProductService( ProductRepository productRepository, StoreRepository storeRepository, PriceHistoryRepository priceHistoryRepository ) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, Long storeId) {
        Product product = new Product();
        product.setName(request.name());
        product.setUrl(request.url());
        product.setCurrentPrice(request.currentPrice());
        product.setTargetPrice(request.targetPrice());
        
        if (productRepository.existsByUrl(product.getUrl())) {
            throw new IllegalArgumentException("Товар с такой ссылкой уже существует");
        }

        Store store = storeRepository.findById(storeId).orElseThrow(() -> new IllegalArgumentException("Магазин не найден"));
        product.setStore(store);
        product.setLastCheckedAt(LocalDateTime.now());
        Product savedProduct = productRepository.save(product);

        PriceHistory history = new PriceHistory();
        history.setProduct(savedProduct);
        history.setPrice(savedProduct.getCurrentPrice());
        history.setRecordedAt(LocalDateTime.now());

        priceHistoryRepository.save(history);

        return toResponse(savedProduct);
    }

    @Transactional
    public void updatePrice(Long productId, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        if (product.getCurrentPrice().compareTo(newPrice) == 0) {
            return;
        }

        product.setCurrentPrice(newPrice);
        product.setLastCheckedAt(LocalDateTime.now());

        PriceHistory history = new PriceHistory();
        history.setProduct(product);
        history.setPrice(newPrice);
        history.setRecordedAt(LocalDateTime.now());

        priceHistoryRepository.save(history);
    }

    @Transactional
    public ProductResponse updatePriceByUrl(String url, BigDecimal newPrice) {
        Product product = productRepository.findByUrl(url)
                .orElseThrow(() -> new IllegalArgumentException("Товар не найден"));

        updatePrice(product.getId(), newPrice);

        return toResponse(product);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getUrl(),
                product.getCurrentPrice(),
                product.getTargetPrice(),
                product.getLastCheckedAt(),
                product.getStore().getName()
        );
    }

    @Transactional
    public ProductResponse updateTargetPrice(Long productId, BigDecimal targetPrice) {
        Product product = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Товар не найден"));

        product.setTargetPrice(targetPrice);

        return toResponse(product);
    }

    public List<ProductResponse> getProductsWithReachedTargetPrice() {
        return productRepository.findProductsWithReachedTargetPrice()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Товар не найден"));

        List<PriceHistory> history =
                priceHistoryRepository.findAllByProductIdOrderByRecordedAtDesc(productId);

        priceHistoryRepository.deleteAll(history);
        productRepository.delete(product);
    }
}
