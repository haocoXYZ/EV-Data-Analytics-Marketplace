package com.dangkhoa.superapp.swp391_fa25.service.impl;


import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import com.dangkhoa.superapp.swp391_fa25.repository.DatasetRepository;
import com.dangkhoa.superapp.swp391_fa25.service.DatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

        return repo.findAll() ;
    }


}
