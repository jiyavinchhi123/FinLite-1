package com.example.sbfm.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.sbfm.model.Company;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findFirstByOwnerId(UUID ownerId);
}
