
package com.example.demo.parser;

import java.math.BigDecimal;

public interface ProductParser {
    BigDecimal getPrice(String url);
}
