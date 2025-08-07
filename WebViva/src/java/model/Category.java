package model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String icon;
    private String gender; // For DYNEX clothing categories
    
    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Constructors
    public Category() {}

    public Category(String name, String description, String icon) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.createdAt = new Date();
        this.isActive = true;
    }
    
    // Constructor for DYNEX clothing categories with gender
    public Category(String name, String description, String icon, String gender) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.gender = gender;
        this.createdAt = new Date();
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
