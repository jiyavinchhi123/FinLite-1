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
import com.example.sbfm.model.Supplier;
import com.example.sbfm.service.SupplierService;

@RestController
public class SupplierController {
    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping({"/suppliers", "/api/suppliers"})
    public List<Supplier> list(@RequestParam(value = "companyId", required = false) UUID companyId) {
        return supplierService.list(companyId);
    }

    @PostMapping({"/suppliers", "/api/suppliers"})
    public ResponseEntity<Supplier> create(@RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.create(supplier));
    }

    @PutMapping({"/suppliers/{id}", "/api/suppliers/{id}"})
    public ResponseEntity<Supplier> update(@PathVariable("id") UUID id, @RequestBody Supplier supplier) {
        return supplierService.update(id, supplier)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping({"/suppliers/{id}", "/api/suppliers/{id}"})
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        if (supplierService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
