package com.example.sbfm.service;

import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.example.sbfm.model.Customer;
import com.example.sbfm.repository.CustomerRepository;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> list(UUID companyId) {
        if (companyId == null) return customerRepository.findAll();
        return customerRepository.findByCompanyId(companyId);
    }

    public Customer create(Customer customer) {
        return customerRepository.save(customer);
    }

    public Optional<Customer> update(UUID id, Customer incoming) {
        return customerRepository.findById(id).map(existing -> {
            incoming.setId(existing.getId());
            if (incoming.getCompanyId() == null) {
                incoming.setCompanyId(existing.getCompanyId());
            }
            return customerRepository.save(incoming);
        });
    }

    public boolean delete(UUID id) {
        if (!customerRepository.existsById(id)) return false;
        customerRepository.deleteById(id);
        return true;
    }
}
