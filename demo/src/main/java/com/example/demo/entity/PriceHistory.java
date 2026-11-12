
package com.example.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history")
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public PriceHistory() { }

    public Long getId() { return id; }

    public BigDecimal getPrice() { return price; }

    public LocalDateTime getRecordedAt() { return recordedAt; }

    public Product getProduct() { return product; }

    public void setPrice(BigDecimal price) { this.price = price; }

    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }

    public void setProduct(Product product) { this.product = product; }
}
