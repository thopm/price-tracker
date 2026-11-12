
package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String baseUrl;

    @Column(nullable = false)
    private String parserType;

    public Store() { }

    public Long getId() { return id; }

    public String getName() { return name; }

    public String getBaseUrl() { return baseUrl; }

    public String getParserType() { return parserType; }

    public void setName(String name) { this.name = name; }

    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public void setParserType(String parserType) { this.parserType = parserType; }
}
