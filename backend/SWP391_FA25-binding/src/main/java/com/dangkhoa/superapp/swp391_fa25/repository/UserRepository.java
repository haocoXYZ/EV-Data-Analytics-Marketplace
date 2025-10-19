package com.dangkhoa.superapp.swp391_fa25.repository;

import com.dangkhoa.superapp.swp391_fa25.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User,Integer> {

    User findUserByUserId(int userId);

    User findUserByEmail(String email);
}
