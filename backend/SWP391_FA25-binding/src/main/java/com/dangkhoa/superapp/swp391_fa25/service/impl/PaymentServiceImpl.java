package com.dangkhoa.superapp.swp391_fa25.service.impl;

import com.dangkhoa.superapp.swp391_fa25.entity.DataConsumer;
import com.dangkhoa.superapp.swp391_fa25.entity.Payment;
import com.dangkhoa.superapp.swp391_fa25.repository.DataConsumerRepository;
import com.dangkhoa.superapp.swp391_fa25.repository.PaymentRepository;
import com.dangkhoa.superapp.swp391_fa25.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DataConsumerRepository consumerRepository;

    @Override
    public Payment createPayment(int consumerId, double amount, String method, String type, String note) {
        DataConsumer consumer = consumerRepository.findById(consumerId)
                .orElseThrow(() -> new RuntimeException("Consumer not found with ID: " + consumerId));

        Payment payment = new Payment();
        payment.setConsumer_id(consumerId);
        payment.setAmount(amount);
        payment.setPayment_method(method);
        payment.setPayment_type(type);
        payment.setStatus("SUCCESS");
        payment.setTransaction_ref(UUID.randomUUID().toString());
        payment.setNotes(note);
        payment.setPayment_date(LocalDateTime.now());

        return paymentRepository.save(payment);
    }
}
