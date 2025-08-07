package model;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_sizes")
public class ProductSize {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "product_id")
    private Long productId;
    
    private String size;
    
    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;
    
    @Column(name = "additional_price")
    private BigDecimal additionalPrice = BigDecimal.ZERO;

    // Constructors
    public ProductSize() {}

    public ProductSize(Long productId, String size, Integer stockQuantity) {
        this.productId = productId;
        this.size = size;
        this.stockQuantity = stockQuantity;
    }

    public ProductSize(Long productId, String size, Integer stockQuantity, BigDecimal additionalPrice) {
        this.productId = productId;
        this.size = size;
        this.stockQuantity = stockQuantity;
        this.additionalPrice = additionalPrice;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public BigDecimal getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(BigDecimal additionalPrice) {
        this.additionalPrice = additionalPrice;
    }

    // Utility methods
    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }
}
