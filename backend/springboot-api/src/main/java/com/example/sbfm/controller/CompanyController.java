package com.example.sbfm.controller;

import java.util.Optional;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.example.sbfm.model.Company;
import com.example.sbfm.service.CompanyService;

@RestController
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping({"/company", "/api/companies", "/api/company"})
    public ResponseEntity<Company> create(@RequestBody Company company) {
        return ResponseEntity.ok(companyService.create(company));
    }

    @GetMapping({"/company/by-owner/{ownerId}", "/api/company/by-owner/{ownerId}"})
    public ResponseEntity<?> byOwner(@PathVariable("ownerId") UUID ownerId) {
        Optional<Company> found = companyService.findByOwnerId(ownerId);
        if (found.isPresent()) {
            return ResponseEntity.ok(found.get());
        }
        return ResponseEntity.ok(null);
    }

    @PutMapping({"/company/{id}", "/api/company/{id}", "/api/companies/{id}"})
    public ResponseEntity<?> update(@PathVariable("id") UUID id, @RequestBody Company company) {
        Optional<Company> updated = companyService.update(id, company);
        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }
        return ResponseEntity.notFound().build();
    }
}
