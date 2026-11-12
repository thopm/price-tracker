package com.example.demo.repository;

import com.example.demo.entity.Product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByUrl(String url);

    Optional<Product> findByUrl(String url);

    @Query("""
        SELECT p FROM Product p
        WHERE p.targetPrice IS NOT NULL
        AND p.currentPrice <= p.targetPrice
    """)
    List<Product> findProductsWithReachedTargetPrice();
}