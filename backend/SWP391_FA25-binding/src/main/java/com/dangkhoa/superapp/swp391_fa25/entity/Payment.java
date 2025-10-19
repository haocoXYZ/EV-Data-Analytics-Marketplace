package com.dangkhoa.superapp.swp391_fa25.entity;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table (name = "Payment")
@NoArgsConstructor
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int payment_id;


    private int consumer_id;


    private double amount;

    private LocalDateTime payment_date;
    private String payment_method;
    private String payment_type;
    private String status;
    private String transaction_ref;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    public Payment(int consumer_id, double amount, String payment_method,
                   String payment_type, String status, String transaction_ref, String notes) {
        this.consumer_id = consumer_id;
        this.amount = amount;
        this.payment_method = payment_method;
        this.payment_type = payment_type;
        this.status = status;
        this.transaction_ref = transaction_ref;
        this.notes = notes;
        this.payment_date = LocalDateTime.now();
    }
}
