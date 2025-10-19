package com.dangkhoa.superapp.swp391_fa25.repository;

import com.dangkhoa.superapp.swp391_fa25.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface PaymentRepository extends JpaRepository<Payment,Integer> {

}
