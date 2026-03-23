package com.example.sbfm.service;

import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.example.sbfm.model.Supplier;
import com.example.sbfm.repository.SupplierRepository;

@Service
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> list(UUID companyId) {
        if (companyId == null) return supplierRepository.findAll();
        return supplierRepository.findByCompanyId(companyId);
    }

    public Supplier create(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Optional<Supplier> update(UUID id, Supplier incoming) {
        return supplierRepository.findById(id).map(existing -> {
            incoming.setId(existing.getId());
            if (incoming.getCompanyId() == null) {
                incoming.setCompanyId(existing.getCompanyId());
            }
            return supplierRepository.save(incoming);
        });
    }

    public boolean delete(UUID id) {
        if (!supplierRepository.existsById(id)) return false;
        supplierRepository.deleteById(id);
        return true;
    }
}
