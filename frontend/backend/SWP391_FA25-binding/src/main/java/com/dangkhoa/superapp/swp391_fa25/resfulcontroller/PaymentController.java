package com.dangkhoa.superapp.swp391_fa25.resfulcontroller;


import com.dangkhoa.superapp.swp391_fa25.entity.Payment;
import com.dangkhoa.superapp.swp391_fa25.service.PaymentService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest request) {
        Payment payment = paymentService.createPayment(
                request.getConsumerId(),
                request.getAmount(),
                request.getMethod(),
                request.getType(),
                request.getNote()
        );
        return ResponseEntity.ok(payment);
    }

    @Data
    public static class PaymentRequest {
        private int consumerId;
        private double amount;
        private String method;
        private String type;
        private String note;
    }
}
