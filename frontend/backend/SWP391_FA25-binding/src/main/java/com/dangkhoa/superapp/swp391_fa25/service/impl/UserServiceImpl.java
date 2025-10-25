package com.dangkhoa.superapp.swp391_fa25.service.impl;


import com.dangkhoa.superapp.swp391_fa25.entity.User;
import com.dangkhoa.superapp.swp391_fa25.repository.UserRepository;
import com.dangkhoa.superapp.swp391_fa25.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository repo;

    /* public User login(String email, String password) {
         if(email.isEmpty() || password.isEmpty()) {
             return null;  // Hoặc bạn có thể ném một ngoại lệ để thông báo lỗi
         }

         // Tìm kiếm người dùng trong cơ sở dữ liệu theo email
         User user = repo.findByEmail(email); // Giả sử repo có phương thức findByEmail

         if(user != null && password.equals(user.getPassword())) {
             return user;  // Đăng nhập thành công, trả về thông tin người dùng
         } else {
             return null;  // Hoặc bạn có thể ném một ngoại lệ để báo lỗi
         }

     }*/
    public User registerUser(User user) {
        if ("DataProvider".equalsIgnoreCase(user.getRole())) {
            user.setStatus("Pending");
        } else  if ("DataConsumer".equalsIgnoreCase(user.getRole())){
            user.setStatus("Active");
        }
        return repo.save(user);
    }


    public List<User> getAllUsers() {
        return repo.findAll();
    }

    @Override
    public User findByEmailAndPassword(String email, String password) {

        if(email.isEmpty() || password.isEmpty()) {
            return null;
        }


        User user = repo.findUserByEmail(email); // Giả sử repo có phương thức findByEmail

        if(user != null && password.equals(user.getPassword())) {
            return user;  // Đăng nhập thành công, trả về thông tin người dùng
        } else {
            return null;  // Hoặc bạn có thể ném một ngoại lệ để báo lỗi
        }
    }

    @Override
    public List<User> findByStatus(String status) {
        return List.of();
    }

    @Override
    public List<User> getAll() {
        return List.of();
    }
}
