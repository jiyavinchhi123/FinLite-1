package com.example.sbfm.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.sbfm.model.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByCompanyId(UUID companyId);
}
