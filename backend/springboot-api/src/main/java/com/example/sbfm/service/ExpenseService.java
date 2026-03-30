package com.example.sbfm.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import com.example.sbfm.model.Expense;
import com.example.sbfm.repository.ExpenseRepository;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense create(Expense expense) {
        return expenseRepository.save(expense);
    }

    public Expense update(UUID id, Expense expense) {
        Expense existing = expenseRepository.findById(id).orElseThrow(EntityNotFoundException::new);
        expense.setId(existing.getId());
        return expenseRepository.save(expense);
    }

    public void delete(UUID id) {
        expenseRepository.deleteById(id);
    }

    public List<Expense> list(UUID companyId) {
        if (companyId == null) return expenseRepository.findAll();
        return expenseRepository.findByCompanyId(companyId);
    }
}
