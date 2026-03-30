package com.example.sbfm.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import com.example.sbfm.model.Income;
import com.example.sbfm.repository.IncomeRepository;

@Service
public class IncomeService {
    private final IncomeRepository incomeRepository;

    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public Income create(Income income) {
        return incomeRepository.save(income);
    }

    public Income update(UUID id, Income income) {
        Income existing = incomeRepository.findById(id).orElseThrow(EntityNotFoundException::new);
        income.setId(existing.getId());
        return incomeRepository.save(income);
    }

    public void delete(UUID id) {
        incomeRepository.deleteById(id);
    }

    public List<Income> list(UUID companyId) {
        if (companyId == null) return incomeRepository.findAll();
        return incomeRepository.findByCompanyId(companyId);
    }
}
