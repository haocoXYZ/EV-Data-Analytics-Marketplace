package com.dangkhoa.superapp.swp391_fa25.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DataConsumer")
public class DataConsumer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int consumerId;
    private int userId;
    private String organization_name;
    private String contact_person;
    private String billing_email;
    private LocalDateTime createdAt;

}
