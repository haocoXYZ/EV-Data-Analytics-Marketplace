package com.dangkhoa.superapp.swp391_fa25.service.impl;


import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import com.dangkhoa.superapp.swp391_fa25.repository.DatasetRepository;
import com.dangkhoa.superapp.swp391_fa25.service.DatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatasetServiceImpl implements DatasetService {
    @Autowired
    private  DatasetRepository repo;

   /* @Override
    public List<Dataset> findDatasetByDataset_id(int dataset_id) {
        return repo.findDatasetByDataset_id(dataset_id);
    }*/

    @Override
    public List<Dataset> getAllDatasets() {
        List<Dataset> datasets = repo.findAll();
        // Lọc chỉ lấy name và datasetId
        return datasets.stream()
                .map(dataset -> new Dataset(dataset.getDataset_id(), dataset.getName()))  // Trả về chỉ id và name
                .collect(Collectors.toList());
    }
    //return repo.findAll() ;

    @Override
    public Dataset getDatasetById(int datasetId) {
        return repo.findById(datasetId).orElse(null);  // Trả về dataset đầy đủ khi nhận được datasetId
    }



}
