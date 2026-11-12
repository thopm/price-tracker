package com.example.demo.config;

import com.example.demo.entity.Store;
import com.example.demo.repository.StoreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StoreInitializer implements CommandLineRunner {

    private final StoreRepository storeRepository;

    public StoreInitializer(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    @Override
    public void run(String... args) {
        createStore(
                "Wildberries",
                "https://www.wildberries.ru",
                "WILDBERRIES"
        );

        createStore(
                "Ozon",
                "https://www.ozon.ru",
                "OZON"
        );
        createStore(
                "Л'Этуаль",
                "https://www.letu.ru",
                "LETU"
        );
    }

    private void createStore(String name, String baseUrl, String parserType) {
        boolean exists = storeRepository.findAll()
                .stream()
                .anyMatch(store -> store.getParserType().equals(parserType));

        if (!exists) {
            Store store = new Store();
            store.setName(name);
            store.setBaseUrl(baseUrl);
            store.setParserType(parserType);

            storeRepository.save(store);

            System.out.println("Добавлен магазин: " + name);
        }
    }
}