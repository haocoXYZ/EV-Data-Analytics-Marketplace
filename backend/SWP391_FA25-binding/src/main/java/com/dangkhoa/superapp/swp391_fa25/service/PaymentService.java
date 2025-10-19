package com.dangkhoa.superapp.swp391_fa25.service;

import com.dangkhoa.superapp.swp391_fa25.entity.Payment;
import java.math.BigDecimal;

public interface PaymentService {
    Payment createPayment(int consumerId, BigDecimal amount, String method, String type, String note);}
