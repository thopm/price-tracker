
package com.example.demo.service;

import com.example.demo.entity.Store;
import com.example.demo.repository.StoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreService(StoreRepository storeRepository) { this.storeRepository = storeRepository; }

    public List<Store> getAllStores() { return storeRepository.findAll(); }

    public Store createStore(Store store) { return storeRepository.save(store); }
}
