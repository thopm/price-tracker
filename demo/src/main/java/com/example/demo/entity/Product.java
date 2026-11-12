
package com.example.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 2048)
    private String url;

    @Column(precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal targetPrice;

    private LocalDateTime lastCheckedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    public Product() { }

    public Long getId() { return id; }

    public String getName() { return name; }

    public String getUrl() { return url; }

    public BigDecimal getCurrentPrice() { return currentPrice; }

    public BigDecimal getTargetPrice() { return targetPrice; }

    public LocalDateTime getLastCheckedAt() { return lastCheckedAt; }

    public Store getStore() { return store; }

    public void setName(String name) { this.name = name; }

    public void setUrl(String url) { this.url = url; }

    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice;}

    public void setTargetPrice(BigDecimal targetPrice) {this.targetPrice = targetPrice; }

    public void setLastCheckedAt(LocalDateTime lastCheckedAt) {this.lastCheckedAt = lastCheckedAt;}

    public void setStore(Store store) {this.store = store; }
}
