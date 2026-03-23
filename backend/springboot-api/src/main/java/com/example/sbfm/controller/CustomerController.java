package com.example.sbfm.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import com.example.sbfm.model.Customer;
import com.example.sbfm.service.CustomerService;

@RestController
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping({"/customers", "/api/customers"})
    public List<Customer> list(@RequestParam(value = "companyId", required = false) UUID companyId) {
        return customerService.list(companyId);
    }

    @PostMapping({"/customers", "/api/customers"})
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.create(customer));
    }

    @PutMapping({"/customers/{id}", "/api/customers/{id}"})
    public ResponseEntity<Customer> update(@PathVariable("id") UUID id, @RequestBody Customer customer) {
        return customerService.update(id, customer)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping({"/customers/{id}", "/api/customers/{id}"})
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        if (customerService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
