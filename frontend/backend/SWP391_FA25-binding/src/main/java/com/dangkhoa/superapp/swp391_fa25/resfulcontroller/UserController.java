package com.dangkhoa.superapp.swp391_fa25.resfulcontroller;

import com.dangkhoa.superapp.swp391_fa25.entity.User;
import com.dangkhoa.superapp.swp391_fa25.service.impl.UserServiceImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/user")

public class UserController {

    private final UserServiceImpl service;

    public UserController(UserServiceImpl service) {
        this.service = service;
    }
    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return service.findByEmailAndPassword(user.getEmail(), user.getPassword());
    }
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.registerUser(user);
    }
    @GetMapping("/admin/account")
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }


}