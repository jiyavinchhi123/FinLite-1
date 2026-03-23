package com.example.sbfm.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.sbfm.model.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    List<Supplier> findByCompanyId(UUID companyId);
}
