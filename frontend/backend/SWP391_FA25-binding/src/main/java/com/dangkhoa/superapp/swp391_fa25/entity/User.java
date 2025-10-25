package com.dangkhoa.superapp.swp391_fa25.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Table(name = "[User]")
@Entity
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    private String fullName;

    private String email;

    private String password;

    private String role;

    private LocalDateTime createdAt;

    private String status;



    public User(String fullName, String email, String password, String role, LocalDateTime createdAt, String status) {

        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = createdAt;
        this.status = status;
    }

}