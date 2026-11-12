
package com.example.demo.controller;

import com.example.demo.dto.PriceUpdateByUrlRequest;
import com.example.demo.dto.PriceUpdateRequest;
import com.example.demo.dto.ProductRequest;
import com.example.demo.dto.ProductResponse;
import com.example.demo.dto.TargetPriceRequest;
import com.example.demo.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping
    public ProductResponse createProduct(
            @Valid @RequestBody ProductRequest product,
            @RequestParam Long storeId
    ) {
        return productService.createProduct(product, storeId);
    }

    @PatchMapping("/{id}/price")
    public void updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody PriceUpdateRequest request
    ) {
        productService.updatePrice(id, request.price());
    }

    @PatchMapping("/{id}/target-price")
    public ProductResponse updateTargetPrice(@PathVariable Long id, @Valid @RequestBody TargetPriceRequest request) {
        return productService.updateTargetPrice(id, request.targetPrice());
    }

    @GetMapping("/target-reached")
    public List<ProductResponse> getProductsWithReachedTargetPrice() {
        return productService.getProductsWithReachedTargetPrice();
    }

    @PatchMapping("/price-by-url")
    public ProductResponse updatePriceByUrl(
            @Valid @RequestBody PriceUpdateByUrlRequest request
    ) {
        return productService.updatePriceByUrl(
                request.url(),
                request.price()
        );
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
