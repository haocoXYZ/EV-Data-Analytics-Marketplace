package com.dangkhoa.superapp.swp391_fa25.service.impl;


import com.dangkhoa.superapp.swp391_fa25.entity.DataConsumer;
import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import com.dangkhoa.superapp.swp391_fa25.repository.DataConsumerRepository;

import com.dangkhoa.superapp.swp391_fa25.repository.DatasetRepository;
import com.dangkhoa.superapp.swp391_fa25.service.DataConsumerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DataConsummerServiceImpl implements DataConsumerService {
    @Autowired
    private  DataConsumerRepository repo;

    @Override
    public List<DataConsumer> findAll() {
        return repo.findAll();
    }

}