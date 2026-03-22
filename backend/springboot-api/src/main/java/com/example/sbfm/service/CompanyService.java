package com.example.sbfm.service;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.example.sbfm.model.Company;
import com.example.sbfm.repository.CompanyRepository;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company create(Company company) {
        return companyRepository.save(company);
    }

    public Optional<Company> findByOwnerId(UUID ownerId) {
        return companyRepository.findFirstByOwnerId(ownerId);
    }

    public Optional<Company> update(UUID id, Company incoming) {
        return companyRepository.findById(id).map(existing -> {
            incoming.setId(existing.getId());
            if (incoming.getOwnerId() == null) {
                incoming.setOwnerId(existing.getOwnerId());
            }
            return companyRepository.save(incoming);
        });
    }
}
