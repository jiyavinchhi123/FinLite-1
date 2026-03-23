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
import com.example.sbfm.model.Expense;
import com.example.sbfm.service.ExpenseService;

@RestController
public class ExpenseController {
    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping({"/expense", "/api/expense", "/api/money-out"})
    public ResponseEntity<Expense> create(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.create(expense));
    }

    @PutMapping({"/expense/{id}", "/api/expense/{id}", "/api/money-out/{id}"})
    public ResponseEntity<Expense> update(@PathVariable("id") UUID id, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.update(id, expense));
    }

    @DeleteMapping({"/expense/{id}", "/api/expense/{id}", "/api/money-out/{id}"})
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        expenseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/expense", "/api/expense"})
    public List<Expense> list(@RequestParam(value = "companyId", required = false) UUID companyId) {
        return expenseService.list(companyId);
    }
}
