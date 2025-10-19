<<<<<<< HEAD
package com.dangkhoa.superapp.swp391_fa25.service;

import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public interface DatasetService {

     List<Dataset> getAllDatasets();
    Dataset getDatasetById(int datasetId);
}
=======
package com.dangkhoa.superapp.swp391_fa25.service;

import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;

import java.util.List;

public interface DatasetService {

    public List<Dataset> getAllDatasets();
}
>>>>>>> 1ebd13cbb96164f00dc43c0f7424e476f56247ab
