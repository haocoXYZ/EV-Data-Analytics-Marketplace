<<<<<<< HEAD
package com.dangkhoa.superapp.swp391_fa25.resfulcontroller;


import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import com.dangkhoa.superapp.swp391_fa25.entity.User;
import com.dangkhoa.superapp.swp391_fa25.service.impl.DatasetServiceImpl;
import com.dangkhoa.superapp.swp391_fa25.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consumer")

public class DataConsumerController {
    // hóa đơn
    // dataset
    // map
    // profile
    @Autowired
    private  UserServiceImpl service;
    @Autowired
    private  DatasetServiceImpl dataService;


    @GetMapping("/consumer/dataset")
    public List<Dataset> getAllDatasets() {

        return dataService.getAllDatasets();
    }
    @GetMapping("/consumer/dataset/{datasetId}")
    public Dataset getDatasetById(@PathVariable int datasetId) {
        return dataService.getDatasetById(datasetId);  // Trả về Dataset chi tiết dựa trên ID
    }

}
=======
package com.dangkhoa.superapp.swp391_fa25.resfulcontroller;


import com.dangkhoa.superapp.swp391_fa25.entity.Dataset;
import com.dangkhoa.superapp.swp391_fa25.entity.User;
import com.dangkhoa.superapp.swp391_fa25.service.impl.DatasetServiceImpl;
import com.dangkhoa.superapp.swp391_fa25.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/consumer")

public class DataConsumerController {
    // hóa đơn
    // dataset
    // map
    // profile
    @Autowired
    private  UserServiceImpl service;
    @Autowired
    private  DatasetServiceImpl dataService;


    @GetMapping("/consumer/dataset")
    public List<Dataset> getAllDatasets() {
        return dataService.getAllDatasets();
    }


}
>>>>>>> 1ebd13cbb96164f00dc43c0f7424e476f56247ab
