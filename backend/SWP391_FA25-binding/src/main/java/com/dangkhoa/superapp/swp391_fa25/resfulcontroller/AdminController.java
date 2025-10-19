package com.dangkhoa.superapp.swp391_fa25.resfulcontroller;


import com.dangkhoa.superapp.swp391_fa25.entity.User;
import com.dangkhoa.superapp.swp391_fa25.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private UserServiceImpl service;

    @GetMapping("/admin/account")
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

}
