package com.dangkhoa.superapp.swp391_fa25.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="Dataset")
@NoArgsConstructor
@Data
public class Dataset {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int dataset_id;
    private int provider_id;
    private int port_id;
    private String name;
    private String description;
    private String category;
    private double price;
    private String access_type;
    private String data_format;
    private double data_size_mb;
    private LocalDateTime upload_date;
    private LocalDateTime last_updated;
    private String status;
    private String visibility;

    public Dataset(int provider_id, int port_id, String name, String description, String category, double price, String access_type, String data_format, double data_size_mb, LocalDateTime upload_date, LocalDateTime last_updated, String status, String visibility) {
        this.provider_id = provider_id;
        this.port_id = port_id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.access_type = access_type;
        this.data_format = data_format;
        this.data_size_mb = data_size_mb;
        this.upload_date = upload_date;
        this.last_updated = last_updated;
        this.status = status;
        this.visibility = visibility;
    }

}
