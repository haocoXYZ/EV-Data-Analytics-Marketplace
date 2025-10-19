
package com.dangkhoa.superapp.swp391_fa25.entity;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "DataConsumer")
@NoArgsConstructor
@Data
public class DataConsumer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int consumerId;
    private int userId;
    private String organization_name;
    private String contact_person;
    private String billing_email;
    private LocalDateTime createdAt;

    public DataConsumer(int userId, String organization_name, String contact_person, String billing_email, LocalDateTime createdAt) {
        this.userId = userId;
        this.organization_name = organization_name;
        this.contact_person = contact_person;
        this.billing_email = billing_email;
        this.createdAt = createdAt;
    }
}




