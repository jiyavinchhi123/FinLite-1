package com.example.sbfm.service;

import java.util.Optional;
import org.springframework.stereotype.Service;
import com.example.sbfm.model.User;
import com.example.sbfm.repository.UserRepository;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        return userRepository.save(user);
    }

    public Optional<User> login(String email, String password) {
        Optional<User> found = userRepository.findByEmail(email);
        if (found.isPresent() && password.equals(found.get().getPassword())) {
            return found;
        }
        return Optional.empty();
    }
}
