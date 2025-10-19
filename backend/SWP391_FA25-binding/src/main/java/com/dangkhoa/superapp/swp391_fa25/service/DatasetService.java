package com.dangkhoa.superapp.swp391_fa25.service;

import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface DatasetService {

     List<Dataset> getAllDatasets();
    Dataset getDatasetById(int datasetId);
}
