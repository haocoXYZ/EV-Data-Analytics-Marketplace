package com.dangkhoa.superapp.swp391_fa25.service;


import com.dangkhoa.superapp.swp391_fa25.entity.User;

import java.util.List;

public interface UserService {
    public User findByEmailAndPassword(String email, String password);
   // public User findByEmail(String email);
    List<User> findByStatus(String status);
    List<User> getAll();}

