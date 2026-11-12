
package com.example.demo.controller;

import com.example.demo.entity.Store;
import com.example.demo.service.StoreService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) { this.storeService = storeService; }

    @GetMapping
    public List<Store> getAllStores() { return storeService.getAllStores(); }

    @PostMapping
    public Store createStore(@RequestBody Store store) { return storeService.createStore(store); }
}
