package com.example.sbfm.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.sbfm.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findByCompanyId(UUID companyId);
}
