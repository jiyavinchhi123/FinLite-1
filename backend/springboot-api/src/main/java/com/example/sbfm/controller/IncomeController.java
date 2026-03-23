package com.example.sbfm.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.sbfm.model.Income;
import com.example.sbfm.service.IncomeService;

@RestController
public class IncomeController {
    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @PostMapping({"/income", "/api/income", "/api/money-in"})
    public ResponseEntity<Income> create(@RequestBody Income income) {
        return ResponseEntity.ok(incomeService.create(income));
    }

    @PutMapping({"/income/{id}", "/api/income/{id}", "/api/money-in/{id}"})
    public ResponseEntity<Income> update(@PathVariable("id") UUID id, @RequestBody Income income) {
        return ResponseEntity.ok(incomeService.update(id, income));
    }

    @DeleteMapping({"/income/{id}", "/api/income/{id}", "/api/money-in/{id}"})
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        incomeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/income", "/api/income"})
    public List<Income> list(@RequestParam(value = "companyId", required = false) UUID companyId) {
        return incomeService.list(companyId);
    }
}
